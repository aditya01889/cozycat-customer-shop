#!/usr/bin/env node

/**
 * Update Staging Schema from Production
 * Gets exact production schema and updates staging tables
 */

const { createClient } = require('@supabase/supabase-js');

console.log('🔧 Update Staging Schema from Production');
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

async function updateStagingSchema() {
  try {
    console.log('\n📋 Step 1: Get Production Schema');
    console.log('=================================');

    // Get sample data from each table to understand schema
    const tables = ['products', 'profiles', 'orders'];
    const schemaInfo = {};

    for (const tableName of tables) {
      try {
        console.log(`🔍 Analyzing ${tableName}...`);
        
        const { data, error } = await prodSupabase
          .from(tableName)
          .select('*')
          .limit(1);

        if (error) {
          console.log(`❌ Error getting ${tableName}:`, error.message);
          continue;
        }

        if (data && data.length > 0) {
          const columns = Object.keys(data[0]);
          schemaInfo[tableName] = columns;
          console.log(`✅ ${tableName} columns:`, columns.join(', '));
        } else {
          console.log(`⚠️ ${tableName} has no data`);
        }
      } catch (err) {
        console.log(`❌ Exception analyzing ${tableName}:`, err.message);
      }
    }

    console.log('\n📋 Step 2: Generate ALTER TABLE Statements');
    console.log('==========================================');

    const alterStatements = [];

    // Products table - add missing columns
    if (schemaInfo.products) {
      const missingColumns = schemaInfo.products.filter(col => 
        !['id', 'name', 'slug', 'description', 'short_description', 'image_url', 
          'category_id', 'is_active', 'display_order', 'packaging_type', 'label_type',
          'packaging_quantity_per_product', 'label_quantity_per_product', 
          'created_at', 'updated_at'].includes(col)
      );

      missingColumns.forEach(col => {
        if (col === 'ingredients_display') {
          alterStatements.push(`ALTER TABLE products ADD COLUMN ingredients_display TEXT;`);
        } else if (col === 'nutritional_info') {
          alterStatements.push(`ALTER TABLE products ADD COLUMN nutritional_info JSONB;`);
        } else if (col === 'storage_instructions') {
          alterStatements.push(`ALTER TABLE products ADD COLUMN storage_instructions TEXT;`);
        } else if (col === 'allergen_info') {
          alterStatements.push(`ALTER TABLE products ADD COLUMN allergen_info TEXT;`);
        } else {
          alterStatements.push(`ALTER TABLE products ADD COLUMN ${col} TEXT;`);
        }
      });
    }

    // Profiles table - add missing columns
    if (schemaInfo.profiles) {
      const missingColumns = schemaInfo.profiles.filter(col => 
        !['id', 'email', 'full_name', 'phone', 'role', 'is_active', 
          'created_at', 'updated_at'].includes(col)
      );

      missingColumns.forEach(col => {
        if (col === 'avatar_url') {
          alterStatements.push(`ALTER TABLE profiles ADD COLUMN avatar_url TEXT;`);
        } else if (col === 'date_of_birth') {
          alterStatements.push(`ALTER TABLE profiles ADD COLUMN date_of_birth DATE;`);
        } else if (col === 'gender') {
          alterStatements.push(`ALTER TABLE profiles ADD COLUMN gender TEXT;`);
        } else if (col === 'address') {
          alterStatements.push(`ALTER TABLE profiles ADD COLUMN address JSONB;`);
        } else {
          alterStatements.push(`ALTER TABLE profiles ADD COLUMN ${col} TEXT;`);
        }
      });
    }

    // Orders table - add missing columns
    if (schemaInfo.orders) {
      const missingColumns = schemaInfo.orders.filter(col => 
        !['id', 'order_number', 'customer_id', 'status', 'payment_method', 
          'payment_status', 'subtotal', 'delivery_fee', 'total_amount', 
          'delivery_notes', 'created_at', 'updated_at'].includes(col)
      );

      missingColumns.forEach(col => {
        if (col === 'confirmed_date') {
          alterStatements.push(`ALTER TABLE orders ADD COLUMN confirmed_date TIMESTAMP WITH TIME ZONE;`);
        } else if (col === 'delivered_date') {
          alterStatements.push(`ALTER TABLE orders ADD COLUMN delivered_date TIMESTAMP WITH TIME ZONE;`);
        } else if (col === 'cancellation_reason') {
          alterStatements.push(`ALTER TABLE orders ADD COLUMN cancellation_reason TEXT;`);
        } else if (col === 'delivery_address') {
          alterStatements.push(`ALTER TABLE orders ADD COLUMN delivery_address JSONB;`);
        } else if (col === 'customer_notes') {
          alterStatements.push(`ALTER TABLE orders ADD COLUMN customer_notes TEXT;`);
        } else {
          alterStatements.push(`ALTER TABLE orders ADD COLUMN ${col} TEXT;`);
        }
      });
    }

    console.log('\n📋 ALTER TABLE Statements to Execute:');
    console.log('=====================================');
    
    alterStatements.forEach((stmt, index) => {
      console.log(`${index + 1}. ${stmt}`);
    });

    console.log('\n📋 Step 3: Manual Execution Required');
    console.log('===================================');
    console.log('Execute these ALTER TABLE statements in staging Supabase SQL Editor:');
    console.log('https://app.supabase.com/project/pjckafjhzwegtyhlatus/sql');
    console.log('');
    console.log('Copy and paste each ALTER TABLE statement above and execute them.');

    console.log('\n📋 Step 4: After Schema Update');
    console.log('=============================');
    console.log('After executing the ALTER statements, run:');
    console.log('node scripts/database/direct-copy-prod-to-staging.js');

  } catch (error) {
    console.error('❌ Error updating schema:', error);
  }
}

// Run the schema update
if (require.main === module) {
  updateStagingSchema();
}

module.exports = { updateStagingSchema };
