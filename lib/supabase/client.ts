import { createClient } from '@supabase/supabase-js'

// Get environment variables with fallbacks for development
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xfnbhheapralprcwjvzl.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('Supabase URL:', supabaseUrl)
console.log('Supabase Key exists:', !!supabaseAnonKey)

if (!supabaseAnonKey) {
  console.warn('Warning: NEXT_PUBLIC_SUPABASE_ANON_KEY is not set. Some features may not work.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey || '', {
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
