#!/usr/bin/env node

/**
 * Simple Staging Admin Creation
 * Creates a staging admin user with known credentials
 */

const { createClient } = require('@supabase/supabase-js');

console.log('👤 Creating Simple Staging Admin');
console.log('=================================');

// Staging client - use hardcoded credentials to avoid env issues
const stagingSupabase = createClient(
  'https://pjckafjhzwegtyhlatus.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqY2thZmpoendlZ3R5aGxhdHVzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTYzMDY3OSwiZXhwIjoyMDg1MjA2Njc5fQ.xEMNIrSYO59toaFNaTvxKxf4wFGrckstm8MEP9OxmvM'
);

async function createSimpleAdmin() {
  try {
    console.log('\n📋 Creating admin user with known credentials...');
    
    // Create user in auth system
    const { data: authData, error: authError } = await stagingSupabase.auth.admin.createUser({
      email: 'admin@staging.com',
      password: 'admin123',
      email_confirm: true,
      user_metadata: {
        full_name: 'Staging Admin',
        role: 'admin'
      }
    });

    if (authError) {
      console.log('❌ Error creating user:', authError.message);
      return;
    }

    console.log('✅ Auth user created:', authData.email, 'ID:', authData.id);

    // Create profile in profiles table
    const { data: profileData, error: profileError } = await stagingSupabase
      .from('profiles')
      .insert({
        id: authData.id,
        email: authData.email,
        full_name: 'Staging Admin',
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

    console.log('\n🎯 STAGING ADMIN CREDENTIALS READY!');
    console.log('====================================');
    console.log('📧 Email: admin@staging.com');
    console.log('🔑 Password: admin123');
    console.log('👤 Name: Staging Admin');
    console.log('🔐 Role: admin');
    console.log('\n🌐 Login at: https://cozycatkitchen-staging.vercel.app/auth');
    console.log('\n✅ These credentials should work for testing!');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the creation
if (require.main === module) {
  createSimpleAdmin();
}

module.exports = { createSimpleAdmin };
