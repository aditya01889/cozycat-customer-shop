/**
 * Test Debug Auth Endpoint
 */

async function testDebugAuth() {
  console.log('🔍 Testing Debug Auth Endpoint...')
  
  try {
    const response = await fetch('http://localhost:3000/api/debug/auth', {
      method: 'GET',
      credentials: 'include', // Include cookies
    })

    console.log('📊 Debug auth status:', response.status)
    console.log('📊 Debug auth headers:', Object.fromEntries(response.headers.entries()))

    const result = await response.json()
    console.log('📊 Debug auth data:', JSON.stringify(result, null, 2))

    if (response.ok) {
      console.log('✅ Authentication working')
      console.log('👤 User:', result.user)
      console.log('🔐 Role:', result.user?.role)
    } else {
      console.log('❌ Authentication failed:', result.error)
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

testDebugAuth()
