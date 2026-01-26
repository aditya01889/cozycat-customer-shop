/**
 * Test Authentication Session
 */

async function testAuthSession() {
  console.log('🔍 Testing Authentication Session...')
  
  try {
    // Test the user profile endpoint to check authentication
    const response = await fetch('http://localhost:3000/api/user/profile', {
      method: 'GET',
      credentials: 'include', // Include cookies
    })

    console.log('📊 Profile API status:', response.status)
    
    if (response.ok) {
      const result = await response.json()
      console.log('✅ User is authenticated:', result.success)
      if (result.success) {
        console.log('👤 User data:', result.data)
      }
    } else {
      const error = await response.json()
      console.log('❌ Authentication failed:', error.error)
    }

    // Test admin access
    const adminResponse = await fetch('http://localhost:3000/api/admin/get-profiles', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        page: 1,
        limit: 10
      })
    })

    console.log('📊 Admin API status:', adminResponse.status)
    
    if (adminResponse.ok) {
      const adminResult = await adminResponse.json()
      console.log('✅ Admin access confirmed:', adminResult.success)
    } else {
      const adminError = await adminResponse.json()
      console.log('❌ Admin access failed:', adminError.error)
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

testAuthSession()
