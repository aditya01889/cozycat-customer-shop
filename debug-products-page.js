#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Production Supabase credentials
const SUPABASE_URL = 'https://xfnbhheapralprcwjvzl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmbmJoaGVhcHJhbHByY3dqdnpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzMTQ1MDMsImV4cCI6MjA4Mzg5MDUwM30.EV2hQ3uyjpOW29KaiDNqASzAucvyvqojsQcplXGaQXE';

console.log('🔍 Debugging products page server-side query...');

async function debugProductsQuery() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  try {
    console.log('\n📊 Step 1: Fetch products with variants (same as page.tsx)');
    
    // This is the exact query from the products page
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select(`
        *,
        product_variants (*)
      `)
      .eq('is_active', true)
      .order('display_order');
    
    if (productsError) {
      console.error('❌ Products query error:', productsError);
      return;
    }
    
    console.log(`✅ Found ${products?.length || 0} products`);
    
    if (!products || products.length === 0) {
      console.log('❌ No products found - this is the issue!');
      return;
    }
    
    console.log('\n📦 Step 2: Check product variants');
    
    // Check each product's variants
    for (let i = 0; i < Math.min(products.length, 5); i++) {
      const product = products[i];
      const variants = product.product_variants || [];
      
      console.log(`\nProduct ${i + 1}: ${product.name}`);
      console.log(`  ID: ${product.id}`);
      console.log(`  Variants count: ${variants.length}`);
      
      if (variants.length === 0) {
        console.log('  ❌ No variants - will be filtered out!');
      } else {
        variants.forEach((variant, j) => {
          console.log(`  Variant ${j + 1}: weight=${variant.weight_grams}, price=${variant.price}`);
          const hasValidWeight = variant.weight_grams !== undefined && variant.weight_grams !== null;
          const hasValidPrice = variant.price !== undefined && variant.price !== null;
          console.log(`    Valid weight: ${hasValidWeight}, Valid price: ${hasValidPrice}`);
        });
      }
    }
    
    console.log('\n🔍 Step 3: Apply the same filter as the page');
    
    // Apply the same filtering logic as the products page
    const validProducts = products
      .filter(product => product !== null)
      .filter(product => {
        const variants = product.product_variants || [];
        return variants.length > 0 && variants.some(v => 
          v?.weight_grams !== undefined && 
          v?.weight_grams !== null && 
          v?.price !== undefined && 
          v?.price !== null
        );
      });
    
    console.log(`✅ Valid products after filtering: ${validProducts.length}`);
    
    if (validProducts.length === 0) {
      console.log('❌ All products filtered out - this is why page shows 0 products!');
      
      // Let's check why
      console.log('\n🔍 Analysis of why products are filtered out:');
      for (let i = 0; i < products.length; i++) {
        const product = products[i];
        const variants = product.product_variants || [];
        
        console.log(`\n${product.name}:`);
        console.log(`  Has variants: ${variants.length > 0}`);
        
        if (variants.length > 0) {
          const hasValidVariant = variants.some(v => 
            v?.weight_grams !== undefined && 
            v?.weight_grams !== null && 
            v?.price !== undefined && 
            v?.price !== null
          );
          console.log(`  Has valid variant: ${hasValidVariant}`);
          
          if (!hasValidVariant) {
            console.log('  ❌ Invalid variants:');
            variants.forEach((variant, j) => {
              console.log(`    Variant ${j + 1}: weight=${variant.weight_grams}, price=${variant.price}`);
            });
          }
        }
      }
    } else {
      console.log('✅ Products should display correctly!');
    }
    
  } catch (error) {
    console.error('❌ Debug error:', error.message);
  }
}

debugProductsQuery();
