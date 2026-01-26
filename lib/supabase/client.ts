import { createClient } from '@supabase/supabase-js'
import { getSupabaseConfig } from '../env-validation'

const { url, anonKey } = getSupabaseConfig()

console.log('Supabase URL:', url)
console.log('Supabase Key exists:', !!anonKey)

if (!url || !anonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(url, anonKey, {
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
