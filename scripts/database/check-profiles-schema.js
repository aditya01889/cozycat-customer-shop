#!/usr/bin/env node

/**
 * Check Profiles Table Schema
 * Examines the actual structure of the profiles table
 */

require('dotenv').config({ path: './customer-shop/.env.staging' });
const { createClient } = require('@supabase/supabase-js');

console.log('🔍 Checking Profiles Table Schema');
console.log('=================================');

// Staging client
const stagingSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pjckafjhzwegtyhlatus.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqY2thZmpoendlZ3R5aGxhdHVzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTYzMDY3OSwiZXhwIjoyMDg1MjA2Njc5fQ.xEMNIrSYO59toaFNaTvxKxf4wFGrckstm8MEP9OxmvM'
);

async function checkProfilesSchema() {
  try {
    console.log('\n📋 Step 1: Getting table info...');
    console.log('=====================================');

    // Try to get table information
    const { data: tableInfo, error: tableError } = await stagingSupabase
      .rpc('get_table_columns', { table_name: 'profiles' });
    
    if (tableError) {
      console.log('⚠️ Cannot get table info via RPC, trying direct query...');
      
      // Alternative: Get sample data to infer schema
      const { data: sampleData, error: sampleError } = await stagingSupabase
        .from('profiles')
        .select('*')
        .limit(1);
      
      if (sampleError) {
        console.log('❌ Error getting sample data:', sampleError.message);
        return;
      }
      
      if (sampleData && sampleData.length > 0) {
        console.log('✅ Sample data found, inferring schema...');
        console.log('📋 Available columns:');
        Object.keys(sampleData[0]).forEach(key => {
          console.log(`   - ${key}`);
        });
      } else {
        console.log('❌ No data found in profiles table');
      }
    } else {
      console.log('✅ Table info retrieved:');
      console.log('📋 Columns in profiles table:');
      tableInfo.forEach(col => {
        console.log(`   - ${col.column_name} (${col.data_type})`);
      });
    }

    console.log('\n📋 Step 2: Checking existing profiles...');
    console.log('=====================================');

    const { data: profiles, error: profilesError } = await stagingSupabase
      .from('profiles')
      .select('*')
      .limit(3);
    
    if (profilesError) {
      console.log('❌ Error getting profiles:', profilesError.message);
    } else {
      console.log(`✅ Found ${profiles.length} profiles:`);
      profiles.forEach((profile, index) => {
        console.log(`\n   Profile ${index + 1}:`);
        Object.keys(profile).forEach(key => {
          const value = profile[key];
          console.log(`     ${key}: ${value !== null && value !== undefined ? value : 'NULL'}`);
        });
      });
    }

  } catch (error) {
    console.error('❌ Error checking schema:', error);
  }
}

// Run the check
if (require.main === module) {
  checkProfilesSchema();
}

module.exports = { checkProfilesSchema };
