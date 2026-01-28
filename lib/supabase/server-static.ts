import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'
import { getSupabaseConfig } from '../env-validation'

/**
 * Creates a Supabase client for static/ISR routes that doesn't use cookies
 * This allows routes to be statically generated and cached
 */
export const createStaticClient = () => {
  const { url, serviceRoleKey } = getSupabaseConfig()
  
  return createSupabaseClient<Database>(
    url,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      global: {
        headers: {
          'X-Client-Info': 'cozycat-kitchen/1.0.0-static',
        },
      },
    }
  )
}
