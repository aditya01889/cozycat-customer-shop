#!/usr/bin/env node

/**
 * Simple Admin Fix
 * Creates a simple admin user with guaranteed access
 */

require('dotenv').config({ path: './customer-shop/.env.staging' });
const { createClient } = require('@supabase/supabase-js');

console.log('🔧 Simple Admin Access Fix');
console.log('=============================');

// Staging client
const stagingSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pjckafjhzwegtyhlatus.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqY2thZmpoendlZ3R5aGxhdHVzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTYzMDY3OSwiZXhwIjoyMDg1MjA2Njc5fQ.xEMNIrSYO59toaFNaTvxKxf4wFGrckstm8MEP9OxmvM'
);

async function simpleAdminFix() {
  try {
    console.log('\n📋 Step 1: Creating super admin user...');
    console.log('=====================================');

    // Create super admin with guaranteed access
    const { data: authData, error: authError } = await stagingSupabase.auth.admin.createUser({
      email: 'superadmin@cozycatkitchen.com',
      password: 'SuperAdmin123!',
      email_confirm: true,
      user_metadata: {
        full_name: 'Super Admin',
        role: 'super_admin',
        bypass_rls: true
      }
    });

    if (authError) {
      console.log('❌ Error creating super admin:', authError.message);
      return;
    }

    console.log('✅ Super admin created:', authData.email, 'ID:', authData.id);

    // Create profile with super admin role
    console.log('\n📋 Step 2: Creating super admin profile...');
    console.log('=========================================');

    const { data: profileData, error: profileError } = await stagingSupabase
      .from('profiles')
      .insert({
        id: authData.id,
        email: authData.email,
        full_name: 'Super Admin',
        role: 'super_admin',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();

    if (profileError) {
      console.log('❌ Error creating profile:', profileError.message);
    } else {
      console.log('✅ Super admin profile created');
    }

    console.log('\n📋 Step 3: Testing super admin login...');
    console.log('=========================================');

    // Test login
    const { data: loginData, error: loginError } = await stagingSupabase.auth.signInWithPassword({
      email: 'superadmin@cozycatkitchen.com',
      password: 'SuperAdmin123!'
    });

    if (loginError) {
      console.log('❌ Login test failed:', loginError.message);
    } else {
      console.log('✅ Super admin login successful!');
    }

    console.log('\n🎯 SUPER ADMIN CREDENTIALS:');
    console.log('============================');
    console.log('📧 Email: superadmin@cozycatkitchen.com');
    console.log('🔑 Password: SuperAdmin123!');
    console.log('👤 Name: Super Admin');
    console.log('🔐 Role: super_admin');
    console.log('\n🌐 Login at: https://cozycatkitchen-staging.vercel.app/auth');
    console.log('\n✅ This should bypass all RLS restrictions!');
    console.log('\n📋 If this works, you have full admin access!');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the fix
if (require.main === module) {
  simpleAdminFix();
}

module.exports = { simpleAdminFix };
