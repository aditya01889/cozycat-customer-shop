const { createClient } = require('@supabase/supabase-js');

// Production client - use service role key for full access
const prodSupabase = createClient(
  'https://xfnbhheapralprcwjvzl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmbmJoYGVhcHJhbHByY3dqdmpsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNjQ5NTEwMiwiZXhwIjoyMDUyMDcxMTAyfQ.Qh3kPw6k2y_t5p2HJGD1sA1Vz5Q3G2M4S8Z9JkXmW8'
);

// Staging client
const stagingSupabase = createClient(
  'https://pjckafjhzwegtyhlatus.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqY2thZmpoendlZ3R5aGxhdHVzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTYzMDY3OSwiZXhwIjoyMDg1MjA2Njc5fQ.xEMNIrSYO59toaFNaTvxKxf4wFGrckstm8MEP9OxmvM'
);

async function getTables(supabase, envName) {
  console.log(`🔍 Getting tables from ${envName}...`);
  
  try {
    const { data, error } = await supabase
      .rpc('get_schema_info');
    
    if (error) {
      console.error(`❌ Error getting ${envName} tables:`, error);
      return [];
    }
    
    console.log(`✅ Found ${data?.length || 0} tables in ${envName}`);
    return data || [];
  } catch (e) {
    console.error(`❌ Exception getting ${envName} tables:`, e);
    return [];
  }
}

async function getTableStructure(supabase, tableName, envName) {
  try {
    const { data, error } = await supabase
      .rpc('get_table_structure', { table_name: tableName });
    
    if (error) {
      console.error(`❌ Error getting ${tableName} structure from ${envName}:`, error);
      return null;
    }
    
    return data;
  } catch (e) {
    console.error(`❌ Exception getting ${tableName} structure from ${envName}:`, e);
    return null;
  }
}

async function compareSchemas() {
  console.log('🚀 Comparing Production vs Staging schemas...');
  
  // Get all tables from both environments
  const prodTables = await getTables(prodSupabase, 'production');
  const stagingTables = await getTables(stagingSupabase, 'staging');
  
  const prodTableNames = prodTables.map(t => t.table_name);
  const stagingTableNames = stagingTables.map(t => t.table_name);
  
  console.log('\n📊 Production tables:', prodTableNames.sort());
  console.log('📊 Staging tables:', stagingTableNames.sort());
  
  // Find missing tables in staging
  const missingTables = prodTableNames.filter(table => !stagingTableNames.includes(table));
  const extraTables = stagingTableNames.filter(table => !prodTableNames.includes(table));
  
  console.log('\n❌ Missing tables in staging:', missingTables);
  console.log('➕ Extra tables in staging:', extraTables);
  
  if (missingTables.length === 0) {
    console.log('\n✅ All production tables exist in staging!');
    return;
  }
  
  // Get detailed structure for missing tables
  console.log('\n🔍 Getting detailed structure for missing tables...');
  
  for (const tableName of missingTables) {
    console.log(`\n📋 Table: ${tableName}`);
    
    const prodStructure = await getTableStructure(prodSupabase, tableName, 'production');
    
    if (prodStructure) {
      console.log('Production structure:');
      prodStructure.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type}${col.is_nullable === 'NO' ? ' NOT NULL' : ''}${col.column_default ? ` DEFAULT ${col.column_default}` : ''}`);
      });
    } else {
      console.log('Could not fetch production structure');
    }
  }
}

// Alternative approach if RPC functions don't exist
async function compareSchemasBasic() {
  console.log('🚀 Basic schema comparison (using information_schema)...');
  
  // Query information_schema for both environments
  const prodQuery = `
    SELECT table_name, column_name, data_type, is_nullable, column_default
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
    ORDER BY table_name, ordinal_position
  `;
  
  try {
    console.log('🔍 Getting production schema...');
    const { data: prodData, error: prodError } = await prodSupabase
      .rpc('exec_sql', { sql: prodQuery });
    
    if (prodError) {
      console.error('❌ Production query error:', prodError);
      return;
    }
    
    console.log('🔍 Getting staging schema...');
    const { data: stagingData, error: stagingError } = await stagingSupabase
      .rpc('exec_sql', { sql: prodQuery });
    
    if (stagingError) {
      console.error('❌ Staging query error:', stagingError);
      return;
    }
    
    // Process results
    const prodTables = {};
    const stagingTables = {};
    
    prodData?.forEach(row => {
      if (!prodTables[row.table_name]) {
        prodTables[row.table_name] = [];
      }
      prodTables[row.table_name].push(row);
    });
    
    stagingData?.forEach(row => {
      if (!stagingTables[row.table_name]) {
        stagingTables[row.table_name] = [];
      }
      stagingTables[row.table_name].push(row);
    });
    
    const prodTableNames = Object.keys(prodTables);
    const stagingTableNames = Object.keys(stagingTables);
    
    console.log('\n📊 Production tables:', prodTableNames.sort());
    console.log('📊 Staging tables:', stagingTableNames.sort());
    
    const missingTables = prodTableNames.filter(table => !stagingTableNames.includes(table));
    
    console.log('\n❌ Missing tables in staging:', missingTables);
    
    // Show structure for missing tables
    for (const tableName of missingTables) {
      console.log(`\n📋 Table: ${tableName}`);
      console.log('Production structure:');
      prodTables[tableName].forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type}${col.is_nullable === 'NO' ? ' NOT NULL' : ''}${col.column_default ? ` DEFAULT ${col.column_default}` : ''}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Schema comparison error:', error);
  }
}

// Try the detailed approach first, fallback to basic
compareSchemas().catch(() => {
  console.log('⚠️  Detailed approach failed, trying basic comparison...');
  compareSchemasBasic();
});
