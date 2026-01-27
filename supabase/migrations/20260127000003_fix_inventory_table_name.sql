-- Fix the table name in add_inventory_from_po function
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
    v_is_egg BOOLEAN := FALSE;
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
            v_order_quantity := po_items.quantity;
            v_current_stock := po_items.current_stock;
            v_unit_price := po_items.unit_price;
            v_unit := po_items.ingredient_unit;
            
            -- Check if this is an egg ingredient
            v_is_egg := LOWER(v_ingredient_name) LIKE '%egg%';
            
            -- Convert quantity to proper unit for inventory update
            IF v_is_egg AND v_unit = 'pieces' THEN
                -- For eggs in pieces, convert to grams for inventory storage
                v_order_quantity := v_order_quantity * 50.0; -- 1 egg = 50 grams
            END IF;
            
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
                ' - Received: ' || po_items.quantity || ' ' || 
                CASE 
                    WHEN v_is_egg AND v_unit = 'pieces' THEN 'pieces (' || v_order_quantity || 'g)'
                    ELSE v_unit || ' (' || v_order_quantity || 'g)'
                END,
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
