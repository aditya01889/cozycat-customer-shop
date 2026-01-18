import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

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
    
    if (authError || !user?.id) {
      console.error('Invalid token or user not found in GET:', authError)
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      )
    }

    // Create admin client for database operations
    const adminSupabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Fetch addresses
    const { data: addresses, error } = await adminSupabase
      .from('customer_addresses')
      .select('*')
      .eq('customer_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching addresses:', error)
      return NextResponse.json(
        { error: 'Failed to fetch addresses' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      addresses
    })
  } catch (error) {
    console.error('Addresses GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== ADDRESSES POST ROUTE STARTED ===')
    
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
      console.error('Invalid token or user not found:', authError)
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      )
    }

    // Create admin client for database operations
    const adminSupabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    console.log('Admin Supabase client created')

    const body = await request.json()
    console.log('Received address data:', body)
    
    const {
      address_line1,
      address_line2,
      landmark,
      city,
      state,
      pincode,
      latitude,
      longitude,
      delivery_notes,
      is_default
    } = body

    // Validate required fields
    if (!address_line1 || !city || !state || !pincode) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    console.log('Validation passed, attempting database insert...')

    // If setting as default, unset other default addresses
    if (is_default) {
      console.log('Setting as default, unsetting other defaults...')
      await adminSupabase
        .from('customer_addresses')
        .update({ is_default: false } as any)
        .eq('customer_id', user.id)
    }

    console.log('Creating new address...')

    // Create new address
    const { data: address, error } = await adminSupabase
      .from('customer_addresses')
      .insert({
        customer_id: user.id,
        address_line1,
        address_line2: address_line2 || null,
        landmark: landmark || null,
        city,
        state,
        pincode,
        latitude: latitude || null,
        longitude: longitude || null,
        delivery_notes: delivery_notes || null,
        is_default: is_default || false
      } as any)
      .select()
      .single()

    if (error) {
      console.error('Error creating address:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      return NextResponse.json(
        { error: 'Failed to create address', details: error },
        { status: 500 }
      )
    }

    console.log('Address created successfully:', address)

    return NextResponse.json({
      success: true,
      address
    })
  } catch (error) {
    console.error('=== ADDRESSES POST ERROR ===')
    console.error('Error:', error)
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error')
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack')
    
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack'
      },
      { status: 500 }
    )
  }
}
