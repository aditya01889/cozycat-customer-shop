#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Your production Supabase credentials
const SUPABASE_URL = 'https://xfnbhheapralprcwjvzl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmbmJoaGVhcHJhbHByY3dqdnpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzMTQ1MDMsImV4cCI6MjA4Mzg5MDUwM30.EV2hQ3uyjpOW29KaiDNqASzAucvyvqojsQcplXGaQXE';

console.log('🔍 Checking production Supabase database...');
console.log('URL:', SUPABASE_URL);

async function checkDatabase() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  try {
    // Check if we can connect
    console.log('\n📡 Testing database connection...');
    
    // Get total product count
    const { count, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Error getting product count:', countError);
      return;
    }
    
    console.log(`📊 Total products in database: ${count}`);
    
    // Get first few products to see what's in there
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, slug, is_active, display_order, created_at')
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .limit(10);
    
    if (productsError) {
      console.error('❌ Error getting products:', productsError);
      return;
    }
    
    console.log('\n🛍️  First 10 active products:');
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} (${product.slug})`);
      console.log(`   ID: ${product.id}`);
      console.log(`   Display Order: ${product.display_order}`);
      console.log(`   Created: ${new Date(product.created_at).toLocaleDateString()}`);
      console.log('');
    });
    
    // Check if there are any product variants
    const { data: variants, error: variantsError } = await supabase
      .from('product_variants')
      .select('product_id, weight_grams, price')
      .limit(5);
    
    if (variantsError) {
      console.error('❌ Error getting variants:', variantsError);
    } else {
      console.log(`📦 Found ${variants.length} product variants (showing first 5):`);
      variants.forEach((variant, index) => {
        console.log(`${index + 1}. Product: ${variant.product_id}, Weight: ${variant.weight_grams}g, Price: ₹${variant.price}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
  }
}

checkDatabase();
