/**
 * Next.js Proxy for security and request handling
 * Applies rate limiting, security headers, and request validation
 */

import { NextRequest, NextResponse } from 'next/server'
import { rateLimitMiddleware } from './lib/middleware/rate-limiter'

/**
 * Main proxy function
 */
export function proxy(request: NextRequest) {
  // Apply rate limiting to API routes first
  const rateLimitResponse = rateLimitMiddleware(request)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  const response = NextResponse.next()

  // Add security headers
  addSecurityHeaders(response)

  // Handle CORS for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    handleCors(request, response)
  }

  // Redirect www to non-www
  if (request.headers.get('host')?.startsWith('www.')) {
    const url = request.nextUrl.clone()
    url.hostname = url.hostname.replace('www.', '')
    return NextResponse.redirect(url, 301)
  }

  return response
}

/**
 * Add security headers to response
 */
function addSecurityHeaders(response: NextResponse) {
  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY')
  
  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff')
  
  // Control referrer information
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin')
  
  // Restrict browser features
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  )
  
  // Content Security Policy (CSP)
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://checkout.razorpay.com https://api.razorpay.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https: blob:",
      "font-src 'self' data:",
      "connect-src 'self' https://xfnbhheapralprcwjvzl.supabase.co wss://xfnbhheapralprcwjvzl.supabase.co https://api.razorpay.com",
      "frame-src https://checkout.razorpay.com",
    ].join('; ')
  )
  
  // HSTS (HTTPS only in production)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    )
  }
}

/**
 * Handle CORS for API routes
 */
function handleCors(request: NextRequest, response: NextResponse) {
  const origin = request.headers.get('origin')
  
  // Allowed origins (update with your actual domains)
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://your-domain.vercel.app',
    'https://your-custom-domain.com',
  ]
  
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
    response.headers.set('Access-Control-Max-Age', '86400')
  }
  
  // Set allowed origin
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
  } else if (!origin) {
    // Allow same-origin requests
    response.headers.set('Access-Control-Allow-Origin', '*')
  }
  
  // Allow credentials
  response.headers.set('Access-Control-Allow-Credentials', 'true')
}

/**
 * Configure proxy matching
 */
export const config = {
  /*
   * Match all request paths except for the ones starting with:
   * - _next/static (static files)
   * - _next/image (image optimization files)
   * - favicon.ico (favicon file)
   * - public folder
   */
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
