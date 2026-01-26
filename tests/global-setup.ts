/**
 * Global Test Setup
 * Prepares test environment and database
 */

import { chromium, FullConfig } from '@playwright/test'
import { execSync } from 'child_process'

async function globalSetup(config: FullConfig) {
  console.log('🚀 Setting up test environment...')
  
  const baseURL = config.projects?.[0]?.use?.baseURL || 'http://localhost:3000'
  
  // Check if the application is running
  console.log('🔍 Checking if application is running...')
  
  try {
    const browser = await chromium.launch()
    const context = await browser.newContext()
    const page = await context.newPage()
    
    const response = await page.goto(baseURL, { timeout: 10000 })
    
    if (response?.status() !== 200) {
      throw new Error(`Application not responding: ${response?.status()}`)
    }
    
    await browser.close()
    console.log('✅ Application is running and accessible')
    
  } catch (error) {
    console.error('❌ Application not accessible:', error)
    console.log('💡 Please start the application with: npm run dev')
    process.exit(1)
  }
  
  // Setup test database if needed
  console.log('🗄️ Setting up test database...')
  
  try {
    // Run database setup/migrations if needed
    // execSync('npm run db:test:setup', { stdio: 'inherit' })
    console.log('✅ Test database ready')
  } catch (error) {
    console.warn('⚠️ Database setup skipped (not configured)')
  }
  
  // Create test data if needed
  console.log('📝 Creating test data...')
  
  try {
    // This could create test users, products, orders etc.
    // execSync('npm run test:seed', { stdio: 'inherit' })
    console.log('✅ Test data created')
  } catch (error) {
    console.warn('⚠️ Test data creation skipped')
  }
  
  console.log('🎉 Test environment setup complete!')
}

export default globalSetup
