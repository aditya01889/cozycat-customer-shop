import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: Request) {
  try {
    const { profileIds } = await request.json()
    
    if (!profileIds || !Array.isArray(profileIds)) {
      return NextResponse.json({ error: 'Invalid profile IDs' }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    console.log('🔍 Fetching profiles with service role:', profileIds)

    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, phone, role')
      .in('id', profileIds)

    if (error) {
      console.error('Error fetching profiles:', error)
      return NextResponse.json({ error: 'Failed to fetch profiles', details: error.message }, { status: 500 })
    }

    console.log('✅ Found profiles:', profiles?.length || 0)

    return NextResponse.json({
      profiles: profiles || [],
      count: profiles?.length || 0
    })

  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 })
  }
}
