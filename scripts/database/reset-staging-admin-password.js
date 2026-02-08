#!/usr/bin/env node

/**
 * Reset Staging Admin Password
 * Resets password for existing staging admin user
 */

require('dotenv').config({ path: './customer-shop/.env.staging' });
const { createClient } = require('@supabase/supabase-js');

console.log('🔄 Resetting Staging Admin Password');
console.log('=================================');

// Staging client
const stagingSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pjckafjhzwegtyhlatus.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqY2thZmpoendlZ3R5aGxhdHVzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTYzMDY3OSwiZXhwIjoyMDg1MjA2Njc5fQ.xEMNIrSYO59toaFNaTvxKxf4wFGrckstm8MEP9OxmvM'
);

async function resetStagingAdminPassword() {
  try {
    console.log('\n📋 Step 1: Getting existing admin user...');
    console.log('=====================================');

    // Get the existing admin user (aditya01889@gmail.com)
    const { data: users } = await stagingSupabase.auth.admin.listUsers({
      filters: {
        email: 'aditya01889@gmail.com'
      }
    });
    
    if (!users || users.length === 0) {
      console.log('❌ Admin user not found');
      return;
    }
    
    const adminUser = users[0];
    console.log(`✅ Found admin user: ${adminUser.email}`);
    console.log(`   ID: ${adminUser.id}`);
    console.log(`   Confirmed: ${adminUser.email_confirmed}`);

    console.log('\n📋 Step 2: Resetting password...');
    console.log('=====================================');

    // Generate new password
    const newPassword = 'StagingAdmin123!';
    
    // Update user password using admin API
    const { data: updatedUser, error: updateError } = await stagingSupabase.auth.admin.updateUserById(
      adminUser.id,
      { 
        password: newPassword,
        email_confirm: true
      }
    );

    if (updateError) {
      console.log('❌ Error updating password:', updateError.message);
      
      // Try alternative method - create new admin user
      console.log('\n📋 Step 3: Creating new admin user...');
      console.log('=====================================');
      
      const { data: newAuthData, error: newAuthError } = await stagingSupabase.auth.admin.createUser({
        email: 'staging-admin@cozycatkitchen.com',
        password: newPassword,
        email_confirm: true,
        user_metadata: {
          full_name: 'Staging Admin',
          role: 'admin'
        }
      });
      
      if (newAuthError) {
        console.log('❌ Error creating new admin:', newAuthError.message);
      } else {
        console.log('✅ New admin user created successfully');
        console.log('\n🎯 Use these credentials:');
        console.log('=============================');
        console.log('📧 Email: staging-admin@cozycatkitchen.com');
        console.log('🔑 Password: StagingAdmin123!');
        console.log('👤 Name: Staging Admin');
        console.log('🔐 Role: admin');
      }
    } else {
      console.log('✅ Password updated successfully');
      console.log('\n🎯 Use these credentials:');
      console.log('=============================');
      console.log('📧 Email: aditya01889@gmail.com');
      console.log('🔑 Password: StagingAdmin123!');
      console.log('👤 Name: Admin User');
      console.log('🔐 Role: admin');
    }

    console.log('\n🌐 Try logging in with these credentials at:');
    console.log('https://cozycatkitchen-staging.vercel.app/auth');

  } catch (error) {
    console.error('❌ Error resetting password:', error);
  }
}

// Run the reset
if (require.main === module) {
  resetStagingAdminPassword();
}

module.exports = { resetStagingAdminPassword };
