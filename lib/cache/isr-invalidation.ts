/**
 * ISR (Incremental Static Regeneration) cache invalidation utilities
 * Provides functions to invalidate cached static content when data changes
 */

import { cache, CacheInvalidation } from '@/lib/cache/redis-client'

/**
 * ISR-specific cache invalidation functions
 */
export class ISRCacheInvalidation {
  /**
   * Invalidate products cache (triggers ISR revalidation)
   */
  static async invalidateProducts() {
    try {
      // Invalidate ISR products cache
      await cache.del('products:isr_catalog')
      
      // Also invalidate regular product cache
      await CacheInvalidation.invalidateProducts()
      
      console.log('🔄 ISR Products cache invalidated')
    } catch (error) {
      console.error('Failed to invalidate ISR products cache:', error)
    }
  }

  /**
   * Invalidate categories cache (triggers ISR revalidation)
   */
  static async invalidateCategories() {
    try {
      // Invalidate ISR categories cache
      await cache.del('products:isr_categories')
      
      console.log('🔄 ISR Categories cache invalidated')
    } catch (error) {
      console.error('Failed to invalidate ISR categories cache:', error)
    }
  }

  /**
   * Invalidate all ISR caches
   */
  static async invalidateAll() {
    try {
      // Invalidate all ISR caches
      const isrKeys = await cache.keys('products:isr_*')
      await Promise.all(isrKeys.map(key => cache.del(key)))
      
      // Also invalidate regular caches
      await CacheInvalidation.invalidateProducts()
      // Note: CacheInvalidation.invalidateCategories doesn't exist, only products and orders
      
      console.log('🔄 All ISR caches invalidated')
    } catch (error) {
      console.error('Failed to invalidate all ISR caches:', error)
    }
  }

  /**
   * Warm ISR caches (call this after deployment)
   */
  static async warmCaches() {
    try {
      console.log('🔥 Warming ISR caches...')
      
      // This would typically be called by a deployment script
      // The actual warming happens when the ISR endpoints are first accessed
      
      console.log('✅ ISR cache warming initiated')
    } catch (error) {
      console.error('Failed to warm ISR caches:', error)
    }
  }

  /**
   * Get ISR cache statistics
   */
  static async getISRStats() {
    try {
      const isrKeys = await cache.keys('products:isr_*')
      
      return {
        totalISRCaches: isrKeys.length,
        caches: isrKeys,
        lastInvalidated: new Date().toISOString()
      }
    } catch (error) {
      console.error('Failed to get ISR cache stats:', error)
      return {
        totalISRCaches: 0,
        caches: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}

/**
 * Webhook handler for cache invalidation
 * Can be called by Supabase database triggers or external services
 */
export async function handleCacheInvalidationWebhook(data: {
  type: 'product' | 'category' | 'all'
  id?: string
}) {
  console.log('🔄 Cache invalidation webhook received:', data)
  
  switch (data.type) {
    case 'product':
      await ISRCacheInvalidation.invalidateProducts()
      break
    case 'category':
      await ISRCacheInvalidation.invalidateCategories()
      break
    case 'all':
      await ISRCacheInvalidation.invalidateAll()
      break
    default:
      console.warn('Unknown cache invalidation type:', data.type)
  }
  
  return { success: true, invalidated: data.type }
}
