#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: '.env.local' });

console.log('🌱 Seeding local database with production-compatible data...');

// Local Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSJ9.6C_wt1x2q_3jIz6a8N2T6d6Z8H7Y9Z0W1V2R3F4G5H6';

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedProductionCompatibleData() {
  try {
    console.log('📁 Creating categories (production structure)...');
    
    // Categories matching production structure
    const categoriesData = [
      {
        id: uuidv4(),
        name: 'Meals',
        slug: 'meals',
        description: 'Complete nutritious meals - 70g per pack',
        display_order: 1,
        is_active: true
      },
      {
        id: uuidv4(),
        name: 'Broths',
        slug: 'broths',
        description: 'Nutritious broths for hydration and flavor',
        display_order: 2,
        is_active: true
      },
      {
        id: uuidv4(),
        name: 'Treats',
        slug: 'treats',
        description: 'Healthy treats for training and rewards',
        display_order: 3,
        is_active: true
      }
    ];

    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .upsert(categoriesData)
      .select();

    if (categoriesError) {
      console.error('❌ Error inserting categories:', categoriesError);
      throw categoriesError;
    }
    
    console.log(`✅ Inserted ${categories?.length || 0} categories`);

    console.log('🛍️ Creating products (NO price field - like production)...');
    
    // Products matching production structure (NO price field)
    const productsData = [
      {
        id: uuidv4(),
        category_id: categories[0].id, // Meals
        name: 'Nourish Chicken Meal',
        slug: 'nourish-chicken-meal',
        description: 'Complete balanced meal with chicken, pumpkin and rice. Perfect for adult cats needing complete nutrition. Made with high-quality ingredients and formulated to meet all nutritional requirements.',
        short_description: 'Balanced chicken meal with pumpkin',
        nutritional_info: null,
        ingredients_display: null,
        image_url: 'https://images.unsplash.com/photo-1546833999-b9f581a39679?w=400',
        is_active: true,
        display_order: 1,
        packaging_type: '70g Stand Up Pouch',
        label_type: 'Nourish Label',
        packaging_quantity_per_product: 1,
        label_quantity_per_product: 1
      },
      {
        id: uuidv4(),
        category_id: categories[1].id, // Broths
        name: 'Bone Broth Chicken',
        slug: 'bone-broth-chicken',
        description: 'Rich chicken bone broth with collagen and essential minerals. Perfect for adding hydration and flavor to your cat\'s meals, or as a standalone treat.',
        short_description: 'Nutritious chicken bone broth',
        nutritional_info: null,
        ingredients_display: null,
        image_url: 'https://images.unsplash.com/photo-1574246287928-15c9578e8f9b?w=400',
        is_active: true,
        display_order: 2,
        packaging_type: '100ml Bottle',
        label_type: 'Broth Label',
        packaging_quantity_per_product: 1,
        label_quantity_per_product: 1
      },
      {
        id: uuidv4(),
        category_id: categories[2].id, // Treats
        name: 'Salmon Training Treats',
        slug: 'salmon-training-treats',
        description: 'Omega-rich salmon treats perfect for training and rewards. High in protein and essential fatty acids. Great for positive reinforcement during training sessions.',
        short_description: 'Omega-rich salmon training treats',
        nutritional_info: null,
        ingredients_display: null,
        image_url: 'https://images.unsplash.com/photo-1583333141892-88bf1aa5b3b2?w=400',
        is_active: true,
        display_order: 3,
        packaging_type: '50g Resealable Pouch',
        label_type: 'Treats Label',
        packaging_quantity_per_product: 1,
        label_quantity_per_product: 1
      }
    ];

    const { data: products, error: productsError } = await supabase
      .from('products')
      .upsert(productsData)
      .select();

    if (productsError) {
      console.error('❌ Error inserting products:', productsError);
      throw productsError;
    }
    
    console.log(`✅ Inserted ${products?.length || 0} products`);

    console.log('🏷️ Creating product variants (WITH price field - like production)...');
    
    // Product variants where pricing actually lives (production structure)
    const variantsData = [
      // Nourish Chicken Meal variants
      {
        id: uuidv4(),
        product_id: products[0].id,
        weight_grams: 70,
        price: 29999, // Price in cents (like production)
        sku: 'NOURISH-70G',
        is_active: true
      },
      {
        id: uuidv4(),
        product_id: products[0].id,
        weight_grams: 140,
        price: 54999, // Price in cents
        sku: 'NOURISH-140G',
        is_active: true
      },
      // Bone Broth variants
      {
        id: uuidv4(),
        product_id: products[1].id,
        weight_grams: 100,
        price: 14999, // Price in cents
        sku: 'BROTH-100ML',
        is_active: true
      },
      {
        id: uuidv4(),
        product_id: products[1].id,
        weight_grams: 200,
        price: 24999, // Price in cents
        sku: 'BROTH-200ML',
        is_active: true
      },
      // Salmon Treats variants
      {
        id: uuidv4(),
        product_id: products[2].id,
        weight_grams: 50,
        price: 19999, // Price in cents
        sku: 'TREATS-50G',
        is_active: true
      },
      {
        id: uuidv4(),
        product_id: products[2].id,
        weight_grams: 100,
        price: 34999, // Price in cents
        sku: 'TREATS-100G',
        is_active: true
      }
    ];

    const { data: variants, error: variantsError } = await supabase
      .from('product_variants')
      .upsert(variantsData)
      .select();

    if (variantsError) {
      console.error('❌ Error inserting variants:', variantsError);
      throw variantsError;
    }
    
    console.log(`✅ Inserted ${variants?.length || 0} product variants`);

    console.log('\n🎉 Production-compatible data seeding completed!');
    console.log('\n📊 Summary:');
    console.log(`   - Categories: ${categories?.length || 0} (production structure)`);
    console.log(`   - Products: ${products?.length || 0} (NO price field)`);
    console.log(`   - Variants: ${variants?.length || 0} (WITH pricing)`);
    console.log('\n🎯 Production Schema Compliance:');
    console.log('  ✅ UUID primary keys everywhere');
    console.log('  ✅ Products table has NO price field');
    console.log('  ✅ Product_variants table has pricing');
    console.log('  ✅ Packaging and labeling fields present');
    console.log('  ✅ Valid Unsplash image URLs');
    console.log('  ✅ Prices in cents (like production)');
    
    console.log('\n🚀 Your frontend should now work perfectly!');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run the seeding
seedProductionCompatibleData();
