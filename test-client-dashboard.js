/**
 * Test Client Dashboard API
 */

async function testClientDashboard() {
  console.log('🧪 Testing Client Dashboard API...')
  
  try {
    // First, we need to get a session token
    // For this test, we'll use a mock token - in real usage, this comes from the client
    console.log('⚠️  This test requires a valid auth token from the client')
    console.log('📝 The client-side dashboard should work in the browser')
    
    // Test the endpoint without auth (should fail)
    const response = await fetch('http://localhost:3000/api/admin/dashboard/client', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        includeRecentOrders: true,
        includeOrderStats: false,
        includeProductPerformance: false,
        includeRecentActivity: false,
        activityLimit: 10
      })
    })

    console.log('📊 Response status:', response.status)
    
    const result = await response.json()
    console.log('📊 Response data:', JSON.stringify(result, null, 2))

    if (response.status === 401 && result.error === 'Authorization token required') {
      console.log('✅ Client route is working - requires auth token as expected')
    } else {
      console.log('❌ Unexpected response:', result)
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

testClientDashboard()
