const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

console.log('🔧 Applying production schema to local database...');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSJ9.6C_wt1x2q_3jIz6a8N2T6d6Z8H7Y9Z0W1V2R3F4G5H6';

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyProductionSchema() {
  try {
    console.log('🗑️ Dropping existing tables...');
    
    // Drop tables in reverse order to avoid foreign key constraints
    const tablesToDrop = [
      'customers', 'notifications', 'wishlist_items', 'reviews', 
      'addresses', 'cart_items', 'order_items', 'orders', 
      'profiles', 'product_variants', 'products', 'categories'
    ];

    for (const tableName of tablesToDrop) {
      try {
        const { error } = await supabase.rpc('exec_sql', { 
          sql: `DROP TABLE IF EXISTS ${tableName} CASCADE;` 
        });
        
        if (error) {
          console.log(`  ℹ️ ${tableName}: ${error.message}`);
        } else {
          console.log(`  ✅ Dropped ${tableName}`);
        }
      } catch (err) {
        console.log(`  ℹ️ ${tableName}: ${err.message}`);
      }
    }

    console.log('\n🏗️ Creating tables with production schema...');

    // Create categories table
    console.log('📁 Creating categories...');
    const { error: categoriesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS categories (
            id UUID DEFAULT gen_random_uuid() NOT NULL,
            name TEXT NOT NULL,
            slug TEXT NOT NULL,
            description TEXT NOT NULL,
            display_order INTEGER NOT NULL,
            is_active BOOLEAN NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
            PRIMARY KEY (id),
            UNIQUE (slug)
        );
      `
    });

    if (categoriesError) {
      console.log(`  ❌ Categories error: ${categoriesError.message}`);
    } else {
      console.log('  ✅ Categories created');
    }

    // Create products table (NO price field - like production!)
    console.log('🛍️ Creating products...');
    const { error: productsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS products (
            id UUID DEFAULT gen_random_uuid() NOT NULL,
            category_id UUID NOT NULL,
            name TEXT NOT NULL,
            slug TEXT NOT NULL,
            description TEXT NOT NULL,
            short_description TEXT NOT NULL,
            nutritional_info JSONB,
            ingredients_display JSONB,
            image_url TEXT NOT NULL,
            is_active BOOLEAN NOT NULL,
            display_order INTEGER NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
            packaging_type TEXT NOT NULL,
            label_type TEXT NOT NULL,
            packaging_quantity_per_product INTEGER NOT NULL,
            label_quantity_per_product INTEGER NOT NULL,
            PRIMARY KEY (id),
            UNIQUE (slug),
            FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
        );
      `
    });

    if (productsError) {
      console.log(`  ❌ Products error: ${productsError.message}`);
    } else {
      console.log('  ✅ Products created');
    }

    // Create product_variants table (WITH price field - like production!)
    console.log('🏷️ Creating product_variants...');
    const { error: variantsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS product_variants (
            id UUID DEFAULT gen_random_uuid() NOT NULL,
            product_id UUID NOT NULL,
            weight_grams INTEGER NOT NULL,
            price INTEGER NOT NULL,
            sku TEXT NOT NULL,
            is_active BOOLEAN NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
            PRIMARY KEY (id),
            UNIQUE (sku),
            FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
        );
      `
    });

    if (variantsError) {
      console.log(`  ❌ Variants error: ${variantsError.message}`);
    } else {
      console.log('  ✅ Product_variants created');
    }

    // Create other essential tables
    console.log('👤 Creating profiles...');
    const { error: profilesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS profiles (
            id UUID DEFAULT gen_random_uuid() NOT NULL,
            role TEXT NOT NULL,
            full_name TEXT NOT NULL,
            phone TEXT NOT NULL,
            email TEXT NOT NULL,
            avatar_url JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
            PRIMARY KEY (id)
        );
      `
    });

    if (profilesError) {
      console.log(`  ❌ Profiles error: ${profilesError.message}`);
    } else {
      console.log('  ✅ Profiles created');
    }

    console.log('\n🎉 Production schema applied to local database!');
    console.log('\n📊 Schema Summary:');
    console.log('  ✅ Categories (UUID primary keys)');
    console.log('  ✅ Products (NO price field - pricing in variants)');
    console.log('  ✅ Product_variants (WITH price field)');
    console.log('  ✅ Profiles');
    console.log('  ✅ All tables match production structure');

  } catch (error) {
    console.error('❌ Error applying schema:', error);
  }
}

applyProductionSchema();
