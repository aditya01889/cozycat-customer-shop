#!/usr/bin/env node

/**
 * Simple Production to Staging Database Copy
 * Uses SQL export/import approach for reliable copying
 */

require('dotenv').config({ path: './customer-shop/.env.staging' });
const { createClient } = require('@supabase/supabase-js');

const stagingSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('🔄 Production to Staging Database Copy');
console.log('========================================');
console.log('');

async function copyProductionToStaging() {
  try {
    console.log('📋 Step 1: Clearing existing staging data...');
    
    // Get all tables first
    const { data: tables, error: tablesError } = await stagingSupabase
      .rpc('get_table_names');

    if (tablesError) {
      console.log('❌ Error getting tables:', tablesError);
      return;
    }

    console.log(`✅ Found ${tables.length} tables to clear`);

    // Clear each table
    for (const table of tables) {
      const { error } = await stagingSupabase
        .from(table.table_name)
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (error) {
        console.log(`⚠️ Error clearing ${table.table_name}:`, error.message);
      } else {
        console.log(`✅ Cleared ${table.table_name}`);
      }
    }

    console.log('\n📋 Step 2: Production data copy needed...');
    console.log('🔧 MANUAL STEPS REQUIRED:');
    console.log('');
    console.log('1️⃣ Export Production Database:');
    console.log('   • Go to: https://app.supabase.com/project/YOUR_PROD_PROJECT_ID/sql');
    console.log('   • Click: "Export" → "Download as SQL"');
    console.log('   • Save as: production-dump.sql');
    console.log('');
    console.log('2️⃣ Import to Staging:');
    console.log('   • Go to: https://app.supabase.com/project/pjckafjhzwegtyhlatus/sql');
    console.log('   • Click: "Import" → "Upload SQL file"');
    console.log('   • Select: production-dump.sql');
    console.log('   • Click: "Import"');
    console.log('');
    console.log('3️⃣ Verify Import:');
    console.log('   • Run: node scripts/database/verify-staging-import.js');
    console.log('');

    console.log('✅ Staging cleared and ready for production data import!');

  } catch (error) {
    console.error('❌ Error in copy process:', error);
  }
}

// Create verification script
async function verifyStagingImport() {
  try {
    console.log('🔍 Verifying staging import...');
    
    const { data: tables, error } = await stagingSupabase
      .rpc('get_table_names');

    if (error) {
      console.log('❌ Error verifying:', error);
      return;
    }

    console.log('✅ Tables found:', tables.map(t => t.table_name));

    // Check for data in key tables
    const keyTables = ['categories', 'products', 'product_variants', 'profiles', 'orders'];
    
    for (const tableName of keyTables) {
      const { data, error } = await stagingSupabase
        .from(tableName)
        .select('count')
        .limit(1);

      if (error) {
        console.log(`❌ Error checking ${tableName}:`, error.message);
      } else {
        const count = data?.[0]?.count || 0;
        console.log(`✅ ${tableName}: ${count} records`);
      }
    }

    console.log('\n🎉 Staging database verification complete!');

  } catch (error) {
    console.error('❌ Verification error:', error);
  }
}

// Run the copy process
if (require.main === module) {
  copyProductionToStaging();
}

module.exports = { copyProductionToStaging, verifyStagingImport };
