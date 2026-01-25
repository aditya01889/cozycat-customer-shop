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
    const { name, unit, current_stock, reorder_level, unit_cost, supplier } = body

    // Validate required fields
    if (!name || !unit) {
      return NextResponse.json(
        { error: 'Name and unit are required' },
        { status: 400 }
      )
    }

    const updateData: any = {
      name: name.trim(),
      unit,
      current_stock: current_stock !== undefined ? parseFloat(current_stock) : undefined,
      reorder_level: reorder_level !== undefined ? parseFloat(reorder_level) : undefined,
      unit_cost: unit_cost !== undefined ? parseFloat(unit_cost) : undefined,
      supplier: supplier || null
    }

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key]
      }
    })

    const { data, error } = await supabase
      .from('ingredients')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    if (!data) {
      return NextResponse.json(
        { error: 'Ingredient not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error updating ingredient:', error)
    return NextResponse.json(
      { error: 'Failed to update ingredient' },
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
      .from('ingredients')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ message: 'Ingredient deleted successfully' })
  } catch (error) {
    console.error('Error deleting ingredient:', error)
    return NextResponse.json(
      { error: 'Failed to delete ingredient' },
      { status: 500 }
    )
  }
}
