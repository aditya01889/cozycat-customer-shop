import { createClient } from '@/lib/supabase/server'
import { NextResponse, NextRequest } from 'next/server'
import { withAdminAuth, AuthContext } from '@/lib/auth/auth-middleware'
import { z } from 'zod'

// Paginated orders query schema
const paginatedOrdersSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['created_at', 'total_amount', 'status', 'customer_name']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  includeCustomer: z.boolean().default(true),
  includeItems: z.boolean().default(false)
})

async function handlePaginatedOrders(request: NextRequest, authContext: AuthContext) {
  console.log('🔍 Admin paginated orders request - Auth context:', {
    isAuthenticated: authContext.isAuthenticated,
    isAdmin: authContext.isAdmin,
    userId: authContext.user?.id,
    userEmail: authContext.user?.email
  })

  try {
    const body = await request.json()
    const validatedData = paginatedOrdersSchema.parse(body)
    
    const { 
      page, 
      limit, 
      status, 
      startDate, 
      endDate, 
      search, 
      sortBy, 
      sortOrder,
      includeCustomer,
      includeItems
    } = validatedData

    const supabase = await createClient()
    console.log('📦 Fetching paginated orders with optimized query')

    // Build query
    let query = supabase
      .from('orders')
      .select(`
        *,
        ${includeCustomer ? `
          profiles!orders_user_id_fkey (
            id,
            full_name,
            email,
            phone
          )
        ` : ''}
        ${includeItems ? `
          order_items (
            id,
            product_id,
            quantity,
            unit_price,
            total_price,
            products!order_items_product_id_fkey (
              id,
              name,
              category
            )
          )
        ` : ''}
      `, { count: 'exact' })

    // Apply filters
    if (status) {
      query = query.eq('status', status)
    } else {
      query = query.neq('status', 'cancelled')
    }

    if (startDate) {
      query = query.gte('created_at', startDate)
    }

    if (endDate) {
      query = query.lte('created_at', endDate)
    }

    if (search) {
      query = query.or(`customer_name.ilike.%${search}%,email.ilike.%${search}%,id.ilike.%${search}%`)
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })

    // Apply pagination
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)

    const { data: orders, error, count } = await query

    if (error) {
      console.error('Paginated orders error:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch orders',
        details: error.message
      }, { status: 500 })
    }

    // Calculate pagination info
    const totalItems = count || 0
    const totalPages = Math.ceil(totalItems / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return NextResponse.json({
      success: true,
      data: {
        orders,
        pagination: {
          page,
          limit,
          totalItems,
          totalPages,
          hasNextPage,
          hasPrevPage,
          startIndex: offset + 1,
          endIndex: Math.min(offset + limit, totalItems)
        }
      },
      meta: {
        fetchedAt: new Date().toISOString(),
        filters: {
          status,
          startDate,
          endDate,
          search,
          sortBy,
          sortOrder
        },
        includes: {
          customer: includeCustomer,
          items: includeItems
        }
      }
    })

  } catch (error) {
    console.error('Paginated orders request error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to process orders request',
      details: (error as Error).message
    }, { status: 500 })
  }
}

export const POST = withAdminAuth(handlePaginatedOrders)
