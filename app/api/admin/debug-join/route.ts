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

    console.log('🔍 Testing different join approaches...')

    // Test 1: Try different join syntax
    const { data: test1, error: error1 } = await supabase
      .from('customers')
      .select(`
        id,
        profile_id,
        phone,
        profiles!inner (
          id,
          full_name,
          email,
          phone
        )
      `)

    // Test 2: Try with explicit relationship
    const { data: test2, error: error2 } = await supabase
      .from('customers')
      .select(`
        id,
        profile_id,
        phone,
        profiles (
          id,
          full_name,
          email,
          phone
        )
      `)

    // Test 3: Manual join approach
    const { data: customers, error: customersError } = await supabase
      .from('customers')
      .select('id, profile_id, phone')

    const customerIds = customers?.map(c => c.profile_id) || []
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, email, phone')
      .in('id', customerIds)

    const manualJoin = customers?.map(customer => ({
      ...customer,
      profiles: profiles?.find(p => p.id === customer.profile_id)
    }))

    return NextResponse.json({
      test1: { data: test1, error: error1 },
      test2: { data: test2, error: error2 },
      manualJoin: { data: manualJoin, error: null },
      customersCount: customers?.length || 0,
      profilesCount: profiles?.length || 0
    })

  } catch (error: any) {
    console.error('Debug error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
