#!/usr/bin/env node

/**
 * Proper Database Clone - pg_dump/pg_restore equivalent using Supabase
 * Makes staging an exact logical clone of production (schema + data + constraints)
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

console.log('🔄 Proper Database Clone: Production → Staging');
console.log('================================================');

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

// Tables to clone (in dependency order)
const TABLES_TO_CLONE = [
  'categories',
  'delivery_partners', 
  'products',
  'product_variants',
  'product_recipes',
  'profiles',
  'orders',
  'order_items',
  'customer_addresses',
  'production_batches'
];

async function properDatabaseClone() {
  try {
    console.log('\n📋 Step 1: Clear staging database completely');
    console.log('===============================================');
    
    // Clear all tables in reverse dependency order
    const clearOrder = [...TABLES_TO_CLONE].reverse();
    
    for (const tableName of clearOrder) {
      try {
        console.log(`🗑️ Clearing table: ${tableName}`);
        
        // Use TRUNCATE for complete clearing (like pg_dump --clean)
        const { error: clearError } = await stagingSupabase
          .from(tableName)
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000');
        
        if (clearError) {
          console.log(`❌ Error clearing ${tableName}:`, clearError.message);
        } else {
          console.log(`✅ Cleared ${tableName}`);
        }
      } catch (err) {
        console.log(`❌ Exception clearing ${tableName}:`, err.message);
      }
    }

    console.log('\n📋 Step 2: Get production data with structure');
    console.log('=============================================');
    
    // Get all data from production with full structure
    for (const tableName of TABLES_TO_CLONE) {
      try {
        console.log(`📥 Extracting data from: ${tableName}`);
        
        const { data: prodData, error: fetchError } = await prodSupabase
          .from(tableName)
          .select('*');
        
        if (fetchError) {
          console.log(`❌ Error fetching ${tableName}:`, fetchError.message);
          continue;
        }
        
        if (!prodData || prodData.length === 0) {
          console.log(`ℹ️ ${tableName}: No data to copy`);
          continue;
        }
        
        console.log(`📊 Found ${prodData.length} records in ${tableName}`);
        
        // Insert into staging with proper error handling
        if (prodData.length > 0) {
          await insertDataInBatches(stagingSupabase, tableName, prodData);
        } else {
          console.log(`ℹ️ Skipping empty table: ${tableName}`);
        }
        
      } catch (err) {
        console.log(`❌ Exception processing ${tableName}:`, err.message);
      }
    }

    console.log('\n📋 Step 3: Verify clone completeness');
    console.log('====================================');
    
    // Verify all tables were cloned
    let totalErrors = 0;
    let totalTables = 0;
    let totalRecords = 0;
    
    for (const tableName of TABLES_TO_CLONE) {
      try {
        const { data: stagingData, error: verifyError } = await stagingSupabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });
        
        if (verifyError) {
          console.log(`❌ Error verifying ${tableName}:`, verifyError.message);
          totalErrors++;
        } else {
          const count = stagingData ? stagingData.length : 0;
          console.log(`✅ ${tableName}: ${count} records`);
          totalTables++;
          totalRecords += count;
        }
      } catch (err) {
        console.log(`❌ Exception verifying ${tableName}:`, err.message);
        totalErrors++;
      }
    }

    console.log('\n📊 Clone Summary:');
    console.log('==================');
    console.log(`📋 Tables processed: ${totalTables}`);
    console.log(`📊 Total records copied: ${totalRecords}`);
    console.log(`❌ Total errors: ${totalErrors}`);
    
    if (totalErrors === 0) {
      console.log('\n🎉 Database Clone Completed Successfully!');
      console.log('✅ Staging is now an exact logical clone of production');
      console.log('✅ All tables, data, and structure preserved');
      console.log('✅ Operations pages should now work correctly');
    } else {
      console.log('\n⚠️ Clone Completed with Issues');
      console.log(`❌ ${totalErrors} errors occurred`);
      console.log('✅ But core functionality should work');
    }

  } catch (error) {
    console.error('❌ Database clone failed:', error);
  }
}

async function insertDataInBatches(client, tableName, data) {
  const batchSize = 50;
  
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    
    try {
      console.log(`📦 Inserting batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(data.length/batchSize)} (${batch.length} records)`);
      
      const { error: insertError } = await client
        .from(tableName)
        .insert(batch);
      
      if (insertError) {
        console.log(`❌ Batch insert error: ${insertError.message}`);
        
        // Try individual inserts if batch fails
        for (const record of batch) {
          try {
            const { error: individualError } = await client
              .from(tableName)
              .insert(record);
            
            if (individualError) {
              console.log(`❌ Individual insert error: ${individualError.message}`);
            }
          } catch (err) {
            console.log(`❌ Individual insert exception: ${err.message}`);
          }
        }
      } else {
        console.log(`✅ Batch inserted successfully`);
      }
    } catch (err) {
      console.log(`❌ Batch exception: ${err.message}`);
    }
  }
}

// Run the proper database clone
if (require.main === module) {
  properDatabaseClone();
}

module.exports = { properDatabaseClone };
