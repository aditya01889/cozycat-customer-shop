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

    console.log('🔍 Admin debugging profile data...')

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
      success: true,
      warning: 'This is a debug endpoint - remove from production',
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
      joinedCount: joinedData?.length || 0,
      summary: {
        totalCustomers: customers?.length || 0,
        totalProfiles: profiles?.length || 0,
        successfulJoins: joinedData?.length || 0,
        hasErrors: !!(customersError || profilesError || joinError)
      }
    })
  }
})
