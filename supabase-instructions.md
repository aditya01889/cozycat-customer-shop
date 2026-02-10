# Supabase Staging Database Update Instructions

## Issue: PostgreSQL client tools not installed on Windows

## Solution: Use Supabase SQL Editor (Easiest)

### Step 1: Go to Supabase Dashboard
```
https://app.supabase.com
```

### Step 2: Select Your Project
- Choose your staging project
- Navigate to **SQL Editor**

### Step 3: Execute SQL Script
1. Open `production_data_inserts.sql` in your editor
2. Copy all content (Ctrl+A, Ctrl+C)
3. Paste into Supabase SQL Editor
4. Click **Run** or press F5

### Step 4: Verify Results
After execution, you should see:
```
Success: Command executed successfully.
Query returned 302 rows in X ms
```

## Alternative: Install PostgreSQL Tools

### Option A: Install PostgreSQL on Windows
1. Download PostgreSQL installer: https://www.postgresql.org/download/windows/
2. Install with command line tools
3. Add to PATH during installation
4. Restart terminal/command prompt

### Option B: Use WSL (Windows Subsystem for Linux)
```bash
# Install PostgreSQL in WSL
sudo apt update
sudo apt install postgresql-client

# Then run the script
export STAGING_DB_CONNECTION='postgresql://postgres:[PASSWORD]@db.pjckafjhzwegtyhlatus.supabase.co:5432/postgres'
python update-staging-db.py
```

## Quick Solution: Use Supabase SQL Editor

**This is the fastest approach** - no installation needed:

1. Copy the SQL from `production_data_inserts.sql`
2. Paste in Supabase SQL Editor  
3. Run the script

The SQL file contains 302 INSERT statements across 10 tables:
- ingredients: 40 records
- product_ingredients: 94 records
- products: 18 records
- product_variants: 22 records
- orders: 76 records
- categories: 4 records
- customers: 3 records
- production_batches: 23 records
- deliveries: 18 records
- delivery_partners: 4 records

## Verification

After running the SQL, verify data in Supabase:
```sql
-- Check record counts
SELECT 'ingredients' as table_name, COUNT(*) as record_count FROM ingredients
UNION ALL
SELECT 'product_ingredients', COUNT(*) FROM product_ingredients
UNION ALL  
SELECT 'products', COUNT(*) FROM products
UNION ALL
SELECT 'product_variants', COUNT(*) FROM product_variants
UNION ALL
SELECT 'orders', COUNT(*) FROM orders
UNION ALL
SELECT 'categories', COUNT(*) FROM categories
UNION ALL
SELECT 'customers', COUNT(*) FROM customers
UNION ALL
SELECT 'production_batches', COUNT(*) FROM production_batches
UNION ALL
SELECT 'deliveries', COUNT(*) FROM deliveries
UNION ALL
SELECT 'delivery_partners', COUNT(*) FROM delivery_partners;
```
