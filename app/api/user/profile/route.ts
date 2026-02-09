import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { APIErrorHandler, createSuccessResponse } from '@/lib/errors/api-error-handler'
import { ErrorType } from '@/lib/errors/error-handler'
import { createSecureHandler } from '@/lib/api/secure-handler'
import { adminUserSchema } from '@/lib/validation/schemas'
import { actionRateLimiters } from '@/lib/middleware/rate-limiter'
import { getSupabaseConfig } from '@/lib/env-validation'
import { withAuth, AuthContext } from '@/lib/auth/auth-middleware'

// Profile update schema
const profileUpdateSchema = adminUserSchema.pick({
  full_name: true,
  phone: true
})

async function handleProfileUpdate(request: Request, authContext: AuthContext, validatedData: any) {
  const { url, anonKey } = getSupabaseConfig()
  const supabase = await createClient()

  const authHeader = request.headers.get('authorization')
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : null

  const authedSupabase = bearerToken
    ? createSupabaseClient(
        url,
        anonKey,
        {
          global: {
            headers: {
              Authorization: `Bearer ${bearerToken}`,
            },
          },
          auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false,
          },
        }
      )
    : null

  const { data: { user: bearerUser } } = authedSupabase
    ? await authedSupabase.auth.getUser()
    : { data: { user: null } }

  const user = authContext.user ?? bearerUser
  const supabaseForWrite = authContext.session ? supabase : authedSupabase

  if (!user || !supabaseForWrite) {
    throw new Error('Authentication required')
  }

  const { full_name, phone } = validatedData

  let authUpdateWarning: string | null = null
  
  await APIErrorHandler.withDatabaseErrorHandling(async () => {
    const { error: updateError } = await supabaseForWrite.auth.updateUser({
      data: {
        name: full_name,
        phone
      }
    })

    if (updateError) {
      console.error('Auth metadata update error:', updateError)
      authUpdateWarning = updateError.message
    }
  }, 'auth metadata update')

  // Update profile in database
  await APIErrorHandler.withDatabaseErrorHandling(async () => {
    const { error: profileError } = await (supabaseForWrite as any)
      .from('profiles')
      .update({
        full_name,
        phone,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    if (profileError) {
      console.error('Profile database update error:', profileError)
      throw profileError
    }
  }, 'profile database update')

  // Skip customer table update - customers table doesn't exist
  // Only profiles table is used in this application
  console.log('📋 Customer phone update skipped - using profiles table only')

  return createSuccessResponse(
    {
      message: 'Profile updated successfully',
      ...(authUpdateWarning ? { warning: authUpdateWarning } : {}),
    },
    'Profile updated successfully'
  )
}

export const PUT = createSecureHandler({
  schema: profileUpdateSchema,
  rateLimiter: actionRateLimiters.contactForm,
  requireCSRF: true,
  handler: withAuth(handleProfileUpdate)
})
