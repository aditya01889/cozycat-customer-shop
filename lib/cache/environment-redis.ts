// =============================================================================
// Environment-Specific Redis Configuration
// Free Tier Optimization - Single Instance with Prefixes
// =============================================================================

import { Redis } from '@upstash/redis'

// Environment detection
const getEnvironment = (): 'local' | 'staging' | 'production' => {
  const env = (process.env.NODE_ENV || process.env.NEXT_PUBLIC_ENVIRONMENT || 'development') as string
  
  // Explicit type checking to avoid TypeScript errors
  if (env === 'production') return 'production'
  if (env === 'staging') return 'staging'
  return 'local'
}

// Redis configuration for each environment
const redisConfigs = {
  local: {
    url: process.env.REDIS_URL || 'http://localhost:6379',
    token: process.env.REDIS_TOKEN || 'local-token',
    prefix: 'local:',
    ttl: 300, // 5 minutes for local
  },
  staging: {
    url: process.env.UPSTASH_REDIS_REST_URL || 'https://evident-pug-37349.upstash.io',
    token: process.env.UPSTASH_REDIS_REST_TOKEN || process.env.REDIS_TOKEN || '',
    prefix: 'staging:',
    ttl: 600, // 10 minutes for staging
  },
  production: {
    url: process.env.UPSTASH_REDIS_REST_URL || 'https://evident-pug-37349.upstash.io',
    token: process.env.UPSTASH_REDIS_REST_TOKEN || process.env.REDIS_TOKEN || '',
    prefix: 'prod:',
    ttl: 3600, // 1 hour for production
  }
}

// Get current environment configuration
const currentConfig = redisConfigs[getEnvironment()]

// Create Redis instance with environment-specific configuration
export const redis = new Redis({
  url: currentConfig.url,
  token: currentConfig.token,
})

// Environment-aware Redis wrapper
export class EnvironmentRedis {
  private prefix: string
  private defaultTtl: number

  constructor() {
    this.prefix = currentConfig.prefix
    this.defaultTtl = currentConfig.ttl
  }

  // Helper to add environment prefix to keys
  private getKey(key: string): string {
    return `${this.prefix}${key}`
  }

  // Helper to remove environment prefix from keys
  private removeKey(key: string): string {
    return key.replace(this.prefix, '')
  }

  // Redis operations with environment prefix
  async get(key: string): Promise<string | null> {
    try {
      const result = await redis.get(this.getKey(key))
      return result as string | null
    } catch (error) {
      console.error(`Redis GET error for key ${key}:`, error)
      return null
    }
  }

  async set(key: string, value: string, ttl?: number): Promise<boolean> {
    try {
      const finalTtl = ttl || this.defaultTtl
      await redis.set(this.getKey(key), value, { ex: finalTtl })
      return true
    } catch (error) {
      console.error(`Redis SET error for key ${key}:`, error)
      return false
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      await redis.del(this.getKey(key))
      return true
    } catch (error) {
      console.error(`Redis DEL error for key ${key}:`, error)
      return false
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await redis.exists(this.getKey(key))
      return result === 1
    } catch (error) {
      console.error(`Redis EXISTS error for key ${key}:`, error)
      return false
    }
  }

  async expire(key: string, ttl: number): Promise<boolean> {
    try {
      const result = await redis.expire(this.getKey(key), ttl)
      return result === 1
    } catch (error) {
      console.error(`Redis EXPIRE error for key ${key}:`, error)
      return false
    }
  }

  async ttl(key: string): Promise<number> {
    try {
      const result = await redis.ttl(this.getKey(key))
      return result
    } catch (error) {
      console.error(`Redis TTL error for key ${key}:`, error)
      return -1
    }
  }

  async flush(): Promise<boolean> {
    try {
      // Get all keys with environment prefix
      const keys = await redis.keys(`${this.prefix}*`)
      if (keys.length > 0) {
        await redis.del(...keys)
      }
      return true
    } catch (error) {
      console.error(`Redis FLUSH error:`, error)
      return false
    }
  }

  // Batch operations
  async mget(keys: string[]): Promise<(string | null)[]> {
    try {
      const prefixedKeys = keys.map(key => this.getKey(key))
      const results = await Promise.all(
        prefixedKeys.map(key => redis.get(key))
      )
      return results as (string | null)[]
    } catch (error) {
      console.error(`Redis MGET error:`, error)
      return keys.map(() => null)
    }
  }

  async mset(keyValuePairs: Record<string, string>, ttl?: number): Promise<boolean> {
    try {
      const finalTtl = ttl || this.defaultTtl
      const promises = Object.entries(keyValuePairs).map(([key, value]) =>
        this.set(key, value, finalTtl)
      )
      await Promise.all(promises)
      return true
    } catch (error) {
      console.error(`Redis MSET error:`, error)
      return false
    }
  }

  // Environment-specific utilities
  async getEnvironment(): Promise<string> {
    return getEnvironment()
  }

  async getStats(): Promise<{
    environment: string
    prefix: string
    defaultTtl: number
    sampleKeys: string[]
  }> {
    try {
      const sampleKeys = await redis.keys(`${this.prefix}*`)
      return {
        environment: getEnvironment(),
        prefix: this.prefix,
        defaultTtl: this.defaultTtl,
        sampleKeys: sampleKeys.slice(0, 10).map(key => this.removeKey(key))
      }
    } catch (error) {
      console.error(`Redis stats error:`, error)
      return {
        environment: getEnvironment(),
        prefix: this.prefix,
        defaultTtl: this.defaultTtl,
        sampleKeys: []
      }
    }
  }

  // Cache invalidation for environment
  async invalidatePattern(pattern: string): Promise<number> {
    try {
      const fullPattern = `${this.prefix}${pattern}`
      const keys = await redis.keys(fullPattern)
      if (keys.length > 0) {
        await redis.del(...keys)
      }
      return keys.length
    } catch (error) {
      console.error(`Redis invalidate pattern error:`, error)
      return 0
    }
  }
}

// Export singleton instance
export const envRedis = new EnvironmentRedis()

// Export convenience functions
export const cacheGet = (key: string) => envRedis.get(key)
export const cacheSet = (key: string, value: string, ttl?: number) => envRedis.set(key, value, ttl)
export const cacheDel = (key: string) => envRedis.del(key)
export const cacheExists = (key: string) => envRedis.exists(key)
export const cacheFlush = () => envRedis.flush()

// Environment-specific cache keys
export const cacheKeys = {
  products: (category?: string) => `products${category ? `:${category}` : ''}`,
  categories: 'categories',
  user: (userId: string) => `user:${userId}`,
  cart: (userId: string) => `cart:${userId}`,
  session: (sessionId: string) => `session:${sessionId}`,
  api: (endpoint: string) => `api:${endpoint}`,
  health: 'health',
  config: 'config',
}

// Export configuration for debugging
export const getCurrentConfig = () => ({
  environment: getEnvironment(),
  config: currentConfig,
})
