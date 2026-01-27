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
      if (!ingredient['Ingredient Name'] || ingredient['Ingredient Name'].trim() === '') {
        console.warn(`⚠️  Skipping ingredient with empty name`);
        continue;
      }

      const { data, error } = await supabase
        .from('ingredients')
        .insert({
          name: ingredient['Ingredient Name'],
          unit: ingredient['Unit'],
          current_stock: ingredient['Current Stock'],
          reorder_level: ingredient['Reorder Level'],
          unit_cost: ingredient['Cost per Unit'],
          supplier: null // Will be set later if needed
        })
        .select()
        .single();

      if (error) {
        console.error(`❌ Error inserting ingredient ${ingredient['Ingredient Name']}:`, error);
        continue;
      }

      ingredientMap.set(ingredient['Ingredient Name'], data.id);
      console.log(`✅ Inserted ingredient: ${ingredient['Ingredient Name']}`);
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

    // Step 4: Migrate Recipes
    console.log('📜 Migrating recipes...');
    let recipeCount = 0;
    
    for (const recipe of recipesData) {
      // Skip if product name or ingredient name is empty
      if (!recipe['Product Name'] || recipe['Product Name'].trim() === '') {
        console.warn(`⚠️  Skipping recipe with empty product name`);
        continue;
      }
      
      if (!recipe['Ingredient Name'] || recipe['Ingredient Name'].trim() === '') {
        console.warn(`⚠️  Skipping recipe with empty ingredient name`);
        continue;
      }

      const productId = productMap.get(recipe['Product Name']);
      const ingredientId = ingredientMap.get(recipe['Ingredient Name']);

      if (!productId) {
        console.warn(`⚠️  Product not found: ${recipe['Product Name']}`);
        continue;
      }

      if (!ingredientId) {
        console.warn(`⚠️  Ingredient not found: ${recipe['Ingredient Name']}`);
        continue;
      }

      const { error } = await supabase
        .from('product_recipes')
        .insert({
          product_id: productId,
          ingredient_id: ingredientId,
          quantity_per_kg: recipe['Quantity per KG'],
          notes: recipe['Notes'] || null
        });

      if (error) {
        console.error(`❌ Error inserting recipe for ${recipe['Product Name']} - ${recipe['Ingredient Name']}:`, error);
        continue;
      }

      recipeCount++;
      console.log(`✅ Inserted recipe: ${recipe['Product Name']} - ${recipe['Ingredient Name']}`);
    }

    // Step 5: Create stock transactions for initial stock
    console.log('📈 Creating initial stock transactions...');
    for (const ingredient of ingredientsData) {
      const ingredientId = ingredientMap.get(ingredient['Ingredient Name']);
      
      if (!ingredientId) continue;

      const { error } = await supabase
        .from('stock_transactions')
        .insert({
          ingredient_id: ingredientId,
          transaction_type: 'adjustment',
          quantity: ingredient['Current Stock'],
          reference_type: 'adjustment',
          reference_id: null,
          notes: 'Initial stock from Excel migration'
        });

      if (error) {
        console.error(`❌ Error creating stock transaction for ${ingredient['Ingredient Name']}:`, error);
      }
    }

    console.log('\n🎉 Migration completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Ingredients migrated: ${ingredientMap.size}`);
    console.log(`   - Recipes migrated: ${recipeCount}`);
    console.log(`   - Stock transactions created: ${ingredientsData.length}`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
migrateExcelData();
