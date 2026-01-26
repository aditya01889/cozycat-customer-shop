import { NextRequest, NextResponse } from 'next/server'
import { createSecureHandler } from '@/lib/api/secure-handler'
import { addressSchema } from '@/lib/validation/schemas'
import { actionRateLimiters } from '@/lib/middleware/rate-limiter'
import { createClient } from '@/lib/supabase/server'
import { getSupabaseConfig } from '@/lib/env-validation'
import { z } from 'zod'

// Address query schema for GET requests
const addressQuerySchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(10),
})

export const GET = createSecureHandler({
  schema: addressQuerySchema,
  requireCSRF: false, // GET requests don't need CSRF
  preCheck: async (req: NextRequest) => {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { allowed: false, error: 'Authentication required' }
    }
    
    return { allowed: true }
  },
  handler: async (req: NextRequest, queryParams) => {
    const { page, limit } = queryParams
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user?.id) {
      throw new Error('User not found')
    }

    // Create admin client for database operations
    const { url, serviceRoleKey } = getSupabaseConfig()
    const { createClient: createSupabaseClient } = await import('@supabase/supabase-js')
    const adminSupabase = createSupabaseClient(url, serviceRoleKey!)

    const offset = (page - 1) * limit

    // Fetch addresses with pagination
    const { data: addresses, error, count } = await adminSupabase
      .from('customer_addresses')
      .select('*', { count: 'exact' })
      .eq('customer_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching addresses:', error)
      throw new Error('Failed to fetch addresses')
    }

    return NextResponse.json({
      success: true,
      addresses: addresses || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  }
})

export const POST = createSecureHandler({
  schema: addressSchema,
  rateLimiter: actionRateLimiters.contactForm,
  requireCSRF: true,
  preCheck: async (req: NextRequest) => {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { allowed: false, error: 'Authentication required' }
    }
    
    return { allowed: true }
  },
  handler: async (req: NextRequest, addressData) => {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user?.id) {
      throw new Error('User not found')
    }

    // Create admin client for database operations
    const { url, serviceRoleKey } = getSupabaseConfig()
    const { createClient: createSupabaseClient } = await import('@supabase/supabase-js')
    const adminSupabase = createSupabaseClient(url, serviceRoleKey!)

    console.log('Creating validated address for user:', user.id)

    // If setting as default, unset other default addresses
    if (addressData.is_default) {
      await adminSupabase
        .from('customer_addresses')
        .update({ is_default: false } as any)
        .eq('customer_id', user.id)
    }

    // Create new address
    const { data: address, error } = await adminSupabase
      .from('customer_addresses')
      .insert({
        customer_id: user.id,
        ...addressData
      } as any)
      .select()
      .single()

    if (error) {
      console.error('Error creating address:', error)
      throw new Error('Failed to create address')
    }

    console.log('Address created successfully:', address)

    return NextResponse.json({
      success: true,
      address
    })
  }
})
