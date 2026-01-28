/**
 * Environment variable validation for security and runtime safety
 * Ensures all required environment variables are present and valid
 */

interface EnvSchema {
  // Supabase Configuration
  NEXT_PUBLIC_SUPABASE_URL: string
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string
  SUPABASE_SERVICE_ROLE_KEY: string

  // Email Configuration
  GMAIL_USER?: string
  GMAIL_APP_PASSWORD?: string
  RESEND_API_KEY?: string

  // Payment Configuration
  NEXT_PUBLIC_RAZORPAY_KEY_ID: string
  RAZORPAY_KEY_SECRET: string

  // Google Maps Configuration
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: string

  // Application Configuration
  NODE_ENV: 'development' | 'production' | 'test'
  NEXTAUTH_URL?: string
  NEXTAUTH_SECRET?: string
}

/**
 * Validates environment variables and throws descriptive errors
 */
export function validateEnv(): EnvSchema {
  const env = process.env as Record<string, string | undefined>

  // CI dummy mode: allow build/tests to run without real secrets.
  // This must never be used for real deployments.
  if (env.CI_DUMMY_ENV === '1' || env.CI_DUMMY_ENV === 'true') {
    const nodeEnv = (env.NODE_ENV || 'test') as 'development' | 'production' | 'test'
    return {
      NEXT_PUBLIC_SUPABASE_URL: env.NEXT_PUBLIC_SUPABASE_URL || 'https://example.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'ci_dummy',
      SUPABASE_SERVICE_ROLE_KEY: env.SUPABASE_SERVICE_ROLE_KEY || 'ci_dummy',
      GMAIL_USER: env.GMAIL_USER || '',
      GMAIL_APP_PASSWORD: env.GMAIL_APP_PASSWORD || '',
      RESEND_API_KEY: env.RESEND_API_KEY || '',
      NEXT_PUBLIC_RAZORPAY_KEY_ID: env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'ci_dummy',
      RAZORPAY_KEY_SECRET: env.RAZORPAY_KEY_SECRET || 'ci_dummy',
      NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'ci_dummy',
      NODE_ENV: nodeEnv,
      NEXTAUTH_URL: env.NEXTAUTH_URL || '',
      NEXTAUTH_SECRET: env.NEXTAUTH_SECRET || '',
    }
  }

  // Required Supabase configuration
  if (!env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is required but not set')
  }

  if (!env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is required but not set')
  }

  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required but not set')
  }

  // Validate Node environment
  const nodeEnv = env.NODE_ENV || 'development'
  if (!['development', 'production', 'test'].includes(nodeEnv)) {
    throw new Error('NODE_ENV must be one of: development, production, test')
  }

  // Validate Supabase URL format
  try {
    new URL(env.NEXT_PUBLIC_SUPABASE_URL)
  } catch {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL must be a valid URL')
  }

  // Required Razorpay configuration - only validate in production
  if (nodeEnv === 'production') {
    if (!env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
      throw new Error('NEXT_PUBLIC_RAZORPAY_KEY_ID is required but not set')
    }

    if (!env.RAZORPAY_KEY_SECRET) {
      throw new Error('RAZORPAY_KEY_SECRET is required but not set')
    }
  }

  // Required Google Maps configuration - only validate in production
  if (nodeEnv === 'production') {
    if (!env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
      throw new Error('NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is required but not set')
    }
  }

  // Optional email configuration - warn if missing in production
  if (nodeEnv === 'production') {
    if (!env.RESEND_API_KEY && (!env.GMAIL_USER || !env.GMAIL_APP_PASSWORD)) {
      console.warn('Warning: No email configuration found. Email features will not work in production.')
    }
  }

  return {
    NEXT_PUBLIC_SUPABASE_URL: env.NEXT_PUBLIC_SUPABASE_URL!,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    SUPABASE_SERVICE_ROLE_KEY: env.SUPABASE_SERVICE_ROLE_KEY!,
    GMAIL_USER: env.GMAIL_USER || '',
    GMAIL_APP_PASSWORD: env.GMAIL_APP_PASSWORD || '',
    RESEND_API_KEY: env.RESEND_API_KEY || '',
    NEXT_PUBLIC_RAZORPAY_KEY_ID: env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
    RAZORPAY_KEY_SECRET: env.RAZORPAY_KEY_SECRET || '',
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    NODE_ENV: nodeEnv as 'development' | 'production' | 'test',
    NEXTAUTH_URL: env.NEXTAUTH_URL || '',
    NEXTAUTH_SECRET: env.NEXTAUTH_SECRET || '',
  }
}

/**
 * Get validated environment variables
 * Caches the result after first validation
 */
let cachedEnv: EnvSchema | null = null

export function getEnv(): EnvSchema {
  if (!cachedEnv) {
    cachedEnv = validateEnv()
  }
  return cachedEnv
}

/**
 * Check if running in development mode
 */
export function isDevelopment(): boolean {
  return getEnv().NODE_ENV === 'development'
}

/**
 * Check if running in production mode
 */
export function isProduction(): boolean {
  return getEnv().NODE_ENV === 'production'
}

/**
 * Get Supabase configuration safely (without full validation)
 * Used during build process to avoid payment variable validation
 */
export function getSupabaseConfig() {
  const env = process.env as Record<string, string | undefined>
  
  if (!env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is required but not set')
  }

  if (!env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is required but not set')
  }

  // Validate Supabase URL format
  try {
    new URL(env.NEXT_PUBLIC_SUPABASE_URL)
  } catch {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL must be a valid URL')
  }
  
  return {
    url: env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
  }
}

/**
 * Get payment configuration safely
 */
export function getPaymentConfig() {
  const env = getEnv()
  return {
    razorpayKeyId: env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    razorpayKeySecret: env.RAZORPAY_KEY_SECRET,
  }
}
