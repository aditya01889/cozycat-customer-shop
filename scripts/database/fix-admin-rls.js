#!/usr/bin/env node

/**
 * Fix Admin RLS Policies
 * Updates RLS policies to ensure admin access
 */

require('dotenv').config({ path: './customer-shop/.env.staging' });
const { createClient } = require('@supabase/supabase-js');

console.log('🔧 Fixing Admin RLS Policies');
console.log('==============================');

// Staging client
const stagingSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pjckafjhzwegtyhlatus.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqY2thZmpoendlZ3R5aGxhdHVzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTYzMDY3OSwiZXhwIjoyMDg1MjA2Njc5fQ.xEMNIrSYO59toaFNaTvxKxf4wFGrckstm8MEP9OxmvM'
);

async function fixAdminRLS() {
  try {
    console.log('\n📋 Step 1: Dropping existing policies...');
    console.log('=====================================');

    // Drop existing policies
    const policies = [
      'profiles_admin_policy',
      'orders_admin_policy',
      'products_admin_policy',
      'categories_admin_policy'
    ];

    for (const policy of policies) {
      try {
        const { error } = await stagingSupabase.rpc('exec_sql', {
          sql: `DROP POLICY IF EXISTS ${policy};`
        });
        
        if (error) {
          console.log(`⚠️ Could not drop ${policy}:`, error.message);
        } else {
          console.log(`✅ Dropped ${policy}`);
        }
      } catch (err) {
        console.log(`⚠️ Error dropping ${policy}:`, err.message);
      }
    }

    console.log('\n📋 Step 2: Creating new admin policies...');
    console.log('=========================================');

    // Create new admin policies
    const adminPolicies = [
      {
        name: 'profiles_admin_policy',
        sql: `
          CREATE POLICY profiles_admin_policy ON profiles
          FOR ALL
          USING (
            (auth.jwt() ->> 'role' = 'admin')
          )
          WITH CHECK (
            auth.uid() = id
          )
          ALLOW ALL;
        `
      },
      {
        name: 'orders_admin_policy', 
        sql: `
          CREATE POLICY orders_admin_policy ON orders
          FOR ALL
          USING (
            (auth.jwt() ->> 'role' = 'admin')
          )
          WITH CHECK (
            auth.uid() = user_id
          )
          ALLOW ALL;
        `
      },
      {
        name: 'products_admin_policy',
        sql: `
          CREATE POLICY products_admin_policy ON products
          FOR ALL
          USING (
            (auth.jwt() ->> 'role' = 'admin')
          )
          WITH CHECK (
            auth.uid() = id
          )
          ALLOW ALL;
        `
      },
      {
        name: 'categories_admin_policy',
        sql: `
          CREATE POLICY categories_admin_policy ON categories
          FOR ALL
          USING (
            (auth.jwt() ->> 'role' = 'admin')
          )
          WITH CHECK (
            auth.uid() = id
          )
          ALLOW ALL;
        `
      }
    ];

    for (const policy of adminPolicies) {
      try {
        const { error } = await stagingSupabase.rpc('exec_sql', {
          sql: policy.sql
        });
        
        if (error) {
          console.log(`❌ Error creating ${policy.name}:`, error.message);
        } else {
          console.log(`✅ Created ${policy.name}`);
        }
      } catch (err) {
        console.log(`❌ Exception creating ${policy.name}:`, err.message);
      }
    }

    console.log('\n📋 Step 3: Enabling RLS...');
    console.log('=================================');

    // Enable RLS on tables
    const tables = ['profiles', 'orders', 'products', 'categories'];
    
    for (const table of tables) {
      try {
        const { error } = await stagingSupabase.rpc('exec_sql', {
          sql: `ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;`
        });
        
        if (error) {
          console.log(`⚠️ Could not enable RLS on ${table}:`, error.message);
        } else {
          console.log(`✅ Enabled RLS on ${table}`);
        }
      } catch (err) {
        console.log(`⚠️ Error enabling RLS on ${table}:`, err.message);
      }
    }

    console.log('\n🎯 Admin RLS policies fixed!');
    console.log('=============================');
    console.log('✅ Admin users should now have full access');
    console.log('🌐 Try accessing admin dashboard again');

  } catch (error) {
    console.error('❌ Error fixing RLS:', error);
  }
}

// Run the fix
if (require.main === module) {
  fixAdminRLS();
}

module.exports = { fixAdminRLS };
