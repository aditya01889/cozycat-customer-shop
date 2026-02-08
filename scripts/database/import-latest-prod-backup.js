#!/usr/bin/env node

/**
 * Import Latest Production Backup to Staging
 * Manual approach to import latest production database backup
 */

require('dotenv').config({ path: './customer-shop/.env.staging' });

console.log('📥 Import Latest Production Backup to Staging');
console.log('==========================================');

console.log('\n📋 MANUAL STEPS REQUIRED:');
console.log('=========================');

console.log('\n1️⃣ GET LATEST PRODUCTION BACKUP:');
console.log('   • Go to: https://app.supabase.com/project/xfnbhheapralprcwjvzl/sql');
console.log('   • Click: "Export" → "Download as SQL"');
console.log('   • Save as: latest-prod-backup.sql');
console.log('   • Place in project root: c:\\Users\\Work\\CascadeProjects\\cozycat-system\\');

console.log('\n2️⃣ IMPORT TO STAGING:');
console.log('   • Go to: https://app.supabase.com/project/pjckafjhzwegtyhlatus/sql');
console.log('   • Click: "Import" → "Upload SQL file"');
console.log('   • Select: latest-prod-backup.sql');
console.log('   • Click: "Import" and wait for completion');

console.log('\n3️⃣ VERIFY IMPORT:');
console.log('   • Run: node scripts/database/verify-staging-import.js');
console.log('   • Check that all tables and data are present');

console.log('\n4️⃣ ADD STAGING TEST DATA:');
console.log('   • Run: node scripts/database/add-staging-test-data.js');
console.log('   • This adds staging-specific users and test data');

console.log('\n🎯 EXPECTED RESULT:');
console.log('==================');
console.log('✅ Staging will have exact same schema as production');
console.log('✅ Staging will have exact same data as production');
console.log('✅ Additional staging test data for testing');
console.log('✅ Ready for staging environment testing');

console.log('\n🔍 CURRENT STAGING STATUS:');
console.log('=========================');

// Check current staging status
const { createClient } = require('@supabase/supabase-js');
const stagingSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkStagingStatus() {
  try {
    const keyTables = ['categories', 'products', 'product_variants', 'profiles', 'orders'];
    
    for (const tableName of keyTables) {
      try {
        const { data, error } = await stagingSupabase
          .from(tableName)
          .select('count')
          .limit(1);

        if (error) {
          console.log(`❌ ${tableName}: Table not found or error`);
        } else {
          const count = data?.[0]?.count || 0;
          console.log(`✅ ${tableName}: ${count} records`);
        }
      } catch (err) {
        console.log(`❌ ${tableName}: Error checking table`);
      }
    }

    console.log('\n📋 NEXT ACTION:');
    console.log('===============');
    console.log('🔄 Please complete the manual steps above to import production data');
    
  } catch (error) {
    console.log('❌ Error checking staging status:', error.message);
  }
}

checkStagingStatus();

module.exports = { checkStagingStatus };
