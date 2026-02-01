#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const environment = process.argv[2] || 'local';

console.log(`🔍 Checking ${environment} database status...`);

// Environment configurations
const configs = {
  local: {
    url: 'http://localhost:54321',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24ifQ.6C_wt1x2q_3jIz6a8N2T6d6Z8H7Y9Z0W1V2R3F4G5H6',
    serviceKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSJ9.6C_wt1x2q_3jIz6a8N2T6d6Z8H7Y9Z0W1V2R3F4G5H6'
  },
  staging: {
    url: process.env.STAGING_SUPABASE_URL || 'https://pjckafjhzwegtyhlatus.supabase.co',
    anonKey: process.env.STAGING_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqY2thZmpoendlZ3R5aGxhdHVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2MzA2NzksImV4cCI6MjA4NTIwNjY3OX0.VQ48IDxmrVm9jbGT-EycSK5ofG7sAPKAFeoGy41qgNU',
    serviceKey: process.env.STAGING_SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqY2thZmpoendlZ3R5aGxhdHVzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTYzMDY3OSwiZXhwIjoyMDg1MjA2Njc5fQ.xEMNIrSYO59toaFNaTvxKxf4wFGrckstm8MEP9OxmvM'
  }
};

const config = configs[environment];
if (!config) {
  console.error(`❌ Unknown environment: ${environment}`);
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(config.url, config.serviceKey);

async function checkDatabaseStatus() {
  try {
    console.log(`🔗 Connecting to ${environment} database...`);

    // Test connection
    const { data, error } = await supabase
      .from('categories')
      .select('count')
      .limit(1);

    if (error) {
      if (error.code === 'PGRST116') {
        console.log(`⚠️  Categories table doesn't exist - database needs initialization`);
        console.log('💡 Run: node scripts/seed-database.js ' + environment);
        return { needsSeeding: true, tablesExist: false };
      } else {
        console.error('❌ Database connection error:', error);
        throw error;
      }
    }

    console.log(`✅ Database connection successful`);

    // Check categories
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('id, name, slug');

    if (catError) {
      console.error('❌ Error checking categories:', catError);
      throw catError;
    }

    // Check products
    const { data: products, error: prodError } = await supabase
      .from('products')
      .select('id, name, slug');

    if (prodError) {
      console.error('❌ Error checking products:', prodError);
      throw prodError;
    }

    const categoryCount = categories?.length || 0;
    const productCount = products?.length || 0;

    console.log(`📊 Database Status for ${environment}:`);
    console.log(`   Categories: ${categoryCount}`);
    console.log(`   Products: ${productCount}`);

    if (categoryCount === 0 && productCount === 0) {
      console.log(`⚠️  Database is empty - needs seeding`);
      console.log('💡 Run: node scripts/seed-database.js ' + environment);
      return { needsSeeding: true, tablesExist: true, categoryCount, productCount };
    } else if (categoryCount < 3 || productCount < 3) {
      console.log(`⚠️  Database has incomplete data - consider re-seeding`);
      console.log('💡 Run: node scripts/seed-database.js ' + environment);
      return { needsSeeding: true, tablesExist: true, categoryCount, productCount };
    } else {
      console.log(`✅ Database is properly seeded`);
      return { needsSeeding: false, tablesExist: true, categoryCount, productCount };
    }

  } catch (error) {
    console.error(`❌ Error checking ${environment} database:`, error);
    process.exit(1);
  }
}

// Export for use in other scripts
if (require.main === module) {
  checkDatabaseStatus().then(result => {
    process.exit(result.needsSeeding ? 1 : 0);
  });
}

module.exports = { checkDatabaseStatus };
