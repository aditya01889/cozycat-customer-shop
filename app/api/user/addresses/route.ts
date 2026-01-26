import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { addressSchema } from '@/lib/validation/schemas'
import { getSupabaseConfig } from '@/lib/env-validation'
import { z } from 'zod'

// Address query schema for GET requests
const addressQuerySchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(10),
})

export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Validate parameters
    const validationResult = addressQuerySchema.safeParse({ page, limit })
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid query parameters',
          details: validationResult.error.errors
        },
        { status: 400 }
      )
    }

    // Get auth token from request headers
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Authorization token required'
        },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const { url, anonKey } = getSupabaseConfig()

    // Create client with user's token
    const supabase = createClient(url, anonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    })

    // Verify user session
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('Auth verification failed:', authError)
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid authentication token'
        },
        { status: 401 }
      )
    }

    console.log('✅ User authenticated for addresses:', user.email)

    // Use service role for database operations
    const serviceSupabase = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Fetch user addresses
    const { data: addresses, error } = await serviceSupabase
      .from('customer_addresses')
      .select('*')
      .eq('customer_id', user.id)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    if (error) {
      console.error('Error fetching addresses:', error)
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to fetch addresses',
          details: error.message
        },
        { status: 500 }
      )
    }

    // Get total count for pagination
    const { count } = await serviceSupabase
      .from('customer_addresses')
      .select('*', { count: 'exact', head: true })
      .eq('customer_id', user.id)

    return NextResponse.json({
      success: true,
      addresses: addresses || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    console.error('Addresses API error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        details: (error as Error).message
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()
    const validationResult = addressSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid address data',
          details: validationResult.error.errors
        },
        { status: 400 }
      )
    }

    // Get auth token from request headers
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Authorization token required'
        },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const { url, anonKey } = getSupabaseConfig()

    // Create client with user's token
    const supabase = createClient(url, anonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    })

    // Verify user session
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('Auth verification failed:', authError)
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid authentication token'
        },
        { status: 401 }
      )
    }

    console.log('✅ User authenticated for address creation:', user.email)

    // Use service role for database operations
    const serviceSupabase = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Create address
    const { data: address, error } = await serviceSupabase
      .from('customer_addresses')
      .insert({
        ...validationResult.data,
        customer_id: user.id
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating address:', error)
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to create address',
          details: error.message
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      address,
      message: 'Address created successfully'
    })

  } catch (error) {
    console.error('Address creation API error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        details: (error as Error).message
      },
      { status: 500 }
    )
  }
}
