#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');

// Production Supabase credentials
const SUPABASE_URL = 'https://xfnbhheapralprcwjvzl.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmbmJoaGVhcHJhbHByY3dqdnpsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODMxNDUwMywiZXhwIjoyMDgzODkwNTAzfQ.uTt3Q-sahXSAbtC5UPAIRenNYJcGPksSIUOiQtwd6H0';

console.log('🛠️ Creating Thrive variant (70g, ₹100)...');

async function createThriveVariant() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  
  try {
    // Get Thrive product
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id')
      .eq('slug', 'thrive')
      .single();
    
    if (productError) {
      console.error('❌ Error fetching Thrive:', productError);
      return;
    }
    
    if (!product) {
      console.error('❌ Thrive product not found');
      return;
    }
    
    // Create Thrive variant with unique SKU
    const { data: newVariant, error: createError } = await supabase
      .from('product_variants')
      .insert({
        id: uuidv4(),
        product_id: product.id,
        weight_grams: 70,
        price: 100.00,
        sku: 'THRIVE-70G-V2',
        is_active: true
      })
      .select();
    
    if (createError) {
      console.error('❌ Error creating Thrive variant:', createError);
    } else {
      console.log('✅ Thrive variant created successfully!');
      console.log(`   SKU: THRIVE-70G-V2`);
      console.log(`   Weight: 70g`);
      console.log(`   Price: ₹100`);
      
      // Verify creation
      const { data: verifyVariants, error: verifyError } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', product.id);
      
      if (!verifyError && verifyVariants) {
        console.log('\n🔍 Thrive variants after creation:');
        verifyVariants.forEach((variant, index) => {
          console.log(`   ${index + 1}. ${variant.sku}: ${variant.weight_grams}g, ₹${variant.price}`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Creation error:', error.message);
  }
}

createThriveVariant();
