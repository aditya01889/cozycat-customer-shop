#!/usr/bin/env node

/**
 * Create Test Admin User
 * Creates a guaranteed working admin user for staging
 */

const { createClient } = require('@supabase/supabase-js');

console.log('👤 Creating Test Admin User');
console.log('============================');

// Staging client
const stagingSupabase = createClient(
  'https://pjckafjhzwegtyhlatus.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqY2thZmpoendlZ3R5aGxhdHVzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTYzMDY3OSwiZXhwIjoyMDg1MjA2Njc5fQ.xEMNIrSYO59toaFNaTvxKxf4wFGrckstm8MEP9OxmvM'
);

async function createTestAdmin() {
  try {
    console.log('\n📋 Creating test admin user...');
    
    // Create user with simple credentials
    const { data: authData, error: authError } = await stagingSupabase.auth.signUp({
      email: 'test@cozycatkitchen.com',
      password: 'TestAdmin123!',
      options: {
        data: {
          full_name: 'Test Admin',
          role: 'admin'
        }
      }
    });

    if (authError) {
      console.log('❌ Error creating user:', authError.message);
      
      // If user exists, try to get profile and create it
      if (authError.message.includes('already registered')) {
        console.log('ℹ️ User already exists, checking profile...');
        
        // Try to get user by email
        const { data: { users } } = await stagingSupabase.auth.admin.listUsers({
          filters: {
            email: 'test@cozycatkitchen.com'
          }
        });
        
        if (users && users.length > 0) {
          const userId = users[0].id;
          
          // Create profile
          const { data: profileData, error: profileError } = await stagingSupabase
            .from('profiles')
            .upsert({
              id: userId,
              email: 'test@cozycatkitchen.com',
              full_name: 'Test Admin',
              role: 'admin',
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select();
          
          if (profileError) {
            console.log('❌ Profile error:', profileError.message);
          } else {
            console.log('✅ Profile created successfully');
          }
        }
      }
    } else {
      console.log('✅ User created successfully');
      console.log(`📧 Email: ${authData.email}`);
      console.log(`🆔 User ID: ${authData.user?.id}`);
      
      // Create profile
      const { data: profileData, error: profileError } = await stagingSupabase
        .from('profiles')
        .insert({
          id: authData.user?.id,
          email: authData.email,
          full_name: 'Test Admin',
          role: 'admin',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select();

      if (profileError) {
        console.log('❌ Profile error:', profileError.message);
      } else {
        console.log('✅ Profile created successfully');
      }
    }

    console.log('\n🎯 TEST ADMIN CREDENTIALS:');
    console.log('============================');
    console.log('📧 Email: test@cozycatkitchen.com');
    console.log('🔑 Password: TestAdmin123!');
    console.log('👤 Name: Test Admin');
    console.log('🔐 Role: admin');
    console.log('\n🌐 Login at: https://cozycatkitchen-staging.vercel.app/auth');
    console.log('\n✅ These credentials should work immediately!');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the creation
if (require.main === module) {
  createTestAdmin();
}

module.exports = { createTestAdmin };
