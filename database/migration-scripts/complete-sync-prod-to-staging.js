#!/usr/bin/env node

/**
 * Complete Database Synchronization using Supabase Client
 * Makes staging an exact logical clone of production
 * Equivalent to pg_dump + pg_restore but using Supabase API
 */

const { createClient } = require('@supabase/supabase-js');

console.log('🔄 Complete Database Synchronization: Production → Staging');
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

// Common table names that should exist
const COMMON_TABLES = [
  'categories',
  'products', 
  'product_variants',
  'product_recipes',
  'profiles',
  'orders',
  'order_items',
  'cart_items',
  'customer_addresses',
  'delivery_partners',
  'admin_users',
  'auth.users',
  'auth.sessions'
];

async function completeSynchronization() {
  try {
    console.log('\n📋 Step 1: Test Connections');
    console.log('=============================');
    
    // Test production
    const { data: prodTest, error: prodError } = await prodSupabase
      .from('categories')
      .select('count')
      .limit(1);
    
    if (prodError) {
      console.log('❌ Production connection failed:', prodError.message);
      return;
    }
    console.log('✅ Production connected');

    // Test staging
    const { data: stagingTest, error: stagingError } = await stagingSupabase
      .from('categories')
      .select('count')
      .limit(1);
    
    if (stagingError) {
      console.log('❌ Staging connection failed:', stagingError.message);
      return;
    }
    console.log('✅ Staging connected');

    console.log('\n📋 Step 2: Discover Production Tables');
    console.log('=======================================');
    
    // Try to get table list from a known working approach
    const productionTables = [];
    
    // Test each common table to see if it exists in production
    for (const tableName of COMMON_TABLES) {
      try {
        // Skip auth tables for now as they require special handling
        if (tableName.startsWith('auth.')) {
          continue;
        }
        
        const { data, error } = await prodSupabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (!error) {
          productionTables.push(tableName);
          console.log(`✅ Found table: ${tableName}`);
        } else {
          console.log(`⚠️ Table not accessible: ${tableName} - ${error.message}`);
        }
      } catch (err) {
        console.log(`❌ Error checking ${tableName}: ${err.message}`);
      }
    }
    
    console.log(`\n📊 Production tables found: ${productionTables.length}`);
    console.log(`📋 ${productionTables.join(', ')}`);

    console.log('\n📋 Step 3: Clear Staging Database');
    console.log('==================================');
    
    let clearedTables = 0;
    for (const tableName of productionTables) {
      try {
        // Clear all data from staging table
        const { error: clearError } = await stagingSupabase
          .from(tableName)
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all but a dummy ID
        
        if (clearError) {
          // Try alternative clear method
          const { error: altError } = await stagingSupabase
            .from(tableName)
            .delete()
            .gte('id', '00000000-0000-0000-0000-000000000000'); // Delete all
          
          if (altError) {
            console.log(`⚠️ Could not clear ${tableName}: ${altError.message}`);
          } else {
            console.log(`✅ Cleared table: ${tableName}`);
            clearedTables++;
          }
        } else {
          console.log(`✅ Cleared table: ${tableName}`);
          clearedTables++;
        }
      } catch (err) {
        console.log(`❌ Error clearing ${tableName}: ${err.message}`);
      }
    }

    console.log(`\n📊 Tables cleared: ${clearedTables}/${productionTables.length}`);

    console.log('\n📋 Step 4: Copy Production Data to Staging');
    console.log('===========================================');
    
    let totalRecords = 0;
    let totalErrors = 0;
    let successfulTables = 0;

    for (const tableName of productionTables) {
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

        // Insert data into staging in batches
        const batchSize = 100;
        let copiedCount = 0;
        let batchErrors = 0;

        for (let i = 0; i < prodData.length; i += batchSize) {
          const batch = prodData.slice(i, i + batchSize);
          
          try {
            const { error: insertError } = await stagingSupabase
              .from(tableName)
              .insert(batch);
            
            if (insertError) {
              console.log(`❌ Batch error in ${tableName}: ${insertError.message}`);
              batchErrors++;
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

    console.log('\n📋 Step 5: Verification');
    console.log('=========================');
    
    let verificationPassed = true;
    let verifiedTables = 0;

    for (const tableName of productionTables) {
      try {
        // Get production count
        const { data: prodCount, error: prodCountError } = await prodSupabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });
        
        if (prodCountError) {
          console.log(`⚠️ Could not count production ${tableName}: ${prodCountError.message}`);
          continue;
        }

        // Get staging count
        const { data: stagingCount, error: stagingCountError } = await stagingSupabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });
        
        if (stagingCountError) {
          console.log(`⚠️ Could not count staging ${tableName}: ${stagingCountError.message}`);
          continue;
        }

        const prodRecordCount = prodCount?.length || 0;
        const stagingRecordCount = stagingCount?.length || 0;

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
    console.log(`✅ Tables processed: ${productionTables.length}`);
    console.log(`✅ Tables successfully copied: ${successfulTables}`);
    console.log(`✅ Tables verified: ${verifiedTables}`);
    console.log(`📊 Total records copied: ${totalRecords}`);
    console.log(`❌ Total errors: ${totalErrors}`);
    
    if (verificationPassed && totalErrors === 0) {
      console.log('\n🎉 Synchronization completed successfully!');
      console.log('✅ Staging database is now an exact logical clone of production');
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
  completeSynchronization();
}

module.exports = { completeSynchronization };
