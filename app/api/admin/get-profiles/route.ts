import { createClient } from '@supabase/supabase-js'
import { NextResponse, NextRequest } from 'next/server'
import { createSecureHandler } from '@/lib/api/secure-handler'
import { actionRateLimiters } from '@/lib/middleware/rate-limiter'
import { getSupabaseConfig } from '@/lib/env-validation'
import { z } from 'zod'

// Admin profile query schema
const adminProfileQuerySchema = z.object({
  profileIds: z.array(z.string().uuid()).min(1).max(50).optional(),
  role: z.enum(['admin', 'operations', 'partner', 'customer']).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
})

export const POST = createSecureHandler({
  schema: adminProfileQuerySchema,
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
  handler: async (req: NextRequest, data) => {
    const { profileIds, role, page, limit } = data
    
    // Get validated Supabase configuration
    const { url, serviceRoleKey } = getSupabaseConfig()
    
    const supabase = createClient(url, serviceRoleKey!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    console.log('🔍 Admin fetching profiles with filters:', { profileIds, role, page, limit })

    let query = supabase
      .from('profiles')
      .select('id, full_name, email, phone, role, created_at, updated_at', { count: 'exact' })

    // Apply filters
    if (profileIds && profileIds.length > 0) {
      query = query.in('id', profileIds)
    }

    if (role) {
      query = query.eq('role', role)
    }

    // Apply pagination
    const offset = (page - 1) * limit
    query = query
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false })

    const { data: profiles, error, count } = await query

    if (error) {
      console.error('Error fetching profiles:', error)
      throw new Error('Failed to fetch profiles')
    }

    console.log('✅ Admin found profiles:', profiles?.length || 0)

    return NextResponse.json({
      success: true,
      profiles: profiles || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      },
      filters: {
        profileIds: profileIds || null,
        role: role || null
      }
    })
  }
})
