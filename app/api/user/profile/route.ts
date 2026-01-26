import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { APIErrorHandler, createSuccessResponse } from '@/lib/errors/api-error-handler'
import { ErrorType } from '@/lib/errors/error-handler'
import { createSecureHandler } from '@/lib/api/secure-handler'
import { adminUserSchema } from '@/lib/validation/schemas'
import { actionRateLimiters } from '@/lib/middleware/rate-limiter'
import { getSupabaseConfig } from '@/lib/env-validation'

// Profile update schema
const profileUpdateSchema = adminUserSchema.pick({
  full_name: true,
  phone: true
})

export const PUT = createSecureHandler({
  schema: profileUpdateSchema,
  rateLimiter: actionRateLimiters.contactForm,
  requireCSRF: true,
  handler: async (request: Request, validatedData) => {
    const { url, anonKey } = getSupabaseConfig()
    const supabase = await createClient()
    const { data: { user: cookieUser } } = await supabase.auth.getUser()

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

    const user = cookieUser ?? bearerUser
    const supabaseForWrite = cookieUser ? supabase : authedSupabase

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

    // Also update the customer table phone to maintain consistency
    await APIErrorHandler.withDatabaseErrorHandling(async () => {
      const { error: customerError } = await (supabaseForWrite as any)
        .from('customers')
        .update({
          phone: phone || '' // Use empty string if phone is null/undefined
        })
        .eq('id', user.id)

      if (customerError) {
        console.error('Customer database update error:', customerError)
        // Don't fail the request, but log the error for debugging
        console.warn('Profile updated but customer phone update failed:', customerError)
        throw customerError
      } else {
        console.log('✅ Customer phone updated successfully')
      }
    }, 'customer phone update')

    return createSuccessResponse(
      {
        message: 'Profile updated successfully',
        ...(authUpdateWarning ? { warning: authUpdateWarning } : {}),
      },
      'Profile updated successfully'
    )
  }
})
