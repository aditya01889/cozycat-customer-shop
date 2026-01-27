#!/usr/bin/env node

/**
 * Cache warming script for deployment
 * Warms up edge and server caches after deployment
 */

const { EdgeCacheWarming } = require('../lib/cache/edge-cache')

async function warmAllCaches() {
  console.log('🔥 Starting cache warming after deployment...')
  
  try {
    // Warm static assets
    console.log('Warming static assets...')
    await EdgeCacheWarming.warmStaticAssets()
    
    // Warm product data
    console.log('Warming product data...')
    await EdgeCacheWarming.warmProducts()
    
    console.log('✅ Cache warming completed successfully!')
    
  } catch (error) {
    console.error('❌ Cache warming failed:', error)
    process.exit(1)
  }
}

// Run cache warming
warmAllCaches()
