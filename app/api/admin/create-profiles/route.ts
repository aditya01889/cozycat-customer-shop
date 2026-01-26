import { createClient } from '@supabase/supabase-js'
import { NextResponse, NextRequest } from 'next/server'
import { createSecureHandler } from '@/lib/api/secure-handler'
import { actionRateLimiters } from '@/lib/middleware/rate-limiter'
import { getSupabaseConfig } from '@/lib/env-validation'
import { adminUserSchema } from '@/lib/validation/schemas'
import { z } from 'zod'

// Admin profile creation schema
const adminCreateProfileSchema = z.object({
  profiles: z.array(z.object({
    id: z.string().uuid(),
    full_name: z.string().min(2).max(100),
    email: z.string().email(),
    phone: z.string().optional(),
    role: z.enum(['admin', 'operations', 'partner', 'customer'])
  })).min(1).max(10) // Limit to 10 profiles at once
})

export const POST = createSecureHandler({
  schema: adminCreateProfileSchema,
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
    const { profiles } = data
    
    // Get validated Supabase configuration
    const { url, serviceRoleKey } = getSupabaseConfig()
    
    const supabase = createClient(url, serviceRoleKey!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    console.log('🔧 Admin creating profiles:', profiles.length)

    // Add timestamps to profiles
    const profilesWithTimestamps = profiles.map((profile: any) => ({
      ...profile,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }))

    console.log('📝 Creating profiles with validated data:', profilesWithTimestamps.length)

    const { data: insertedProfiles, error: insertError } = await supabase
      .from('profiles')
      .upsert(profilesWithTimestamps, { onConflict: 'id' })
      .select('id, full_name, email, phone, role, created_at, updated_at')

    if (insertError) {
      console.error('Error creating profiles:', insertError)
      throw new Error('Failed to create profiles')
    }

    console.log('✅ Successfully created profiles:', insertedProfiles?.length || 0)

    return NextResponse.json({
      success: true,
      message: `Created ${insertedProfiles?.length || 0} profiles`,
      profiles: insertedProfiles || [],
      count: insertedProfiles?.length || 0
    })
  }
})
