#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const environment = process.argv[2] || 'staging';

console.log(`🧪 Testing database connectivity for ${environment}...`);

// Environment configurations
const configs = {
  staging: {
    url: process.env.STAGING_SUPABASE_URL || 'https://pjckafjhzwegtyhlatus.supabase.co',
    serviceKey: process.env.STAGING_SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqY2thZmpoendlZ3R5aGxhdHVzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTYzMDY3OSwiZXhwIjoyMDg1MjA2Njc5fQ.xEMNIrSYO59toaFNaTvxKxf4wFGrckstm8MEP9OxmvM'
  }
};

const config = configs[environment];
if (!config) {
  console.error(`❌ Unknown environment: ${environment}`);
  process.exit(1);
}

const supabase = createClient(config.url, config.serviceKey);

async function testDatabase() {
  try {
    console.log(`🔗 Connecting to ${environment} database...`);

    // Test basic connection
    const { data, error } = await supabase
      .from('categories')
      .select('count')
      .limit(1);

    if (error) {
      console.error('❌ Database connection failed:', error);
      throw error;
    }

    console.log('✅ Database connection successful');

    // Test categories table
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('id, name, slug')
      .limit(5);

    if (catError) {
      console.error('❌ Categories query failed:', catError);
      throw catError;
    }

    console.log(`✅ Categories table accessible (${categories.length} records)`);

    // Test products table
    const { data: products, error: prodError } = await supabase
      .from('products')
      .select('id, name, slug, price')
      .limit(5);

    if (prodError) {
      console.error('❌ Products query failed:', prodError);
      throw prodError;
    }

    console.log(`✅ Products table accessible (${products.length} records)`);

    // Test relationships
    if (categories.length > 0 && products.length > 0) {
      const { data: productsWithCategory, error: relError } = await supabase
        .from('products')
        .select(`
          id,
          name,
          categories (
            id,
            name
          )
        `)
        .limit(3);

      if (relError) {
        console.error('❌ Relationship query failed:', relError);
        throw relError;
      }

      console.log(`✅ Product-category relationships working`);
    }

    // Test basic CRUD operations
    const testCategory = {
      name: 'Test Category',
      slug: `test-${Date.now()}`,
      description: 'Test category for CI/CD',
      is_active: false
    };

    const { data: insertedCat, error: insertError } = await supabase
      .from('categories')
      .insert(testCategory)
      .select()
      .single();

    if (insertError) {
      console.error('❌ Insert operation failed:', insertError);
      throw insertError;
    }

    console.log('✅ Insert operation successful');

    // Clean up test data
    const { error: deleteError } = await supabase
      .from('categories')
      .delete()
      .eq('id', insertedCat.id);

    if (deleteError) {
      console.error('❌ Delete operation failed:', deleteError);
      throw deleteError;
    }

    console.log('✅ Delete operation successful');

    console.log(`🎉 All database tests passed for ${environment}!`);

    // Summary
    console.log(`📊 Test Summary:`);
    console.log(`   Connection: ✅`);
    console.log(`   Categories: ✅ (${categories.length} records)`);
    console.log(`   Products: ✅ (${products.length} records)`);
    console.log(`   Relationships: ✅`);
    console.log(`   CRUD Operations: ✅`);

  } catch (error) {
    console.error(`❌ Database tests failed for ${environment}:`, error);
    process.exit(1);
  }
}

testDatabase();
