import { createClient } from 'redis'

// Redis client configuration
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'
const redisPassword = process.env.REDIS_PASSWORD

// Create Redis client only when not in CI dummy mode
export const redis = (process.env.CI_DUMMY_ENV === '1' || process.env.CI_DUMMY_ENV === 'true') 
  ? null 
  : createClient({
      url: redisUrl,
      password: redisPassword,
      socket: {
        connectTimeout: 5000,
      }
    })

// Redis connection status
let isConnected = false

const shouldLog = process.env.NODE_ENV === 'development'

// Initialize Redis connection
export async function initRedis() {
  if (!redis) {
    if (shouldLog) {
      console.log('⚠️ Redis disabled in CI dummy mode')
    }
    isConnected = false
    return
  }
  
  try {
    await redis.connect()
    isConnected = true
    if (shouldLog) {
      console.log('✅ Redis connected successfully')
    }
  } catch (error) {
    console.error('❌ Redis connection failed:', error)
    isConnected = false
  }
}

// Check Redis connection status
export function isRedisConnected(): boolean {
  return isConnected
}

// Redis cache wrapper with fallback
export class RedisCache {
  private static instance: RedisCache
  private fallbackCache = new Map<string, { data: any; timestamp: number; ttl: number }>()

  static getInstance(): RedisCache {
    if (!RedisCache.instance) {
      RedisCache.instance = new RedisCache()
    }
    return RedisCache.instance
  }

  // Get data from cache
  async get<T>(key: string): Promise<T | null> {
    try {
      if (!isConnected || !redis) {
        return this.getFallback<T>(key)
      }

      const data = await redis.get(key)
      if (data) {
        const parsed = JSON.parse(data)
        if (shouldLog) {
          console.log(`📦 Cache hit: ${key}`)
        }
        return parsed
      }
      
      if (shouldLog) {
        console.log(`📦 Cache miss: ${key}`)
      }
      return null
    } catch (error) {
      console.error('Redis get error:', error)
      return this.getFallback<T>(key)
    }
  }

  // Set data in cache
  async set(key: string, data: any, ttl: number = 300): Promise<void> {
    try {
      if (!isConnected || !redis) {
        this.setFallback(key, data, ttl)
        return
      }

      await redis.setEx(key, ttl, JSON.stringify(data))
      if (shouldLog) {
        console.log(`💾 Cache set: ${key} (TTL: ${ttl}s)`)
      }
    } catch (error) {
      console.error('Redis set error:', error)
      this.setFallback(key, data, ttl)
    }
  }

  // Delete data from cache
  async del(key: string): Promise<void> {
    try {
      if (!isConnected || !redis) {
        this.fallbackCache.delete(key)
        return
      }

      await redis.del(key)
      if (shouldLog) {
        console.log(`🗑️ Cache deleted: ${key}`)
      }
    } catch (error) {
      console.error('Redis del error:', error)
      this.fallbackCache.delete(key)
    }
  }

  // Clear all cache
  async clear(): Promise<void> {
    try {
      if (!isConnected || !redis) {
        this.fallbackCache.clear()
        return
      }

      await redis.flushDb()
      if (shouldLog) {
        console.log('🗑️ Cache cleared')
      }
    } catch (error) {
      console.error('Redis clear error:', error)
      this.fallbackCache.clear()
    }
  }

  // Get cache keys with pattern
  async keys(pattern: string): Promise<string[]> {
    try {
      if (!isConnected || !redis) {
        return Array.from(this.fallbackCache.keys()).filter(key => 
          key.includes(pattern.replace('*', ''))
        )
      }

      return await redis.keys(pattern)
    } catch (error) {
      console.error('Redis keys error:', error)
      return []
    }
  }

  // Fallback to in-memory cache
  private getFallback<T>(key: string): T | null {
    const item = this.fallbackCache.get(key)
    if (item && Date.now() - item.timestamp < item.ttl * 1000) {
      return item.data
    }
    this.fallbackCache.delete(key)
    return null
  }

  private setFallback(key: string, data: any, ttl: number): void {
    this.fallbackCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }
}

// Cache helper functions
export const cache = RedisCache.getInstance()

// Common cache keys
export const CACHE_KEYS = {
  PRODUCTS: 'products:',
  DASHBOARD: 'dashboard:',
  ORDERS: 'orders:',
  INVENTORY: 'inventory:',
  PRODUCTION_QUEUE: 'production_queue:',
  USER_PROFILE: 'user_profile:',
  SEARCH_RESULTS: 'search:',
  API_RESPONSE: 'api_response:'
}

