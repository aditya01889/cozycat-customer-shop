#!/usr/bin/env node

/**
 * Debug why inserts are failing silently
 */

const { createClient } = require('@supabase/supabase-js');

console.log('🔍 Debugging Insert Issues');
console.log('================================');

// Staging client
const stagingSupabase = createClient(
  'https://pjckafjhzwegtyhlatus.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqY2thZmpoendlZ3R5aGxhdHVzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTYzMDY3OSwiZXhwIjoyMDg1MjA2Njc5fQ.xEMNIrSYO59toaFNaTvxKxf4wFGrckstm8MEP9OxmvM'
);

async function debugInsertIssues() {
  try {
    console.log('\n📋 Step 1: Test simple insert without batching');
    console.log('==========================================');
    
    // Test a single insert to see if it works
    const testData = {
      id: 'test-123-4567',
      batch_number: 'TEST-BATCH-001',
      product_id: null,  // Use a valid UUID from production
      quantity_produced: 50,
      status: 'testing',
      planned_date: new Date().toISOString(),
      actual_production_date: new Date().toISOString(),
      notes: 'Debug test insert',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      order_id: null,
      created_by: null,
      start_time: null,
      end_time: null,
      priority: 1,
      delivery_created: false,
      batch_type: 'production',
      total_orders: 0,
      total_quantity_produced: 50,
      waste_factor: 0.05,
      total_weight_grams: 250.5
    };

    console.log('🧪 Testing single insert...');
    const { data: insertResult, error: insertError } = await stagingSupabase
      .from('production_batches')
      .insert(testData)
      .select();
    
    if (insertError) {
      console.log('❌ Single insert failed:', insertError.message);
      console.log('   Details:', insertError.details);
      console.log('   Hint:', insertError.hint);
      
      // Try without problematic columns
      console.log('\n🔧 Trying without nullable columns...');
      const simpleData = {
        id: 'test-simple-123',
        batch_number: 'TEST-BATCH-002',
        product_id: null,
        quantity_produced: 25,
        status: 'testing'
      };
      
      const { data: simpleResult, error: simpleError } = await stagingSupabase
        .from('production_batches')
        .insert(simpleData)
        .select();
      
      if (simpleError) {
        console.log('❌ Simple insert also failed:', simpleError.message);
      } else {
        console.log('✅ Simple insert succeeded:', simpleResult);
      }
      
    } else {
      console.log('✅ Single insert succeeded:', insertResult);
      console.log('📊 Inserted record:', insertResult);
    }

    console.log('\n📋 Step 2: Check current production_batches data');
    console.log('==========================================');
    
    // Check what's actually in production_batches
    const { data: prodData, error: prodError } = await stagingSupabase
      .from('production_batches')
      .select('id, batch_number, product_id')
      .limit(5);
    
    if (prodError) {
      console.log('❌ Error checking production data:', prodError.message);
      return;
    }
    
    console.log('📊 Production production_batches data:');
    if (prodData && prodData.length > 0) {
      prodData.forEach((batch, index) => {
        console.log(`   ${index + 1}: ${batch.id} | ${batch.batch_number} | Product: ${batch.product_id}`);
      });
    } else {
      console.log('ℹ️ No production data found');
    }

    console.log('\n📋 Step 3: Test with actual production product_id');
    console.log('=============================================');
    
    if (prodData && prodData.length > 0) {
      // Use actual product_id from production
      const testWithRealProductId = {
        id: 'test-real-123',
        batch_number: 'TEST-BATCH-003',
        product_id: prodData[0].id,  // Use real product_id
        quantity_produced: 30,
        status: 'testing'
      };
      
      console.log('🧪 Testing with real product_id...');
      const { data: realResult, error: realError } = await stagingSupabase
        .from('production_batches')
        .insert(testWithRealProductId)
        .select();
      
      if (realError) {
        console.log('❌ Real product_id insert failed:', realError.message);
      } else {
        console.log('✅ Real product_id insert succeeded:', realResult);
      }
    }

  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

if (require.main === module) {
  debugInsertIssues();
}

module.exports = { debugInsertIssues };
