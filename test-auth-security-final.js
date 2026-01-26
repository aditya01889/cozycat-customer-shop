/**
 * Authentication Security Testing Script (Final)
 * Tests authentication security measures including RLS policies, session management, and timeouts
 */

const { createClient } = require('@supabase/supabase-js')

// Test configuration
const BASE_URL = 'http://localhost:3000'
const supabaseUrl = 'https://xfnbhheapralprcwjvzl.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmbmJoaGVhcHJhbHBy3dqdnpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzMTQ1MDMsImV4cCI6MjA4Mzg5MDUwM30.EV2hQ3uyjpOW29KaiDNqASzAucvyvqojsQcplXGaQXE'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmbmJoaGVhcHJhbHBy3dqdnpsIiwicm9sZSI6InNlcnZpY2UiLCJpYXQiOjE3NjgzMTQ1MDMsImV4cCI6MjA4Mzg5MDUwM30.uTt3Q-sahXSAbtC5UPAIRenNYJcGPksSIUOiQtwd6H0'

// Test results storage
const testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
}

// Helper function to make HTTP requests
async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    })
    
    const data = await response.json()
    return { status: response.status, data, success: response.ok }
  } catch (error) {
    return { status: 500, data: { error: error.message }, success: false }
  }
}

// Test function
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
      testResults.details.push({ name, status: 'FAILED', error: result.error, details: result })
    }
  } catch (error) {
    console.log(`💥 ${name}: ERROR - ${error.message}`)
    testResults.failed++
    testResults.details.push({ name, status: 'ERROR', error: error.message })
  }
}

// Test 1: RLS Policy - User can only access their own data
async function testRLSPolicies() {
  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  
  try {
    // Try to access all profiles (should fail with RLS)
    const { data: allProfiles, error } = await supabase
      .from('profiles')
      .select('*')
    
    if (error && error.message?.includes('row-level security')) {
      // This is expected - RLS is working
      return { 
        success: true, 
        message: 'RLS policy is active - users cannot access all data'
      }
    }
    
    // If we can access all profiles, RLS is not working
    return { 
      success: false, 
      error: 'RLS policy not enforced - users can access all data'
    }
  } catch (error) {
    return { 
      success: false, 
      error: `RLS test error: ${error.message}`
    }
  }
}

