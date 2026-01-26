/**
 * Rate limiting middleware for API protection
 * Prevents abuse and DDoS attacks
 */

import { NextRequest, NextResponse } from 'next/server'

interface RateLimitStore {
  count: number
  resetTime: number
}

// In-memory store for rate limiting (in production, use Redis)
const rateLimitStore = new Map<string, RateLimitStore>()

// Rate limit configurations
const RATE_LIMITS = {
  // General API endpoints (more restrictive for testing)
  default: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 10, // 10 requests per 15 minutes (reduced from 100)
  },
  // Authentication endpoints (more restrictive)
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 requests per 15 minutes (reduced from 20)
  },
  // Admin endpoints (very restrictive)
  admin: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 requests per 15 minutes (reduced from 50)
  },
  // Public endpoints (more restrictive for testing)
  public: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 15, // 15 requests per 15 minutes (reduced from 200)
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
 * Clean up expired entries from rate limit store
 */
function cleanupExpiredEntries() {
  const now = Date.now()
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}

/**
 * Rate limiting middleware
 */
export function rateLimitMiddleware(request: NextRequest): NextResponse | null {
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

  // Clean up expired entries periodically
  if (Math.random() < 0.01) { // 1% chance to clean up
    cleanupExpiredEntries()
  }

  // Get current rate limit data
  let rateLimitData = rateLimitStore.get(clientId)
  
  if (!rateLimitData || now > rateLimitData.resetTime) {
    // Create new rate limit entry or reset expired one
    rateLimitData = {
      count: 1,
      resetTime: now + config.windowMs,
    }
    rateLimitStore.set(clientId, rateLimitData)
  } else {
    // Increment request count
    rateLimitData.count++
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
}

/**
 * Custom rate limit hook for specific endpoints
 */
export function createRateLimiter(windowMs: number, maxRequests: number) {
  const store = new Map<string, RateLimitStore>()

  return (request: NextRequest): { allowed: boolean; resetTime?: number } => {
    const clientId = getClientId(request)
    const now = Date.now()

    let rateLimitData = store.get(clientId)

    if (!rateLimitData || now > rateLimitData.resetTime) {
      rateLimitData = {
        count: 1,
        resetTime: now + windowMs,
      }
      store.set(clientId, rateLimitData)
      return { allowed: true }
    }

    if (rateLimitData.count >= maxRequests) {
      return {
        allowed: false,
        resetTime: rateLimitData.resetTime,
      }
    }

    rateLimitData.count++
    return { allowed: true }
  }
}

/**
 * Rate limiting for specific actions (like password reset)
 */
export const actionRateLimiters = {
  passwordReset: createRateLimiter(60 * 60 * 1000, 3), // 3 attempts per hour
  emailVerification: createRateLimiter(15 * 60 * 1000, 5), // 5 attempts per 15 minutes
  contactForm: createRateLimiter(60 * 60 * 1000, 10), // 10 submissions per hour
  payment: createRateLimiter(60 * 60 * 1000, 20), // 20 payment attempts per hour
}
