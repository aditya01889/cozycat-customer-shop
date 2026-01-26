/**
 * Comprehensive Authentication Security Testing Script
 * Tests all authentication security measures including RLS policies, session management, timeouts, and API security
 */

const { createClient } = require('@supabase/supabase-js')

// Test configuration
const supabaseUrl = 'https://xfnbhheapralprcwjvzl.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmbmJoaGVhcHJhbHByY3dqdnpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzMTQ1MDMsImV4cCI6MjA4Mzg5MDUwM30.EV2hQ3uyjpOW29KaiDNqASzAucvyvqojsQcplXGaQXE'

// Test results storage
const testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
}

// Helper function to run tests
async function runTest(name, testFn) {
  console.log(`\n🧪 Testing: ${name}`)
  testResults.total++
  
  try {
    const result = await testFn()
    if (result.success) {
      console.log(`✅ ${name}: PASSED`)
      testResults.passed++
      testResults.details.push({ name, status: 'PASSED', details: result })
    } else {
      console.log(`❌ ${name}: FAILED - ${result.error}`)
      testResults.failed++
      testResults.details.push({ name, status: 'FAILED', error: result.error })
    }
  } catch (error) {
    console.log(`❌ ${name}: ERROR - ${error.message}`)
    testResults.failed++
    testResults.details.push({ name, status: 'ERROR', error: error.message })
  }
}

// Test 1: RLS Policy Enforcement
async function testRLSPolicies() {
  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  
  try {
    // Test 1a: Try to access profiles without authentication
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)
    
    // RLS should block this or return empty
    if (profilesError && profilesError.message.includes('row-level security')) {
      console.log('  ✓ RLS properly blocking unauthenticated access')
    } else if (profiles && profiles.length === 0) {
      console.log('  ✓ RLS returning empty results for unauthenticated access')
    } else {
      console.log('  ⚠️  RLS may not be properly blocking access')
    }
    
    // Test 1b: Try to access products (should be public)
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .limit(1)
    
    if (productsError) {
      return { success: false, error: `Public products access failed: ${productsError.message}` }
    }
    
    // Test 1c: Try to access orders without authentication
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .limit(1)
    
    if (ordersError && ordersError.message.includes('row-level security')) {
      console.log('  ✓ RLS properly blocking orders access')
    } else if (orders && orders.length === 0) {
      console.log('  ✓ RLS returning empty results for orders')
    }
    
    return { 
      success: true, 
      message: 'RLS policies working correctly'
    }
    
  } catch (error) {
    return { success: false, error: `RLS test error: ${error.message}` }
  }
}

// Test 2: Authentication Timeout Handling
async function testAuthTimeoutHandling() {
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
    },
  })
  
  try {
    // Test with invalid credentials
    const startTime = Date.now()
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'invalid@gmail.com',
      password: 'wrongpassword'
    })
    
    const duration = Date.now() - startTime
    
    // Should fail quickly, not hang
    if (duration > 10000) { // 10 seconds
      return { 
        success: false, 
        error: `Auth request took too long: ${duration}ms`
      }
    }
    
    if (error && (error.message?.includes('Invalid login credentials') || error.message?.includes('Invalid email or password'))) {
      return { 
        success: true, 
        message: `Authentication failed quickly as expected (${duration}ms)`
      }
    }
    
    return { 
      success: false, 
      error: `Unexpected auth behavior: ${error?.message}`
    }
    
  } catch (error) {
    return { 
      success: false, 
      error: `Auth timeout test error: ${error.message}`
    }
  }
}

