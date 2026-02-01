const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.production' });

console.log('🔍 Fetching COMPLETE production database schema...');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.production');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function getCompleteProductionSchema() {
  try {
    console.log('📋 Getting all tables in public schema...');
    
    // Get all tables
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_tables_in_schema', { schema_name: 'public' });

    if (tablesError) {
      console.log('⚠️ RPC not available, trying alternative method...');
      
      // Alternative: Try to query known tables directly
      const knownTables = [
        'categories', 'products', 'product_variants', 'profiles', 
        'orders', 'order_items', 'cart_items', 'addresses', 'reviews',
        'wishlist_items', 'notifications', 'customers'
      ];
      
      const existingTables = [];
      
      for (const tableName of knownTables) {
        try {
          const { count, error } = await supabase
            .from(tableName)
            .select('*', { count: 'exact', head: true });
          
          if (!error) {
            existingTables.push(tableName);
            console.log(`✅ Found table: ${tableName} (${count || 0} rows)`);
          }
        } catch (err) {
          console.log(`❌ Table not found: ${tableName}`);
        }
      }
      
      await analyzeTables(existingTables);
    } else {
      console.log(`✅ Found ${tables?.length || 0} tables`);
      const tableNames = tables?.map(t => t.table_name) || [];
      await analyzeTables(tableNames);
    }

  } catch (error) {
    console.error('❌ Error fetching schema:', error);
  }
}

async function analyzeTables(tableNames) {
  console.log('\n🔍 Analyzing table structures...');
  
  const schemaOutput = [];
  schemaOutput.push('-- =====================================================');
  schemaOutput.push('-- CozyCatKitchen Production Database Schema');
  schemaOutput.push('-- Generated on: ' + new Date().toISOString());
  schemaOutput.push('-- =====================================================\n');

  for (const tableName of tableNames) {
    console.log(`\n📋 Analyzing: ${tableName}`);
    
    try {
      // Get sample data to understand structure
      const { data: sampleData, error: sampleError } = await supabase
        .from(tableName)
        .select('*')
        .limit(3);

      if (sampleError) {
        console.log(`  ❌ Error: ${sampleError.message}`);
        continue;
      }

      if (!sampleData || sampleData.length === 0) {
        console.log(`  ℹ️ Table is empty`);
        schemaOutput.push(`-- Table: ${tableName} (EMPTY)`);
        schemaOutput.push(`-- Could not determine structure - no data available\n`);
        continue;
      }

      // Analyze structure from sample data
      const sample = sampleData[0];
      const columns = Object.keys(sample);
      const columnTypes = {};
      
      columns.forEach(col => {
        const value = sample[col];
        if (value === null) {
          columnTypes[col] = 'unknown (null in sample)';
        } else {
          columnTypes[col] = typeof value;
          if (typeof value === 'string') {
            if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
              columnTypes[col] = 'timestamp';
            } else if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) {
              columnTypes[col] = 'uuid';
            } else if (value.length > 100) {
              columnTypes[col] = 'text (long)';
            } else {
              columnTypes[col] = 'text';
            }
          } else if (typeof value === 'number' && Number.isInteger(value)) {
            columnTypes[col] = 'integer';
          } else if (typeof value === 'number') {
            columnTypes[col] = 'decimal';
          } else if (typeof value === 'object') {
            columnTypes[col] = 'jsonb';
          }
        }
      });

      // Generate CREATE TABLE statement
      schemaOutput.push(`-- Table: ${tableName}`);
      schemaOutput.push(`CREATE TABLE IF NOT EXISTS ${tableName} (`);
      
      const columnDefs = [];
      columns.forEach(col => {
        const type = columnTypes[col];
        let sqlType = 'TEXT';
        
        if (type.includes('uuid')) sqlType = 'UUID';
        else if (type.includes('integer')) sqlType = 'INTEGER';
        else if (type.includes('decimal')) sqlType = 'DECIMAL(10,2)';
        else if (type.includes('timestamp')) sqlType = 'TIMESTAMP WITH TIME ZONE';
        else if (type.includes('jsonb')) sqlType = 'JSONB';
        else if (type.includes('boolean')) sqlType = 'BOOLEAN';
        
        const nullable = sample[col] === null ? '' : ' NOT NULL';
        columnDefs.push(`    ${col} ${sqlType}${nullable}`);
      });
      
      schemaOutput.push(columnDefs.join(',\n'));
      schemaOutput.push(');');
      
      // Add sample data
      schemaOutput.push(`\n-- Sample data for ${tableName}:`);
      schemaOutput.push(`-- ${JSON.stringify(sample, null, 2)}\n`);
      
      console.log(`  ✅ Analyzed ${columns.length} columns`);
      console.log(`  📋 Columns: ${columns.join(', ')}`);
      
      // Show relationships
      const relationshipColumns = columns.filter(col => 
        col.includes('_id') && col !== 'id'
      );
      
      if (relationshipColumns.length > 0) {
        console.log(`  🔗 Potential relationships: ${relationshipColumns.join(', ')}`);
      }

    } catch (err) {
      console.log(`  ❌ Error analyzing ${tableName}: ${err.message}`);
    }
  }

  // Write schema to file
  const fs = require('fs');
  const schemaSQL = schemaOutput.join('\n');
  
  fs.writeFileSync('production-complete-schema.sql', schemaSQL);
  console.log('\n✅ Complete schema written to: production-complete-schema.sql');
  
  // Also create a simplified version for local migration
  await createLocalMigrationScript(tableNames);
}

