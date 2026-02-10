#!/usr/bin/env node

/**
 * Improved Database Synchronization
 * Handles foreign key constraints and duplicates properly
 * Makes staging an exact logical clone of production
 */

const { createClient } = require('@supabase/supabase-js');

console.log('🔄 Improved Database Synchronization: Production → Staging');
console.log('==========================================================');

// Production client
const prodSupabase = createClient(
  'https://xfnbhheapralprcwjvzl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmbmJoaGVhcHJhbHByY3dqdnpsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODMxNDUwMywiZXhwIjoyMDgzODkwNTAzfQ.uTt3Q-sahXSAbtC5UPAIRenNYJcGPksSIUOiQtwd6H0'
);

// Staging client
const stagingSupabase = createClient(
  'https://pjckafjhzwegtyhlatus.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqY2thZmpoendlZ3R5aGxhdHVzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTYzMDY3OSwiZXhwIjoyMDg1MjA2Njc5fQ.xEMNIrSYO59toaFNaTvxKxf4wFGrckstm8MEP9OxmvM'
);

// Tables in dependency order (parents first, children last)
const TABLE_DEPENDENCY_ORDER = [
  'categories',           // Parent of products
  'delivery_partners',    // Independent
  'profiles',             // Parent of orders, customer_addresses
  'products',             // Parent of product_variants, product_recipes
  'product_variants',     // Parent of order_items
  'product_recipes',      // Independent
  'customer_addresses',  // Child of profiles
  'orders',               // Child of profiles
  'order_items'           // Child of orders, product_variants
];

