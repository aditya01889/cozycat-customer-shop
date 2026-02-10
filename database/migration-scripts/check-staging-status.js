#!/usr/bin/env node

/**
 * Check current staging database status after clone
 */

const { createClient } = require('@supabase/supabase-js');

console.log('🔍 Checking Staging Database Status');
console.log('====================================');

// Staging client
const stagingSupabase = createClient(
  'https://pjckafjhzwegtyhlatus.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqY2thZmpoendlZ3R5aGxhdHVzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTYzMDY3OSwiZXhwIjoyMDg1MjA2Njc5fQ.xEMNIrSYO59toaFNaTvxKxf4wFGrckstm8MEP9OxmvM'
);

const TABLES_TO_CHECK = [
  'categories',
  'products',
  'product_variants',
  'product_recipes',
  'profiles',
  'orders',
  'order_items',
  'customer_addresses',
  'production_batches',
  'delivery_partners',
  'vendors',
  'inventory'
];

async function checkStagingStatus() {
  try {
    console.log('\n📊 Current Staging Database Status:');
    console.log('===================================');
    
    let totalRecords = 0;
    let emptyTables = 0;
    
    for (const tableName of TABLES_TO_CHECK) {
      try {
        const { data: tableData, error: tableError } = await stagingSupabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });
        
        if (tableError) {
          console.log(`❌ Error checking ${tableName}:`, tableError.message);
          continue;
        }
        
        const count = tableData ? tableData.length : 0;
        const countInfo = tableData ? tableData.length : 0;
        
        console.log(`📋 ${tableName}: ${countInfo} records`);
        
        if (countInfo === 0) {
          console.log(`⚠️ ${tableName}: EMPTY - This explains operations page issues!`);
          emptyTables++;
        } else {
          console.log(`✅ ${tableName}: ${countInfo} records`);
          totalRecords += countInfo;
        }
        
        // Show sample data for key tables
        if (tableName === 'orders' && countInfo > 0) {
          console.log('📊 Sample order data:');
          tableData.slice(0, 3).forEach((order, index) => {
            console.log(`   Order ${index + 1}: ${order.id} | Status: ${order.status} | Total: ${order.total_amount}`);
          });
        }
        
        if (tableName === 'production_batches' && countInfo > 0) {
          console.log('📊 Sample batch data:');
          tableData.slice(0, 3).forEach((batch, index) => {
            console.log(`   Batch ${index + 1}: ${batch.id} | Product: ${batch.product_id || 'NULL'} | Status: ${batch.status}`);
          });
        }
        
        if (tableName === 'order_items' && countInfo > 0) {
          console.log('📊 Sample order items:');
          tableData.slice(0, 3).forEach((item, index) => {
            console.log(`   Item ${index + 1}: ${item.id} | Order: ${item.order_id} | Product: ${item.product_variant_id || 'NULL'} | Price: ${item.price || 'NULL'}`);
          });
        }
        
      } catch (err) {
        console.log(`❌ Exception checking ${tableName}:`, err.message);
      }
    }

    console.log('\n📊 Summary:');
    console.log('=============');
    console.log(`📊 Total records across all tables: ${totalRecords}`);
    console.log(`⚠️ Empty tables: ${emptyTables}`);
    
    if (emptyTables > 0) {
      console.log('\n🚨 DIAGNOSIS: Operations pages showing empty data because:');
      console.log(`   - ${emptyTables} tables are completely empty`);
      console.log('   - Even though we cloned production data, these tables show as empty');
      console.log('   - This suggests the clone process may have missed these tables');
      console.log('   - Or there are frontend query issues preventing data display');
      
      console.log('\n🔧 RECOMMENDATION:');
      console.log('   1. Refresh the operations page to see if data appears');
      console.log('   2. Check browser network tab for failed queries');
      console.log('   3. Verify the clone process completed successfully');
      console.log('   4. Check if frontend is querying the correct staging database');
    } else {
      console.log('\n✅ All tables have data - operations should work');
    }

  } catch (error) {
    console.error('❌ Status check failed:', error);
  }
}

if (require.main === module) {
  checkStagingStatus();
}

module.exports = { checkStagingStatus };
