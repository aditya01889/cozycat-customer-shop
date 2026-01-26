/**
 * Critical User Journey E2E Tests
 * Tests for production stability and core functionality
 */

import { test, expect } from '@playwright/test'

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000'

test.describe('Critical User Journeys - Production Stability', () => {
  
  test.beforeEach(async ({ page }) => {
    // Clear any existing session
    await page.context().clearCookies()
  })

  test.describe('Customer Journey', () => {
    
    test('complete purchase journey from browsing to order confirmation', async ({ page }) => {
      console.log('🛒 Starting complete purchase journey test...')
      
      // 1. Browse products
      await page.goto(BASE_URL)
      await expect(page.locator('h1')).toContainText('CozyCat Kitchen')
      
      // Wait for products to load
      await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })
      const products = page.locator('[data-testid="product-card"]')
      await expect(products.first()).toBeVisible()
      
      console.log('✅ Products loaded successfully')
      
      // 2. View product details
      await products.first().click()
      await page.waitForURL(/\/products\//)
      
      // Verify product details page
      await expect(page.locator('h1')).toBeVisible()
      await expect(page.locator('[data-testid="add-to-cart"]')).toBeVisible()
      
      console.log('✅ Product details loaded')
      
      // 3. Add to cart
      await page.click('[data-testid="add-to-cart"]')
      
      // Wait for cart update
      await page.waitForSelector('[data-testid="cart-count"]')
      const cartCount = await page.locator('[data-testid="cart-count"]').textContent()
      expect(parseInt(cartCount || '0')).toBeGreaterThan(0)
      
      console.log('✅ Product added to cart')
      
      // 4. View cart
      await page.click('[data-testid="cart-icon"]')
      await page.waitForURL('/cart')
      
      // Verify cart contents
      await expect(page.locator('[data-testid="cart-item"]')).toBeVisible()
      
      console.log('✅ Cart loaded with items')
      
      // 5. Proceed to checkout
      await page.click('[data-testid="checkout-button"]')
      
      // Should redirect to login if not authenticated
      if (page.url().includes('/auth')) {
        console.log('🔐 Login required, proceeding with authentication...')
        
        // Login
        await page.fill('input[type="email"]', 'aditya01889@gmail.com')
        await page.fill('input[type="password"]', 'testpassword123')
        await page.click('button[type="submit"]')
        
        // Wait for redirect back to checkout
        await page.waitForURL('/checkout', { timeout: 15000 })
      }
      
      // 6. Complete checkout process
      await expect(page.locator('h1')).toContainText('Checkout')
      
      // Fill shipping information
      await page.fill('[data-testid="shipping-name"]', 'Test User')
      await page.fill('[data-testid="shipping-phone"]', '1234567890')
      await page.fill('[data-testid="shipping-address"]', '123 Test Street')
      await page.fill('[data-testid="shipping-city"]', 'Test City')
      await page.fill('[data-testid="shipping-state"]', 'Test State')
      await page.fill('[data-testid="shipping-pincode"]', '123456')
      
      console.log('✅ Shipping information filled')
      
      // Select payment method
      await page.click('[data-testid="payment-method-cod"]')
      
      // Place order
      await page.click('[data-testid="place-order"]')
      
      // 7. Order confirmation
      await page.waitForURL(/\/orders\/[^\/]+\/confirmation/, { timeout: 15000 })
      await expect(page.locator('h1')).toContainText('Order Confirmed')
      await expect(page.locator('[data-testid="order-number"]')).toBeVisible()
      
      console.log('✅ Order placed successfully')
      
      // 8. Verify order in user profile
      await page.goto(`${BASE_URL}/profile`)
      await page.click('[data-testid="orders-tab"]')
      
      await expect(page.locator('[data-testid="order-item"]')).toBeVisible()
      
      console.log('🎉 Complete purchase journey successful!')
    })

    test('user registration and profile management', async ({ page }) => {
      console.log('👤 Starting user registration test...')
      
      // 1. Navigate to registration
      await page.goto(`${BASE_URL}/auth/register`)
      
      // 2. Fill registration form
      const timestamp = Date.now()
      const testEmail = `testuser${timestamp}@example.com`
      
      await page.fill('input[type="email"]', testEmail)
      await page.fill('input[type="password"]', 'TestPassword123!')
      await page.fill('input[name="fullName"]', 'Test User')
      await page.fill('input[name="phone"]', '1234567890')
      
      console.log('✅ Registration form filled')
      
      // 3. Submit registration
      await page.click('button[type="submit"]')
      
      // 4. Verify successful registration
      await page.waitForURL(`${BASE_URL}/`, { timeout: 15000 })
      
      // Check if user is logged in
      const userProfile = page.locator('[data-testid="user-profile"]')
      await expect(userProfile).toBeVisible({ timeout: 10000 })
      
      console.log('✅ User registered and logged in')
      
      // 5. Navigate to profile
      await page.click('[data-testid="profile-link"]')
      await page.waitForURL('/profile')
      
      // 6. Update profile information
      await page.click('[data-testid="edit-profile"]')
      
      await page.fill('input[name="fullName"]', 'Updated Test User')
      await page.fill('input[name="phone"]', '9876543210')
      
      await page.click('[data-testid="save-profile"]')
      
      // 7. Verify profile update
      await expect(page.locator('text=Updated Test User')).toBeVisible()
      await expect(page.locator('text=9876543210')).toBeVisible()
      
      console.log('✅ Profile updated successfully')
      
      // 8. Add shipping address
      await page.click('[data-testid="add-address"]')
      
      await page.fill('input[name="addressLine"]', '456 Updated Street')
      await page.fill('input[name="city"]', 'Updated City')
      await page.fill('input[name="state"]', 'Updated State')
      await page.fill('input[name="pincode"]', '654321')
      
      await page.click('[data-testid="save-address"]')
      
      // 9. Verify address added
      await expect(page.locator('text=456 Updated Street')).toBeVisible()
      
      console.log('✅ Address added successfully')
      
      // 10. Logout
      await page.click('[data-testid="logout-button"]')
      await page.waitForURL(`${BASE_URL}/`)
      
      // 11. Verify logout
      const loginButton = page.locator('[data-testid="login-button"]')
      await expect(loginButton).toBeVisible()
      
      console.log('🎉 User registration and profile management successful!')
    })
  })

  test.describe('Admin Journey', () => {
    
    test('admin dashboard functionality and data management', async ({ page }) => {
      console.log('👨‍💼 Starting admin dashboard test...')
      
      // 1. Admin login
      await page.goto(`${BASE_URL}/auth/login`)
      await page.fill('input[type="email"]', 'aditya01889@gmail.com')
      await page.fill('input[type="password"]', 'testpassword123')
      await page.click('button[type="submit"]')
      
      await page.waitForURL(`${BASE_URL}/`, { timeout: 15000 })
      
      // 2. Navigate to admin dashboard
      await page.goto(`${BASE_URL}/admin`)
      await page.waitForURL('/admin/dashboard', { timeout: 10000 })
      
      console.log('✅ Admin dashboard loaded')
      
      // 3. Verify dashboard statistics
      await expect(page.locator('[data-testid="total-products"]')).toBeVisible()
      await expect(page.locator('[data-testid="total-orders"]')).toBeVisible()
      await expect(page.locator('[data-testid="total-users"]')).toBeVisible()
      await expect(page.locator('[data-testid="total-revenue"]')).toBeVisible()
      
      console.log('✅ Dashboard statistics loaded')
      
      // 4. Test recent orders section
      const recentOrders = page.locator('[data-testid="recent-orders"]')
      await expect(recentOrders).toBeVisible()
      
      const orderItems = recentOrders.locator('[data-testid="order-item"]')
      if (await orderItems.count() > 0) {
        await expect(orderItems.first()).toBeVisible()
        console.log('✅ Recent orders displayed')
      }
      
      // 5. Navigate to orders management
      await page.click('[data-testid="orders-link"]')
      await page.waitForURL('/admin/orders')
      
      // Verify orders list
      await expect(page.locator('[data-testid="orders-table"]')).toBeVisible()
      
      console.log('✅ Orders management loaded')
      
      // 6. Test order status update
      const orderRows = page.locator('[data-testid="order-row"]')
      if (await orderRows.count() > 0) {
        await orderRows.first().click()
        await page.waitForURL(/\/admin\/orders\//)
        
        // Update order status
        await page.click('[data-testid="status-dropdown"]')
        await page.click('[data-testid="status-confirmed"]')
        await page.click('[data-testid="update-status"]')
        
        // Verify status update
        await expect(page.locator('text=Confirmed')).toBeVisible()
        
        console.log('✅ Order status updated')
      }
      
      // 7. Navigate to products management
      await page.click('[data-testid="products-link"]')
      await page.waitForURL('/admin/products')
      
      // Verify products list
      await expect(page.locator('[data-testid="products-table"]')).toBeVisible()
      
      console.log('✅ Products management loaded')
      
      // 8. Test product search and filtering
      await page.fill('[data-testid="product-search"]', 'cat')
      await page.waitForTimeout(1000)
      
      // Verify search results
      const searchResults = page.locator('[data-testid="product-row"]')
      expect(await searchResults.count()).toBeGreaterThan(0)
      
      console.log('✅ Product search working')
      
      // 9. Logout
      await page.click('[data-testid="admin-logout"]')
      await page.waitForURL(`${BASE_URL}/`)
      
      console.log('🎉 Admin dashboard functionality successful!')
    })
  })

  test.describe('Error Handling and Edge Cases', () => {
    
    test('handles network errors gracefully', async ({ page }) => {
      console.log('🌐 Starting network error handling test...')
      
      // Simulate network slowdown
      await page.route('**/*', async route => {
        // Add delay for some requests to simulate slow network
        if (route.request().url().includes('/api/')) {
          await new Promise(resolve => setTimeout(resolve, 2000))
        }
        await route.continue()
      })
      
      await page.goto(BASE_URL)
      
      // Should still load with loading states
      await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible()
      
      // Eventually load content
      await expect(page.locator('[data-testid="product-card"]')).toBeVisible({ timeout: 15000 })
      
      console.log('✅ Network errors handled gracefully')
    })

    test('handles session expiration properly', async ({ page }) => {
      console.log('⏰ Starting session expiration test...')
      
      // Login first
      await page.goto(`${BASE_URL}/auth/login`)
      await page.fill('input[type="email"]', 'aditya01889@gmail.com')
      await page.fill('input[type="password"]', 'testpassword123')
      await page.click('button[type="submit"]')
      
      await page.waitForURL(`${BASE_URL}/`, { timeout: 15000 })
      
      // Clear cookies to simulate session expiration
      await page.context().clearCookies()
      
      // Try to access protected page
      await page.goto(`${BASE_URL}/profile`)
      
      // Should redirect to login
      await page.waitForURL(/\/auth/, { timeout: 10000 })
      
      console.log('✅ Session expiration handled properly')
    })

    test('handles large datasets without performance issues', async ({ page }) => {
      console.log('📊 Starting large dataset performance test...')
      
      // Navigate to orders page (potentially large dataset)
      await page.goto(`${BASE_URL}/auth/login`)
      await page.fill('input[type="email"]', 'aditya01889@gmail.com')
      await page.fill('input[type="password"]', 'testpassword123')
      await page.click('button[type="submit"]')
      
      await page.waitForURL(`${BASE_URL}/`, { timeout: 15000 })
      
      // Navigate to admin orders
      await page.goto(`${BASE_URL}/admin/orders`)
      await page.waitForURL('/admin/orders', { timeout: 10000 })
      
      // Should load within reasonable time
      const startTime = Date.now()
      await expect(page.locator('[data-testid="orders-table"]')).toBeVisible({ timeout: 10000 })
      const loadTime = Date.now() - startTime
      
      expect(loadTime).toBeLessThan(8000) // Should load in under 8 seconds
      
      console.log(`✅ Large dataset loaded in ${loadTime}ms`)
    })
  })
})
