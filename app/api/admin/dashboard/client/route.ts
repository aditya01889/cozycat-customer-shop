/**
 * Client-side Dashboard API Route
 * This route works with client-side authentication
 */

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getSupabaseConfig } from '@/lib/env-validation'

// Dashboard query schema
const dashboardQuerySchema = z.object({
  includeRecentOrders: z.boolean().default(true),
  includeOrderStats: z.boolean().default(true),
  includeProductPerformance: z.boolean().default(false),
  includeRecentActivity: z.boolean().default(false),
  activityLimit: z.number().int().min(1).max(50).default(10),
})

export async function POST(request: Request) {
  try {
    // Parse and validate request body
    const body = await request.json()
    const validationResult = dashboardQuerySchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid request parameters',
          details: validationResult.error.errors
        },
        { status: 400 }
      )
    }

    const { 
      includeRecentOrders, 
      includeOrderStats, 
      includeProductPerformance,
      includeRecentActivity,
      activityLimit 
    } = validationResult.data

    // Get auth token from request headers
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Authorization token required'
        },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const { url, anonKey } = getSupabaseConfig()

    // Create client with user's token
    const supabase = createClient(url, anonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    })

    // Verify user session
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('Auth verification failed:', authError)
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid authentication token'
        },
        { status: 401 }
      )
    }

    // Check admin role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || (profile as any)?.role !== 'admin') {
      console.error('Admin access denied:', { profileError, role: (profile as any)?.role })
      return NextResponse.json(
        { 
          success: false,
          error: 'Admin access required'
        },
        { status: 403 }
      )
    }

    console.log('✅ Admin authenticated:', user.email)

    // Use service role for database operations
    const serviceSupabase = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Fetch dashboard data using fallback queries
    const [
      productsResult,
      ordersResult,
      usersResult,
      pendingResult,
      recentOrdersResult,
      revenueResult
    ] = await Promise.all([
      // Products count
      serviceSupabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true),

      // Total orders count
      serviceSupabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .neq('status', 'cancelled'),

      // Users count
      serviceSupabase
        .from('profiles')
        .select('*', { count: 'exact', head: true }),

      // Pending orders count
      serviceSupabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending'),

      // Recent orders (optional)
      includeRecentOrders
        ? serviceSupabase
            .from('orders')
            .select('*')
            .neq('status', 'cancelled')
            .order('created_at', { ascending: false })
            .limit(5)
        : Promise.resolve({ data: [] }),

      // Total revenue
      serviceSupabase
        .from('orders')
        .select('total_amount')
        .neq('status', 'cancelled')
    ])

    const revenue = revenueResult.data?.reduce((sum: number, order: any) => {
      const amount = parseFloat(order.total_amount) || 0
      return sum + amount
    }, 0) || 0

    const dashboardStats = {
      total_products: productsResult.count || 0,
      total_orders: ordersResult.count || 0,
      total_users: usersResult.count || 0,
      total_revenue: revenue,
      pending_orders: pendingResult.count || 0,
      recent_orders: recentOrdersResult.data || []
    }

    return NextResponse.json({
      success: true,
      data: {
        dashboardStats,
        orderStats: null,
        productPerformance: null,
        recentActivity: null
      },
      meta: {
        usingRPC: false,
        usingClientAuth: true,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Dashboard data fetch error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch dashboard data',
        details: (error as Error).message
      },
      { status: 500 }
    )
  }
}
