import { NextResponse } from 'next/server'
import { getSupabaseConfig } from '@/lib/env-validation'

export async function GET() {
  try {
    const supabaseConfig = getSupabaseConfig()
    
    return NextResponse.json({
      debug: {
        supabase_url: supabaseConfig.url,
        environment: process.env.NODE_ENV,
        ci_dummy_env: process.env.CI_DUMMY_ENV,
        all_env_vars: {
          NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT_SET',
          NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT_SET',
          SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT_SET',
        }
      }
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Debug endpoint failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
