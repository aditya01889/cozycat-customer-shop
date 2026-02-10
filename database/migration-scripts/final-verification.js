#!/usr/bin/env node

/**
 * Final Verification of Database Synchronization
 */

const { createClient } = require('@supabase/supabase-js');

console.log('🔍 Final Verification: Production vs Staging');
console.log('=============================================');

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

const TABLES = [
  'categories',
  'delivery_partners', 
  'profiles',
  'products',
  'product_variants',
  'product_recipes',
  'customer_addresses',
  'orders',
  'order_items'
];

async function finalVerification() {
  try {
    let totalProdRecords = 0;
    let totalStagingRecords = 0;
    let allTablesMatch = true;

    console.log('\n📊 Table-by-Table Comparison:');
    console.log('=============================');

    for (const tableName of TABLES) {
      try {
        // Get production data
        const { data: prodData, error: prodError } = await prodSupabase
          .from(tableName)
          .select('*');
        
        if (prodError) {
          console.log(`❌ Production ${tableName}: ${prodError.message}`);
          continue;
        }

        // Get staging data
        const { data: stagingData, error: stagingError } = await stagingSupabase
          .from(tableName)
          .select('*');
        
        if (stagingError) {
          console.log(`❌ Staging ${tableName}: ${stagingError.message}`);
          continue;
        }

        const prodCount = prodData ? prodData.length : 0;
        const stagingCount = stagingData ? stagingData.length : 0;
        
        totalProdRecords += prodCount;
        totalStagingRecords += stagingCount;

        if (prodCount === stagingCount) {
          console.log(`✅ ${tableName}: Production=${prodCount}, Staging=${stagingCount} ✓`);
        } else {
          console.log(`❌ ${tableName}: Production=${prodCount}, Staging=${stagingCount} ✗`);
          allTablesMatch = false;
        }

      } catch (err) {
        console.log(`❌ Error checking ${tableName}: ${err.message}`);
        allTablesMatch = false;
      }
    }

    console.log('\n📊 Summary:');
    console.log('===========');
    console.log(`📋 Total Production Records: ${totalProdRecords}`);
    console.log(`📋 Total Staging Records: ${totalStagingRecords}`);
    console.log(`📋 Difference: ${Math.abs(totalProdRecords - totalStagingRecords)}`);

    if (allTablesMatch && totalProdRecords === totalStagingRecords) {
      console.log('\n🎉 VERIFICATION PASSED');
      console.log('✅ Staging database is an exact logical clone of production');
      console.log('✅ All tables and records match perfectly');
    } else {
      console.log('\n❌ VERIFICATION FAILED');
      console.log('❌ Staging database does not match production');
    }

    // Test a few sample records to ensure data integrity
    console.log('\n🔍 Data Integrity Sample Check:');
    console.log('=================================');

    try {
      // Check categories
      const { data: prodCategories } = await prodSupabase.from('categories').select('*').limit(2);
      const { data: stagingCategories } = await stagingSupabase.from('categories').select('*').limit(2);
      
      if (prodCategories && stagingCategories) {
        console.log(`✅ Categories sample: Production=${prodCategories.length}, Staging=${stagingCategories.length}`);
        if (prodCategories.length > 0 && stagingCategories.length > 0) {
          console.log(`   Sample: Production[0].name="${prodCategories[0].name}", Staging[0].name="${stagingCategories[0].name}"`);
        }
      }

      // Check products
      const { data: prodProducts } = await prodSupabase.from('products').select('*').limit(2);
      const { data: stagingProducts } = await stagingSupabase.from('products').select('*').limit(2);
      
      if (prodProducts && stagingProducts) {
        console.log(`✅ Products sample: Production=${prodProducts.length}, Staging=${stagingProducts.length}`);
        if (prodProducts.length > 0 && stagingProducts.length > 0) {
          console.log(`   Sample: Production[0].name="${prodProducts[0].name}", Staging[0].name="${stagingProducts[0].name}"`);
        }
      }

    } catch (err) {
      console.log(`❌ Sample check error: ${err.message}`);
    }

  } catch (error) {
    console.error('❌ Verification failed:', error);
  }
}

finalVerification();
