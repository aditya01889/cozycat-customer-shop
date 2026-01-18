import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST() {
  try {
    // Initialize Supabase client with service role key (bypasses RLS)
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    console.log('🔧 Fixing missing profiles for existing customers...')

    // Get all customers
    const { data: customers, error: customersError } = await supabase
      .from('customers')
      .select('id, profile_id, phone, created_at')

    // Get all existing profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id')

    if (customersError || profilesError) {
      console.error('Error fetching data:', { customersError, profilesError })
      return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
    }

    // Find customers without profiles
    const profileIds = profiles?.map(p => p.id) || []
    const customersWithoutProfiles = customers?.filter(
      customer => !profileIds.includes(customer.profile_id)
    ) || []

    console.log('📊 Found customers without profiles:', customersWithoutProfiles.length)

    if (customersWithoutProfiles.length === 0) {
      return NextResponse.json({ message: 'All customers have profiles' })
    }

    // Create missing profiles
    const profileInserts = customersWithoutProfiles.map((customer) => ({
      id: customer.profile_id,
      full_name: `Customer ${customer.id.slice(0, 8)}`,
      email: `customer-${customer.id.slice(0, 8)}@cozycatkitchen.com`,
      phone: customer.phone || null,
      role: 'customer',
      created_at: customer.created_at,
      updated_at: new Date().toISOString()
    }))

    console.log('📝 Creating profiles:', profileInserts.length)

    const { data: insertedProfiles, error: insertError } = await supabase
      .from('profiles')
      .upsert(profileInserts, { onConflict: 'id' })
      .select('id, full_name, email, phone')

    if (insertError) {
      console.error('Error creating profiles:', insertError)
      return NextResponse.json({ error: 'Failed to create profiles', details: insertError }, { status: 500 })
    }

    console.log('✅ Successfully created profiles:', insertedProfiles?.length || 0)

    return NextResponse.json({
      success: true,
      message: `Created ${insertedProfiles?.length || 0} missing profiles`,
      profiles: insertedProfiles
    })

  } catch (error: any) {
    console.error('Error fixing missing profiles:', error)
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 })
  }
}
