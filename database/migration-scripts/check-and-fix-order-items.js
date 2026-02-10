#!/usr/bin/env node

/**
 * Check and fix order_items table structure
 */

const { createClient } = require('@supabase/supabase-js');

console.log('🔧 Checking and Fixing order_items Table');
console.log('=======================================');

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

async function checkAndFixOrderItems() {
  try {
    console.log('\n📋 Step 1: Check if order_items should exist');
    console.log('==========================================');
    
    // Check if there are any orders that should have order_items
    const { data: ordersWithItems, error: ordersError } = await prodSupabase
      .from('orders')
      .select('id, status')
      .limit(5);
    
    if (ordersError) {
      console.log('❌ Error getting orders:', ordersError.message);
    } else {
      console.log(`✅ Found ${ordersWithItems.length} orders in production:`);
      ordersWithItems.forEach(order => {
        console.log(`   - Order ${order.id}: ${order.status}`);
      });
    }

    console.log('\n📋 Step 2: Check order_items in production using RPC');
    console.log('==================================================');
    
    // Try to get order_items structure using a different approach
    try {
      const { data: orderItemsData, error: orderItemsError } = await prodSupabase
        .rpc('get_table_structure', { table_name: 'order_items' });
      
      if (orderItemsError) {
        console.log('❌ RPC not available:', orderItemsError.message);
      } else {
        console.log('✅ order_items structure from RPC:', orderItemsData);
      }
    } catch (err) {
      console.log('❌ RPC approach failed:', err.message);
    }

    console.log('\n📋 Step 3: Check what columns the frontend expects');
    console.log('=================================================');
    
    // The error shows the query is trying to access:
    // - order_items.id
    // - order_items.quantity  
    // - order_items.unit_price (MISSING)
    // - order_items.total_price (MISSING)
    // - order_items.created_at (MISSING)
    // - order_items.product_variants!inner relationship
    
    console.log('Frontend expects these columns in order_items:');
    console.log('   - id');
    console.log('   - quantity');
    console.log('   - unit_price (MISSING)');
    console.log('   - total_price (MISSING)');
    console.log('   - created_at (MISSING)');
    console.log('   - product_variant_id (for relationship)');

    console.log('\n📋 Step 4: Check if we need to create order_items table');
    console.log('====================================================');
    
    // Check if there's a migration or schema file that defines order_items
    console.log('🔍 Checking for order_items definition...');
    
    // Try to create a basic order_items table with expected structure
    console.log('🔧 Suggesting order_items table structure:');
    console.log(`
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_variant_id ON order_items(product_variant_id);
`);

    console.log('\n📋 Step 5: Check production_batches table structure');
    console.log('================================================');
    
    // Check production_batches structure
    const { data: prodBatchesData, error: prodBatchesError } = await prodSupabase
      .from('production_batches')
      .select('*')
      .limit(1);
    
    if (prodBatchesError) {
      console.log('❌ Error getting production_batches:', prodBatchesError.message);
    } else if (prodBatchesData && prodBatchesData.length > 0) {
      console.log('✅ production_batches structure:');
      Object.keys(prodBatchesData[0]).forEach(key => {
        console.log(`   - ${key}: ${typeof prodBatchesData[0][key]}`);
      });
    }

    // Check staging production_batches
    const { data: stagingBatchesData, error: stagingBatchesError } = await stagingSupabase
      .from('production_batches')
      .select('*')
      .limit(1);
    
    if (stagingBatchesError) {
      console.log('❌ Error getting staging production_batches:', stagingBatchesError.message);
    } else if (stagingBatchesData && stagingBatchesData.length > 0) {
      console.log('✅ staging production_batches structure:');
      Object.keys(stagingBatchesData[0]).forEach(key => {
        console.log(`   - ${key}: ${typeof stagingBatchesData[0][key]}`);
      });
      
      // Check if product_id column exists
      const hasProductId = stagingBatchesData[0].hasOwnProperty('product_id');
      console.log(`   - has product_id: ${hasProductId}`);
      
      if (!hasProductId) {
        console.log('❌ production_batches missing product_id column for relationship');
      }
    }

    console.log('\n📋 Step 6: Create SQL fix script');
    console.log('=================================');
    
    console.log('🔧 SQL fixes needed:');
    console.log(`
-- Fix 1: Add missing columns to order_items if they don't exist
ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS unit_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS total_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Fix 2: Ensure product_variant_id exists for relationship
ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS product_variant_id UUID REFERENCES product_variants(id);

-- Fix 3: Add product_id to production_batches if it doesn't exist
ALTER TABLE production_batches 
ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES products(id);

-- Fix 4: Create missing indexes
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_variant_id ON order_items(product_variant_id);
CREATE INDEX IF NOT EXISTS idx_production_batches_product_id ON production_batches(product_id);
`);

  } catch (error) {
    console.error('❌ Check failed:', error);
  }
}

checkAndFixOrderItems();
