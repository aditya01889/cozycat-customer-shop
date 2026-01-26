import { createClient } from '@/lib/supabase/server'
import { cache, CACHE_KEYS, CACHE_TTL, CacheInvalidation, getCacheStats } from '@/lib/cache/redis-client'
import { ApiResponse, PaginationParams, DateRangeParams, CacheParams } from './utils'

// Enhanced API response with caching
export interface EnhancedApiResponse<T = any> extends ApiResponse<T> {
  meta: {
    fetchedAt?: string
    pagination?: {
      page: number
      limit: number
      hasNext: boolean
      hasPrev: boolean
      total: number
    }
    filters?: Record<string, any>
    cache?: {
      hit: boolean
      key: string
      ttl: number
    }
    performance?: {
      response_time: number
      cache_time: number
      db_time: number
    }
  }
}

// Enhanced query builder with Redis caching
export class EnhancedSupabaseQueryBuilder {
  private supabase: any
  private cacheKey: string
  private useCache: boolean
  private cacheTTL: number

  constructor(supabase: any, cacheKey: string, useCache: boolean = true, cacheTTL: number = CACHE_TTL.MEDIUM) {
    this.supabase = supabase
    this.cacheKey = cacheKey
    this.useCache = useCache
    this.cacheTTL = cacheTTL
  }

  // Execute query with caching
  async execute<T = any>(): Promise<{ data: T | null; error: any; cacheHit: boolean }> {
    const startTime = Date.now()
    let cacheHit = false
    let cacheTime = 0
    let dbTime = 0

    try {
      // Try cache first
      if (this.useCache) {
        const cacheStartTime = Date.now()
        const cachedData = await cache.get<T>(this.cacheKey)
        cacheTime = Date.now() - cacheStartTime

        if (cachedData) {
          cacheHit = true
          return {
            data: cachedData,
            error: null,
            cacheHit
          }
        }
      }

      // Execute database query
      const dbStartTime = Date.now()
      const { data, error } = await this.supabase
      dbTime = Date.now() - dbStartTime

      if (error) {
        console.error('Database query error:', error)
        return { data: null, error, cacheHit }
      }

      // Cache the result
      if (this.useCache && data) {
        await cache.set(this.cacheKey, data, this.cacheTTL)
      }

      return {
        data,
        error: null,
        cacheHit
      }

    } catch (error) {
      console.error('Query execution error:', error)
      return { data: null, error, cacheHit }
    } finally {
      const totalTime = Date.now() - startTime
      console.log(`📊 Query ${this.cacheKey}: ${totalTime}ms (cache: ${cacheTime}ms, db: ${dbTime}ms, hit: ${cacheHit})`)
    }
  }

  // Chainable methods for query building
  select(columns: string) {
    this.supabase = this.supabase.select(columns)
    return this
  }

  from(table: string) {
    this.supabase = this.supabase.from(table)
    this.cacheKey = `${CACHE_KEYS.API_RESPONSE}${table}_${this.cacheKey}`
    return this
  }

  eq(column: string, value: any) {
    this.supabase = this.supabase.eq(column, value)
    this.cacheKey += `_eq_${column}_${value}`
    return this
  }

  ilike(column: string, value: string) {
    this.supabase = this.supabase.ilike(column, value)
    this.cacheKey += `_ilike_${column}_${value}`
    return this
  }

  gte(column: string, value: any) {
    this.supabase = this.supabase.gte(column, value)
    this.cacheKey += `_gte_${column}_${value}`
    return this
  }

  lte(column: string, value: any) {
    this.supabase = this.supabase.lte(column, value)
    this.cacheKey += `_lte_${column}_${value}`
    return this
  }

  order(column: string, options: { ascending?: boolean } = {}) {
    this.supabase = this.supabase.order(column, options)
    this.cacheKey += `_order_${column}_${options.ascending ? 'asc' : 'desc'}`
    return this
  }

  range(from: number, to: number) {
    this.supabase = this.supabase.range(from, to)
    this.cacheKey += `_range_${from}_${to}`
    return this
  }

  limit(count: number) {
    this.supabase = this.supabase.limit(count)
    this.cacheKey += `_limit_${count}`
    return this
  }

  single() {
    this.supabase = this.supabase.single()
    this.cacheKey += '_single'
    return this
  }

  maybeSingle() {
    this.supabase = this.supabase.maybeSingle()
    this.cacheKey += '_maybeSingle'
    return this
  }
}

