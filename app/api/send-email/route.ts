import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server-helper'
import { createSecureHandler } from '@/lib/api/secure-handler'
import { contactFormSchema } from '@/lib/validation/schemas'
import { actionRateLimiters } from '@/lib/middleware/rate-limiter'
import { sendCustomEmail } from '@/lib/email/service'

// Email sending schema for validation
const emailSchema = contactFormSchema.pick({
  name: true,
  email: true,
  subject: true,
  message: true
}).extend({
  to: contactFormSchema.shape.email,
  customerName: contactFormSchema.shape.name.optional()
})

export const POST = createSecureHandler({
  schema: emailSchema,
  rateLimiter: actionRateLimiters.contactForm,
  requireCSRF: true,
  preCheck: async (req: NextRequest) => {
    // Check if user is authenticated for sending emails
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { allowed: false, error: 'Authentication required to send emails' }
    }
    
    // Check if user has admin or partner role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (!profile || !['admin', 'partner'].includes((profile as any).role)) {
      return { allowed: false, error: 'Admin or partner access required to send emails' }
    }
    
    return { allowed: true }
  },
  handler: async (req: NextRequest, data) => {
    const { to, subject, message, name, customerName } = data

    // Initialize Supabase client
    const supabase = createServerSupabaseClient();

    console.log('=== SENDING EMAIL VIA CENTRALIZED SERVICE ===')
    console.log('To:', to)
    console.log('Subject:', subject)
    console.log('Customer:', customerName || name)
    console.log('==========================================')

    // Send email using centralized service
    const emailResult = await sendCustomEmail(to, subject, message, customerName || name)

    if (!emailResult.success) {
      throw new Error(emailResult.error || 'Email sending failed')
    }

    console.log('✅ Email sent successfully via centralized service!')
    console.log('Message ID:', emailResult.messageId)

    // Log email in database for tracking
    const { error: dbError } = await supabase
      .from('email_logs')
      .insert({
        to_email: to,
        subject,
        body: message,
        customer_name: customerName || name,
        status: 'sent',
        sent_at: new Date().toISOString(),
        email_provider: 'gmail',
        message_id: emailResult.messageId
      })

    if (dbError) {
      console.error('Error logging email:', dbError)
      // Don't fail the request if logging fails
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Email sent successfully via Gmail',
      details: { 
        to, 
        subject, 
        body: message,
        provider: 'Gmail',
        messageId: emailResult.messageId,
        delivered: true
      }
    })
  }
})
