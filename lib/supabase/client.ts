import { createClient } from '@supabase/supabase-js'

// Get environment variables with fallbacks for development
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xfnbhheapralprcwjvzl.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseAnonKey && process.env.NODE_ENV === 'development') {
  console.warn('Warning: NEXT_PUBLIC_SUPABASE_ANON_KEY is not set. Some features may not work.')
}

// Create mock client for CI builds
const createMockSupabase = () => ({
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    onAuthStateChange: (callback: any) => ({
      data: { subscription: { unsubscribe: () => {} } }
    }),
    signInWithPassword: () => Promise.resolve({ data: { user: null }, error: new Error('CI dummy mode') }),
    signUp: () => Promise.resolve({ data: { user: null }, error: new Error('CI dummy mode') }),
    signOut: () => Promise.resolve({ error: null }),
    resetPasswordForEmail: () => Promise.resolve({ error: null }),
  },
  from: () => ({
    select: () => ({
      eq: () => ({
        single: () => Promise.resolve({ data: null, error: new Error('CI dummy mode') }),
        order: () => ({ data: [], error: null })
      }),
      order: () => ({ data: [], error: null })
    }),
    upsert: () => Promise.resolve({ error: null }),
    insert: () => Promise.resolve({ error: null }),
    update: () => Promise.resolve({ error: null }),
    delete: () => Promise.resolve({ error: null })
  })
})

export const supabase = (process.env.CI_DUMMY_ENV === '1' || process.env.CI_DUMMY_ENV === 'true')
  ? createMockSupabase()
  : createClient(supabaseUrl, supabaseAnonKey || '', {
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
