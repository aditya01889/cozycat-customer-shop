import { createClient } from '@supabase/supabase-js'
import { NextResponse, NextRequest } from 'next/server'
import { getSupabaseConfig } from '@/lib/env-validation'
import { withAdminAuth, AuthContext } from '@/lib/auth/auth-middleware'
import { z } from 'zod'

// Admin profile query schema
const adminProfileQuerySchema = z.object({
  profileIds: z.array(z.string().uuid()).min(1).max(50).optional(),
  role: z.enum(['admin', 'operations', 'partner', 'customer']).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
})

async function handleGetProfiles(request: NextRequest, authContext: AuthContext) {
  try {
    const body = await request.json().catch(() => ({}))
    const { profileIds, role, page, limit } = adminProfileQuerySchema.parse(body)
    
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
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    // Apply filters
    if (profileIds && profileIds.length > 0) {
      query = query.in('id', profileIds)
    }

    if (role) {
      query = query.eq('role', role)
    }

    // Apply pagination
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)

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
  } catch (error) {
    console.error('Error in get-profiles:', error)
    return NextResponse.json(
      { error: 'Invalid request data' },
      { status: 400 }
    )
  }
}

export const POST = withAdminAuth(handleGetProfiles)
