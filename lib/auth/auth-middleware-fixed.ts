/**
 * Authentication Middleware for Phase 1.3
 * Enhanced session management and security
 */

import { NextRequest, NextResponse } from 'next/server'
import { createEnhancedAuthClient } from './auth-fixes'
import { SESSION_CONFIG } from './auth-fixes'

// Enhanced session validation
export async function validateSession(request: NextRequest) {
  try {
    const supabase = createEnhancedAuthClient()
    
    // Get session from cookie or Authorization header
    const authHeader = request.headers.get('authorization')
    let session = null
    
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice('Bearer '.length)
      // For now, we'll use the standard getUser method
      const { data } = await supabase.auth.getUser(token)
      session = data.user
    } else {
      // Try to get session from cookies
      const { data } = await supabase.auth.getUser()
      session = data.user
    }
    
    if (!session) {
      return { 
        valid: false, 
        error: 'No valid session found',
        user: null 
      }
    }
    
    // Check session expiration
    const lastSignIn = session.user_metadata?.last_sign_in_at || session.created_at
    if (lastSignIn && sessionUtils.isSessionExpired(new Date(lastSignIn).getTime())) {
      return { 
        valid: false, 
        error: 'Session has expired',
        user: null 
      }
    }
    
    return { 
      valid: true, 
      user: session,
      lastSignIn: lastSignIn ? new Date(lastSignIn).getTime() : Date.now()
    }
    
  } catch (error) {
    console.error('Session validation error:', error)
    return { 
      valid: false, 
      error: 'Session validation failed',
      user: null 
    }
  }
}

// Enhanced authentication middleware
export async function requireAuth(request: NextRequest) {
  const session = await validateSession(request)
  
  if (!session.valid) {
    return NextResponse.json(
      { error: 'Authentication required', details: session.error },
      { status: 401 }
    )
  }
  
  return { user: session.user }
}

// Admin authentication middleware
export async function requireAdminAuth(request: NextRequest) {
  const session = await validateSession(request)
  
  if (!session.valid) {
    return NextResponse.json(
      { error: 'Authentication required', details: session.error },
      { status: 401 }
    )
  }
  
  // Check if user has admin role
  const supabase = createEnhancedAuthClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()
  
  if (!profile || (profile as any).role !== 'admin') {
    return NextResponse.json(
      { error: 'Admin access required' },
      { status: 403 }
    )
  }
  
  return { user: session.user, profile }
}

// Session utilities
export const sessionUtils = {
  // Check if session is expired
  isSessionExpired: (lastSignIn: number) => {
    const now = Date.now()
    return (now - lastSignIn) > SESSION_CONFIG.DEFAULT_SESSION_TIMEOUT
  },
  
  // Get session refresh threshold
  shouldRefreshSession: (lastRefresh: number) => {
    const now = Date.now()
    return (now - lastRefresh) > SESSION_CONFIG.REFRESH_THRESHOLD
  },
  
  // Create session response with proper headers
  createSessionResponse: (user: any, message?: string) => {
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at
      },
      message: message || 'Authentication successful'
    })
    
    // Set secure session headers
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    
    return response
  }
}
