import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/types/database'
import { getSupabaseConfig, getSiteUrl } from '../env-validation'

export const createClient = async () => {
  // Skip Supabase client creation during CI build
  if (process.env.CI_DUMMY_ENV === '1' || process.env.CI_DUMMY_ENV === 'true') {
    // Return a mock client for CI builds
    return {
      from: () => ({
        select: () => ({
          eq: (column: string, value: any) => ({
            order: () => ({ data: [], error: null }),
            single: () => ({ data: null, error: new Error('CI dummy mode') }),
            ilike: () => ({ order: () => ({ data: [], error: null }) })
          }),
          order: () => ({ data: [], error: null })
        })
      })
    }
  }

  const cookieStore = await cookies()
  const { url, anonKey } = getSupabaseConfig()
  const siteUrl = getSiteUrl()
  
  return createServerClient<Database>(
    url,
    anonKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
      // Add auth configuration to ensure session is passed
      auth: {
        flowType: 'pkce',
        autoRefreshToken: true,
        detectSessionInUrl: true,
        persistSession: true,
      },
      // Add timeout configuration
      global: {
        headers: {
          'X-Client-Info': 'cozycat-kitchen/1.0.0',
        },
      },
    }
  )
}
