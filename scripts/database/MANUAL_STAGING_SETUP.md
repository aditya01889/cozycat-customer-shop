# Manual Staging Database Setup from Production

## 🎯 Objective
Copy production database structure and data to staging database.

## 📊 Production Data Found
- ✅ Categories: 4 records
- ✅ Products: 18 records  
- ✅ Product variants: 22 records
- ✅ Profiles: 3 records
- ✅ Orders: 76 records
- ✅ Order items: 0 records
- ❌ Cart items: Table not found in production

## 🔧 Manual Steps Required

### Step 1: Create Staging Tables
Go to: https://app.supabase.com/project/pjckafjhzwegtyhlatus/sql

Execute these SQL blocks in order:

#### 1. Categories Table
```sql
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 2. Products Table
```sql
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  short_description TEXT,
  image_url TEXT,
  category_id UUID REFERENCES categories(id),
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  packaging_type TEXT,
  label_type TEXT,
  packaging_quantity_per_product INTEGER DEFAULT 1,
  label_quantity_per_product INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 3. Product Variants Table
```sql
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  weight_grams INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  sku TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 4. Profiles Table
```sql
CREATE TABLE IF NOT EXISTS profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'customer',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 5. Orders Table
```sql
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES profiles(id),
  status TEXT DEFAULT 'pending',
  payment_method TEXT,
  payment_status TEXT DEFAULT 'pending',
  subtotal DECIMAL(10,2) NOT NULL,
  delivery_fee DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  delivery_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 6. Order Items Table
```sql
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  variant_id UUID REFERENCES product_variants(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 7. Cart Items Table
```sql
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(customer_id, product_id, variant_id)
);
```

### Step 2: Copy Production Data
After creating tables, run this script to copy data:

```bash
node scripts/database/direct-copy-prod-to-staging.js
```

### Step 3: Verify Import
```bash
node scripts/database/verify-staging-import.js
```

### Step 4: Add Staging Test Data
```bash
node scripts/database/add-staging-test-data.js
```

## 🎯 Expected Result
- ✅ Staging has same schema as production
- ✅ Staging has same data as production
- ✅ Additional staging test data added
- ✅ Ready for staging environment testing

## 📋 URLs
- Production: https://app.supabase.com/project/xfnbhheapralprcwjvzl/sql
- Staging: https://app.supabase.com/project/pjckafjhzwegtyhlatus/sql
- Staging App: https://cozycatkitchen-staging.vercel.app

## 🔄 Status
- ✅ Production connection working
- ✅ Production data identified
- ❌ Staging tables need manual creation
- 🔄 Ready for manual SQL execution
