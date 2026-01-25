import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    const body = await request.json()
    const { percentage, notes } = body

    // Validate percentage if provided
    if (percentage !== undefined && (percentage < 0 || percentage > 100)) {
      return NextResponse.json(
        { error: 'Percentage must be between 0 and 100' },
        { status: 400 }
      )
    }

    const updateData: any = {}
    if (percentage !== undefined) updateData.percentage = parseFloat(percentage)
    if (notes !== undefined) updateData.notes = notes

    const { data, error } = await supabase
      .from('product_recipes')
      .update(updateData)
      .eq('id', id)
      .select()
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
    console.error('Error updating recipe:', error)
    return NextResponse.json(
      { error: 'Failed to update recipe' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id

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
