#!/usr/bin/env node

/**
 * Fix admin access for superadmin@cozycatkitchen.com in staging
 */

const { createClient } = require('@supabase/supabase-js');

console.log('🔧 Fixing Admin Access');
console.log('=======================');

// Staging client
const stagingSupabase = createClient(
  'https://pjckafjhzwegtyhlatus.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqY2thZmpoendlZ3R5aGxhdHVzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTYzMDY3OSwiZXhwIjoyMDg1MjA2Njc5fQ.xEMNIrSYO59toaFNaTvxKxf4wFGrckstm8MEP9OxmvM'
);

async function fixAdminAccess() {
  try {
    console.log('\n📋 Current Status:');
    console.log('==================');
    
    // Check current status
    const { data: currentUser, error: userError } = await stagingSupabase
      .from('profiles')
      .select('*')
      .eq('email', 'superadmin@cozycatkitchen.com')
      .single();
    
    if (userError) {
      console.log('❌ Error finding user:', userError.message);
      return;
    }
    
    console.log(`👤 Current user: ${currentUser.email}`);
    console.log(`🆔 User ID: ${currentUser.id}`);
    console.log(`🏷️ Current role: ${currentUser.role}`);
    console.log(`👤 Current name: ${currentUser.full_name}`);

    console.log('\n🔧 Updating Role to Admin:');
    console.log('===========================');
    
    // Update the user's role to admin
    const { data: updatedUser, error: updateError } = await stagingSupabase
      .from('profiles')
      .update({ 
        role: 'admin',
        full_name: 'Super Admin',
        updated_at: new Date().toISOString()
      })
      .eq('email', 'superadmin@cozycatkitchen.com')
      .select()
      .single();
    
    if (updateError) {
      console.log('❌ Error updating user role:', updateError.message);
      return;
    }
    
    console.log(`✅ Updated ${updatedUser.email} to role: ${updatedUser.role}`);
    console.log(`✅ Updated name to: ${updatedUser.full_name}`);

    console.log('\n🔍 Verification:');
    console.log('================');
    
    // Verify the update
    const { data: verifyUser, error: verifyError } = await stagingSupabase
      .from('profiles')
      .select('*')
      .eq('email', 'superadmin@cozycatkitchen.com')
      .single();
    
    if (verifyError) {
      console.log('❌ Error verifying update:', verifyError.message);
      return;
    }
    
    console.log(`✅ Verified role: ${verifyUser.role}`);
    console.log(`✅ Verified name: ${verifyUser.full_name}`);

    console.log('\n📋 All Admin Users in Staging:');
    console.log('===============================');
    
    // Show all admin users
    const { data: allAdmins, error: adminsError } = await stagingSupabase
      .from('profiles')
      .select('*')
      .eq('role', 'admin');
    
    if (adminsError) {
      console.log('❌ Error getting admins:', adminsError.message);
    } else {
      console.log(`✅ Found ${allAdmins.length} admin users:`);
      allAdmins.forEach(admin => {
        console.log(`   📧 ${admin.email} | 👤 ${admin.full_name} | 🆔 ${admin.id} | 🏷️ ${admin.role}`);
      });
    }

    console.log('\n🎉 Admin Access Fixed!');
    console.log('=====================');
    console.log('✅ superadmin@cozycatkitchen.com now has admin access');
    console.log('✅ The 403 error should be resolved');
    console.log('✅ User can now access the admin dashboard');

  } catch (error) {
    console.error('❌ Fix failed:', error);
  }
}

fixAdminAccess();
