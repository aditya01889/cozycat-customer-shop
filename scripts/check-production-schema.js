#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

console.log('🔍 Checking production database schema...');

// Production configuration
const productionConfig = {
  url: process.env.PRODUCTION_SUPABASE_URL || 'https://xfnbhheapralprcwjvzl.supabase.co',
  serviceKey: process.env.PRODUCTION_SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmbmJoaGVhcHJhbHByY3dqdnpsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODMxNDUwMywiZXhwIjoyMDgzODkwNTAzfQ.uTt3Q-sahXSAbtC5UPAIRenNYJcGPksSIUOiQtwd6H0'
};

const supabase = createClient(productionConfig.url, productionConfig.serviceKey);

async function checkSchema() {
  try {
    console.log(`🔗 Connecting to production database...`);

    // Check categories table structure
    console.log('\n📂 Checking categories table...');
    const { data: categoriesColumns, error: catError } = await supabase
      .rpc('get_table_columns', { table_name: 'categories' });

    if (catError) {
      // Fallback: try to get sample data to infer structure
      const { data: sampleCategories, error: sampleError } = await supabase
        .from('categories')
        .select('*')
        .limit(1);

      if (sampleError) {
        console.error('❌ Cannot access categories table:', sampleError);
        return;
      }

      console.log('✅ Categories columns (from sample data):');
      if (sampleCategories && sampleCategories.length > 0) {
        Object.keys(sampleCategories[0]).forEach(col => {
          console.log(`   - ${col}: ${typeof sampleCategories[0][col]}`);
        });
      }
    } else {
      console.log('✅ Categories columns:');
      categoriesColumns.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'required'})`);
      });
    }

    // Check products table structure
    console.log('\n📦 Checking products table...');
    const { data: productsColumns, error: prodError } = await supabase
      .rpc('get_table_columns', { table_name: 'products' });

    if (prodError) {
      // Fallback: try to get sample data to infer structure
      const { data: sampleProducts, error: sampleError } = await supabase
        .from('products')
        .select('*')
        .limit(1);

      if (sampleError) {
        console.error('❌ Cannot access products table:', sampleError);
        return;
      }

      console.log('✅ Products columns (from sample data):');
      if (sampleProducts && sampleProducts.length > 0) {
        Object.keys(sampleProducts[0]).forEach(col => {
          console.log(`   - ${col}: ${typeof sampleProducts[0][col]}`);
        });
      }
    } else {
      console.log('✅ Products columns:');
      productsColumns.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'required'})`);
      });
    }

    // Check if seed data structure matches
    console.log('\n🔄 Comparing with seed data structure...');
    
    const expectedCategories = [
      'id', 'name', 'slug', 'description', 'image_url', 
      'is_active', 'sort_order', 'created_at', 'updated_at'
    ];

    const expectedProducts = [
      'id', 'name', 'slug', 'category_id', 'price', 'original_price',
      'image_url', 'images', 'nutritional_info', 'ingredients',
      'feeding_guide', 'weight', 'packaging_type', 'is_active',
      'is_featured', 'sort_order', 'stock_quantity', 'sku',
      'created_at', 'updated_at'
    ];

    // Get actual columns from sample data
    const { data: actualCategories } = await supabase
      .from('categories')
      .select('*')
      .limit(1);

    const { data: actualProducts } = await supabase
      .from('products')
      .select('*')
      .limit(1);

    if (actualCategories && actualCategories.length > 0) {
      const actualCatCols = Object.keys(actualCategories[0]);
      const missingCatCols = expectedCategories.filter(col => !actualCatCols.includes(col));
      const extraCatCols = actualCatCols.filter(col => !expectedCategories.includes(col));

      if (missingCatCols.length > 0) {
        console.log('⚠️  Missing categories columns:', missingCatCols);
      }
      if (extraCatCols.length > 0) {
        console.log('ℹ️  Extra categories columns:', extraCatCols);
      }
      if (missingCatCols.length === 0) {
        console.log('✅ Categories schema matches seed data');
      }
    }

    if (actualProducts && actualProducts.length > 0) {
      const actualProdCols = Object.keys(actualProducts[0]);
      const missingProdCols = expectedProducts.filter(col => !actualProdCols.includes(col));
      const extraProdCols = actualProdCols.filter(col => !expectedProducts.includes(col));

      if (missingProdCols.length > 0) {
        console.log('⚠️  Missing products columns:', missingProdCols);
      }
      if (extraProdCols.length > 0) {
        console.log('ℹ️  Extra products columns:', extraProdCols);
      }
      if (missingProdCols.length === 0) {
        console.log('✅ Products schema matches seed data');
      }
    }

    console.log('\n📋 Schema check completed!');
    console.log('\n💡 If there are missing columns, update scripts/seed-database.js');
    console.log('💡 If there are extra columns, you can ignore them or add them to seed data');

  } catch (error) {
    console.error('❌ Schema check failed:', error);
    
    if (error.message.includes('JWT')) {
      console.log('\n💡 You may need to set production environment variables:');
      console.log('   PRODUCTION_SUPABASE_URL');
      console.log('   PRODUCTION_SUPABASE_SERVICE_KEY');
    }
  }
}

checkSchema();
