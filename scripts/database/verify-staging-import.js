#!/usr/bin/env node

/**
 * Verify Staging Database Import
 * Checks that production data was successfully copied to staging
 */

require('dotenv').config({ path: './customer-shop/.env.staging' });
const { createClient } = require('@supabase/supabase-js');

console.log('🔍 Verifying Staging Database Import');
console.log('====================================');

// Staging client
const stagingSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pjckafjhzwegtyhlatus.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqY2thZmpoendlZ3R5aGxhdHVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2MzA2NzksImV4cCI6MjA4NTIwNjY3OX0.VQ48IDxmrVm9jbGT-EycSK5ofG7sAPKAFeoGy41qgNU'
);

async function verifyStagingImport() {
  try {
    console.log('\n📋 Step 1: Checking table structure...');
    console.log('=====================================');

    const tables = [
      'categories',
      'products',
      'product_variants', 
      'profiles',
      'orders',
      'order_items',
      'cart_items'
    ];

    const results = {};

    for (const tableName of tables) {
      try {
        const { data, error, count } = await stagingSupabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          console.log(`❌ ${tableName}: ${error.message}`);
          results[tableName] = { error: error.message, count: 0 };
        } else {
          console.log(`✅ ${tableName}: ${count || 0} records`);
          results[tableName] = { count: count || 0, error: null };
        }
      } catch (err) {
        console.log(`❌ ${tableName}: ${err.message}`);
        results[tableName] = { error: err.message, count: 0 };
      }
    }

    console.log('\n📋 Step 2: Data summary...');
    console.log('========================');
    
    for (const [tableName, result] of Object.entries(results)) {
      if (result.error) {
        console.log(`❌ ${tableName}: Error - ${result.error}`);
      } else {
        const emoji = tableName.includes('categories') ? '📂' : 
                     tableName.includes('products') ? '📦' :
                     tableName.includes('variants') ? '⚖️' :
                     tableName.includes('profiles') ? '👤' :
                     tableName.includes('orders') ? '🛒' :
                     tableName.includes('items') ? '📋' : '📊';
        console.log(`${emoji} ${tableName}: ${result.count}`);
      }
    }

    console.log('\n📋 Step 3: Validation results...');
    console.log('=============================');

    const expectedCounts = {
      categories: { min: 1, expected: 4 },
      products: { min: 1, expected: 18 },
      product_variants: { min: 1, expected: 22 },
      profiles: { min: 1, expected: 3 },
      orders: { min: 1, expected: 76 }
    };

    let validationPassed = true;
    let validationIssues = [];

    for (const [tableName, expected] of Object.entries(expectedCounts)) {
      const result = results[tableName];
      
      if (result.error) {
        validationPassed = false;
        validationIssues.push(`${tableName}: Table error - ${result.error}`);
      } else if (result.count < expected.min) {
        validationPassed = false;
        validationIssues.push(`${tableName}: Too few records (${result.count} < ${expected.min})`);
      } else if (result.count !== expected.expected) {
        console.log(`⚠️ ${tableName}: Record count mismatch (${result.count} vs expected ${expected.expected})`);
      } else {
        console.log(`✅ ${tableName}: Correct record count (${result.count})`);
      }
    }

    // Check order_items and cart_items (expected to be 0)
    const optionalTables = ['order_items', 'cart_items'];
    for (const tableName of optionalTables) {
      const result = results[tableName];
      if (!result.error && result.count > 0) {
        console.log(`ℹ️ ${tableName}: ${result.count} records (may be expected)`);
      }
    }

    console.log('\n🎯 Final Result:');
    console.log('================');
    
    if (validationPassed) {
      console.log('✅ Staging database verification PASSED');
      console.log('✅ All required tables have sufficient data');
      console.log('✅ Staging is ready for testing!');
    } else {
      console.log('❌ Staging database verification FAILED');
      console.log('❌ Issues found:');
      validationIssues.forEach(issue => console.log(`   - ${issue}`));
      console.log('\n🔧 Recommended actions:');
      console.log('   1. Check staging database connection');
      console.log('   2. Run data copy script again');
      console.log('   3. Verify table schemas match');
    }

  } catch (error) {
    console.error('❌ Verification error:', error);
  }
}

// Run verification
if (require.main === module) {
  verifyStagingImport();
}

module.exports = { verifyStagingImport };
