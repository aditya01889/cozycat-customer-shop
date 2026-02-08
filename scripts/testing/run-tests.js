#!/usr/bin/env node

/**
 * Step 4: Test Runner
 * Runs unit tests and E2E tests
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Step 4: Comprehensive Testing Framework');
console.log('==========================================');

const TEST_TYPE = process.argv[2] || 'all';

async function runUnitTests() {
  console.log('\n📋 Running Unit Tests...');
  try {
    execSync('npm test -- --watchAll=false --coverage', { 
      stdio: 'inherit',
      cwd: path.join(__dirname, '../../')
    });
    console.log('✅ Unit tests completed');
  } catch (error) {
    console.log('❌ Unit tests failed:', error.message);
    return false;
  }
  return true;
}

async function runE2ETests() {
  console.log('\n🌐 Running E2E Tests...');
  try {
    execSync('npx playwright test', { 
      stdio: 'inherit',
      cwd: path.join(__dirname, '../../')
    });
    console.log('✅ E2E tests completed');
  } catch (error) {
    console.log('❌ E2E tests failed:', error.message);
    return false;
  }
  return true;
}

async function generateTestReport() {
  console.log('\n📊 Generating Test Report...');
  
  const reportData = {
    timestamp: new Date().toISOString(),
    step: 'Step 4: Comprehensive Testing Framework',
    testSuites: [
      {
        name: 'Unit Tests',
        type: 'unit',
        framework: 'Jest',
        coverage: '80% threshold',
        status: 'Ready to run'
      },
      {
        name: 'E2E Tests',
        type: 'end-to-end',
        framework: 'Playwright',
        browsers: ['Chromium', 'Firefox', 'WebKit'],
        status: 'Ready to run'
      }
    ],
    testFiles: [
      'tests/unit/cart.test.ts',
      'tests/unit/products.test.ts', 
      'tests/unit/orders.test.ts',
      'tests/unit/auth.test.ts',
      'tests/e2e/shopping-flow.spec.ts'
    ],
    nextSteps: [
      'Run unit tests: npm test',
      'Run E2E tests: npx playwright test',
      'Review coverage reports',
      'Fix any failing tests'
    ]
  };

  const RESULTS_DIR = path.join(__dirname, '../results');
  if (!fs.existsSync(RESULTS_DIR)) {
    fs.mkdirSync(RESULTS_DIR, { recursive: true });
  }

  const reportFile = path.join(RESULTS_DIR, 'step4-testing-framework.json');
  fs.writeFileSync(reportFile, JSON.stringify(reportData, null, 2));
  
  console.log('✅ Test report saved to:', reportFile);
  return reportData;
}

async function main() {
  const reportData = await generateTestReport();
  
  console.log('\n📋 Test Framework Summary:');
  console.log('✅ Unit Tests: Jest with 80% coverage threshold');
  console.log('✅ E2E Tests: Playwright with multi-browser support');
  console.log('✅ Test Files: 5 test files created');
  console.log('✅ Configuration: Jest + Playwright setup complete');
  
  console.log('\n🚀 Ready to run tests:');
  console.log('   npm test                    # Run unit tests');
  console.log('   npx playwright test           # Run E2E tests');
  console.log('   npm run test:coverage      # Run with coverage');
  
  if (TEST_TYPE === 'unit') {
    const success = await runUnitTests();
    process.exit(success ? 0 : 1);
  } else if (TEST_TYPE === 'e2e') {
    const success = await runE2ETests();
    process.exit(success ? 0 : 1);
  } else {
    console.log('\n💡 To run specific test types:');
    console.log('   node scripts/testing/run-tests.js unit   # Run only unit tests');
    console.log('   node scripts/testing/run-tests.js e2e    # Run only E2E tests');
    console.log('   node scripts/testing/run-tests.js all    # Show summary (default)');
  }
}

main().catch(console.error);
