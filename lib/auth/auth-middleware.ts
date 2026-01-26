/**
 * Authentication Middleware for API Routes
 * Provides consistent authentication checks and session management
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sessionManager } from './session-manager'

export interface AuthContext {
  user: any
  session: any
  isAdmin: boolean
  isAuthenticated: boolean
}

export class AuthMiddleware {
  /**
   * Verify authentication for API routes
   */
  static async verifyAuth(request: NextRequest): Promise<AuthContext> {
    try {
      // Get session from server-side client
      const supabase = await createClient()
      const { data: { session }, error } = await supabase.auth.getSession()

      if (error) {
        console.error('Auth verification error:', error)
        return {
          user: null,
          session: null,
          isAdmin: false,
          isAuthenticated: false
        }
      }

      if (!session) {
        return {
          user: null,
          session: null,
          isAdmin: false,
          isAuthenticated: false
        }
      }

      // Check admin role
      let isAdmin = false
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()

        isAdmin = (profile as any)?.role === 'admin'
      } catch (error) {
        console.warn('Admin role check failed:', error)
      }

      return {
        user: session.user,
        session,
        isAdmin,
        isAuthenticated: true
      }
    } catch (error) {
      console.error('Auth middleware error:', error)
      return {
        user: null,
        session: null,
        isAdmin: false,
        isAuthenticated: false
      }
    }
  }

  /**
   * Require authentication for API routes
   */
  static async requireAuth(request: NextRequest): Promise<NextResponse | AuthContext> {
    const authContext = await this.verifyAuth(request)

    if (!authContext.isAuthenticated) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    return authContext
  }

  /**
   * Require admin role for API routes
   */
  static async requireAdmin(request: NextRequest): Promise<NextResponse | AuthContext> {
    const authContext = await this.verifyAuth(request)

    if (!authContext.isAuthenticated) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    if (!authContext.isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    return authContext
  }

  /**
   * Optional authentication (doesn't fail if not authenticated)
   */
  static async optionalAuth(request: NextRequest): Promise<AuthContext> {
    return this.verifyAuth(request)
  }
}

/**
 * Higher-order function for API route handlers with authentication
 */
export function withAuth<T extends any[]>(
  handler: (request: NextRequest, context: AuthContext, ...args: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    const authResult = await AuthMiddleware.requireAuth(request)
    
    if (authResult instanceof NextResponse) {
      return authResult
    }

    return handler(request, authResult, ...args)
  }
}

/**
 * Higher-order function for API route handlers with admin authentication
 */
export function withAdminAuth<T extends any[]>(
  handler: (request: NextRequest, context: AuthContext, ...args: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    const authResult = await AuthMiddleware.requireAdmin(request)
    
    if (authResult instanceof NextResponse) {
      return authResult
    }

    return handler(request, authResult, ...args)
  }
}

/**
 * Higher-order function for API route handlers with optional authentication
 */
export function withOptionalAuth<T extends any[]>(
  handler: (request: NextRequest, context: AuthContext, ...args: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    const authContext = await AuthMiddleware.optionalAuth(request)
    return handler(request, authContext, ...args)
  }
}
