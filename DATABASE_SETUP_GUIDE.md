# Database Setup Guide for Optimized Products Page

## 🚨 Issue Identified

The optimized products page (`/products/optimized`) is failing because it's calling database functions that don't exist:
- `get_categories_with_product_count()` - RPC function
- `popular_products` - Materialized view

## 🔧 Solution: Execute SQL Commands

### **Option 1: Using Supabase Dashboard (Recommended)**

1. **Go to Supabase Dashboard**
   - Open your Supabase project
   - Navigate to the SQL Editor

2. **Execute the Following SQL Commands**

```sql
-- 1. Create get_categories_with_product_count function
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

-- 2. Create popular_products view
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

-- 3. Create performance indexes
CREATE INDEX IF NOT EXISTS idx_categories_product_count ON categories(id, is_active);
CREATE INDEX IF NOT EXISTS idx_products_popular ON products(is_active, created_at);
CREATE INDEX IF NOT EXISTS idx_products_category_active ON products(category_id, is_active, display_order);

-- 4. Grant permissions (if needed)
GRANT EXECUTE ON FUNCTION get_categories_with_product_count TO authenticated;
GRANT SELECT ON popular_products TO authenticated;
```

### **Option 2: Using psql Command Line**

If you have PostgreSQL installed locally:

```bash
psql $DATABASE_URL -f database/missing-functions.sql
```

### **Option 3: Using Database Client**

1. Connect to your database using your preferred client
2. Copy and paste the SQL commands above
3. Execute them in order

## ✅ Verification

After executing the SQL commands, verify the setup:

```sql
-- Test the function
SELECT * FROM get_categories_with_product_count();

-- Test the view
SELECT * FROM popular_products LIMIT 5;

-- Check indexes
SELECT indexname FROM pg_indexes WHERE tablename IN ('categories', 'products');
```

## 🧪 Test the Fix

Once the database setup is complete:

1. **Run the optimization tests**:
   ```bash
   node tests/optimization-validation.js
   ```

2. **Test the optimized products page**:
   - Navigate to `/products/optimized`
   - Check if it loads within 2 seconds
   - Verify products are displayed correctly

## 🚨 Troubleshooting

### **If you get "function does not exist" error:**
- Make sure the SQL was executed successfully
- Check for any syntax errors in the SQL
- Verify you have the necessary permissions

### **If you get "permission denied" error:**
- Ensure you're using the service role key
- Check your database permissions
- Grant necessary permissions to the authenticated role

### **If the page is still slow:**
- Check if the indexes were created successfully
- Verify the function is returning data correctly
- Monitor the database query performance

## 📊 Expected Results

After successful setup:
- ✅ Optimized products page should load in < 2 seconds
- ✅ Categories should display with product counts
- ✅ Popular products should be displayed correctly
- ✅ All optimization tests should pass

## 🔄 Next Steps

1. **Execute the SQL commands** above
2. **Run the optimization tests** to verify the fix
3. **Run regression detection** to ensure no new issues
4. **Monitor performance** in production

---

## 📞 Need Help?

If you encounter any issues:
1. Check the Supabase logs for any SQL errors
2. Verify your database connection
3. Ensure all environment variables are properly set
4. Run the tests to identify specific issues

**Once the database setup is complete, the optimized products page should work correctly and pass all performance tests!** 🎉
