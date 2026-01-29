import { createClient } from '@supabase/supabase-js'

/**
 * Creates a Supabase client for server-side use
 * This helper function ensures environment variables are available before creating the client
 */
export function createServerSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase credentials are required');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey);
}
