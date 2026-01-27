import { createClient } from '@supabase/supabase-js'
import { NextResponse, NextRequest } from 'next/server'
import { createSecureHandler } from '@/lib/api/secure-handler'
import { actionRateLimiters } from '@/lib/middleware/rate-limiter'
import { getSupabaseConfig } from '@/lib/env-validation'
import { requireDevelopmentMode, addProductionWarning } from '@/lib/utils/production-check'

export const GET = createSecureHandler({
  rateLimiter: actionRateLimiters.contactForm,
  requireCSRF: false, // GET requests don't need CSRF
  preCheck: async (req: NextRequest) => {
    // Block debug endpoints in production
    requireDevelopmentMode('admin')
    
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

    console.log('🔍 Admin testing different join approaches...')

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
      success: true,
      warning: 'This is a debug endpoint - not available in production',
      tests: {
        test1: {
          count: test1?.length || 0,
          error: error1?.message || null,
          sample: test1?.slice(0, 2) || []
        },
        test2: {
          count: test2?.length || 0,
          error: error2?.message || null,
          sample: test2?.slice(0, 2) || []
        },
        manualJoin: {
          count: manualJoin?.length || 0,
          error: null,
          sample: manualJoin?.slice(0, 2) || []
        }
      },
      summary: {
        totalTests: 3,
        successfulTests: [test1, test2, manualJoin].filter(t => t && t.length > 0).length,
        hasErrors: !!(error1 || error2 || customersError || profilesError)
      },
      debugInfo: {
        customersCount: customers?.length || 0,
        profilesCount: profiles?.length || 0
      }
    })
  }
})
