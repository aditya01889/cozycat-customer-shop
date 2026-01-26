'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { useToast } from '@/components/Toast/ToastProvider'
import { useCartStore } from '@/lib/store/cart'
import { ErrorHandler, ErrorType, withErrorHandling } from '@/lib/errors/error-handler'

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
  const { showSuccess, showError } = useToast()

  const ensureCustomerRecord = async (user: User, name?: string) => {
    try {
      console.log('🔍 Ensuring customer record for user:', user.id)
      console.log('👤 User metadata:', user.user_metadata)
      console.log('📧 User email:', user.email)
      console.log('📝 Provided name:', name)

      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Customer record creation timeout')), 10000)
      )

      const ensureRecordPromise = async () => {
        // First, check if profile already exists with role
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('role, phone, full_name, email')
          .eq('id', user.id)
          .single()

        console.log('📋 Existing profile:', existingProfile)

        // Only create/update profile if it doesn't exist or needs updating
        const profileRole = existingProfile?.role || 'customer' // Preserve existing role
        
        // Use the provided name from signup, or fallback to metadata, or existing profile name
        const fullName = name || user.user_metadata?.name || existingProfile?.full_name || 'User'
        
        console.log('🏷️ Creating/updating profile with name:', fullName)
        
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            email: user.email,
            full_name: fullName,
            role: profileRole,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'id'
          })

        if (profileError) {
          console.error('❌ Profile upsert error:', profileError)
          throw profileError
        }

        console.log('✅ Profile record created/updated successfully')

        // Only create customer record if user is a customer
        if (profileRole === 'customer') {
          console.log('� Creating customer record...')
          
          const { error: customerError } = await supabase
            .from('customers')
            .upsert({
              id: user.id,
              profile_id: user.id,
              email: user.email,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'id'
            })

          if (customerError) {
            console.error('❌ Customer upsert error:', customerError)
            throw customerError
          }

          console.log('✅ Customer record created successfully')
        } else {
          console.log('👤 User is not a customer, skipping customer record creation')
        }
      }
      
      await Promise.race([ensureRecordPromise(), timeoutPromise])
      
    } catch (error) {
      console.error('❌ Error ensuring customer record:', error)
      // Don't throw error - this is non-critical for login
      // The user is already authenticated, profile creation can be retried later
    }
  }

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      
      // Ensure customer record exists for logged in user (non-blocking)
      if (session?.user) {
        ensureCustomerRecord(session.user).catch(error => {
          console.warn('⚠️ Initial customer record creation failed (non-critical):', error)
        })
      }
      
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event: any, session: any) => {
      setUser(session?.user ?? null)
      
      // Ensure customer record exists for logged in user (non-blocking)
      if (session?.user) {
        ensureCustomerRecord(session.user).catch(error => {
          console.warn('⚠️ Auth state change customer record creation failed (non-critical):', error)
        })
      }
      
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, name: string) => {
    try {
      setLoading(true)
      console.log('🔐 Starting sign up process for:', email)
      console.log('👤 Name provided:', name)
      
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

      console.log('✅ Sign up successful, user created:', data.user?.id)
      
      // Ensure customer record is created with the provided name
      if (data.user) {
        await ensureCustomerRecord(data.user, name)
      }

      showSuccess('Account created successfully! Please check your email to verify.')
    } catch (error: any) {
      console.error('❌ Sign up error:', error)
      showError(error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      console.log('🔐 Starting sign in process...')
      
      // Try sign in with longer timeout and better error handling
      try {
        console.log('🔄 Attempting sign in...')
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        
        console.log('📋 Sign in response:', { error, user: !!data?.user })
        
        if (error) {
          console.error('❌ Sign in error:', error)
          throw new Error(error.message || 'Invalid email or password')
        }
        
        if (data?.user) {
          console.log('✅ Sign in successful for user:', data.user.id)
          showSuccess('Welcome back!')
          
          // Ensure customer record asynchronously (non-blocking)
          ensureCustomerRecord(data.user).catch(error => {
            console.warn('⚠️ Customer record creation failed (non-critical):', error)
            // Don't throw error - user is already logged in
          })
          
          return
        }
      } catch (signInError) {
        console.error('❌ Sign in failed:', signInError)
        throw signInError
      }
      
    } catch (error: any) {
      console.error('💥 Sign in catch error:', error)
      
      // Check if user is actually authenticated despite the error
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        console.log('✅ User is authenticated despite error, proceeding...')
        showSuccess('Welcome back!')
        
        // Ensure customer record asynchronously
        ensureCustomerRecord(session.user).catch(error => {
          console.warn('⚠️ Customer record creation failed (non-critical):', error)
        })
        
        return
      }
      
      // Provide better error messages
      let errorMessage = 'Failed to sign in'
      if (error?.message?.includes('timeout')) {
        errorMessage = 'Sign in is taking longer than expected. Please try again.'
      } else if (error?.message?.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password'
      } else if (error?.message) {
        errorMessage = error.message
      } else {
        errorMessage = 'Authentication service is temporarily unavailable. Please try again later.'
      }
      
      const appError = ErrorHandler.fromError(error)
      showError(appError)
      throw new Error(errorMessage)
      
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
      
      showSuccess('Signed out successfully!')
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
      
      showSuccess('Signed out (emergency fallback)')
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
      showSuccess('Password reset link sent to your email')
    } catch (error: any) {
      const appError = ErrorHandler.fromError(error)
      showError(appError)
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
