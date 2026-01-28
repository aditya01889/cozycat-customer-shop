import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/types/database'
import { getSupabaseConfig, getSiteUrl } from '../env-validation'

export const createClient = async () => {
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