async function createLocalMigrationScript(tableNames) {
  console.log('\n📝 Creating local migration script...');
  
  const migrationContent = [];
  migrationContent.push('-- =====================================================');
  migrationContent.push('-- Local Migration - Replicate Production Schema');
  migrationContent.push('-- Run this to update local database to match production');
  migrationContent.push('-- =====================================================\n');

  // Drop existing tables if they exist
  for (const tableName of tableNames.reverse()) {
    migrationContent.push(`DROP TABLE IF EXISTS ${tableName} CASCADE;`);
  }
  migrationContent.push('\n');

  // Create tables based on production schema
  for (const tableName of tableNames) {
    try {
      const { data: sampleData, error: sampleError } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);

      if (!sampleError && sampleData && sampleData.length > 0) {
        const sample = sampleData[0];
        const columns = Object.keys(sample);
        
        migrationContent.push(`-- Create ${tableName} table`);
        migrationContent.push(`CREATE TABLE IF NOT EXISTS ${tableName} (`);
        
        const columnDefs = [];
        columns.forEach(col => {
          const value = sample[col];
          let sqlType = 'TEXT';
          let nullable = value === null ? '' : ' NOT NULL';
          
          if (col === 'id' && typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}/i.test(value)) {
            sqlType = 'UUID DEFAULT gen_random_uuid()';
            nullable = ' NOT NULL';
          } else if (col.includes('_id') && typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}/i.test(value)) {
            sqlType = 'UUID';
          } else if (typeof value === 'boolean') {
            sqlType = 'BOOLEAN';
          } else if (typeof value === 'number' && Number.isInteger(value)) {
            sqlType = 'INTEGER';
          } else if (typeof value === 'number') {
            sqlType = 'DECIMAL(10,2)';
          } else if (typeof value === 'object') {
            sqlType = 'JSONB';
          } else if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
            sqlType = 'TIMESTAMP WITH TIME ZONE DEFAULT now()';
            nullable = ' NOT NULL';
          } else if (col.includes('created_at') || col.includes('updated_at')) {
            sqlType = 'TIMESTAMP WITH TIME ZONE DEFAULT now()';
            nullable = ' NOT NULL';
          }
          
          columnDefs.push(`    ${col} ${sqlType}${nullable}`);
        });
        
        migrationContent.push(columnDefs.join(',\n'));
        migrationContent.push(');\n');
      }
    } catch (err) {
      console.log(`  ❌ Could not analyze ${tableName} for migration`);
    }
  }

  // Write migration script
  const fs = require('fs');
  fs.writeFileSync('local-migration-from-prod.sql', migrationContent.join('\n'));
  console.log('✅ Migration script written to: local-migration-from-prod.sql');
}

getCompleteProductionSchema();
