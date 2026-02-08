#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Production Supabase credentials
const SUPABASE_URL = 'https://xfnbhheapralprcwjvzl.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmbmJoaGVhcHJhbHByY3dqdnpsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODMxNDUwMywiZXhwIjoyMDgzODkwNTAzfQ.uTt3Q-sahXSAbtC5UPAIRenNYJcGPksSIUOiQtwd6H0';

console.log('📊 Analyzing all products with their details...');

async function analyzeAllProducts() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  
  try {
    // Get all products with their categories
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select(`
        *,
        categories (*)
      `)
      .eq('is_active', true)
      .order('display_order');
    
    if (productsError) {
      console.error('❌ Products error:', productsError);
      return;
    }
    
    console.log(`\n📦 Found ${products?.length || 0} active products:\n`);
    
    // Group by category
    const productsByCategory = {};
    
    products.forEach(product => {
      const categoryName = product.categories?.name || 'Unknown';
      if (!productsByCategory[categoryName]) {
        productsByCategory[categoryName] = [];
      }
      productsByCategory[categoryName].push(product);
    });
    
    // Display products by category
    Object.keys(productsByCategory).forEach(categoryName => {
      console.log(`\n🏷️  ${categoryName} (${productsByCategory[categoryName].length} products):`);
      console.log('─'.repeat(50));
      
      productsByCategory[categoryName].forEach((product, index) => {
        console.log(`\n${index + 1}. ${product.name}`);
        console.log(`   Slug: ${product.slug}`);
        console.log(`   Category: ${categoryName}`);
        console.log(`   Packaging: ${product.packaging_type}`);
        console.log(`   Label: ${product.label_type}`);
        console.log(`   Description: ${product.short_description}`);
        
        // Extract weight/size info from packaging
        let sizeInfo = 'Unknown';
        if (product.packaging_type) {
          if (product.packaging_type.includes('70g')) {
            sizeInfo = '70g';
          } else if (product.packaging_type.includes('100ml')) {
            sizeInfo = '100ml';
          } else if (product.packaging_type.includes('100g')) {
            sizeInfo = '100g';
          } else if (product.packaging_type.includes('200g')) {
            sizeInfo = '200g';
          } else if (product.packaging_type.includes('Cupcake')) {
            sizeInfo = 'Pack of 2 (2 x 50g)';
          }
        }
        console.log(`   Size: ${sizeInfo}`);
      });
    });
    
    // Category analysis
    console.log('\n\n📋 Category Summary:');
    console.log('─'.repeat(30));
    Object.keys(productsByCategory).forEach(categoryName => {
      console.log(`${categoryName}: ${productsByCategory[categoryName].length} products`);
    });
    
    // Note about category issue
    console.log('\n\n⚠️  Category Issue Found:');
    console.log('─'.repeat(30));
    console.log('You mentioned "fourth category is Cupcakes and not Kitten Food"');
    console.log('Current categories: Meals, Broths, Treats, Kitten Food');
    console.log('Products in "Kitten Food" category:');
    
    if (productsByCategory['Kitten Food']) {
      productsByCategory['Kitten Food'].forEach(product => {
        console.log(`  - ${product.name} (${product.packaging_type})`);
      });
    }
    
    console.log('\n💡 Recommendation: Update "Kitten Food" category to "Cupcakes"');
    
  } catch (error) {
    console.error('❌ Analysis error:', error.message);
  }
}

analyzeAllProducts();
