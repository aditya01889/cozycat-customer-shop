#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

console.log('🌱 Seeding local Supabase database...');

// Local Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSJ9.6C_wt1x2q_3jIz6a8N2T6d6Z8H7Y9Z0W1V2R3F4G5H6';

const supabase = createClient(supabaseUrl, supabaseKey);

// Seed data for local development (small, focused dataset)
const seedData = {
  categories: [
    {
      name: 'Fresh Meals',
      slug: 'fresh-meals',
      description: 'Nutritious fresh meals for your feline friend',
      image_url: 'https://images.unsplash.com/photo-1548247416-ec66f4900b2e?w=400',
      is_active: true,
      display_order: 1
    },
    {
      name: 'Nutritious Broths',
      slug: 'nutritious-broths',
      description: 'Hydrating and flavorful broths',
      image_url: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400',
      is_active: true,
      display_order: 2
    },
    {
      name: 'Healthy Treats',
      slug: 'healthy-treats',
      description: 'Delicious treats for training and rewards',
      image_url: 'https://images.unsplash.com/photo-1583333141892-88bf1aa5b3b2?w=400',
      is_active: true,
      display_order: 3
    }
  ],

  products: [
    {
      name: 'Chicken & Rice Delight',
      slug: 'chicken-rice-delight',
      description: 'Tender chicken breast with wholesome brown rice, perfect for sensitive stomachs',
      price: 12.99,
      image_url: 'https://images.unsplash.com/photo-1583333141892-88bf1aa5b3b2?w=400',
      is_active: true,
      featured: true,
      nutritional_info: {
        protein: 18,
        fat: 8,
        fiber: 2,
        moisture: 75
      },
      ingredients: 'Chicken breast, brown rice, carrots, peas, fish oil',
      feeding_guidelines: '1 cup per 10 lbs body weight daily'
    },
    {
      name: 'Salmon & Sweet Potato',
      slug: 'salmon-sweet-potato',
      description: 'Omega-rich salmon with antioxidant-rich sweet potatoes',
      price: 14.99,
      image_url: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400',
      is_active: true,
      featured: true,
      nutritional_info: {
        protein: 20,
        fat: 10,
        fiber: 3,
        moisture: 72
      },
      ingredients: 'Salmon, sweet potato, spinach, blueberries, flaxseed',
      feeding_guidelines: '3/4 cup per 10 lbs body weight daily'
    },
    {
      name: 'Bone Broth Chicken',
      slug: 'bone-broth-chicken',
      description: 'Rich chicken bone broth for hydration and joint health',
      price: 6.99,
      image_url: 'https://images.unsplash.com/photo-1574246287928-15c9578e8f9b?w=400',
      is_active: true,
      featured: false,
      nutritional_info: {
        protein: 5,
        fat: 2,
        fiber: 0,
        moisture: 95
      },
      ingredients: 'Chicken bones, water, apple cider vinegar',
      feeding_guidelines: '1/4 cup per meal or as needed for hydration'
    }
  ],

  product_variants: [
    // Chicken & Rice Delight variants
    { product_name: 'Chicken & Rice Delight', weight_grams: 200, price_adjustment: 0, sku: 'CRD-200' },
    { product_name: 'Chicken & Rice Delight', weight_grams: 400, price_adjustment: 3.00, sku: 'CRD-400' },
    
    // Salmon & Sweet Potato variants
    { product_name: 'Salmon & Sweet Potato', weight_grams: 200, price_adjustment: 0, sku: 'SSP-200' },
    { product_name: 'Salmon & Sweet Potato', weight_grams: 400, price_adjustment: 3.50, sku: 'SSP-400' },
    
    // Broth variants
    { product_name: 'Bone Broth Chicken', weight_grams: 250, price_adjustment: 0, sku: 'BBC-250' },
    { product_name: 'Bone Broth Chicken', weight_grams: 500, price_adjustment: 2.00, sku: 'BBC-500' }
  ]
};

async function seedDatabase() {
  try {
    console.log('🗄️  Starting local database seeding...');

    // Seed categories
    console.log('📂 Seeding categories...');
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .upsert(seedData.categories, { onConflict: 'slug' })
      .select();

    if (categoriesError) {
      console.error('❌ Error seeding categories:', categoriesError);
      throw categoriesError;
    }
    console.log(`✅ Seeded ${categories.length} categories`);

    // Seed products
    console.log('🍽️  Seeding products...');
    const productsWithCategories = seedData.products.map(product => {
      const category = categories.find(cat => 
        (product.name.includes('Chicken') || product.name.includes('Salmon')) && cat.slug === 'fresh-meals' ||
        product.name.includes('Broth') && cat.slug === 'nutritious-broths' ||
        product.name.includes('Treat') && cat.slug === 'healthy-treats'
      );
      
      return {
        ...product,
        category_id: category ? category.id : categories[0].id
      };
    });

    const { data: products, error: productsError } = await supabase
      .from('products')
      .upsert(productsWithCategories, { onConflict: 'slug' })
      .select();

    if (productsError) {
      console.error('❌ Error seeding products:', productsError);
      throw productsError;
    }
    console.log(`✅ Seeded ${products.length} products`);

    // Seed product variants
    console.log('📦 Seeding product variants...');
    const variantsWithProducts = seedData.product_variants.map(variant => {
      const product = products.find(p => p.name === variant.product_name);
      return {
        weight_grams: variant.weight_grams,
        price_adjustment: variant.price_adjustment,
        sku: variant.sku,
        product_id: product ? product.id : null
      };
    }).filter(v => v.product_id);

    const { data: variants, error: variantsError } = await supabase
      .from('product_variants')
      .upsert(variantsWithProducts, { onConflict: 'sku' })
      .select();

    if (variantsError) {
      console.error('❌ Error seeding product variants:', variantsError);
      throw variantsError;
    }
    console.log(`✅ Seeded ${variants.length} product variants`);

    // Create test user profile
    console.log('👤 Creating test user...');
    const testUserId = '00000000-0000-0000-0000-000000000001';
    
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: testUserId,
        role: 'customer',
        full_name: 'Test User',
        email: 'test@example.com',
        phone: '+1234567890',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (profileError) {
      console.error('❌ Error creating test profile:', profileError);
      throw profileError;
    }

    const { error: customerError } = await supabase
      .from('customers')
      .upsert({
        id: testUserId,
        profile_id: testUserId,
        phone: '+1234567890',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (customerError) {
      console.error('❌ Error creating test customer:', customerError);
      throw customerError;
    }

    console.log('✅ Created test user (test@example.com)');

    console.log('\n🎉 Local database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Categories: ${categories.length}`);
    console.log(`   - Products: ${products.length}`);
    console.log(`   - Product Variants: ${variants.length}`);
    console.log(`   - Test User: test@example.com`);
    console.log('\n🌐 You can now start the app with: npm run dev');
    console.log('🔗 Local Supabase Studio: http://localhost:54323');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run seeding
seedDatabase();
