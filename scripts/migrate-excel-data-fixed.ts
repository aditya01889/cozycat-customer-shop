import * as XLSX from 'xlsx';
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase credentials in environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface ExcelRecipe {
  'Recipe Link ID': string;
  'Product': string;
  'Ingredient': string;
  'Percentage': number;
}

interface ExcelIngredient {
  'Ingredient': string;
  'Current Stock': string;
}

interface ExcelPackaging {
  'Used by Products': string;
  'Packaging': string;
  'Current Stock': number;
  'Labels': string;
  'Current Stock_1': number;
}

// Helper function to parse stock value and extract unit
function parseStockValue(stockStr: string): { quantity: number; unit: string } {
  const trimmed = stockStr.trim();
  
  // Handle different formats: "1000 g", "250g", "10 pieces", etc.
  const match = trimmed.match(/^(\d+(?:\.\d+)?)\s*([a-zA-Z]+)$/);
  
  if (match) {
    return {
      quantity: parseFloat(match[1]),
      unit: match[2]
    };
  }
  
  // Default fallback
  return {
    quantity: parseFloat(trimmed) || 0,
    unit: 'grams'
  };
}

async function migrateExcelData() {
  try {
    console.log('🚀 Starting Excel data migration...');

    // Read Excel file
    const workbook = XLSX.readFile('../CCK Recipes.xlsx');
    
    // Get Recipes sheet
    const recipesSheet = workbook.Sheets['Recipes'];
    const recipesData = XLSX.utils.sheet_to_json<ExcelRecipe>(recipesSheet);
    
    // Get Ingredients sheet
    const ingredientsSheet = workbook.Sheets['Ingredients'];
    const ingredientsData = XLSX.utils.sheet_to_json<ExcelIngredient>(ingredientsSheet);
    
    // Get Packaging sheet
    const packagingSheet = workbook.Sheets['Packaging'];
    const packagingData = XLSX.utils.sheet_to_json<ExcelPackaging>(packagingSheet);

    console.log(`📊 Found ${recipesData.length} recipes, ${ingredientsData.length} ingredients, ${packagingData.length} packaging items`);

    // Step 1: Clear existing data
    console.log('🗑️  Clearing existing data...');
    
    // Clear in correct order to respect foreign key constraints
    await supabase.from('product_recipes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('stock_transactions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('ingredients').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // Step 2: Migrate Ingredients
    console.log('🥘 Migrating ingredients...');
    const ingredientMap = new Map<string, string>();
    
    for (const ingredient of ingredientsData) {
      // Skip if ingredient name is empty or undefined
      if (!ingredient['Ingredient'] || ingredient['Ingredient'].trim() === '') {
        console.warn(`⚠️  Skipping ingredient with empty name`);
        continue;
      }

      const { quantity, unit } = parseStockValue(ingredient['Current Stock']);
      
      const { data, error } = await supabase
        .from('ingredients')
        .insert({
          name: ingredient['Ingredient'].trim(),
          unit: unit,
          current_stock: quantity,
          reorder_level: quantity, // Set reorder level same as current stock as requested
          unit_cost: 1.0, // Default cost - can be updated later
          supplier: null
        })
        .select()
        .single();

      if (error) {
        console.error(`❌ Error inserting ingredient ${ingredient['Ingredient']}:`, error);
        continue;
      }

      ingredientMap.set(ingredient['Ingredient'].trim(), data.id);
      console.log(`✅ Inserted ingredient: ${ingredient['Ingredient']} (${quantity} ${unit})`);
    }

    // Step 3: Get existing products
    console.log('📦 Fetching existing products...');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, category_id');

    if (productsError) {
      throw productsError;
    }

    const productMap = new Map(products?.map(p => [p.name, p.id]) || []);
    console.log(`Found ${productMap.size} products in database`);

    // Step 4: Migrate Recipes
    console.log('📜 Migrating recipes...');
    let recipeCount = 0;
    
    for (const recipe of recipesData) {
      // Skip if product name or ingredient name is empty
      if (!recipe['Product'] || recipe['Product'].trim() === '') {
        console.warn(`⚠️  Skipping recipe with empty product name`);
        continue;
      }
      
      if (!recipe['Ingredient'] || recipe['Ingredient'].trim() === '') {
        console.warn(`⚠️  Skipping recipe with empty ingredient name`);
        continue;
      }

      const productId = productMap.get(recipe['Product'].trim());
      const ingredientId = ingredientMap.get(recipe['Ingredient'].trim());

      if (!productId) {
        console.warn(`⚠️  Product not found: ${recipe['Product']}`);
        continue;
      }

      if (!ingredientId) {
        console.warn(`⚠️  Ingredient not found: ${recipe['Ingredient']}`);
        continue;
      }

      // Convert percentage to quantity per kg (percentage * 1000g = grams per kg)
      const quantityPerKg = recipe['Percentage'] * 1000;

      const { error } = await supabase
        .from('product_recipes')
        .insert({
          product_id: productId,
          ingredient_id: ingredientId,
          quantity_per_kg: quantityPerKg,
          notes: `${(recipe['Percentage'] * 100).toFixed(1)}% of recipe`
        });

      if (error) {
        console.error(`❌ Error inserting recipe for ${recipe['Product']} - ${recipe['Ingredient']}:`, error);
        continue;
      }

      recipeCount++;
      console.log(`✅ Inserted recipe: ${recipe['Product']} - ${recipe['Ingredient']} (${(recipe['Percentage'] * 100).toFixed(1)}%)`);
    }

    // Step 5: Create stock transactions for initial stock
    console.log('📈 Creating initial stock transactions...');
    for (const ingredient of ingredientsData) {
      const ingredientId = ingredientMap.get(ingredient['Ingredient']?.trim());
      
      if (!ingredientId) continue;

      const { quantity } = parseStockValue(ingredient['Current Stock']);

      const { error } = await supabase
        .from('stock_transactions')
        .insert({
          ingredient_id: ingredientId,
          transaction_type: 'adjustment',
          quantity: quantity,
          reference_type: 'adjustment',
          reference_id: null,
          notes: 'Initial stock from Excel migration'
        });

      if (error) {
        console.error(`❌ Error creating stock transaction for ${ingredient['Ingredient']}:`, error);
      }
    }

    console.log('\n🎉 Migration completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Ingredients migrated: ${ingredientMap.size}`);
    console.log(`   - Recipes migrated: ${recipeCount}`);
    console.log(`   - Stock transactions created: ${ingredientsData.length}`);
    
    // Show product mapping for debugging
    console.log('\n📦 Available products in database:');
    products?.forEach(p => console.log(`   - ${p.name}`));

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
migrateExcelData();
