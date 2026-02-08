import { test, expect } from '@playwright/test';

test.describe('Simple E2E Tests', () => {
  test('should handle basic page interactions', async ({ page }) => {
    // Test basic browser functionality
    await page.goto('about:blank');
    
    // Create a simple test page
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head><title>Test Page</title></head>
        <body>
          <h1>Test Page</h1>
          <button id="test-button">Click Me</button>
          <div id="result"></div>
        </body>
      </html>
    `);
    
    // Test page title
    await expect(page).toHaveTitle('Test Page');
    
    // Test button click
    await page.click('#test-button');
    
    // Add JavaScript to handle button click
    await page.evaluate(() => {
      const button = document.getElementById('test-button');
      const result = document.getElementById('result');
      
      button.addEventListener('click', () => {
        result.textContent = 'Button clicked!';
      });
    });
    
    // Click button again
    await page.click('#test-button');
    
    // Verify result
    await expect(page.locator('#result')).toHaveText('Button clicked!');
  });

  test('should handle form interactions', async ({ page }) => {
    await page.goto('about:blank');
    
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head><title>Form Test</title></head>
        <body>
          <form id="test-form">
            <input type="text" id="name" placeholder="Enter name" />
            <input type="email" id="email" placeholder="Enter email" />
            <button type="submit">Submit</button>
          </form>
          <div id="form-result"></div>
        </body>
      </html>
    `);
    
    // Fill form
    await page.fill('#name', 'Test User');
    await page.fill('#email', 'test@example.com');
    
    // Add form submission handler
    await page.evaluate(() => {
      const form = document.getElementById('test-form');
      const result = document.getElementById('form-result');
      
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        result.textContent = `Form submitted: ${name} (${email})`;
      });
    });
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Verify result
    await expect(page.locator('#form-result')).toHaveText('Form submitted: Test User (test@example.com)');
  });

  test('should handle responsive design', async ({ page }) => {
    await page.goto('about:blank');
    
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Responsive Test</title>
          <style>
            .container { max-width: 1200px; margin: 0 auto; }
            .mobile-only { display: none; }
            @media (max-width: 768px) {
              .mobile-only { display: block; }
              .desktop-only { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="desktop-only">Desktop Content</div>
            <div class="mobile-only">Mobile Content</div>
          </div>
        </body>
      </html>
    `);
    
    // Test desktop view
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('.desktop-only')).toBeVisible();
    await expect(page.locator('.mobile-only')).toBeHidden();
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('.mobile-only')).toBeVisible();
    await expect(page.locator('.desktop-only')).toBeHidden();
  });

  test('should handle network conditions', async ({ page }) => {
    await page.goto('about:blank');
    
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head><title>Network Test</title></head>
        <body>
          <button id="fetch-data">Fetch Data</button>
          <div id="data-result"></div>
        </body>
      </html>
    `);
    
    // Mock API response
    await page.route('**/api/data', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Mock data response' })
      });
    });
    
    // Add fetch handler
    await page.evaluate(() => {
      const button = document.getElementById('fetch-data');
      const result = document.getElementById('data-result');
      
      button.addEventListener('click', async () => {
        try {
          const response = await fetch('/api/data');
          const data = await response.json();
          result.textContent = data.message;
        } catch (error) {
          result.textContent = 'Error: ' + error.message;
        }
      });
    });
    
    // Click fetch button
    await page.click('#fetch-data');
    
    // Verify result
    await expect(page.locator('#data-result')).toHaveText('Mock data response');
  });
});
