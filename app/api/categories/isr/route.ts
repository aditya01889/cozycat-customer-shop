import { NextResponse } from 'next/server'
import { createStaticClient } from '@/lib/supabase/server-static'
import { cache, CACHE_KEYS, CACHE_TTL } from '@/lib/cache/redis-client'

// ISR configuration
export const revalidate = 600 // Revalidate every 10 minutes (categories change less frequently)

export async function GET() {
  try {
    // Try to get from cache first
    const cacheKey = `${CACHE_KEYS.PRODUCTS}isr_categories`
    const cachedCategories = await cache.get(cacheKey)
    
    if (cachedCategories) {
      console.log('📦 ISR Cache hit for categories')
      return NextResponse.json({
        categories: cachedCategories,
        cached: true,
        timestamp: new Date().toISOString()
      })
    }
    
    // Fetch from database if not in cache
    console.log('🔍 ISR Cache miss, fetching categories from database')
    const supabase = createStaticClient()
    
    const { data: categories, error } = await supabase
      .from('categories')
      .select(`
        id,
        name,
        slug,
        description,
        display_order,
        is_active,
        created_at
      `)
      .eq('is_active', true as any)
      .order('display_order', { ascending: true })
      .order('name', { ascending: true })

    if (error) {
      console.error('ISR Categories fetch error:', error)
      throw new Error('Failed to fetch categories')
    }

    // Cache the result
    await cache.set(cacheKey, categories, CACHE_TTL.LONG) // 30 minutes
    
    console.log(`💾 ISR Cached ${categories?.length || 0} categories`)
    
    return NextResponse.json({
      categories: categories || [],
      cached: false,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('ISR Categories API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch categories',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
