import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isRedisConnected, getCacheStats } from '@/lib/cache/redis-client'
import { getRedisRateLimitStats } from '@/lib/middleware/redis-rate-limiter'

interface HealthCheck {
  status: 'healthy' | 'unhealthy' | 'degraded'
  timestamp: string
  uptime: number
  version: string
  environment: string
  services: {
    database: ServiceStatus
    redis: ServiceStatus
    api: ServiceStatus
  }
  metrics: {
    memory: MemoryMetrics
    cache: CacheMetrics
    rateLimits: RateLimitMetrics
  }
}

interface ServiceStatus {
  status: 'healthy' | 'unhealthy' | 'degraded'
  responseTime?: number
  error?: string
  lastCheck: string
}

interface MemoryMetrics {
  used: number
  total: number
  percentage: number
}

interface CacheMetrics {
  connected: boolean
  type: 'redis' | 'fallback' | 'error'
  keys?: number
  memory?: string
}

interface RateLimitMetrics {
  connected: boolean
  totalKeys?: number
  apiRateLimits?: number
  customRateLimits?: number
}

export async function GET() {
  const startTime = Date.now()
  const startTimeHighRes = performance.now()
  
  try {
    // Get environment info
    const environment = process.env.NODE_ENV || 'development'
    const version = process.env.npm_package_version || '1.0.0'
    const uptime = process.uptime()
    
    // Check database health
    const databaseStatus = await checkDatabaseHealth()
    
    // Check Redis health
    const redisStatus = await checkRedisHealth()
    
    // Get memory metrics
    const memoryMetrics = getMemoryMetrics()
    
    // Get cache metrics
    const cacheMetrics = await getCacheMetrics()
    
    // Get rate limit metrics
    const rateLimitMetrics = await getRateLimitMetrics()
    
    // Determine overall health
    const overallStatus = determineOverallStatus([
      databaseStatus.status,
      redisStatus.status
    ])
    
    const responseTime = performance.now() - startTimeHighRes
    
    const healthCheck: HealthCheck = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: Math.floor(uptime),
      version,
      environment,
      services: {
        database: databaseStatus,
        redis: redisStatus,
        api: {
          status: 'healthy',
          responseTime: Math.round(responseTime * 100) / 100,
          lastCheck: new Date().toISOString()
        }
      },
      metrics: {
        memory: memoryMetrics,
        cache: cacheMetrics,
        rateLimits: rateLimitMetrics
      }
    }
    
    // Return appropriate HTTP status based on health
    const statusCode = overallStatus === 'healthy' ? 200 : 
                      overallStatus === 'degraded' ? 200 : 503
    
    return NextResponse.json(healthCheck, {
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
    
  } catch (error) {
    console.error('Health check failed:', error)
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      services: {
        database: { status: 'unhealthy', error: 'Health check failed' },
        redis: { status: 'unhealthy', error: 'Health check failed' },
        api: { status: 'unhealthy', error: 'Health check failed' }
      }
    }, { status: 503 })
  }
}

async function checkDatabaseHealth(): Promise<ServiceStatus> {
  const startTime = performance.now()
  
  try {
    const supabase = await createClient()
    
    // Simple health check query
    const { error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)
    
    const responseTime = performance.now() - startTime
    
    if (error) {
      return {
        status: 'unhealthy',
        responseTime: Math.round(responseTime * 100) / 100,
        error: error.message,
        lastCheck: new Date().toISOString()
      }
    }
    
    return {
      status: responseTime > 1000 ? 'degraded' : 'healthy',
      responseTime: Math.round(responseTime * 100) / 100,
      lastCheck: new Date().toISOString()
    }
    
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown database error',
      lastCheck: new Date().toISOString()
    }
  }
}

async function checkRedisHealth(): Promise<ServiceStatus> {
  const startTime = performance.now()
  
  try {
    if (!isRedisConnected()) {
      return {
        status: 'degraded',
        error: 'Redis not connected, using fallback cache',
        lastCheck: new Date().toISOString()
      }
    }
    
    // Test Redis with a simple operation
    const stats = await getCacheStats()
    const responseTime = performance.now() - startTime
    
    if (stats.connected) {
      return {
        status: responseTime > 500 ? 'degraded' : 'healthy',
        responseTime: Math.round(responseTime * 100) / 100,
        lastCheck: new Date().toISOString()
      }
    } else {
      return {
        status: 'unhealthy',
        error: 'Redis connection failed',
        lastCheck: new Date().toISOString()
      }
    }
    
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown Redis error',
      lastCheck: new Date().toISOString()
    }
  }
}

function getMemoryMetrics(): MemoryMetrics {
  const memUsage = process.memoryUsage()
  const totalMemory = memUsage.heapTotal
  const usedMemory = memUsage.heapUsed
  
  return {
    used: Math.round(usedMemory / 1024 / 1024), // MB
    total: Math.round(totalMemory / 1024 / 1024), // MB
    percentage: Math.round((usedMemory / totalMemory) * 100)
  }
}

async function getCacheMetrics(): Promise<CacheMetrics> {
  try {
    const stats = await getCacheStats()
    
    return {
      connected: stats.connected,
      type: stats.type,
      keys: stats.type === 'fallback' ? stats.size : undefined,
      memory: stats.memory
    }
  } catch (error) {
    return {
      connected: false,
      type: 'error'
    }
  }
}

async function getRateLimitMetrics(): Promise<RateLimitMetrics> {
  try {
    const stats = await getRedisRateLimitStats()
    
    return {
      connected: stats.redisConnected,
      totalKeys: stats.totalRateLimitKeys,
      apiRateLimits: stats.apiRateLimits,
      customRateLimits: stats.customRateLimits
    }
  } catch (error) {
    return {
      connected: false
    }
  }
}

function determineOverallStatus(statuses: string[]): 'healthy' | 'unhealthy' | 'degraded' {
  if (statuses.includes('unhealthy')) {
    return 'unhealthy'
  }
  if (statuses.includes('degraded')) {
    return 'degraded'
  }
  return 'healthy'
}
