-- =====================================================
-- CREATE MISSING TABLES IN STAGING (SEQUENTIAL)
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/pjckafjhzwegtyhlatus/sql
-- =====================================================

-- Step 1: Create ingredients table first (needed for foreign keys)
CREATE TABLE IF NOT EXISTS public.ingredients (
    id UUID DEFAULT extensions.uuid_generate_v4() NOT NULL PRIMARY KEY,
    name TEXT NOT NULL,
    unit TEXT NOT NULL,
    current_stock NUMERIC(12,3) DEFAULT 0,
    reorder_level NUMERIC(12,3) DEFAULT 0,
    unit_cost NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    supplier UUID,
    CONSTRAINT check_supplier_uuid CHECK ((supplier IS NULL) OR (supplier::TEXT ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'))
);

-- Step 2: Create product_recipes table
CREATE TABLE IF NOT EXISTS public.product_recipes (
    id UUID DEFAULT extensions.uuid_generate_v4() NOT NULL PRIMARY KEY,
    product_id UUID NOT NULL,
    ingredient_id UUID NOT NULL,
    percentage NUMERIC(5,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Create production_batches table
CREATE TABLE IF NOT EXISTS public.production_batches (
    id UUID DEFAULT extensions.uuid_generate_v4() NOT NULL PRIMARY KEY,
    batch_number TEXT NOT NULL,
    order_id UUID,
    product_id UUID,
    batch_type TEXT DEFAULT 'individual',
    status TEXT DEFAULT 'planned',
    total_orders INTEGER DEFAULT 1,
    total_quantity_produced INTEGER,
    quantity_produced INTEGER,
    total_weight_grams INTEGER,
    waste_factor NUMERIC DEFAULT 7.5,
    planned_date TIMESTAMP WITH TIME ZONE,
    actual_production_date TIMESTAMP WITH TIME ZONE,
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    priority INTEGER DEFAULT 5,
    delivery_created BOOLEAN DEFAULT false,
    notes TEXT,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 4: Create deliveries table
CREATE TABLE IF NOT EXISTS public.deliveries (
    id UUID DEFAULT extensions.uuid_generate_v4() NOT NULL PRIMARY KEY,
    delivery_number TEXT NOT NULL,
    order_id UUID,
    batch_id UUID,
    delivery_partner_id UUID,
    status TEXT DEFAULT 'pending',
    pickup_time TIMESTAMP WITH TIME ZONE,
    delivered_time TIMESTAMP WITH TIME ZONE,
    estimated_delivery_date TIMESTAMP WITH TIME ZONE,
    actual_delivery_date TIMESTAMP WITH TIME ZONE,
    tracking_number TEXT,
    customer_name TEXT,
    customer_email TEXT,
    customer_phone TEXT,
    delivery_address TEXT,
    delivery_partner_name TEXT,
    delivery_partner_phone TEXT,
    items_count INTEGER,
    total_value NUMERIC(10,2),
    delivery_status TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 5: Create delivery_partners table
CREATE TABLE IF NOT EXISTS public.delivery_partners (
    id UUID DEFAULT extensions.uuid_generate_v4() NOT NULL PRIMARY KEY,
    name TEXT NOT NULL,
    contact_phone TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 6: Create order_lifecycle_view (simplified)
CREATE OR REPLACE VIEW public.order_lifecycle_view AS
SELECT 
    o.id,
    o.order_number,
    o.status AS order_status,
    o.customer_id,
    o.total_amount,
    o.created_at AS order_created_at,
    o.updated_at AS order_updated_at,
    pb.id AS production_batch_id,
    pb.status AS production_status,
    pb.created_at AS production_created_at,
    pb.updated_at AS production_updated_at,
    d.id AS delivery_id,
    d.status AS delivery_status,
    d.delivery_number,
    d.created_at AS delivery_created_at,
    d.updated_at AS delivery_updated_at,
    COALESCE(p.full_name, 'Unknown Customer') AS customer_name,
    p.email AS customer_email,
    CASE
        WHEN o.status = 'pending' THEN 'Order Placed'
        WHEN o.status = 'confirmed' THEN 'Order Confirmed'
        WHEN o.status = 'ready_production' THEN 'Preparing Your Order'
        WHEN o.status = 'in_production' THEN 'Preparing Your Order'
        WHEN o.status = 'ready_delivery' THEN 'Ready for Dispatch'
        WHEN o.status = 'out_for_delivery' THEN 'Out for Delivery'
        WHEN o.status = 'delivered' THEN 'Delivered'
        WHEN o.status = 'cancelled' THEN 'Cancelled'
        ELSE o.status
    END AS customer_status,
    GREATEST(o.updated_at, COALESCE(pb.updated_at, o.updated_at), COALESCE(d.updated_at, o.updated_at)) AS last_activity_at
FROM public.orders o
LEFT JOIN public.profiles p ON (o.customer_id = p.id)
LEFT JOIN LATERAL (
    SELECT id, batch_number, product_id, quantity_produced, status, planned_date, 
           actual_production_date, notes, created_at, updated_at, order_id, created_by, 
           start_time, end_time, priority, delivery_created, batch_type, total_orders, 
           total_quantity_produced, waste_factor, total_weight_grams
    FROM public.production_batches
    WHERE production_batches.order_id = o.id
    ORDER BY production_batches.updated_at DESC
    LIMIT 1
) pb ON true
LEFT JOIN LATERAL (
    SELECT id, order_id, delivery_partner_id, pickup_time, delivered_time, status, notes, 
           created_at, updated_at, delivery_number, batch_id, customer_name, customer_email, 
           customer_phone, delivery_address, delivery_partner_name, delivery_partner_phone, 
           estimated_delivery_date, actual_delivery_date, tracking_number, items_count, total_value, delivery_status
    FROM public.deliveries
    WHERE deliveries.order_id = o.id
    ORDER BY deliveries.updated_at DESC
    LIMIT 1
) d ON true
ORDER BY o.id, o.created_at DESC;

-- Step 7: Add foreign key constraints (after all tables exist)
ALTER TABLE public.product_recipes 
ADD CONSTRAINT fk_product_recipes_product_id 
FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;

ALTER TABLE public.product_recipes 
ADD CONSTRAINT fk_product_recipes_ingredient_id 
FOREIGN KEY (ingredient_id) REFERENCES public.ingredients(id) ON DELETE CASCADE;

-- Step 8: Create all indexes for performance
CREATE INDEX IF NOT EXISTS idx_ingredients_name ON public.ingredients(name);
CREATE INDEX IF NOT EXISTS idx_ingredients_supplier ON public.ingredients(supplier);
CREATE INDEX IF NOT EXISTS idx_product_recipes_product_id ON public.product_recipes(product_id);
CREATE INDEX IF NOT EXISTS idx_product_recipes_ingredient_id ON public.product_recipes(ingredient_id);
CREATE INDEX IF NOT EXISTS idx_product_recipes_percentage ON public.product_recipes(percentage);
CREATE INDEX IF NOT EXISTS idx_production_batches_order_id ON public.production_batches(order_id);
CREATE INDEX IF NOT EXISTS idx_production_batches_status ON public.production_batches(status);
CREATE INDEX IF NOT EXISTS idx_production_batches_batch_type ON public.production_batches(batch_type);
CREATE INDEX IF NOT EXISTS idx_deliveries_order_id ON public.deliveries(order_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_batch_id ON public.deliveries(batch_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_status ON public.deliveries(status);
CREATE INDEX IF NOT EXISTS idx_delivery_partners_is_active ON public.delivery_partners(is_active);
CREATE INDEX IF NOT EXISTS idx_delivery_partners_name ON public.delivery_partners(name);

-- Step 9: Verify all tables were created
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('ingredients', 'product_recipes', 'production_batches', 'deliveries', 'delivery_partners', 'order_lifecycle_view')
ORDER BY table_name;
