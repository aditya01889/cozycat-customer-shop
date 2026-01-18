import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    console.log('🔍 Debugging profile data...')

    // Get all customers
    const { data: customers, error: customersError } = await supabase
      .from('customers')
      .select('id, profile_id, phone, created_at')

    // Get all profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, email, phone, role')

    // Test the join query
    const { data: joinedData, error: joinError } = await supabase
      .from('customers')
      .select(`
        id,
        profile_id,
        phone,
        profiles:profile_id (
          id,
          full_name,
          email,
          phone
        )
      `)

    return NextResponse.json({
      customers: customers || [],
      profiles: profiles || [],
      joinedData: joinedData || [],
      errors: {
        customersError,
        profilesError,
        joinError
      },
      customerCount: customers?.length || 0,
      profileCount: profiles?.length || 0,
      joinedCount: joinedData?.length || 0
    })

  } catch (error: any) {
    console.error('Debug error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
