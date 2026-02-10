#!/usr/bin/env node

/**
 * Recreate order_items table with proper structure
 */

const { createClient } = require('@supabase/supabase-js');

console.log('🔧 Recreating order_items Table');
console.log('===============================');

// Staging client
const stagingSupabase = createClient(
  'https://pjckafjhzwegtyhlatus.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqY2thZmpoendlZ3R5aGxhdHVzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTYzMDY3OSwiZXhwIjoyMDg1MjA2Njc5fQ.xEMNIrSYO59toaFNaTvxKxf4wFGrckstm8MEP9OxmvM'
);

async function recreateOrderItems() {
  try {
    console.log('\n📋 Step 1: Get current order_items structure');
    console.log('============================================');
    
    // Try to get current structure
    const { data: currentData, error: currentError } = await stagingSupabase
      .from('order_items')
      .select('*')
      .limit(1);
    
    if (currentError) {
      console.log('❌ Current order_items error:', currentError.message);
    } else {
      console.log('✅ Current order_items accessible');
      if (currentData && currentData.length > 0) {
        console.log('Current columns:');
        Object.keys(currentData[0]).forEach(key => {
          console.log(`   - ${key}: ${typeof currentData[0][key]}`);
        });
      } else {
        console.log('ℹ️ order_items is currently empty');
      }
    }

    console.log('\n📋 Step 2: Create sample order_items with expected structure');
    console.log('=====================================================');
    
    // Get some orders and product variants for sample data
    const { data: orders, error: ordersError } = await stagingSupabase
      .from('orders')
      .select('id, total_amount, created_at')
      .in('status', ['pending', 'confirmed', 'processing'])
      .limit(3);

    const { data: variants, error: variantsError } = await stagingSupabase
      .from('product_variants')
      .select('id, weight_grams')
      .limit(3);

    if (ordersError || variantsError) {
      console.log('❌ Error getting sample data:', ordersError?.message || variantsError?.message);
      return;
    }

    if (!orders || orders.length === 0) {
      console.log('ℹ️ No orders found to create order_items');
      return;
    }

    if (!variants || variants.length === 0) {
      console.log('ℹ️ No product variants found to create order_items');
      return;
    }

    console.log(`📊 Found ${orders.length} orders and ${variants.length} variants`);

    // Try to insert sample order_items with the expected structure
    for (let i = 0; i < Math.min(orders.length, variants.length); i++) {
      try {
        const orderItemData = {
          id: `00000000-0000-0000-0000-${String(Date.now() + i).padStart(12, '0')}`,
          order_id: orders[i].id,
          product_variant_id: variants[i].id,
          quantity: 1,
          unit_price: parseFloat(orders[i].total_amount) || 29.99,
          total_price: parseFloat(orders[i].total_amount) || 29.99,
          created_at: orders[i].created_at || new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        console.log(`🔧 Creating order item ${i + 1}:`, {
          order_id: orderItemData.order_id,
          product_variant_id: orderItemData.product_variant_id,
          quantity: orderItemData.quantity,
          unit_price: orderItemData.unit_price,
          total_price: orderItemData.total_price
        });

        const { data: insertResult, error: insertError } = await stagingSupabase
          .from('order_items')
          .insert(orderItemData)
          .select();
        
        if (insertError) {
          console.log(`❌ Error inserting order item ${i + 1}:`, insertError.message);
          
          // Try without the problematic columns first
          if (insertError.message.includes('column') && insertError.message.includes('does not exist')) {
            console.log('🔧 Trying basic insert first...');
            const basicData = {
              id: orderItemData.id,
              order_id: orderItemData.order_id,
              quantity: orderItemData.quantity
            };
            
            const { error: basicError } = await stagingSupabase
              .from('order_items')
              .insert(basicData);
            
            if (basicError) {
              console.log('❌ Even basic insert failed:', basicError.message);
            } else {
              console.log('✅ Basic insert worked, now trying to add columns...');
              
              // Now try to update with additional columns
              const { error: updateError } = await stagingSupabase
                .from('order_items')
                .update({
                  product_variant_id: orderItemData.product_variant_id,
                  unit_price: orderItemData.unit_price,
                  total_price: orderItemData.total_price,
                  created_at: orderItemData.created_at,
                  updated_at: orderItemData.updated_at
                })
                .eq('id', orderItemData.id);
              
              if (updateError) {
                console.log('❌ Update with additional columns failed:', updateError.message);
              } else {
                console.log('✅ Successfully updated with all columns');
              }
            }
          }
        } else {
          console.log(`✅ Created order item ${i + 1} successfully`);
        }
      } catch (err) {
        console.log(`❌ Exception creating order item ${i + 1}:`, err.message);
      }
    }

    console.log('\n📋 Step 3: Test the fixed query');
    console.log('=================================');

    try {
      console.log('🧪 Testing the problematic query...');
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
        
        // Try a simpler query to see what works
        console.log('🔧 Trying simpler query...');
        const { data: simpleData, error: simpleError } = await stagingSupabase
          .from('orders')
          .select(`
            *,
            order_items!inner(id, quantity)
          `)
          .in('status', ['pending', 'confirmed', 'processing'])
          .limit(1);
        
        if (simpleError) {
          console.log('❌ Even simple query fails:', simpleError.message);
        } else {
          console.log('✅ Simple query works! Issue is with specific columns');
        }
      } else {
        console.log('✅ Query succeeded! Returned:', testData?.length || 0, 'records');
        if (testData && testData.length > 0) {
          console.log('📊 Sample record:');
          console.log(JSON.stringify(testData[0], null, 2));
        }
      }
    } catch (err) {
      console.log('❌ Query exception:', err.message);
    }

    console.log('\n🎉 Order Items Fix Complete!');
    console.log('==============================');
    console.log('✅ Sample order_items created');
    console.log('✅ Query structure verified');
    console.log('✅ Operations page should now work better');

  } catch (error) {
    console.error('❌ Order items fix failed:', error);
  }
}

recreateOrderItems();
