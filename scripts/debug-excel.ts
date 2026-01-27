import * as XLSX from 'xlsx';

interface ExcelRecipe {
  'Recipe Link ID': string;
  'Product Name': string;
  'Product Category': string;
  'Ingredient Name': string;
  'Quantity per KG': number;
  'Unit': string;
  'Notes': string;
}

interface ExcelIngredient {
  'Ingredient Name': string;
  'Current Stock': number;
  'Unit': string;
  'Cost per Unit': number;
  'Reorder Level': number;
  'Primary Vendor': string;
}

interface ExcelPackaging {
  'Product Name': string;
  'Packaging Type': string;
  'Quantity per Unit': number;
  'Unit': string;
}

async function debugExcelFile() {
  try {
    console.log('🔍 Debugging Excel file...');

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

    // Debug first few rows of each sheet
    console.log('\n🥘 First 5 Ingredients:');
    ingredientsData.slice(0, 5).forEach((ingredient, index) => {
      console.log(`${index + 1}.`, JSON.stringify(ingredient, null, 2));
    });

    console.log('\n📜 First 5 Recipes:');
    recipesData.slice(0, 5).forEach((recipe, index) => {
      console.log(`${index + 1}.`, JSON.stringify(recipe, null, 2));
    });

    console.log('\n📦 First 5 Packaging:');
    packagingData.slice(0, 5).forEach((packaging, index) => {
      console.log(`${index + 1}.`, JSON.stringify(packaging, null, 2));
    });

    // Check for empty values
    console.log('\n🔍 Checking for empty values...');
    
    const emptyIngredients = ingredientsData.filter(i => !i['Ingredient Name'] || i['Ingredient Name'].trim() === '');
    console.log(`Empty ingredient names: ${emptyIngredients.length}`);
    
    const emptyRecipes = recipesData.filter(r => !r['Product Name'] || r['Product Name'].trim() === '');
    console.log(`Empty recipe product names: ${emptyRecipes.length}`);
    
    const emptyRecipeIngredients = recipesData.filter(r => !r['Ingredient Name'] || r['Ingredient Name'].trim() === '');
    console.log(`Empty recipe ingredient names: ${emptyRecipeIngredients.length}`);

  } catch (error) {
    console.error('❌ Debug failed:', error);
    process.exit(1);
  }
}

// Run the debug
debugExcelFile();
