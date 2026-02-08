#!/usr/bin/env node

/**
 * Import Production Backup to Staging
 * Imports existing production SQL backup into staging database
 */

require('dotenv').config({ path: './customer-shop/.env.staging' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const stagingSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('📥 Import Production Backup to Staging');
console.log('===================================');

async function importProdBackupToStaging() {
  try {
    console.log('📋 Step 1: Reading production backup file...');
    
    const backupFile = path.join(__dirname, '../../database-backup-before-excel-migration.sql');
    
    if (!fs.existsSync(backupFile)) {
      console.log('❌ Production backup file not found:', backupFile);
      console.log('🔍 Looking for alternative backup files...');
      
      // Look for any SQL backup files
      const projectRoot = path.join(__dirname, '../..');
      const sqlFiles = fs.readdirSync(projectRoot)
        .filter(file => file.endsWith('.sql'))
        .filter(file => file.includes('backup') || file.includes('database'));
      
      console.log('📋 Found SQL files:', sqlFiles);
      
      if (sqlFiles.length > 0) {
        console.log(`🔧 Using latest: ${sqlFiles[sqlFiles.length - 1]}`);
        importSqlFile(path.join(projectRoot, sqlFiles[sqlFiles.length - 1]));
      } else {
        console.log('❌ No SQL backup files found');
        return;
      }
    } else {
      console.log('✅ Found production backup:', backupFile);
      await importSqlFile(backupFile);
    }

  } catch (error) {
    console.error('❌ Error importing backup:', error);
  }
}

async function importSqlFile(filePath) {
  try {
    console.log(`📋 Step 2: Reading SQL file: ${path.basename(filePath)}`);
    
    const sqlContent = fs.readFileSync(filePath, 'utf8');
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`✅ Found ${statements.length} SQL statements to execute`);

    console.log('\n📋 Step 3: Executing SQL statements on staging...');
    
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      try {
        console.log(`🔧 Executing statement ${i + 1}/${statements.length}...`);
        
        // Use the Supabase SQL execution
        const { data, error } = await stagingSupabase
          .rpc('exec_sql', { sql_statement: statement });

        if (error) {
          console.log(`❌ Error in statement ${i + 1}:`, error.message);
          errorCount++;
          
          // Try alternative approach for common statements
          if (statement.toLowerCase().includes('create table') || 
              statement.toLowerCase().includes('insert into') ||
              statement.toLowerCase().includes('update')) {
            console.log(`🔄 Trying direct table operation for: ${statement.substring(0, 50)}...`);
            await tryDirectTableOperation(statement);
          }
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
          successCount++;
        }
      } catch (err) {
        console.log(`❌ Exception in statement ${i + 1}:`, err.message);
        errorCount++;
      }
    }

    console.log('\n📊 Import Summary:');
    console.log(`   ✅ Successful statements: ${successCount}`);
    console.log(`   ❌ Failed statements: ${errorCount}`);
    console.log(`   📋 Total statements: ${statements.length}`);

    if (errorCount === 0) {
      console.log('\n🎉 Production backup imported to staging successfully!');
      console.log('\n📋 Next Steps:');
      console.log('1. Verify import: node scripts/database/verify-staging-import.js');
      console.log('2. Add staging test data: node scripts/database/add-staging-test-data.js');
    } else {
      console.log('\n⚠️ Import completed with some errors');
    }

  } catch (error) {
    console.error('❌ Error reading SQL file:', error);
  }
}

async function tryDirectTableOperation(statement) {
  try {
    // This is a fallback for basic operations
    console.log(`🔄 Fallback: ${statement.substring(0, 30)}...`);
    
    // For now, just log that we tried
    console.log('⚠️ Direct table operations need manual execution in Supabase SQL Editor');
    
  } catch (error) {
    console.log('❌ Fallback failed:', error.message);
  }
}

// Run the import process
if (require.main === module) {
  importProdBackupToStaging();
}

module.exports = { importProdBackupToStaging };
