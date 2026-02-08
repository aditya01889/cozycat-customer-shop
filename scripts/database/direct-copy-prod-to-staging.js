#!/usr/bin/env node

/**
 * Direct Production to Staging Copy
 * Copies data from production to staging database
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
    
    const { data: prodCategories, error: prodError } = await prodSupabase
      .from('categories')
      .select('count');
    
    if (prodError) {
      console.log('❌ Production connection failed:', prodError.message);
      return;
    }
    
    console.log('✅ Production connected');

    console.log('\n📋 Step 2: Test Staging Connection');
    console.log('===================================');
    
    const { data: stagingCategories, error: stagingError } = await stagingSupabase
      .from('categories')
      .select('count');
    
    if (stagingError) {
      console.log('❌ Staging connection failed:', stagingError.message);
      return;
    }
    
    console.log('✅ Staging connected');

    console.log('\n📋 Step 3: Copy Production Data to Staging');
    console.log('==========================================');

    const tables = [
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

    for (const tableName of tables) {
      try {
        console.log(`\n🔄 Copying ${tableName}...`);
        
        // Get production data
        const { data: prodData, error: fetchError } = await prodSupabase
          .from(tableName)
          .select('*');
        
        if (fetchError) {
          console.log(`❌ Error getting ${tableName} from production:`, fetchError.message);
          totalErrors++;
          continue;
        }

        if (!prodData || prodData.length === 0) {
          console.log(`ℹ️ ${tableName}: No data to copy`);
          continue;
        }

        console.log(`📊 Found ${prodData.length} records in production ${tableName}`);

        // Clear staging table
        const { error: clearError } = await stagingSupabase
          .from(tableName)
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000');
        
        if (clearError) {
          console.log(`❌ Error clearing staging ${tableName}:`, clearError.message);
          totalErrors++;
          continue;
        }

        console.log(`✅ Cleared staging ${tableName}`);

        // Insert data in batches
        const batchSize = 100;
        let copiedCount = 0;
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
              copiedCount += batch.length;
              console.log(`✅ Inserted batch ${Math.floor(i/batchSize) + 1} (${batch.length} records)`);
            }
          } catch (err) {
            console.log(`❌ Exception inserting batch ${Math.floor(i/batchSize) + 1}:`, err.message);
            errorCount++;
          }
        }

        console.log(`📊 ${tableName}: ${copiedCount} copied, ${errorCount} errors`);
        totalCopied += copiedCount;
        totalErrors += errorCount;

      } catch (err) {
        console.log(`❌ Exception copying ${tableName}:`, err.message);
        totalErrors++;
      }
    }

    console.log('\n📊 Copy Summary:');
    console.log('==================');
    console.log(`   ✅ Total records copied: ${totalCopied}`);
    console.log(`   ❌ Total errors: ${totalErrors}`);
    console.log(`   📋 Tables processed: ${tables.length}`);

    if (totalErrors > 0) {
      console.log('\n⚠️ Copy completed with some errors');
    } else {
      console.log('\n✅ Copy completed successfully');
    }

  } catch (error) {
    console.error('❌ Error during copy:', error);
  }
}

// Run the copy
if (require.main === module) {
  copyProductionToStaging();
}

module.exports = { copyProductionToStaging };