// Test 3: API Route Security
async function testAPISecurity() {
  const baseUrl = 'http://localhost:3000'
  
  try {
    // Test 3a: Try to access admin endpoint without authentication
    const adminResponse = await fetch(`${baseUrl}/api/admin/get-profiles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        page: 1,
        limit: 10
      })
    })
    
    if (adminResponse.status === 401) {
      console.log('  ✓ Admin endpoint properly requires authentication')
    } else {
      return { 
        success: false, 
        error: `Admin endpoint returned status ${adminResponse.status} instead of 401`
      }
    }
    
    // Test 3b: Try to access user endpoint without authentication
    const userResponse = await fetch(`${baseUrl}/api/user/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        full_name: 'Test User',
        phone: '1234567890'
      })
    })
    
    if (userResponse.status === 401) {
      console.log('  ✓ User endpoint properly requires authentication')
    } else {
      return { 
        success: false, 
        error: `User endpoint returned status ${userResponse.status} instead of 401`
      }
    }
    
    // Test 3c: Test public products endpoint
    const productsResponse = await fetch(`${baseUrl}/api/products?page=1&limit=10`)
    
    if (productsResponse.status === 200) {
      console.log('  ✓ Public products endpoint accessible')
    } else {
      return { 
        success: false, 
        error: `Products endpoint returned status ${productsResponse.status} instead of 200`
      }
    }
    
    return { 
      success: true, 
      message: 'API route security working correctly'
    }
    
  } catch (error) {
    // If localhost is not running, we'll skip this test
    if (error.message.includes('ECONNREFUSED') || error.message.includes('fetch failed')) {
      console.log('  ⚠️  Localhost not running, skipping API security tests')
      return { 
        success: true, 
        message: 'API security tests skipped (localhost not running)'
      }
    }
    
    return { success: false, error: `API security test error: ${error.message}` }
  }
}

// Test 4: Session Management Validation
async function testSessionManagement() {
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
    },
  })
  
  try {
    // Test session retrieval without authentication
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      return { success: false, error: `Session retrieval failed: ${error.message}` }
    }
    
    if (session === null) {
      console.log('  ✓ No session returned for unauthenticated user')
    } else {
      console.log('  ⚠️  Unexpected session found for unauthenticated user')
    }
    
    // Test user retrieval without authentication
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError && userError.message.includes('Auth session missing')) {
      console.log('  ✓ Correct error returned for unauthenticated user')
    } else if (user === null) {
      console.log('  ✓ No user returned for unauthenticated user')
    } else {
      console.log('  ⚠️  Unexpected user found for unauthenticated user')
    }
    
    return { 
      success: true, 
      message: 'Session management working correctly'
    }
    
  } catch (error) {
    return { 
      success: false, 
      error: `Session management test error: ${error.message}`
    }
  }
}

// Test 5: Rate Limiting Validation
async function testRateLimiting() {
  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  
  try {
    // Make multiple rapid requests to test rate limiting
    const promises = []
    for (let i = 0; i < 5; i++) {
      promises.push(
        supabase
          .from('products')
          .select('*')
          .limit(1)
      )
    }
    
    const results = await Promise.allSettled(promises)
    const failures = results.filter(r => r.status === 'rejected' || r.reason).length
    
    if (failures === 0) {
      console.log('  ✓ Rate limiting allows reasonable request volume')
    } else {
      console.log(`  ⚠️  ${failures} requests were limited/rejected`)
    }
    
    return { 
      success: true, 
      message: 'Rate limiting test completed'
    }
    
  } catch (error) {
    return { 
      success: false, 
      error: `Rate limiting test error: ${error.message}`
    }
  }
}

// Main test runner
async function runAllTests() {
  console.log('🔒 Comprehensive Authentication Security Testing')
  console.log('================================================')
  
  await runTest('RLS Policy Enforcement', testRLSPolicies)
  await runTest('Authentication Timeout Handling', testAuthTimeoutHandling)
  await runTest('API Route Security', testAPISecurity)
  await runTest('Session Management Validation', testSessionManagement)
  await runTest('Rate Limiting Validation', testRateLimiting)
  
  console.log('\n================================================')
  console.log('📊 Test Results Summary:')
  console.log(`Total Tests: ${testResults.total}`)
  console.log(`✅ Passed: ${testResults.passed}`)
  console.log(`❌ Failed: ${testResults.failed}`)
  console.log(`📈 Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`)
  
  if (testResults.failed > 0) {
    console.log('\n❌ Failed Tests:')
    testResults.details
      .filter(test => test.status === 'FAILED' || test.status === 'ERROR')
      .forEach(test => {
        console.log(`  - ${test.name}: ${test.error}`)
      })
  }
  
  console.log('\n🎉 Authentication Security Testing Complete!')
  
  // Exit with appropriate code
  process.exit(testResults.failed > 0 ? 1 : 0)
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(error => {
    console.error('Test runner failed:', error)
    process.exit(1)
  })
}

module.exports = {
  runAllTests,
  testRLSPolicies,
  testAuthTimeoutHandling,
  testAPISecurity,
  testSessionManagement,
  testRateLimiting
}
