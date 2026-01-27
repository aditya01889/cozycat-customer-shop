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

// Fetch products from database
async function fetchProductsFromDB(params: {
  id?: string
  category?: string
  search?: string
  limit: number
  offset: number
}) {
  const { id, category, search, limit, offset } = params
  const supabase = await createClient()

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
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  const { data, error, count } = await query

  if (error) {
    throw new Error(`Database error: ${error.message}`)
  }

  return {
    products: data || [],
    total: count || 0,
    hasMore: (offset + limit) < (count || 0)
  }
}

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

    // Generate cache key
    let cacheKey: string
    let cacheTTL: number

    if (id) {
      cacheKey = CACHE_KEYS.product(id)
      cacheTTL = CACHE_TTL.PRODUCT_DETAIL
    } else if (category) {
      cacheKey = CACHE_KEYS.productsByCategory(category)
      cacheTTL = CACHE_TTL.PRODUCTS
    } else if (search) {
      cacheKey = CACHE_KEYS.searchResults(search)
      cacheTTL = CACHE_TTL.SEARCH_RESULTS
    } else {
      cacheKey = CACHE_KEYS.products()
      cacheTTL = CACHE_TTL.PRODUCTS
    }

    // Add pagination to cache key for paginated requests
    if (!id && (offset > 0 || limit !== 20)) {
      cacheKey += `:${offset}:${limit}`
    }

    console.log('🔍 Fetching products with Redis cache:', { cacheKey, params: { id, category, search, limit, offset } })

    // Use cache wrapper
    const result = await withCache(
      cacheKey,
      () => fetchProductsFromDB({ id, category, search, limit, offset }),
      cacheTTL
    )

    return NextResponse.json({
      success: true,
      data: result,
      cached: true,
      meta: {
        query: { id, category, search, limit, offset },
        cacheKey,
        cacheTTL
      }
    })

  } catch (error) {
    console.error('Products API error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch products',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Cache invalidation endpoint for admin use
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const pattern = searchParams.get('pattern')

    if (pattern) {
      await CacheService.clearPattern(pattern)
      return NextResponse.json({
        success: true,
        message: `Cache cleared for pattern: ${pattern}`
      })
    } else {
      // Clear all product-related cache
      await CacheService.invalidateProducts()
      await CacheService.invalidateSearch()
      
      return NextResponse.json({
        success: true,
        message: 'All product cache cleared'
      })
    }
  } catch (error) {
    console.error('Cache clear error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to clear cache',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