// Cache TTL constants (in seconds)
export const CACHE_TTL = {
  SHORT: 60,        // 1 minute
  MEDIUM: 300,      // 5 minutes
  LONG: 1800,       // 30 minutes
  VERY_LONG: 3600   // 1 hour
}

// Cache invalidation helpers
export class CacheInvalidation {
  // Invalidate product-related cache
  static async invalidateProducts() {
    const keys = await cache.keys(`${CACHE_KEYS.PRODUCTS}*`)
    await Promise.all(keys.map(key => cache.del(key)))
    if (shouldLog) {
      console.log('🗑️ Product cache invalidated')
    }
  }

  // Invalidate dashboard cache
  static async invalidateDashboard() {
    const keys = await cache.keys(`${CACHE_KEYS.DASHBOARD}*`)
    await Promise.all(keys.map(key => cache.del(key)))
    if (shouldLog) {
      console.log('🗑️ Dashboard cache invalidated')
    }
  }

  // Invalidate orders cache
  static async invalidateOrders() {
    const keys = await cache.keys(`${CACHE_KEYS.ORDERS}*`)
    await Promise.all(keys.map(key => cache.del(key)))
    if (shouldLog) {
      console.log('🗑️ Orders cache invalidated')
    }
  }

  // Invalidate inventory cache
  static async invalidateInventory() {
    const keys = await cache.keys(`${CACHE_KEYS.INVENTORY}*`)
    await Promise.all(keys.map(key => cache.del(key)))
    if (shouldLog) {
      console.log('🗑️ Inventory cache invalidated')
    }
  }

  // Invalidate production queue cache
  static async invalidateProductionQueue() {
    const keys = await cache.keys(`${CACHE_KEYS.PRODUCTION_QUEUE}*`)
    await Promise.all(keys.map(key => cache.del(key)))
    if (shouldLog) {
      console.log('🗑️ Production queue cache invalidated')
    }
  }

  // Invalidate user-specific cache
  static async invalidateUserCache(userId: string) {
    const keys = await cache.keys(`${CACHE_KEYS.USER_PROFILE}${userId}*`)
    await Promise.all(keys.map(key => cache.del(key)))
    if (shouldLog) {
      console.log(`🗑️ User cache invalidated: ${userId}`)
    }
  }

  // Invalidate search cache
  static async invalidateSearchCache() {
    const keys = await cache.keys(`${CACHE_KEYS.SEARCH_RESULTS}*`)
    await Promise.all(keys.map(key => cache.del(key)))
    if (shouldLog) {
      console.log('🗑️ Search cache invalidated')
    }
  }
}

// Cache warming functions
export class CacheWarming {
  // Warm product cache
  static async warmProducts() {
    try {
      if (shouldLog) {
        console.log('🔥 Warming product cache...')
      }
      // This would typically fetch popular products and cache them
      // Implementation depends on your specific data fetching logic
      if (shouldLog) {
        console.log('✅ Product cache warmed')
      }
    } catch (error) {
      console.error('❌ Failed to warm product cache:', error)
    }
  }

  // Warm dashboard cache
  static async warmDashboard() {
    try {
      if (shouldLog) {
        console.log('🔥 Warming dashboard cache...')
      }
      // This would typically fetch dashboard stats and cache them
      if (shouldLog) {
        console.log('✅ Dashboard cache warmed')
      }
    } catch (error) {
      console.error('❌ Failed to warm dashboard cache:', error)
    }
  }
}

// Cache statistics
export async function getCacheStats() {
  try {
    if (!isConnected || !redis) {
      return {
        type: 'fallback',
        size: cache['fallbackCache']?.size || 0,
        connected: false
      }
    }

    const info = await redis.info('memory')
    const keyspace = await redis.info('keyspace')
    
    return {
      type: 'redis',
      connected: true,
      memory: info,
      keyspace: keyspace
    }
  } catch (error) {
    console.error('Failed to get cache stats:', error)
    return {
      type: 'error',
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Initialize Redis on module import only when explicitly configured,
// or in development where localhost is a reasonable default.
if ((process.env.REDIS_URL || process.env.NODE_ENV === 'development') && 
    !(process.env.CI_DUMMY_ENV === '1' || process.env.CI_DUMMY_ENV === 'true')) {
  initRedis().catch(console.error)
}
