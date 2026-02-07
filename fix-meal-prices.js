#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Production Supabase credentials
const SUPABASE_URL = 'https://xfnbhheapralprcwjvzl.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmbmJoaGVhcHJhbHByY3dqdnpsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODMxNDUwMywiZXhwIjoyMDgzODkwNTAzfQ.uTt3Q-sahXSAbtC5UPAIRenNYJcGPksSIUOiQtwd6H0';

console.log('💰 Fixing meal prices...');

async function fixMealPrices() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  
  try {
    // Correct meal prices
    const mealPrices = {
      'nourish': 70,
      'vitality': 70, 
      'power': 85,
      'supreme': 85,
      'nurture': 100,
      'thrive': 100
    };
    
    console.log('📋 Updating meal prices to correct values:');
    Object.keys(mealPrices).forEach(slug => {
      console.log(`   ${slug}: ₹${mealPrices[slug]}`);
    });
    
    // Update each meal product's variants
    for (const [slug, correctPrice] of Object.entries(mealPrices)) {
      // Get the product
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('id')
        .eq('slug', slug)
        .single();
      
      if (productError) {
        console.error(`❌ Error fetching ${slug}:`, productError);
        continue;
      }
      
      if (!product) {
        console.error(`❌ Product ${slug} not found`);
        continue;
      }
      
      // Update all variants for this product
      const { data: variants, error: variantsError } = await supabase
        .from('product_variants')
        .select('id, sku')
        .eq('product_id', product.id);
      
      if (variantsError) {
        console.error(`❌ Error fetching variants for ${slug}:`, variantsError);
        continue;
      }
      
      if (!variants || variants.length === 0) {
        console.error(`❌ No variants found for ${slug}`);
        continue;
      }
      
      // Update each variant
      for (const variant of variants) {
        const { error: updateError } = await supabase
          .from('product_variants')
          .update({ price: correctPrice })
          .eq('id', variant.id);
        
        if (updateError) {
          console.error(`❌ Error updating ${variant.sku}:`, updateError);
        } else {
          console.log(`✅ Updated ${variant.sku}: ₹${correctPrice}`);
        }
      }
    }
    
    // Verify updates
    console.log('\n🔍 Verification:');
    for (const slug of Object.keys(mealPrices)) {
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('id, name')
        .eq('slug', slug)
        .single();
      
      if (!productError && product) {
        const { data: variants, error: variantsError } = await supabase
          .from('product_variants')
          .select('price, sku')
          .eq('product_id', product.id);
        
        if (!variantsError && variants) {
          console.log(`${product.name}:`);
          variants.forEach(v => {
            console.log(`  ${v.sku}: ₹${v.price}`);
          });
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Fix error:', error.message);
  }
}

fixMealPrices();
