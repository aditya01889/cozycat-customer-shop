import { createClient } from '@supabase/supabase-js'

/**
 * Creates a Supabase client for server-side use
 * This helper function ensures environment variables are available before creating the client
 */
export function createServerSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    // In CI/dummy mode, return a mock client that won't crash the build
    if (process.env.CI_DUMMY_ENV === '1' || process.env.CI_DUMMY_ENV === 'true') {
      return createMockClient();
    }
    
    throw new Error('Supabase credentials are required');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey);
}

/**
 * Creates a mock Supabase client for CI/dummy mode
 * This prevents build failures when environment variables are not available
 */
function createMockClient() {
  return {
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: null, error: null })
        }),
        order: () => Promise.resolve({ data: [], error: null })
      }),
      insert: () => ({
        select: () => ({
          single: () => Promise.resolve({ data: null, error: null })
        })
      }),
      update: () => ({
        eq: () => ({
          select: () => ({
            single: () => Promise.resolve({ data: null, error: null })
          })
        })
      }),
      delete: () => ({
        eq: () => Promise.resolve({ data: null, error: null })
      })
    }),
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: null })
    }
  };
}
