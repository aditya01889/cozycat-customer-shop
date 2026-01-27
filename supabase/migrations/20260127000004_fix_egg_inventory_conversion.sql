-- Fix egg inventory conversion - remove unnecessary conversion to grams
DROP FUNCTION IF EXISTS add_inventory_from_po(UUID);

CREATE OR REPLACE FUNCTION add_inventory_from_po(
    p_po_id UUID
) RETURNS TABLE (
    success BOOLEAN,
    message TEXT,
    ingredients_updated INTEGER
) AS $$
DECLARE
    v_ingredient_id UUID;
    v_ingredient_name TEXT;
    v_order_quantity DECIMAL(10,3);
    v_current_stock DECIMAL(10,3);
    v_new_stock DECIMAL(10,3);
    v_ingredients_updated INTEGER := 0;
    v_unit_price DECIMAL(10,2);
    v_unit TEXT;
BEGIN
    -- Get PO items directly instead of parsing notes
    DECLARE 
        po_items RECORD;
    BEGIN
        FOR po_items IN 
            SELECT 
                poi.ingredient_id,
                poi.quantity,
                poi.unit_price,
                i.name as ingredient_name,
                i.current_stock,
                i.unit as ingredient_unit
            FROM purchase_order_items poi
            JOIN ingredients i ON poi.ingredient_id = i.id
            WHERE poi.purchase_order_id = p_po_id
        LOOP
            v_ingredient_id := po_items.ingredient_id;
            v_ingredient_name := po_items.ingredient_name;
            v_order_quantity := po_items.quantity; -- Use quantity directly (already in correct units)
            v_current_stock := po_items.current_stock;
            v_unit_price := po_items.unit_price;
            v_unit := po_items.ingredient_unit;
            
            -- No conversion needed - inventory stores quantities in native units
            -- Eggs are stored in pieces, other ingredients in their native units
            
            -- Add quantity to inventory
            v_new_stock := v_current_stock + v_order_quantity;
            
            UPDATE ingredients
            SET current_stock = v_new_stock
            WHERE id = v_ingredient_id;
            
            v_ingredients_updated := v_ingredients_updated + 1;
            
            -- Log the update using correct table name
            INSERT INTO stock_transactions (
                ingredient_id,
                transaction_type,
                quantity,
                notes,
                created_at
            ) VALUES (
                v_ingredient_id,
                'purchase',
                v_order_quantity,
                'PO #' || (SELECT order_number FROM purchase_orders WHERE id = p_po_id) || 
                ' - Received: ' || po_items.quantity || ' ' || v_unit,
                NOW()
            );
            
        END LOOP;
        
        IF v_ingredients_updated = 0 THEN
            RETURN QUERY SELECT false, 'No items found in purchase order', 0;
            RETURN;
        END IF;
        
    EXCEPTION WHEN OTHERS THEN
        RETURN QUERY SELECT false, 'Error processing purchase order items: ' || SQLERRM, 0;
        RETURN;
    END;
    
    -- Return success
    RETURN QUERY SELECT 
        true, 
        'Successfully updated inventory for ' || v_ingredients_updated || ' ingredient(s)',
        v_ingredients_updated;
END;
$$ LANGUAGE plpgsql;
