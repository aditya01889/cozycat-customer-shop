/**
 * Test Dashboard API
 */

async function testDashboardAPI() {
  console.log('🧪 Testing Dashboard API...')
  
  try {
    const response = await fetch('http://localhost:3000/api/admin/dashboard', {
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
    console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()))

    const result = await response.json()
    console.log('📊 Response data:', JSON.stringify(result, null, 2))

    if (response.ok && result.success) {
      console.log('✅ Dashboard API working correctly')
    } else {
      console.log('❌ Dashboard API failed:', result.error || 'Unknown error')
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

testDashboardAPI()
