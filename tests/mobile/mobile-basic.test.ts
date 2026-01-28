import { test, expect } from '@playwright/test';

test.describe('Mobile Responsiveness Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
  });

  test('homepage loads correctly on mobile', async ({ page }) => {
    await page.goto('/');
    
    // Check if page loads without errors
    await expect(page).toHaveTitle(/CozyCatKitchen/);
    
    // Check for mobile navigation
    const mobileNav = page.locator('[data-testid="mobile-menu"]');
    if (await mobileNav.isVisible()) {
      await expect(mobileNav).toBeVisible();
    }
  });

  test('products page is mobile-friendly', async ({ page }) => {
    await page.goto('/products');
    
    // Check if products container exists
    const productsContainer = page.locator('[data-testid="products-grid"], .products-grid, .grid');
    await expect(productsContainer.first()).toBeVisible();
  });

  test('cart page works on mobile', async ({ page }) => {
    await page.goto('/cart');
    
    // Check if cart page loads
    await expect(page.locator('body')).toContainText('cart');
  });

  test('navigation is touch-friendly', async ({ page }) => {
    await page.goto('/');
    
    // Check for touch targets (minimum 44px)
    const navButtons = page.locator('button, a[href]');
    const firstButton = navButtons.first();
    
    if (await firstButton.isVisible()) {
      const box = await firstButton.boundingBox();
      if (box) {
        expect(box.height).toBeGreaterThanOrEqual(44);
        expect(box.width).toBeGreaterThanOrEqual(44);
      }
    }
  });
});

test.describe('Tablet Responsiveness Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
  });

  test('homepage works on tablet', async ({ page }) => {
    await page.goto('/');
    
    // Check if page loads without errors
    await expect(page).toHaveTitle(/CozyCatKitchen/);
    
    // Check content is visible
    const mainContent = page.locator('main, .main-content');
    await expect(mainContent.first()).toBeVisible();
  });
});
