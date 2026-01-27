import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function handler(request: NextRequest) {
  try {
    // Verify admin authentication
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || (profile.role !== 'admin' && profile.role !== 'operations')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }
    
    // Create the SQL function
    const sqlFunction = `
CREATE OR REPLACE FUNCTION get_product_group_ingredient_requirements(
    p_product_id UUID
)
RETURNS TABLE (
    ingredient_id UUID,
    ingredient_name TEXT,
    required_quantity DECIMAL(10,3),
    waste_quantity DECIMAL(10,3),
    total_quantity DECIMAL(10,3),
    current_stock DECIMAL(10,3),
    stock_status TEXT,
    supplier_name TEXT,
    supplier_phone TEXT,
    supplier_email TEXT
) AS $$
BEGIN
    RETURN QUERY
    WITH product_orders AS (
        SELECT DISTINCT
            o.id as order_id,
            oi.quantity as order_quantity,
            pv.weight_grams,
            pv.product_id
        FROM orders o
        JOIN order_items oi ON oi.order_id = o.id
        JOIN product_variants pv ON oi.product_variant_id = pv.id
        WHERE pv.product_id = p_product_id
        AND o.status IN ('pending', 'confirmed', 'processing')
    ),
    ingredient_calculations AS (
        SELECT 
            i.id as ingredient_id,
            i.name as ingredient_name,
            i.current_stock,
            s.name as supplier_name,
            s.phone as supplier_phone,
            s.email as supplier_email,
            SUM(po.order_quantity * po.weight_grams * ir.quantity_per_gram) as required_quantity,
            SUM(po.order_quantity * po.weight_grams * ir.quantity_per_gram * 0.075) as waste_quantity,
            SUM(po.order_quantity * po.weight_grams * ir.quantity_per_gram * (1 + 0.075)) as total_quantity
        FROM product_orders po
        JOIN ingredient_requirements ir ON ir.product_id = po.product_id
        JOIN ingredients i ON i.id = ir.ingredient_id
        LEFT JOIN suppliers s ON s.id = i.supplier_id
        GROUP BY i.id, i.name, i.current_stock, s.name, s.phone, s.email
    )
    SELECT 
        ingredient_id,
        ingredient_name,
        required_quantity,
        waste_quantity,
        total_quantity,
        current_stock,
        CASE 
            WHEN current_stock >= total_quantity THEN 'sufficient'
            WHEN current_stock > 0 THEN 'insufficient'
            ELSE 'out_of_stock'
        END as stock_status,
        supplier_name,
        supplier_phone,
        supplier_email
    FROM ingredient_calculations
    ORDER BY 
        CASE 
            WHEN current_stock >= total_quantity THEN 3
            WHEN current_stock > 0 THEN 2
            ELSE 1
        END,
        ingredient_name;
END;
$$ LANGUAGE plpgsql;
    `

    // Return the SQL for manual execution since we can't execute DDL via RPC
    return NextResponse.json({
      success: true,
      message: 'Database function SQL generated successfully',
      sql: sqlFunction,
      instructions: [
        '1. Connect to your Supabase database',
        '2. Run the provided SQL in the SQL editor',
        '3. Grant permissions: GRANT EXECUTE ON FUNCTION get_product_group_ingredient_requirements(UUID) TO authenticated, service_role;'
      ]
    })

  } catch (error) {
    console.error('Error in setup-product-group-function:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const POST = handler
