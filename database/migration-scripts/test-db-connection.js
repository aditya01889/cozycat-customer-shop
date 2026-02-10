#!/usr/bin/env node

/**
 * Test database connections and get actual connection strings
 */

const { createClient } = require('@supabase/supabase-js');

console.log('🔍 Testing Database Connections');
console.log('================================');

// Production client
const prodClient = createClient(
  'https://xfnbhheapralprcwjvzl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmbmJoaGVhcHJhbHByY3dqdnpsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODMxNDUwMywiZXhwIjoyMDgzODkwNTAzfQ.uTt3Q-sahXSAbtC5UPAIRenNYJcGPksSIUOiQtwd6H0'
);

// Staging client  
const stagingClient = createClient(
  'https://pjckafjhzwegtyhlatus.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqY2thZmpoendlZ3R5aGxhdHVzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTYzMDY3OSwiZXhwIjoyMDg1MjA2Njc5fQ.xEMNIrSYO59toaFNaTvxKxf4wFGrckstm8MEP9OxmvM'
);

async function testConnections() {
  try {
    console.log('\n📋 Testing Production Connection');
    console.log('==================================');
    
    const { data: prodData, error: prodError } = await prodClient
      .from('categories')
      .select('count');
    
    if (prodError) {
      console.log('❌ Production connection failed:', prodError.message);
    } else {
      console.log('✅ Production connected successfully');
      console.log(`📊 Categories count: ${prodData[0].count}`);
    }

    console.log('\n📋 Testing Staging Connection');
    console.log('=================================');
    
    const { data: stagingData, error: stagingError } = await stagingClient
      .from('categories')
      .select('count');
    
    if (stagingError) {
      console.log('❌ Staging connection failed:', stagingError.message);
    } else {
      console.log('✅ Staging connected successfully');
      console.log(`📊 Categories count: ${stagingData[0].count}`);
    }

    console.log('\n📋 Getting Table Lists');
    console.log('=======================');

    // Get production tables
    const { data: prodTables, error: prodTablesError } = await prodClient
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_type', 'BASE TABLE');
    
    if (prodTablesError) {
      console.log('❌ Error getting production tables:', prodTablesError.message);
    } else {
      console.log(`✅ Production tables: ${prodTables.length} tables`);
      console.log(`📋 ${prodTables.map(t => t.table_name).join(', ')}`);
    }

    // Get staging tables
    const { data: stagingTables, error: stagingTablesError } = await stagingClient
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_type', 'BASE TABLE');
    
    if (stagingTablesError) {
      console.log('❌ Error getting staging tables:', stagingTablesError.message);
    } else {
      console.log(`✅ Staging tables: ${stagingTables.length} tables`);
      console.log(`📋 ${stagingTables.map(t => t.table_name).join(', ')}`);
    }

  } catch (error) {
    console.error('❌ Connection test failed:', error);
  }
}

testConnections();
