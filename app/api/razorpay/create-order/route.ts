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
    // Check if user is authenticated for payment processing
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { allowed: false, error: 'Authentication required to create payment orders' }
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
