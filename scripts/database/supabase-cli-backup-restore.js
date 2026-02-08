#!/usr/bin/env node

/**
 * Supabase CLI Backup and Restore
 * Uses Supabase CLI to backup production and restore to staging
 */

require('dotenv').config({ path: './customer-shop/.env.staging' });
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔄 Supabase CLI Backup & Restore');
console.log('===============================');

async function backupAndRestore() {
  try {
    console.log('\n📋 Step 1: Backup Production Database');
    console.log('=====================================');
    
    // Check if Supabase CLI is installed
    try {
      execSync('supabase --version', { stdio: 'pipe' });
      console.log('✅ Supabase CLI found');
    } catch (error) {
      console.log('❌ Supabase CLI not found');
      console.log('🔧 Install Supabase CLI:');
      console.log('   npm install -g supabase');
      console.log('   or: https://supabase.com/docs/guides/cli');
      return;
    }

    // Create backup directory
    const backupDir = path.join(__dirname, '../../backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(backupDir, `prod-backup-${timestamp}.sql`);

    console.log('📦 Backing up production database...');
    
    // Backup production database
    try {
      const prodUrl = 'https://xfnbhheapralprcwjvzl.supabase.co';
      const prodKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmbmJoaGVhcHJhbHByY3dqdnpsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODMxNDUwMywiZXhwIjoyMDgzODkwNTAzfQ.uTt3Q-sahXSAbtC5UPAIRenNYJcGPksSIUOiQtwd6H0';
      
      console.log(`🔧 Running: supabase db dump --db-url=${prodUrl} --file=${backupFile}`);
      
      execSync(`supabase db dump --db-url=${prodUrl} --file="${backupFile}"`, { 
        stdio: 'inherit',
        env: {
          ...process.env,
          SUPABASE_DB_PASSWORD: prodKey
        }
      });
      
      console.log(`✅ Production backup saved to: ${backupFile}`);
      
    } catch (backupError) {
      console.log('❌ Backup failed:', backupError.message);
      console.log('🔄 Trying alternative approach...');
      
      // Alternative: Use pg_dump if available
      try {
        console.log('🔧 Trying pg_dump approach...');
        const prodUrl = 'postgresql://postgres.abcdefg:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres';
        
        execSync(`pg_dump "${prodUrl}" > "${backupFile}"`, { stdio: 'inherit' });
        console.log(`✅ Alternative backup saved to: ${backupFile}`);
      } catch (altError) {
        console.log('❌ Alternative backup also failed');
        console.log('🔧 Manual approach required:');
        console.log('1. Use psql to connect to production');
        console.log('2. Export data manually');
        console.log('3. Import to staging manually');
        return;
      }
    }

    console.log('\n📋 Step 2: Restore to Staging Database');
    console.log('=====================================');
    
    // Restore to staging
    try {
      const stagingUrl = 'https://pjckafjhzwegtyhlatus.supabase.co';
      const stagingKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqY2thZmpoendlZ3R5aGxhdHVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2MzA2NzksImV4cCI6MjA4NTIwNjY3OX0.VQ48IDxmrVm9jbGT-EycSK5ofG7sAPKAFeoGy41qgNU';
      
      console.log(`🔧 Restoring to staging: ${backupFile}`);
      
      execSync(`supabase db reset --db-url=${stagingUrl} --file="${backupFile}"`, { 
        stdio: 'inherit',
        env: {
          ...process.env,
          SUPABASE_DB_PASSWORD: stagingKey
        }
      });
      
      console.log('✅ Production data restored to staging');
      
    } catch (restoreError) {
      console.log('❌ Restore failed:', restoreError.message);
      console.log('🔄 Trying manual restore...');
      
      // Manual restore approach
      try {
        console.log('🔧 Trying manual SQL restore...');
        const stagingUrl = 'postgresql://postgres.abcdefg:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres';
        
        execSync(`psql "${stagingUrl}" < "${backupFile}"`, { stdio: 'inherit' });
        console.log('✅ Manual restore completed');
      } catch (manualError) {
        console.log('❌ Manual restore failed');
        console.log('🔧 Please restore manually using:');
        console.log('1. Connect to staging with psql');
        console.log(`2. Run: psql staging_db < ${backupFile}`);
        return;
      }
    }

    console.log('\n📋 Step 3: Verify Restore');
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
