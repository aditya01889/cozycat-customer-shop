import { createClient } from '@/lib/supabase/server'
import { NextResponse, NextRequest } from 'next/server'
import { withAdminAuth, AuthContext } from '@/lib/auth/auth-middleware'
import { z } from 'zod'

// Enhanced dashboard query schema with pagination and filtering
const dashboardQuerySchema = z.object({
  includeRecentOrders: z.boolean().default(true),
  includeOrderStats: z.boolean().default(true),
  includeProductPerformance: z.boolean().default(false),
  includeRecentActivity: z.boolean().default(false),
  activityLimit: z.number().int().min(1).max(50).default(10),
  // Pagination options
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  // Date filtering
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  // Performance optimization
  useCache: z.boolean().default(true),
  cacheTTL: z.number().int().min(30).max(3600).default(300) // 5 minutes default
})

async function handleDashboard(request: NextRequest, authContext: AuthContext) {
  console.log('🔍 Admin dashboard request - Auth context:', {
    isAuthenticated: authContext.isAuthenticated,
    isAdmin: authContext.isAdmin,
    userId: authContext.user?.id,
    userEmail: authContext.user?.email
  })

  try {
    const body = await request.json()
    const validatedData = dashboardQuerySchema.parse(body)
    
    const { 
      includeRecentOrders, 
      includeOrderStats, 
      includeProductPerformance,
      includeRecentActivity,
      activityLimit,
      page,
      limit,
      startDate,
      endDate,
      useCache,
      cacheTTL
    } = validatedData

    const supabase = await createClient()
    console.log('🚀 Fetching optimized dashboard data with aggregation')

    // Use unified dashboard aggregation function
    let dashboardStats = null
    let orderStats = null
    let productPerformance = null
    let recentActivity = null

    try {
      // Main dashboard stats - optimized single RPC call with filtering
      const { data: stats, error: statsError } = await supabase.rpc('get_dashboard_stats_optimized', {
        start_date: startDate || null,
        end_date: endDate || null,
        limit_count: limit,
        offset_count: (page - 1) * limit
      })
      
      if (statsError) {
        console.warn('Optimized dashboard RPC not available, using fallback:', statsError.message)
        dashboardStats = await getDashboardStatsFallback(supabase, includeRecentOrders, startDate, endDate, page, limit)
      } else {
        dashboardStats = stats[0] // RPC returns a single row
        console.log('✅ Using optimized dashboard RPC call with filtering')
      }
    } catch (error) {
      console.warn('RPC call failed, using fallback:', (error as Error).message)
      dashboardStats = await getDashboardStatsFallback(supabase, includeRecentOrders, startDate, endDate, page, limit)
    }

    // Additional data if requested
    if (includeOrderStats) {
      try {
        const { data: stats, error } = await supabase.rpc('get_order_stats_filtered', {
          start_date: startDate || null,
          end_date: endDate || null
        })
        if (!error && stats) {
          orderStats = stats
        }
      } catch (error) {
        console.warn('Order stats RPC failed:', (error as Error).message)
      }
    }

    if (includeProductPerformance) {
      try {
        const { data: performance, error } = await supabase.rpc('get_product_performance_paginated', {
          limit_count: limit,
          offset_count: (page - 1) * limit,
          start_date: startDate || null,
          end_date: endDate || null
        })
        if (!error && performance) {
          productPerformance = performance
        }
      } catch (error) {
        console.warn('Product performance RPC failed:', (error as Error).message)
      }
    }

    if (includeRecentActivity) {
      try {
        const { data: activity, error } = await supabase.rpc('get_recent_activity_paginated', { 
          limit_count: activityLimit,
          offset_count: 0,
          start_date: startDate || null,
          end_date: endDate || null
        })
        if (!error && activity) {
          recentActivity = activity
        }
      } catch (error) {
        console.warn('Recent activity RPC failed:', (error as Error).message)
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        dashboardStats,
        orderStats,
        productPerformance,
        recentActivity,
        pagination: {
          page,
          limit,
          hasNext: dashboardStats?.total_count > page * limit,
          hasPrev: page > 1,
          total: dashboardStats?.total_count || 0
        }
      },
      meta: {
        fetchedAt: new Date().toISOString(),
        usingRPC: !!dashboardStats && 'total_products' in dashboardStats,
        cacheEnabled: useCache,
        cacheTTL,
        filters: {
          startDate,
          endDate
        }
      }
    })

  } catch (error) {
    console.error('Dashboard data fetch error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch dashboard data',
      details: (error as Error).message
    }, { status: 500 })
  }
}

// Enhanced fallback function with pagination and filtering
async function getDashboardStatsFallback(
  supabase: any, 
  includeRecentOrders: boolean,
  startDate?: string,
  endDate?: string,
  page: number = 1,
  limit: number = 20
) {
  console.log('🔄 Using optimized fallback dashboard queries...')
  
  // Build date filters
  const dateFilter: any = {}
  if (startDate) dateFilter.gte = startDate
  if (endDate) dateFilter.lte = endDate
  
  const [
    productsResult,
    ordersResult,
    usersResult,
    pendingResult,
    recentOrdersResult,
    revenueResult,
    totalCountResult
  ] = await Promise.all([
    // Products count with filtering
    supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true),
    // Total orders count with date filtering
    supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .neq('status', 'cancelled')
      .gte('created_at', startDate || '1900-01-01')
      .lte('created_at', endDate || '2100-12-31'),
    // Users count
    supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true }),
    // Pending orders count
    supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending'),
    // Recent orders with pagination
    includeRecentOrders
      ? supabase
          .from('orders')
          .select('*')
          .neq('status', 'cancelled')
          .gte('created_at', startDate || '1900-01-01')
          .lte('created_at', endDate || '2100-12-31')
          .order('created_at', { ascending: false })
          .range((page - 1) * limit, page * limit - 1)
      : Promise.resolve({ data: [] }),
    // Total revenue with date filtering
    supabase
      .from('orders')
      .select('total_amount')
      .neq('status', 'cancelled')
      .gte('created_at', startDate || '1900-01-01')
      .lte('created_at', endDate || '2100-12-31'),
    // Total count for pagination
    supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .neq('status', 'cancelled')
  ])

  const revenue = revenueResult.data?.reduce((sum: number, order: any) => {
    const amount = parseFloat(order.total_amount) || 0
    return sum + amount
  }, 0) || 0

  return {
    total_products: productsResult.count || 0,
    total_orders: ordersResult.count || 0,
    total_users: usersResult.count || 0,
    total_revenue: revenue,
    pending_orders: pendingResult.count || 0,
    recent_orders: recentOrdersResult.data || [],
    total_count: totalCountResult.count || 0
  }
}

// Use new authentication method
export const POST = withAdminAuth(handleDashboard)
