#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Production Supabase credentials
const SUPABASE_URL = 'https://xfnbhheapralprcwjvzl.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmbmJoaGVhcHJhbHByY3dqdnpsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODMxNDUwMywiZXhwIjoyMDgzODkwNTAzfQ.uTt3Q-sahXSAbtC5UPAIRenNYJcGPksSIUOiQtwd6H0';

console.log('🔍 Testing category + price filtering...');

async function testFiltering() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  
  try {
    // Test scenario: Category = Meals, Price = above 400
    console.log('\n📋 Test: Category = Meals, Price = above 400');
    
    // Get Meals category ID
    const { data: mealsCategory } = await supabase
      .from('categories')
      .select('id, name')
      .eq('slug', 'meals')
      .single();
    
    console.log(`Meals Category ID: ${mealsCategory?.id}`);
    
    // Get Meals products
    const { data: mealsProducts } = await supabase
      .from('products')
      .select(`
        *,
        product_variants (*)
      `)
      .eq('is_active', true)
      .eq('category_id', mealsCategory.id)
      .order('display_order');
    
    console.log(`\n📦 Found ${mealsProducts?.length || 0} Meals products:`);
    
    // Check each meal product's pricing
    mealsProducts?.forEach((product, index) => {
      const variants = product.product_variants || [];
      const prices = variants.map(v => v.price);
      const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
      
      console.log(`\n${index + 1}. ${product.name}:`);
      console.log(`   Variants: ${variants.length}`);
      variants.forEach(v => {
        console.log(`     - ${v.sku}: ₹${v.price}`);
      });
      console.log(`   Min Price: ₹${minPrice}`);
      console.log(`   Above 400: ${minPrice > 400 ? 'YES' : 'NO'}`);
    });
    
    // Apply price filter
    const filteredMeals = mealsProducts?.filter(product => {
      const variants = product.product_variants || [];
      const prices = variants.map(v => v.price);
      const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
      return minPrice > 400;
    });
    
    console.log(`\n🎯 Meals above ₹400: ${filteredMeals?.length || 0} products`);
    
    // Test scenario: Category = Cupcakes, Price = above 400
    console.log('\n📋 Test: Category = Cupcakes, Price = above 400');
    
    // Get Cupcakes category ID
    const { data: cupcakesCategory } = await supabase
      .from('categories')
      .select('id, name')
      .eq('slug', 'cupcakes')
      .single();
    
    console.log(`Cupcakes Category ID: ${cupcakesCategory?.id}`);
    
    // Get Cupcakes products
    const { data: cupcakesProducts } = await supabase
      .from('products')
      .select(`
        *,
        product_variants (*)
      `)
      .eq('is_active', true)
      .eq('category_id', cupcakesCategory.id)
      .order('display_order');
    
    console.log(`\n📦 Found ${cupcakesProducts?.length || 0} Cupcakes products:`);
    
    // Check each cupcake product's pricing
    cupcakesProducts?.forEach((product, index) => {
      const variants = product.product_variants || [];
      const prices = variants.map(v => v.price);
      const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
      
      console.log(`\n${index + 1}. ${product.name}:`);
      console.log(`   Variants: ${variants.length}`);
      variants.forEach(v => {
        console.log(`     - ${v.sku}: ₹${v.price}`);
      });
      console.log(`   Min Price: ₹${minPrice}`);
      console.log(`   Above 400: ${minPrice > 400 ? 'YES' : 'NO'}`);
    });
    
    // Apply price filter
    const filteredCupcakes = cupcakesProducts?.filter(product => {
      const variants = product.product_variants || [];
      const prices = variants.map(v => v.price);
      const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
      return minPrice > 400;
    });
    
    console.log(`\n🎯 Cupcakes above ₹400: ${filteredCupcakes?.length || 0} products`);
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testFiltering();
