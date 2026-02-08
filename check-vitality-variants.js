#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Production Supabase credentials
const SUPABASE_URL = 'https://xfnbhheapralprcwjvzl.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmbmJoaGVhcHJhbHByY3dqdnpsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODMxNDUwMywiZXhwIjoyMDgzODkwNTAzfQ.uTt3Q-sahXSAbtC5UPAIRenNYJcGPksSIUOiQtwd6H0';

console.log('🔍 Checking Vitality product variants...');

async function checkVitalityVariants() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  
  try {
    // Get Vitality product
    const { data: vitalityProduct, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('slug', 'vitality')
      .single();
    
    if (productError) {
      console.error('❌ Error fetching Vitality product:', productError);
      return;
    }
    
    if (!vitalityProduct) {
      console.log('❌ Vitality product not found');
      return;
    }
    
    console.log('📦 Vitality Product:');
    console.log(`   ID: ${vitalityProduct.id}`);
    console.log(`   Name: ${vitalityProduct.name}`);
    console.log(`   Category: ${vitalityProduct.category_id}`);
    
    // Get all variants for Vitality
    const { data: variants, error: variantsError } = await supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', vitalityProduct.id);
    
    if (variantsError) {
      console.error('❌ Error fetching variants:', variantsError);
      return;
    }
    
    console.log(`\n📋 Found ${variants?.length || 0} variants for Vitality:`);
    
    variants.forEach((variant, index) => {
      console.log(`   ${index + 1}. Weight: ${variant.weight_grams}g, Price: ₹${variant.price}, SKU: ${variant.sku}`);
    });
    
    if (variants && variants.length > 1) {
      console.log('\n⚠️  Vitality has multiple variants - should only have one (70g, ₹85)');
      
      // Find the correct variant (70g, ₹85)
      const correctVariant = variants.find(v => v.weight_grams === 70 && v.price === 85);
      const extraVariants = variants.filter(v => !(v.weight_grams === 70 && v.price === 85));
      
      if (correctVariant) {
        console.log(`✅ Found correct variant: ${correctVariant.sku}`);
        
        // Remove extra variants
        console.log(`\n🗑️ Removing ${extraVariants.length} extra variants...`);
        
        for (const extraVariant of extraVariants) {
          const { error: deleteError } = await supabase
            .from('product_variants')
            .delete()
            .eq('id', extraVariant.id);
          
          if (deleteError) {
            console.error(`❌ Error deleting variant ${extraVariant.sku}:`, deleteError);
          } else {
            console.log(`✅ Removed extra variant: ${extraVariant.sku}`);
          }
        }
      } else {
        console.log('❌ Correct variant not found!');
      }
    } else if (variants && variants.length === 1) {
      const variant = variants[0];
      if (variant.weight_grams === 70 && variant.price === 85) {
        console.log('✅ Vitality has correct single variant (70g, ₹85)');
      } else {
        console.log(`⚠️  Vitality has single variant but wrong specs: ${variant.weight_grams}g, ₹${variant.price}`);
      }
    } else {
      console.log('❌ Vitality has no variants!');
    }
    
  } catch (error) {
    console.error('❌ Check error:', error.message);
  }
}

checkVitalityVariants();
