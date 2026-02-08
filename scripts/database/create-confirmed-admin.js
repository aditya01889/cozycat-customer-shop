#!/usr/bin/env node

/**
 * Create Confirmed Admin User
 * Creates a staging admin user with email confirmation bypass
 */

const { createClient } = require('@supabase/supabase-js');

console.log('👤 Creating Confirmed Admin User');
console.log('==============================');

// Staging client
const stagingSupabase = createClient(
  'https://pjckafjhzwegtyhlatus.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqY2thZmpoendlZ3R5aGxhdHVzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTYzMDY3OSwiZXhwIjoyMDg1MjA2Njc5fQ.xEMNIrSYO59toaFNaTvxKxf4wFGrckstm8MEP9OxmvM'
);

async function createConfirmedAdmin() {
  try {
    console.log('\n📋 Step 1: Creating admin user with bypass...');
    console.log('==========================================');
    
    // Create user with email confirmation bypass
    const { data: authData, error: authError } = await stagingSupabase.auth.admin.createUser({
      email: 'confirmed-admin@cozycatkitchen.com',
      password: 'ConfirmedAdmin123!',
      email_confirm: true,
      user_metadata: {
        full_name: 'Confirmed Admin',
        role: 'admin'
      }
    });

    if (authError) {
      console.log('❌ Error creating user:', authError.message);
      return;
    }

    console.log('✅ Auth user created:', authData.email, 'ID:', authData.id);

    // Create profile immediately
    console.log('\n📋 Step 2: Creating profile...');
    console.log('=====================================');

    const { data: profileData, error: profileError } = await stagingSupabase
      .from('profiles')
      .insert({
        id: authData.id,
        email: authData.email,
        full_name: 'Confirmed Admin',
        role: 'admin',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();

    if (profileError) {
      console.log('❌ Error creating profile:', profileError.message);
    } else {
      console.log('✅ Profile created successfully');
    }

    console.log('\n🎯 CONFIRMED ADMIN CREDENTIALS:');
    console.log('====================================');
    console.log('📧 Email: confirmed-admin@cozycatkitchen.com');
    console.log('🔑 Password: ConfirmedAdmin123!');
    console.log('👤 Name: Confirmed Admin');
    console.log('🔐 Role: admin');
    console.log('\n🌐 Login at: https://cozycatkitchen-staging.vercel.app/auth');
    console.log('\n✅ These credentials should work immediately!');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the creation
if (require.main === module) {
  createConfirmedAdmin();
}

module.exports = { createConfirmedAdmin };
