/**
 * Debug RLS Policies - Check what's happening with RLS
 */

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://xfnbhheapralprcwjvzl.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmbmJoaGVhcHJhbHByY3dqdnpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzMTQ1MDMsImV4cCI6MjA4Mzg5MDUwM30.EV2hQ3uyjpOW29KaiDNqASzAucvyvqojsQcplXGaQXE'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmbmJoaGVhcHJhbHByY3dqdnpsIiwicm9sZSI6InNlcnZpY2UiLCJpYXQiOjE3NjgzMTQ1MDMsImV4cCI6MjA4Mzg5MDUwM30.uTt3Q-sahXSAbtC5UPAIRenNYJcGPksSIUOiQtwd6H0'

async function debugRLS() {
  console.log('🔍 Debugging RLS Policies...')
  
  try {
    // Test with anon key
    console.log('\n📋 Testing with ANON key...')
    const anonClient = createClient(supabaseUrl, supabaseAnonKey)
    
    const { data: anonProfiles, error: anonError } = await anonClient
      .from('profiles')
      .select('*')
      .limit(5)
    
    console.log('Anon profiles result:', anonProfiles?.length || 0, 'records')
    console.log('Anon profiles error:', anonError?.message || 'No error')
    
    // Test with service role key
    console.log('\n📋 Testing with SERVICE ROLE key...')
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey)
    
    const { data: serviceProfiles, error: serviceError } = await serviceClient
      .from('profiles')
      .select('*')
      .limit(5)
    
    console.log('Service profiles result:', serviceProfiles?.length || 0, 'records')
    console.log('Service profiles error:', serviceError?.message || 'No error')
    
    // Check RLS status
    console.log('\n📋 Checking RLS status...')
    
    const { data: rlsStatus, error: rlsError } = await serviceClient
      .from('information_schema.table_policies')
      .select('table_name, policy_name, permissive, roles, cmd')
      .eq('table_schema', 'public')
      .eq('policyname', 'Users can view own profile')
    
    console.log('RLS policy status:', rlsStatus?.length || 0, 'policies found')
    console.log('RLS policy error:', rlsError?.message || 'No error')
    
    // Test RLS with authenticated user
    console.log('\n📋 Testing RLS with authenticated user...')
    
    // First, let's check if we can create a test user
    const { data: testUser, error: signUpError } = await anonClient.auth.signUp({
      email: 'testuser456@cozycatkitchen.com',
      password: 'TestPassword123!',
      options: {
        data: {
          full_name: 'Test User',
          role: 'customer'
        }
      }
    })
    
    if (signUpError) {
      console.log('Test user creation error:', signUpError.message)
    } else {
      console.log('Test user created:', testUser.user?.id)
      
      // Now test RLS with the authenticated user
      const authenticatedClient = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true
        }
      })
      
      // Set the session
      await authenticatedClient.auth.setSession({
        access_token: testUser.session?.access_token,
        refresh_token: testUser.session?.refresh_token
      })
      
      const { data: userProfiles, error: userError } = await authenticatedClient
        .from('profiles')
        .select('*')
        .limit(5)
      
      console.log('User profiles result:', userProfiles?.length || 0, 'records')
      console.log('User profiles error:', userError?.message || 'No error')
      
      // Test if user can only see their own profile
      const { data: ownProfile, error: ownError } = await authenticatedClient
        .from('profiles')
        .select('*')
        .eq('id', testUser.user.id)
        .single()
      
      console.log('Own profile result:', ownProfile ? 'Found' : 'Not found')
      console.log('Own profile error:', ownError?.message || 'No error')
    }
    
    console.log('\n🎯 RLS Debug Summary:')
    console.log('  - Anon key access:', anonProfiles?.length || 0, 'records')
    console.log('  - Service key access:', serviceProfiles?.length || 0, 'records')
    console.log('  - RLS policies:', rlsStatus?.length || 0, 'found')
    console.log('  - Authenticated user access:', testUser ? 'Available' : 'Not created')
    
  } catch (error) {
    console.error('💥 Debug error:', error)
  }
}

debugRLS()
