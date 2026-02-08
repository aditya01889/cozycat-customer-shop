#!/usr/bin/env node

/**
 * Step 4.1: Setup Testing Infrastructure
 * Installs testing dependencies and creates configuration
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Step 4.1: Setup Testing Infrastructure');
console.log('==========================================');

// Create tests directory structure
const TESTS_DIR = path.join(__dirname, '../../tests');
const UNIT_DIR = path.join(TESTS_DIR, 'unit');
const E2E_DIR = path.join(TESTS_DIR, 'e2e');
const INTEGRATION_DIR = path.join(TESTS_DIR, 'integration');

[TESTS_DIR, UNIT_DIR, E2E_DIR, INTEGRATION_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`✅ Created directory: ${dir}`);
    }
});

// Install testing dependencies
console.log('\n📦 Installing testing dependencies...');
try {
    execSync('npm install --save-dev @playwright/test jest @testing-library/react @testing-library/jest-dom supertest @types/jest ts-jest', { 
        stdio: 'inherit',
        cwd: path.join(__dirname, '../../')
    });
    console.log('✅ Testing dependencies installed');
} catch (error) {
    console.log('❌ Failed to install dependencies:', error.message);
    process.exit(1);
}

// Create Jest configuration
const jestConfig = `module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/jest.setup.js'],
  testMatch: ['<rootDir>/tests/**/*.test.{js,ts,tsx}'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'ts-jest'
  }
};`;

fs.writeFileSync(path.join(__dirname, '../../jest.config.js'), jestConfig);
console.log('✅ Created Jest configuration');

// Create Jest setup file
const jestSetup = `import '@testing-library/jest-dom';

// Mock Supabase client
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ data: [], error: null })),
        insert: jest.fn(() => Promise.resolve({ data: null, error: null })),
        update: jest.fn(() => Promise.resolve({ data: null, error: null })),
        delete: jest.fn(() => Promise.resolve({ data: null, error: null }))
      }))
    })),
    auth: {
      signIn: jest.fn(() => Promise.resolve({ data: { user: { id: 'test-user' } }, error: null })),
      signOut: jest.fn(() => Promise.resolve({ error: null }))
    }
  }
}));

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/'
  })
}));`;

fs.writeFileSync(path.join(TESTS_DIR, 'jest.setup.js'), jestSetup);
console.log('✅ Created Jest setup file');

// Create Playwright configuration
const playwrightConfig = `import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});`;

fs.writeFileSync(path.join(__dirname, '../../playwright.config.ts'), playwrightConfig);
console.log('✅ Created Playwright configuration');

// Create test utilities
const testUtils = `import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';

// Custom render function with providers
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  // Add any providers here (Theme, Cart, Auth, etc.)
  return render(ui, { ...options });
};

// Re-export everything from testing-library
export * from '@testing-library/react';
export { customRender as render };`;

fs.writeFileSync(path.join(TESTS_DIR, 'test-utils.tsx'), testUtils);
console.log('✅ Created test utilities');

// Create test data factory
const testDataFactory = `export const createTestProduct = (overrides = {}) => ({
  id: 'test-product-id',
  name: 'Test Product',
  slug: 'test-product',
  description: 'Test product description',
  price: 299,
  weight_grams: 100,
  is_active: true,
  display_order: 1,
  category_id: 'test-category-id',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides
});

export const createTestOrder = (overrides = {}) => ({
  id: 'test-order-id',
  order_number: 'ORD-001',
  customer_id: 'test-customer-id',
  status: 'pending',
  total_amount: 299,
  order_date: new Date().toISOString(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides
});

export const createTestCategory = (overrides = {}) => ({
  id: 'test-category-id',
  name: 'Test Category',
  slug: 'test-category',
  description: 'Test category description',
  is_active: true,
  display_order: 1,
  created_at: new Date().toISOString(),
  ...overrides
});`;

fs.writeFileSync(path.join(TESTS_DIR, 'test-data-factory.ts'), testDataFactory);
console.log('✅ Created test data factory');

console.log('\n🎯 Testing Infrastructure Setup Complete!');
console.log('📁 Created:');
console.log('   - Jest configuration');
console.log('   - Playwright configuration');
console.log('   - Test directories (unit, e2e, integration)');
console.log('   - Test utilities and data factory');
console.log('📦 Installed testing dependencies');
console.log('🚀 Ready for Step 4.2: Unit Tests');
