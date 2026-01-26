import { createClient } from '@/lib/supabase/server'
import { NextResponse, NextRequest } from 'next/server'
import { createSecureHandler } from '@/lib/api/secure-handler'
import { actionRateLimiters } from '@/lib/middleware/rate-limiter'
import { withAdminAuth, AuthContext } from '@/lib/auth/auth-middleware'
import { z } from 'zod'

// Dashboard query schema
const dashboardQuerySchema = z.object({
  includeRecentOrders: z.boolean().default(true),
  includeOrderStats: z.boolean().default(true),
  includeProductPerformance: z.boolean().default(false),
  includeRecentActivity: z.boolean().default(false),
  activityLimit: z.number().int().min(1).max(50).default(10),
})

async function handleDashboard(request: NextRequest, authContext: AuthContext, data: any) {
  console.log('🔍 Admin dashboard request - Auth context:', {
    isAuthenticated: authContext.isAuthenticated,
    isAdmin: authContext.isAdmin,
    userId: authContext.user?.id,
    userEmail: authContext.user?.email
  })

  const supabase = await createClient()

  console.log('🔍 Admin fetching dashboard data with optimized RPC calls')

  try {
    const { 
      includeRecentOrders, 
      includeOrderStats, 
      includeProductPerformance,
      includeRecentActivity,
      activityLimit 
    } = data

    // Try to use optimized RPC functions first
    let dashboardStats = null
    let orderStats = null
    let productPerformance = null
    let recentActivity = null

    try {
      // Main dashboard stats - combines 6 queries into 1 RPC call
      const { data: stats, error: statsError } = await (await supabase).rpc('get_dashboard_stats')
      
      if (statsError) {
        console.warn('Dashboard RPC not available, falling back to individual queries:', (statsError as Error).message)
        dashboardStats = await getDashboardStatsFallback(await supabase, includeRecentOrders)
      } else {
        dashboardStats = stats[0] // RPC returns a single row
        console.log('✅ Using optimized dashboard RPC call')
      }
    } catch (error) {
      console.warn('RPC call failed, using fallback:', (error as Error).message)
      dashboardStats = await getDashboardStatsFallback(await supabase, includeRecentOrders)
    }

    // Additional data if requested
    if (includeOrderStats) {
      try {
        const { data: stats, error } = await (await supabase).rpc('get_order_stats')
        if (!error && stats) {
          orderStats = stats
        }
      } catch (error) {
        console.warn('Order stats RPC failed:', (error as Error).message)
      }
    }

    if (includeProductPerformance) {
      try {
        const { data: performance, error } = await (await supabase).rpc('get_product_performance')
        if (!error && performance) {
          productPerformance = performance
        }
      } catch (error) {
        console.warn('Product performance RPC failed:', (error as Error).message)
      }
    }

    if (includeRecentActivity) {
      try {
        const { data: activity, error } = await (await supabase).rpc('get_recent_activity', { 
          limit_count: activityLimit 
        } as any)
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
        recentActivity
      },
      meta: {
        fetchedAt: new Date().toISOString(),
        usingRPC: !!dashboardStats && 'total_products' in dashboardStats
      }
    })

  } catch (error) {
    console.error('Dashboard data fetch error:', error)
    throw new Error('Failed to fetch dashboard data')
  }
}

// Fallback function for when RPC is not available
async function getDashboardStatsFallback(supabase: any, includeRecentOrders: boolean) {
  console.log('🔄 Using fallback dashboard queries...')
  
  const [
    productsResult,
    ordersResult,
    usersResult,
    pendingResult,
    recentOrdersResult,
    revenueResult
  ] = await Promise.all([
    // Products count
    supabase
      .from('products')
      .select('*', { count: 'exact', head: true }),
    // Total orders count
    supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .neq('status', 'cancelled'),
    // Users count
    supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true }),
    // Pending orders count
    supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending'),
    // Recent orders (optional)
    includeRecentOrders
      ? supabase
          .from('orders')
          .select('*')
          .neq('status', 'cancelled')
          .order('created_at', { ascending: false })
          .limit(5)
      : Promise.resolve({ data: [] }),
    // Total revenue
    supabase
      .from('orders')
      .select('total_amount')
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
    recent_orders: recentOrdersResult.data || []
  }
}

export const POST = createSecureHandler({
  schema: dashboardQuerySchema,
  rateLimiter: actionRateLimiters.contactForm,
  requireCSRF: false, // Disable CSRF for admin endpoints (they use cookie auth)
  handler: withAdminAuth(handleDashboard)
})
