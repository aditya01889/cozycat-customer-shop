'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import toast from 'react-hot-toast'
import { useCartStore } from '@/lib/store/cart'

interface AuthContextType {
  user: User | null
  loading: boolean
  signUp: (email: string, password: string, name: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const ensureCustomerRecord = async (user: User) => {
  try {
    // First, create/update the profile record
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        role: 'customer',
        full_name: user.user_metadata?.name || 'User',
        email: user.email,
        phone: null,
        updated_at: new Date().toISOString()
      })

    if (profileError) {
      console.error('Error creating/updating profile record:', profileError)
    }

    // Then check if customer record exists
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!existingCustomer) {
      // Get the profile ID first
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single()

      if (profile) {
        const { error: customerError } = await supabase
          .from('customers')
          .insert({
            id: user.id,
            profile_id: profile.id,
            phone: '' // Use empty string instead of null for NOT NULL constraint
          })

        if (customerError) {
          console.error('Error creating customer record:', customerError)
        } else {
          console.log('Customer record created successfully')
        }
      }
    }
  } catch (error) {
    console.error('Error ensuring customer record:', error)
  }
}

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      
      // Ensure customer record exists for logged in user
      if (session?.user) {
        await ensureCustomerRecord(session.user)
      }
      
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event: any, session: any) => {
      setUser(session?.user ?? null)
      
      // Ensure customer record exists for logged in user
      if (session?.user) {
        await ensureCustomerRecord(session.user)
      }
      
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, name: string) => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      })

      if (error) throw error

      toast.success('Account created successfully! Please check your email to verify.')
    } catch (error: any) {
      toast.error(error.message || 'Failed to create account')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      console.log('🔐 Starting sign in process...')
      
      // Try multiple approaches for sign in
      let signInSuccess = false
      let userData = null
      let lastError = null
      
      // Method 1: Standard sign in with shorter timeout
      try {
        console.log('🔄 Method 1: Standard sign in...')
        const signInPromise = supabase.auth.signInWithPassword({
          email,
          password,
        })
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Standard sign in timeout')), 5000)
        )
        
        const { data, error } = await Promise.race([signInPromise, timeoutPromise]) as any
        console.log('📋 Method 1 response:', { error, user: !!data?.user })
        
        if (!error && data?.user) {
          signInSuccess = true
          userData = data.user
          console.log('✅ Method 1 successful')
        } else {
          lastError = error
          console.log('❌ Method 1 failed:', error)
        }
      } catch (method1Error) {
        lastError = method1Error
        console.log('❌ Method 1 exception:', method1Error)
      }
      
      // Method 2: Try with different auth options if method 1 fails
      if (!signInSuccess) {
        try {
          console.log('🔄 Method 2: Alternative sign in...')
          
          // Create a new client instance with different options
          const { createClient } = await import('@/lib/supabase/client')
          const altSupabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
              auth: {
                persistSession: false,
                autoRefreshToken: false,
              }
            }
          )
          
          const signInPromise = altSupabase.auth.signInWithPassword({
            email,
            password,
          })
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Alternative sign in timeout')), 5000)
          )
          
          const { data, error } = await Promise.race([signInPromise, timeoutPromise]) as any
          console.log('📋 Method 2 response:', { error, user: !!data?.user })
          
          if (!error && data?.user) {
            signInSuccess = true
            userData = data.user
            console.log('✅ Method 2 successful')
          } else {
            lastError = error
            console.log('❌ Method 2 failed:', error)
          }
        } catch (method2Error) {
          lastError = method2Error
          console.log('❌ Method 2 exception:', method2Error)
        }
      }
      
      if (signInSuccess && userData) {
        console.log('🎉 Sign in successful overall')
        toast.success('Welcome back!')
        return
      }
      
      // All methods failed
      console.error('💥 All sign in methods failed:', lastError)
      
      // Provide better error messages
      let errorMessage = 'Failed to sign in'
      if (lastError?.message?.includes('timeout')) {
        errorMessage = 'Sign in is currently experiencing issues. Please try again in a few minutes.'
      } else if (lastError?.message?.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password'
      } else if (lastError?.message) {
        errorMessage = lastError.message
      } else {
        errorMessage = 'Authentication service is temporarily unavailable. Please try again later.'
      }
      
      toast.error(errorMessage)
      throw new Error(errorMessage)
      
    } catch (error: any) {
      console.error('💥 Sign in catch error:', error)
      toast.error(error.message || 'Failed to sign in')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      
      console.log('🚀 Starting sign out process...')
      
      // Clear cart before signing out
      const { clearCart } = useCartStore.getState()
      clearCart()
      console.log('✅ Cart cleared')
      
      // On Vercel, Supabase API calls timeout, so skip them and clear local state directly
      console.log('⚡ Skipping Supabase API calls (deployment issue), clearing local state...')
      
      // Always clear local state regardless of API success
      console.log('🧹 Clearing local state...')
      setUser(null)
      console.log('✅ Local user state cleared')
      
      // Clear any stored session data
      if (typeof window !== 'undefined') {
        const keysToRemove = [
          'supabase.auth.token', 
          'supabase.auth.refreshToken',
          'supabase.auth.accessToken',
          'sb-auth-token',
          'sb-refresh-token'
        ]
        keysToRemove.forEach(key => {
          localStorage.removeItem(key)
          sessionStorage.removeItem(key)
        })
        console.log('✅ Local storage cleared')
      }
      
      // Clear Supabase client state (using signOut with empty session as fallback)
      try {
        // This might work locally but not on Vercel, so we wrap it in try-catch
        await supabase.auth.signOut({ scope: 'local' })
        console.log('✅ Supabase client session cleared')
      } catch (clearError) {
        console.log('⚠️ Supabase client clear failed (non-critical):', clearError)
      }
      
      toast.success('Signed out successfully!')
      console.log('🎉 Sign out process completed successfully')
      
      // Add delay before redirect to see console logs
      console.log('⏳ Redirecting to home page in 2 seconds...')
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          console.log('🏠 Redirecting to home page now')
          window.location.href = '/'
        }
      }, 2000)
      
    } catch (error: any) {
      console.error('💥 Sign out catch error:', error)
      
      // Even if everything fails, clear local state
      setUser(null)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('supabase.auth.token')
        sessionStorage.removeItem('supabase.auth.token')
      }
      
      toast.success('Signed out (emergency fallback)')
      console.log('🚨 Emergency sign out completed')
      
      // Force redirect after delay
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          console.log('🏠 Emergency redirect to home page')
          window.location.href = '/'
        }
      }, 2000)
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (error) throw error
      toast.success('Password reset link sent to your email')
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset link')
      throw error
    }
  }

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
