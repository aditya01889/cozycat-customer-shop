import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

// Create Supabase client only when environment variables are available
const getSupabaseClient = () => {
  if (process.env.CI_DUMMY_ENV === '1' || process.env.CI_DUMMY_ENV === 'true') {
    // Return a mock client for CI builds
    return {
      from: () => ({
        select: () => ({
          order: () => ({ data: [], error: null })
        }),
        insert: () => ({
          select: () => ({
            single: () => ({ data: null, error: new Error('CI dummy mode') })
          })
        })
      })
    }
  }
  
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// Validation schema for vendor creation
const vendorSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  contact_person: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  email: z.string().email('Invalid email').nullable().optional(),
  address: z.string().nullable().optional(),
  is_active: z.boolean().default(true),
  payment_terms: z.string().nullable().optional()
})

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .order('name', { ascending: true })

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error fetching vendors:', error)
    return NextResponse.json(
      { error: 'Failed to fetch vendors' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = vendorSchema.parse(body)
    
    // Create vendor
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('vendors')
      .insert([validatedData])
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to create vendor' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('Error creating vendor:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create vendor' },
      { status: 500 }
    )
  }
}
