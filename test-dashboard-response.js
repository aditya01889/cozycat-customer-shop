/**
 * Test Dashboard API Response
 */

async function testDashboardResponse() {
  console.log('🧪 Testing Dashboard API Response...')
  
  try {
    // First, let's get a session token by simulating the client
    console.log('⚠️  Testing API response structure...')
    
    // Test the endpoint to see what it returns
    const response = await fetch('http://localhost:3000/api/admin/dashboard/client', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // We'll test without auth first to see the error, then with auth
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
    console.log('📊 Full response:', JSON.stringify(result, null, 2))

    if (response.status === 401) {
      console.log('✅ API requires authentication (expected)')
    } else if (response.ok) {
      console.log('✅ API response structure:', Object.keys(result))
      if (result.data) {
        console.log('📊 Data structure:', Object.keys(result.data))
        if (result.data.dashboardStats) {
          console.log('📊 Dashboard stats:', result.data.dashboardStats)
        }
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

testDashboardResponse()
