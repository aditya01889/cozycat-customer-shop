#!/usr/bin/env node

/**
 * Direct Production to Staging Copy
 * Uses Supabase client to copy data table by table
 */

const { createClient } = require('@supabase/supabase-js');

console.log('🔄 Direct Production to Staging Copy');
console.log('===================================');

// Production client
const prodSupabase = createClient(
  'https://xfnbhheapralprcwjvzl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmbmJoaGVhcHJhbHByY3dqdnpsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODMxNDUwMywiZXhwIjoyMDgzODkwNTAzfQ.uTt3Q-sahXSAbtC5UPAIRenNYJcGPksSIUOiQtwd6H0'
);

// Staging client
const stagingSupabase = createClient(
  'https://pjckafjhzwegtyhlatus.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqY2thZmpoendlZ3R5aGxhdHVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2MzA2NzksImV4cCI6MjA4NTIwNjY3OX0.VQ48IDxmrVm9jbGT-EycSK5ofG7sAPKAFeoGy41qgNU'
);

async function copyProductionToStaging() {
  try {
    console.log('\n📋 Step 1: Test Production Connection');
    console.log('=====================================');
    
    // Test production connection
    const { data: prodTest, error: prodError } = await prodSupabase
      .from('categories')
      .select('count')
      .limit(1);

    if (prodError) {
      console.log('❌ Production connection failed:', prodError.message);
      return;
    }
    
    console.log(`✅ Production connected - Categories: ${prodTest?.[0]?.count || 0} records`);

    console.log('\n📋 Step 2: Test Staging Connection');
    console.log('===================================');
    
    // Test staging connection
    const { data: stagingTest, error: stagingError } = await stagingSupabase
      .from('categories')
      .select('count')
      .limit(1);

    if (stagingError) {
      console.log('❌ Staging connection failed:', stagingError.message);
      console.log('🔧 Staging tables may not exist yet');
      console.log('📋 Will create tables as needed');
    } else {
      console.log(`✅ Staging connected - Categories: ${stagingTest?.[0]?.count || 0} records`);
    }

    console.log('\n📋 Step 3: Copy Production Data to Staging');
    console.log('==========================================');

    // Known tables to copy
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

    for (const tableName of tablesToCopy) {
      try {
        console.log(`\n📦 Copying ${tableName}...`);
        
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

        console.log(`📊 Found ${prodData.length} records in production ${tableName}`);

        // Clear staging table first (if it exists)
        try {
          const { error: clearError } = await stagingSupabase
            .from(tableName)
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000');

          if (clearError) {
            console.log(`⚠️ Error clearing ${tableName} in staging:`, clearError.message);
            console.log(`🔄 Table ${tableName} may not exist yet`);
          } else {
            console.log(`✅ Cleared staging ${tableName}`);
          }
        } catch (clearErr) {
          console.log(`⚠️ Clear error for ${tableName}:`, clearErr.message);
        }

        // Insert production data into staging in batches
        const batchSize = 100;
        let successCount = 0;
        let errorCount = 0;

        for (let i = 0; i < prodData.length; i += batchSize) {
          const batch = prodData.slice(i, i + batchSize);
          
          try {
            const { error: insertError } = await stagingSupabase
              .from(tableName)
              .insert(batch);

            if (insertError) {
              console.log(`❌ Error inserting batch ${Math.floor(i/batchSize) + 1} into ${tableName}:`, insertError.message);
              errorCount++;
            } else {
              successCount += batch.length;
              console.log(`✅ Inserted batch ${Math.floor(i/batchSize) + 1} (${batch.length} records)`);
            }
          } catch (err) {
            console.log(`❌ Exception inserting batch ${Math.floor(i/batchSize) + 1}:`, err.message);
            errorCount++;
          }
        }

        console.log(`📊 ${tableName}: ${successCount} copied, ${errorCount} errors`);
        totalCopied += successCount;
        totalErrors += errorCount;

      } catch (err) {
        console.log(`❌ Error copying ${tableName}:`, err.message);
        totalErrors++;
      }
    }

    console.log('\n📊 Copy Summary:');
    console.log('==================');
    console.log(`   ✅ Total records copied: ${totalCopied}`);
    console.log(`   ❌ Total errors: ${totalErrors}`);
    console.log(`   📋 Tables processed: ${tablesToCopy.length}`);

    if (totalErrors === 0) {
      console.log('\n🎉 Production database copied to staging successfully!');
    } else {
      console.log('\n⚠️ Copy completed with some errors');
    }

    console.log('\n📋 Step 4: Verification');
    console.log('=========================');
    
    // Verify results
    for (const tableName of tablesToCopy) {
      try {
        const { data, error } = await stagingSupabase
          .from(tableName)
          .select('count')
          .limit(1);

        if (error) {
          console.log(`❌ ${tableName}: Error - ${error.message}`);
        } else {
          const count = data?.[0]?.count || 0;
          console.log(`✅ ${tableName}: ${count} records`);
        }
      } catch (err) {
        console.log(`❌ ${tableName}: Error checking table`);
      }
    }

    console.log('\n🎯 Next Steps:');
    console.log('===============');
    console.log('1. Verify staging: node scripts/database/verify-staging-import.js');
    console.log('2. Add staging data: node scripts/database/add-staging-test-data.js');
    console.log('3. Test staging app: https://cozycatkitchen-staging.vercel.app');

  } catch (error) {
    console.error('❌ Fatal error in copy process:', error);
  }
}

// Run the copy process
if (require.main === module) {
  copyProductionToStaging();
}

module.exports = { copyProductionToStaging };
