/**
 * Authentication Middleware for API Routes
 * Provides consistent authentication checks and session management
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { getSupabaseConfig } from '@/lib/env-validation'
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
      // CI dummy mode: avoid external Supabase calls and allow deterministic auth.
      // This is only intended for CI/test environments.
      if (process.env.CI_DUMMY_ENV === '1' || process.env.CI_DUMMY_ENV === 'true') {
        const ciUser = request.headers.get('x-ci-user')

        if (!ciUser) {
          return {
            user: null,
            session: null,
            isAdmin: false,
            isAuthenticated: false,
          }
        }

        const isAdmin = ciUser.toLowerCase() === 'admin'
        const user = {
          id: `ci-${ciUser.toLowerCase()}`,
          email: `${ciUser.toLowerCase()}@ci.local`,
        }

        return {
          user,
          session: { user },
          isAdmin,
          isAuthenticated: true,
        }
      }

      // Get session from server-side client
      const supabase = await createClient()
      
      // Check for Bearer token in headers first (client-side auth)
      const authHeader = request.headers.get('authorization')
      let session = null
      let error: any = null
      let user = null
      
      if (authHeader && authHeader.startsWith('Bearer ')) {
        // Use admin client to validate token
        const token = authHeader.substring(7)
        const { url, serviceRoleKey } = getSupabaseConfig()
        
        if (serviceRoleKey) {
          const supabaseAdmin = createSupabaseClient(url, serviceRoleKey, {
            auth: {
              autoRefreshToken: false,
              persistSession: false
            }
          })
          
          try {
            const { data: { user: tokenUser }, error: tokenError } = await supabaseAdmin.auth.getUser(token)
            user = tokenUser
            error = tokenError
            
            if (user && !error) {
              // Create a minimal session object for consistency
              session = { user }
              
              console.log('🔍 Auth verification - Token User:', {
                hasUser: !!user,
                userId: user?.id,
                userEmail: user?.email,
                error: (error as any)?.message
              })
            }
          } catch (tokenError) {
            error = tokenError as any
            console.log('🔍 Auth verification - Token Error:', tokenError)
          }
        }
      } else {
        // Fallback to server-side session
        const { data: { session: serverSession }, error: serverError } = await supabase.auth.getSession()
        session = serverSession
        user = serverSession?.user
        error = serverError
        
        console.log('🔍 Auth verification - Server Session:', {
          hasSession: !!session,
          userId: user?.id,
          userEmail: user?.email,
          error: error?.message
        })
      }

      if (error) {
        console.error('Auth verification error:', error)
        return {
          user: null,
          session: null,
          isAdmin: false,
          isAuthenticated: false
        }
      }

      if (!user) {
        console.log('🔍 No user found in auth verification')
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
        const { url, serviceRoleKey } = getSupabaseConfig()
        if (serviceRoleKey) {
          const supabaseAdmin = createSupabaseClient(url, serviceRoleKey, {
            auth: {
              autoRefreshToken: false,
              persistSession: false
            }
          })
          
          const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

          isAdmin = (profile as any)?.role === 'admin'
          console.log('🔍 Admin role check:', {
            userId: user.id,
            profileRole: (profile as any)?.role,
            isAdmin
          })
        }
      } catch (error) {
        console.warn('Admin role check failed:', error)
      }

      return {
        user,
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
