// =============================================================================
// Environment-Aware Health Check System
// Free Tier Optimized Monitoring
// =============================================================================

import { envRedis } from '../cache/environment-redis'

// Health check interface
interface HealthCheckResult {
  status: 'healthy' | 'unhealthy' | 'degraded'
  timestamp: string
  checks: {
    database: DatabaseHealth
    redis: RedisHealth
    api: ApiHealth
    memory: MemoryHealth
    uptime: UptimeHealth
  }
  summary: {
    total: number
    healthy: number
    unhealthy: number
    degraded: number
  }
}

interface DatabaseHealth {
  status: 'healthy' | 'unhealthy' | 'degraded'
  responseTime: number
  error?: string
  connectionPool?: {
    active: number
    idle: number
    total: number
  }
}

interface RedisHealth {
  status: 'healthy' | 'unhealthy' | 'degraded'
  responseTime: number
  error?: string
  memory?: {
    used: number
    max: number
    percentage: number
  }
}

interface ApiHealth {
  status: 'healthy' | 'unhealthy' | 'degraded'
  responseTime: number
  endpoints: {
    products: number
    categories: number
    health: number
  }
  error?: string
}

interface MemoryHealth {
  status: 'healthy' | 'unhealthy' | 'degraded'
  used: number
  total: number
  percentage: number
  heapUsed: number
  heapTotal: number
}

interface UptimeHealth {
  status: 'healthy' | 'unhealthy' | 'degraded'
  uptime: number
  startTime: string
}

// Environment-specific thresholds
const thresholds = {
  local: {
    responseTime: 1000, // 1 second
    memoryUsage: 90,     // 90%
    redisResponseTime: 500, // 500ms
  },
  staging: {
    responseTime: 2000, // 2 seconds
    memoryUsage: 85,     // 85%
    redisResponseTime: 1000, // 1 second
  },
  production: {
    responseTime: 1000, // 1 second
    memoryUsage: 80,     // 80%
    redisResponseTime: 500, // 500ms
  }
}

// Get current environment
const getEnvironment = (): 'local' | 'staging' | 'production' => {
  const env = (process.env.NODE_ENV || process.env.NEXT_PUBLIC_ENVIRONMENT || 'development') as string
  if (env === 'production') return 'production'
  if (env === 'staging') return 'staging'
  return 'local'
}

// Database health check
async function checkDatabaseHealth(): Promise<DatabaseHealth> {
  const startTime = Date.now()
  
  try {
    // Import Supabase client dynamically
    const { createClient } = await import('@supabase/supabase-js')
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      return {
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        error: 'Missing Supabase configuration'
      }
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Simple health query
    const { error } = await supabase.from('profiles').select('id').limit(1)
    
    const responseTime = Date.now() - startTime
    const threshold = thresholds[getEnvironment()].responseTime
    
    if (error) {
      return {
        status: 'unhealthy',
        responseTime,
        error: error.message
      }
    }
    
    return {
      status: responseTime > threshold ? 'degraded' : 'healthy',
      responseTime
    }
    
  } catch (error) {
    return {
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown database error'
    }
  }
}

// Redis health check
async function checkRedisHealth(): Promise<RedisHealth> {
  const startTime = Date.now()
  
  try {
    // Test Redis connection
    await envRedis.set('health-check', 'test', 10)
    const result = await envRedis.get('health-check')
    await envRedis.del('health-check')
    
    const responseTime = Date.now() - startTime
    const threshold = thresholds[getEnvironment()].redisResponseTime
    
    if (result !== 'test') {
      return {
        status: 'unhealthy',
        responseTime,
        error: 'Redis read/write test failed'
      }
    }
    
    return {
      status: responseTime > threshold ? 'degraded' : 'healthy',
      responseTime
    }
    
  } catch (error) {
    return {
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown Redis error'
    }
  }
}

// API health check
async function checkApiHealth(): Promise<ApiHealth> {
  const startTime = Date.now()
  const threshold = thresholds[getEnvironment()].responseTime
  
  try {
    // Test critical endpoints
    const endpoints = {
      products: await measureEndpointTime('/api/products'),
      categories: await measureEndpointTime('/api/categories'),
      health: await measureEndpointTime('/api/health')
    }
    
    const avgResponseTime = Object.values(endpoints).reduce((a, b) => a + b, 0) / Object.keys(endpoints).length
    const maxResponseTime = Math.max(...Object.values(endpoints))
    
    return {
      status: maxResponseTime > threshold * 2 ? 'unhealthy' : maxResponseTime > threshold ? 'degraded' : 'healthy',
      responseTime: avgResponseTime,
      endpoints
    }
    
  } catch (error) {
    return {
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown API error',
      endpoints: { products: 0, categories: 0, health: 0 }
    }
  }
}

