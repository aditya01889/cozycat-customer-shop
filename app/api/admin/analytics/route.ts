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
          const { data: revenueData, error: revenueError } = await supabase.rpc('get_revenue_analytics', {
            start_date: startDate || null,
            end_date: endDate || null,
            group_by: groupBy
          })
          if (!revenueError) data = revenueData
          error = revenueError
        } catch (err) {
          error = err
        }
        break

      case 'customers':
        try {
          const { data: customerData, error: customerError } = await supabase.rpc('get_customer_analytics_paginated', {
            limit_count: limit,
            offset_count: (page - 1) * limit,
            start_date: startDate || null,
            end_date: endDate || null
          })
          if (!customerError) data = customerData
          error = customerError
        } catch (err) {
          error = err
        }
        break

      case 'products':
        try {
          const { data: productData, error: productError } = await supabase.rpc('get_product_performance_paginated', {
            limit_count: limit,
            offset_count: (page - 1) * limit,
            start_date: startDate || null,
            end_date: endDate || null
          })
          if (!productError) data = productData
          error = productError
        } catch (err) {
          error = err
        }
        break

      case 'inventory':
        try {
          const { data: inventoryData, error: inventoryError } = await supabase.rpc('get_inventory_analytics')
          if (!inventoryError) data = inventoryData
          error = inventoryError
        } catch (err) {
          error = err
        }
        break

      case 'orders':
        try {
          const { data: orderData, error: orderError } = await supabase.rpc('get_order_stats_filtered', {
            start_date: startDate || null,
            end_date: endDate || null
          })
          if (!orderError) data = orderData
          error = orderError
        } catch (err) {
          error = err
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
