import redis from './client'

// Cache TTL constants (in seconds)
export const CACHE_TTL = {
  PRODUCTS: 3600,        // 1 hour
  PRODUCT_DETAIL: 1800,  // 30 minutes
  CATEGORIES: 7200,      // 2 hours
  USER_PROFILE: 300,     // 5 minutes
  SEARCH_RESULTS: 900,   // 15 minutes
  ANALYTICS: 1800,       // 30 minutes
  ORDER_STATS: 600,      // 10 minutes
}

// Cache key generators
export const CACHE_KEYS = {
  products: () => 'products:all',
  product: (id: string) => `product:${id}`,
  productsByCategory: (category: string) => `products:category:${category}`,
  searchResults: (query: string) => `search:${query}`,
  userProfile: (userId: string) => `user:${userId}`,
  analytics: (type: string, period: string) => `analytics:${type}:${period}`,
  orderStats: (period: string) => `orders:stats:${period}`,
}

// Generic cache functions
export class CacheService {
  // Get cached data
  static async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redis.get(key) as string
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('Cache get error:', error)
      return null
    }
  }

  // Set cache with TTL
  static async set(key: string, data: any, ttl: number = CACHE_TTL.PRODUCTS): Promise<void> {
    try {
      await redis.setex(key, ttl, JSON.stringify(data))
    } catch (error) {
      console.error('Cache set error:', error)
    }
  }

  // Delete cache
  static async del(key: string): Promise<void> {
    try {
      await redis.del(key)
    } catch (error) {
      console.error('Cache delete error:', error)
    }
  }

  // Clear all cache with pattern
  static async clearPattern(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(pattern)
      if (keys.length > 0) {
        await redis.del(...keys)
      }
    } catch (error) {
      console.error('Cache clear pattern error:', error)
    }
  }

  // Cache invalidation helpers
  static async invalidateProducts(): Promise<void> {
    await this.clearPattern('products:*')
  }

  static async invalidateUser(userId: string): Promise<void> {
    await this.del(CACHE_KEYS.userProfile(userId))
  }

  static async invalidateSearch(): Promise<void> {
    await this.clearPattern('search:*')
  }

  static async invalidateAnalytics(): Promise<void> {
    await this.clearPattern('analytics:*')
  }

  static async invalidateOrderStats(): Promise<void> {
    await this.clearPattern('orders:stats:*')
  }
}

// Cache wrapper for API calls
export function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = CACHE_TTL.PRODUCTS
): Promise<T> {
  return new Promise(async (resolve, reject) => {
    try {
      // Try to get from cache first
      const cached = await CacheService.get<T>(key)
      if (cached) {
        resolve(cached)
        return
      }

      // If not in cache, fetch data
      const data = await fetcher()
      
      // Cache the result
      await CacheService.set(key, data, ttl)
      
      resolve(data)
    } catch (error) {
      reject(error)
    }
  })
}

export default CacheService
