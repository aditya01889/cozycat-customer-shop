#!/usr/bin/env node

/**
 * Fix schema issues after database sync
 */

const { createClient } = require('@supabase/supabase-js');

console.log('🔧 Fixing Schema Issues');
console.log('=======================');

// Staging client
const stagingSupabase = createClient(
  'https://pjckafjhzwegtyhlatus.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqY2thZmpoendlZ3R5aGxhdHVzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTYzMDY3OSwiZXhwIjoyMDg1MjA2Njc5fQ.xEMNIrSYO59toaFNaTvxKxf4wFGrckstm8MEP9OxmvM'
);

async function fixSchemaIssues() {
  try {
    console.log('\n📋 Step 1: Check order_items table structure');
    console.log('=============================================');
    
    // Get sample data from order_items to see actual columns
    const { data: orderItemsSample, error: orderItemsError } = await stagingSupabase
      .from('order_items')
      .select('*')
      .limit(1);
    
    if (orderItemsError) {
      console.log('❌ Error getting order_items sample:', orderItemsError.message);
    } else if (orderItemsSample && orderItemsSample.length > 0) {
      console.log('✅ order_items columns found:');
      Object.keys(orderItemsSample[0]).forEach(key => {
        console.log(`   - ${key}: ${typeof orderItemsSample[0][key]}`);
      });
    } else {
      console.log('ℹ️ order_items table is empty');
    }

    console.log('\n📋 Step 2: Check production table structure');
    console.log('==========================================');
    
    // Get sample data from production to compare
    const prodSupabase = createClient(
      'https://xfnbhheapralprcwjvzl.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmbmJoaGVhcHJhbHByY3dqdnpsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODMxNDUwMywiZXhwIjoyMDgzODkwNTAzfQ.uTt3Q-sahXSAbtC5UPAIRenNYJcGPksSIUOiQtwd6H0'
    );

    const { data: prodOrderItemsSample, error: prodOrderItemsError } = await prodSupabase
      .from('order_items')
      .select('*')
      .limit(1);
    
    if (prodOrderItemsError) {
      console.log('❌ Error getting production order_items sample:', prodOrderItemsError.message);
    } else if (prodOrderItemsSample && prodOrderItemsSample.length > 0) {
      console.log('✅ Production order_items columns:');
      Object.keys(prodOrderItemsSample[0]).forEach(key => {
        console.log(`   - ${key}: ${typeof prodOrderItemsSample[0][key]}`);
      });
    } else {
      console.log('ℹ️ Production order_items table is empty');
    }

    console.log('\n📋 Step 3: Check if production_batches exists');
    console.log('==========================================');
    
    // Check if production_batches exists in staging
    const { data: prodBatchesSample, error: prodBatchesError } = await stagingSupabase
      .from('production_batches')
      .select('*')
      .limit(1);
    
    if (prodBatchesError) {
      console.log('❌ production_batches not found in staging:', prodBatchesError.message);
    } else {
      console.log('✅ production_batches exists in staging');
      if (prodBatchesSample && prodBatchesSample.length > 0) {
        console.log('✅ production_batches columns:');
        Object.keys(prodBatchesSample[0]).forEach(key => {
          console.log(`   - ${key}: ${typeof prodBatchesSample[0][key]}`);
        });
      }
    }

    // Check if production_batches exists in production
    const { data: prodProdBatchesSample, error: prodProdBatchesError } = await prodSupabase
      .from('production_batches')
      .select('*')
      .limit(1);
    
    if (prodProdBatchesError) {
      console.log('❌ production_batches not found in production:', prodProdBatchesError.message);
    } else {
      console.log('✅ production_batches exists in production');
    }

    console.log('\n📋 Step 4: Check missing tables');
    console.log('=================================');
    
    // List of tables that should exist based on the errors
    const expectedTables = [
      'categories',
      'products',
      'product_variants', 
      'product_recipes',
      'profiles',
      'orders',
      'order_items',
      'customer_addresses',
      'delivery_partners',
      'production_batches'
    ];

    for (const tableName of expectedTables) {
      try {
        const { data: sample, error: tableError } = await stagingSupabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (tableError) {
          console.log(`❌ ${tableName}: ${tableError.message}`);
        } else {
          const count = sample ? sample.length : 0;
          console.log(`✅ ${tableName}: exists (${count} sample records)`);
        }
      } catch (err) {
        console.log(`❌ ${tableName}: ${err.message}`);
      }
    }

    console.log('\n📋 Step 5: Fix missing production_batches table');
    console.log('============================================');
    
    if (prodBatchesError && prodProdBatchesSample && prodProdBatchesSample.length > 0) {
      console.log('🔧 Creating production_batches table in staging...');
      
      // Get production_batches structure from production
      const { data: prodBatchesData, error: prodBatchesDataError } = await prodSupabase
        .from('production_batches')
        .select('*');
      
      if (prodBatchesDataError) {
        console.log('❌ Error getting production_batches data:', prodBatchesDataError.message);
      } else if (prodBatchesData && prodBatchesData.length > 0) {
        console.log(`📊 Found ${prodBatchesData.length} production_batches records in production`);
        
        // Create production_batches table by copying structure and data
        // Since we can't create tables directly, we'll need to use SQL
        console.log('⚠️ Manual SQL required to create production_batches table');
        console.log('📋 SQL to create table:');
        console.log('-- Create production_batches table');
        console.log('CREATE TABLE IF NOT EXISTS production_batches (');
        if (prodBatchesData.length > 0) {
          const sample = prodBatchesData[0];
          Object.keys(sample).forEach((key, index) => {
            const comma = index < Object.keys(sample).length - 1 ? ',' : '';
            console.log(`  ${key} TEXT${comma}`);
          });
        }
        console.log(');');
        console.log('');
        console.log('-- Copy data from production');
        console.log('-- (This would need to be done separately)');
      }
    }

  } catch (error) {
    console.error('❌ Schema fix failed:', error);
  }
}

fixSchemaIssues();
