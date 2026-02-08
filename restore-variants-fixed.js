#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');

// Production Supabase credentials
const SUPABASE_URL = 'https://xfnbhheapralprcwjvzl.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmbmJoaGVhcHJhbHByY3dqdnpsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODMxNDUwMywiZXhwIjoyMDgzODkwNTAzfQ.uTt3Q-sahXSAbtC5UPAIRenNYJcGPksSIUOiQtwd6H0';

console.log('🔄 Restoring original product variants (fixed IDs)...');

async function restoreOriginalVariants() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  
  try {
    // Original variants with new UUIDs to avoid conflicts
    const originalVariants = [
      // Bone Rich - Broths
      {
        id: uuidv4(),
        product_id: '0e9204cf-21af-482f-a332-d36269959ffd',
        weight_grams: 100,
        price: 100.00,
        sku: 'BONERICH-100ML',
        is_active: true
      },
      
      // Golden Glow Cupcake - Cupcakes
      {
        id: uuidv4(),
        product_id: '4a45f496-00fc-43c0-ba34-1137e56ec9be',
        weight_grams: 100,
        price: 450.00,
        sku: 'GOLDENGLOW-2PC',
        is_active: true
      },
      
      // Fruity Paws Cupcake - Cupcakes
      {
        id: uuidv4(),
        product_id: 'f29a33a5-a354-42e0-a1cd-6713cbdfc61e',
        weight_grams: 100,
        price: 400.00,
        sku: 'FRUITYPAWS-2PC',
        is_active: true
      },
      
      // Veggie Mew Cupcake - Cupcakes
      {
        id: uuidv4(),
        product_id: '4243a708-5ec4-4686-b219-61477782b70d',
        weight_grams: 100,
        price: 350.00,
        sku: 'VEGGIEMEW-2PC',
        is_active: true
      },
      
      // Happy Tummy Cupcake - Cupcakes
      {
        id: uuidv4(),
        product_id: '82fc463b-2b19-4be4-ac0d-180d56322b4b',
        weight_grams: 100,
        price: 300.00,
        sku: 'HAPPYTUMMY-2PC',
        is_active: true
      },
      
      // Beetroot Cookies - Treats (200g variant)
      {
        id: uuidv4(),
        product_id: '90310ac1-6f99-4c07-8e3e-68677ffcc96f',
        weight_grams: 200,
        price: 200.00,
        sku: 'BEETROOT-200G',
        is_active: true
      },
      
      // Supreme - Meals
      {
        id: uuidv4(),
        product_id: '7bd899d2-e50e-4af5-b574-59b5bf4ca5ee',
        weight_grams: 70,
        price: 85.00,
        sku: 'SUPREME-70G',
        is_active: true
      },
      
      // Chicken Cookies - Treats (200g variant)
      {
        id: uuidv4(),
        product_id: 'ccd26ecf-8059-4a27-a2db-6ae15da11ca4',
        weight_grams: 200,
        price: 200.00,
        sku: 'CHICKEN-200G',
        is_active: true
      },
      
      // Banana Cookies - Treats (200g variant)
      {
        id: uuidv4(),
        product_id: 'ed3392a2-2738-4c05-9717-cf43ad40e1be',
        weight_grams: 200,
        price: 200.00,
        sku: 'BANANA-200G',
        is_active: true
      },
      
      // Banana Cookies - Treats (100g variant)
      {
        id: uuidv4(),
        product_id: 'ed3392a2-2738-4c05-9717-cf43ad40e1be',
        weight_grams: 100,
        price: 120.00,
        sku: 'BANANA-100G',
        is_active: true
      },
      
      // Essence - Broths
      {
        id: uuidv4(),
        product_id: 'de648df5-cd0f-4e29-b53c-da676c55258f',
        weight_grams: 100,
        price: 100.00,
        sku: 'ESSENCE-100ML',
        is_active: true
      },
      
      // Power - Meals
      {
        id: uuidv4(),
        product_id: '7bc76252-827b-4429-ae6c-68e60dc07fb2',
        weight_grams: 70,
        price: 85.00,
        sku: 'POWER-70G',
        is_active: true
      },
      
      // Thrive - Meals
      {
        id: uuidv4(),
        product_id: 'cb5b0c0d-80a8-4017-9fe7-9f69b1a5a042',
        weight_grams: 70,
        price: 100.00,
        sku: 'THRIVE-70G',
        is_active: true
      },
      
      // Purrfect Protein Cupcake - Cupcakes
      {
        id: uuidv4(),
        product_id: 'e019ccf1-3a0e-4cd1-adca-3910635c3161',
        weight_grams: 100,
        price: 300.00,
        sku: 'PURRPROTEIN-2PC',
        is_active: true
      },
      
      // Tuna Delight Cupcake - Cupcakes
      {
        id: uuidv4(),
        product_id: '35a83797-69af-4257-8178-35894f481b02',
        weight_grams: 100,
        price: 400.00,
        sku: 'TUNADELIGHT-2PC',
        is_active: true
      },
      
      // Nurture - Meals
      {
        id: uuidv4(),
        product_id: 'b97698ca-4b52-427e-bc57-e141e55d3493',
        weight_grams: 70,
        price: 100.00,
        sku: 'NURTURE-70G',
        is_active: true
      },
      
      // Nourish - Meals
      {
        id: uuidv4(),
        product_id: 'e017972d-4a82-4461-b24d-8a1fd72b5c71',
        weight_grams: 70,
        price: 70.00,
        sku: 'NOURISH-70G',
        is_active: true
      },
      
      // Vitality - Meals
      {
        id: uuidv4(),
        product_id: '7bc76252-827b-4429-ae6c-68e60dc07fb2',
        weight_grams: 70,
        price: 70.00,
        sku: 'VITALITY-70G',
        is_active: true
      },
      
      // Pumpkin Cookies - Treats (200g variant)
      {
        id: uuidv4(),
        product_id: '68e827a3-3eaa-4d3f-be58-084ea66f7d28',
        weight_grams: 200,
        price: 200.00,
        sku: 'PUMPKIN-200G',
        is_active: true
      },
      
      // Pumpkin Cookies - Treats (100g variant)
      {
        id: uuidv4(),
        product_id: '68e827a3-3eaa-4d3f-be58-084ea66f7d28',
        weight_grams: 100,
        price: 120.00,
        sku: 'PUMPKIN-100G',
        is_active: true
      },
      
      // Beetroot Cookies - Treats (100g variant)
      {
        id: uuidv4(),
        product_id: '90310ac1-6f99-4c07-8e3e-68677ffcc96f',
        weight_grams: 100,
        price: 120.00,
        sku: 'BEETROOT-100G',
        is_active: true
      },
      
      // Chicken Cookies - Treats (100g variant)
      {
        id: uuidv4(),
        product_id: 'ccd26ecf-8059-4a27-a2db-6ae15da11ca4',
        weight_grams: 100,
        price: 120.00,
        sku: 'CHICKEN-100G',
        is_active: true
      }
    ];

    console.log(`📦 Restoring ${originalVariants.length} original variants...`);
    
    // Clear existing variants first
    const { error: clearError } = await supabase
      .from('product_variants')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    
    if (clearError) {
      console.error('❌ Error clearing existing variants:', clearError);
    } else {
      console.log('✅ Cleared existing variants');
    }
    
    // Insert all variants in one batch
    const { data, error } = await supabase
      .from('product_variants')
      .insert(originalVariants)
      .select();
    
    if (error) {
      console.error('❌ Error inserting variants:', error);
      return;
    }
    
    console.log(`✅ Successfully inserted ${data?.length || 0} variants`);
    
    // Verify restoration
    const { data: verifyVariants, error: verifyError } = await supabase
      .from('product_variants')
      .select('*');
    
    if (verifyError) {
      console.error('❌ Verification error:', verifyError);
    } else {
      console.log(`\n✅ Verification: Found ${verifyVariants?.length || 0} variants in database`);
      
      // Group by product for display
      const variantsByProduct = {};
      verifyVariants.forEach(variant => {
        if (!variantsByProduct[variant.product_id]) {
          variantsByProduct[variant.product_id] = [];
        }
        variantsByProduct[variant.product_id].push(variant);
      });
      
      console.log('\n📋 Variants by product:');
      Object.keys(variantsByProduct).forEach(productId => {
        const variants = variantsByProduct[productId];
        console.log(`Product ${productId}: ${variants.length} variant(s)`);
        variants.forEach(v => {
          console.log(`  - ${v.weight_grams}g, ₹${v.price}, ${v.sku}`);
        });
      });
    }
    
    // Test if products page will work now
    console.log('\n🧪 Testing products page logic...');
    const productsWithVariants = Object.keys(variantsByProduct).length;
    console.log(`✅ Products with variants: ${productsWithVariants}`);
    console.log(`✅ Expected to display: ${productsWithVariants} products`);
    
  } catch (error) {
    console.error('❌ Restoration error:', error.message);
  }
}

restoreOriginalVariants();
