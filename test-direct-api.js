/**
 * Test Direct API Call
 */

// This would be run in the browser console on the admin page
async function testDirectAPI() {
  console.log('🧪 Testing direct API call...')
  
  try {
    // Get the supabase client from the window (if available)
    const { data: { session } } = await window.supabase.auth.getSession()
    
    if (!session?.access_token) {
      console.error('❌ No session token available')
      return
    }
    
    console.log('✅ Session token found, making API call...')
    
    const response = await fetch('/api/admin/dashboard/client', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
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
    
    if (response.ok) {
      const result = await response.json()
      console.log('✅ API Response:', result)
      console.log('📊 Dashboard stats:', result.data?.dashboardStats)
    } else {
      const error = await response.json()
      console.error('❌ API Error:', error)
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run the test
testDirectAPI()
