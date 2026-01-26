import { createClient } from '@supabase/supabase-js'
import { NextResponse, NextRequest } from 'next/server'
import { createSecureHandler } from '@/lib/api/secure-handler'
import { actionRateLimiters } from '@/lib/middleware/rate-limiter'
import { getSupabaseConfig } from '@/lib/env-validation'

export const GET = createSecureHandler({
  rateLimiter: actionRateLimiters.contactForm,
  requireCSRF: false, // GET requests don't need CSRF
  preCheck: async (req: NextRequest) => {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { allowed: false, error: 'Authentication required' }
    }
    
    // Check if user has admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (!profile || (profile as any).role !== 'admin') {
      return { allowed: false, error: 'Admin access required' }
    }
    
    return { allowed: true }
  },
  handler: async (req: NextRequest) => {
    // Get validated Supabase configuration
    const { url, serviceRoleKey } = getSupabaseConfig()
    
    const supabase = createClient(url, serviceRoleKey!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    console.log('🔍 Admin testing profile queries...')

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
      .select('*')
      .in('id', profileIds)

    console.log('IN query profiles:', inQueryProfiles?.length || 0)
    console.log('IN query error:', inQueryError)

    // Test 3: Test individual profile fetch
    const { data: singleProfile, error: singleError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', profileIds[0])
      .single()

    console.log('Single profile:', singleProfile ? 'Found' : 'Not found')
    console.log('Single profile error:', singleError)

    return NextResponse.json({
      success: true,
      warning: 'This is a debug endpoint - remove from production',
      tests: {
        allProfiles: {
          count: allProfiles?.length || 0,
          error: allProfilesError?.message || null
        },
        inQuery: {
          count: inQueryProfiles?.length || 0,
          error: inQueryError?.message || null
        },
        single: {
          found: !!singleProfile,
          error: singleError?.message || null
        }
      },
      summary: {
        totalTests: 3,
        passedTests: [!!allProfiles, !!inQueryProfiles, !!singleProfile].filter(Boolean).length,
        hasErrors: !!(allProfilesError || inQueryError || singleError)
      }
    })
  }
})
