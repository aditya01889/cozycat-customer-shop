#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.staging' });

console.log('🌱 Seeding staging Supabase database...');

// Staging Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing staging environment variables');
  console.log('Please ensure .env.staging contains:');
  console.log('- NEXT_PUBLIC_SUPABASE_URL');
  console.log('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Comprehensive seed data for staging (realistic testing)
const seedData = {
  categories: [
    {
      name: 'Fresh Meals',
      slug: 'fresh-meals',
      description: 'Nutritious fresh meals made with high-quality ingredients for optimal feline health',
      image_url: 'https://images.unsplash.com/photo-1548247416-ec66f4900b2e?w=400',
      is_active: true,
      display_order: 1
    },
    {
      name: 'Nutritious Broths',
      slug: 'nutritious-broths',
      description: 'Hydrating and flavorful broths packed with nutrients and essential minerals',
      image_url: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400',
      is_active: true,
      display_order: 2
    },
    {
      name: 'Healthy Treats',
      slug: 'healthy-treats',
      description: 'Delicious and nutritious treats perfect for training and rewards',
      image_url: 'https://images.unsplash.com/photo-1583333141892-88bf1aa5b3b2?w=400',
      is_active: true,
      display_order: 3
    },
    {
      name: 'Celebration Cakes',
      slug: 'celebration-cakes',
      description: 'Special cakes for birthdays and celebrations',
      image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
      is_active: true,
      display_order: 4
    }
  ],

  products: [
    // Fresh Meals
    {
      name: 'Chicken & Rice Delight',
      slug: 'chicken-rice-delight',
      description: 'Tender chicken breast with wholesome brown rice, perfect for sensitive stomachs. Made with free-range chicken and organic brown rice.',
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
      ingredients: 'Chicken breast, brown rice, carrots, peas, fish oil, taurine',
      feeding_guidelines: '1 cup per 10 lbs body weight daily',
      allergens: 'None',
      shelf_life_days: 7
    },
    {
      name: 'Salmon & Sweet Potato',
      slug: 'salmon-sweet-potato',
      description: 'Omega-rich salmon with antioxidant-rich sweet potatoes. Wild-caught Alaskan salmon with organic sweet potatoes.',
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
      ingredients: 'Salmon, sweet potato, spinach, blueberries, flaxseed, vitamin E',
      feeding_guidelines: '3/4 cup per 10 lbs body weight daily',
      allergens: 'Fish',
      shelf_life_days: 7
    },
    {
      name: 'Turkey & Vegetable Medley',
      slug: 'turkey-vegetable-medley',
      description: 'Lean turkey with garden vegetables for complete nutrition. Human-grade turkey with organic vegetables.',
      price: 11.99,
      image_url: 'https://images.unsplash.com/photo-1548247416-ec66f4900b2e?w=400',
      is_active: true,
      featured: false,
      nutritional_info: {
        protein: 17,
        fat: 7,
        fiber: 2.5,
        moisture: 76
      },
      ingredients: 'Turkey, carrots, green beans, pumpkin, olive oil, cranberries',
      feeding_guidelines: '1 cup per 10 lbs body weight daily',
      allergens: 'None',
      shelf_life_days: 7
    },

    // Nutritious Broths
    {
      name: 'Bone Broth Chicken',
      slug: 'bone-broth-chicken',
      description: 'Rich chicken bone broth for hydration and joint health. Slow-simmered for 24 hours with organic vegetables.',
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
      ingredients: 'Chicken bones, water, apple cider vinegar, carrots, celery',
      feeding_guidelines: '1/4 cup per meal or as needed for hydration',
      allergens: 'None',
      shelf_life_days: 5
    },
    {
      name: 'Salmon Broth',
      slug: 'salmon-broth',
      description: 'Omega-rich salmon broth for skin and coat health. Made with wild-caught salmon bones.',
      price: 7.99,
      image_url: 'https://images.unsplash.com/photo-1546833999-b9f581a39679?w=400',
      is_active: true,
      featured: false,
      nutritional_info: {
        protein: 6,
        fat: 3,
        fiber: 0,
        moisture: 94
      },
      ingredients: 'Salmon bones, water, lemon, parsley, dill',
      feeding_guidelines: '1/4 cup per meal or as needed for hydration',
      allergens: 'Fish',
      shelf_life_days: 5
    },

    // Healthy Treats
    {
      name: 'Salmon Training Treats',
      slug: 'salmon-training-treats',
      description: 'High-value salmon treats perfect for training sessions',
      price: 8.99,
      image_url: 'https://images.unsplash.com/photo-1583333141892-88bf1aa5b3b2?w=400',
      is_active: true,
      featured: false,
      nutritional_info: {
        protein: 25,
        fat: 15,
        fiber: 1,
        moisture: 12
      },
      ingredients: 'Salmon, sweet potato, flaxseed, natural flavor',
      feeding_guidelines: 'Up to 10 treats per day for training',
      allergens: 'Fish',
      shelf_life_days: 30
    },

    // Celebration Cakes
    {
      name: 'Birthday Tuna Cake',
      slug: 'birthday-tuna-cake',
      description: 'Special birthday cake made with tuna and catnip frosting',
      price: 24.99,
      image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
      is_active: true,
      featured: false,
      nutritional_info: {
        protein: 15,
        fat: 8,
        fiber: 2,
        moisture: 65
      },
      ingredients: 'Tuna, eggs, whole wheat flour, catnip, yogurt frosting',
      feeding_guidelines: 'Special occasion - serve in small portions',
      allergens: 'Fish, wheat, dairy',
      shelf_life_days: 3
    }
  ],

  product_variants: [
    // Fresh Meals variants
    { product_name: 'Chicken & Rice Delight', weight_grams: 200, price_adjustment: 0, sku: 'CRD-200' },
    { product_name: 'Chicken & Rice Delight', weight_grams: 400, price_adjustment: 3.00, sku: 'CRD-400' },
    { product_name: 'Chicken & Rice Delight', weight_grams: 800, price_adjustment: 8.00, sku: 'CRD-800' },
    
    { product_name: 'Salmon & Sweet Potato', weight_grams: 200, price_adjustment: 0, sku: 'SSP-200' },
    { product_name: 'Salmon & Sweet Potato', weight_grams: 400, price_adjustment: 3.50, sku: 'SSP-400' },
    { product_name: 'Salmon & Sweet Potato', weight_grams: 800, price_adjustment: 9.00, sku: 'SSP-800' },
    
    { product_name: 'Turkey & Vegetable Medley', weight_grams: 200, price_adjustment: 0, sku: 'TVM-200' },
    { product_name: 'Turkey & Vegetable Medley', weight_grams: 400, price_adjustment: 2.50, sku: 'TVM-400' },

    // Broth variants
    { product_name: 'Bone Broth Chicken', weight_grams: 250, price_adjustment: 0, sku: 'BBC-250' },
    { product_name: 'Bone Broth Chicken', weight_grams: 500, price_adjustment: 2.00, sku: 'BBC-500' },
    
    { product_name: 'Salmon Broth', weight_grams: 250, price_adjustment: 0, sku: 'SB-250' },
    { product_name: 'Salmon Broth', weight_grams: 500, price_adjustment: 2.50, sku: 'SB-500' },

    // Treat variants
    { product_name: 'Salmon Training Treats', weight_grams: 100, price_adjustment: 0, sku: 'STT-100' },
    { product_name: 'Salmon Training Treats', weight_grams: 200, price_adjustment: 4.00, sku: 'STT-200' },

    // Cake variants
    { product_name: 'Birthday Tuna Cake', weight_grams: 300, price_adjustment: 0, sku: 'BTC-300' },
    { product_name: 'Birthday Tuna Cake', weight_grams: 500, price_adjustment: 8.00, sku: 'BTC-500' }
  ]
};

async function seedDatabase() {
  try {
    console.log('🗄️  Starting staging database seeding...');

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
      let categorySlug = 'fresh-meals'; // default
      
      if (product.name.includes('Broth')) {
        categorySlug = 'nutritious-broths';
      } else if (product.name.includes('Treat')) {
        categorySlug = 'healthy-treats';
      } else if (product.name.includes('Cake')) {
        categorySlug = 'celebration-cakes';
      }
      
      const category = categories.find(cat => cat.slug === categorySlug);
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

    // Create test users for staging
    console.log('👥 Creating test users...');
    const testUsers = [
      {
        id: '10000000-0000-0000-0000-000000000001',
        email: 'staging-test@example.com',
        full_name: 'Staging Test User',
        phone: '+1234567890',
        role: 'customer'
      },
      {
        id: '10000000-0000-0000-0000-000000000002',
        email: 'admin@staging.com',
        full_name: 'Staging Admin',
        phone: '+0987654321',
        role: 'admin'
      }
    ];

    for (const user of testUsers) {
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          role: user.role,
          full_name: user.full_name,
          email: user.email,
          phone: user.phone,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (profileError) {
        console.error(`❌ Error creating profile for ${user.email}:`, profileError);
        continue;
      }

      if (user.role === 'customer') {
        const { error: customerError } = await supabase
          .from('customers')
          .upsert({
            id: user.id,
            profile_id: user.id,
            phone: user.phone,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (customerError) {
          console.error(`❌ Error creating customer for ${user.email}:`, customerError);
        }
      }
    }

    console.log(`✅ Created ${testUsers.length} test users`);
    console.log('   - staging-test@example.com (customer)');
    console.log('   - admin@staging.com (admin)');

    console.log('\n🎉 Staging database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Categories: ${categories.length}`);
    console.log(`   - Products: ${products.length}`);
    console.log(`   - Product Variants: ${variants.length}`);
    console.log(`   - Test Users: ${testUsers.length}`);
    console.log('\n🌐 Staging URL: https://cozycatkitchen-staging.vercel.app');

  } catch (error) {
    console.error('❌ Staging seeding failed:', error);
    process.exit(1);
  }
}

// Run seeding
seedDatabase();
