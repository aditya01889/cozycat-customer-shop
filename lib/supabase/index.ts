// Re-export the supabase client for client components
export { supabase, createClient } from './client'

// Server-side client needs to be imported directly from './server' in server components
// This prevents server-only code from being bundled into client components
