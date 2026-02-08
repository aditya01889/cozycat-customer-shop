#!/usr/bin/env node

/**
 * Supabase CLI Backup with Correct Connection Strings
 * Uses proper PostgreSQL connection strings for backup and restore
 */

require('dotenv').config({ path: './customer-shop/.env.staging' });
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔄 Supabase CLI Backup & Restore (Correct)');
console.log('==========================================');

async function backupAndRestore() {
  try {
    console.log('\n📋 Step 1: Backup Production Database');
    console.log('=====================================');
    
    // Create backup directory
    const backupDir = path.join(__dirname, '../../backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(backupDir, `prod-backup-${timestamp}.sql`);

    console.log('📦 Backing up production database...');
    
    // Production connection string (need to extract from Supabase project)
    // Format: postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].pooler.supabase.co:5432/postgres
    const prodProjectRef = 'xfnbhheapralprcwjvzl';
    const prodPassword = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmbmJoaGVhcHJhbHByY3dqdnpsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODMxNDUwMywiZXhwIjoyMDgzODkwNTAzfQ.uTt3Q-sahXSAbtC5UPAIRenNYJcGPksSIUOiQtwd6H0';
    
    const prodConnectionString = `postgresql://postgres:${prodPassword}@aws-0-us-east-1.pooler.supabase.co:5432/postgres`;
    
    console.log(`🔧 Production connection: ${prodProjectRef}.pooler.supabase.co`);
    
    try {
      console.log(`🔧 Running: npx supabase db dump --db-url="${prodConnectionString}" --file="${backupFile}"`);
      
      execSync(`npx supabase db dump --db-url="${prodConnectionString}" --file="${backupFile}"`, { 
        stdio: 'inherit',
        cwd: path.join(__dirname, '../..')
      });
      
      console.log(`✅ Production backup saved to: ${backupFile}`);
      
    } catch (backupError) {
      console.log('❌ Backup failed:', backupError.message);
      console.log('🔄 Trying with pg_dump...');
      
      // Alternative: Use pg_dump directly
      try {
        console.log('🔧 Trying pg_dump approach...');
        
        execSync(`pg_dump "${prodConnectionString}" > "${backupFile}"`, { stdio: 'inherit' });
        
        console.log(`✅ pg_dump backup saved to: ${backupFile}`);
      } catch (pgError) {
        console.log('❌ pg_dump also failed');
        console.log('🔧 Manual approach required');
        return;
      }
    }

    console.log('\n📋 Step 2: Clear Staging Database');
    console.log('===============================');
    
    // Clear staging first
    try {
      const stagingProjectRef = 'pjckafjhzwegtyhlatus';
      const stagingPassword = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqY2thZmpoendlZ3R5aGxhdHVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2MzA2NzksImV4cCI6MjA4NTIwNjY3OX0.VQ48IDxmrVm9jbGT-EycSK5ofG7sAPKAFeoGy41qgNU';
      
      const stagingConnectionString = `postgresql://postgres:${stagingPassword}@aws-0-us-east-1.pooler.supabase.co:5432/postgres`;
      
      console.log(`🔧 Clearing staging database: ${stagingProjectRef}.pooler.supabase.co`);
      
      // Drop and recreate staging database
      execSync(`psql "${stagingConnectionString}" -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"`, { 
        stdio: 'inherit'
      });
      
      console.log('✅ Staging database cleared');
      
    } catch (clearError) {
      console.log('❌ Clear staging failed:', clearError.message);
      console.log('🔄 Continuing with restore anyway...');
    }

    console.log('\n📋 Step 3: Restore to Staging');
    console.log('===========================');
    
    // Restore to staging
    try {
      const stagingConnectionString = `postgresql://postgres:eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqY2thZmpoendlZ3R5aGxhdHVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2MzA2NzksImV4cCI6MjA4NTIwNjY3OX0.VQ48IDxmrVm9jbGT-EycSK5ofG7sAPKAFeoGy41qgNU@aws-0-us-east-1.pooler.supabase.co:5432/postgres`;
      
      console.log(`🔧 Restoring to staging: ${backupFile}`);
      
      execSync(`psql "${stagingConnectionString}" < "${backupFile}"`, { 
        stdio: 'inherit'
      });
      
      console.log('✅ Production data restored to staging');
      
    } catch (restoreError) {
      console.log('❌ Restore failed:', restoreError.message);
      console.log('🔄 Trying with supabase db reset...');
      
      try {
        execSync(`npx supabase db reset --db-url="${stagingConnectionString}" --file="${backupFile}"`, { 
          stdio: 'inherit',
          cwd: path.join(__dirname, '../..')
        });
        
        console.log('✅ Alternative restore completed');
      } catch (altError) {
        console.log('❌ Alternative restore failed');
        console.log('🔧 Please restore manually:');
        console.log(`1. psql "${stagingConnectionString}" < "${backupFile}"`);
        return;
      }
    }

    console.log('\n📋 Step 4: Verify Restore');
    console.log('=====================');
    
    // Verify the restore
    const { createClient } = require('@supabase/supabase-js');
    const stagingSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const keyTables = ['categories', 'products', 'product_variants', 'profiles', 'orders'];
    
    for (const tableName of keyTables) {
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

    console.log('\n🎉 Backup and Restore Complete!');
    console.log('================================');
    console.log('✅ Production database backed up');
    console.log('✅ Production data restored to staging');
    console.log('✅ Staging ready for testing');
    
    console.log('\n📋 Next Steps:');
    console.log('===============');
    console.log('1. Run staging verification: node scripts/database/verify-staging-import.js');
    console.log('2. Add staging test data: node scripts/database/add-staging-test-data.js');
    console.log('3. Test staging application: https://cozycatkitchen-staging.vercel.app');

  } catch (error) {
    console.error('❌ Error in backup/restore process:', error);
  }
}

// Run the backup and restore
if (require.main === module) {
  backupAndRestore();
}

module.exports = { backupAndRestore };
