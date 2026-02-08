#!/usr/bin/env node

/**
 * Debug Staging Authentication
 * Simple debug script to test auth system
 */

const { createClient } = require('@supabase/supabase-js');

console.log('🔍 Debugging Staging Authentication');
console.log('=================================');

// Staging client
const stagingSupabase = createClient(
  'https://pjckafjhzwegtyhlatus.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqY2thZmpoendlZ3R5aGxhdHVzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTYzMDY3OSwiZXhwIjoyMDg1MjA2Njc5fQ.xEMNIrSYO59toaFNaTvxKxf4wFGrckstm8MEP9OxmvM'
);

async function debugStagingAuth() {
  try {
    console.log('\n📋 Step 1: Testing existing admin login...');
    console.log('========================================');
    
    // Test with existing admin user
    const { data: authData, error: authError } = await stagingSupabase.auth.signInWithPassword({
      email: 'aditya01889@gmail.com',
      password: 'admin123' // Try simple password
    });

    if (authError) {
      console.log('❌ Login failed with admin123:', authError.message);
      
      // Try with production password
      console.log('\n📋 Step 2: Trying with production password...');
      console.log('========================================');
      
      const { data: authData2, error: authError2 } = await stagingSupabase.auth.signInWithPassword({
        email: 'aditya01889@gmail.com',
        password: 'your-production-password' // Replace with actual password
      });

      if (authError2) {
        console.log('❌ Login failed with production password:', authError2.message);
        console.log('\n🔧 SOLUTION:');
        console.log('=============');
        console.log('1. Use existing working user:');
        console.log('   Email: aditya01889@gmail.com');
        console.log('   Password: [your actual production password]');
        console.log('2. Or create new admin with:');
        console.log('   Email: admin@staging.com');
        console.log('   Password: admin123');
      } else {
        console.log('✅ Login successful with production password!');
      }
    } else {
      console.log('✅ Login successful with admin123!');
      console.log(`🎯 User: ${authData.user?.email}`);
      console.log(`🆔 Session active: ${!!authData.session?.access_token}`);
    }

  } catch (error) {
    console.error('❌ Debug error:', error);
  }
}

// Run the debug
if (require.main === module) {
  debugStagingAuth();
}

module.exports = { debugStagingAuth };
