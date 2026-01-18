import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    console.log('🔧 Creating missing profiles for specific customers...')

    // Create profiles for the specific customers that are missing
    const missingProfiles = [
      {
        id: '3cbc1133-e8e1-4e8c-9ba6-38ba14434727',
        full_name: 'Customer Service',
        email: 'customerservice@cozycatkitchen.com',
        phone: null,
        role: 'customer',
        created_at: '2026-01-17T21:46:59.992545+00:00',
        updated_at: new Date().toISOString()
      },
      {
        id: '6fec6f12-473a-4218-9ed5-783233bc4252',
        full_name: 'Priyanka Yadav',
        email: 'cozycatkitchen@gmail.com',
        phone: '8800243400',
        role: 'customer',
        created_at: '2026-01-17T07:17:14.335092+00:00',
        updated_at: new Date().toISOString()
      }
    ]

    console.log('📝 Creating profiles:', missingProfiles.length)

    const { data: insertedProfiles, error: insertError } = await supabase
      .from('profiles')
      .upsert(missingProfiles, { onConflict: 'id' })
      .select('id, full_name, email, phone, role')

    if (insertError) {
      console.error('Error creating profiles:', insertError)
      return NextResponse.json({ error: 'Failed to create profiles', details: insertError }, { status: 500 })
    }

    console.log('✅ Successfully created profiles:', insertedProfiles?.length || 0)

    return NextResponse.json({
      success: true,
      message: `Created ${insertedProfiles?.length || 0} profiles`,
      profiles: insertedProfiles
    })

  } catch (error: any) {
    console.error('Error creating profiles:', error)
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 })
  }
}
