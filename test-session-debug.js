/**
 * Test Session Debug
 */

// This would be run in the browser console
console.log('🔍 Testing session availability...')

// Check if supabase client is available
if (typeof window !== 'undefined' && window.supabase) {
  window.supabase.auth.getSession().then(({ data: { session } }) => {
    console.log('🔍 Session Debug:', {
      hasSession: !!session,
      hasToken: !!session?.access_token,
      userEmail: session?.user?.email,
      userId: session?.user?.id,
      tokenLength: session?.access_token?.length
    })
  })
} else {
  console.log('❌ Supabase client not available')
}
