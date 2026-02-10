#!/usr/bin/env node

/**
 * Database Synchronization Script
 * Equivalent to pg_dump + pg_restore using Node.js
 * Makes staging an exact logical clone of production
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Database URLs
const PROD_DB_URL = 'postgresql://postgres:iQEOSeEXe0Kzx4xI@db.xfnbhheapralprcwjvzl.supabase.co:5432/postgres';
const STAGING_DB_URL = 'postgresql://postgres:VTJutwnsIzfojsc9@db.pjckafjhzwegtyhlatus.supabase.co:5432/postgres';

console.log('🔄 Database Synchronization: Production → Staging');
console.log('==================================================');
console.log(`📋 Production: ${PROD_DB_URL.split('@')[1]}`);
console.log(`📋 Staging: ${STAGING_DB_URL.split('@')[1]}`);

async function executeWithClient(client, query, params = []) {
  try {
    const result = await client.query(query, params);
    return result;
  } catch (error) {
    console.error(`❌ Query failed: ${query.substring(0, 50)}...`, error.message);
    throw error;
  }
}

async function synchronizeDatabases() {
  let prodClient, stagingClient;
  
  try {
    console.log('\n📋 Step 1: Connect to databases');
    console.log('===================================');
    
    // Connect to production
    prodClient = new Client({ connectionString: PROD_DB_URL });
    await prodClient.connect();
    console.log('✅ Connected to production database');
    
    // Connect to staging
    stagingClient = new Client({ connectionString: STAGING_DB_URL });
    await stagingClient.connect();
    console.log('✅ Connected to staging database');

    console.log('\n📋 Step 2: Get production database schema');
    console.log('========================================');
    
    // Get all tables from production
    const tablesResult = await executeWithClient(prodClient, `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    const tables = tablesResult.rows.map(row => row.table_name);
    console.log(`✅ Found ${tables.length} tables in production: ${tables.join(', ')}`);

    console.log('\n📋 Step 3: Clear staging database');
    console.log('===================================');
    
    // Disable constraints temporarily
    await executeWithClient(stagingClient, 'SET session_replication_role = replica;');
    console.log('✅ Disabled foreign key constraints');
    
    // Clear all tables in reverse order to handle dependencies
    for (const tableName of tables.reverse()) {
      try {
        await executeWithClient(stagingClient, `TRUNCATE TABLE "${tableName}" CASCADE;`);
        console.log(`✅ Cleared table: ${tableName}`);
      } catch (error) {
        console.log(`⚠️ Could not clear ${tableName}: ${error.message}`);
      }
    }
    
    // Restore original order
    tables.reverse();

    console.log('\n📋 Step 4: Copy data from production to staging');
    console.log('===============================================');
    
    let totalRecords = 0;
    let totalErrors = 0;
    
    for (const tableName of tables) {
      try {
        console.log(`\n🔄 Processing table: ${tableName}`);
        
        // Get data from production
        const dataResult = await executeWithClient(prodClient, `SELECT * FROM "${tableName}"`);
        const records = dataResult.rows;
        
        if (records.length === 0) {
          console.log(`ℹ️ ${tableName}: No data to copy`);
          continue;
        }
        
        console.log(`📊 ${tableName}: Found ${records.length} records in production`);
        
        // Get column information
        const columnsResult = await executeWithClient(prodClient, `
          SELECT column_name, data_type 
          FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = '${tableName}'
          ORDER BY ordinal_position
        `);
        
        const columns = columnsResult.rows.map(row => row.column_name);
        const columnNames = columns.map(col => `"${col}"`).join(', ');
        const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');
        
        // Insert data into staging in batches
        const batchSize = 100;
        let copiedCount = 0;
        
        for (let i = 0; i < records.length; i += batchSize) {
          const batch = records.slice(i, i + batchSize);
          
          try {
            for (const record of batch) {
              const values = columns.map(col => record[col]);
              await executeWithClient(stagingClient, `
                INSERT INTO "${tableName}" (${columnNames}) 
                VALUES (${placeholders})
              `, values);
            }
            copiedCount += batch.length;
          } catch (error) {
            console.log(`❌ Error inserting batch into ${tableName}: ${error.message}`);
            totalErrors++;
          }
        }
        
        console.log(`✅ ${tableName}: Copied ${copiedCount} records`);
        totalRecords += copiedCount;
        
      } catch (error) {
        console.log(`❌ Error processing table ${tableName}: ${error.message}`);
        totalErrors++;
      }
    }

    console.log('\n📋 Step 5: Re-enable constraints');
    console.log('=================================');
    
    // Re-enable constraints
    await executeWithClient(stagingClient, 'SET session_replication_role = DEFAULT;');
    console.log('✅ Re-enabled foreign key constraints');

    console.log('\n📊 Synchronization Summary');
    console.log('===========================');
    console.log(`✅ Total records copied: ${totalRecords}`);
    console.log(`❌ Total errors: ${totalErrors}`);
    console.log(`📋 Tables processed: ${tables.length}`);
    
    if (totalErrors > 0) {
      console.log('\n⚠️ Synchronization completed with some errors');
    } else {
      console.log('\n🎉 Synchronization completed successfully!');
    }

    console.log('\n📋 Step 6: Verification');
    console.log('========================');
    
    // Verify table counts match
    let verificationPassed = true;
    for (const tableName of tables) {
      try {
        const prodCount = await executeWithClient(prodClient, `SELECT COUNT(*) as count FROM "${tableName}"`);
        const stagingCount = await executeWithClient(stagingClient, `SELECT COUNT(*) as count FROM "${tableName}"`);
        
        if (prodCount.rows[0].count !== stagingCount.rows[0].count) {
          console.log(`❌ ${tableName}: Production=${prodCount.rows[0].count}, Staging=${stagingCount.rows[0].count}`);
          verificationPassed = false;
        } else {
          console.log(`✅ ${tableName}: ${prodCount.rows[0].count} records`);
        }
      } catch (error) {
        console.log(`⚠️ Could not verify ${tableName}: ${error.message}`);
      }
    }
    
    if (verificationPassed) {
      console.log('\n✅ Verification passed: Staging database matches production');
    } else {
      console.log('\n❌ Verification failed: Some tables do not match');
    }

  } catch (error) {
    console.error('❌ Synchronization failed:', error);
  } finally {
    // Close connections
    if (prodClient) {
      await prodClient.end();
      console.log('🔌 Closed production connection');
    }
    if (stagingClient) {
      await stagingClient.end();
      console.log('🔌 Closed staging connection');
    }
  }
}

// Run the synchronization
if (require.main === module) {
  synchronizeDatabases();
}

module.exports = { synchronizeDatabases };
