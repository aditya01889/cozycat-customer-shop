import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { Database } from '@/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']

export async function operationsMiddleware(request: NextRequest) {
  const supabase = await createClient()
  
  // Get the user from the session
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    // Redirect to login if not authenticated
    return NextResponse.redirect(new URL('/auth', request.url))
  }
  
  // Get user profile to check role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single() as { data: Profile | null }
  
  if (!profile || !['admin', 'operations'].includes(profile.role)) {
    // Redirect to home if not authorized
    return NextResponse.redirect(new URL('/', request.url))
  }
  
  return NextResponse.next()
}

export async function getOperationsUser() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single() as { data: Profile | null }
  
  return profile
}
