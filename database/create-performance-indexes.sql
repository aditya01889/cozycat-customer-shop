-- Performance Indexes for Common Queries
-- Optimizes database performance for frequently accessed data

-- Orders table indexes
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status_created_at ON orders(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_not_cancelled ON orders(created_at DESC) WHERE status != 'cancelled';

-- Products table indexes
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active_category ON products(is_active, category_id);

-- Profiles table indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Order items table indexes
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_product ON order_items(order_id, product_id);

-- Addresses table indexes
CREATE INDEX IF NOT EXISTS idx_addresses_customer_id ON addresses(customer_id);
CREATE INDEX IF NOT EXISTS idx_addresses_is_default ON addresses(is_default);

-- Customers table indexes
CREATE INDEX IF NOT EXISTS idx_customers_profile_id ON customers(profile_id);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers(created_at DESC);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_orders_status_customer ON orders(status, customer_id);
CREATE INDEX IF NOT EXISTS idx_products_active_name ON products(is_active, name);
CREATE INDEX IF NOT EXISTS idx_profiles_role_created ON profiles(role, created_at DESC);

-- Indexes for dashboard queries
CREATE INDEX IF NOT EXISTS idx_orders_dashboard_stats ON orders(status, created_at DESC, total_amount);
CREATE INDEX IF NOT EXISTS idx_products_dashboard_count ON products(is_active) WHERE is_active = true;

-- Partial indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_pending ON orders(created_at DESC) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_orders_recent ON orders(created_at DESC) WHERE status != 'cancelled' AND created_at >= NOW() - INTERVAL '30 days';
CREATE INDEX IF NOT EXISTS idx_profiles_admins ON profiles(id) WHERE role = 'admin';

-- Text search indexes (if needed for search functionality)
-- CREATE INDEX IF NOT EXISTS idx_products_name_search ON products USING gin(to_tsvector('english', name));
-- CREATE INDEX IF NOT EXISTS idx_products_description_search ON products USING gin(to_tsvector('english', description));

-- Analyze tables to update statistics
ANALYZE orders;
ANALYZE products;
ANALYZE profiles;
ANALYZE order_items;
ANALYZE addresses;
ANALYZE customers;

-- Index usage monitoring query (for future use)
/*
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes 
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
*/
