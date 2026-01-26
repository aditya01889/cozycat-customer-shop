import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

// Enhanced product query schema with pagination and caching
const optimizedProductQuerySchema = z.object({
  search: z.string().min(1).max(100).optional(),
  category: z.string().optional(),
  price_range: z.enum(['under-100', '100-200', '200-400', 'above-400']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  sort: z.enum(['display_order', 'name', 'price_asc', 'price_desc', 'created_at']).default('display_order'),
  use_cache: z.boolean().default(true),
  cache_ttl: z.number().int().min(30).max(3600).default(300), // 5 minutes default
})

// Cache for product data (in production, use Redis)
const productCache = new Map<string, { data: any; timestamp: number }>()

export async function GET(request: Request) {
  try {
    const startTime = Date.now()
    
    // Parse and validate query parameters
    const { searchParams } = new URL(request.url)
    const queryParams = {
      search: searchParams.get('search') || undefined,
      category: searchParams.get('category') || undefined,
      price_range: searchParams.get('price_range') || undefined,
      page: searchParams.get('page') || undefined,
      limit: searchParams.get('limit') || undefined,
      sort: searchParams.get('sort') || undefined,
      use_cache: searchParams.get('use_cache') !== 'false',
      cache_ttl: searchParams.get('cache_ttl') || undefined,
    }

    const validationResult = optimizedProductQuerySchema.safeParse(queryParams)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validationResult.error.issues.map(issue => issue.message).join(', ')
        },
        { status: 400 }
      )
    }

    const { search, category, price_range, page, limit, sort, use_cache, cache_ttl } = validationResult.data
    const offset = (page - 1) * limit

    // Generate cache key
    const cacheKey = JSON.stringify({ search, category, price_range, page, limit, sort })
    
    // Check cache first
    if (use_cache && productCache.has(cacheKey)) {
      const cached = productCache.get(cacheKey)!
      if (Date.now() - cached.timestamp < cache_ttl * 1000) {
        console.log('📦 Serving products from cache')
        return NextResponse.json({
          ...cached.data,
          cached: true,
          performance: {
            cache_hit: true,
            response_time: Date.now() - startTime
          }
        })
      } else {
        productCache.delete(cacheKey)
      }
    }

    const supabase = await createClient()
    console.log('🚀 Fetching optimized products with aggregation')

    let products = []
    let totalCount = 0

    try {
      // Simple optimized approach - get products with categories in one query
      const { data: productsData, error } = await supabase
        .from('products')
        .select(`
          *,
          categories!inner(
            id,
            name,
            slug
          )
        `)
        .eq('is_active', true)
        .ilike('name', search ? `%${search}%` : '%%')
        .eq('category_id', category ? (await supabase.from('categories').select('id').eq('slug', category).single()).then(d => d?.id || null) : true)
        .range(offset, offset + limit - 1)
        .order('display_order', { ascending: true })
      
      if (error) {
        console.error('Products query failed:', error)
        throw error
      }
      
      // Process products to add variant info
      products = await Promise.all(
        (productsData || []).map(async (product) => {
          // Get variants for each product
          const { data: variants } = await supabase
            .from('product_variants')
            .select('id, price')
            .eq('product_id', product.id)
          
          const prices = variants?.map(v => v.price) || []
          const minPrice = prices.length > 0 ? Math.min(...prices) : 0
          const maxPrice = prices.length > 0 ? Math.max(...prices) : 0
          
          return {
            ...product,
            category_name: product.categories?.name || '',
            category_slug: product.categories?.slug || '',
            min_price: minPrice,
            max_price: maxPrice,
            variant_count: variants?.length || 0
          }
        })
      )
      
      // Get total count
      const { count } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .ilike('name', search ? `%${search}%` : '%%')
        .eq('category_id', category ? (await supabase.from('categories').select('id').eq('slug', category).single()).then(d => d?.id || null) : true)
      
      totalCount = count || 0
      
      console.log('✅ Using optimized query with async processing')
      
    } catch (error) {
      console.error('Optimized query failed, using fallback:', error)
      // Fallback to basic query
      products = await getProductsFallback(supabase, { search, category, price_range, limit, offset })
      totalCount = await getTotalCountFallback(supabase, { search, category, price_range })
    }

    // Cache the results
    if (use_cache && products.length > 0) {
      productCache.set(cacheKey, {
        data: { products, totalCount, pagination: { page, limit, totalCount } },
        timestamp: Date.now()
      })
    }

    const responseTime = Date.now() - startTime
    console.log(`📊 Products fetched in ${responseTime}ms`)

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: offset + limit < totalCount,
        hasPrev: page > 1
      },
      filters: {
        search,
        category,
        price_range,
        sort
      },
      performance: {
        response_time: responseTime,
        cache_hit: false,
        products_count: products.length
      }
    })

  } catch (error) {
    console.error('Products API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Fallback function for when RPC is not available
async function getProductsFallback(supabase: any, params: any) {
  const { search, category, price_range, limit, offset } = params
  
  let query = supabase
    .from('products')
    .select(`
      *,
      categories (*),
      product_variants (*)
    `)
    .eq('is_active', true)

  // Apply filters
  if (search) {
    query = query.ilike('name', `%${search}%`)
  }

  if (category) {
    const { data: categoryData } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', category)
      .single()
    
    if (categoryData) {
      query = query.eq('category_id', categoryData.id)
    }
  }

  // Apply pagination and ordering
  query = query
    .range(offset, offset + limit - 1)
    .order('display_order')

  const { data, error } = await query
  return data || []
}

async function getTotalCountFallback(supabase: any, params: any) {
  const { search, category } = params
  
  let query = supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  if (search) {
    query = query.ilike('name', `%${search}%`)
  }

  if (category) {
    const { data: categoryData } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', category)
      .single()
    
    if (categoryData) {
      query = query.eq('category_id', categoryData.id)
    }
  }

  const { count, error } = await query
  return count || 0
}
