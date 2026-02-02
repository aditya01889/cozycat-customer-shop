import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create Supabase client only when environment variables are available
const getSupabaseClient = () => {
  if (process.env.CI_DUMMY_ENV === '1' || process.env.CI_DUMMY_ENV === 'true') {
    // Return a mock client for CI builds
    return {
      from: () => ({
        select: () => ({
          eq: (column: string, value: any) => ({
            order: () => ({ data: [], error: null }),
            single: () => ({ data: null, error: new Error('CI dummy mode') })
          }),
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')

    if (productId) {
      // Get recipe for specific product
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('product_recipes')
        .select('*')
        .eq('product_id', productId)
        .order('percentage', { ascending: false })

      if (error) throw error

      return NextResponse.json({ data })
    } else {
      // Get all recipes
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('product_recipes')
        .select('*')
        .order('product_id', { ascending: true })

      if (error) throw error

      return NextResponse.json({ data })
    }
  } catch (error) {
    console.error('Error fetching recipes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recipes', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { product_id, ingredient_id, percentage } = body

    // Validate required fields
    if (!product_id || !ingredient_id || percentage === undefined) {
      return NextResponse.json(
        { error: 'Product ID, ingredient ID, and percentage are required' },
        { status: 400 }
      )
    }

    // Validate percentage range
    if (percentage < 0 || percentage > 100) {
      return NextResponse.json(
        { error: 'Percentage must be between 0 and 100' },
        { status: 400 }
      )
    }

    // Check if recipe already exists
    const supabase = getSupabaseClient()
    const { data: existing } = await supabase
      .from('product_recipes')
      .select('*')
      .eq('product_id', product_id)
      .eq('ingredient_id', ingredient_id)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Recipe for this product and ingredient already exists' },
        { status: 409 }
      )
    }

    const { data, error } = await supabase
      .from('product_recipes')
      .insert([{
        product_id,
        ingredient_id,
        percentage: parseFloat(percentage)
      }])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('Error creating recipe:', error)
    return NextResponse.json(
      { error: 'Failed to create recipe' },
      { status: 500 }
    )
  }
}
