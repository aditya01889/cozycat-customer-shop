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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      toast.success('Welcome back!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      
      // Clear the cart before signing out
      const { clearCart } = useCartStore.getState()
      clearCart()
      
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      toast.success('Signed out successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign out')
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
