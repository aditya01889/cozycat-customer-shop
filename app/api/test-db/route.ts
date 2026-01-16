import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Test basic connection
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('id, name')
      .limit(1)
    
    if (categoriesError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Database connection failed', 
          details: categoriesError 
        },
        { status: 500 }
      )
    }
    
    // Test orders
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, order_number, status, created_at')
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (ordersError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Orders query failed', 
          details: ordersError 
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      data: {
        categoriesCount: categories.length,
        recentOrders: orders.map(o => ({
          id: o.id,
          order_number: o.order_number,
          status: o.status,
          created_at: o.created_at
        }))
      }
    })
    
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Server error', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
