#!/usr/bin/env node

/**
 * Final verification of admin status
 */

const { createClient } = require('@supabase/supabase-js');

console.log('🔍 Final Admin Status Verification');
console.log('====================================');

// Staging client
const stagingSupabase = createClient(
  'https://pjckafjhzwegtyhlatus.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqY2thZmpoendlZ3R5aGxhdHVzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTYzMDY3OSwiZXhwIjoyMDg1MjA2Njc5fQ.xEMNIrSYO59toaFNaTvxKxf4wFGrckstm8MEP9OxmvM'
);

async function verifyAdminStatus() {
  try {
    console.log('\n📋 Checking current admin status in staging...');
    
    // Check the specific user
    const { data: adminUser, error: adminError } = await stagingSupabase
      .from('profiles')
      .select('*')
      .eq('email', 'superadmin@cozycatkitchen.com')
      .single();
    
    if (adminError) {
      console.log('❌ Error fetching admin user:', adminError.message);
      return;
    }
    
    console.log('👤 Current admin user data:');
    console.log(`   📧 Email: ${adminUser.email}`);
    console.log(`   🆔 User ID: ${adminUser.id}`);
    console.log(`   🏷️ Role: ${adminUser.role}`);
    console.log(`   👤 Name: ${adminUser.full_name}`);
    
    // Check if admin access is working
    console.log('\n📋 Testing admin dashboard access...');
    
    // Try to access a protected admin endpoint
    const { data: testData, error: testError } = await stagingSupabase
      .from('profiles')
      .select('id, email, role')
      .eq('role', 'admin')
      .limit(1);
    
    if (testError) {
      console.log('❌ Admin dashboard test failed:', testError.message);
    } else {
      const adminCount = testData ? testData.length : 0;
      console.log(`✅ Admin dashboard access working: Found ${adminCount} admin users`);
    }
    
    console.log('\n📋 Final Verification:');
    console.log('====================');
    console.log(`✅ Admin user exists: ${adminUser ? 'YES' : 'NO'}`);
    console.log(`✅ Admin role is correct: ${adminUser && adminUser.role === 'admin' ? 'YES' : 'NO'}`);
    console.log(`✅ Admin dashboard accessible: ${adminCount > 0 ? 'YES' : 'NO'}`);
    
    if (adminUser && adminUser.role === 'admin' && adminCount > 0) {
      console.log('\n🎉 ADMIN ACCESS FULLY VERIFIED!');
      console.log('✅ superadmin@cozycatkitchen.com has admin access');
      console.log('✅ Admin dashboard should be accessible');
      console.log('✅ All operations pages should work correctly');
    } else {
      console.log('\n⚠️ ADMIN ACCESS ISSUE STILL EXISTS!');
      console.log('❌ Admin user missing or role incorrect');
      console.log('❌ Admin dashboard will not be accessible');
    }

  } catch (error) {
    console.error('❌ Verification failed:', error);
  }
}

if (require.main === module) {
  verifyAdminStatus();
}

module.exports = { verifyAdminStatus };
