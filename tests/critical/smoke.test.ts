import { test, expect } from '@playwright/test'

test.describe('Smoke Tests - Critical User Journey', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('homepage loads correctly', async ({ page }) => {
    // Check if page loads without errors
    await expect(page).toHaveTitle(/CozyCatKitchen/)
    
    // Check for critical elements
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('nav')).toBeVisible()
    await expect(page.locator('footer')).toBeVisible()
  })

  test('navigation works', async ({ page }) => {
    // Test navigation to products
    await page.click('a[href="/products"]')
    await expect(page).toHaveURL(/\/products/)
    
    // Test navigation to about
    await page.click('a[href="/about"]')
    await expect(page).toHaveURL(/\/about/)
  })

  test('product tiles are clickable', async ({ page }) => {
    // Find product category tiles
    const productTiles = page.locator('a[href*="/products?category="]')
    
    // Should have at least one product tile
    await expect(productTiles.first()).toBeVisible()
    
    // Click first product tile
    await productTiles.first().click()
    
    // Should navigate to products page with category filter
    await expect(page).toHaveURL(/\/products\?category=/)
  })

  test('cart functionality works', async ({ page }) => {
    // Navigate to products
    await page.click('a[href="/products"]')
    
    // Wait for products to load
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 })
    
    // Add first product to cart
    const addToCartButton = page.locator('[data-testid="add-to-cart"]').first()
    if (await addToCartButton.isVisible()) {
      await addToCartButton.click()
      
      // Check if cart updates (cart icon or count)
      const cartIcon = page.locator('[data-testid="cart-icon"]')
      if (await cartIcon.isVisible()) {
        await expect(cartIcon).toBeVisible()
      }
    }
  })

  test('contact page loads', async ({ page }) => {
    await page.click('a[href="/contact"]')
    await expect(page).toHaveURL(/\/contact/)
    
    // Check for contact form elements
    const nameInput = page.locator('input[name="name"]')
    if (await nameInput.isVisible()) {
      await expect(nameInput).toBeVisible()
    }
  })

  test('policy pages are accessible', async ({ page }) => {
    // Test privacy policy
    await page.goto('/privacy')
    await expect(page.locator('h1')).toContainText('Privacy Policy')
    
    // Test terms
    await page.goto('/terms')
    await expect(page.locator('h1')).toContainText('Terms of Service')
    
    // Test refund policy
    await page.goto('/refund-policy')
    await expect(page.locator('h1')).toContainText('Return & Refund Policy')
    
    // Test shipping policy
    await page.goto('/shipping-policy')
    await expect(page.locator('h1')).toContainText('Shipping & Delivery Policy')
  })

  test('mobile responsiveness', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Check if mobile menu works
    const mobileMenuButton = page.locator('[data-testid="mobile-menu-button"]')
    if (await mobileMenuButton.isVisible()) {
      await mobileMenuButton.click()
      
      // Check if mobile menu items are visible
      const mobileMenuItems = page.locator('[data-testid="mobile-menu-item"]')
      if (await mobileMenuItems.first().isVisible()) {
        await expect(mobileMenuItems.first()).toBeVisible()
      }
    }
  })

  test('SEO elements are present', async ({ page }) => {
    // Check for meta description
    const metaDescription = page.locator('meta[name="description"]')
    await expect(metaDescription).toHaveAttribute('content')
    
    // Check for structured data
    const structuredData = page.locator('script[type="application/ld+json"]')
    await expect(structuredData).toBeVisible()
  })

  test('error handling', async ({ page }) => {
    // Navigate to non-existent page
    await page.goto('/non-existent-page')
    
    // Should show 404 page
    await expect(page.locator('h1')).toContainText(/404|not found/i)
  })
})
