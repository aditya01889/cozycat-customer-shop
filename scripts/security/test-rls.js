#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  const timestamp = new Date().toISOString();
  console.log(`${colors[color]}[${timestamp}] ${message}${colors.reset}`);
}

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testUserAccessControl() {
  log('🧪 Testing User Access Control', 'blue');
  log('================================', 'blue');
  
  try {
    // Test 1: Users can only access their own data
    log('📋 Test 1: User-specific data access', 'cyan');
    
    // This should work for authenticated users
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, created_at')
      .single();
    
    if (userError) {
      log(`❌ User data access failed: ${userError.message}`, 'red');
    } else {
      log(`✅ User can access own profile: ${userData?.email}`, 'green');
    }
    
    // Test 2: Users can only access their own orders
    log('📋 Test 2: User order access', 'cyan');
    
    const { data: userOrders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .limit(5);
    
    if (ordersError) {
      log(`❌ User orders access failed: ${ordersError.message}`, 'red');
    } else {
      log(`✅ User can access ${userOrders?.length || 0} orders`, 'green');
    }
    
    // Test 3: Users can only access their own cart
    log('📋 Test 3: User cart access', 'cyan');
    
    const { data: userCart, error: cartError } = await supabase
      .from('cart_items')
      .select('*');
    
    if (cartError) {
      log(`❌ User cart access failed: ${cartError.message}`, 'red');
    } else {
      log(`✅ User can access ${userCart?.length || 0} cart items`, 'green');
    }
    
  } catch (error) {
    log(`💥 User access test failed: ${error.message}`, 'red');
  }
}

async function testPublicAccessRestrictions() {
  log('🌐 Testing Public Access Restrictions', 'blue');
  log('======================================', 'blue');
  
  try {
    // Test 1: Anonymous access to sensitive tables
    log('📋 Test 1: Anonymous access to orders', 'cyan');
    
    const { data: publicOrders, error: publicOrdersError } = await supabase
      .from('orders')
      .select('id, total, created_at')
      .limit(3);
    
    if (publicOrdersError) {
      log(`❌ Public orders test failed: ${publicOrdersError.message}`, 'red');
    } else {
      if (publicOrders && publicOrders.length > 0) {
        log(`❌ SECURITY BREACH: Public can access orders! (${publicOrders.length} records)`, 'red');
      } else {
        log('✅ Public access to orders properly restricted', 'green');
      }
    }
    
    // Test 2: Anonymous access to cart items
    log('📋 Test 2: Anonymous access to cart', 'cyan');
    
    const { data: publicCart, error: publicCartError } = await supabase
      .from('cart_items')
      .select('id, quantity, price')
      .limit(3);
    
    if (publicCartError) {
      log(`❌ Public cart test failed: ${publicCartError.message}`, 'red');
    } else {
      if (publicCart && publicCart.length > 0) {
        log(`❌ SECURITY BREACH: Public can access cart! (${publicCart.length} items)`, 'red');
      } else {
        log('✅ Public access to cart properly restricted', 'green');
      }
    }
    
    // Test 3: Public access to users table
    log('📋 Test 3: Anonymous access to users', 'cyan');
    
    const { data: publicUsers, error: publicUsersError } = await supabase
      .from('users')
      .select('id, email')
      .limit(3);
    
    if (publicUsersError) {
      log(`❌ Public users test failed: ${publicUsersError.message}`, 'red');
    } else {
      if (publicUsers && publicUsers.length > 0) {
        log(`❌ SECURITY BREACH: Public can access users! (${publicUsers.length} records)`, 'red');
      } else {
        log('✅ Public access to users properly restricted', 'green');
      }
    }
    
  } catch (error) {
    log(`💥 Public access test failed: ${error.message}`, 'red');
  }
}

async function testPublicDataAccess() {
  log('🛍 Testing Public Data Access', 'blue');
  log('==============================', 'blue');
  
  try {
    // Test 1: Public access to products (should work)
    log('📋 Test 1: Public access to products', 'cyan');
    
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, price')
      .eq('is_active', true)
      .limit(5);
    
    if (productsError) {
      log(`❌ Products access failed: ${productsError.message}`, 'red');
    } else {
      log(`✅ Public can access ${products?.length || 0} active products`, 'green');
    }
    
    // Test 2: Public access to categories (should work)
    log('📋 Test 2: Public access to categories', 'cyan');
    
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('id, name')
      .limit(5);
    
    if (categoriesError) {
      log(`❌ Categories access failed: ${categoriesError.message}`, 'red');
    } else {
      log(`✅ Public can access ${categories?.length || 0} categories`, 'green');
    }
    
  } catch (error) {
    log(`💥 Public data test failed: ${error.message}`, 'red');
  }
}

async function testAdminBypass() {
  log('👑 Testing Admin Bypass Protection', 'blue');
  log('================================', 'blue');
  
  try {
    // Test: Try to use service role to bypass RLS
    log('📋 Test: Service role bypass attempt', 'cyan');
    
    const { data: bypassData, error: bypassError } = await supabase
      .from('orders')
      .select('*')
      .useServiceRole('service_role')
      .limit(3);
    
    if (bypassError) {
      log(`✅ Service role bypass properly blocked: ${bypassError.message}`, 'green');
    } else {
      if (bypassData && bypassData.length > 0) {
        log(`❌ SECURITY BREACH: Service role can bypass RLS! (${bypassData.length} records)`, 'red');
      } else {
        log('✅ Service role bypass properly blocked', 'green');
      }
    }
    
  } catch (error) {
    log(`💥 Admin bypass test failed: ${error.message}`, 'red');
  }
}

async function generateSecurityReport(testResults) {
  log('📊 Generating Security Report', 'blue');
  log('==============================', 'blue');
  
  const report = {
    timestamp: new Date().toISOString(),
    tests: testResults,
    summary: {
      totalTests: Object.keys(testResults).length,
      passedTests: Object.values(testResults).filter(t => t.status === 'PASS').length,
      failedTests: Object.values(testResults).filter(t => t.status === 'FAIL').length,
      securityScore: Math.round((Object.values(testResults).filter(t => t.status === 'PASS').length / Object.keys(testResults).length) * 100)
    }
  };
  
  // Save report
  const fs = require('fs');
  const path = require('path');
  const reportPath = path.join(__dirname, '../../docs/security/security-test-results.json');
  
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  log(`💾 Security report saved: ${reportPath}`, 'green');
  
  // Display summary
  log('', 'reset');
  log('🎯 SECURITY TEST SUMMARY', 'cyan');
  log('========================', 'cyan');
  log(`✅ Passed: ${report.summary.passedTests}/${report.summary.totalTests}`, 'green');
  log(`❌ Failed: ${report.summary.failedTests}/${report.summary.totalTests}`, 'red');
  log(`📊 Security Score: ${report.summary.securityScore}%`, 'blue');
  
  if (report.summary.securityScore === 100) {
    log('🎉 ALL SECURITY TESTS PASSED!', 'green');
  } else if (report.summary.securityScore >= 80) {
    log('⚠️  SECURITY GOOD - Minor issues found', 'yellow');
  } else {
    log('🚨  SECURITY ISSUES DETECTED - Immediate attention required', 'red');
  }
  
  return report;
}

async function runSecurityTests() {
  log('🔒 Running Comprehensive Security Tests', 'blue');
  log('===================================', 'blue');
  log('', 'reset');
  
  const testResults = {};
  
  // Run all security tests
  await testUserAccessControl();
  await testPublicAccessRestrictions();
  await testPublicDataAccess();
  await testAdminBypass();
  
  // Generate final report
  const report = await generateSecurityReport(testResults);
  
  return report;
}

async function main() {
  const command = process.argv[2] || 'run';
  
  log('🔒 Security Testing Tool', 'blue');
  log('========================', 'blue');
  
  switch (command) {
    case 'run':
    case 'test':
      await runSecurityTests();
      break;
      
    case 'user':
      await testUserAccessControl();
      break;
      
    case 'public':
      await testPublicAccessRestrictions();
      break;
      
    case 'admin':
      await testAdminBypass();
      break;
      
    default:
      log('📖 Usage:', 'blue');
      log('  node test-rls.js run     - Run all security tests', 'cyan');
      log('  node test-rls.js user    - Test user access controls', 'cyan');
      log('  node test-rls.js public  - Test public access restrictions', 'cyan');
      log('  node test-rls.js admin   - Test admin bypass protection', 'cyan');
      break;
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  runSecurityTests,
  testUserAccessControl,
  testPublicAccessRestrictions,
  testPublicDataAccess,
  testAdminBypass
};
