import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create Supabase client only when environment variables are available
const getSupabaseClient = () => {
  if (process.env.CI_DUMMY_ENV === '1' || process.env.CI_DUMMY_ENV === 'true') {
    // Return a mock client for CI builds
    return {
      from: () => ({
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: null, error: new Error('CI dummy mode') })
          })
        }),
        update: () => ({
          eq: () => ({
            select: () => ({
              single: () => Promise.resolve({ data: null, error: new Error('CI dummy mode') })
            })
          })
        }),
        delete: () => ({
          eq: () => Promise.resolve({ error: new Error('CI dummy mode') })
        })
      })
    }
  }
  
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('product_recipes')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error

    if (!data) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error fetching recipe:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recipe', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { percentage } = body

    console.log('🔧 PUT /api/recipes/', id, 'with body:', body)

    // Validate percentage if provided
    if (percentage !== undefined && (percentage < 0 || percentage > 100)) {
      return NextResponse.json(
        { error: 'Percentage must be between 0 and 100' },
        { status: 400 }
      )
    }

    const updateData: any = {}
    if (percentage !== undefined) updateData.percentage = parseFloat(percentage)

    console.log('🔧 Update data:', updateData)

    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('product_recipes')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('🔧 Supabase error:', error)
      throw error
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      )
    }

    console.log('🔧 Update successful:', data)
    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error updating recipe:', error)
    return NextResponse.json(
      { error: 'Failed to update recipe', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const supabase = getSupabaseClient()
    const { error } = await supabase
      .from('product_recipes')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ message: 'Recipe deleted successfully' })
  } catch (error) {
    console.error('Error deleting recipe:', error)
    return NextResponse.json(
      { error: 'Failed to delete recipe' },
      { status: 500 }
    )
  }
}
