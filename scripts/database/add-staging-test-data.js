#!/usr/bin/env node

/**
 * Add Staging-Specific Test Data
 * Adds additional test data to staging environment
 */

require('dotenv').config({ path: './customer-shop/.env.staging' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('🎯 Adding Staging-Specific Test Data...');
console.log('====================================');

async function addStagingTestData() {
  try {
    // 1. Add staging-specific users
    console.log('👥 Adding staging test users...');
    
    const stagingUsers = [
      {
        email: 'staging-user@example.com',
        full_name: 'Staging Test User',
        phone: '+1234567890',
        role: 'customer'
      },
      {
        email: 'staging-admin@example.com',
        full_name: 'Staging Admin User',
        phone: '+1234567891',
        role: 'admin'
      },
      {
        email: 'demo@cozycatkitchen.com',
        full_name: 'Demo Customer',
        phone: '+1234567892',
        role: 'customer'
      }
    ];

    for (const user of stagingUsers) {
      const { data, error } = await supabase
        .from('profiles')
        .upsert(user, { onConflict: 'email' });

      if (error) {
        console.log(`⚠️ User ${user.email}:`, error.message);
      } else {
        console.log(`✅ Added staging user: ${user.email}`);
      }
    }

    // 2. Add staging-specific products
    console.log('\n📦 Adding staging test products...');
    
    // Get existing categories
    const { data: categories } = await supabase
      .from('categories')
      .select('id, name');

    if (!categories || categories.length === 0) {
      console.log('❌ No categories found. Please run schema setup first.');
      return;
    }

    const stagingProducts = [
      {
        name: 'Staging Chocolate Cake',
        slug: 'staging-chocolate-cake',
        description: 'Special staging chocolate cake for testing',
        short_description: 'Staging test cake',
        image_url: 'https://images.unsplash.com/photo-1578985545032-191188e03444?w=400',
        is_active: true,
        display_order: 100,
        category_id: categories[0]?.id,
        packaging_type: 'Box',
        label_type: 'Custom',
        packaging_quantity_per_product: 1,
        label_quantity_per_product: 1
      },
      {
        name: 'Staging Vanilla Cake',
        slug: 'staging-vanilla-cake',
        description: 'Special staging vanilla cake for testing',
        short_description: 'Staging test vanilla cake',
        image_url: 'https://images.unsplash.com/photo-1578985545032-191188e03444?w=400',
        is_active: true,
        display_order: 101,
        category_id: categories[0]?.id,
        packaging_type: 'Box',
        label_type: 'Custom',
        packaging_quantity_per_product: 1,
        label_quantity_per_product: 1
      }
    ];

    for (const product of stagingProducts) {
      const { data, error } = await supabase
        .from('products')
        .upsert(product, { onConflict: 'slug' });

      if (error) {
        console.log(`⚠️ Product ${product.slug}:`, error.message);
      } else {
        console.log(`✅ Added staging product: ${product.name}`);
      }
    }

    // 3. Add product variants for staging products
    console.log('\n⚖️ Adding staging product variants...');
    
    // Get the products we just added
    const { data: addedProducts } = await supabase
      .from('products')
      .select('id, name')
      .ilike('slug', 'staging-%');

    if (addedProducts && addedProducts.length > 0) {
      const stagingVariants = [
        {
          product_id: addedProducts[0].id,
          weight_grams: 500,
          price: 29.99,
          sku: 'STG-CAKE-CHOC-500',
          is_active: true
        },
        {
          product_id: addedProducts[0].id,
          weight_grams: 1000,
          price: 49.99,
          sku: 'STG-CAKE-CHOC-1000',
          is_active: true
        },
        {
          product_id: addedProducts[1]?.id,
          weight_grams: 500,
          price: 26.99,
          sku: 'STG-CAKE-VAN-500',
          is_active: true
        },
        {
          product_id: addedProducts[1]?.id,
          weight_grams: 1000,
          price: 46.99,
          sku: 'STG-CAKE-VAN-1000',
          is_active: true
        }
      ];

      for (const variant of stagingVariants) {
        if (!variant.product_id) continue;
        
        const { error } = await supabase
          .from('product_variants')
          .upsert(variant, { onConflict: 'sku' });

        if (error) {
          console.log(`⚠️ Variant ${variant.sku}:`, error.message);
        } else {
          console.log(`✅ Added staging variant: ${variant.sku}`);
        }
      }
    }

    // 4. Add staging-specific orders
    console.log('\n📦 Adding staging test orders...');
    
    // Get users to assign orders
    const { data: users } = await supabase
      .from('profiles')
      .select('id, email')
      .ilike('email', '%staging%');

    if (users && users.length > 0) {
      const stagingOrders = [
        {
          order_number: 'STG-' + Date.now(),
          customer_id: users[0]?.id,
          status: 'pending',
          payment_method: 'razorpay',
          payment_status: 'pending',
          subtotal: 29.99,
          delivery_fee: 5.00,
          total_amount: 34.99,
          delivery_notes: 'Staging test order - please deliver after 6 PM'
        },
        {
          order_number: 'STG-' + (Date.now() + 1),
          customer_id: users[1]?.id,
          status: 'confirmed',
          payment_method: 'razorpay',
          payment_status: 'paid',
          subtotal: 49.99,
          delivery_fee: 5.00,
          total_amount: 54.99,
          delivery_notes: 'Staging test order - office delivery'
        },
        {
          order_number: 'STG-' + (Date.now() + 2),
          customer_id: users[0]?.id,
          status: 'delivered',
          payment_method: 'razorpay',
          payment_status: 'paid',
          subtotal: 26.99,
          delivery_fee: 5.00,
          total_amount: 31.99,
          delivery_notes: 'Staging delivered test order'
        }
      ];

      for (const order of stagingOrders) {
        if (!order.customer_id) continue;
        
        const { error } = await supabase
          .from('orders')
          .insert(order);

        if (error) {
          console.log(`⚠️ Order ${order.order_number}:`, error.message);
        } else {
          console.log(`✅ Added staging order: ${order.order_number}`);
        }
      }
    }

    // 5. Add cart items for testing
    console.log('\n🛒 Adding staging test cart items...');
    
    if (users && users.length > 0 && addedProducts && addedProducts.length > 0) {
      const stagingCartItems = [
        {
          customer_id: users[0]?.id,
          product_id: addedProducts[0]?.id,
          variant_id: null, // Will be set after variants are created
          quantity: 2
        },
        {
          customer_id: users[0]?.id,
          product_id: addedProducts[1]?.id,
          variant_id: null,
          quantity: 1
        }
      ];

      for (const cartItem of stagingCartItems) {
        if (!cartItem.customer_id || !cartItem.product_id) continue;
        
        const { error } = await supabase
          .from('cart_items')
          .upsert(cartItem, { onConflict: 'customer_id,product_id,variant_id' });

        if (error) {
          console.log(`⚠️ Cart item:`, error.message);
        } else {
          console.log('✅ Added staging cart item');
        }
      }
    }

    console.log('\n🎉 Staging test data added successfully!');
    console.log('====================================');
    
    // Summary
    console.log('\n📊 Summary:');
    console.log(`   - Users: ${stagingUsers.length} added`);
    console.log(`   - Products: ${stagingProducts.length} added`);
    console.log(`   - Variants: ${stagingVariants?.length || 0} added`);
    console.log(`   - Orders: ${stagingOrders?.length || 0} added`);
    console.log(`   - Cart items: ${stagingCartItems?.length || 0} added`);

  } catch (error) {
    console.error('❌ Error adding staging test data:', error);
  }
}

// Run the staging data addition
if (require.main === module) {
  addStagingTestData();
}

module.exports = { addStagingTestData };
