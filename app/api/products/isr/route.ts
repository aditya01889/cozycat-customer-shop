import { NextResponse } from 'next/server'
import { createStaticClient } from '@/lib/supabase/server-static'
import { cache, CACHE_KEYS, CACHE_TTL } from '@/lib/cache/redis-client'

// ISR configuration
export const revalidate = 300 // Revalidate every 5 minutes

export async function GET() {
  try {
    // Try to get from cache first
    const cacheKey = `${CACHE_KEYS.PRODUCTS}isr_catalog`
    const cachedProducts = await cache.get(cacheKey)
    
    if (cachedProducts) {
      console.log('📦 ISR Cache hit for products catalog')
      return NextResponse.json({
        products: cachedProducts,
        cached: true,
        timestamp: new Date().toISOString()
      })
    }
    
    // Fetch from database if not in cache
    console.log('🔍 ISR Cache miss, fetching products from database')
    const supabase = createStaticClient()
    
    const { data: products, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        slug,
        description,
        short_description,
        image_url,
        is_active,
        display_order,
        category_id,
        packaging_type,
        label_type,
        packaging_quantity_per_product,
        label_quantity_per_product,
        nutritional_info,
        ingredients_display,
        created_at,
        updated_at,
        categories (
          id,
          name,
          slug
        )
      `)
      .eq('is_active', true as any)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false })

    if (error) {
      console.error('ISR Products fetch error:', error)
      throw new Error('Failed to fetch products')
    }

    // Cache the result
    await cache.set(cacheKey, products, CACHE_TTL.MEDIUM) // 5 minutes
    
    console.log(`💾 ISR Cached ${products?.length || 0} products`)
    
    return NextResponse.json({
      products: products || [],
      cached: false,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('ISR Products API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch products',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
