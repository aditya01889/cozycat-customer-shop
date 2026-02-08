#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Production Supabase credentials
const SUPABASE_URL = 'https://xfnbhheapralprcwjvzl.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmbmJoaGVhcHJhbHByY3dqdnpsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODMxNDUwMywiZXhwIjoyMDgzODkwNTAzfQ.uTt3Q-sahXSAbtC5UPAIRenNYJcGPksSIUOiQtwd6H0';

console.log('🔍 Exploring Supabase database structure...');

async function exploreDatabase() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  
  try {
    console.log('\n📋 1. Check all tables in database:');
    
    // Get all tables (this might not work directly, but let's try)
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    if (tablesError) {
      console.log('❌ Cannot access information_schema directly');
      console.log('🔍 Trying common table names...');
    } else {
      console.log('✅ Tables found:', tables);
    }
    
    console.log('\n📊 2. Check common tables:');
    
    // Check products table structure and data
    console.log('\n🔍 Products table:');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .limit(3);
    
    if (productsError) {
      console.error('❌ Products table error:', productsError);
    } else {
      console.log('✅ Products table exists');
      console.log('Columns:', Object.keys(products[0] || {}));
      console.log('Sample data:', products[0]);
    }
    
    // Check categories table
    console.log('\n🔍 Categories table:');
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*');
    
    if (categoriesError) {
      console.error('❌ Categories table error:', categoriesError);
    } else {
      console.log('✅ Categories table exists');
      console.log('Columns:', Object.keys(categories[0] || {}));
      console.log('Categories:', categories);
    }
    
    // Check product_variants table structure
    console.log('\n🔍 Product variants table:');
    const { data: variants, error: variantsError } = await supabase
      .from('product_variants')
      .select('*')
      .limit(1);
    
    if (variantsError) {
      console.error('❌ Product variants table error:', variantsError);
    } else {
      console.log('✅ Product variants table exists');
      if (variants && variants.length > 0) {
        console.log('Columns:', Object.keys(variants[0]));
        console.log('Sample variant:', variants[0]);
      } else {
        console.log('No variants found (empty table)');
      }
    }
    
    // Check for backup tables
    console.log('\n🔍 Checking for backup tables:');
    const possibleBackupTables = [
      'product_variants_backup',
      'product_variants_old',
      'products_backup',
      'variants_backup',
      'backup_product_variants'
    ];
    
    for (const tableName of possibleBackupTables) {
      try {
        const { data: backupData, error: backupError } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (!backupError && backupData) {
          console.log(`✅ Found backup table: ${tableName}`);
          console.log(`   Sample data:`, backupData[0]);
          console.log(`   Total records: ${backupData.length}`);
        }
      } catch (e) {
        // Table doesn't exist, continue
      }
    }
    
    // Check if there are any other related tables
    console.log('\n🔍 Checking for other product-related tables:');
    const otherTables = [
      'variants',
      'product_options',
      'product_attributes',
      'inventory',
      'stock'
    ];
    
    for (const tableName of otherTables) {
      try {
        const { data: tableData, error: tableError } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (!tableError && tableData) {
          console.log(`✅ Found table: ${tableName}`);
          console.log(`   Columns:`, Object.keys(tableData[0] || {}));
        }
      } catch (e) {
        // Table doesn't exist, continue
      }
    }
    
    // Check products with their full details to understand structure
    console.log('\n📦 3. Full product analysis:');
    const { data: fullProducts, error: fullProductsError } = await supabase
      .from('products')
      .select(`
        *,
        categories (*)
      `)
      .limit(5);
    
    if (fullProductsError) {
      console.error('❌ Full products error:', fullProductsError);
    } else {
      console.log('✅ Products with categories:');
      fullProducts.forEach((product, index) => {
        console.log(`\n${index + 1}. ${product.name}`);
        console.log(`   Category: ${product.categories?.name || 'No category'}`);
        console.log(`   Description: ${product.description?.substring(0, 100)}...`);
        console.log(`   Packaging: ${product.packaging_type}`);
        console.log(`   Label: ${product.label_type}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Exploration error:', error.message);
  }
}

exploreDatabase();
