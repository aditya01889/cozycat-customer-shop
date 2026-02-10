#!/usr/bin/env node

/**
 * Check actual order_items table structure in staging
 */

const { createClient } = require('@supabase/supabase-js');

console.log('🔍 Checking Actual order_items Structure');
console.log('=======================================');

// Staging client
const stagingSupabase = createClient(
  'https://pjckafjhzwegtyhlatus.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqY2thZmpoendlZ3R5aGxhdHVzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTYzMDY3OSwiZXhwIjoyMDg1MjA2Njc5fQ.xEMNIrSYO59toaFNaTvxKxf4wFGrckstm8MEP9OxmvM'
);

async function checkOrderItemsStructure() {
  try {
    console.log('\n📋 Step 1: Try to get all columns from a sample insert');
    console.log('========================================================');
    
    // Try to insert a record with all possible columns to see what's required
    const testRecord = {
      id: '00000000-0000-0000-0000-0000000000001',
      order_id: '82204a2c-34b4-4ca8-b6ac-030e2959eb84',
      product_variant_id: 'b2b4a7d5-2dc9-4c6d-9ba3-78c4a95b6f79',
      quantity: 1,
      unit_price: 29.99,
      total_price: 29.99,
      price: 29.99,  // This might be the actual column name
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('🧪 Testing insert with all possible columns...');
    const { data: insertResult, error: insertError } = await stagingSupabase
      .from('order_items')
      .insert(testRecord)
      .select();
    
    if (insertError) {
      console.log('❌ Insert error:', insertError.message);
      console.log('   Details:', insertError.details);
      console.log('   Hint:', insertError.hint);
      
      // The error mentions "price" column, let's try with that
      console.log('\n🔧 Trying with "price" column instead of "unit_price"...');
      const testRecord2 = {
        id: '00000000-0000-0000-0000-0000000000002',
        order_id: '82204a2c-34b4-4ca8-b6ac-030e2959eb84',
        product_variant_id: 'b2b4a7d5-2dc9-4c6d-9ba3-78c4a95b6f79',
        quantity: 1,
        price: 29.99,  // Use "price" instead of "unit_price"
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: insertResult2, error: insertError2 } = await stagingSupabase
        .from('order_items')
        .insert(testRecord2)
        .select();
      
      if (insertError2) {
        console.log('❌ Still failing with "price":', insertError2.message);
      } else {
        console.log('✅ Success with "price" column!');
        console.log('📊 Inserted record:', insertResult2);
      }
    } else {
      console.log('✅ Insert succeeded!');
      console.log('📊 Inserted record:', insertResult);
    }

    console.log('\n📋 Step 2: Check what columns actually exist');
    console.log('==========================================');
    
    // Try to select all columns to see what's available
    try {
      const { data: selectAll, error: selectAllError } = await stagingSupabase
        .from('order_items')
        .select('*')
        .limit(1);
      
      if (selectAllError) {
        console.log('❌ Select all error:', selectAllError.message);
      } else if (selectAll && selectAll.length > 0) {
        console.log('✅ Available columns in order_items:');
        Object.keys(selectAll[0]).forEach(key => {
          const value = selectAll[0][key];
          console.log(`   - ${key}: ${typeof value} = ${value}`);
        });
      } else {
        console.log('ℹ️ order_items is empty, cannot determine columns');
      }
    } catch (err) {
      console.log('❌ Select all exception:', err.message);
    }

    console.log('\n📋 Step 3: Check production order_items structure');
    console.log('============================================');
    
    // Check what the production table looks like
    const prodSupabase = createClient(
      'https://xfnbhheapralprcwjvzl.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmbmJoaGVhcHJhbHByY3dqdnpsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODMxNDUwMywiZXhwIjoyMDgzODkwNTAzfQ.uTt3Q-sahXSAbtC5UPAIRenNYJcGPksSIUOiQtwd6H0'
    );

    try {
      const { data: prodSelectAll, error: prodSelectAllError } = await prodSupabase
        .from('order_items')
        .select('*')
        .limit(1);
      
      if (prodSelectAllError) {
        console.log('❌ Production select all error:', prodSelectAllError.message);
      } else if (prodSelectAll && prodSelectAll.length > 0) {
        console.log('✅ Production order_items columns:');
        Object.keys(prodSelectAll[0]).forEach(key => {
          const value = prodSelectAll[0][key];
          console.log(`   - ${key}: ${typeof value} = ${value}`);
        });
      } else {
        console.log('ℹ️ Production order_items is also empty');
      }
    } catch (err) {
      console.log('❌ Production select all exception:', err.message);
    }

    console.log('\n📋 Step 4: Create corrected SQL fix');
    console.log('===================================');
    
    console.log('🔧 Based on the error, the correct SQL should be:');
    console.log(`
-- CORRECTED SQL FIX FOR STAGING DATABASE
-- The error suggests "price" column exists, not "unit_price"

-- Fix 1: Add missing columns to order_items
ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS price DECIMAL(10,2);

ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS total_price DECIMAL(10,2);

ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS product_variant_id UUID REFERENCES product_variants(id);

-- Fix 2: Update existing records to set required values
UPDATE order_items 
SET 
    price = COALESCE(price, 0.00),
    total_price = COALESCE(total_price, price, 0.00),
    created_at = COALESCE(created_at, NOW()),
    updated_at = NOW()
WHERE price IS NULL OR total_price IS NULL OR created_at IS NULL;

-- Fix 3: Add sample data (using "price" instead of "unit_price")
INSERT INTO order_items (id, order_id, product_variant_id, quantity, price, total_price, created_at, updated_at)
SELECT 
    gen_random_uuid() as id,
    o.id as order_id,
    pv.id as product_variant_id,
    1 as quantity,
    COALESCE(o.total_amount, 29.99) as price,
    COALESCE(o.total_amount, 29.99) as total_price,
    o.created_at,
    NOW() as updated_at
FROM orders o
CROSS JOIN LATERAL (
    SELECT id FROM product_variants pv 
    WHERE pv.product_id = (SELECT id FROM products ORDER BY RANDOM() LIMIT 1)
    LIMIT 1
) pv
WHERE o.status IN ('pending', 'confirmed', 'processing')
LIMIT 5
ON CONFLICT (id) DO NOTHING;
`);

  } catch (error) {
    console.error('❌ Structure check failed:', error);
  }
}

checkOrderItemsStructure();
