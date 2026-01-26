-- Create the missing RPC function for categories with product counts
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
    COUNT(p.id)::BIGINT as product_count,
    c.created_at,
    c.updated_at
  FROM categories c
  LEFT JOIN products p ON c.id = p.category_id AND p.is_active = true
  WHERE c.is_active = true
  GROUP BY c.id, c.name, c.slug, c.description, c.image_url, c.is_active, c.display_order, c.created_at, c.updated_at
  ORDER BY c.display_order;
END;
$$;

-- Create performance indexes
CREATE INDEX IF NOT EXISTS idx_categories_product_count 
ON categories(id, is_active, display_order);

CREATE INDEX IF NOT EXISTS idx_products_popular 
ON products(is_active, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_products_category_active 
ON products(category_id, is_active, display_order);

CREATE INDEX IF NOT EXISTS idx_products_name_search 
ON products USING gin(to_tsvector('english', name));

-- Create optimized functions for better performance
CREATE OR REPLACE FUNCTION get_products_optimized(
  p_search_term TEXT DEFAULT NULL,
  p_category_id UUID DEFAULT NULL,
  p_limit_count INTEGER DEFAULT 20,
  p_offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  short_description TEXT,
  image_url TEXT,
  is_active BOOLEAN,
  display_order INTEGER,
  category_id UUID,
  category_name TEXT,
  category_slug TEXT,
  min_price NUMERIC,
  max_price NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.slug,
    p.short_description,
    p.image_url,
    p.is_active,
    p.display_order,
    p.category_id,
    c.name as category_name,
    c.slug as category_slug,
    COALESCE(
      (SELECT MIN(pv.price)
       FROM product_variants pv
       WHERE pv.product_id = p.id
      ), 0
    ) as min_price,
    COALESCE(
      (SELECT MAX(pv.price)
       FROM product_variants pv
       WHERE pv.product_id = p.id
      ), 0
    ) as max_price,
    p.created_at,
    p.updated_at
  FROM products p
  LEFT JOIN categories c ON p.category_id = c.id
  WHERE p.is_active = true
    AND (p_search_term IS NULL OR p.name ILIKE '%' || p_search_term || '%')
    AND (p_category_id IS NULL OR p.category_id = p_category_id)
  ORDER BY p.display_order, p.created_at DESC
  LIMIT p_limit_count
  OFFSET p_offset_count;
END;
$$;

-- Create function for product count with filters
CREATE OR REPLACE FUNCTION get_products_count(
  p_search_term TEXT DEFAULT NULL,
  p_category_id UUID DEFAULT NULL
)
RETURNS BIGINT
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN (
    SELECT COUNT(p.id)::BIGINT
    FROM products p
    WHERE p.is_active = true
      AND (p_search_term IS NULL OR p.name ILIKE '%' || p_search_term || '%')
      AND (p_category_id IS NULL OR p.category_id = p_category_id)
  );
END;
$$;

-- Grant permissions to authenticated role
GRANT EXECUTE ON FUNCTION get_categories_with_product_count TO authenticated;
GRANT EXECUTE ON FUNCTION get_products_optimized TO authenticated;
GRANT EXECUTE ON FUNCTION get_products_count TO authenticated;
