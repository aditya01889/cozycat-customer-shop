import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_ENVIRONMENT: process.env.NEXT_PUBLIC_ENVIRONMENT,
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 50) + '...',
      NEXT_PUBLIC_PAYMENT_MODE: process.env.NEXT_PUBLIC_PAYMENT_MODE,
      NEXT_PUBLIC_RAZORPAY_KEY_ID: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.substring(0, 10) + '...',
      REDIS_PREFIX: process.env.REDIS_PREFIX,
      SITE_URL: process.env.SITE_URL
    },
    isolation: {
      supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('pjckafjhzwegtyhlatus') ? 'STAGING_DB' : 'NOT_STAGING',
      razorpay_mode: process.env.NEXT_PUBLIC_PAYMENT_MODE === 'test' ? 'TEST_KEYS' : 'LIVE_KEYS',
      redis_prefix: process.env.REDIS_PREFIX === 'staging' ? 'STAGING_REDIS' : 'NOT_STAGING'
    },
    status: 'Staging environment check complete'
  })
}
