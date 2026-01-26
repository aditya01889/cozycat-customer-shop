-- Missing Database Functions for Optimized Products Page

-- 1. Get categories with product counts
CREATE OR REPLACE FUNCTION get_categories_with_product_count()
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN,
  display_order INTEGER,
  product_count BIGINT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    c.slug,
    c.description,
    c.image_url,
    c.is_active,
    c.display_order,
    COUNT(p.id) as product_count,
    c.created_at,
    c.updated_at
  FROM categories c
  LEFT JOIN products p ON c.id = p.category_id AND p.is_active = true
  WHERE c.is_active = true
  GROUP BY c.id, c.name, c.slug, c.description, c.image_url, c.is_active, c.display_order, c.created_at, c.updated_at
  ORDER BY c.display_order;
END;
$$;

-- 2. Create popular products materialized view
CREATE OR REPLACE VIEW popular_products AS
SELECT 
  p.*,
  c.name as category_name,
  c.slug as category_slug,
  (
    SELECT COUNT(oi.id) as order_count
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    WHERE oi.product_id = p.id AND o.status != 'cancelled'
  ) as order_count
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.is_active = true
ORDER BY 
  (SELECT COUNT(oi.id) FROM order_items oi JOIN orders o ON oi.order_id = o.id WHERE oi.product_id = p.id AND o.status != 'cancelled') DESC NULLS LAST,
  p.created_at DESC;

-- 3. Refresh popular products view function
CREATE OR REPLACE FUNCTION refresh_popular_products()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW popular_products;
END;
$$;

-- 4. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_categories_product_count ON categories(id, is_active);
CREATE INDEX IF NOT EXISTS idx_products_popular ON products(is_active, created_at);
CREATE INDEX IF NOT EXISTS idx_products_category_active ON category_id, is_active, display_order);

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_categories_with_product_count TO authenticated;
GRANT EXECUTE ON FUNCTION refresh_popular_products TO authenticated;
GRANT SELECT ON popular_products TO authenticated;
