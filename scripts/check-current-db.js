const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

console.log('🔍 Checking current local database state...');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSJ9.6C_wt1x2q_3jIz6a8N2T6d6Z8H7Y9Z0W1V2R3F4G5H6';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCurrentState() {
  try {
    // Check categories
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .order('display_order');

    if (categoriesError) {
      console.error('❌ Error fetching categories:', categoriesError);
    } else {
      console.log(`✅ Categories (${categories?.length || 0}):`);
      categories?.forEach(cat => {
        console.log(`  - ${cat.name} (${cat.slug}) - ID: ${cat.id}`);
      });
    }

    // Check products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .order('display_order');

    if (productsError) {
      console.error('❌ Error fetching products:', productsError);
    } else {
      console.log(`\n✅ Products (${products?.length || 0}):`);
      products?.forEach(product => {
        console.log(`  - ${product.name} (${product.slug}) - ID: ${product.id}`);
        console.log(`    Category: ${product.category_id}`);
        console.log(`    Image: ${product.image_url}`);
      });
    }

    // Check variants
    const { data: variants, error: variantsError } = await supabase
      .from('product_variants')
      .select('*')
      .limit(10);

    if (variantsError) {
      console.log(`\n❌ Variants error: ${variantsError.message}`);
    } else {
      console.log(`\n✅ Product Variants (${variants?.length || 0}):`);
      variants?.forEach(variant => {
        console.log(`  - ${variant.sku}: ${variant.weight_grams}g - $${variant.price}`);
        console.log(`    Product: ${variant.product_id}`);
      });
    }

  } catch (error) {
    console.error('❌ Error checking state:', error);
  }
}

checkCurrentState();
