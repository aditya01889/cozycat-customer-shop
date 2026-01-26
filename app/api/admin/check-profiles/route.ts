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

    console.log('🔍 Admin checking all profiles in database...')

    // Get all profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError)
      throw new Error('Failed to fetch profiles')
    }

    console.log('All profiles in database:', profiles?.length || 0)

    // Get all customers
    const { data: customers, error: customersError } = await supabase
      .from('customers')
      .select('id, profile_id, phone, created_at')

    if (customersError) {
      console.error('Error fetching customers:', customersError)
      throw new Error('Failed to fetch customers')
    }

    console.log('All customers in database:', customers?.length || 0)

    // Check which customers have profiles
    const profileIds = profiles?.map(p => p.id) || []
    const customersWithProfiles = customers?.filter(customer => profileIds.includes(customer.profile_id))
    const customersWithoutProfiles = customers?.filter(customer => !profileIds.includes(customer.profile_id))

    console.log('Customers with profiles:', customersWithProfiles?.length || 0)
    console.log('Customers without profiles:', customersWithoutProfiles?.length || 0)

    return NextResponse.json({
      success: true,
      warning: 'This is a debug endpoint - remove from production',
      profiles: profiles || [],
      customers: customers || [],
      customersWithProfiles: customersWithProfiles || [],
      customersWithoutProfiles: customersWithoutProfiles || [],
      profileIds: profileIds,
      customerProfileIds: customers?.map(c => c.profile_id) || [],
      summary: {
        totalProfiles: profiles?.length || 0,
        totalCustomers: customers?.length || 0,
        customersWithProfiles: customersWithProfiles?.length || 0,
        customersWithoutProfiles: customersWithoutProfiles?.length || 0
      }
    })
  }
})
