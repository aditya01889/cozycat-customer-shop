#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Your production Supabase credentials
const SUPABASE_URL = 'https://xfnbhheapralprcwjvzl.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmbmJoaGVhcHJhbHByY3dqdnpsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODMxNDUwMywiZXhwIjoyMDgzODkwNTAzfQ.uTt3Q-sahXSAbtC5UPAIRenNYJcGPksSIUOiQtwd6H0';

console.log('🗑️  Removing 7 wrong products from Feb 1, 2026...');
console.log('URL:', SUPABASE_URL);

async function removeFeb1Products() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  
  try {
    // The 7 wrong products created on Feb 1, 2026
    const feb1ProductIds = [
      'cf87945b-a665-4948-862e-8f8088f7d94b', // Salmon & Sweet Potato Feast
      '1aec0510-dcf8-4786-bfc8-3309e109268f', // Bone Broth Chicken
      'a97f11a2-ded0-4233-a03a-88c41bef4438', // Tuna & Vegetable Broth
      'be0541d8-a69f-402c-ab78-14e3d5e15708', // Kitten Growth Formula
      'b173a100-3644-4ca5-af39-37ace92cb093', // Salmon Training Treats
      '09766388-396a-4409-b30b-3f180b954096', // Chicken Crunchy Bites
      'da4e5917-b7a6-41a9-95fb-201fb4e861e9'  // Nourish Chicken Meal
    ];
    
    console.log(`\n🎯 Targeting ${feb1ProductIds.length} products created on Feb 1, 2026`);
    
    for (const productId of feb1ProductIds) {
      // First get product details for logging
      const { data: product, error: fetchError } = await supabase
        .from('products')
        .select('id, name, slug')
        .eq('id', productId)
        .single();
      
      if (fetchError) {
        console.error(`❌ Error fetching product ${productId}:`, fetchError);
        continue;
      }
      
      console.log(`\n🗑️  Removing: ${product.name} (${product.slug})`);
      
      // First delete product variants
      const { error: variantsError } = await supabase
        .from('product_variants')
        .delete()
        .eq('product_id', productId);
      
      if (variantsError) {
        console.error(`❌ Error deleting variants for ${product.name}:`, variantsError);
      } else {
        console.log(`✅ Deleted variants for ${product.name}`);
      }
      
      // Then delete the product
      const { error: productError } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);
      
      if (productError) {
        console.error(`❌ Error deleting product ${product.name}:`, productError);
      } else {
        console.log(`✅ Deleted product ${product.name}`);
      }
    }
    
    console.log('\n🎉 Cleanup completed!');
    
    // Verify the cleanup
    const { count, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);
    
    if (!countError) {
      console.log(`\n📊 Final count of active products: ${count}`);
      console.log('✅ Should now show your original 18 products on the website!');
    }
    
    // Show remaining products
    const { data: remainingProducts, error: remainingError } = await supabase
      .from('products')
      .select('name, slug, created_at')
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .limit(20);
    
    if (!remainingError) {
      console.log('\n📋 Remaining products (should be your original 18):');
      remainingProducts.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name} (${product.slug})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Database operation error:', error.message);
  }
}

removeFeb1Products();
