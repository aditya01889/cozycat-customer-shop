import { NextRequest, NextResponse } from 'next/server'
import { createSecureHandler } from '@/lib/api/secure-handler'
import { z } from 'zod'
import { actionRateLimiters } from '@/lib/middleware/rate-limiter'
import { sendVerificationEmail } from '@/lib/email/service'
import { createClient } from '@supabase/supabase-js'
import { getSupabaseConfig } from '@/lib/env-validation'

// Get validated Supabase configuration
const { url: supabaseUrl, serviceRoleKey: supabaseServiceKey } = getSupabaseConfig()

// Schema for resend verification request
const resendVerificationSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export const POST = createSecureHandler({
  schema: resendVerificationSchema,
  rateLimiter: actionRateLimiters.passwordReset,
  requireCSRF: false, // Allow without CSRF for user convenience
  handler: async (req: NextRequest, data) => {
    const { email } = data

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey || '')

    console.log('=== RESENDING VERIFICATION EMAIL ===')
    console.log('Email:', email)
    console.log('===================================')

    try {
      // Check if user exists by searching for users with this email
      const { data: users, error: userError } = await supabase.auth.admin.listUsers()

      if (userError) {
        console.error('Error checking user:', userError)
        throw new Error('Failed to check user account')
      }

      const user = users.users.find(u => u.email === email)

      if (!user) {
        // Don't reveal if user exists or not for security
        return NextResponse.json({
          success: true,
          message: 'If an account exists with this email, a verification link has been sent.',
        })
      }

      // Check if user is already verified
      if (user.email_confirmed_at) {
        return NextResponse.json({
          success: true,
          message: 'This email is already verified. You can log in to your account.',
        })
      }

      // Generate new verification token
      const { data: tokenData, error: tokenError } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: email,
        options: {
          redirectTo: `${process.env.SITE_URL || 'http://localhost:3000'}/auth/callback`,
        },
      })

      if (tokenError) {
        console.error('Error generating verification token:', tokenError)
        throw new Error('Failed to generate verification link')
      }

      // Send verification email using our service
      const emailResult = await sendVerificationEmail(
        email,
        user.user_metadata?.full_name || user.user_metadata?.name || 'Cat Parent',
        tokenData.properties?.action_link
      )

      if (!emailResult.success) {
        console.error('Failed to send verification email:', emailResult.error)
        throw new Error('Failed to send verification email')
      }

      console.log('✅ Verification email sent successfully!')
      console.log('Message ID:', emailResult.messageId)

      return NextResponse.json({
        success: true,
        message: 'Verification email sent successfully. Please check your inbox.',
        details: {
          email: email,
          messageId: emailResult.messageId,
        },
      })

    } catch (error: any) {
      console.error('Resend verification failed:', error)
      throw new Error(error.message || 'Failed to resend verification email')
    }
  },
})
