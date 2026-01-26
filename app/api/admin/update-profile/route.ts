import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { createSecureHandler } from '@/lib/api/secure-handler'
import { actionRateLimiters } from '@/lib/middleware/rate-limiter'
import { getSupabaseConfig } from '@/lib/env-validation'
import { z } from 'zod'

// Admin profile update schema
const adminUpdateProfileSchema = z.object({
  profileId: z.string().uuid('Invalid profile ID'),
  full_name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  role: z.enum(['admin', 'operations', 'partner', 'customer']).optional()
})

export const POST = createSecureHandler({
  schema: adminUpdateProfileSchema,
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
    const { profileId, full_name, email, phone, role } = data
    
    // Get validated Supabase configuration
    const { url, serviceRoleKey } = getSupabaseConfig()
    
    const supabaseAdmin = createClient(url, serviceRoleKey!)

    console.log('API: Admin updating profile', { profileId, full_name, email, phone, role })

    // Build update object with only provided fields
    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (full_name !== undefined) updateData.full_name = full_name
    if (email !== undefined) updateData.email = email
    if (phone !== undefined) updateData.phone = phone
    if (role !== undefined) updateData.role = role

    const { error, data: updatedProfile } = await supabaseAdmin
      .from('profiles')
      .update(updateData)
      .eq('id', profileId)
      .select('id, full_name, email, phone, role, updated_at')
      .single()

    if (error) {
      console.error('API: Profile update error', error)
      throw new Error('Failed to update profile')
    }

    console.log('API: Profile updated successfully', updatedProfile)
    return NextResponse.json({ 
      success: true,
      data: updatedProfile, 
      message: 'Profile updated successfully' 
    })
  }
})