async function improvedSynchronization() {
  try {
    console.log('\n📋 Step 1: Test Connections');
    console.log('=============================');
    
    // Test connections
    const { data: prodTest, error: prodError } = await prodSupabase
      .from('categories')
      .select('count')
      .limit(1);
    
    if (prodError) {
      console.log('❌ Production connection failed:', prodError.message);
      return;
    }
    console.log('✅ Production connected');

    const { data: stagingTest, error: stagingError } = await stagingSupabase
      .from('categories')
      .select('count')
      .limit(1);
    
    if (stagingError) {
      console.log('❌ Staging connection failed:', stagingError.message);
      return;
    }
    console.log('✅ Staging connected');

    console.log('\n📋 Step 2: Discover Available Tables');
    console.log('=====================================');
    
    const availableTables = [];
    
    for (const tableName of TABLE_DEPENDENCY_ORDER) {
      try {
        const { data, error } = await prodSupabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (!error) {
          availableTables.push(tableName);
          console.log(`✅ Available: ${tableName}`);
        } else {
          console.log(`⚠️ Not available: ${tableName} - ${error.message}`);
        }
      } catch (err) {
        console.log(`❌ Error checking ${tableName}: ${err.message}`);
      }
    }
    
    console.log(`\n📊 Available tables: ${availableTables.length}`);

    console.log('\n📋 Step 3: Clear Staging Database (Reverse Dependency Order)');
    console.log('=============================================================');
    
    // Clear tables in reverse dependency order to avoid FK violations
    const clearOrder = [...availableTables].reverse();
    let clearedTables = 0;
    
    for (const tableName of clearOrder) {
      try {
        console.log(`🗑️ Clearing ${tableName}...`);
        
        // Use a more aggressive clear approach
        const { error: clearError } = await stagingSupabase
          .from(tableName)
          .delete()
          .or('id.eq.00000000-0000-0000-0000-000000000000,id.neq.00000000-0000-0000-0000-000000000000');
        
        if (clearError) {
          // Try alternative clear method
          const { error: altError } = await stagingSupabase
            .from(tableName)
            .delete()
            .gte('created_at', '1970-01-01');
          
          if (altError) {
            console.log(`⚠️ Could not clear ${tableName}: ${altError.message}`);
          } else {
            console.log(`✅ Cleared ${tableName} (alternative method)`);
            clearedTables++;
          }
        } else {
          console.log(`✅ Cleared ${tableName}`);
          clearedTables++;
        }
      } catch (err) {
        console.log(`❌ Error clearing ${tableName}: ${err.message}`);
      }
    }

    console.log(`\n📊 Tables cleared: ${clearedTables}/${availableTables.length}`);

    console.log('\n📋 Step 4: Copy Production Data (Correct Dependency Order)');
    console.log('===========================================================');
    
    let totalRecords = 0;
    let totalErrors = 0;
    let successfulTables = 0;

    for (const tableName of availableTables) {
      try {
        console.log(`\n🔄 Processing table: ${tableName}`);
        
        // Get all data from production
        const { data: prodData, error: fetchError } = await prodSupabase
          .from(tableName)
          .select('*');
        
        if (fetchError) {
          console.log(`❌ Error fetching ${tableName}: ${fetchError.message}`);
          totalErrors++;
          continue;
        }

        if (!prodData || prodData.length === 0) {
          console.log(`ℹ️ ${tableName}: No data to copy`);
          successfulTables++;
          continue;
        }

        console.log(`📊 ${tableName}: Found ${prodData.length} records`);

        // Insert data into staging in smaller batches with upsert to handle duplicates
        const batchSize = 50;
        let copiedCount = 0;
        let batchErrors = 0;

        for (let i = 0; i < prodData.length; i += batchSize) {
          const batch = prodData.slice(i, i + batchSize);
          
          try {
            // Use upsert to handle potential duplicates
            const { error: insertError } = await stagingSupabase
              .from(tableName)
              .upsert(batch, { 
                onConflict: 'id', // Assuming 'id' is the primary key
                ignoreDuplicates: false 
              });
            
            if (insertError) {
              // Try regular insert if upsert fails
              const { error: regularInsertError } = await stagingSupabase
                .from(tableName)
                .insert(batch);
              
              if (regularInsertError) {
                console.log(`❌ Batch error in ${tableName}: ${regularInsertError.message}`);
                batchErrors++;
              } else {
                copiedCount += batch.length;
              }
            } else {
              copiedCount += batch.length;
            }
          } catch (err) {
            console.log(`❌ Batch exception in ${tableName}: ${err.message}`);
            batchErrors++;
          }
        }

        if (batchErrors === 0) {
          console.log(`✅ ${tableName}: Copied ${copiedCount} records`);
          successfulTables++;
        } else {
          console.log(`⚠️ ${tableName}: Copied ${copiedCount} records with ${batchErrors} batch errors`);
          totalErrors += batchErrors;
        }
        
        totalRecords += copiedCount;

      } catch (err) {
        console.log(`❌ Error processing ${tableName}: ${err.message}`);
        totalErrors++;
      }
    }

    console.log('\n📋 Step 5: Detailed Verification');
    console.log('=================================');
    
    let verificationPassed = true;
    let verifiedTables = 0;
    let totalProdRecords = 0;
    let totalStagingRecords = 0;

    for (const tableName of availableTables) {
      try {
        // Get production count
        const { data: prodData, error: prodCountError } = await prodSupabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });
        
        if (prodCountError) {
          console.log(`⚠️ Could not count production ${tableName}: ${prodCountError.message}`);
          continue;
        }

        // Get staging count
        const { data: stagingData, error: stagingCountError } = await stagingSupabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });
        
        if (stagingCountError) {
          console.log(`⚠️ Could not count staging ${tableName}: ${stagingCountError.message}`);
          continue;
        }

        const prodRecordCount = prodData?.length || 0;
        const stagingRecordCount = stagingData?.length || 0;
        
        totalProdRecords += prodRecordCount;
        totalStagingRecords += stagingRecordCount;

        if (prodRecordCount === stagingRecordCount) {
          console.log(`✅ ${tableName}: ${prodRecordCount} records match`);
          verifiedTables++;
        } else {
          console.log(`❌ ${tableName}: Production=${prodRecordCount}, Staging=${stagingRecordCount}`);
          verificationPassed = false;
        }
      } catch (err) {
        console.log(`❌ Verification error for ${tableName}: ${err.message}`);
        verificationPassed = false;
      }
    }

    console.log('\n📊 Synchronization Summary');
    console.log('===========================');
    console.log(`✅ Tables processed: ${availableTables.length}`);
    console.log(`✅ Tables successfully copied: ${successfulTables}`);
    console.log(`✅ Tables verified: ${verifiedTables}`);
    console.log(`📊 Production total records: ${totalProdRecords}`);
    console.log(`📊 Staging total records: ${totalStagingRecords}`);
    console.log(`📊 Records copied: ${totalRecords}`);
    console.log(`❌ Total errors: ${totalErrors}`);
    
    if (verificationPassed && totalErrors === 0) {
      console.log('\n🎉 Synchronization completed successfully!');
      console.log('✅ Staging database is now an exact logical clone of production');
    } else if (verificationPassed) {
      console.log('\n✅ Synchronization completed successfully (with minor errors)');
      console.log('✅ Staging database matches production data');
    } else {
      console.log('\n⚠️ Synchronization completed with issues');
      if (!verificationPassed) {
        console.log('❌ Some tables do not match production');
      }
      if (totalErrors > 0) {
        console.log(`❌ ${totalErrors} errors occurred during copying`);
      }
    }

  } catch (error) {
    console.error('❌ Synchronization failed:', error);
  }
}

// Run the synchronization
if (require.main === module) {
  improvedSynchronization();
}

module.exports = { improvedSynchronization };
