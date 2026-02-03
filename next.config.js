/** @type {import('next').NextConfig} */

// Basic environment validation without TypeScript dependency
function validateBasicEnv() {
  if (process.env.CI_DUMMY_ENV === '1' || process.env.CI_DUMMY_ENV === 'true') {
    console.warn('⚠️  CI_DUMMY_ENV enabled - skipping Next.js env validation')
    return
  }

  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'NEXT_PUBLIC_RAZORPAY_KEY_ID',
    'RAZORPAY_KEY_SECRET',
    'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY'
  ]

  const missing = requiredVars.filter(varName => !process.env[varName])
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing.join(', '))
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
    } else {
      console.warn('⚠️  Missing environment variables, but continuing in development mode')
    }
  }

  // Validate Supabase URL format
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (supabaseUrl) {
    try {
      new URL(supabaseUrl)
    } catch {
      throw new Error('NEXT_PUBLIC_SUPABASE_URL must be a valid URL')
    }
  }
}

try {
  validateBasicEnv()
} catch (error) {
  console.error('❌ Environment validation failed:', error.message)
  if (process.env.NODE_ENV === 'production') {
    process.exit(1)
  }
}

const nextConfig = {
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  // Disable Turbopack to use Webpack for better PostCSS compatibility
  turbo: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  // Disable automatic optimization to prevent preload warnings
  experimental: {
    optimizeCss: false,
    optimizePackageImports: [],
    turbo: {
      loaders: {
        '.svg': ['@svgr/webpack'],
      },
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('https://', '').replace(/\/$/, '') || 'placeholder.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  // Security headers - updated for Razorpay compatibility
  async headers() {
    const isProd = process.env.NODE_ENV === 'production'
    const scriptSrcUnsafeEval = isProd ? '' : " 'unsafe-eval'"
    const cspValue = `default-src 'self'; script-src 'self'${scriptSrcUnsafeEval} 'unsafe-inline' https://checkout.razorpay.com https://api.razorpay.com https://lumberjack.razorpay.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; font-src 'self' data:; connect-src 'self' https://xfnbhheapralprcwjvzl.supabase.co wss://xfnbhheapralprcwjvzl.supabase.co https://api.razorpay.com https://lumberjack.razorpay.com https://checkout.razorpay.com; frame-src 'self' https://checkout.razorpay.com https://api.razorpay.com https://lumberjack.razorpay.com; object-src 'none'; base-uri 'self'; form-action 'self'`

    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspValue
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
        ],
      },
      // Edge caching for static assets
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Edge caching for API endpoints
      {
        source: '/api/products/isr',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=300, stale-while-revalidate=30',
          },
        ],
      },
      {
        source: '/api/categories/isr',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=600, s-maxage=600, stale-while-revalidate=60',
          },
        ],
      },
    ]
  },
  // Environment-specific configurations
  ...(process.env.NODE_ENV === 'production' && {
    // Production optimizations
    poweredByHeader: false,
    compress: true,
  }),
}

module.exports = nextConfig
