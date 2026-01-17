import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No user found' }, { status: 401 })
    }

    // Get user profile with role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    console.log('Debug auth info:', {
      userId: user.id,
      userEmail: user.email,
      userRole: (profile as any)?.role,
      profileError: profileError?.message
    })

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        role: (profile as any)?.role || 'unknown'
      },
      profile: profile,
      profileError: profileError ? (profileError as any).message : null
    })
  } catch (error) {
    console.error('Debug auth error:', error)
    return NextResponse.json({ error: (error as any).message }, { status: 500 })
  }
}