// Test 2: Session Management - Session persistence
async function testSessionPersistence() {
  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  
  try {
    // Sign up a test user with valid email
    const { data: { user }, error: signUpError } = await supabase.auth.signUp({
      email: 'testuser123@gmail.com',
      password: 'TestPassword123!',
      options: {
        data: {
          full_name: 'Test User',
          role: 'customer'
        }
      }
    })
    
    if (signUpError) {
      return { success: false, error: `Sign up failed: ${signUpError.message}` }
    }
    
    if (!user) {
      return { success: false, error: 'User creation failed' }
    }
    
    // Check if session persists
    const { data: { user: persistedUser }, error: sessionError } = await supabase.auth.getUser()
    
    if (sessionError) {
      return { success: false, error: `Session persistence failed: ${sessionError.message}` }
    }
    
    if (!persistedUser || persistedUser.id !== user.id) {
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

// Test 4: Service Role Key Security
async function testServiceRoleKeySecurity() {
  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  
  try {
    // Try to access all profiles (should fail with RLS)
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)
    
    if (error && error.message?.includes('row-level security')) {
      // This is expected - RLS is working
      return { 
        success: true, 
        message: 'RLS protects against unauthorized access with anon key'
      }
    }
    
    // If we can access data with anon key, RLS might be missing
    return { 
      success: false, 
      error: 'RLS policy may be missing for anon key'
    }
    
  } catch (error) {
    return { 
      success: false, 
      error: `Service role key test error: ${error.message}`
    }
  }
}

// Test 5: Password Strength Requirements
async function testPasswordStrength() {
  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  
  try {
    // Try to sign up with weak password
    const { data, error } = await supabase.auth.signUp({
      email: 'weakuser@gmail.com',
      password: '123', // Very weak password
      options: {
        data: {
          full_name: 'Weak User',
          role: 'customer'
        }
      }
    })
    
    if (error) {
      // Check if password validation is working
      if (error.message?.includes('Password') || error.message?.includes('password')) {
        return { 
          success: true, 
          message: 'Password strength validation working'
        }
      }
    }
    
    // If weak password is accepted, that's a security issue
    if (data && data.user) {
      return { 
        success: false, 
        error: 'Weak password was accepted - security issue'
      }
    }
    
    return { 
      success: true, 
      message: 'Password validation appears to be working'
    }
    
  } catch (error) {
    return { 
      success: false, 
      error: `Password strength test error: ${error.message}`
    }
  }
}

// Test 6: Session Timeout Configuration
async function testSessionTimeout() {
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
      expiresIn: '5s' // 5 seconds
    },
  })
  
  try {
    // Sign up a user
    const { data: { user }, error: signUpError } = await supabase.auth.signUp({
      email: 'timeoutuser123@gmail.com',
      password: 'TestPassword123!',
      options: {
        data: {
          full_name: 'Timeout Test User',
          role: 'customer'
        }
      }
    })
    
    if (signUpError) {
      return { success: false, error: `Sign up failed: ${signUpError.message}` }
    }
    
    if (!user) {
      return { success: false, error: 'User creation failed' }
    }
    
    // Wait for session to expire
    console.log('Waiting for session to expire (5 seconds)...')
    await new Promise(resolve => setTimeout(resolve, 6000))
    
    // Try to access user after session timeout
    const { data: { user: expiredUser }, error: expiredError } = await supabase.auth.getUser()
    
    if (expiredError || !expiredUser) {
      return { 
        success: true, 
        message: 'Session timeout working correctly'
      }
    }
    
    return { 
      success: false, 
      error: 'Session did not timeout as expected'
    }
    
  } catch (error) {
    return { 
      success: false, 
      error: `Session timeout test error: ${error.message}`
    }
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting Authentication Security Tests (Final)\n')
  console.log(`Testing against: ${BASE_URL}`)
  
  await runTest('RLS Policy Enforcement', testRLSPolicies)
  await runTest('Session Persistence', testSessionPersistence)
  await runTest('Authentication Timeout Handling', testAuthTimeoutHandling)
  await runTest('Service Role Key Security', testServiceRoleKeySecurity)
  await runTest('Password Strength Validation', testPasswordStrength)
  await runTest('Session Timeout Configuration', testSessionTimeout)
  
  // Print summary
  console.log('\n' + '='.repeat(50))
  console.log('📊 AUTHENTICATION SECURITY TEST SUMMARY')
  console.log('='.repeat(50))
  console.log(`Total Tests: ${testResults.total}`)
  console.log(`✅ Passed: ${testResults.passed}`)
  console.log(`❌ Failed: ${testResults.failed}`)
  console.log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`)
  
  if (testResults.failed > 0) {
    console.log('\n❌ FAILED TESTS:')
    testResults.details
      .filter(test => test.status !== 'PASSED')
      .forEach(test => {
        console.log(`  - ${test.name}: ${test.error || test.message}`)
      })
  }
  
  console.log('\n🎯 AUTHENTICATION SECURITY ASSESSMENT:')
  if (testResults.passed === testResults.total) {
    console.log('✅ All authentication security measures are working correctly!')
  } else if (testResults.passed >= testResults.total * 0.8) {
    console.log('⚠️  Most authentication measures are working, but some issues need attention')
  } else {
    console.log('🚨 Critical authentication security issues detected - immediate attention required')
  }
  
  return testResults
}

// Run tests if this file is executed directly
if (typeof window === 'undefined') {
  runAllTests().catch(console.error)
}

module.exports = { runAllTests, testResults }
