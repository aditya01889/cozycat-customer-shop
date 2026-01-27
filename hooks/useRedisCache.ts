import { useState, useEffect, useCallback } from 'react'

interface CacheState<T> {
  data: T | null
  loading: boolean
  error: string | null
  cached: boolean
}

interface UseCacheOptions {
  ttl?: number
  revalidateOnFocus?: boolean
  revalidateOnReconnect?: boolean
}

export function useRedisCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: UseCacheOptions = {}
) {
  const [state, setState] = useState<CacheState<T>>({
    data: null,
    loading: true,
    error: null,
    cached: false
  })

  const { ttl, revalidateOnFocus = true, revalidateOnReconnect = true } = options

  const fetchData = useCallback(async (forceRefresh = false) => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const response = await fetch(`/api/cache/${key}${forceRefresh ? '?refresh=true' : ''}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success) {
        setState({
          data: result.data,
          loading: false,
          error: null,
          cached: result.cached || false
        })
      } else {
        throw new Error(result.error || 'Failed to fetch data')
      }
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        cached: false
      })
    }
  }, [key])

  // Initial fetch
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Revalidate on window focus
  useEffect(() => {
    if (!revalidateOnFocus) return

    const handleFocus = () => {
      fetchData()
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [fetchData, revalidateOnFocus])

  // Revalidate on reconnect
  useEffect(() => {
    if (!revalidateOnReconnect) return

    const handleOnline = () => {
      fetchData()
    }

    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [fetchData, revalidateOnReconnect])

  const refetch = useCallback(() => {
    fetchData(true)
  }, [fetchData])

  const clearCache = useCallback(async () => {
    try {
      await fetch(`/api/cache/${key}`, { method: 'DELETE' })
      setState(prev => ({ ...prev, cached: false }))
    } catch (error) {
      console.error('Failed to clear cache:', error)
    }
  }, [key])

  return {
    ...state,
    refetch,
    clearCache
  }
}

// Hook for cached products
export function useCachedProducts(params?: {
  category?: string
  search?: string
  limit?: number
  offset?: number
}) {
  const queryString = new URLSearchParams(params as any).toString()
  const key = `products${queryString ? `:${queryString}` : ''}`

  return useRedisCache(
    key,
    async () => {
      const response = await fetch(`/api/products/redis?${queryString}`)
      if (!response.ok) throw new Error('Failed to fetch products')
      const result = await response.json()
      return result.data
    },
    { ttl: 3600 } // 1 hour
  )
}

// Hook for cached analytics
export function useCachedAnalytics(type: string = 'orders', period: string = 'week') {
  const key = `analytics:${type}:${period}`

  return useRedisCache(
    key,
    async () => {
      const response = await fetch(`/api/admin/analytics/cached?type=${type}&period=${period}`)
      if (!response.ok) throw new Error('Failed to fetch analytics')
      const result = await response.json()
      return result.data
    },
    { ttl: 1800 } // 30 minutes
  )
}
