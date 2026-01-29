#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const environment = process.argv[2] || 'local';

console.log(`🌱 Seeding ${environment} database...`);

// Environment configurations
const configs = {
  local: {
    url: 'http://localhost:54321',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24ifQ.6C_wt1x2q_3jIz6a8N2T6d6Z8H7Y9Z0W1V2R3F4G5H6',
    serviceKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSJ9.6C_wt1x2q_3jIz6a8N2T6d6Z8H7Y9Z0W1V2R3F4G5H6'
  },
  staging: {
    url: process.env.STAGING_SUPABASE_URL || 'https://pjckafjhzwegtyhlatus.supabase.co',
    anonKey: process.env.STAGING_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqY2thZmpoendlZ3R5aGxhdHVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2MzA2NzksImV4cCI6MjA4NTIwNjY3OX0.VQ48IDxmrVm9jbGT-EycSK5ofG7sAPKAFeoGy41qgNU',
    serviceKey: process.env.STAGING_SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqY2thZmpoendlZ3R5aGxhdHVzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTYzMDY3OSwiZXhwIjoyMDg1MjA2Njc5fQ.xEMNIrSYO59toaFNaTvxKxf4wFGrckstm8MEP9OxmvM'
  }
};

const config = configs[environment];
if (!config) {
  console.error(`❌ Unknown environment: ${environment}`);
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(config.url, config.serviceKey);

// Seed data
const seedData = {
  categories: [
    {
      name: 'Meals',
      description: 'Complete and balanced meals for your cat',
      slug: 'meals',
      image_url: 'https://images.unsplash.com/photo-1577593275871-9a3cae958032?w=400',
      is_active: true,
      sort_order: 1
    },
    {
      name: 'Broths',
      description: 'Nutritious broths for hydration and taste',
      slug: 'broths',
      image_url: 'https://images.unsplash.com/photo-1546548970-71785318a17b?w=400',
      is_active: true,
      sort_order: 2
    },
    {
      name: 'Treats',
      description: 'Healthy treats for training and rewards',
      slug: 'treats',
      image_url: 'https://images.unsplash.com/photo-1583337135313-447d1d9e7dfe?w=400',
      is_active: true,
      sort_order: 3
    }
  ],
  products: [
    {
      name: 'Chicken & Rice Complete Meal',
      description: 'A balanced meal with premium chicken and brown rice',
      slug: 'chicken-rice-meal',
      category_id: null, // Will be set after category creation
      price: 299.99,
      original_price: 349.99,
      image_url: 'https://images.unsplash.com/photo-1583337135313-447d1d9e7dfe?w=400',
      images: ['https://images.unsplash.com/photo-1583337135313-447d1d9e7dfe?w=400'],
      nutritional_info: {
        protein: 28,
        fat: 15,
        fiber: 3.5,
        moisture: 10
      },
      ingredients: 'Chicken, Brown Rice, Carrots, Peas, Fish Oil, Vitamins & Minerals',
      feeding_guide: {
        small: '1-2 cups per day',
        medium: '2-3 cups per day',
        large: '3-4 cups per day'
      },
      weight: '2kg',
      packaging_type: 'bag',
      is_active: true,
      is_featured: true,
      sort_order: 1,
      stock_quantity: 100,
      sku: 'CRM-001'
    },
    {
      name: 'Salmon Broth',
      description: 'Rich salmon broth perfect for hydration and palatability',
      slug: 'salmon-broth',
      category_id: null, // Will be set after category creation
      price: 199.99,
      original_price: 249.99,
      image_url: 'https://images.unsplash.com/photo-1546548970-71785318a17b?w=400',
      images: ['https://images.unsplash.com/photo-1546548970-71785318a17b?w=400'],
      nutritional_info: {
        protein: 12,
        fat: 2,
        fiber: 0.5,
        moisture: 95
      },
      ingredients: 'Salmon Broth, Natural Flavors, Taurine, Vitamins',
      feeding_guide: {
        small: '1/4 cup per meal',
        medium: '1/2 cup per meal',
        large: '3/4 cup per meal'
      },
      weight: '500ml',
      packaging_type: 'bottle',
      is_active: true,
      is_featured: false,
      sort_order: 2,
      stock_quantity: 150,
      sku: 'SB-002'
    },
    {
      name: 'Tuna Training Treats',
      description: 'Small, tasty treats perfect for training sessions',
      slug: 'tuna-treats',
      category_id: null, // Will be set after category creation
      price: 149.99,
      original_price: 179.99,
      image_url: 'https://images.unsplash.com/photo-1577593275871-9a3cae958032?w=400',
      images: ['https://images.unsplash.com/photo-1577593275871-9a3cae958032?w=400'],
      nutritional_info: {
        protein: 35,
        fat: 8,
        fiber: 2,
        moisture: 12
      },
      ingredients: 'Tuna, Sweet Potato, Glycerin, Natural Flavors, Mixed Tocopherols',
      feeding_guide: {
        small: '2-3 treats per session',
        medium: '3-5 treats per session',
        large: '5-8 treats per session'
      },
      weight: '200g',
      packaging_type: 'pouch',
      is_active: true,
      is_featured: false,
      sort_order: 3,
      stock_quantity: 200,
      sku: 'TT-003'
    }
  ]
};

async function seedDatabase() {
  try {
    console.log(`🔗 Connecting to ${environment} database...`);

    // Check if categories already exist
    const { data: existingCategories, error: catError } = await supabase
      .from('categories')
      .select('id, slug');

    if (catError) {
      console.error('❌ Error checking existing categories:', catError);
      throw catError;
    }

    const existingCategorySlugs = existingCategories?.map(cat => cat.slug) || [];
    console.log(`📋 Found ${existingCategorySlugs.length} existing categories`);

    // Insert categories
    const categoriesToInsert = seedData.categories.filter(
      cat => !existingCategorySlugs.includes(cat.slug)
    );

    if (categoriesToInsert.length > 0) {
      console.log(`📂 Inserting ${categoriesToInsert.length} categories...`);
      const { data: insertedCategories, error: insertCatError } = await supabase
        .from('categories')
        .insert(categoriesToInsert)
        .select();

      if (insertCatError) {
        console.error('❌ Error inserting categories:', insertCatError);
        throw insertCatError;
      }

      console.log(`✅ Successfully inserted ${insertedCategories.length} categories`);
      
      // Update products with category IDs
      const categoryMap = {
        'meals': insertedCategories.find(cat => cat.slug === 'meals')?.id,
        'broths': insertedCategories.find(cat => cat.slug === 'broths')?.id,
        'treats': insertedCategories.find(cat => cat.slug === 'treats')?.id
      };

      seedData.products.forEach(product => {
        if (product.category_id === null) {
          if (product.slug === 'chicken-rice-meal') product.category_id = categoryMap.meals;
          else if (product.slug === 'salmon-broth') product.category_id = categoryMap.broths;
          else if (product.slug === 'tuna-treats') product.category_id = categoryMap.treats;
        }
      });
    } else {
      console.log('📂 All categories already exist, skipping...');
      
      // Get existing category IDs for products
      const allCategories = [...existingCategories];
      const categoryMap = {
        'meals': allCategories.find(cat => cat.slug === 'meals')?.id,
        'broths': allCategories.find(cat => cat.slug === 'broths')?.id,
        'treats': allCategories.find(cat => cat.slug === 'treats')?.id
      };

      seedData.products.forEach(product => {
        if (product.slug === 'chicken-rice-meal') product.category_id = categoryMap.meals;
        else if (product.slug === 'salmon-broth') product.category_id = categoryMap.broths;
        else if (product.slug === 'tuna-treats') product.category_id = categoryMap.treats;
      });
    }

    // Check if products already exist
    const { data: existingProducts, error: prodError } = await supabase
      .from('products')
      .select('id, slug');

    if (prodError) {
      console.error('❌ Error checking existing products:', prodError);
      throw prodError;
    }

    const existingProductSlugs = existingProducts?.map(prod => prod.slug) || [];
    console.log(`📦 Found ${existingProductSlugs.length} existing products`);

    // Insert products
    const productsToInsert = seedData.products.filter(
      prod => !existingProductSlugs.includes(prod.slug)
    );

    if (productsToInsert.length > 0) {
      console.log(`📦 Inserting ${productsToInsert.length} products...`);
      const { data: insertedProducts, error: insertProdError } = await supabase
        .from('products')
        .insert(productsToInsert)
        .select();

      if (insertProdError) {
        console.error('❌ Error inserting products:', insertProdError);
        throw insertProdError;
      }

      console.log(`✅ Successfully inserted ${insertedProducts.length} products`);
    } else {
      console.log('📦 All products already exist, skipping...');
    }

    console.log(`🎉 Database seeding completed for ${environment}!`);

    // Show summary
    const { data: finalCategories } = await supabase.from('categories').select('count');
    const { data: finalProducts } = await supabase.from('products').select('count');
    
    console.log(`📊 Final counts:`);
    console.log(`   Categories: ${finalCategories?.[0]?.count || 0}`);
    console.log(`   Products: ${finalProducts?.[0]?.count || 0}`);

  } catch (error) {
    console.error(`❌ Error seeding ${environment} database:`, error);
    process.exit(1);
  }
}

// Run the seeding
seedDatabase();
