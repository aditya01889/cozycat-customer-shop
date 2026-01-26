// Re-export the supabase client for convenience
export { supabase, createClient } from './client'

// Also export the server-side client creator
export { createClient as createServerClient } from './server'
