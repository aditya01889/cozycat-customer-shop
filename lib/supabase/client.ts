import { createClient } from '@supabase/supabase-js'
import { isCIMode } from '@/lib/ci-build-helper'

// Get environment variables with fallbacks for development
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Debug logging for runtime
if (process.env.NODE_ENV === 'production' && !supabaseUrl) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL is not set in production!')
}

if (!supabaseAnonKey && process.env.NODE_ENV === 'development') {
  console.warn('Warning: NEXT_PUBLIC_SUPABASE_ANON_KEY is not set. Some features may not work.')
}

// Don't create Supabase client during build/prerendering or if URL is invalid
const shouldCreateClient = !isCIMode() && 
                          supabaseUrl && 
                          supabaseUrl.startsWith('https://') &&
                          !process.env.NEXT_PHASE?.includes('build')

export const supabase = shouldCreateClient ? createClient(supabaseUrl, supabaseAnonKey || '', {
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
}) : null

export { createClient }
