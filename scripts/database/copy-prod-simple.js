#!/usr/bin/env node

/**
 * Simple Production to Staging Copy
 * Copies known tables from production to staging
 */

const { createClient } = require('@supabase/supabase-js');

// Production credentials
const prodSupabase = createClient(
  'https://xfnbhheapralprcwjvzl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmbmJoaGVhcHJhbHByY3dqdnpsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODMxNDUwMywiZXhwIjoyMDgzODkwNTAzfQ.uTt3Q-sahXSAbtC5UPAIRenNYJcGPksSIUOiQtwd6H0'
);

// Staging client
const stagingSupabase = createClient(
  'https://pjckafjhzwegtyhlatus.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqY2thZmpoendlZ3R5aGxhdHVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2MzA2NzksImV4cCI6MjA4NTIwNjY3OX0.VQ48IDxmrVm9jbGT-EycSK5ofG7sAPKAFeoGy41qgNU'
);

console.log('🔄 Simple Production to Staging Copy');
console.log('=====================================');

async function copyProductionToStaging() {
  try {
    console.log('📋 Copying known tables from production to staging...');
    
    // Known tables in the application
    const tablesToCopy = [
      'categories',
      'products', 
      'product_variants',
      'profiles',
      'orders',
      'order_items',
      'cart_items'
    ];

    let totalCopied = 0;
    let totalErrors = 0;

    // Copy each table
    for (const tableName of tablesToCopy) {
      try {
        console.log(`📦 Copying ${tableName}...`);
        
        // Get all data from production
        const { data: prodData, error: dataError } = await prodSupabase
          .from(tableName)
          .select('*');

        if (dataError) {
          console.log(`❌ Error getting ${tableName} from production:`, dataError.message);
          totalErrors++;
          continue;
        }

        if (!prodData || prodData.length === 0) {
          console.log(`✅ ${tableName} - no data to copy`);
          continue;
        }

        // Clear staging table first
        const { error: clearError } = await stagingSupabase
          .from(tableName)
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000');

        if (clearError) {
          console.log(`⚠️ Error clearing ${tableName} in staging:`, clearError.message);
        }

        // Insert production data into staging
        const { error: insertError } = await stagingSupabase
          .from(tableName)
          .insert(prodData);

        if (insertError) {
          console.log(`❌ Error inserting ${tableName} into staging:`, insertError.message);
          totalErrors++;
        } else {
          console.log(`✅ Copied ${prodData.length} records to ${tableName}`);
          totalCopied += prodData.length;
        }

      } catch (err) {
        console.log(`❌ Error copying ${tableName}:`, err.message);
        totalErrors++;
      }
    }

    console.log('\n📊 Copy Summary:');
    console.log(`   ✅ Total records copied: ${totalCopied}`);
    console.log(`   ❌ Total errors: ${totalErrors}`);
    console.log(`   📋 Tables processed: ${tablesToCopy.length}`);

    if (totalErrors === 0) {
      console.log('\n🎉 Production database copied to staging successfully!');
      console.log('\n📋 Next Steps:');
      console.log('1. Run staging verification: node scripts/database/verify-staging-import.js');
      console.log('2. Add staging test data: node scripts/database/add-staging-test-data.js');
    } else {
      console.log('\n⚠️ Copy completed with some errors');
    }

  } catch (error) {
    console.error('❌ Fatal error in copy process:', error);
  }
}

// Run the copy process
if (require.main === module) {
  copyProductionToStaging();
}

module.exports = { copyProductionToStaging };
