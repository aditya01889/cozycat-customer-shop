import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    // Get user from session
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const addressId = params.id

    // Check if address belongs to user
    const { data: existingAddress, error: fetchError } = await supabase
      .from('customer_addresses')
      .select('customer_id')
      .eq('id', addressId)
      .single()

    if (fetchError || !existingAddress) {
      return NextResponse.json(
        { error: 'Address not found' },
        { status: 404 }
      )
    }

    if (existingAddress.customer_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // If setting as default, unset other default addresses
    if (body.is_default) {
      await supabase
        .from('customer_addresses')
        .update({ is_default: false } as any)
        .eq('customer_id', session.user.id)
        .neq('id', addressId)
    }

    // Update address
    const { data: address, error: updateError } = await supabase
      .from('customer_addresses')
      .update(body as any)
      .eq('id', addressId)
      .eq('customer_id', session.user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating address:', updateError)
      return NextResponse.json(
        { error: 'Failed to update address' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      address
    })
  } catch (error) {
    console.error('Address PUT error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    // Get user from session
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const addressId = params.id

    // Check if address belongs to user
    const { data: existingAddress, error: fetchError } = await supabase
      .from('customer_addresses')
      .select('customer_id, is_default')
      .eq('id', addressId)
      .single()

    if (fetchError || !existingAddress) {
      return NextResponse.json(
        { error: 'Address not found' },
        { status: 404 }
      )
    }

    if (existingAddress.customer_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Don't allow deletion of default address if it's the only one
    if (existingAddress.is_default) {
      const { data: otherAddresses } = await supabase
        .from('customer_addresses')
        .select('id')
        .eq('customer_id', session.user.id)

      if (otherAddresses && otherAddresses.length <= 1) {
        return NextResponse.json(
          { error: 'Cannot delete default address. Add another address first.' },
          { status: 400 }
        )
      }
    }

    // Delete address
    const { error: deleteError } = await supabase
      .from('customer_addresses')
      .delete()
      .eq('id', addressId)
      .eq('customer_id', session.user.id)

    if (deleteError) {
      console.error('Error deleting address:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete address' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Address deleted successfully'
    })
  } catch (error) {
    console.error('Address DELETE error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
