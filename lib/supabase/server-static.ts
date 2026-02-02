import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'
import { getSupabaseConfig } from '../env-validation'

/**
 * Creates a Supabase client for static/ISR routes that doesn't use cookies
 * This allows routes to be statically generated and cached
 */
export const createStaticClient = () => {
  // Skip Supabase client creation during CI build
  if (process.env.CI_DUMMY_ENV === '1' || process.env.CI_DUMMY_ENV === 'true') {
    // Return a mock client for CI builds
    return {
      from: () => ({
        select: () => ({
          eq: (column: string, value: any) => ({
            order: () => ({
              order: () => ({ data: [], error: null }),
              single: () => ({ data: null, error: new Error('CI dummy mode') })
            }),
            single: () => ({ data: null, error: new Error('CI dummy mode') })
          }),
          order: () => ({ data: [], error: null })
        })
      })
    }
  }
  
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
