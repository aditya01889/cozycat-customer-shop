#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Production Supabase credentials
const SUPABASE_URL = 'https://xfnbhheapralprcwjvzl.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmbmJoaGVhcHJhbHByY3dqdnpsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODMxNDUwMywiZXhwIjoyMDgzODkwNTAzfQ.uTt3Q-sahXSAbtC5UPAIRenNYJcGPksSIUOiQtwd6H0';

console.log('🔍 Checking product variants in database...');

async function checkVariants() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  
  try {
    console.log('\n📊 Check all product variants:');
    
    const { data: variants, error: variantsError } = await supabase
      .from('product_variants')
      .select('*');
    
    if (variantsError) {
      console.error('❌ Variants query error:', variantsError);
      return;
    }
    
    console.log(`✅ Found ${variants?.length || 0} total variants`);
    
    if (!variants || variants.length === 0) {
      console.log('❌ No variants found in database at all!');
      console.log('\n🔧 This is the issue - products need variants to display');
      
      // Let's create basic variants for the products
      console.log('\n🛠️ Creating basic variants for all products...');
      
      // Get all products
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, name')
        .eq('is_active', true);
      
      if (productsError) {
        console.error('❌ Products query error:', productsError);
        return;
      }
      
      console.log(`Found ${products?.length || 0} products to create variants for`);
      
      // Create a basic variant for each product
      for (const product of products || []) {
        console.log(`\n📦 Creating variant for: ${product.name}`);
        
        const { error: insertError } = await supabase
          .from('product_variants')
          .insert({
            product_id: product.id,
            weight_grams: 100,
            price: 29900, // ₹299.00 in paise
            sku: `${product.slug}-100g`,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        
        if (insertError) {
          console.error(`❌ Error creating variant for ${product.name}:`, insertError);
        } else {
          console.log(`✅ Created variant for ${product.name}`);
        }
      }
      
      console.log('\n🎉 Variant creation completed!');
      
    } else {
      console.log('\n📋 Existing variants:');
      variants.forEach((variant, index) => {
        console.log(`${index + 1}. Product: ${variant.product_id}, Weight: ${variant.weight_grams}g, Price: ₹${variant.price / 100}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Debug error:', error.message);
  }
}

checkVariants();
