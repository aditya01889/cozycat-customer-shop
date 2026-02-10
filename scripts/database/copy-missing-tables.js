const { createClient } = require('@supabase/supabase-js');

// Production client
const prodSupabase = createClient(
  'https://xfnbhheapralprcwjvzl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmbmJoYGVhcHJhbHByY3dqdmpsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNjQ5NTEwMiwiZXhwIjoyMDUyMDcxMTAyfQ.Qh3kPw6k2y_t5p2HJGD1sA1Vz5Q3G2M4S8Z9JkXmW8'
);

// Staging client
const stagingSupabase = createClient(
  'https://pjckafjhzwegtyhlatus.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqY2thZmpoendlZ3R5aGxhdHVzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTYzMDY3OSwiZXhwIjoyMDg1MjA2Njc5fQ.xEMNIrSYO59toaFNaTvxKxf4wFGrckstm8MEP9OxmvM'
);

async function copyTable(tableName) {
  console.log(`🔄 Copying ${tableName} table...`);
  
  try {
    // Get data from production
    const { data: prodData, error: prodError } = await prodSupabase
      .from(tableName)
      .select('*');
    
    if (prodError) {
      console.error(`❌ Error fetching ${tableName} from production:`, prodError);
      return false;
    }
    
    if (!prodData || prodData.length === 0) {
      console.log(`⚠️  No data found in ${tableName} table`);
      return true;
    }
    
    console.log(`📊 Found ${prodData.length} records in ${tableName}`);
    
    // Insert data into staging
    const { error: stagingError } = await stagingSupabase
      .from(tableName)
      .upsert(prodData);
    
    if (stagingError) {
      console.error(`❌ Error inserting ${tableName} into staging:`, stagingError);
      return false;
    }
    
    console.log(`✅ Successfully copied ${tableName} (${prodData.length} records)`);
    return true;
    
  } catch (error) {
    console.error(`❌ Error copying ${tableName}:`, error);
    return false;
  }
}

async function copyMissingTables() {
  console.log('🚀 Starting to copy missing tables from production to staging...');
  
  const missingTables = ['payments', 'addresses', 'reviews', 'settings'];
  let successCount = 0;
  let errorCount = 0;
  
  for (const table of missingTables) {
    const success = await copyTable(table);
    if (success) {
      successCount++;
    } else {
      errorCount++;
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log(`\n🎉 Copy operation complete!`);
  console.log(`✅ Successfully copied: ${successCount} tables`);
  console.log(`❌ Errors: ${errorCount} tables`);
  
  // Verify the tables exist now
  console.log('\n🔍 Verifying tables in staging...');
  for (const table of missingTables) {
    try {
      const { data, error } = await stagingSupabase
        .from(table)
        .select('count')
        .limit(1);
      
      if (error) {
        console.log('❌', table, ':', error.message);
      } else {
        console.log('✅', table, ': exists');
      }
    } catch (e) {
      console.log('❌', table, ': error accessing');
    }
  }
}

// Run the copy operation
copyMissingTables();
