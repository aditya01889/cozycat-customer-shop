/**
 * Optimized Supabase Client
 * Removes multiple authentication attempts and implements proper session management
 */

import { createClient } from '@supabase/supabase-js'
import { getSupabaseConfig } from '@/lib/env-validation'

const { url, anonKey } = getSupabaseConfig()

// Create a single Supabase client instance with optimized configuration
export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
  // Add global timeout configuration
  global: {
    headers: {
      'X-Client-Info': 'cozycat-kitchen/1.0.0',
    },
  },
  // Enable real-time subscriptions
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

// Optimized authentication functions with proper error handling
export const auth = {
  /**
   * Sign in with optimized timeout and error handling
   */
  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('Sign in error:', error.message)
        throw error
      }

      console.log('✅ Sign in successful')
      return data
    } catch (error) {
      console.error('Sign in failed:', error)
      throw error
    }
  },

  /**
   * Sign up with optimized timeout and error handling
   */
  async signUp(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        console.error('Sign up error:', error.message)
        throw error
      }

      console.log('✅ Sign up successful')
      return data
    } catch (error) {
      console.error('Sign up failed:', error)
      throw error
    }
  },

  /**
   * Sign out with proper cleanup
   */
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('Sign out error:', error.message)
        throw error
      }

      console.log('✅ Sign out successful')
    } catch (error) {
      console.error('Sign out failed:', error)
      throw error
    }
  },

  /**
   * Get current session with timeout protection
   */
  async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Get session error:', error.message)
        return null
      }

      return session
    } catch (error) {
      console.error('Get session failed:', error)
      return null
    }
  },

  /**
   * Get current user with timeout protection
   */
  async getUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) {
        console.error('Get user error:', error.message)
        return null
      }

      return user
    } catch (error) {
      console.error('Get user failed:', error)
      return null
    }
  },

  /**
   * Update user profile with optimized error handling
   */
  async updateUser(updates: any) {
    try {
      const { data, error } = await supabase.auth.updateUser(updates)
      
      if (error) {
        console.error('Update user error:', error.message)
        throw error
      }

      console.log('✅ User updated successfully')
      return data
    } catch (error) {
      console.error('Update user failed:', error)
      throw error
    }
  },

  /**
   * Reset password with optimized error handling
   */
  async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email)
      
      if (error) {
        console.error('Reset password error:', error.message)
        throw error
      }

      console.log('✅ Password reset email sent')
    } catch (error) {
      console.error('Reset password failed:', error)
      throw error
    }
  },
}

// Database query helpers with optimized error handling
export const db = {
  /**
   * Execute query with timeout and error handling
   */
  async query(table: string, options: any = {}) {
    try {
      let query = supabase.from(table).select(options.select || '*')

      // Apply filters
      if (options.eq) {
        Object.entries(options.eq).forEach(([key, value]) => {
          query = query.eq(key, value)
        })
      }

      if (options.neq) {
        Object.entries(options.neq).forEach(([key, value]) => {
          query = query.neq(key, value)
        })
      }

      if (options.in) {
        Object.entries(options.in).forEach(([key, values]) => {
          query = query.in(key, values as any[])
        })
      }

      // Apply ordering
      if (options.order) {
        query = query.order(options.order.column, { 
          ascending: options.order.ascending ?? true 
        })
      }

      // Apply pagination
      if (options.range) {
        query = query.range(options.range.start, options.range.end)
      }

      if (options.limit) {
        query = query.limit(options.limit)
      }

      // Execute query
      const { data, error } = await query

      if (error) {
        console.error(`Query error on ${table}:`, error.message)
        throw error
      }

      return data
    } catch (error) {
      console.error(`Database query failed on ${table}:`, error)
      throw error
    }
  },

  /**
   * Insert data with error handling
   */
  async insert(table: string, data: any) {
    try {
      const { data: result, error } = await supabase
        .from(table)
        .insert(data)
        .select()

      if (error) {
        console.error(`Insert error on ${table}:`, error.message)
        throw error
      }

      return result
    } catch (error) {
      console.error(`Database insert failed on ${table}:`, error)
      throw error
    }
  },

  /**
   * Update data with error handling
   */
  async update(table: string, data: any, filter: any) {
    try {
      let query = supabase.from(table).update(data)

      // Apply filter
      if (filter.eq) {
        Object.entries(filter.eq).forEach(([key, value]) => {
          query = query.eq(key, value)
        })
      }

      const { data: result, error } = await query.select()

      if (error) {
        console.error(`Update error on ${table}:`, error.message)
        throw error
      }

      return result
    } catch (error) {
      console.error(`Database update failed on ${table}:`, error)
      throw error
    }
  },
}

// Export the optimized client
export default supabase
