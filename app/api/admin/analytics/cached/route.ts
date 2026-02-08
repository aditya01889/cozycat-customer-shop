import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { CacheService, CACHE_KEYS, CACHE_TTL, withCache } from '@/lib/redis/cache'

// Analytics data fetcher from database
async function fetchAnalyticsFromDB(type: string, period: string) {
  const supabase = await createClient()
  
  const now = new Date()
  let startDate: Date
  
  switch (period) {
    case 'today':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      break
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      break
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      break
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1)
      break
    default:
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  }

  try {
    switch (type) {
      case 'orders':
        const { data: orders, count: totalOrders } = await supabase
          .from('orders')
          .select('id, total_amount, created_at, order_status', { count: 'exact' })
          .gte('created_at', startDate.toISOString())
          .order('created_at', { ascending: false })

        // Type assertion to handle Supabase response
        const ordersData = orders as any[] || []
        const totalRevenue = ordersData.reduce((sum, order) => sum + (order.total_amount || 0), 0)
        
        return {
          totalOrders: totalOrders || 0,
          totalRevenue,
          orders: ordersData
        }

      case 'products':
        const { data: topProducts } = await supabase
          .from('order_items')
          .select(`
            product_id,
            quantity,
            products!inner(name, price)
          `)
          .gte('created_at', startDate.toISOString())

        // Type assertion to handle Supabase response
        const productsData = topProducts as any[] || []
        
        // Aggregate product data with proper type checking
        const productStats: Record<string, any> = {}
        productsData.forEach((item: any) => {
          const productId = item.product_id
          if (!productStats[productId]) {
            productStats[productId] = {
              id: productId,
              name: item.products?.name || 'Unknown',
              price: item.products?.price || 0,
              totalQuantity: 0,
              totalRevenue: 0
            }
          }
          productStats[productId].totalQuantity += item.quantity || 0
          productStats[productId].totalRevenue += (item.quantity || 0) * (item.products?.price || 0)
        })

        return {
          topProducts: Object.values(productStats)
            .sort((a: any, b: any) => b.totalQuantity - a.totalQuantity)
            .slice(0, 10)
        }

      case 'customers':
        const { count: newCustomers } = await supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', startDate.toISOString())

        const { count: totalCustomers } = await supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })

        return {
          newCustomers: newCustomers || 0,
          totalCustomers: totalCustomers || 0
        }

      default:
        throw new Error(`Unknown analytics type: ${type}`)
    }
  } catch (error) {
    console.error('Analytics fetch error:', error)
    throw new Error(`Failed to fetch ${type} analytics: ${error}`)
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'orders'
    const period = searchParams.get('period') || 'week'

    // Validate parameters
    const validTypes = ['orders', 'products', 'customers']
    const validPeriods = ['today', 'week', 'month', 'year']

    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      )
    }

    if (!validPeriods.includes(period)) {
      return NextResponse.json(
        { error: `Invalid period. Must be one of: ${validPeriods.join(', ')}` },
        { status: 400 }
      )
    }

    const cacheKey = CACHE_KEYS.analytics(type, period)
    console.log(`📊 Fetching analytics with Redis cache: ${cacheKey}`)

    // Use cache wrapper
    const result = await withCache(
      cacheKey,
      () => fetchAnalyticsFromDB(type, period),
      CACHE_TTL.ANALYTICS
    )

    return NextResponse.json({
      success: true,
      data: result,
      meta: {
        type,
        period,
        cacheKey,
        cached: true
      }
    })

  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch analytics',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Clear analytics cache
export async function DELETE(request: Request) {
  try {
    await CacheService.invalidateAnalytics()
    
    return NextResponse.json({
      success: true,
      message: 'Analytics cache cleared'
    })
  } catch (error) {
    console.error('Analytics cache clear error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to clear analytics cache',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
