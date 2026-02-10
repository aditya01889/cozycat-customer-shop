const { createClient } = require('@supabase/supabase-js');

// Production client - using anon key for basic schema access
const prodSupabase = createClient(
  'https://xfnbhheapralprcwjvzl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmbmJoYGVhcHJhbHByY3dqdmpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY0OTUxMDIsImV4cCI6MjA1MjA3MTEwMn0.K_tLgZ0vL1yK8gYnBFJ2K7c9sJr2z3Q4R5m6P7s8t9o'
);

// Staging client
const stagingSupabase = createClient(
  'https://pjckafjhzwegtyhlatus.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqY2thZmpoendlZ3R5aGxhdHVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2MzA2NzksImV4cCI6MjA4NTIwNjY3OX0.Y3Z4bX7k8W9m2P6sR5t8L7v9Q3n8J4m6K1p5X9z2W7'
);

async function getSchemaInfo(supabase, envName) {
  console.log(`🔍 Getting schema info from ${envName}...`);
  
  try {
    // Use a simpler approach - query information_schema directly
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_type', 'BASE TABLE');
    
    if (error) {
      console.error(`❌ Error getting ${envName} tables:`, error);
      return [];
    }
    
    const tableNames = data?.map(t => t.table_name) || [];
    console.log(`✅ Found ${tableNames.length} tables in ${envName}`);
    return tableNames;
  } catch (e) {
    console.error(`❌ Exception getting ${envName} schema:`, e);
    return [];
  }
}

async function getTableColumns(supabase, tableName, envName) {
  try {
    const { data, error } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default, ordinal_position')
      .eq('table_schema', 'public')
      .eq('table_name', tableName)
      .order('ordinal_position');
    
    if (error) {
      console.error(`❌ Error getting columns for ${tableName} from ${envName}:`, error);
      return [];
    }
    
    return data || [];
  } catch (e) {
    console.error(`❌ Exception getting columns for ${tableName} from ${envName}:`, e);
    return [];
  }
}

async function compareSchemas() {
  console.log('🚀 Comparing Production vs Staging schemas...');
  
  // Get all tables from both environments
  const prodTables = await getSchemaInfo(prodSupabase, 'production');
  const stagingTables = await getSchemaInfo(stagingSupabase, 'staging');
  
  console.log('\n📊 Production tables:', prodTables.sort());
  console.log('📊 Staging tables:', stagingTables.sort());
  
  // Find missing tables in staging
  const missingTables = prodTables.filter(table => !stagingTables.includes(table));
  const extraTables = stagingTables.filter(table => !prodTables.includes(table));
  
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
    
    const prodColumns = await getTableColumns(prodSupabase, tableName, 'production');
    
    if (prodColumns.length > 0) {
      console.log('Production structure:');
      prodColumns.forEach(col => {
        console.log(`  ${col.ordinal_position}. ${col.column_name}: ${col.data_type}${col.is_nullable === 'NO' ? ' NOT NULL' : ''}${col.column_default ? ` DEFAULT ${col.column_default}` : ''}`);
      });
    } else {
      console.log('Could not fetch production structure');
    }
  }
}

// Run the comparison
compareSchemas();
