#!/usr/bin/env node

/**
 * Direct Production to Staging Copy
 * Uses hardcoded production credentials for reliable copying
 */

const { createClient } = require('@supabase/supabase-js');

// Production credentials (hardcoded for reliability)
const prodSupabase = createClient(
  'https://xfnbhheapralprcwjvzl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmbmJoaGVhcHJhbHByY3dqdnpsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODMxNDUwMywiZXhwIjoyMDgzODkwNTAzfQ.uTt3Q-sahXSAbtC5UPAIRenNYJcGPksSIUOiQtwd6H0'
);

// Staging client
const stagingSupabase = createClient(
  'https://pjckafjhzwegtyhlatus.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqY2thZmpoendlZ3R5aGxhdHVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2MzA2NzksImV4cCI6MjA4NTIwNjY3OX0.VQ48IDxmrVm9jbGT-EycSK5ofG7sAPKAFeoGy41qgNU'
);

console.log('🔄 Direct Production to Staging Database Copy');
console.log('==============================================');

async function copyProductionToStaging() {
  try {
    console.log('📋 Step 1: Getting production tables...');
    
    // Get table names from production
    const { data: prodTables, error: tablesError } = await prodSupabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_type', 'BASE TABLE');

    if (tablesError) {
      console.log('❌ Error getting production tables:', tablesError);
      return;
    }

    console.log(`✅ Found ${prodTables.length} tables in production`);

    // Filter out system tables
    const tablesToCopy = prodTables
      .filter(table => !table.table_name.startsWith('_') && 
                        !table.table_name.includes('migration') &&
                        !table.table_name.includes('schema'))
      .map(table => table.table_name);

    console.log(`📋 Tables to copy: ${tablesToCopy.join(', ')}`);

    console.log('\n📋 Step 2: Copying data from production to staging...');
    
    let totalCopied = 0;
    let totalErrors = 0;

    // Copy each table
    for (const tableName of tablesToCopy) {
      try {
        console.log(`📦 Copying ${tableName}...`);
        
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

        // Clear staging table first
        const { error: clearError } = await stagingSupabase
          .from(tableName)
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000');

        if (clearError) {
          console.log(`⚠️ Error clearing ${tableName} in staging:`, clearError.message);
        }

        // Insert production data into staging
        const { error: insertError } = await stagingSupabase
          .from(tableName)
          .insert(prodData);

        if (insertError) {
          console.log(`❌ Error inserting ${tableName} into staging:`, insertError.message);
          totalErrors++;
        } else {
          console.log(`✅ Copied ${prodData.length} records to ${tableName}`);
          totalCopied += prodData.length;
        }

      } catch (err) {
        console.log(`❌ Error copying ${tableName}:`, err.message);
        totalErrors++;
      }
    }

    console.log('\n📊 Copy Summary:');
    console.log(`   ✅ Total records copied: ${totalCopied}`);
    console.log(`   ❌ Total errors: ${totalErrors}`);
    console.log(`   📋 Tables processed: ${tablesToCopy.length}`);

    if (totalErrors === 0) {
      console.log('\n🎉 Production database copied to staging successfully!');
    } else {
      console.log('\n⚠️ Copy completed with some errors');
    }

  } catch (error) {
    console.error('❌ Fatal error in copy process:', error);
  }
}

// Run the copy process
if (require.main === module) {
  copyProductionToStaging();
}

module.exports = { copyProductionToStaging };
