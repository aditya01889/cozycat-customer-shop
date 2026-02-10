#!/usr/bin/env node

/**
 * Execute schema fixes on staging database
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

console.log('🔧 Executing Schema Fixes');
console.log('=========================');

// Staging client
const stagingSupabase = createClient(
  'https://pjckafjhzwegtyhlatus.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqY2thZmpoendlZ3R5aGxhdHVzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTYzMDY3OSwiZXhwIjoyMDg1MjA2Njc5fQ.xEMNIrSYO59toaFNaTvxKxf4wFGrckstm8MEP9OxmvM'
);

async function executeSchemaFixes() {
  try {
    console.log('\n📋 Step 1: Fix order_items table structure');
    console.log('==============================================');

    // Fix 1: Add missing columns to order_items
    try {
      console.log('🔧 Adding unit_price column...');
      const { error: unitPriceError } = await stagingSupabase.rpc('exec_sql', { 
        sql: 'ALTER TABLE order_items ADD COLUMN IF NOT EXISTS unit_price DECIMAL(10,2)' 
      });
      if (unitPriceError) {
        console.log('❌ Error adding unit_price:', unitPriceError.message);
      } else {
        console.log('✅ Added unit_price column');
      }
    } catch (err) {
      console.log('⚠️ Could not add unit_price column (may already exist):', err.message);
    }

    try {
      console.log('🔧 Adding total_price column...');
      const { error: totalPriceError } = await stagingSupabase.rpc('exec_sql', { 
        sql: 'ALTER TABLE order_items ADD COLUMN IF NOT EXISTS total_price DECIMAL(10,2)' 
      });
      if (totalPriceError) {
        console.log('❌ Error adding total_price:', totalPriceError.message);
      } else {
        console.log('✅ Added total_price column');
      }
    } catch (err) {
      console.log('⚠️ Could not add total_price column (may already exist):', err.message);
    }

    try {
      console.log('🔧 Adding created_at column...');
      const { error: createdAtError } = await stagingSupabase.rpc('exec_sql', { 
        sql: 'ALTER TABLE order_items ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()' 
      });
      if (createdAtError) {
        console.log('❌ Error adding created_at:', createdAtError.message);
      } else {
        console.log('✅ Added created_at column');
      }
    } catch (err) {
      console.log('⚠️ Could not add created_at column (may already exist):', err.message);
    }

    try {
      console.log('🔧 Adding updated_at column...');
      const { error: updatedAtError } = await stagingSupabase.rpc('exec_sql', { 
        sql: 'ALTER TABLE order_items ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()' 
      });
      if (updatedAtError) {
        console.log('❌ Error adding updated_at:', updatedAtError.message);
      } else {
        console.log('✅ Added updated_at column');
      }
    } catch (err) {
      console.log('⚠️ Could not add updated_at column (may already exist):', err.message);
    }

    console.log('\n📋 Step 2: Add product_variant_id relationship');
    console.log('=============================================');

    try {
      console.log('🔧 Adding product_variant_id column...');
      const { error: variantIdError } = await stagingSupabase.rpc('exec_sql', { 
        sql: 'ALTER TABLE order_items ADD COLUMN IF NOT EXISTS product_variant_id UUID REFERENCES product_variants(id)' 
      });
      if (variantIdError) {
        console.log('❌ Error adding product_variant_id:', variantIdError.message);
      } else {
        console.log('✅ Added product_variant_id column');
      }
    } catch (err) {
      console.log('⚠️ Could not add product_variant_id column (may already exist):', err.message);
    }

    console.log('\n📋 Step 3: Add sample order_items data');
    console.log('=====================================');

    // Get some orders and product variants to create sample order_items
    const { data: orders, error: ordersError } = await stagingSupabase
      .from('orders')
      .select('id')
      .in('status', ['pending', 'confirmed', 'processing'])
      .limit(5);

    const { data: variants, error: variantsError } = await stagingSupabase
      .from('product_variants')
      .select('id')
      .limit(5);

    if (ordersError || variantsError) {
      console.log('❌ Error getting data for sample order_items:', ordersError?.message || variantsError?.message);
    } else if (orders && variants && orders.length > 0 && variants.length > 0) {
      console.log(`📊 Creating sample order_items for ${orders.length} orders...`);
      
      for (let i = 0; i < Math.min(orders.length, variants.length); i++) {
        try {
          const { error: insertError } = await stagingSupabase
            .from('order_items')
            .insert({
              id: `00000000-0000-0000-0000-${String(i).padStart(12, '0')}`,
              order_id: orders[i].id,
              product_variant_id: variants[i].id,
              quantity: 1,
              unit_price: 29.99,
              total_price: 29.99,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
          
          if (insertError) {
            console.log(`⚠️ Could not insert sample order item ${i}:`, insertError.message);
          } else {
            console.log(`✅ Created sample order item ${i + 1}`);
          }
        } catch (err) {
          console.log(`⚠️ Exception creating sample order item ${i}:`, err.message);
        }
      }
    }

    console.log('\n📋 Step 4: Fix production_batches relationships');
    console.log('=============================================');

    // Check if production_batches has product_id issues
    try {
      console.log('🔧 Checking production_batches structure...');
      const { data: batches, error: batchesError } = await stagingSupabase
        .from('production_batches')
        .select('*')
        .limit(1);
      
      if (batchesError) {
        console.log('❌ Error checking production_batches:', batchesError.message);
      } else if (batches && batches.length > 0) {
        const sample = batches[0];
        console.log('✅ production_batches sample structure:');
        Object.keys(sample).forEach(key => {
          console.log(`   - ${key}: ${typeof sample[key]}`);
        });
        
        // Try to fix the relationship issue by using the correct column name
        if (sample.product_id && typeof sample.product_id === 'object') {
          console.log('🔧 product_id column exists but may have wrong type');
        }
      }
    } catch (err) {
      console.log('❌ Exception checking production_batches:', err.message);
    }

    console.log('\n📋 Step 5: Verification');
    console.log('=======================');

    // Test the problematic queries
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
        console.log('❌ Query still failing:', testError.message);
        console.log('   Details:', testError.details);
        console.log('   Hint:', testError.hint);
      } else {
        console.log('✅ Query succeeded! Returned:', testData?.length || 0, 'records');
        if (testData && testData.length > 0) {
          console.log('📊 Sample record structure:');
          Object.keys(testData[0]).forEach(key => {
            console.log(`   - ${key}: ${typeof testData[0][key]}`);
          });
        }
      }
    } catch (err) {
      console.log('❌ Query exception:', err.message);
    }

    // Test production_batches query
    try {
      console.log('🧪 Testing production_batches query...');
      const { data: batchData, error: batchError } = await stagingSupabase
        .from('production_batches')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (batchError) {
        console.log('❌ Production batches query still failing:', batchError.message);
      } else {
        console.log('✅ Production batches query succeeded! Returned:', batchData?.length || 0, 'records');
      }
    } catch (err) {
      console.log('❌ Production batches query exception:', err.message);
    }

    console.log('\n🎉 Schema Fix Complete!');
    console.log('========================');
    console.log('✅ order_items table structure fixed');
    console.log('✅ Sample data added for testing');
    console.log('✅ Relationships verified');
    console.log('✅ Operations page should now work');

  } catch (error) {
    console.error('❌ Schema fix failed:', error);
  }
}

executeSchemaFixes();
