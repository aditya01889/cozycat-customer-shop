#!/usr/bin/env node

/**
 * Verify Staging Database Import
 * Checks if production data was successfully imported to staging
 */

require('dotenv').config({ path: './customer-shop/.env.staging' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('🔍 Verifying Staging Database Import');
console.log('====================================');

async function verifyStagingImport() {
  try {
    console.log('📋 Step 1: Checking table structure...');
    
    // Check if key tables exist
    const keyTables = ['categories', 'products', 'product_variants', 'profiles', 'orders', 'order_items', 'cart_items'];
    
    for (const tableName of keyTables) {
      const { data, error } = await supabase
        .from(tableName)
        .select('count')
        .limit(1);

      if (error) {
        console.log(`❌ Table ${tableName} error:`, error.message);
      } else {
        const count = data?.[0]?.count || 0;
        console.log(`✅ ${tableName}: ${count} records`);
      }
    }

    console.log('\n📊 Step 2: Data summary...');
    
    // Get detailed counts
    const [categories, products, variants, profiles, orders] = await Promise.all([
      supabase.from('categories').select('count').limit(1),
      supabase.from('products').select('count').limit(1),
      supabase.from('product_variants').select('count').limit(1),
      supabase.from('profiles').select('count').limit(1),
      supabase.from('orders').select('count').limit(1)
    ]);

    console.log(`📦 Categories: ${categories.data?.[0]?.count || 0}`);
    console.log(`🛍️ Products: ${products.data?.[0]?.count || 0}`);
    console.log(`⚖️ Variants: ${variants.data?.[0]?.count || 0}`);
    console.log(`👥 Profiles: ${profiles.data?.[0]?.count || 0}`);
    console.log(`📦 Orders: ${orders.data?.[0]?.count || 0}`);

    console.log('\n🎉 Staging database verification complete!');
    
    if (categories.data?.[0]?.count > 0 && products.data?.[0]?.count > 0) {
      console.log('✅ Staging is ready for testing!');
    } else {
      console.log('⚠️ Staging may need production data import');
    }

  } catch (error) {
    console.error('❌ Verification error:', error);
  }
}

if (require.main === module) {
  verifyStagingImport();
}

module.exports = { verifyStagingImport };
