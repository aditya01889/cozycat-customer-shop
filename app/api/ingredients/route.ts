import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server-helper'
import { z } from 'zod'

// Validation schema for ingredient creation
const ingredientSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  unit: z.string().min(1, 'Unit is required').max(20, 'Unit too long'),
  current_stock: z.number().min(0, 'Stock must be non-negative').default(0),
  reorder_level: z.number().min(0, 'Reorder level must be non-negative').default(10),
  unit_cost: z.number().min(0, 'Cost must be non-negative').default(0),
  supplier: z.string().nullable().optional()
})

// Helper function to create Supabase client
function getSupabaseClient() {
  return createServerSupabaseClient();
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('ingredients')
      .select('*')
      .order('name', { ascending: true })

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error fetching ingredients:', error)
    return NextResponse.json(
      { error: 'Failed to fetch ingredients' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = ingredientSchema.parse(body)
    
    // Create ingredient
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('ingredients')
      .insert([validatedData])
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to create ingredient' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('Error creating ingredient:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create ingredient' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body
    
    if (!id) {
      return NextResponse.json(
        { error: 'Ingredient ID is required for updates' },
        { status: 400 }
      )
    }
    
    // Validate input
    const validatedData = ingredientSchema.parse(updateData)
    
    // Update ingredient
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('ingredients')
      .update(validatedData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to update ingredient' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error updating ingredient:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to update ingredient' },
      { status: 500 }
    )
  }
}