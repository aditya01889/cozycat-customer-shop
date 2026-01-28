import { NextRequest, NextResponse } from 'next/server'
import { createSecureHandler } from '@/lib/api/secure-handler'
import { z } from 'zod'
import { actionRateLimiters } from '@/lib/middleware/rate-limiter'
import { calculateDeliveryFee, validatePincode, getServiceablePincodes } from '@/lib/shipping/config'

// Schema for shipping calculation request
const shippingCalculationSchema = z.object({
  pincode: z.string().min(6, 'PIN code must be at least 6 digits').max(6, 'PIN code must be exactly 6 digits'),
  orderValue: z.number().min(0, 'Order value must be positive'),
})

// Schema for PIN code validation request
const pincodeValidationSchema = z.object({
  pincode: z.string().min(6, 'PIN code must be at least 6 digits').max(6, 'PIN code must be exactly 6 digits'),
})

/**
 * Calculate shipping cost and delivery information
 */
export const POST = createSecureHandler({
  schema: shippingCalculationSchema,
  rateLimiter: actionRateLimiters.contactForm,
  requireCSRF: false, // Allow without CSRF for checkout convenience
  handler: async (req: NextRequest, data) => {
    const { pincode, orderValue } = data

    console.log('=== CALCULATING SHIPPING ===')
    console.log('PIN Code:', pincode)
    console.log('Order Value:', orderValue)
    console.log('==========================')

    // Validate PIN code format
    if (!validatePincode(pincode)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid PIN code format. Please enter a valid 6-digit PIN code.',
        isServiceable: false,
      }, { status: 400 })
    }

    // Calculate shipping
    const shippingResult = calculateDeliveryFee(pincode, orderValue)

    console.log('Shipping Result:', shippingResult)

    return NextResponse.json({
      success: true,
      data: shippingResult,
    })
  },
})

/**
 * Validate PIN code (GET request for quick validation)
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const pincode = searchParams.get('pincode')

  if (!pincode) {
    return NextResponse.json({
      success: false,
      error: 'PIN code is required',
      isServiceable: false,
    }, { status: 400 })
  }

  console.log('=== VALIDATING PIN CODE ===')
  console.log('PIN Code:', pincode)
  console.log('==========================')

  // Validate PIN code format
  if (!validatePincode(pincode)) {
    return NextResponse.json({
      success: false,
      error: 'Invalid PIN code format. Please enter a valid 6-digit PIN code.',
      isServiceable: false,
    }, { status: 400 })
  }

  // Check if serviceable (with zero order value)
  const shippingResult = calculateDeliveryFee(pincode, 0)

  return NextResponse.json({
    success: true,
    data: {
      isServiceable: shippingResult.isServiceable,
      zone: shippingResult.zone,
      minOrderAmount: shippingResult.minOrderAmount,
      estimatedDelivery: shippingResult.estimatedDelivery,
      message: shippingResult.isServiceable 
        ? `Serviceable! ${shippingResult.message}`
        : shippingResult.message,
    },
  })
}

/**
 * Get all serviceable PIN codes (for reference)
 */
export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const zoneId = searchParams.get('zone')

    const serviceablePincodes = getServiceablePincodes(zoneId || undefined)

    return NextResponse.json({
      success: true,
      data: {
        zoneId,
        count: serviceablePincodes.length,
        pincodes: serviceablePincodes.slice(0, 100), // Return first 100 for preview
        totalCount: serviceablePincodes.length,
      },
    })
  } catch (error: any) {
    console.error('Error fetching serviceable PIN codes:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch serviceable PIN codes',
    }, { status: 500 })
  }
}
