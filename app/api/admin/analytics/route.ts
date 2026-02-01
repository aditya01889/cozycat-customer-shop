import { createClient } from '@/lib/supabase/server'
import { NextResponse, NextRequest } from 'next/server'
import { withAdminAuth, AuthContext } from '@/lib/auth/auth-middleware'
import { z } from 'zod'

// Analytics query schema
const analyticsQuerySchema = z.object({
  type: z.enum(['revenue', 'customers', 'products', 'inventory', 'orders']),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  groupBy: z.enum(['day', 'week', 'month']).default('day'),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  useCache: z.boolean().default(true)
})

async function handleAnalytics(request: NextRequest, authContext: AuthContext) {
  console.log('🔍 Admin analytics request - Auth context:', {
    isAuthenticated: authContext.isAuthenticated,
    isAdmin: authContext.isAdmin,
    userId: authContext.user?.id,
    userEmail: authContext.user?.email
  })

  try {
    const body = await request.json()
    const validatedData = analyticsQuerySchema.parse(body)
    
    const { type, startDate, endDate, groupBy, page, limit, useCache } = validatedData

    const supabase = await createClient()
    console.log(`📊 Fetching ${type} analytics with aggregation`)

    let data = null
    let error = null

    switch (type) {
      case 'revenue':
        try {
          const params: any = {}
          if (startDate) params.start_date = startDate
          if (endDate) params.end_date = endDate
          if (groupBy) params.group_by = groupBy
          
          const { data: revenueData, error: revenueError } = await supabase.rpc('get_revenue_analytics', params)
          if (!revenueError) data = revenueData
          error = revenueError
        } catch (err) {
          console.log('Revenue analytics RPC not available, using fallback query')
          // Fallback to direct query if RPC doesn't exist
          const { data: revenueData, error: revenueError } = await supabase
            .from('orders')
            .select('total_amount, created_at')
            .gte('created_at', startDate || '2024-01-01')
            .lte('created_at', endDate || new Date().toISOString())
          if (!revenueError) data = revenueData
          error = revenueError
        }
        break

      case 'customers':
        try {
          const params: any = {}
          if (limit) params.limit_count = limit
          if (page > 1) params.offset_count = (page - 1) * limit
          if (startDate) params.start_date = startDate
          if (endDate) params.end_date = endDate
          
          const { data: customerData, error: customerError } = await supabase.rpc('get_customer_analytics_paginated', params)
          if (!customerError) data = customerData
          error = customerError
        } catch (err) {
          console.log('Customer analytics RPC not available, using fallback query')
          // Fallback to direct query if RPC doesn't exist
          const { data: customerData, error: customerError } = await supabase
            .from('profiles')
            .select('*')
            .range((page - 1) * limit, page * limit - 1)
          if (!customerError) data = customerData
          error = customerError
        }
        break

      case 'products':
        try {
          const params: any = {}
          if (limit) params.limit_count = limit
          if (page > 1) params.offset_count = (page - 1) * limit
          if (startDate) params.start_date = startDate
          if (endDate) params.end_date = endDate
          
          const { data: productData, error: productError } = await supabase.rpc('get_product_performance_paginated', params)
          if (!productError) data = productData
          error = productError
        } catch (err) {
          console.log('Product analytics RPC not available, using fallback query')
          // Fallback to direct query if RPC doesn't exist
          const { data: productData, error: productError } = await supabase
            .from('products')
            .select('*')
            .range((page - 1) * limit, page * limit - 1)
          if (!productError) data = productData
          error = productError
        }
        break

      case 'inventory':
        try {
          const { data: inventoryData, error: inventoryError } = await supabase.rpc('get_inventory_analytics')
          if (!inventoryError) data = inventoryData
          error = inventoryError
        } catch (err) {
          console.log('Inventory analytics RPC not available, using fallback query')
          // Fallback to direct query if RPC doesn't exist
          const { data: inventoryData, error: inventoryError } = await supabase
            .from('products')
            .select('id, name, stock_quantity, category')
          if (!inventoryError) data = inventoryData
          error = inventoryError
        }
        break

      case 'orders':
        try {
          const params: any = {}
          if (startDate) params.start_date = startDate
          if (endDate) params.end_date = endDate
          
          const { data: orderData, error: orderError } = await supabase.rpc('get_order_stats_filtered', params)
          if (!orderError) data = orderData
          error = orderError
        } catch (err) {
          console.log('Order analytics RPC not available, using fallback query')
          // Fallback to direct query if RPC doesn't exist
          const { data: orderData, error: orderError } = await supabase
            .from('orders')
            .select('*')
            .gte('created_at', startDate || '2024-01-01')
            .lte('created_at', endDate || new Date().toISOString())
          if (!orderError) data = orderData
          error = orderError
        }
        break

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid analytics type'
        }, { status: 400 })
    }

    if (error) {
      console.error(`Analytics ${type} error:`, error)
      return NextResponse.json({
        success: false,
        error: `Failed to fetch ${type} analytics`,
        details: (error as Error).message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data,
      meta: {
        type,
        fetchedAt: new Date().toISOString(),
        filters: {
          startDate,
          endDate,
          groupBy
        },
        pagination: {
          page,
          limit,
          type: type === 'customers' || type === 'products' ? 'paginated' : 'full'
        },
        cacheEnabled: useCache
      }
    })

  } catch (error) {
    console.error('Analytics request error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to process analytics request',
      details: (error as Error).message
    }, { status: 500 })
  }
}

export const POST = withAdminAuth(handleAnalytics)
