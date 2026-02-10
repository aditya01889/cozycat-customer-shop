#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Production Supabase credentials
const SUPABASE_URL = 'https://xfnbhheapralprcwjvzl.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmbmJoaGVhcHJhbHByY3dqdnpsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODMxNDUwMywiZXhwIjoyMDgzODkwNTAzfQ.uTt3Q-sahXSAbtC5UPAIRenNYJcGPksSIUOiQtwd6H0';

console.log('💰 Checking for pricing information in database...');

async function checkPricingInfo() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  
  try {
    // Get all products to check descriptions for pricing
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('display_order');
    
    if (productsError) {
      console.error('❌ Products error:', productsError);
      return;
    }
    
    console.log('\n📦 Checking product descriptions for pricing info:\n');
    
    let foundPricing = false;
    
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   Short description: ${product.short_description}`);
      
      // Check if description contains price info
      const desc = (product.description || '').toLowerCase();
      const shortDesc = (product.short_description || '').toLowerCase();
      
      const priceKeywords = ['₹', 'rs', 'price', 'cost', 'inr', 'rupee'];
      const hasPrice = priceKeywords.some(keyword => 
        desc.includes(keyword) || shortDesc.includes(keyword)
      );
      
      if (hasPrice) {
        console.log(`   💰 Contains price info: ${product.description}`);
        foundPricing = true;
      } else {
        console.log(`   ❌ No price info found`);
      }
      
      console.log('');
    });
    
    if (!foundPricing) {
      console.log('❌ No pricing information found in product descriptions');
    }
    
    // Check if there are any other tables that might contain pricing
    console.log('\n🔍 Checking for pricing-related tables...');
    
    const possiblePricingTables = [
      'pricing',
      'product_pricing',
      'prices',
      'product_prices',
      'variants_pricing',
      'inventory_pricing'
    ];
    
    for (const tableName of possiblePricingTables) {
      try {
        const { data: tableData, error: tableError } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (!tableError && tableData) {
          console.log(`✅ Found pricing table: ${tableName}`);
          console.log(`   Columns:`, Object.keys(tableData[0] || {}));
          console.log(`   Sample data:`, tableData[0]);
        }
      } catch (e) {
        // Table doesn't exist, continue
      }
    }
    
    // Check if there are any JSON fields in products that might contain pricing
    console.log('\n🔍 Checking for JSON fields that might contain pricing...');
    
    const firstProduct = products[0];
    if (firstProduct) {
      Object.keys(firstProduct).forEach(key => {
        const value = firstProduct[key];
        if (typeof value === 'object' && value !== null) {
          console.log(`✅ Found JSON field: ${key}`);
          console.log(`   Content:`, JSON.stringify(value, null, 2));
        }
      });
    }
    
    console.log('\n💡 Summary:');
    console.log('─'.repeat(30));
    console.log('❌ No product variants found in database');
    console.log('❌ No pricing information found in product descriptions');
    console.log('❌ No separate pricing tables found');
    console.log('');
    console.log('🤔 Need to determine:');
    console.log('1. Correct pricing for each product');
    console.log('2. Correct weight/size for each product variant');
    console.log('3. How many variants each product should have');
    
  } catch (error) {
    console.error('❌ Pricing check error:', error.message);
  }
}

checkPricingInfo();
