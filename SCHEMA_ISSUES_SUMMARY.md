# Schema Issues After Database Synchronization

## Problems Identified

### 1. order_items Table Missing Columns
The frontend expects these columns in `order_items` table:
- ✅ `id` - exists
- ✅ `order_id` - exists  
- ❌ `unit_price` - **MISSING**
- ❌ `total_price` - **MISSING**
- ❌ `created_at` - **MISSING**
- ❌ `updated_at` - **MISSING**
- ❌ `product_variant_id` - **MISSING** (needed for relationship)

### 2. production_batches Relationship Issues
- The frontend tries to query: `production_batches?select=*,products:product_id(name)`
- Error: "Could not find a relationship between 'production_batches' and 'product_id'"
- The `product_id` column exists but the relationship definition is wrong

### 3. Empty Tables Causing Frontend Errors
- `order_items` table is empty, causing frontend components to fail
- Several queries return empty results, breaking UI components

## Solutions Required

### Manual SQL Execution (Recommended)

Execute this SQL in Supabase Dashboard > SQL Editor on the **STAGING** database:

```sql
-- Fix order_items table structure
ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS unit_price DECIMAL(10,2);

ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS total_price DECIMAL(10,2);

ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS product_variant_id UUID REFERENCES product_variants(id);

-- Add sample data for testing
INSERT INTO order_items (id, order_id, product_variant_id, quantity, unit_price, total_price, created_at, updated_at)
SELECT 
    gen_random_uuid() as id,
    o.id as order_id,
    pv.id as product_variant_id,
    1 as quantity,
    COALESCE(o.total_amount, 29.99) as unit_price,
    COALESCE(o.total_amount, 29.99) as total_price,
    o.created_at,
    NOW() as updated_at
FROM orders o
CROSS JOIN LATERAL (
    SELECT id FROM product_variants pv 
    WHERE pv.product_id = (SELECT id FROM products ORDER BY RANDOM() LIMIT 1)
    LIMIT 1
) pv
WHERE o.status IN ('pending', 'confirmed', 'processing')
LIMIT 5
ON CONFLICT (id) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_variant_id ON order_items(product_variant_id);
```

### Alternative: Frontend Code Changes

If manual SQL execution is not possible, the frontend queries need to be updated to:

1. **Remove references to missing columns** in `order_items` queries
2. **Use existing columns only** or handle missing columns gracefully
3. **Fix production_batches relationship** query to use correct column names

### Frontend Files to Check

Based on the error messages, these files need updates:

1. **Operations Dashboard Components**
   - Files querying `order_items` with `unit_price`, `total_price`
   - Files querying `production_batches` with wrong relationships

2. **Production Queue Components**  
   - Same `order_items` column issues
   - Same `production_batches` relationship issues

## Verification Steps

After applying the SQL fixes:

1. ✅ Check `order_items` table has all required columns
2. ✅ Verify sample data exists in `order_items`
3. ✅ Test operations dashboard loads without errors
4. ✅ Test production queue loads without errors
5. ✅ Verify all relationships work correctly

## Root Cause

The database synchronization copied table structures correctly, but:
- Production `order_items` was empty, so no column structure was preserved
- Frontend expects additional columns that weren't in the original table
- Relationship queries assume certain column names that may differ

## Priority

**HIGH** - This blocks all operations page functionality
**IMPACT** - Admin users cannot access operations features
**EFFORT** - Medium (SQL execution + verification)
