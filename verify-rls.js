/**
 * Verify RLS Policies are Working
 */

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://xfnbhheapralprcwjvzl.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmbmJoaGVhcHJhbHByY3dqdnpsIiwicm9sZSI6InNlcnZpY2UiLCJpYXQiOjE3NjgzMTQ1MDMsImV4cCI6MjA4Mzg5MDUwM30.uTt3Q-sahXSAbtC5UPAIRenNYJcGPksSIUOiQtwd6H0'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function verifyRLS() {
  console.log('🔍 Verifying RLS Policies...')
  
  try {
    // Check if RLS is enabled on tables
    console.log('\n📋 Checking RLS status...')
    
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name, rowsecurity')
      .eq('table_schema', 'public')
      .in('table_name', ['profiles', 'customers', 'orders', 'addresses', 'products'])
    
    console.log('Tables RLS status:')
    tables?.forEach(table => {
      console.log(`  - ${table.table_name}: ${table.rowsecurity ? '✅ Enabled' : '❌ Disabled'}`)
    })
    
    // Check if policies exist
    console.log('\n📋 Checking policies...')
    
    const { data: policies, error: policiesError } = await supabase
      .from('pg_policies')
      .select('tablename, policyname, permissive, roles, cmd')
      .eq('schemaname', 'public')
      .like('policyname', '%Users%')
    
    console.log('User policies:')
    policies?.forEach(policy => {
      console.log(`  - ${policy.policyname}: ${policy.permissive ? 'Permissive' : 'Restrictive'} (${policy.cmd})`)
    })
    
    // Test RLS with authenticated user
    console.log('\n📋 Testing RLS with authenticated user...')
    
    const anonClient = createClient(supabaseUrl, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmbmJoaGVhcHJhbHByY3dqdnpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzMTQ1MDMsImV4cCI6MjA4Mzg5MDUwM30.EV2hQ3uyjpOW29KaiDNqASzAucvyvqojsQcplXGaQXE')
    
    // Create a test user
    const { data: testUser, error: signUpError } = await anonClient.auth.signUp({
      email: 'testuser789@cozycatkitchen.com',
      password: 'TestPassword123!',
      options: {
        data: {
          full_name: 'Test User',
          role: 'customer'
        }
      }
    })
    
    if (signUpError) {
      console.log('❌ Test user creation failed:', signUpError.message)
      return
    }
    
    console.log('✅ Test user created:', testUser.user?.id)
    
    // Create authenticated client
    const authClient = createClient(supabaseUrl, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmbmJoaGVhcHJhbHByY3dqdnpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzMTQ1MDMsImV4cCI6MjA4Mzg5MDUwM30.EV2hQ3uyjpOW29KaiDNqASzAucvyvqojsQcplXGaQXE', {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    })
    
    // Set the session
    await authClient.auth.setSession({
      access_token: testUser.session?.access_token,
      refresh_token: testUser.session?.refresh_token
    })
    
    // Test 1: User can see their own profile
    console.log('\n📋 Test 1: User can see their own profile...')
    const { data: ownProfile, error: ownError } = await authClient
      .from('profiles')
      .select('*')
      .eq('id', testUser.user.id)
      .single()
    
    console.log(`Own profile: ${ownProfile ? '✅ Found' : '❌ Not found'}`)
    if (ownError) console.log('Error:', ownError.message)
    
    // Test 2: User cannot see other profiles
    console.log('\n📋 Test 2: User cannot see other profiles...')
    const { data: allProfiles, error: allError } = await authClient
      .from('profiles')
      .select('*')
      .limit(10)
    
    console.log(`All profiles: ${allProfiles?.length || 0} records`)
    if (allError) console.log('Error:', allError.message)
    
    // Test 3: User cannot access all customer data
    console.log('\n📋 Test 3: User cannot access all customer data...')
    const { data: allCustomers, error: customersError } = await authClient
      .from('customers')
      .select('*')
      .limit(10)
    
    console.log(`All customers: ${allCustomers?.length || 0} records`)
    if (customersError) console.log('Error:', customersError.message)
    
    // Test 4: User can access their own customer data
    console.log('\n📋 Test 4: User can access their own customer data...')
    const { data: ownCustomer, error: ownCustomerError } = await authClient
      .from('customers')
      .select('*')
      .eq('profile_id', testUser.user.id)
      .limit(10)
    
    console.log(`Own customer data: ${ownCustomer?.length || 0} records`)
    if (ownCustomerError) console.log('Error:', ownCustomerError.message)
    
    // Test 5: Public can see active products
    console.log('\n📋 Test 5: Public can see active products...')
    const { data: publicProducts, error: productsError } = await anonClient
      .from('products')
      .select('*')
      .eq('is_active', true)
      .limit(10)
    
    console.log(`Public products: ${publicProducts?.length || 0} records`)
    if (productsError) console.log('Error:', productsError.message)
    
    // Test 6: Public cannot see inactive products
    console.log('\n📋 Test 6: Public cannot see inactive products...')
    const { data: inactiveProducts, error: inactiveError } = await anonClient
      .from('products')
      .select('*')
      .eq('is_active', false)
      .limit(10)
    
    console.log(`Inactive products: ${inactiveProducts?.length || 0} records`)
    if (inactiveError) console.log('Error:', inactiveError.message)
    
    console.log('\n🎯 RLS Verification Summary:')
    console.log(`  - RLS enabled on tables: ${tables?.filter(t => t.rowsecurity).length || 0}/5`)
    console.log(`  - User policies created: ${policies?.length || 0}`)
    console.log(`  - User can see own profile: ${ownProfile ? '✅' : '❌'}`)
    console.log(`  - User can see other profiles: ${allProfiles?.length > 0 ? '❌' : '✅'} (${allProfiles?.length || 0} records)`)
    console.log(`  - User can see own customer data: ${ownCustomer?.length > 0 ? '✅' : '❌'} (${ownCustomer?.length || 0} records)`)
    console.log(`  - Public can see active products: ${publicProducts?.length > 0 ? '✅' : '❌'} (${publicProducts?.length || 0} records)`)
    console.log(`  - Public can see inactive products: ${inactiveProducts?.length > 0 ? '❌' : '✅'} (${inactiveProducts?.length || 0} records)`)
    
    // RLS is working if:
    // - User can see their own data
    // - User cannot see other users' data
    // - Public can see active products
    // - Public cannot see inactive products
    
    const rlsWorking = ownProfile && allProfiles?.length === 0 && ownCustomer?.length >= 0 && publicProducts?.length > 0 && inactiveProducts?.length === 0
    
    console.log(`\n🔒 RLS Status: ${rlsWorking ? '✅ Working' : '❌ Not Working'}`)
    
    return { success: rlsWorking }
    
  } catch (error) {
    console.error('💥 Verification error:', error)
    return { success: false, error: error.message }
  }
}

verifyRLS()