// Enhanced API response creator
export function createEnhancedApiResponse<T>(
  success: boolean,
  data?: T,
  error?: string,
  details?: string,
  meta?: any
): EnhancedApiResponse<T> {
  return {
    success,
    data,
    error,
    details,
    meta: {
      fetchedAt: new Date().toISOString(),
      ...meta
    }
  }
}

// Enhanced cached API handler
export async function withCache<T>(
  cacheKey: string,
  fetchFn: () => Promise<T>,
  ttl: number = CACHE_TTL.MEDIUM,
  useCache: boolean = true
): Promise<{ data: T; cacheHit: boolean; responseTime: number }> {
  const startTime = Date.now()
  let cacheHit = false

  try {
    if (useCache) {
      const cachedData = await cache.get<T>(cacheKey)
      if (cachedData) {
        cacheHit = true
        return {
          data: cachedData,
          cacheHit,
          responseTime: Date.now() - startTime
        }
      }
    }

    const data = await fetchFn()
    
    if (useCache) {
      await cache.set(cacheKey, data, ttl)
    }

    return {
      data,
      cacheHit,
      responseTime: Date.now() - startTime
    }

  } catch (error) {
    console.error('Cache wrapper error:', error)
    throw error
  }
}

// Batch cache operations
export class BatchCacheOperations {
  // Cache multiple items at once
  static async setBatch<T extends Record<string, any>>(
    items: T,
    baseKey: string,
    ttl: number = CACHE_TTL.MEDIUM
  ): Promise<void> {
    const promises = Object.entries(items).map(([key, value]) =>
      cache.set(`${baseKey}:${key}`, value, ttl)
    )
    await Promise.all(promises)
    console.log(`💾 Batch cached ${Object.keys(items).length} items`)
  }

  // Get multiple items at once
  static async getBatch<T extends Record<string, any>>(
    keys: string[],
    baseKey: string
  ): Promise<{ [K in keyof T]: T[K] | null }> {
    const promises = keys.map(key =>
      cache.get<T[keyof T]>(`${baseKey}:${key}`)
    )
    const results = await Promise.all(promises)
    
    const result = {} as any
    keys.forEach((key, index) => {
      result[key] = results[index]
    })
    
    return result
  }

  // Delete multiple items at once
  static async deleteBatch(
    keys: string[],
    baseKey: string
  ): Promise<void> {
    const promises = keys.map(key =>
      cache.del(`${baseKey}:${key}`)
    )
    await Promise.all(promises)
    console.log(`🗑️ Batch deleted ${keys.length} items`)
  }
}

// Cache warming for common queries
export class CacheWarmer {
  // Warm product cache
  static async warmProducts() {
    const supabase = await createClient()
    const builder = new EnhancedSupabaseQueryBuilder(
      supabase,
      'products_warm',
      true,
      CACHE_TTL.LONG
    )

    const { data } = await builder
      .from('products')
      .select('id, name, slug, price, image_url, category_id')
      .eq('is_active', true)
      .order('display_order')
      .limit(50)
      .execute()

    if (data) {
      console.log('🔥 Warmed product cache with', data.length, 'items')
    }
  }

  // Warm dashboard cache
  static async warmDashboard() {
    const supabase = await createClient()
    const builder = new EnhancedSupabaseQueryBuilder(
      supabase,
      'dashboard_warm',
      true,
      CACHE_TTL.MEDIUM
    )

    const { data } = await builder
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .execute()

    if (data) {
      console.log('🔥 Warmed dashboard cache')
    }
  }

  // Warm common cache data
  static async warmAll() {
    console.log('🔥 Starting cache warming...')
    await Promise.all([
      this.warmProducts(),
      this.warmDashboard()
    ])
    console.log('✅ Cache warming completed')
  }
}

// Performance monitoring for cache
export class CacheMonitor {
  // Get cache performance metrics
  static async getMetrics() {
    const stats = await getCacheStats()
    return {
      ...stats,
      timestamp: new Date().toISOString()
    }
  }

  // Log cache performance
  static logPerformance(operation: string, responseTime: number, cacheHit: boolean) {
    const logData = {
      operation,
      responseTime,
      cacheHit,
      timestamp: new Date().toISOString()
    }
    
    console.log('📊 Cache Performance:', logData)
    
    // In production, you might want to send this to a monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Send to monitoring service
    }
  }
}

// Export enhanced utilities
export {
  EnhancedSupabaseQueryBuilder as SupabaseQueryBuilder,
  createEnhancedApiResponse as createApiResponse,
  withCache as withEnhancedCache,
  BatchCacheOperations as EnhancedBatchCacheOperations,
  CacheWarmer as EnhancedCacheWarmer,
  CacheMonitor as EnhancedCacheMonitor
}
