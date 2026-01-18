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

    console.log('🔍 Checking all profiles in database...')

    // Get all profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError)
      return NextResponse.json({ error: 'Failed to fetch profiles', details: profilesError }, { status: 500 })
    }

    console.log('All profiles in database:', profiles?.length || 0)

    // Get all customers
    const { data: customers, error: customersError } = await supabase
      .from('customers')
      .select('id, profile_id, phone, created_at')

    if (customersError) {
      console.error('Error fetching customers:', customersError)
      return NextResponse.json({ error: 'Failed to fetch customers', details: customersError }, { status: 500 })
    }

    console.log('All customers in database:', customers?.length || 0)

    // Check which customers have profiles
    const profileIds = profiles?.map(p => p.id) || []
    const customersWithProfiles = customers?.filter(customer => profileIds.includes(customer.profile_id))
    const customersWithoutProfiles = customers?.filter(customer => !profileIds.includes(customer.profile_id))

    console.log('Customers with profiles:', customersWithProfiles?.length || 0)
    console.log('Customers without profiles:', customersWithoutProfiles?.length || 0)

    return NextResponse.json({
      profiles: profiles || [],
      customers: customers || [],
      customersWithProfiles: customersWithProfiles || [],
      customersWithoutProfiles: customersWithoutProfiles || [],
      profileIds: profileIds,
      customerProfileIds: customers?.map(c => c.profile_id) || []
    })

  } catch (error: any) {
    console.error('Debug error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