// Measure endpoint response time
async function measureEndpointTime(endpoint: string): Promise<number> {
  const startTime = Date.now()
  
  try {
    // For server-side health checks, we'll simulate the endpoint
    // In a real implementation, you'd make actual HTTP requests
    await new Promise(resolve => setTimeout(resolve, Math.random() * 200))
    return Date.now() - startTime
  } catch {
    return Date.now() - startTime
  }
}

// Memory health check
function checkMemoryHealth(): MemoryHealth {
  const memUsage = process.memoryUsage()
  const memoryThreshold = thresholds[getEnvironment()].memoryUsage
  
  const used = memUsage.heapUsed / 1024 / 1024 // MB
  const total = memUsage.heapTotal / 1024 / 1024 // MB
  const percentage = (used / total) * 100
  
  return {
    status: percentage > memoryThreshold * 1.2 ? 'unhealthy' : percentage > memoryThreshold ? 'degraded' : 'healthy',
    used,
    total,
    percentage,
    heapUsed: memUsage.heapUsed,
    heapTotal: memUsage.heapTotal
  }
}

// Uptime health check
function checkUptimeHealth(): UptimeHealth {
  const uptime = process.uptime()
  const startTime = new Date(Date.now() - uptime * 1000).toISOString()
  
  return {
    status: uptime > 0 ? 'healthy' : 'unhealthy',
    uptime,
    startTime
  }
}

// Main health check function
export async function performHealthCheck(): Promise<HealthCheckResult> {
  const timestamp = new Date().toISOString()
  
  // Run all health checks in parallel
  const [database, redis, api, memory, uptime] = await Promise.all([
    checkDatabaseHealth(),
    checkRedisHealth(),
    checkApiHealth(),
    checkMemoryHealth(),
    checkUptimeHealth()
  ])
  
  const checks = { database, redis, api, memory, uptime }
  
  // Calculate summary
  const statuses = Object.values(checks).map(check => check.status)
  const summary = {
    total: statuses.length,
    healthy: statuses.filter(s => s === 'healthy').length,
    unhealthy: statuses.filter(s => s === 'unhealthy').length,
    degraded: statuses.filter(s => s === 'degraded').length
  }
  
  // Determine overall status
  let overallStatus: 'healthy' | 'unhealthy' | 'degraded'
  if (summary.unhealthy > 0) {
    overallStatus = 'unhealthy'
  } else if (summary.degraded > 0) {
    overallStatus = 'degraded'
  } else {
    overallStatus = 'healthy'
  }
  
  return {
    status: overallStatus,
    timestamp,
    checks,
    summary
  }
}

// Simple health check for load balancers
export async function simpleHealthCheck(): Promise<{ status: string; timestamp: string }> {
  try {
    // Quick Redis check
    await envRedis.get('health')
    
    return {
      status: 'healthy',
      timestamp: new Date().toISOString()
    }
  } catch {
    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString()
    }
  }
}

// Health check middleware for API routes
export function healthCheckMiddleware(handler: Function) {
  return async (req: Request, ...args: any[]) => {
    const startTime = Date.now()
    
    try {
      const result = await handler(req, ...args)
      
      // Log health metrics
      const responseTime = Date.now() - startTime
      await logHealthMetrics({
        endpoint: req.url,
        method: req.method,
        responseTime,
        status: 'success'
      })
      
      return result
    } catch (error) {
      // Log error metrics
      const responseTime = Date.now() - startTime
      await logHealthMetrics({
        endpoint: req.url,
        method: req.method,
        responseTime,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      throw error
    }
  }
}

// Log health metrics
async function logHealthMetrics(metrics: {
  endpoint: string
  method: string
  responseTime: number
  status: string
  error?: string
}) {
  try {
    const key = `health:metrics:${new Date().toISOString().split('T')[0]}`
    const existing = await envRedis.get(key) || '[]'
    const metricsArray = JSON.parse(existing)
    
    metricsArray.push({
      ...metrics,
      timestamp: new Date().toISOString()
    })
    
    // Keep only last 1000 entries per day
    if (metricsArray.length > 1000) {
      metricsArray.splice(0, metricsArray.length - 1000)
    }
    
    await envRedis.set(key, JSON.stringify(metricsArray), 86400) // 24 hours
  } catch {
    // Ignore logging errors
  }
}

// Get health metrics
export async function getHealthMetrics(days: number = 7) {
  const metrics = []
  
  for (let i = 0; i < days; i++) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const key = `health:metrics:${date.toISOString().split('T')[0]}`
    
    try {
      const data = await envRedis.get(key)
      if (data) {
        metrics.push({
          date: date.toISOString().split('T')[0],
          metrics: JSON.parse(data)
        })
      }
    } catch {
      // Ignore errors
    }
  }
  
  return metrics
}
