-- Initial schema for local development
-- This creates the basic tables needed for the customer shop

-- Categories
CREATE TABLE IF NOT EXISTS categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    image_url text,
    is_active boolean DEFAULT true,
    display_order integer DEFAULT 0,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    PRIMARY KEY (id),
    UNIQUE (slug)
);

-- Products
CREATE TABLE IF NOT EXISTS products (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    category_id uuid,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    price decimal(10,2) NOT NULL,
    image_url text,
    is_active boolean DEFAULT true,
    featured boolean DEFAULT false,
    display_order integer DEFAULT 0,
    nutritional_info jsonb,
    ingredients text,
    feeding_guidelines text,
    allergens text,
    shelf_life_days integer,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    PRIMARY KEY (id),
    UNIQUE (slug),
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Product Variants
CREATE TABLE IF NOT EXISTS product_variants (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    product_id uuid NOT NULL,
    weight_grams integer NOT NULL,
    price_adjustment decimal(10,2) DEFAULT 0,
    sku text NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    PRIMARY KEY (id),
    UNIQUE (sku),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Profiles (for auth)
CREATE TABLE IF NOT EXISTS profiles (
    id uuid NOT NULL,
    role text NOT NULL DEFAULT 'customer',
    full_name text NOT NULL,
    email text,
    phone text,
    avatar_url text,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    PRIMARY KEY (id)
);

-- Customers
CREATE TABLE IF NOT EXISTS customers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    profile_id uuid NOT NULL,
    phone text NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    PRIMARY KEY (id),
    UNIQUE (profile_id),
    FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- Basic indexes
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active, featured);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_product ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON product_variants(sku);

-- RLS (Row Level Security)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies
-- Categories - everyone can read, only admins can write
CREATE POLICY "Categories are viewable by everyone" ON categories
    FOR SELECT USING (true);
    
CREATE POLICY "Categories are editable by admins" ON categories
    FOR ALL USING (auth.jwt()->>'role' = 'admin');

-- Products - everyone can read, only admins can write
CREATE POLICY "Products are viewable by everyone" ON products
    FOR SELECT USING (true);
    
CREATE POLICY "Products are editable by admins" ON products
    FOR ALL USING (auth.jwt()->>'role' = 'admin');

-- Product variants - everyone can read, only admins can write
CREATE POLICY "Product variants are viewable by everyone" ON product_variants
    FOR SELECT USING (true);
    
CREATE POLICY "Product variants are editable by admins" ON product_variants
    FOR ALL USING (auth.jwt()->>'role' = 'admin');

-- Profiles - users can view their own profile
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);
    
CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Customers - users can view their own customer data
CREATE POLICY "Users can view their own customer data" ON customers
    FOR SELECT USING (auth.uid() = id);
    
CREATE POLICY "Users can update their own customer data" ON customers
    FOR UPDATE USING (auth.uid() = id);

-- Functions for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER handle_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_product_variants_updated_at
    BEFORE UPDATE ON product_variants
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();
