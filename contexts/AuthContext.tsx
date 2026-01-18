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
          role: profileRole, // Use existing role, don't override
          full_name: fullName,
          email: user.email,
          phone: existingProfile?.phone || null, // Preserve existing phone
          updated_at: new Date().toISOString()
        })

      if (profileError) {
        console.error('❌ Error creating/updating profile record:', profileError)
        throw profileError
      } else {
        console.log('✅ Profile record created/updated successfully')
      }

      if (existingProfile?.role && existingProfile.role !== 'customer') {
        console.log('👤 User is not a customer, skipping customer record creation')
        return
      }

      // Then check if customer record exists
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('id')
        .eq('id', user.id)
        .single()

      console.log('📋 Existing customer:', existingCustomer)

      if (!existingCustomer) {
        console.log('🆕 Creating new customer record...')
        
        const { error: customerError } = await supabase
          .from('customers')
          .insert({
            id: user.id,
            profile_id: user.id,
            phone: existingProfile?.phone || '' // Use profile phone or empty string
          })

        if (customerError) {
          console.error('❌ Error creating customer record:', customerError)
          throw customerError
        } else {
          console.log('✅ Customer record created successfully')
        }
      } else {
        console.log('✅ Customer record already exists')
      }
    } catch (error) {
      console.error('❌ Error ensuring customer record:', error)
      throw error
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
      
      // Method 2: Try with different auth options using same client
      if (!signInSuccess) {
        try {
          console.log('🔄 Method 2: Alternative sign in with different options...')
          
          // Temporarily modify auth options
          const originalAuth = supabase.auth
          
          const signInPromise = supabase.auth.signInWithPassword({
            email,
            password,
            options: {
              // Try with minimal options
            }
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
        showSuccess('Welcome back!')
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
      
      const appError = ErrorHandler.fromError(lastError)
      showError(appError)
      throw new Error(errorMessage)
      
    } catch (error: any) {
      console.error('💥 Sign in catch error:', error)
      const appError = ErrorHandler.fromError(error)
      showError(appError)
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
