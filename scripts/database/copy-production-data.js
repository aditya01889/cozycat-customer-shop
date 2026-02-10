const { createClient } = require('@supabase/supabase-js');

// Production client (if keys are available)
const productionSupabase = createClient(
  'https://xfnbhheapralprcwjvzl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmbmJoaGVhcHJhbHByY3dqdnpsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODMxNDUwMywiZXhwIjoyMDgzODkwNTAzfQ.uTt3Q-sahXSAbtC5UPAIRenNYJcGPksSIUOiQtwd6H0'
);

// Staging client (using service role key for write operations)
const stagingSupabase = createClient(
  'https://pjckafjhzwegtyhlatus.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqY2thfjhzwegtyhlatusIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTYzMDY3OSwiZXhwIjoyMDg1MjY3OTl9fQ.xEMNIrSYO59toaWV0zODUyMDY3Njc5fQ.xEMNIrSYO59toaWV0zODUyMDY3Njc5fQ'
);

async function copyProductionData() {
  console.log('🔄 Copying production data to staging...');
  
  console.log('⚠️  Note: You need to update production URL and service key in this script');
  
  try {
    // Tables to copy (exact production data)
    const tablesToCopy = [
      'ingredients',
      'product_recipes', 
      'products',
      'product_variants',
      'order_items',
      'production_batches',
      'deliveries',
      'delivery_partners',
      'orders'
    ];

    for (const tableName of tablesToCopy) {
      console.log(`📋 Copying ${tableName}...`);
      
      try {
        // Get production data
        const { data: productionData, error: fetchError } = await productionSupabase
          .from(tableName)
          .select('*');
          
        if (fetchError) {
          console.error(`❌ Error fetching ${tableName} from production:`, fetchError);
          continue;
        }
        
        if (!productionData || productionData.length === 0) {
          console.log(`⚠️  No data found in ${tableName} in production`);
          continue;
        }
        
        console.log(`📊 Found ${productionData.length} records in ${tableName}`);
        
        // Clear staging table first
        const { error: deleteError } = await stagingSupabase
          .from(tableName)
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000'); // Don't delete sample records
          
        if (deleteError) {
          console.error(`❌ Error clearing ${tableName} in staging:`, deleteError);
        }
        
        // Insert production data into staging
        const { error: insertError } = await stagingSupabase
          .from(tableName)
          .upsert(productionData, { onConflict: 'id' });
          
        if (insertError) {
          console.error(`❌ Error inserting ${tableName} into staging:`, insertError);
        } else {
          console.log(`✅ Successfully copied ${productionData.length} records to ${tableName}`);
        }
        
      } catch (error) {
        console.error(`❌ Error processing ${tableName}:`, error);
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('🎉 Production data copy completed!');
    
  } catch (error) {
    console.error('❌ Fatal error during copy:', error);
  }
}

// Alternative: Manual SQL generation
function generateSQLForDataCopy() {
  console.log('📝 Generating SQL for manual data copy...');
  
  const tablesToGenerate = [
    {
      name: 'ingredients',
      sampleSQL: `
-- Insert production ingredients data
INSERT INTO public.ingredients (id, name, unit, current_stock, reorder_level, unit_cost, created_at, updated_at, supplier) VALUES
-- TODO: Add actual production data here
-- Format: ('uuid', 'name', 'unit', stock_value, reorder_value, cost_value, timestamp, timestamp, 'supplier_uuid')
`
    },
    {
      name: 'product_recipes',
      sampleSQL: `
-- Insert production product_recipes data
INSERT INTO public.product_recipes (id, product_id, ingredient_id, percentage, created_at) VALUES
-- TODO: Add actual production data here
-- Format: ('uuid', 'product_uuid', 'ingredient_uuid', percentage_value, timestamp)
`
    }
    // Add more tables as needed
  ];
  
  tablesToGenerate.forEach(table => {
    console.log(`\n-- ===== ${table.name.toUpperCase()} =====`);
    console.log(table.sampleSQL);
  });
}

// Run the main function
if (process.argv.includes('--generate-sql')) {
  generateSQLForDataCopy();
} else {
  copyProductionData();
}
