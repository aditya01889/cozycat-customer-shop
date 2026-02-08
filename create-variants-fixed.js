#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Production Supabase credentials
const SUPABASE_URL = 'https://xfnbhheapralprcwjvzl.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmbmJoaGVhcHJhbHByY3dqdnpsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODMxNDUwMywiZXhwIjoyMDgzODkwNTAzfQ.uTt3Q-sahXSAbtC5UPAIRenNYJcGPksSIUOiQtwd6H0';

console.log('🔧 Creating product variants with correct schema...');

async function createVariants() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  
  try {
    // Get all products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, slug')
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
          is_active: true
        });
      
      if (insertError) {
        console.error(`❌ Error creating variant for ${product.name}:`, insertError);
      } else {
        console.log(`✅ Created variant for ${product.name}`);
      }
    }
    
    console.log('\n🎉 Variant creation completed!');
    
    // Verify the variants were created
    const { data: variants, error: verifyError } = await supabase
      .from('product_variants')
      .select('*');
    
    if (verifyError) {
      console.error('❌ Verification error:', verifyError);
    } else {
      console.log(`\n✅ Verification: Found ${variants?.length || 0} variants in database`);
      
      if (variants && variants.length > 0) {
        console.log('\n📋 Created variants:');
        variants.slice(0, 5).forEach((variant, index) => {
          console.log(`${index + 1}. Product: ${variant.product_id}, Weight: ${variant.weight_grams}g, Price: ₹${variant.price / 100}`);
        });
        
        if (variants.length > 5) {
          console.log(`... and ${variants.length - 5} more`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Debug error:', error.message);
  }
}

createVariants();
