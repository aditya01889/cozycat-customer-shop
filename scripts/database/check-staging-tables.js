const { createClient } = require('@supabase/supabase-js');

const stagingSupabase = createClient(
  'https://pjckafjhzwegtyhlatus.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqY2thZmpoendlZ3R5aGxhdHVzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTYzMDY3OSwiZXhwIjoyMDg1MjA2Njc5fQ.xEMNIrSYO59toaFNaTvxKxf4wFGrckstm8MEP9OxmvM'
);

async function checkStagingTables() {
  console.log('🔍 Checking staging tables...');
  
  // Common tables that should exist in an e-commerce app
  const expectedTables = [
    'profiles',
    'products', 
    'orders',
    'categories',
    'cart_items',
    'order_items',
    'payments',
    'customer_addresses',
    'addresses',
    'reviews',
    'settings',
    'inventory',
    'vendors',
    'customers'
  ];
  
  const existingTables = [];
  const missingTables = [];
  
  for (const tableName of expectedTables) {
    try {
      const { data, error } = await stagingSupabase
        .from(tableName)
        .select('*')
        .limit(1);
      
      if (error) {
        missingTables.push(tableName);
        console.log('❌', tableName, ':', error.message);
      } else {
        existingTables.push(tableName);
        console.log('✅', tableName, ': exists');
      }
    } catch (e) {
      missingTables.push(tableName);
      console.log('❌', tableName, ': error accessing');
    }
  }
  
  console.log('\n📊 Summary:');
  console.log('✅ Existing tables:', existingTables.length);
  console.log('❌ Missing tables:', missingTables.length);
  
  if (missingTables.length > 0) {
    console.log('\n❌ Missing tables:', missingTables);
  }
  
  return { existingTables, missingTables };
}

checkStagingTables();
