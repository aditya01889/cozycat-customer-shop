-- Complete migration setup for staging database
-- Creates ALL tables needed for production data migration
-- Your staging has 17 tables, but none match our target structure

-- 1. Create ingredients table
CREATE TABLE IF NOT EXISTS ingredients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    unit TEXT NOT NULL,
    current_stock DECIMAL(10,3) NOT NULL DEFAULT 0,
    reorder_level DECIMAL(10,3) NOT NULL DEFAULT 0,
    unit_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
    supplier TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Create customers table  
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL UNIQUE,
    phone TEXT,
    whatsapp_number TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Create product_ingredients table (was product_recipes in production)
CREATE TABLE IF NOT EXISTS product_ingredients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ingredient_id UUID NOT NULL REFERENCES ingredients(id),
    percentage DECIMAL(5,2) NOT NULL,
    product_id UUID NOT NULL REFERENCES products(id)
);

-- 5. Create products table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    category_id UUID REFERENCES categories(id),
    description TEXT,
    display_order INTEGER DEFAULT 0,
    image_url TEXT,
    ingredients_display TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    label_quantity_per_product INTEGER,
    label_type TEXT,
    name TEXT NOT NULL,
    nutritional_info JSONB,
    packaging_quantity_per_product INTEGER,
    packaging_type TEXT,
    short_description TEXT,
    slug TEXT
);

-- 6. Create product_variants table
CREATE TABLE IF NOT EXISTS product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    product_id UUID NOT NULL REFERENCES products(id),
    sku TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    compare_at_price DECIMAL(10,2),
    is_active BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER DEFAULT 0,
    image_url TEXT,
    weight_grams DECIMAL(8,2),
    inventory_count INTEGER DEFAULT 0,
    min_order_quantity INTEGER DEFAULT 1,
    max_order_quantity INTEGER
);

-- 7. Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    order_number TEXT NOT NULL UNIQUE,
    customer_id UUID REFERENCES customers(id),
    status TEXT NOT NULL DEFAULT 'pending',
    payment_method TEXT NOT NULL,
    payment_status TEXT NOT NULL DEFAULT 'pending',
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
    delivery_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    delivery_address_id UUID,
    delivery_notes JSONB,
    order_date TIMESTAMPTZ NOT NULL DEFAULT now(),
    confirmed_date TIMESTAMPTZ,
    production_start_date TIMESTAMPTZ,
    ready_date TIMESTAMPTZ,
    delivered_date TIMESTAMPTZ,
    delivery_created BOOLEAN NOT NULL DEFAULT false,
    production_started_at TIMESTAMPTZ,
    production_completed_at TIMESTAMPTZ,
    delivery_created_at TIMESTAMPTZ,
    delivery_pickedup_at TIMESTAMPTZ,
    delivery_in_transit_at TIMESTAMPTZ,
    delivery_delivered_at TIMESTAMPTZ
);

-- 8. Create production_batches table
CREATE TABLE IF NOT EXISTS production_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    batch_number TEXT NOT NULL UNIQUE,
    product_id UUID REFERENCES products(id),
    quantity_produced INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'planned',
    planned_date DATE,
    actual_production_date DATE,
    notes TEXT,
    order_id UUID REFERENCES orders(id),
    created_by UUID REFERENCES customers(id),
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    priority INTEGER NOT NULL DEFAULT 1,
    delivery_created BOOLEAN NOT NULL DEFAULT false,
    batch_type TEXT NOT NULL DEFAULT 'single',
    total_orders INTEGER NOT NULL DEFAULT 0,
    total_quantity_produced DECIMAL(10,2) NOT NULL DEFAULT 0,
    waste_factor DECIMAL(5,2) NOT NULL DEFAULT 0,
    total_weight_grams DECIMAL(10,2)
);

-- 9. Create deliveries table
CREATE TABLE IF NOT EXISTS deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    order_id UUID NOT NULL REFERENCES orders(id),
    delivery_partner_id UUID REFERENCES delivery_partners(id),
    pickup_time TIMESTAMPTZ,
    delivered_time TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'pending',
    notes TEXT,
    delivery_number TEXT NOT NULL UNIQUE,
    batch_id UUID REFERENCES production_batches(id),
    customer_name TEXT,
    customer_email TEXT,
    customer_phone TEXT,
    delivery_address JSONB,
    delivery_partner_name TEXT,
    delivery_partner_phone TEXT,
    delivery_status TEXT NOT NULL DEFAULT 'pending',
    estimated_delivery_date TIMESTAMPTZ,
    actual_delivery_date TIMESTAMPTZ,
    tracking_number TEXT,
    items_count INTEGER NOT NULL DEFAULT 0,
    total_value DECIMAL(10,2) NOT NULL DEFAULT 0
);

-- 10. Create delivery_partners table
CREATE TABLE IF NOT EXISTS delivery_partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    name TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true
);

-- 11. Create all necessary indexes for performance
CREATE INDEX IF NOT EXISTS idx_ingredients_name ON ingredients(name);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_display_order ON categories(display_order);
CREATE INDEX IF NOT EXISTS idx_customers_profile_id ON customers(profile_id);
CREATE INDEX IF NOT EXISTS idx_product_ingredients_product_id ON product_ingredients(product_id);
CREATE INDEX IF NOT EXISTS idx_product_ingredients_ingredient_id ON product_ingredients(ingredient_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON product_variants(sku);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_production_batches_product_id ON production_batches(product_id);
CREATE INDEX IF NOT EXISTS idx_production_batches_order_id ON production_batches(order_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_order_id ON deliveries(order_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_delivery_partner_id ON deliveries(delivery_partner_id);

-- 12. Verify all tables are created
SELECT 
    'ingredients' as table_name,
    EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'ingredients') as exists
UNION ALL
SELECT 
    'categories' as table_name,
    EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'categories') as exists
UNION ALL
SELECT 
    'customers' as table_name,
    EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'customers') as exists
UNION ALL
SELECT 
    'product_ingredients' as table_name,
    EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'product_ingredients') as exists
UNION ALL
SELECT 
    'products' as table_name,
    EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'products') as exists
UNION ALL
SELECT 
    'product_variants' as table_name,
    EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'product_variants') as exists
UNION ALL
SELECT 
    'orders' as table_name,
    EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'orders') as exists
UNION ALL
SELECT 
    'production_batches' as table_name,
    EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'production_batches') as exists
UNION ALL
SELECT 
    'deliveries' as table_name,
    EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'deliveries') as exists
UNION ALL
SELECT 
    'delivery_partners' as table_name,
    EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'delivery_partners') as exists;
