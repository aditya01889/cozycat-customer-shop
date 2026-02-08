import { test, expect } from '@playwright/test';

test.describe('Shopping Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to products page before each test
    await page.goto('/products');
  });

  test('should display products page correctly', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Products');
    await expect(page.locator('[data-testid="product-card"]')).toHaveCount.greaterThan(0);
  });

  test('should add product to cart', async ({ page }) => {
    // Click first product
    await page.click('[data-testid="product-card"]:first-child');
    
    // Wait for product detail page
    await expect(page.locator('h1')).toContainText('Product Details');
    
    // Add to cart
    await page.click('[data-testid="add-to-cart"]');
    
    // Check cart count updated
    await expect(page.locator('[data-testid="cart-count"]')).toContainText('1');
  });

  test('should view cart contents', async ({ page }) => {
    // Add product to cart first
    await page.click('[data-testid="product-card"]:first-child');
    await page.click('[data-testid="add-to-cart"]');
    
    // Navigate to cart
    await page.click('[data-testid="cart-icon"]');
    
    // Verify cart page
    await expect(page.locator('h1')).toContainText('Shopping Cart');
    await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(1);
  });

  test('should proceed to checkout', async ({ page }) => {
    // Add product to cart
    await page.click('[data-testid="product-card"]:first-child');
    await page.click('[data-testid="add-to-cart"]');
    
    // Go to cart
    await page.click('[data-testid="cart-icon"]');
    
    // Proceed to checkout
    await page.click('[data-testid="proceed-to-checkout"]');
    
    // Verify checkout page
    await expect(page.locator('h1')).toContainText('Checkout');
    await expect(page.locator('[data-testid="checkout-form"]')).toBeVisible();
  });

  test('should complete checkout flow', async ({ page }) => {
    // Add product to cart
    await page.click('[data-testid="product-card"]:first-child');
    await page.click('[data-testid="add-to-cart"]');
    
    // Go to checkout
    await page.click('[data-testid="cart-icon"]');
    await page.click('[data-testid="proceed-to-checkout"]');
    
    // Fill checkout form
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="full-name"]', 'Test User');
    await page.fill('[data-testid="phone"]', '+1234567890');
    await page.fill('[data-testid="address"]', '123 Test Street');
    await page.fill('[data-testid="city"]', 'Test City');
    await page.fill('[data-testid="postal-code"]', '12345');
    
    // Submit order
    await page.click('[data-testid="place-order"]');
    
    // Verify order confirmation
    await expect(page.locator('h1')).toContainText('Order Confirmation');
    await expect(page.locator('[data-testid="order-number"]')).toBeVisible();
  });
});

test.describe('Product Search', () => {
  test('should search for products', async ({ page }) => {
    await page.goto('/products');
    
    // Enter search term
    await page.fill('[data-testid="search-input"]', 'test product');
    await page.press('[data-testid="search-input"]', 'Enter');
    
    // Verify search results
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    await expect(page.locator('[data-testid="product-card"]')).toHaveCount.greaterThan(0);
  });

  test('should filter products by category', async ({ page }) => {
    await page.goto('/products');
    
    // Select category
    await page.click('[data-testid="category-filter"]');
    await page.click('[data-testid="category-option"]:first-child');
    
    // Verify filtered results
    await expect(page.locator('[data-testid="product-card"]')).toHaveCount.greaterThan(0);
  });
});

test.describe('User Authentication', () => {
  test('should login successfully', async ({ page }) => {
    await page.goto('/login');
    
    // Fill login form
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    
    // Submit form
    await page.click('[data-testid="login-button"]');
    
    // Verify successful login
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
    await expect(page.url()).toContain('/dashboard');
  });

  test('should register new user', async ({ page }) => {
    await page.goto('/register');
    
    // Fill registration form
    await page.fill('[data-testid="email"]', 'newuser@example.com');
    await page.fill('[data-testid="password"]', 'NewPass123!');
    await page.fill('[data-testid="confirm-password"]', 'NewPass123!');
    await page.fill('[data-testid="full-name"]', 'New User');
    await page.fill('[data-testid="phone"]', '+1234567890');
    
    // Submit form
    await page.click('[data-testid="register-button"]');
    
    // Verify successful registration
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Registration successful');
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    // Logout
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="logout-button"]');
    
    // Verify logout
    await expect(page.locator('[data-testid="login-button"]')).toBeVisible();
    await expect(page.url()).toContain('/login');
  });
});

test.describe('Order Management', () => {
  test('should view order history', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    // Navigate to orders
    await page.click('[data-testid="orders-link"]');
    
    // Verify orders page
    await expect(page.locator('h1')).toContainText('Order History');
    await expect(page.locator('[data-testid="order-item"]')).toHaveCount.greaterThan(0);
  });

  test('should view order details', async ({ page }) => {
    // Login and go to orders
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-button"]');
    await page.click('[data-testid="orders-link"]');
    
    // Click first order
    await page.click('[data-testid="order-item"]:first-child');
    
    // Verify order details
    await expect(page.locator('h1')).toContainText('Order Details');
    await expect(page.locator('[data-testid="order-status"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-items"]')).toBeVisible();
  });
});

test.describe('Responsive Design', () => {
  test('should work on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone size
    await page.goto('/products');
    
    // Verify mobile layout
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
    await expect(page.locator('[data-testid="product-card"]')).toHaveCount.greaterThan(0);
  });

  test('should work on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad size
    await page.goto('/products');
    
    // Verify tablet layout
    await expect(page.locator('[data-testid="product-card"]')).toHaveCount.greaterThan(0);
  });

  test('should work on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 }); // Desktop size
    await page.goto('/products');
    
    // Verify desktop layout
    await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();
    await expect(page.locator('[data-testid="product-card"]')).toHaveCount.greaterThan(0);
  });
});
