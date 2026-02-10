#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Production Supabase credentials
const SUPABASE_URL = 'https://xfnbhheapralprcwjvzl.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmbmJoaGVhcHJhbHByY3dqdnpsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODMxNDUwMywiZXhwIjoyMDgzODkwNTAzfQ.uTt3Q-sahXSAbtC5UPAIRenNYJcGPksSIUOiQtwd6H0';

console.log('🔍 Finding Thrive product...');

async function findThriveProduct() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  
  try {
    // Check if Thrive exists in products table
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('slug', 'thrive')
      .single();
    
    if (productError) {
      console.error('❌ Error checking Thrive product:', productError);
      return;
    }
    
    if (product) {
      console.log('✅ Thrive product found:');
      console.log(`   ID: ${product.id}`);
      console.log(`   Name: ${product.name}`);
      console.log(`   Category: ${product.category_id}`);
      console.log(`   Active: ${product.is_active}`);
      
      // Check if Thrive has variants
      const { data: variants, error: variantsError } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', product.id);
      
      if (variantsError) {
        console.error('❌ Error checking Thrive variants:', variantsError);
        return;
      }
      
      console.log(`\n📦 Thrive variants: ${variants?.length || 0}`);
      
      if (variants && variants.length > 0) {
        variants.forEach((variant, index) => {
          console.log(`   ${index + 1}. ${variant.sku}: ${variant.weight_grams}g, ₹${variant.price}`);
        });
      } else {
        console.log('❌ Thrive has no variants - this is the issue!');
        
        // Create Thrive variant (70g, ₹100)
        console.log('\n🛠️ Creating Thrive variant (70g, ₹100)...');
        
        const { data: newVariant, error: createError } = await supabase
          .from('product_variants')
          .insert({
            id: require('uuid').v4(),
            product_id: product.id,
            weight_grams: 70,
            price: 100.00,
            sku: 'THRIVE-70G',
            is_active: true
          })
          .select();
        
        if (createError) {
          console.error('❌ Error creating Thrive variant:', createError);
        } else {
          console.log('✅ Thrive variant created successfully!');
          console.log(`   SKU: THRIVE-70G`);
          console.log(`   Weight: 70g`);
          console.log(`   Price: ₹100`);
        }
      }
    } else {
      console.log('❌ Thrive product not found in database');
      
      // Check if there's a similar product
      const { data: similarProducts, error: similarError } = await supabase
        .from('products')
        .select('name, slug')
        .ilike('name', '%thrive%')
        .eq('is_active', true);
      
      if (!similarError && similarProducts) {
        console.log('\n🔍 Products with "thrive" in name:');
        similarProducts.forEach((p, index) => {
          console.log(`   ${index + 1}. ${p.name} (${p.slug})`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Find error:', error.message);
  }
}

findThriveProduct();
