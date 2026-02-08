import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    // Get environment info
    const env = process.env.NEXT_PUBLIC_ENVIRONMENT || 'unknown'
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'not-set'
    const redisPrefix = process.env.REDIS_PREFIX || 'not-set'
    
    // Test database connection
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    // Test basic query
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('id, name')
      .limit(3)
    
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('email, role')
      .limit(3)
    
    return NextResponse.json({
      environment: env,
      database: {
        url: supabaseUrl.replace(/https:\/\/([^.]+)\.supabase\.co/, 'https://***.supabase.co'),
        connected: !categoriesError && !profilesError,
        categoriesError: categoriesError?.message,
        profilesError: profilesError?.message
      },
      redis: {
        prefix: redisPrefix
      },
      data: {
        categories: categories || [],
        profiles: profiles || []
      },
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    return NextResponse.json({
      error: 'Database connection test failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      environment: process.env.NEXT_PUBLIC_ENVIRONMENT || 'unknown'
    }, { status: 500 })
  }
}
