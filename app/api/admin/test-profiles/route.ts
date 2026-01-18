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

    console.log('🔍 Testing profile queries...')

    // Test 1: Get all profiles
    const { data: allProfiles, error: allProfilesError } = await supabase
      .from('profiles')
      .select('*')

    console.log('All profiles:', allProfiles?.length || 0)
    console.log('All profiles error:', allProfilesError)

    // Test 2: Try the exact same query as admin users page
    const profileIds = ['3cbc1133-e8e1-4e8c-9ba6-38ba14434727', '6fec6f12-473a-4218-9ed5-783233bc4252', '1bdc0d75-de5a-462e-8050-78169ac09139']
    
    const { data: inQueryProfiles, error: inQueryError } = await supabase
      .from('profiles')
      .select('id, full_name, email, phone, role')
      .in('id', profileIds)

    console.log('IN query profiles:', inQueryProfiles?.length || 0)
    console.log('IN query error:', inQueryError)

    // Test 3: Try individual queries
    const individualResults = []
    for (const profileId of profileIds) {
      const { data: profile, error: error } = await supabase
        .from('profiles')
        .select('id, full_name, email, phone, role')
        .eq('id', profileId)
        .single()
      
      individualResults.push({
        profileId,
        profile,
        error
      })
    }

    return NextResponse.json({
      allProfiles: allProfiles || [],
      allProfilesCount: allProfiles?.length || 0,
      inQueryProfiles: inQueryProfiles || [],
      inQueryCount: inQueryProfiles?.length || 0,
      individualResults: individualResults,
      profileIds: profileIds
    })

  } catch (error: any) {
    console.error('Test error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
