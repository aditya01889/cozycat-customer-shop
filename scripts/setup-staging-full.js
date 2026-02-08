// =============================================================================
// Complete Staging Database Setup
// First creates schema, then inserts test data
// =============================================================================

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Your staging Supabase credentials
const supabaseUrl = 'https://pjckafjhzwegtyhlatus.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqY2thZmpoendlZ3R5aGxhdHVzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTYzMDY3OSwiZXhwIjoyMDg1MjA2Njc5fQ.xEMNIrSYO59toaFNaTvxKxf4wFGrckstm8MEP9OxmvM';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Basic schema creation SQL
const createSchemaSQL = `
-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'user',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  slug TEXT UNIQUE NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category_id TEXT REFERENCES categories(id),
  image_url TEXT,
  in_stock BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create addresses table
CREATE TABLE IF NOT EXISTS addresses (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id TEXT REFERENCES profiles(email),
  name TEXT NOT NULL,
  phone TEXT,
  street TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT,
  postal_code TEXT,
  country TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id TEXT REFERENCES profiles(email),
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  payment_status TEXT DEFAULT 'pending',
  shipping_address TEXT REFERENCES addresses(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cart_items table
CREATE TABLE IF NOT EXISTS cart_items (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id TEXT REFERENCES profiles(email) ON DELETE CASCADE,
  product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  product_id TEXT REFERENCES products(id),
  user_id TEXT REFERENCES profiles(email),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  verified_purchase BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create wishlist_items table
CREATE TABLE IF NOT EXISTS wishlist_items (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id TEXT REFERENCES profiles(email) ON DELETE CASCADE,
  product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id TEXT REFERENCES profiles(email) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_user ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (email = auth.email());
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (email = auth.email());
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (email = auth.email());

CREATE POLICY "Everyone can view categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Everyone can view products" ON products FOR SELECT USING (true);

CREATE POLICY "Users can manage own addresses" ON addresses FOR ALL USING (email = auth.email());

CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (email = auth.email());
CREATE POLICY "Users can manage own cart" ON cart_items FOR ALL USING (email = auth.email());

CREATE POLICY "Users can manage own reviews" ON reviews FOR ALL USING (email = auth.email());
CREATE POLICY "Users can manage own wishlist" ON wishlist_items FOR ALL USING (email = auth.email());
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (email = auth.email());
`;

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
  console.log('🚀 Setting up complete CozyCatKitchen staging database...');
  console.log('📍 URL:', supabaseUrl);
  
  try {
    // Step 1: Create schema
    console.log('🔨 Creating database schema...');
    
    // Execute SQL schema creation
    const { error: schemaError } = await supabase.rpc('exec_sql', { sql: createSchemaSQL });
    
    if (schemaError) {
      console.log('⚠️  RPC method not available, trying direct SQL execution...');
      
      // Try using the SQL editor approach
      const tables = ['profiles', 'categories', 'products', 'addresses', 'orders', 'order_items', 'cart_items', 'reviews', 'wishlist_items', 'notifications'];
      
      for (const table of tables) {
        try {
          // Check if table exists by trying to select from it
          const { error } = await supabase.from(table).select('count').limit(1);
          if (error && error.code === 'PGRST116') {
            console.log(`📝 Table ${table} doesn't exist, you'll need to create it manually`);
          } else {
            console.log(`✅ Table ${table} exists`);
          }
        } catch (e) {
          console.log(`📝 Table ${table} needs to be created manually`);
        }
      }
    } else {
      console.log('✅ Schema created successfully');
    }
    
    // Step 2: Insert test data (only if tables exist)
    console.log('📦 Inserting test data...');
    
    // Insert categories
    for (const category of stagingData.categories) {
      try {
        const { error } = await supabase.from('categories').upsert({
          ...category,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });
        
        if (!error) {
          console.log(`✅ Inserted category: ${category.name}`);
        }
      } catch (e) {
        console.log(`⚠️  Could not insert category ${category.name}`);
      }
    }
    
    // Insert products
    for (const product of stagingData.products) {
      try {
        const { error } = await supabase.from('products').upsert({
          ...product,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });
        
        if (!error) {
          console.log(`✅ Inserted product: ${product.name}`);
        }
      } catch (e) {
        console.log(`⚠️  Could not insert product ${product.name}`);
      }
    }
    
    // Insert profiles
    for (const profile of stagingData.profiles) {
      try {
        const { error } = await supabase.from('profiles').upsert({
          ...profile,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });
        
        if (!error) {
          console.log(`✅ Inserted profile: ${profile.name}`);
        }
      } catch (e) {
        console.log(`⚠️  Could not insert profile ${profile.name}`);
      }
    }
    
    console.log('');
    console.log('🎉 Staging setup process complete!');
    console.log('');
    console.log('📋 Next steps:');
    console.log('1. If tables were created manually, go to Supabase SQL Editor');
    console.log('2. Run the schema creation SQL from scripts/setup-staging-full.js');
    console.log('3. Then run this script again to insert test data');
    console.log('');
    console.log('🌐 Staging URL will be: https://staging.cozycat.vercel.app');
    console.log('🧪 Test users: staging-admin@cozycatkitchen.com, staging-user@cozycatkitchen.com');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.log('');
    console.log('🔧 Manual setup required:');
    console.log('1. Go to your Supabase project: https://pjckafjhzwegtyhlatus.supabase.co');
    console.log('2. Go to SQL Editor');
    console.log('3. Run the schema creation SQL');
    console.log('4. Then run: npm run staging:setup-db');
  }
}

// Run the setup
setupStagingDatabase();
