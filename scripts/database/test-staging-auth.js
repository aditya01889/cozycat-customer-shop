#!/usr/bin/env node

/**
 * Test Staging Authentication
 * Tests login with staging admin credentials
 */

require('dotenv').config({ path: './customer-shop/.env.staging' });
const { createClient } = require('@supabase/supabase-js');

console.log('🔐 Testing Staging Authentication');
console.log('=================================');

// Staging client
const stagingSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pjckafjhzwegtyhlatus.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqY2thZmpoendlZ3R5aGxhdHVzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTYzMDY3OSwiZXhwIjoyMDg1MjA2Njc5fQ.xEMNIrSYO59toaFNaTvxKxf4wFGrckstm8MEP9OxmvM'
);

async function testStagingAuth() {
  try {
    console.log('\n📋 Step 1: Testing login with staging admin...');
    console.log('=============================================');

    // Test login with staging admin credentials
    const { data: authData, error: authError } = await stagingSupabase.auth.signInWithPassword({
      email: 'staging@cozycatkitchen.com',
      password: 'StagingAdmin123!'
    });

    if (authError) {
      console.log('❌ Login failed:', authError.message);
      console.log('🔧 Possible issues:');
      console.log('   - User exists but password is wrong');
      console.log('   - Auth system not synced with profiles');
      console.log('   - Email confirmation required');
      
      // Try to get user info
      console.log('\n📋 Step 2: Checking user status...');
      console.log('=====================================');
      
      const { data: users } = await stagingSupabase.auth.admin.listUsers({
        filters: {
          email: 'staging@cozycatkitchen.com'
        }
      });
      
      if (users && users.length > 0) {
        const user = users[0];
        console.log('✅ User found in auth system:');
        console.log(`   Email: ${user.email}`);
        console.log(`   ID: ${user.id}`);
        console.log(`   Confirmed: ${user.email_confirmed}`);
        console.log(`   Created: ${user.created_at}`);
        
        // Check profile
        console.log('\n📋 Step 3: Checking profile...');
        console.log('=====================================');
        
        const { data: profile, error: profileError } = await stagingSupabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profileError) {
          console.log('❌ Profile error:', profileError.message);
        } else if (profile) {
          console.log('✅ Profile found:');
          console.log(`   Email: ${profile.email}`);
          console.log(`   Name: ${profile.full_name}`);
          console.log(`   Role: ${profile.role}`);
          console.log(`   Active: ${profile.is_active}`);
        } else {
          console.log('❌ No profile found');
        }
      } else {
        console.log('❌ User not found in auth system');
      }
    } else {
      console.log('✅ Login successful!');
      console.log(`🎯 User: ${authData.user?.email}`);
      console.log(`🆔 Session: ${authData.session?.access_token ? 'Active' : 'None'}`);
      
      // Test profile access
      console.log('\n📋 Step 4: Testing profile access...');
      console.log('=====================================');
      
      const { data: profile, error: profileError } = await stagingSupabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user?.id)
        .single();
      
      if (profileError) {
        console.log('❌ Profile access error:', profileError.message);
      } else if (profile) {
        console.log('✅ Profile accessible:');
        console.log(`   Email: ${profile.email}`);
        console.log(`   Name: ${profile.full_name}`);
        console.log(`   Role: ${profile.role}`);
        console.log(`   Active: ${profile.is_active}`);
      } else {
        console.log('❌ Profile not accessible');
      }
    }

  } catch (error) {
    console.error('❌ Error testing auth:', error);
  }
}

// Run the test
if (require.main === module) {
  testStagingAuth();
}

module.exports = { testStagingAuth };
