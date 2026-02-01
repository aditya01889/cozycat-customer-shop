const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.production' });

console.log('🔍 Fetching production database schema...');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.production');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fetchSchema() {
  try {
    console.log('📋 Checking key tables directly...');
    
    // List of tables to check
    const tablesToCheck = [
      'categories',
      'products', 
      'product_variants',
      'profiles',
      'orders',
      'cart_items',
      'addresses'
    ];
    
    for (const tableName of tablesToCheck) {
      console.log(`\n🔍 Checking table: ${tableName}`);
      
      try {
        // Try to select one row to see if table exists and get columns
        const { data, error, count } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });

        if (error) {
          console.log(`  ❌ Table ${tableName}: ${error.message}`);
        } else {
          console.log(`  ✅ Table ${tableName} exists (${count || 0} rows)`);
          
          // Get sample data to understand structure
          const { data: sampleData, error: sampleError } = await supabase
            .from(tableName)
            .select('*')
            .limit(1);

          if (!sampleError && sampleData && sampleData.length > 0) {
            const columns = Object.keys(sampleData[0]);
            console.log(`  📋 Columns: ${columns.join(', ')}`);
            
            // Show sample data types
            console.log(`  � Sample data:`);
            Object.entries(sampleData[0]).forEach(([key, value]) => {
              const type = typeof value;
              const display = value !== null ? 
                (type === 'string' && value.length > 50 ? `"${value.substring(0, 50)}..."` : `"${value}"`) : 
                'null';
              console.log(`    ${key}: ${type} = ${display}`);
            });
          }
        }
      } catch (err) {
        console.log(`  ❌ Error checking ${tableName}: ${err.message}`);
      }
    }

    // Special focus on products structure
    console.log('\n🎯 Deep dive into products table...');
    try {
      const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .limit(3);

      if (error) {
        console.log(`  ❌ Products table error: ${error.message}`);
      } else {
        console.log(`  ✅ Products table structure:`);
        if (products && products.length > 0) {
          const product = products[0];
          console.log(`  📋 All columns: ${Object.keys(product).join(', ')}`);
          
          // Check for pricing structure
          if (product.price !== undefined) {
            console.log(`  � Direct pricing: YES (price = ${product.price})`);
          }
          
          // Check for category relationship
          if (product.category_id !== undefined) {
            console.log(`  🔗 Category relationship: YES (category_id = ${product.category_id})`);
          }
        }
      }
    } catch (err) {
      console.log(`  ❌ Error analyzing products: ${err.message}`);
    }

  } catch (error) {
    console.error('❌ Error fetching schema:', error);
  }
}

fetchSchema();
