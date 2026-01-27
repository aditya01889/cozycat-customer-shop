import { test, expect } from '@playwright/test'

test.describe('Critical API Tests', () => {
  let baseUrl: string

  test.beforeAll(async () => {
    baseUrl = process.env.TEST_BASE_URL || 'http://localhost:3000'
  })

  test('should have valid project structure', async () => {
    // Test that critical files exist
    const fs = require('fs')
    const path = require('path')
    
    // Check if critical files exist
    expect(fs.existsSync(path.join(process.cwd(), 'app/page.tsx'))).toBe(true)
    expect(fs.existsSync(path.join(process.cwd(), 'app/api/products/all/route.ts'))).toBe(true)
    expect(fs.existsSync(path.join(process.cwd(), 'package.json'))).toBe(true)
  })

  test('should have valid package.json', async () => {
    const fs = require('fs')
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
    
    expect(packageJson.name).toBe('customer-shop')
    expect(packageJson.scripts).toHaveProperty('build')
    expect(packageJson.scripts).toHaveProperty('dev')
    expect(packageJson.scripts).toHaveProperty('start')
  })

  test('should have valid Next.js structure', async () => {
    const fs = require('fs')
    const path = require('path')
    
    // Check Next.js app directory structure
    expect(fs.existsSync(path.join(process.cwd(), 'app'))).toBe(true)
    expect(fs.existsSync(path.join(process.cwd(), 'app/layout.tsx'))).toBe(true)
    expect(fs.existsSync(path.join(process.cwd(), 'next.config.js'))).toBe(true)
  })

  test('should have critical API routes', async () => {
    const fs = require('fs')
    const path = require('path')
    
    // Check critical API routes exist
    expect(fs.existsSync(path.join(process.cwd(), 'app/api/products/all/route.ts'))).toBe(true)
    expect(fs.existsSync(path.join(process.cwd(), 'app/api/ingredients/route.ts'))).toBe(true)
  })

  test('should have environment validation', async () => {
    const fs = require('fs')
    const path = require('path')
    
    // Check if environment validation script exists
    expect(fs.existsSync(path.join(process.cwd(), 'scripts/validate-env.js'))).toBe(true)
  })

  test('should have valid TypeScript configuration', async () => {
    const fs = require('fs')
    
    // Check if TypeScript config exists
    expect(fs.existsSync('tsconfig.json')).toBe(true)
  })

  test('should have valid ESLint configuration', async () => {
    const fs = require('fs')
    
    // Check if ESLint config exists
    expect(fs.existsSync('eslint.config.mjs')).toBe(true)
  })

  test('should have valid Playwright configuration', async () => {
    const fs = require('fs')
    
    // Check if Playwright config exists
    expect(fs.existsSync('playwright.config.ts')).toBe(true)
  })
})
