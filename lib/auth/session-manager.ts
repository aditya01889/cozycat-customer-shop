/**
 * Session Management Utilities
 * Handles authentication sessions with proper timeout and error handling
 */

import { createClient } from '@/lib/supabase/client'
import { getSupabaseConfig } from '@/lib/env-validation'

export interface SessionInfo {
  user: any
  session: any
  expiresAt: number
  isValid: boolean
}

export class SessionManager {
  private static instance: SessionManager
  private supabase: any
  private sessionTimeout: number = 15 * 60 * 1000 // 15 minutes
  private refreshThreshold: number = 5 * 60 * 1000 // 5 minutes before expiry
  private sessionCheckInterval: NodeJS.Timeout | null = null

  private constructor() {
    const { url, anonKey } = getSupabaseConfig()
    this.supabase = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
      },
    })
  }

  public static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager()
    }
    return SessionManager.instance
  }

  /**
   * Get current session with timeout protection
   */
  public async getSession(timeoutMs: number = 5000): Promise<SessionInfo> {
    return Promise.race([
      this.getSessionInternal(),
      new Promise<SessionInfo>((_, reject) => 
        setTimeout(() => reject(new Error('Session fetch timeout')), timeoutMs)
      )
    ])
  }

  private async getSessionInternal(): Promise<SessionInfo> {
    try {
      const { data: { session }, error } = await this.supabase.auth.getSession()
      
      if (error) {
        throw error
      }

      if (!session) {
        return {
          user: null,
          session: null,
          expiresAt: 0,
          isValid: false
        }
      }

      const expiresAt = session.expires_at ? session.expires_at * 1000 : Date.now() + this.sessionTimeout
      const isValid = Date.now() < expiresAt

      return {
        user: session.user,
        session,
        expiresAt,
        isValid
      }
    } catch (error) {
      console.error('Error getting session:', error)
      return {
        user: null,
        session: null,
        expiresAt: 0,
        isValid: false
      }
    }
  }

  /**
   * Sign in with timeout protection
   */
  public async signIn(email: string, password: string, timeoutMs: number = 10000): Promise<SessionInfo> {
    return Promise.race([
      this.signInInternal(email, password),
      new Promise<SessionInfo>((_, reject) => 
        setTimeout(() => reject(new Error('Sign in timeout')), timeoutMs)
      )
    ])
  }

  private async signInInternal(email: string, password: string): Promise<SessionInfo> {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        throw error
      }

      if (!data.session) {
        throw new Error('No session created')
      }

      const expiresAt = data.session.expires_at ? data.session.expires_at * 1000 : Date.now() + this.sessionTimeout

      return {
        user: data.user,
        session: data.session,
        expiresAt,
        isValid: true
      }
    } catch (error) {
      console.error('Sign in error:', error)
      throw error
    }
  }

  /**
   * Sign up with timeout protection
   */
  public async signUp(email: string, password: string, timeoutMs: number = 10000): Promise<SessionInfo> {
    return Promise.race([
      this.signUpInternal(email, password),
      new Promise<SessionInfo>((_, reject) => 
        setTimeout(() => reject(new Error('Sign up timeout')), timeoutMs)
      )
    ])
  }

  private async signUpInternal(email: string, password: string): Promise<SessionInfo> {
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password
      })

      if (error) {
        throw error
      }

      if (!data.session && !data.user) {
        throw new Error('No user or session created')
      }

      const expiresAt = data.session?.expires_at ? data.session.expires_at * 1000 : Date.now() + this.sessionTimeout

      return {
        user: data.user,
        session: data.session,
        expiresAt,
        isValid: !!data.session
      }
    } catch (error) {
      console.error('Sign up error:', error)
      throw error
    }
  }

  /**
   * Sign out with cleanup
   */
  public async signOut(): Promise<void> {
    try {
      await this.supabase.auth.signOut()
      this.stopSessionMonitoring()
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    }
  }

  /**
   * Start monitoring session for automatic refresh
   */
  public startSessionMonitoring(): void {
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval)
    }

    this.sessionCheckInterval = setInterval(async () => {
      try {
        const sessionInfo = await this.getSession()
        
        if (!sessionInfo.isValid) {
          console.log('Session expired, stopping monitoring')
          this.stopSessionMonitoring()
          return
        }

        // Check if session needs refresh
        const timeUntilExpiry = sessionInfo.expiresAt - Date.now()
        if (timeUntilExpiry < this.refreshThreshold) {
          console.log('Session approaching expiry, attempting refresh')
          await this.refreshSession()
        }
      } catch (error) {
        console.error('Session monitoring error:', error)
      }
    }, 60000) // Check every minute
  }

  /**
   * Stop session monitoring
   */
  public stopSessionMonitoring(): void {
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval)
      this.sessionCheckInterval = null
    }
  }

  /**
   * Refresh current session
   */
  public async refreshSession(): Promise<void> {
    try {
      const { error } = await this.supabase.auth.refreshSession()
      if (error) {
        throw error
      }
    } catch (error) {
      console.error('Session refresh error:', error)
      throw error
    }
  }

  /**
   * Check if user has admin role
   */
  public async isAdmin(): Promise<boolean> {
    try {
      const sessionInfo = await this.getSession()
      if (!sessionInfo.isValid || !sessionInfo.user) {
        return false
      }

      // Try to use the is_admin function first
      const { data, error } = await this.supabase.rpc('is_admin')
      
      if (error) {
        console.warn('Admin function not available, checking profile directly')
        // Fallback to direct profile check
        const { data: profile } = await this.supabase
          .from('profiles')
          .select('role')
          .eq('id', sessionInfo.user.id)
          .single()
        
        return profile?.role === 'admin'
      }

      return data === true
    } catch (error) {
      console.error('Admin check error:', error)
      return false
    }
  }

  /**
   * Get user profile with timeout protection
   */
  public async getUserProfile(timeoutMs: number = 5000): Promise<any> {
    return Promise.race([
      this.getUserProfileInternal(),
      new Promise<any>((_, reject) => 
        setTimeout(() => reject(new Error('Profile fetch timeout')), timeoutMs)
      )
    ])
  }

  private async getUserProfileInternal(): Promise<any> {
    try {
      const sessionInfo = await this.getSession()
      if (!sessionInfo.isValid || !sessionInfo.user) {
        throw new Error('No valid session')
      }

      const { data, error } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', sessionInfo.user.id)
        .single()

      if (error) {
        throw error
      }

      return data
    } catch (error) {
      console.error('Profile fetch error:', error)
      throw error
    }
  }
}

// Export singleton instance
export const sessionManager = SessionManager.getInstance()

// Export convenience functions
export const getSession = () => sessionManager.getSession()
export const signIn = (email: string, password: string) => sessionManager.signIn(email, password)
export const signUp = (email: string, password: string) => sessionManager.signUp(email, password)
export const signOut = () => sessionManager.signOut()
export const isAdmin = () => sessionManager.isAdmin()
export const getUserProfile = () => sessionManager.getUserProfile()
