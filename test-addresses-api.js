/**
 * Test Addresses API
 */

async function testAddressesAPI() {
  console.log('🧪 Testing Addresses API...')
  
  try {
    // First, let's get a session token by simulating the client
    console.log('⚠️  Testing API response structure...')
    
    // Test the endpoint to see what it returns
    const response = await fetch('http://localhost:3000/api/user/addresses', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // We'll test without auth first to see the error, then with auth
      },
    })

    console.log('📊 Response status:', response.status)
    
    const result = await response.json()
    console.log('📊 Full response:', JSON.stringify(result, null, 2))

    if (response.status === 401) {
      console.log('✅ API requires authentication (expected)')
    } else if (response.ok) {
      console.log('✅ API response structure:', Object.keys(result))
      if (result.addresses) {
        console.log('📊 Addresses data:', result.addresses)
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

testAddressesAPI()
