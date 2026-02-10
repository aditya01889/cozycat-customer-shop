#!/usr/bin/env node

/**
 * Check schema issues after database sync
 */

const { createClient } = require('@supabase/supabase-js');

console.log('🔍 Checking Schema Issues After Sync');
console.log('===================================');

// Staging client
const stagingSupabase = createClient(
  'https://pjckafjhzwegtyhlatus.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqY2thZmpoendlZ3R5aGxhdHVzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTYzMDY3OSwiZXhwIjoyMDg1MjA2Njc5fQ.xEMNIrSYO59toaFNaTvxKxf4wFGrckstm8MEP9OxmvM'
);

async function checkSchemaIssues() {
  try {
    console.log('\n📋 Step 1: Check order_items table structure');
    console.log('=============================================');
    
    // Check order_items columns
    const { data: orderItemsColumns, error: columnsError } = await stagingSupabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_schema', 'public')
      .eq('table_name', 'order_items')
      .order('ordinal_position');
    
    if (columnsError) {
      console.log('❌ Error getting order_items columns:', columnsError.message);
    } else {
      console.log('✅ order_items columns:');
      orderItemsColumns.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type}`);
      });
    }

    console.log('\n📋 Step 2: Check production_batches table');
    console.log('====================================');
    
    // Check if production_batches exists
    const { data: prodBatchesColumns, error: prodBatchesError } = await stagingSupabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_schema', 'public')
      .eq('table_name', 'production_batches')
      .order('ordinal_position');
    
    if (prodBatchesError) {
      console.log('❌ production_batches table not found or error:', prodBatchesError.message);
    } else {
      console.log('✅ production_batches columns:');
      prodBatchesColumns.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type}`);
      });
    }

    console.log('\n📋 Step 3: Check all tables in staging');
    console.log('===================================');
    
    // Get all tables
    const { data: allTables, error: tablesError } = await stagingSupabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_type', 'BASE TABLE')
      .order('table_name');
    
    if (tablesError) {
      console.log('❌ Error getting tables:', tablesError.message);
    } else {
      console.log(`✅ Found ${allTables.length} tables:`);
      allTables.forEach(table => {
        console.log(`   - ${table.table_name}`);
      });
    }

    console.log('\n📋 Step 4: Check foreign key relationships');
    console.log('=======================================');
    
    // Check foreign key constraints
    const { data: foreignKeys, error: fkError } = await stagingSupabase
      .from('information_schema.table_constraints')
      .select(`
        table_name,
        constraint_name,
        constraint_type
      `)
      .eq('table_schema', 'public')
      .eq('constraint_type', 'FOREIGN KEY')
      .order('table_name');
    
    if (fkError) {
      console.log('❌ Error getting foreign keys:', fkError.message);
    } else {
      console.log(`✅ Found ${foreignKeys.length} foreign key constraints:`);
      foreignKeys.forEach(fk => {
        console.log(`   - ${fk.table_name}: ${fk.constraint_name}`);
      });
    }

    console.log('\n📋 Step 5: Test problematic queries');
    console.log('=================================');
    
    // Test the query that's failing
    try {
      console.log('🧪 Testing order_items query...');
      const { data: testData, error: testError } = await stagingSupabase
        .from('orders')
        .select(`
          *,
          order_items!inner(
            id,
            quantity,
            unit_price,
            total_price,
            created_at,
            product_variants!inner(
              id,
              weight_grams,
              products!inner(name)
            )
          )
        `)
        .in('status', ['pending', 'confirmed', 'processing'])
        .order('created_at', { ascending: true })
        .limit(1);
      
      if (testError) {
        console.log('❌ Query failed:', testError.message);
        console.log('   Details:', testError.details);
        console.log('   Hint:', testError.hint);
      } else {
        console.log('✅ Query succeeded, returned:', testData?.length || 0, 'records');
      }
    } catch (err) {
      console.log('❌ Query exception:', err.message);
    }

    // Test production_batches query
    try {
      console.log('🧪 Testing production_batches query...');
      const { data: batchData, error: batchError } = await stagingSupabase
        .from('production_batches')
        .select('*, products:product_id(name)')
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (batchError) {
        console.log('❌ Batch query failed:', batchError.message);
        console.log('   Details:', batchError.details);
        console.log('   Hint:', batchError.hint);
      } else {
        console.log('✅ Batch query succeeded, returned:', batchData?.length || 0, 'records');
      }
    } catch (err) {
      console.log('❌ Batch query exception:', err.message);
    }

  } catch (error) {
    console.error('❌ Schema check failed:', error);
  }
}

checkSchemaIssues();
