#!/usr/bin/env node

/**
 * Copy Production Database to Staging
 * Copies production schema and data to staging, then adds staging-specific test data
 */

require('dotenv').config({ path: './customer-shop/.env.staging' });
const { createClient } = require('@supabase/supabase-js');

// Production client (you'll need to provide production credentials temporarily)
const prodSupabase = createClient(
  process.env.PROD_SUPABASE_URL || 'https://xfnbhheapralprcwjvzl.supabase.co',
  process.env.PROD_SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmbmJoaGVhcHJhbHByY3dqdnpsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODMxNDUwMywiZXhwIjoyMDgzODkwNTAzfQ.uTt3Q-sahXSAbtC5UPAIRenNYJcGPksSIUOiQtwd6H0'
);

// Staging client
const stagingSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('🔄 Copying Production Database to Staging...');
console.log('==========================================');

async function copyProductionToStaging() {
  try {
    console.log('📋 Step 1: Getting production schema...');
    
    // Get all tables from production
    const { data: prodTables, error: tablesError } = await prodSupabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_type', 'BASE TABLE');

    if (tablesError) {
      console.log('❌ Error getting production tables:', tablesError);
      console.log('🔧 You may need to manually provide production credentials');
      return;
    }

    console.log(`✅ Found ${prodTables.length} tables in production`);

    console.log('\n📋 Step 2: Copying production data...');
    
    // Copy data for each table
    for (const table of prodTables) {
      const tableName = table.table_name;
      
      // Skip system tables
      if (tableName.startsWith('_') || tableName.includes('schema') || tableName.includes('migration')) {
        continue;
      }

      console.log(`📦 Copying ${tableName}...`);
      
      try {
        // Get all data from production
        const { data: prodData, error: dataError } = await prodSupabase
          .from(tableName)
          .select('*');

        if (dataError) {
          console.log(`⚠️ Could not copy ${tableName}:`, dataError.message);
          continue;
        }

        if (!prodData || prodData.length === 0) {
          console.log(`✅ ${tableName} - no data to copy`);
          continue;
        }

        // Clear staging table
        await stagingSupabase
          .from(tableName)
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000');

        // Insert production data into staging
        const { error: insertError } = await stagingSupabase
          .from(tableName)
          .insert(prodData);

        if (insertError) {
          console.log(`❌ Error inserting ${tableName}:`, insertError.message);
        } else {
          console.log(`✅ Copied ${prodData.length} records to ${tableName}`);
        }

      } catch (err) {
        console.log(`❌ Error copying ${tableName}:`, err.message);
      }
    }

    console.log('\n📋 Step 3: Adding staging-specific test data...');
    await addStagingTestData();

    console.log('\n🎉 Production database copied to staging successfully!');
    console.log('==========================================');

  } catch (error) {
    console.error('❌ Error copying production to staging:', error);
  }
}

async function addStagingTestData() {
  try {
    // Add staging-specific users
    console.log('👥 Adding staging test users...');
    
    const stagingUsers = [
      {
        email: 'staging-test@example.com',
        full_name: 'Staging Test User',
        phone: '+1234567890',
        role: 'customer'
      },
      {
        email: 'staging-admin@example.com',
        full_name: 'Staging Admin User',
        phone: '+1234567891',
        role: 'admin'
      }
    ];

    for (const user of stagingUsers) {
      const { error } = await stagingSupabase
        .from('profiles')
        .upsert(user, { onConflict: 'email' });

      if (error) {
        console.log(`⚠️ User ${user.email} may already exist`);
      } else {
        console.log(`✅ Added staging user: ${user.email}`);
      }
    }

    // Add staging-specific orders
    console.log('📦 Adding staging test orders...');
    
    const stagingOrders = [
      {
        order_number: 'STG-' + Date.now(),
        customer_id: null, // Will be updated with actual user ID
        status: 'pending',
        payment_method: 'razorpay',
        payment_status: 'pending',
        subtotal: 25.99,
        delivery_fee: 5.00,
        total_amount: 30.99,
        delivery_notes: 'Staging test order - please deliver after 6 PM'
      },
      {
        order_number: 'STG-' + (Date.now() + 1),
        customer_id: null,
        status: 'confirmed',
        payment_method: 'razorpay',
        payment_status: 'paid',
        subtotal: 45.99,
        delivery_fee: 5.00,
        total_amount: 50.99,
        delivery_notes: 'Staging test order - office delivery'
      }
    ];

    for (const order of stagingOrders) {
      const { error } = await stagingSupabase
        .from('orders')
        .insert(order);

      if (error) {
        console.log(`⚠️ Order ${order.order_number} may already exist`);
      } else {
        console.log(`✅ Added staging order: ${order.order_number}`);
      }
    }

    // Add staging-specific cart items
    console.log('🛒 Adding staging test cart items...');
    
    const stagingCartItems = [
      {
        customer_id: null, // Will be updated with actual user ID
        product_id: null, // Will be updated with actual product ID
        variant_id: null, // Will be updated with actual variant ID
        quantity: 2
      }
    ];

    for (const cartItem of stagingCartItems) {
      const { error } = await stagingSupabase
        .from('cart_items')
        .insert(cartItem);

      if (error) {
        console.log('⚠️ Cart item may already exist');
      } else {
        console.log('✅ Added staging cart item');
      }
    }

  } catch (error) {
    console.error('❌ Error adding staging test data:', error);
  }
}

// Alternative approach using SQL dump
async function copyUsingSQLDump() {
  console.log('🔧 Alternative: Using SQL dump approach...');
  
  console.log('\n📋 Manual Steps Required:');
  console.log('1. Export production database:');
  console.log('   - Go to Supabase Dashboard > Settings > Database');
  console.log('   - Click "Export" to download SQL dump');
  console.log('');
  console.log('2. Import to staging:');
  console.log('   - Go to staging Supabase Dashboard');
  console.log('   - Click "Import" and upload the SQL dump');
  console.log('');
  console.log('3. Run staging data script:');
  console.log('   node scripts/database/add-staging-test-data.js');
}

// Run the copy process
if (require.main === module) {
  // Check if production credentials are available
  if (!process.env.PROD_SUPABASE_URL || !process.env.PROD_SUPABASE_SERVICE_ROLE_KEY) {
    console.log('🔧 Production credentials not provided');
    console.log('📋 Using SQL dump approach instead...');
    await copyUsingSQLDump();
  } else {
    await copyProductionToStaging();
  }
}

module.exports = { copyProductionToStaging, addStagingTestData, copyUsingSQLDump };
