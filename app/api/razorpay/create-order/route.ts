import { NextRequest, NextResponse } from 'next/server'
import { RazorpayServer, CreateOrderRequest } from '@/lib/razorpay/server'
import { createSecureHandler } from '@/lib/api/secure-handler'
import { actionRateLimiters } from '@/lib/middleware/rate-limiter'
import { getPaymentConfig } from '@/lib/env-validation'
import { z } from 'zod'

// Razorpay order creation schema for validation
const razorpayOrderSchema = z.object({
  amount: z.number().min(100, 'Minimum amount is ₹1').max(500000, 'Maximum amount is ₹5000'),
  currency: z.string().default('INR'),
  receipt: z.string().optional(),
  notes: z.record(z.string()).optional(),
  payment_capture: z.boolean().default(true),
  offers: z.array(z.string()).optional(),
})

export const POST = createSecureHandler({
  schema: razorpayOrderSchema,
  rateLimiter: actionRateLimiters.payment,
  requireCSRF: true,
  preCheck: async (req: NextRequest) => {
    console.log('🔍 Razorpay Pre-check - Starting validation...')
    
    // Extract JWT token from Authorization header (optional for guest orders)
    const authHeader = req.headers.get('authorization')
    console.log('🔍 Razorpay Pre-check - Auth header present:', !!authHeader)
    
    // Allow guest orders without authentication
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('✅ Razorpay Pre-check - Allowing guest order without authentication')
      return { allowed: true }
    }
    
    const token = authHeader.substring(7) // Remove 'Bearer ' prefix
    console.log('🔍 Razorpay Pre-check - Token extracted:', token.substring(0, 20) + '...')
    
    // Create Supabase client with the token
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    
    // Set the token manually for this request
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    console.log('🔍 Razorpay Pre-check - User:', user ? 'Authenticated' : 'Not authenticated')
    console.log('🔍 Razorpay Pre-check - Auth error:', error)
    
    // Allow both authenticated and guest orders
    if (user && !error) {
      console.log('✅ Razorpay Pre-check - Authentication passed for user:', user.id)
    } else {
      console.log('✅ Razorpay Pre-check - Proceeding as guest order')
    }
    
    return { allowed: true }
  },
  handler: async (req: NextRequest, data) => {
    console.log('Creating Razorpay order with validated data...')
    
    // Get validated payment configuration
    const paymentConfig = getPaymentConfig()
    
    if (!paymentConfig.razorpayKeyId || !paymentConfig.razorpayKeySecret) {
      console.error('Razorpay not configured in payment config')
      throw new Error('Payment service not configured')
    }

    console.log('Razorpay configuration found, proceeding...')
    console.log('Order request data:', data)

    console.log('Initializing Razorpay server...')
    const razorpayServer = RazorpayServer.getInstance()
    console.log('Creating order...')
    
    const order = await razorpayServer.createOrder(data as CreateOrderRequest)
    console.log('Order created successfully:', order)

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
        notes: order.notes,
      },
    })
  }
})
