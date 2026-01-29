import { createClient } from '@supabase/supabase-js'
import { isCIMode } from '@/lib/ci-build-helper'

// Get environment variables with fallbacks for development
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xfnbhheapralprcwjvzl.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseAnonKey && process.env.NODE_ENV === 'development') {
  console.warn('Warning: NEXT_PUBLIC_SUPABASE_ANON_KEY is not set. Some features may not work.')
}

// In CI mode, return a mock client to prevent build errors
export const supabase = isCIMode() ? null : createClient(supabaseUrl, supabaseAnonKey || '', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
  // Add timeout configuration to prevent hanging requests
  global: {
    headers: {
      'X-Client-Info': 'cozycat-kitchen/1.0.0',
    },
  },
})

export { createClient }
