import { createClient } from '@supabase/supabase-js'
import { NextResponse, NextRequest } from 'next/server'
import { createSecureHandler } from '@/lib/api/secure-handler'
import { actionRateLimiters } from '@/lib/middleware/rate-limiter'
import { getSupabaseConfig } from '@/lib/env-validation'

export const POST = createSecureHandler({
  rateLimiter: actionRateLimiters.contactForm,
  requireCSRF: true,
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
    
    // Initialize Supabase client with service role key (bypasses RLS)
    const supabase = createClient(url, serviceRoleKey!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    console.log('🔧 Admin fixing missing profiles for existing customers...')

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
      throw new Error('Failed to fetch data for profile fixing')
    }

    const existingProfileIds = new Set(profiles?.map(p => p.id) || [])
    const customersWithoutProfiles = customers?.filter(customer => !existingProfileIds.has(customer.profile_id)) || []

    console.log(`Found ${customersWithoutProfiles.length} customers without profiles`)

    if (customersWithoutProfiles.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'All customers already have profiles',
        fixedCount: 0
      })
    }

    // Create missing profiles
    const profilesToCreate = customersWithoutProfiles.map(customer => ({
      id: customer.profile_id,
      full_name: `Customer ${customer.id.slice(0, 8)}`,
      email: `customer-${customer.id.slice(0, 8)}@cozycatkitchen.com`,
      phone: customer.phone || null,
      role: 'customer',
      created_at: customer.created_at,
      updated_at: new Date().toISOString()
    }))

    const { data: createdProfiles, error: createError } = await supabase
      .from('profiles')
      .upsert(profilesToCreate, { onConflict: 'id' })
      .select('id, full_name, email, role')

    if (createError) {
      console.error('Error creating profiles:', createError)
      throw new Error('Failed to create missing profiles')
    }

    console.log(`Successfully created ${createdProfiles?.length || 0} profiles`)

    return NextResponse.json({
      success: true,
      warning: 'This is a maintenance endpoint - remove from production',
      message: `Created ${createdProfiles?.length || 0} missing profiles`,
      fixedCount: createdProfiles?.length || 0,
      profiles: createdProfiles || []
    })
  }
})
