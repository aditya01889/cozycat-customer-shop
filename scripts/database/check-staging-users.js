#!/usr/bin/env node

/**
 * Check Staging Database Users
 * Lists all users in the staging database
 */

require('dotenv').config({ path: './customer-shop/.env.staging' });
const { createClient } = require('@supabase/supabase-js');

console.log('👤 Checking Staging Database Users');
console.log('===================================');

// Staging client
const stagingSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pjckafjhzwegtyhlatus.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqY2thZmpoendlZ3R5aGxhdHVzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTYzMDY3OSwiZXhwIjoyMDg1MjA2Njc5fQ.xEMNIrSYO59toaFNaTvxKxf4wFGrckstm8MEP9OxmvM'
);

async function checkStagingUsers() {
  try {
    console.log('\n📋 Step 1: Checking profiles table...');
    console.log('=====================================');
    
    const { data: profiles, error: profilesError } = await stagingSupabase
      .from('profiles')
      .select('*');
    
    if (profilesError) {
      console.log('❌ Error fetching profiles:', profilesError.message);
      return;
    }
    
    console.log(`✅ Found ${profiles.length} profiles:`);
    profiles.forEach((profile, index) => {
      console.log(`   ${index + 1}. Email: ${profile.email || 'N/A'}`);
      console.log(`      Name: ${profile.full_name || profile.name || 'N/A'}`);
      console.log(`      Role: ${profile.role || 'N/A'}`);
      console.log(`      ID: ${profile.id}`);
      console.log('');
    });

    console.log('\n📋 Step 2: Checking auth.users table...');
    console.log('=====================================');
    
    // Try to get auth users (this might require admin access)
    const { data: authUsers, error: authError } = await stagingSupabase
      .rpc('get_users');
    
    if (authError) {
      console.log('⚠️ Cannot access auth.users directly (expected for security)');
      console.log('   This is normal - auth users are protected');
    } else {
      console.log(`✅ Found ${authUsers.length} auth users`);
      authUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. Email: ${user.email}`);
        console.log(`      ID: ${user.id}`);
      });
    }

    console.log('\n🎯 Summary:');
    console.log('============');
    console.log(`   Profiles in database: ${profiles.length}`);
    console.log('   Try logging in with any of the emails listed above');
    console.log('   If you know the password from production, it should work');

  } catch (error) {
    console.error('❌ Error checking users:', error);
  }
}

// Run the check
if (require.main === module) {
  checkStagingUsers();
}

module.exports = { checkStagingUsers };
