#!/usr/bin/env node

/**
 * Create Staging Admin User
 * Creates a known admin user for staging environment
 */

require('dotenv').config({ path: './customer-shop/.env.staging' });
const { createClient } = require('@supabase/supabase-js');

console.log('👤 Creating Staging Admin User');
console.log('=============================');

// Staging client
const stagingSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pjckafjhzwegtyhlatus.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqY2thZmpoendlZ3R5aGxhdHVzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTYzMDY3OSwiZXhwIjoyMDg1MjA2Njc5fQ.xEMNIrSYO59toaFNaTvxKxf4wFGrckstm8MEP9OxmvM'
);

async function createStagingAdmin() {
  try {
    console.log('\n📋 Step 1: Creating admin user...');
    console.log('=====================================');

    // Create user in auth system
    const { data: authData, error: authError } = await stagingSupabase.auth.admin.createUser({
      email: 'staging@cozycatkitchen.com',
      password: 'StagingAdmin123!',
      email_confirm: true,
      user_metadata: {
        full_name: 'Staging Admin',
        role: 'admin'
      }
    });

    if (authError) {
      console.log('❌ Error creating auth user:', authError.message);
      
      // If user already exists, try to get existing user
      if (authError.message.includes('already registered')) {
        console.log('ℹ️ User already exists, creating profile...');
        
        // Get existing user ID
        const { data: existingUsers } = await stagingSupabase.auth.admin.listUsers({
          filters: {
            email: 'staging@cozycatkitchen.com'
          }
        });
        
        if (existingUsers && existingUsers.length > 0) {
          const userId = existingUsers[0].id;
          
          // Create/update profile
          const { data: profileData, error: profileError } = await stagingSupabase
            .from('profiles')
            .upsert({
              id: userId,
              email: 'staging@cozycatkitchen.com',
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
            console.log('✅ Profile created/updated successfully');
          }
        }
      }
      return;
    }

    console.log('✅ Auth user created:', authData.email, 'ID:', authData.id);

    // Create profile in profiles table
    console.log('\n📋 Step 2: Creating profile...');
    console.log('=====================================');

    const { data: profileData, error: profileError } = await stagingSupabase
      .from('profiles')
      .upsert({
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

    console.log('\n🎯 Staging Admin User Created!');
    console.log('=============================');
    console.log('📧 Email: staging@cozycatkitchen.com');
    console.log('🔑 Password: StagingAdmin123!');
    console.log('👤 Name: Staging Admin');
    console.log('🔐 Role: admin');
    console.log('\n🌐 You can now login with these credentials!');

  } catch (error) {
    console.error('❌ Error creating staging admin:', error);
  }
}

// Run the creation
if (require.main === module) {
  createStagingAdmin();
}

module.exports = { createStagingAdmin };
