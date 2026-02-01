// =============================================================================
// Staging Database Setup Script
// Sets up your staging Supabase database with schema and test data
// =============================================================================

const { createClient } = require('@supabase/supabase-js');

// Your staging Supabase credentials
const supabaseUrl = 'https://pjckafjhzwegtyhlatus.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqY2thZmpoendlZ3R5aGxhdHVzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTYzMDY3OSwiZXhwIjoyMDg1MjA2Njc5fQ.xEMNIrSYO59toaFNaTvxKxf4wFGrckstm8MEP9OxmvM';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Staging test data
const stagingData = {
  categories: [
    {
      id: 'cat-food',
      name: 'Cat Food',
      description: 'Premium nutrition for your feline friend',
      slug: 'cat-food',
      image_url: '/images/categories/cat-food.jpg'
    },
    {
      id: 'cat-treats',
      name: 'Cat Treats',
      description: 'Delicious treats for training and rewards',
      slug: 'cat-treats',
      image_url: '/images/categories/cat-treats.jpg'
    },
    {
      id: 'cat-broth',
      name: 'Cat Broth',
      description: 'Nutritious broths for hydration and taste',
      slug: 'cat-broth',
      image_url: '/images/categories/cat-broth.jpg'
    }
  ],
  products: [
    {
      id: 'premium-chicken',
      name: 'Premium Chicken Meal',
      description: 'High-quality chicken formula for adult cats',
      price: 299.99,
      category_id: 'cat-food',
      image_url: '/images/products/chicken-meal.jpg',
      in_stock: true
    },
    {
      id: 'salmon-treats',
      name: 'Salmon Training Treats',
      description: 'Omega-rich salmon treats for training',
      price: 149.99,
      category_id: 'cat-treats',
      image_url: '/images/products/salmon-treats.jpg',
      in_stock: true
    },
    {
      id: 'chicken-broth',
      name: 'Chicken Bone Broth',
      description: 'Nutritious chicken broth for hydration',
      price: 89.99,
      category_id: 'cat-broth',
      image_url: '/images/products/chicken-broth.jpg',
      in_stock: true
    }
  ],
  profiles: [
    {
      id: 'staging-admin@cozycatkitchen.com',
      email: 'staging-admin@cozycatkitchen.com',
      name: 'Staging Admin',
      role: 'admin'
    },
    {
      id: 'staging-user@cozycatkitchen.com',
      email: 'staging-user@cozycatkitchen.com',
      name: 'Staging User',
      role: 'user'
    }
  ]
};

async function setupStagingDatabase() {
  console.log('🚀 Setting up CozyCatKitchen staging database...');
  console.log('📍 URL:', supabaseUrl);
  
  try {
    // Test connection
    console.log('🔍 Testing database connection...');
    const { data, error } = await supabase.from('profiles').select('id').limit(1);
    
    if (error && error.code !== 'PGRST116') {
      console.error('❌ Database connection failed:', error.message);
      process.exit(1);
    }
    
    console.log('✅ Database connection successful');
    
    // Insert categories
    console.log('📦 Inserting categories...');
    for (const category of stagingData.categories) {
      const { error } = await supabase.from('categories').upsert({
        ...category,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });
      
      if (error) {
        console.error(`❌ Failed to insert category ${category.id}:`, error.message);
      } else {
        console.log(`✅ Inserted category: ${category.name}`);
      }
    }
    
    // Insert products
    console.log('🛍️ Inserting products...');
    for (const product of stagingData.products) {
      const { error } = await supabase.from('products').upsert({
        ...product,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });
      
      if (error) {
        console.error(`❌ Failed to insert product ${product.id}:`, error.message);
      } else {
        console.log(`✅ Inserted product: ${product.name}`);
      }
    }
    
    // Insert profiles
    console.log('👤 Inserting user profiles...');
    for (const profile of stagingData.profiles) {
      const { error } = await supabase.from('profiles').upsert({
        ...profile,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });
      
      if (error) {
        console.error(`❌ Failed to insert profile ${profile.id}:`, error.message);
      } else {
        console.log(`✅ Inserted profile: ${profile.name}`);
      }
    }
    
    // Verify setup
    console.log('🔍 Verifying staging setup...');
    const { data: categories } = await supabase.from('categories').select('count');
    const { data: products } = await supabase.from('products').select('count');
    const { data: profiles } = await supabase.from('profiles').select('count');
    
    console.log('📊 Staging database summary:');
    console.log(`   Categories: ${categories?.length || 0}`);
    console.log(`   Products: ${products?.length || 0}`);
    console.log(`   Profiles: ${profiles?.length || 0}`);
    
    console.log('🎉 Staging database setup complete!');
    console.log('');
    console.log('🧪 Test users created:');
    console.log('   Admin: staging-admin@cozycatkitchen.com');
    console.log('   User: staging-user@cozycatkitchen.com');
    console.log('');
    console.log('🌐 Staging URL will be: https://staging.cozycat.vercel.app');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Run the setup
setupStagingDatabase();
