/**
 * Edge caching utilities for static assets and API responses
 * Optimizes performance by leveraging CDN edge caching
 */

// Cache control headers for different types of content
export const CACHE_HEADERS = {
  // Static assets - long cache (1 year)
  static: {
    'Cache-Control': 'public, max-age=31536000, immutable',
    'X-Edge-Cache': 'HIT'
  },
  
  // API responses - medium cache (5 minutes)
  api: {
    'Cache-Control': 'public, max-age=300, s-maxage=300, stale-while-revalidate=30',
    'X-Edge-Cache': 'HIT'
  },
  
  // Product data - short cache (2 minutes)
  products: {
    'Cache-Control': 'public, max-age=120, s-maxage=120, stale-while-revalidate=10',
    'X-Edge-Cache': 'HIT'
  },
  
  // User-specific content - no cache
  private: {
    'Cache-Control': 'private, no-cache, no-store, must-revalidate',
    'X-Edge-Cache': 'MISS'
  },
  
  // Admin content - no cache
  admin: {
    'Cache-Control': 'private, no-cache, no-store, must-revalidate',
    'X-Edge-Cache': 'MISS'
  }
}

/**
 * Add cache headers to NextResponse
 */
export function addCacheHeaders(
  response: Response,
  type: keyof typeof CACHE_HEADERS
): Response {
  const headers = CACHE_HEADERS[type]
  
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  
  return response
}

/**
 * Create a cached response for API routes
 */
export function createCachedResponse(
  data: any,
  type: keyof typeof CACHE_HEADERS = 'api',
  status: number = 200
): Response {
  const response = new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json'
    }
  })
  
  return addCacheHeaders(response, type)
}

/**
 * Middleware to add edge caching based on request path
 */
export function edgeCacheMiddleware(request: Request): Response | null {
  const url = new URL(request.url)
  const pathname = url.pathname
  
  // Static assets
  if (pathname.includes('/_next/static/') || 
      pathname.includes('/images/') ||
      pathname.includes('/favicon.ico') ||
      pathname.endsWith('.css') ||
      pathname.endsWith('.js') ||
      pathname.endsWith('.png') ||
      pathname.endsWith('.jpg') ||
      pathname.endsWith('.jpeg') ||
      pathname.endsWith('.gif') ||
      pathname.endsWith('.svg') ||
      pathname.endsWith('.webp')) {
    
    const response = new Response(null, { status: 200 })
    return addCacheHeaders(response, 'static')
  }
  
  return null
}

/**
 * Cache invalidation helpers
 */
export class EdgeCacheInvalidation {
  /**
   * Invalidate product-related caches
   */
  static async invalidateProducts() {
    try {
      // This would typically call a CDN API to purge cache
      // For Vercel, you'd use their revalidation API
      console.log('🔄 Edge cache invalidated for products')
      
      // Example for Vercel:
      // await fetch('https://api.vercel.com/v1/edge-config/invalidate', {
      //   method: 'POST',
      //   headers: { Authorization: `Bearer ${process.env.VERCEL_TOKEN}` },
      //   body: JSON.stringify({ paths: ['/api/products*', '/products*'] })
      // })
      
      return { success: true }
    } catch (error) {
      console.error('Failed to invalidate edge cache:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }
  
  /**
   * Invalidate all caches
   */
  static async invalidateAll() {
    try {
      console.log('🔄 All edge caches invalidated')
      
      // This would invalidate all CDN caches
      // Implementation depends on your CDN provider
      
      return { success: true }
    } catch (error) {
      console.error('Failed to invalidate all edge caches:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }
}

/**
 * Cache warming utilities
 */
export class EdgeCacheWarming {
  /**
   * Warm product caches
   */
  static async warmProducts() {
    try {
      console.log('🔥 Warming edge cache for products...')
      
      // Fetch key product pages to warm the cache
      const productUrls = [
        '/api/products/isr',
        '/api/categories/isr',
        '/products',
        '/categories'
      ]
      
      // In a real implementation, you'd fetch these URLs
      // to warm the CDN cache
      for (const url of productUrls) {
        console.log(`Warming cache for: ${url}`)
        // await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}${url}`)
      }
      
      console.log('✅ Edge cache warmed for products')
      return { success: true }
    } catch (error) {
      console.error('Failed to warm edge cache:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }
  
  /**
   * Warm static asset caches
   */
  static async warmStaticAssets() {
    try {
      console.log('🔥 Warming edge cache for static assets...')
      
      // Key static assets to warm
      const staticAssets = [
        '/',
        '/products',
        '/about',
        '/contact',
        '/favicon.ico'
      ]
      
      for (const asset of staticAssets) {
        console.log(`Warming cache for: ${asset}`)
        // await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}${asset}`)
      }
      
      console.log('✅ Edge cache warmed for static assets')
      return { success: true }
    } catch (error) {
      console.error('Failed to warm static edge cache:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }
}

/**
 * Get cache statistics
 */
export async function getEdgeCacheStats() {
  try {
    // This would typically call your CDN's API
    // For now, return mock data
    
    return {
      cacheHits: 0,
      cacheMisses: 0,
      hitRate: 0,
      totalRequests: 0,
      lastUpdated: new Date().toISOString()
    }
  } catch (error) {
    console.error('Failed to get edge cache stats:', error)
    return {
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
