/**
 * Redis-based rate limiting middleware for production scalability
 * Provides distributed rate limiting across multiple server instances
 */

import { NextRequest, NextResponse } from 'next/server'
import { cache } from '@/lib/cache/redis-client'

interface RedisRateLimitStore {
  count: number
  resetTime: number
}

// Rate limit configurations (same as in-memory version)
const RATE_LIMITS = {
  default: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100, // 100 requests per 15 minutes
  },
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 20, // 20 requests per 15 minutes
  },
  admin: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 50, // 50 requests per 15 minutes
  },
  public: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 200, // 200 requests per 15 minutes
  },
}

/**
 * Get client identifier from request
 */
function getClientId(request: NextRequest): string {
  // Try to get IP from various headers
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const ip = forwardedFor?.split(',')[0] || realIp || 'unknown'
  
  // Add user agent for better fingerprinting
  const userAgent = request.headers.get('user-agent') || 'unknown'
  
  // Create a hash from IP and user agent
  return Buffer.from(`${ip}:${userAgent}`).toString('base64')
}

/**
 * Get rate limit configuration based on request path
 */
function getRateLimitConfig(pathname: string) {
  if (pathname.startsWith('/api/auth') || pathname.startsWith('/auth')) {
    return RATE_LIMITS.auth
  }
  if (pathname.startsWith('/api/admin')) {
    return RATE_LIMITS.admin
  }
  if (pathname.startsWith('/api/public') || pathname.includes('/products') || pathname.includes('/categories')) {
    return RATE_LIMITS.public
  }
  return RATE_LIMITS.default
}

/**
 * Redis-based rate limiting middleware
 */
export async function redisRateLimitMiddleware(request: NextRequest): Promise<NextResponse | null> {
  const pathname = request.nextUrl.pathname
  
  // Skip rate limiting for static assets and non-API routes
  if (!pathname.startsWith('/api/') || 
      pathname.startsWith('/api/_next') || 
      pathname.startsWith('/api/static')) {
    return null
  }

  const config = getRateLimitConfig(pathname)
  const clientId = getClientId(request)
  const now = Date.now()
  const key = `rate_limit:${pathname}:${clientId}`
  const ttl = Math.ceil(config.windowMs / 1000)

  try {
    // Get current rate limit data from Redis
    const currentData = await cache.get<RedisRateLimitStore>(key)
    
    let rateLimitData: RedisRateLimitStore
    
    if (!currentData || now > currentData.resetTime) {
      // Create new rate limit entry or reset expired one
      rateLimitData = {
        count: 1,
        resetTime: now + config.windowMs,
      }
      await cache.set(key, rateLimitData, ttl)
    } else {
      // Increment request count
      rateLimitData = {
        ...currentData,
        count: currentData.count + 1
      }
      await cache.set(key, rateLimitData, ttl)
    }

    // Calculate remaining requests and reset time
    const remainingRequests = Math.max(0, config.maxRequests - rateLimitData.count)
    const resetTimeSeconds = Math.ceil((rateLimitData.resetTime - now) / 1000)

    // Check if rate limit exceeded
    if (rateLimitData.count > config.maxRequests) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: `Too many requests. Try again in ${resetTimeSeconds} seconds.`,
          retryAfter: resetTimeSeconds,
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': config.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitData.resetTime.toString(),
            'Retry-After': resetTimeSeconds.toString(),
          },
        }
      )
    }

    // Add rate limit headers to successful requests
    const response = NextResponse.next()
    response.headers.set('X-RateLimit-Limit', config.maxRequests.toString())
    response.headers.set('X-RateLimit-Remaining', remainingRequests.toString())
    response.headers.set('X-RateLimit-Reset', rateLimitData.resetTime.toString())

    return response

  } catch (error) {
    console.error('Redis rate limiting error:', error)
    
    // Fallback to in-memory rate limiting if Redis fails
    console.warn('Falling back to in-memory rate limiting')
    return null // Let the in-memory middleware handle it
  }
}

/**
 * Custom Redis rate limiter for specific endpoints
 */
export function createRedisRateLimiter(windowMs: number, maxRequests: number) {
  return async (request: NextRequest): Promise<{ allowed: boolean; resetTime?: number }> => {
    const clientId = getClientId(request)
    const now = Date.now()
    const key = `custom_rate_limit:${clientId}`
    const ttl = Math.ceil(windowMs / 1000)

    try {
      let rateLimitData = await cache.get<RedisRateLimitStore>(key)

      if (!rateLimitData || now > rateLimitData.resetTime) {
        rateLimitData = {
          count: 1,
          resetTime: now + windowMs,
        }
        await cache.set(key, rateLimitData, ttl)
        return { allowed: true }
      }

      if (rateLimitData.count >= maxRequests) {
        return {
          allowed: false,
          resetTime: rateLimitData.resetTime,
        }
      }

      rateLimitData.count++
      await cache.set(key, rateLimitData, ttl)
      return { allowed: true }

    } catch (error) {
      console.error('Redis custom rate limiter error:', error)
      // Fallback: allow the request
      return { allowed: true }
    }
  }
}

/**
 * Redis-based action rate limiters
 */
export const redisActionRateLimiters = {
  passwordReset: createRedisRateLimiter(60 * 60 * 1000, 3), // 3 attempts per hour
  emailVerification: createRedisRateLimiter(15 * 60 * 1000, 5), // 5 attempts per 15 minutes
  contactForm: createRedisRateLimiter(60 * 60 * 1000, 10), // 10 submissions per hour
  payment: createRedisRateLimiter(60 * 60 * 1000, 20), // 20 payment attempts per hour
}

/**
 * Get rate limit statistics from Redis
 */
export async function getRedisRateLimitStats() {
  try {
    const keys = await cache.keys('rate_limit:*')
    const customKeys = await cache.keys('custom_rate_limit:*')
    
    return {
      totalRateLimitKeys: keys.length + customKeys.length,
      apiRateLimits: keys.length,
      customRateLimits: customKeys.length,
      redisConnected: true
    }
  } catch (error) {
    console.error('Failed to get Redis rate limit stats:', error)
    return {
      redisConnected: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
