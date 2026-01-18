import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Mock payment methods storage (in production, use a secure payment processor)
const userPaymentMethods = new Map<string, any[]>()

export async function GET(request: NextRequest) {
  try {
    // Get Authorization header
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('No Authorization header found')
      return NextResponse.json(
        { error: 'Unauthorized - No token provided' },
        { status: 401 }
      )
    }

    const token = authHeader.split(' ')[1]
    
    // Create Supabase client with token
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      }
    )
    
    // Verify the token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    console.log('Payment Methods API - User:', { user: !!user, userId: user?.id, authError })
    
    if (authError || !user?.id) {
      console.error('Invalid token or user not found:', authError)
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      )
    }

    // Return user's payment methods
    const methods = userPaymentMethods.get(user.id) || []
    
    return NextResponse.json({
      success: true,
      paymentMethods: methods
    })
  } catch (error) {
    console.error('Payment methods GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== PAYMENT METHODS POST ROUTE STARTED ===')
    
    // Get Authorization header
    const authHeader = request.headers.get('Authorization')
    console.log('Auth header:', authHeader ? 'Present' : 'Missing')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('No Authorization header found')
      return NextResponse.json(
        { error: 'Unauthorized - No token provided' },
        { status: 401 }
      )
    }

    const token = authHeader.split(' ')[1]
    console.log('Token extracted:', token.substring(0, 20) + '...')
    
    // Create Supabase client with token
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      }
    )
    
    console.log('Supabase client created')
    
    // Verify the token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    console.log('User verification result:', { 
      userId: user?.id, 
      authError: authError?.message,
      userEmail: user?.email 
    })
    
    if (authError || !user?.id) {
      console.error('Invalid token or user not found in POST:', authError)
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      )
    }

    const body = await request.json()
    console.log('Received payment method data:', body)
    const {
      type,
      provider,
      last_four,
      brand,
      expiry_month,
      expiry_year,
      upi_id,
      wallet_name,
      is_default
    } = body

    // Validate required fields based on type
    if (!type || !provider) {
      console.error('Missing required fields:', { type, provider })
      return NextResponse.json(
        { error: 'Missing required fields: type and provider are required' },
        { status: 400 }
      )
    }

    if (type === 'card' && (!last_four || !brand || !expiry_month || !expiry_year)) {
      return NextResponse.json(
        { error: 'Missing card details' },
        { status: 400 }
      )
    }

    if (type === 'upi' && !upi_id) {
      return NextResponse.json(
        { error: 'Missing UPI ID' },
        { status: 400 }
      )
    }

    if (type === 'wallet' && !wallet_name) {
      return NextResponse.json(
        { error: 'Missing wallet name' },
        { status: 400 }
      )
    }

    // Get existing methods
    const existingMethods = userPaymentMethods.get(user.id) || []
    
    // If setting as default, unset other default methods
    if (is_default) {
      existingMethods.forEach(method => {
        method.is_default = false
      })
    }

    // Create new payment method
    const newMethod = {
      id: Date.now().toString(),
      type,
      provider,
      last_four: last_four || null,
      brand: brand || null,
      expiry_month: expiry_month || null,
      expiry_year: expiry_year || null,
      upi_id: upi_id || null,
      wallet_name: wallet_name || null,
      is_default: is_default || false,
      created_at: new Date().toISOString()
    }

    existingMethods.push(newMethod)
    userPaymentMethods.set(user.id, existingMethods)

    return NextResponse.json({
      success: true,
      paymentMethod: newMethod
    })
  } catch (error) {
    console.error('Payment method POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
