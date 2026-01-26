/**
 * Secure API handler template
 * Combines rate limiting, CSRF protection, input validation, and error handling
 */

import { NextRequest, NextResponse } from 'next/server'
import { validateInput } from '../validation/schemas'
import { requireCSRFProtection } from '../security/csrf'
import { actionRateLimiters } from '../middleware/rate-limiter'

/**
 * Create a secure API handler with built-in protections
 */
export function createSecureHandler<T = any>(config: {
  // Validation schema for request body/query
  schema?: any
  // Rate limiter for specific actions
  rateLimiter?: (req: NextRequest) => { allowed: boolean; resetTime?: number }
  // Whether to require CSRF protection (default: true for POST/PUT/DELETE)
  requireCSRF?: boolean
  // Custom handler function
  handler: (req: NextRequest, data: T) => Promise<NextResponse>
  // Optional pre-handler checks
  preCheck?: (req: NextRequest) => Promise<{ allowed: boolean; error?: string }>
}) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      // Pre-check validation
      if (config.preCheck) {
        const preCheckResult = await config.preCheck(req)
        if (!preCheckResult.allowed) {
          return NextResponse.json(
            { error: preCheckResult.error || 'Pre-check failed' },
            { status: 403 }
          )
        }
      }

      // Rate limiting
      if (config.rateLimiter) {
        const rateLimitResult = config.rateLimiter(req as any)
        if (!rateLimitResult.allowed) {
          return NextResponse.json(
            {
              error: 'Rate limit exceeded',
              message: `Try again later`,
              resetTime: rateLimitResult.resetTime,
            },
            { status: 429 }
          )
        }
      }

      // CSRF protection (skip for GET requests)
      const shouldRequireCSRF = config.requireCSRF !== false && req.method !== 'GET'
      if (shouldRequireCSRF) {
        const { validateCSRFToken } = await import('../security/csrf')
        const isValidCSRF = await validateCSRFToken(req)
        
        if (!isValidCSRF) {
          return NextResponse.json(
            { error: 'CSRF token validation failed' },
            { status: 403 }
          )
        }
      }

      // Parse and validate request data
      let requestData: T
      
      if (config.schema) {
        let rawData: any
        
        if (req.method === 'GET') {
          // Parse query parameters for GET requests
          const { searchParams } = new URL(req.url)
          rawData = Object.fromEntries(searchParams.entries())
        } else {
          // Parse body for POST/PUT/DELETE requests
          try {
            rawData = await req.json()
          } catch {
            return NextResponse.json(
              { error: 'Invalid JSON in request body' },
              { status: 400 }
            )
          }
        }

        // Validate input
        const validationResult = validateInput(config.schema, rawData)
        if (!validationResult.success) {
          return NextResponse.json(
            { 
              error: 'Validation failed',
              details: validationResult.error 
            },
            { status: 400 }
          )
        }

        requestData = validationResult.data as T
      } else {
        requestData = {} as T
      }

      // Execute the main handler
      const response = await config.handler(req, requestData)
      
      return response

    } catch (error) {
      console.error('API Handler Error:', error)
      
      // Don't expose internal error details in production
      const isDevelopment = process.env.NODE_ENV === 'development'
      
      return NextResponse.json(
        {
          error: 'Internal server error',
          ...(isDevelopment && { 
            details: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined 
          }),
        },
        { status: 500 }
      )
    }
  }
}

/**
 * Common pre-check functions
 */
export const preChecks = {
  // Check if user is authenticated
  requireAuth: async (req: NextRequest) => {
    const { createClient } = await import('../supabase/server')
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { allowed: false, error: 'Authentication required' }
    }
    
    return { allowed: true }
  },

  // Check if user has admin role
  requireAdmin: async (req: NextRequest) => {
    const { createClient } = await import('../supabase/server')
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { allowed: false, error: 'Authentication required' }
    }
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (!profile || (profile as any).role !== 'admin') {
      return { allowed: false, error: 'Admin access required' }
    }
    
    return { allowed: true }
  },

  // Check if user has operations role
  requireOperations: async (req: NextRequest) => {
    const { createClient } = await import('../supabase/server')
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { allowed: false, error: 'Authentication required' }
    }
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (!profile || !['admin', 'operations'].includes((profile as any).role)) {
      return { allowed: false, error: 'Operations access required' }
    }
    
    return { allowed: true }
  },
}

/**
 * Example usage:
 * 
 * export const POST = createSecureHandler({
 *   schema: contactFormSchema,
 *   rateLimiter: actionRateLimiters.contactForm,
 *   handler: async (req, data) => {
 *     // Your API logic here
 *     return NextResponse.json({ success: true })
 *   }
 * })
 * 
 * export const GET = createSecureHandler({
 *   schema: productQuerySchema,
 *   preCheck: preChecks.requireAuth,
 *   handler: async (req, data) => {
 *     // Your API logic here
 *     return NextResponse.json({ products: [] })
 *   }
 * })
 */
