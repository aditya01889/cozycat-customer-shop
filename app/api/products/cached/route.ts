import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { CacheService, CACHE_KEYS, CACHE_TTL, withCache } from '@/lib/redis/cache'

// Product query schema for validation
const productQuerySchema = z.object({
  id: z.string().uuid('Invalid product ID format').optional(),
  category: z.string().optional(),
  search: z.string().min(1).max(100).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  offset: z.coerce.number().int().min(0).default(0),
})

export async function GET(request: Request) {
  try {
    // Parse query parameters from URL
    const { searchParams } = new URL(request.url)
    const queryParams = {
      id: searchParams.get('id') || undefined,
      category: searchParams.get('category') || undefined,
      search: searchParams.get('search') || undefined,
      limit: searchParams.get('limit') || undefined,
      offset: searchParams.get('offset') || undefined,
    }

    // Validate query parameters
    const validationResult = productQuerySchema.safeParse(queryParams)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid query parameters',
          details: validationResult.error.errors
        },
        { status: 400 }
      )
    }

    const { id, category, search, limit, offset } = validationResult.data
    const supabase = await createClient()

    console.log('🔍 Fetching cached products with filters:', { id, category, search, limit, offset })

    let query = supabase
      .from('products')
      .select(`
        id,
        name,
        description,
        price,
        category_id,
        packaging_type,
        net_weight,
        ingredients,
        nutritional_info,
        images,
        is_active,
        created_at,
        updated_at
      `)
      .eq('is_active', true)

    // Apply filters
    if (id) {
      query = query.eq('id', id)
    }

    if (category) {
      query = query.eq('category_id', category)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // Apply pagination
    query = query
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false })

    const { data: products, error, count } = await query

    if (error) {
      console.error('Error fetching products:', error)
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to fetch products',
          details: error.message
        },
        { status: 500 }
      )
    }

    console.log(`✅ Found ${products?.length || 0} products`)

    // Determine cache revalidation time based on query type
    const revalidateTime = search ? SEARCH_CACHE_REVALIDATE_TIME : CACHE_REVALIDATE_TIME

    // Create response with caching headers
    const response = NextResponse.json({
      success: true,
      products: products || [],
      pagination: {
        limit,
        offset,
        total: count || 0,
        hasMore: (offset + limit) < (count || 0)
      },
      filters: {
        id: id || null,
        category: category || null,
        search: search || null
      },
      meta: {
        cached: true,
        revalidateAt: new Date(Date.now() + revalidateTime * 1000).toISOString()
      }
    })

    // Set cache control headers
    response.headers.set(
      'Cache-Control',
      `public, s-maxage=${revalidateTime}, stale-while-revalidate=${revalidateTime * 2}`
    )
    
    // Add Vercel ISR cache header
    response.headers.set(
      'Next-Cache-Tag',
      `products${category ? `,category:${category}` : ''}${search ? `,search:${search}` : ''}`
    )

    return response

  } catch (error) {
    console.error('Products API error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        details: (error as Error).message
      },
      { status: 500 }
    )
  }
}

// Function to revalidate product cache
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { tags } = body

    if (!tags || !Array.isArray(tags)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid revalidation request'
        },
        { status: 400 }
      )
    }

    console.log('🔄 Revalidating product cache for tags:', tags)

    // This would typically be called from a webhook or admin action
    // In a real implementation, you'd use Next.js revalidateTag function
    // revalidateTag(tags)

    return NextResponse.json({
      success: true,
      message: 'Cache revalidation initiated',
      tags
    })

  } catch (error) {
    console.error('Cache revalidation error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to revalidate cache',
        details: (error as Error).message
      },
      { status: 500 }
    )
  }
}
