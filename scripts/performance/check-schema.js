#!/usr/bin/env node

// Set production DATABASE_URL
process.env.DATABASE_URL = 'postgresql://postgres:xfnbhheapralprcwjvzl@aws-0-us-west-1.pooler.supabase.com:6543/postgres';
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://xfnbhheapralprcwjvzl.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmbmJoaGVhcHJhbHByY3dqdnpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzMTQ1MDMsImV4cCI6MjA4Mzg5MDUwM30.EV2hQ3uyjpOW29KaiDNqASzAucvyvqojsQcplXGaQXE';

const { createClient } = require('@supabase/supabase-js');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  const timestamp = new Date().toISOString();
  console.log(`${colors[color]}[${timestamp}] ${message}${colors.reset}`);
}

async function checkDatabaseSchema() {
  log('🔍 Checking Database Schema', 'blue');
  log('===========================', 'blue');
  
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    // Check what tables actually exist
    const { data: tables, error } = await supabase
      .from('information_schema.tables')
      .select('table_name, table_schema')
      .eq('table_schema', 'public')
      .eq('table_type', 'BASE TABLE');
    
    if (error) {
      log(`❌ Error checking schema: ${error.message}`, 'red');
      return false;
    }
    
    log('📊 Tables found in public schema:', 'cyan');
    tables.forEach(table => {
      log(`   - ${table.table_name}`, 'blue');
    });
    
    // Check specific tables we expect
    const expectedTables = ['users', 'orders', 'cart_items', 'products', 'product_variants', 'categories'];
    const missingTables = expectedTables.filter(table => 
      !tables.some(t => t.table_name === table.name)
    );
    
    if (missingTables.length > 0) {
      log('⚠️ Missing expected tables:', 'yellow');
      missingTables.forEach(table => {
        log(`   - ${table}`, 'red');
      });
    } else {
      log('✅ All expected tables found', 'green');
    }
    
    // Check columns in orders table
    if (tables.some(t => t.table_name === 'orders')) {
      log('📋 Checking orders table columns...', 'cyan');
      
      const { data: columns, error: columnsError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type')
        .eq('table_name', 'orders')
        .eq('table_schema', 'public');
      
      if (columnsError) {
        log(`❌ Error checking orders columns: ${columnsError.message}`, 'red');
      } else {
        const columnNames = columns.map(c => c.column_name);
        log('📊 Orders table columns:', 'blue');
        columnNames.forEach(col => {
          log(`   - ${col}`, 'cyan');
        });
        
        if (columnNames.includes('user_id')) {
          log('✅ orders.user_id column exists', 'green');
        } else {
          log('❌ orders.user_id column MISSING', 'red');
        }
      }
    }
    
    // Check columns in cart_items table
    if (tables.some(t => t.table_name === 'cart_items')) {
      log('📋 Checking cart_items table columns...', 'cyan');
      
      const { data: cartColumns, error: cartColumnsError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type')
        .eq('table_name', 'cart_items')
        .eq('table_schema', 'public');
      
      if (cartColumnsError) {
        log(`❌ Error checking cart_items columns: ${cartColumnsError.message}`, 'red');
      } else {
        const cartColumnNames = cartColumns.map(c => c.column_name);
        log('📊 Cart_items table columns:', 'blue');
        cartColumnNames.forEach(col => {
          log(`   - ${col}`, 'cyan');
        });
        
        if (cartColumnNames.includes('user_id')) {
          log('✅ cart_items.user_id column exists', 'green');
        } else {
          log('❌ cart_items.user_id column MISSING', 'red');
        }
      }
    }
    
    return true;
    
  } catch (error) {
    log(`💥 Schema check failed: ${error.message}`, 'red');
    return false;
  }
}

async function main() {
  const command = process.argv[2] || 'run';
  
  log('🔍 Database Schema Check Tool', 'blue');
  log('=============================', 'blue');
  
  switch (command) {
    case 'run':
    case 'check':
      log('🚀 Running database schema check...', 'blue');
      log('', 'reset');
      
      const success = await checkDatabaseSchema();
      
      if (success) {
        log('', 'reset');
        log('🎉 SCHEMA CHECK COMPLETED!', 'green');
        log('==========================', 'green');
        log('📋 Summary:', 'cyan');
        log('   Database connection: Working', 'blue');
        log('   Schema validation: Completed', 'blue');
      } else {
        log('❌ Schema check failed', 'red');
      }
      
      break;
      
    default:
      log('📖 Usage:', 'blue');
      log('  node check-schema.js run  - Check database schema', 'cyan');
      break;
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  checkDatabaseSchema
};
