#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Your production Supabase credentials
const SUPABASE_URL = 'https://xfnbhheapralprcwjvzl.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmbmJoaGVhcHJhbHByY3dqdnpsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODMxNDUwMywiZXhwIjoyMDgzODkwNTAzfQ.uTt3Q-sahXSAbtC5UPAIRenNYJcGPksSIUOiQtwd6H0';

console.log('🔧 Fixing wrong products in production database...');
console.log('URL:', SUPABASE_URL);

async function fixWrongProducts() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  
  try {
    // Get all products with their creation dates
    const { data: allProducts, error: productsError } = await supabase
      .from('products')
      .select('id, name, slug, created_at, is_active')
      .order('created_at', { ascending: false });
    
    if (productsError) {
      console.error('❌ Error getting products:', productsError);
      return;
    }
    
    console.log(`\n📊 Total products in database: ${allProducts.length}`);
    
    // Find products created on February 1st, 2026 (the wrong ones)
    const feb1Products = allProducts.filter(product => {
      const createdDate = new Date(product.created_at);
      return createdDate.toDateString() === 'Sat Feb 01 2026';
    });
    
    console.log(`\n❌ Found ${feb1Products.length} products created on Feb 1, 2026 (WRONG PRODUCTS):`);
    feb1Products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} (${product.slug})`);
      console.log(`   ID: ${product.id}`);
      console.log(`   Created: ${product.created_at}`);
      console.log(`   Active: ${product.is_active}`);
      console.log('');
    });
    
    // Find original products (created before Feb 1, 2026)
    const originalProducts = allProducts.filter(product => {
      const createdDate = new Date(product.created_at);
      return createdDate.toDateString() !== 'Sat Feb 01 2026';
    });
    
    console.log(`\n✅ Found ${originalProducts.length} original products (CORRECT PRODUCTS):`);
    originalProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} (${product.slug})`);
      console.log(`   ID: ${product.id}`);
      console.log(`   Created: ${product.created_at}`);
      console.log(`   Active: ${product.is_active}`);
      console.log('');
    });
    
    // Ask for confirmation before deleting
    if (feb1Products.length > 0) {
      console.log('\n🚨 WARNING: About to delete the wrong products and their variants!');
      console.log('Products to delete:', feb1Products.map(p => p.name).join(', '));
      
      // Delete the wrong products and their variants
      console.log('\n🗑️  Deleting wrong products...');
      
      for (const product of feb1Products) {
        // First delete product variants
        const { error: variantsError } = await supabase
          .from('product_variants')
          .delete()
          .eq('product_id', product.id);
        
        if (variantsError) {
          console.error(`❌ Error deleting variants for ${product.name}:`, variantsError);
        } else {
          console.log(`✅ Deleted variants for ${product.name}`);
        }
        
        // Then delete the product
        const { error: productError } = await supabase
          .from('products')
          .delete()
          .eq('id', product.id);
        
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
      }
    } else {
      console.log('\n✅ No wrong products found on Feb 1, 2026');
    }
    
  } catch (error) {
    console.error('❌ Database operation error:', error.message);
  }
}

fixWrongProducts();
