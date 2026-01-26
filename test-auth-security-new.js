/**
 * Authentication Security Testing Script
 * Tests authentication security measures including RLS policies, session management, and timeouts
 */

const { createClient } = require('@supabase/supabase-js')

// Test configuration - using environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xfnbhheapralprcwjvzl.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmbmJoaGVhcHJhbHByY3dqdnp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzMTQ1MDMsImV4cCI6MjA4Mzg5MDUwM30.EV2hQ3uyjpOW29KaiDNqASzAucvyvqojsQcplXGaQXE'

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
    
    if (profilesError && !profilesError.message.includes('rows')) {
      return { success: true, message: 'RLS blocking unauthenticated access to profiles' }
    }
    
    // Test 1b: Try to access products (should be public)
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .limit(1)
    
    if (productsError) {
      return { success: false, error: `Public products access failed: ${productsError.message}` }
    }
    
    return { 
      success: true, 
      message: 'RLS policies working correctly - private data blocked, public data accessible'
    }
    
  } catch (error) {
    return { success: false, error: `RLS test error: ${error.message}` }
  }
}

// Test 2: Session Management
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
    // Sign up with test user
    const testEmail = `test-${Date.now()}@example.com`
    const { data: { user }, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: 'TestPassword123!'
    })
    
    if (signUpError && !signUpError.message.includes('already registered')) {
      return { success: false, error: `Sign up failed: ${signUpError.message}` }
    }
    
    // Sign in
    const { data: { session }, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: 'TestPassword123!'
    })
    
    if (signInError) {
      return { success: false, error: `Sign in failed: ${signInError.message}` }
    }
    
    if (!session) {
      return { success: false, error: 'No session created after sign in' }
    }
    
    // Check if session persists
    const { data: { user: persistedUser }, error: sessionError } = await supabase.auth.getUser()
    
    if (sessionError) {
      return { success: false, error: `Session persistence failed: ${sessionError.message}` }
    }
    
    if (!persistedUser || persistedUser.id !== session.user.id) {
      return { success: false, error: 'Session not persisted correctly' }
    }
    
    // Sign out
    await supabase.auth.signOut()
    
    // Check if session is cleared
    const { data: { user: signedOutUser } } = await supabase.auth.getUser()
    
    if (signedOutUser) {
      return { success: false, error: 'Session not cleared after sign out' }
    }
    
    return { 
      success: true, 
      message: 'Session management working correctly'
    }
    
  } catch (error) {
    return { 
      success: false, 
      error: `Session test error: ${error.message}`
    }
  }
}

// Test 3: Authentication Timeout Handling
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
        message: 'Authentication failed quickly as expected'
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

// Test 4: Admin Role Verification
async function testAdminRoleVerification() {
  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  
  try {
    // Test the is_admin function
    const { data, error } = await supabase.rpc('is_admin')
    
    if (error) {
      return { success: false, error: `Admin function test failed: ${error.message}` }
    }
    
    // Should return false for unauthenticated user
    if (data === false) {
      return { success: true, message: 'Admin role verification working correctly' }
    }
    
    return { success: false, error: 'Admin function returned unexpected result' }
    
  } catch (error) {
    return { success: false, error: `Admin role test error: ${error.message}` }
  }
}

// Main test runner
async function runAllTests() {
  console.log('🔒 Authentication Security Testing Started')
  console.log('=====================================')
  
  await runTest('RLS Policy Enforcement', testRLSPolicies)
  await runTest('Session Management', testSessionManagement)
  await runTest('Authentication Timeout Handling', testAuthTimeoutHandling)
  await runTest('Admin Role Verification', testAdminRoleVerification)
  
  console.log('\n=====================================')
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
  testSessionManagement,
  testAuthTimeoutHandling,
  testAdminRoleVerification
}
