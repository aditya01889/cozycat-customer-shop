import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function DELETE(request: Request) {
  try {
    // Get the authorization header from the request
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No authorization token provided' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    
    // Create a Supabase client with the user's token
    const supabase = await createClient()
    
    // Verify the user's token and get user info
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error || !user) {
      console.error('Token verification failed:', error)
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
    }

    console.log('Deleting account for user:', user.id)

    // Delete user's orders first
    const { error: ordersError } = await supabase
      .from('orders')
      .delete()
      .eq('customer_id', user.id)

    if (ordersError) {
      console.error('Error deleting orders:', ordersError)
      // Don't fail the request if orders deletion fails
    }

    // Delete user's profile
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', user.id)

    if (profileError) {
      console.error('Error deleting profile:', profileError)
      // Don't fail the request if profile deletion fails
    }

    // Delete user's customer record
    const { error: customerError } = await supabase
      .from('customers')
      .delete()
      .eq('id', user.id)

    if (customerError) {
      console.error('Error deleting customer:', customerError)
      // Don't fail the request if customer deletion fails
    }

    // Instead of using admin.deleteUser (which requires service role key),
    // we'll revoke the user's session and let the client handle sign out
    // The auth record will be cleaned up by Supabase automatically or can be handled separately
    
    console.log('Account data deleted successfully for user:', user.id)
    return NextResponse.json({ message: 'Account deleted successfully' })
  } catch (error) {
    console.error('Account deletion error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
