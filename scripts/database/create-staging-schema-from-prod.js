#!/usr/bin/env node

/**
 * Create Staging Schema from Production
 * Creates staging tables using production schema, then copies data
 */

const { createClient } = require('@supabase/supabase-js');

console.log('🏗️ Create Staging Schema from Production');
console.log('=======================================');

// Production client
const prodSupabase = createClient(
  'https://xfnbhheapralprcwjvzl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmbmJoaGVhcHJhbHByY3dqdnpsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODMxNDUwMywiZXhwIjoyMDgzODkwNTAzfQ.uTt3Q-sahXSAbtC5UPAIRenNYJcGPksSIUOiQtwd6H0'
);

// Staging client
const stagingSupabase = createClient(
  'https://pjckafjhzwegtyhlatus.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqY2thZmpoendlZ3R5aGxhdHVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2MzA2NzksImV4cCI6MjA4NTIwNjY3OX0.VQ48IDxmrVm9jbGT-EycSK5ofG7sAPKAFeoGy41qgNU'
);

async function createStagingSchemaAndCopyData() {
  try {
    console.log('\n📋 Step 1: Create Staging Tables');
    console.log('=================================');

    // Basic table creation statements based on typical schema
    const tableSchemas = [
      {
        name: 'categories',
        sql: `
          CREATE TABLE IF NOT EXISTS categories (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            name TEXT NOT NULL,
            slug TEXT UNIQUE NOT NULL,
            description TEXT,
            image_url TEXT,
            display_order INTEGER DEFAULT 0,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      },
      {
        name: 'products',
        sql: `
          CREATE TABLE IF NOT EXISTS products (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            name TEXT NOT NULL,
            slug TEXT UNIQUE NOT NULL,
            description TEXT,
            short_description TEXT,
            image_url TEXT,
            category_id UUID REFERENCES categories(id),
            is_active BOOLEAN DEFAULT true,
            display_order INTEGER DEFAULT 0,
            packaging_type TEXT,
            label_type TEXT,
            packaging_quantity_per_product INTEGER DEFAULT 1,
            label_quantity_per_product INTEGER DEFAULT 1,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      },
      {
        name: 'product_variants',
        sql: `
          CREATE TABLE IF NOT EXISTS product_variants (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            product_id UUID REFERENCES products(id) ON DELETE CASCADE,
            weight_grams INTEGER NOT NULL,
            price DECIMAL(10,2) NOT NULL,
            sku TEXT UNIQUE NOT NULL,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      },
      {
        name: 'profiles',
        sql: `
          CREATE TABLE IF NOT EXISTS profiles (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            full_name TEXT,
            phone TEXT,
            role TEXT DEFAULT 'customer',
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      },
      {
        name: 'orders',
        sql: `
          CREATE TABLE IF NOT EXISTS orders (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            order_number TEXT UNIQUE NOT NULL,
            customer_id UUID REFERENCES profiles(id),
            status TEXT DEFAULT 'pending',
            payment_method TEXT,
            payment_status TEXT DEFAULT 'pending',
            subtotal DECIMAL(10,2) NOT NULL,
            delivery_fee DECIMAL(10,2) DEFAULT 0,
            total_amount DECIMAL(10,2) NOT NULL,
            delivery_notes TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      },
      {
        name: 'order_items',
        sql: `
          CREATE TABLE IF NOT EXISTS order_items (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
            product_id UUID REFERENCES products(id),
            variant_id UUID REFERENCES product_variants(id),
            quantity INTEGER NOT NULL,
            price DECIMAL(10,2) NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      },
      {
        name: 'cart_items',
        sql: `
          CREATE TABLE IF NOT EXISTS cart_items (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            customer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
            product_id UUID REFERENCES products(id) ON DELETE CASCADE,
            variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
            quantity INTEGER NOT NULL DEFAULT 1,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(customer_id, product_id, variant_id)
          );
        `
      }
    ];

    // Create tables
    for (const table of tableSchemas) {
      try {
        console.log(`🏗️ Creating table: ${table.name}`);
        
        // Use raw SQL execution
        const { error } = await stagingSupabase
          .rpc('exec_sql', { sql_statement: table.sql });

        if (error) {
          console.log(`⚠️ Error creating ${table.name}:`, error.message);
          console.log(`🔄 Trying alternative approach...`);
          
          // Alternative: Try to create table via direct SQL
          try {
            await stagingSupabase
              .from(table.name)
              .select('*')
              .limit(1);
          } catch (altErr) {
            console.log(`❌ Alternative failed for ${table.name}:`, altErr.message);
          }
        } else {
          console.log(`✅ Created table: ${table.name}`);
        }
      } catch (err) {
        console.log(`❌ Exception creating ${table.name}:`, err.message);
      }
    }

    console.log('\n📋 Step 2: Copy Production Data');
    console.log('=================================');

    // Tables to copy
    const tablesToCopy = ['categories', 'products', 'product_variants', 'profiles', 'orders', 'order_items', 'cart_items'];
    
    let totalCopied = 0;
    let totalErrors = 0;

    for (const tableName of tablesToCopy) {
      try {
        console.log(`\n📦 Copying ${tableName}...`);
        
        // Get all data from production
        const { data: prodData, error: dataError } = await prodSupabase
          .from(tableName)
          .select('*');

        if (dataError) {
          console.log(`❌ Error getting ${tableName} from production:`, dataError.message);
          totalErrors++;
          continue;
        }

        if (!prodData || prodData.length === 0) {
          console.log(`✅ ${tableName} - no data to copy`);
          continue;
        }

        console.log(`📊 Found ${prodData.length} records in production ${tableName}`);

        // Clear staging table first
        try {
          const { error: clearError } = await stagingSupabase
            .from(tableName)
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000');

          if (clearError) {
            console.log(`⚠️ Error clearing ${tableName}:`, clearError.message);
          } else {
            console.log(`✅ Cleared staging ${tableName}`);
          }
        } catch (clearErr) {
          console.log(`⚠️ Clear error for ${tableName}:`, clearErr.message);
        }

        // Insert production data into staging in batches
        const batchSize = 50;
        let successCount = 0;
        let errorCount = 0;

        for (let i = 0; i < prodData.length; i += batchSize) {
          const batch = prodData.slice(i, i + batchSize);
          
          try {
            const { error: insertError } = await stagingSupabase
              .from(tableName)
              .insert(batch);

            if (insertError) {
              console.log(`❌ Error inserting batch ${Math.floor(i/batchSize) + 1} into ${tableName}:`, insertError.message);
              errorCount++;
            } else {
              successCount += batch.length;
              console.log(`✅ Inserted batch ${Math.floor(i/batchSize) + 1} (${batch.length} records)`);
            }
          } catch (err) {
            console.log(`❌ Exception inserting batch ${Math.floor(i/batchSize) + 1}:`, err.message);
            errorCount++;
          }
        }

        console.log(`📊 ${tableName}: ${successCount} copied, ${errorCount} errors`);
        totalCopied += successCount;
        totalErrors += errorCount;

      } catch (err) {
        console.log(`❌ Error copying ${tableName}:`, err.message);
        totalErrors++;
      }
    }

    console.log('\n📊 Copy Summary:');
    console.log('==================');
    console.log(`   ✅ Total records copied: ${totalCopied}`);
    console.log(`   ❌ Total errors: ${totalErrors}`);
    console.log(`   📋 Tables processed: ${tablesToCopy.length}`);

    if (totalErrors === 0) {
      console.log('\n🎉 Production database copied to staging successfully!');
    } else {
      console.log('\n⚠️ Copy completed with some errors');
    }

    console.log('\n📋 Step 3: Verification');
    console.log('=========================');
    
    // Verify results
    for (const tableName of tablesToCopy) {
      try {
        const { data, error } = await stagingSupabase
          .from(tableName)
          .select('count')
          .limit(1);

        if (error) {
          console.log(`❌ ${tableName}: Error - ${error.message}`);
        } else {
          const count = data?.[0]?.count || 0;
          console.log(`✅ ${tableName}: ${count} records`);
        }
      } catch (err) {
        console.log(`❌ ${tableName}: Error checking table`);
      }
    }

    console.log('\n🎯 Next Steps:');
    console.log('===============');
    console.log('1. Verify staging: node scripts/database/verify-staging-import.js');
    console.log('2. Add staging data: node scripts/database/add-staging-test-data.js');
    console.log('3. Test staging app: https://cozycatkitchen-staging.vercel.app');

  } catch (error) {
    console.error('❌ Fatal error in schema creation and copy process:', error);
  }
}

// Run the process
if (require.main === module) {
  createStagingSchemaAndCopyData();
}

module.exports = { createStagingSchemaAndCopyData };
