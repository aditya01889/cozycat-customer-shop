import { test, expect } from '@playwright/test'

test.describe('Smoke Tests - Critical Project Structure', () => {

  test('should have required pages', async () => {
    const fs = require('fs')
    const path = require('path')
    
    // Check if critical pages exist
    expect(fs.existsSync(path.join(process.cwd(), 'app/page.tsx'))).toBe(true)
    expect(fs.existsSync(path.join(process.cwd(), 'app/about/page.tsx'))).toBe(true)
    expect(fs.existsSync(path.join(process.cwd(), 'app/products/page.tsx'))).toBe(true)
    expect(fs.existsSync(path.join(process.cwd(), 'app/contact/page.tsx'))).toBe(true)
  })

  test('should have policy pages', async () => {
    const fs = require('fs')
    const path = require('path')
    
    // Check if policy pages exist
    expect(fs.existsSync(path.join(process.cwd(), 'app/privacy/page.tsx'))).toBe(true)
    expect(fs.existsSync(path.join(process.cwd(), 'app/terms/page.tsx'))).toBe(true)
    expect(fs.existsSync(path.join(process.cwd(), 'app/refund-policy/page.tsx'))).toBe(true)
    expect(fs.existsSync(path.join(process.cwd(), 'app/shipping-policy/page.tsx'))).toBe(true)
  })

  test('should have admin pages', async () => {
    const fs = require('fs')
    const path = require('path')
    
    // Check if admin pages exist
    expect(fs.existsSync(path.join(process.cwd(), 'app/admin/page.tsx'))).toBe(true)
    expect(fs.existsSync(path.join(process.cwd(), 'app/admin/analytics/page.tsx'))).toBe(true)
    expect(fs.existsSync(path.join(process.cwd(), 'app/admin/orders/page.tsx'))).toBe(true)
  })

  test('should have critical components', async () => {
    const fs = require('fs')
    const path = require('path')
    
    // Check if critical components exist
    expect(fs.existsSync(path.join(process.cwd(), 'components/Hero.tsx'))).toBe(true)
    expect(fs.existsSync(path.join(process.cwd(), 'components/Footer.tsx'))).toBe(true)
    expect(fs.existsSync(path.join(process.cwd(), 'components/Navbar.tsx'))).toBe(true)
  })

  test('should have API routes', async () => {
    const fs = require('fs')
    const path = require('path')
    
    // Check if API routes exist
    expect(fs.existsSync(path.join(process.cwd(), 'app/api/products/all/route.ts'))).toBe(true)
    expect(fs.existsSync(path.join(process.cwd(), 'app/api/ingredients/route.ts'))).toBe(true)
    expect(fs.existsSync(path.join(process.cwd(), 'app/api/razorpay/create-order/route.ts'))).toBe(true)
  })

  test('should have configuration files', async () => {
    const fs = require('fs')
    
    // Check if configuration files exist
    expect(fs.existsSync('package.json')).toBe(true)
    expect(fs.existsSync('tsconfig.json')).toBe(true)
    expect(fs.existsSync('next.config.js')).toBe(true)
    expect(fs.existsSync('postcss.config.mjs')).toBe(true)
  })

  test('should have scripts', async () => {
    const fs = require('fs')
    const path = require('path')
    
    // Check if scripts exist
    expect(fs.existsSync(path.join(process.cwd(), 'scripts/validate-env.js'))).toBe(true)
  })

  test('should have valid package.json structure', async () => {
    const fs = require('fs')
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
    
    // Check package.json structure
    expect(packageJson.name).toBeDefined()
    expect(packageJson.version).toBeDefined()
    expect(packageJson.scripts).toBeDefined()
    expect(packageJson.dependencies).toBeDefined()
    expect(packageJson.devDependencies).toBeDefined()
  })

  test('should have critical dependencies', async () => {
    const fs = require('fs')
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
    
    // Check if critical dependencies exist
    expect(packageJson.dependencies).toHaveProperty('next')
    expect(packageJson.dependencies).toHaveProperty('react')
    expect(packageJson.dependencies).toHaveProperty('react-dom')
    expect(packageJson.dependencies).toHaveProperty('@supabase/supabase-js')
  })

  test('should have development dependencies', async () => {
    const fs = require('fs')
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
    
    // Check if dev dependencies exist
    expect(packageJson.devDependencies).toHaveProperty('@playwright/test')
    expect(packageJson.devDependencies).toHaveProperty('typescript')
    expect(packageJson.devDependencies).toHaveProperty('eslint')
  })
})
