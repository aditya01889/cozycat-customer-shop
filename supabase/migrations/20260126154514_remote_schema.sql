


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."add_inventory_from_po"("p_po_id" "uuid") RETURNS TABLE("success" boolean, "message" "text", "ingredients_updated" integer)
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    v_ingredient_id UUID;
    v_ingredient_name TEXT;
    v_order_quantity DECIMAL(10,3);
    v_current_stock DECIMAL(10,3);
    v_new_stock DECIMAL(10,3);
    v_ingredients_updated INTEGER := 0;
    v_order_notes TEXT;
    v_quantity_match BOOLEAN := FALSE;
    v_extracted_quantity DECIMAL(10,3);
BEGIN
    -- Get PO details
    SELECT 
        po.notes,
        po.total_amount
    INTO v_order_notes, v_order_quantity
    FROM purchase_orders po
    WHERE po.id = p_po_id;
    
    -- Check if PO exists
    IF v_order_notes IS NULL THEN
        RETURN QUERY SELECT false, 'Purchase order not found', 0;
        RETURN;
    END IF;
    
    -- Extract quantity from notes (format: "Quantity: X units")
    BEGIN
        v_extracted_quantity := substring(
            v_order_notes,
            position('Quantity: ' in v_order_notes) + 10,
            position(' units' in v_order_notes) - position('Quantity: ' in v_order_notes) - 10
        )::DECIMAL(10,3);
        v_quantity_match := TRUE;
    EXCEPTION WHEN OTHERS THEN
        v_quantity_match := FALSE;
    END;
    
    -- If we couldn't extract quantity, try to get it from total_amount and unit_cost
    IF NOT v_quantity_match OR v_extracted_quantity IS NULL THEN
        -- This is a fallback - ideally we'd have better PO item tracking
        RETURN QUERY SELECT false, 'Could not determine quantity from purchase order', 0;
        RETURN;
    END IF;
    
    -- Extract ingredient name from notes to find the ingredient
    BEGIN
        SELECT i.id, i.name, i.current_stock
        INTO v_ingredient_id, v_ingredient_name, v_current_stock
        FROM ingredients i
        WHERE v_order_notes LIKE '%Auto-generated for ' || i.name || '%';
        
        IF v_ingredient_id IS NULL THEN
            RETURN QUERY SELECT false, 'Could not identify ingredient from purchase order', 0;
            RETURN;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        RETURN QUERY SELECT false, 'Error identifying ingredient from purchase order', 0;
        RETURN;
    END;
    
    -- Add quantity to inventory
    v_new_stock := v_current_stock + v_extracted_quantity;
    
    UPDATE ingredients
    SET current_stock = v_new_stock
    WHERE id = v_ingredient_id;
    
    v_ingredients_updated := 1;
    
    -- Return success
    RETURN QUERY SELECT 
        true, 
        'Added ' || v_extracted_quantity || ' units to ' || v_ingredient_name || '. New stock: ' || v_new_stock,
        v_ingredients_updated;
END;
$$;


ALTER FUNCTION "public"."add_inventory_from_po"("p_po_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."block_insufficient_production"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- Only check for individual order batches
    IF NEW.order_id IS NOT NULL THEN
        IF NOT check_ingredients_for_order(NEW.order_id) THEN
            RAISE EXCEPTION 'Cannot create production batch: Insufficient ingredients for order %', NEW.order_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."block_insufficient_production"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."block_ready_production_status"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- Check if status is being changed to ready_production or in_production
    IF NEW.status IN ('ready_production', 'in_production') AND OLD.status NOT IN ('ready_production', 'in_production') THEN
        -- Check if ingredients are sufficient
        IF NOT check_ingredients_for_order(NEW.id) THEN
            RAISE EXCEPTION 'Cannot mark order % as ready for production: Insufficient ingredients', NEW.id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."block_ready_production_status"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."calculate_order_ingredient_requirements"("p_order_id" "uuid") RETURNS TABLE("ingredient_id" "uuid", "ingredient_name" "text", "required_quantity" numeric, "required_quantity_display" numeric, "display_unit" "text", "waste_quantity" numeric, "waste_quantity_display" numeric, "total_quantity" numeric, "total_quantity_display" numeric, "current_stock" numeric, "current_stock_display" numeric, "stock_status" "text", "supplier_name" "text", "supplier_phone" "text", "supplier_email" "text")
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN QUERY
    WITH ingredient_requirements AS (
        SELECT 
            pr.ingredient_id,
            i.name as ingredient_name,
            i.unit as storage_unit,
            SUM(pr.percentage * oi.quantity * pv.weight_grams / 100) as required_quantity_grams,
            i.current_stock
        FROM order_items oi
        JOIN product_variants pv ON oi.product_variant_id = pv.id
        JOIN product_recipes pr ON pv.product_id = pr.product_id
        JOIN ingredients i ON pr.ingredient_id = i.id
        WHERE oi.order_id = p_order_id
        GROUP BY pr.ingredient_id, i.name, i.unit, i.current_stock
    ),
    converted_quantities AS (
        SELECT 
            ir.ingredient_id,
            ir.ingredient_name,
            ir.storage_unit,
            ir.required_quantity_grams,
            ir.current_stock,
            -- Convert required quantity to storage unit for inventory tracking
            CASE 
                WHEN ir.storage_unit = 'pieces' AND LOWER(ir.ingredient_name) LIKE '%egg%' THEN
                    ir.required_quantity_grams / 50.0 -- Convert grams to pieces for eggs
                ELSE ir.required_quantity_grams
            END as required_quantity_storage,
            -- Convert current stock to grams for calculation
            CASE 
                WHEN ir.storage_unit = 'pieces' AND LOWER(ir.ingredient_name) LIKE '%egg%' THEN
                    ir.current_stock * 50.0 -- Convert pieces to grams for eggs
                ELSE ir.current_stock
            END as current_stock_grams
        FROM ingredient_requirements ir
    ),
    vendor_info AS (
        SELECT 
            cq.ingredient_id,
            cq.ingredient_name,
            cq.storage_unit,
            cq.required_quantity_grams,
            cq.required_quantity_storage,
            cq.current_stock,
            cq.current_stock_grams,
            CASE 
                WHEN cq.current_stock_grams >= cq.required_quantity_grams THEN 'sufficient'
                ELSE 'insufficient'
            END as stock_status,
            COALESCE(v.name, 'No Vendor') as supplier_name,
            COALESCE(v.phone, 'N/A') as supplier_phone,
            COALESCE(v.email, 'N/A') as supplier_email
        FROM converted_quantities cq
        LEFT JOIN ingredients i ON cq.ingredient_id = i.id
        LEFT JOIN vendors v ON i.supplier = v.id
    )
    SELECT 
        vi.ingredient_id,
        vi.ingredient_name,
        vi.required_quantity_grams, -- for calculations
        vi.required_quantity_storage, -- for display/inventory
        vi.storage_unit as display_unit,
        vi.required_quantity_grams * 0.075 as waste_quantity, -- for calculations
        CASE 
            WHEN vi.storage_unit = 'pieces' AND LOWER(vi.ingredient_name) LIKE '%egg%' THEN
                (vi.required_quantity_grams * 0.075) / 50.0 -- Convert waste to pieces for eggs
            ELSE vi.required_quantity_grams * 0.075
        END as waste_quantity_display,
        vi.required_quantity_grams * 1.075 as total_quantity, -- for calculations
        CASE 
            WHEN vi.storage_unit = 'pieces' AND LOWER(vi.ingredient_name) LIKE '%egg%' THEN
                (vi.required_quantity_grams * 1.075) / 50.0 -- Convert total to pieces for eggs
            ELSE vi.required_quantity_grams * 1.075
        END as total_quantity_display,
        vi.current_stock_grams, -- for calculations
        vi.current_stock, -- for display
        vi.stock_status,
        vi.supplier_name,
        vi.supplier_phone,
        vi.supplier_email
    FROM vendor_info vi;
END;
$$;


ALTER FUNCTION "public"."calculate_order_ingredient_requirements"("p_order_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."calculate_order_item_ingredient_requirements"("p_order_item_id" "uuid") RETURNS TABLE("ingredient_id" "uuid", "ingredient_name" "text", "required_quantity" numeric, "waste_quantity" numeric, "total_quantity" numeric, "current_stock" numeric, "stock_status" "text", "supplier_name" "text", "supplier_phone" "text", "supplier_email" "text")
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN QUERY
    WITH item_details AS (
        SELECT 
            oi.quantity,
            pv.product_id,
            pv.weight_grams
        FROM order_items oi
        JOIN product_variants pv ON oi.product_variant_id = pv.id
        WHERE oi.id = p_order_item_id
    ),
    ingredient_requirements AS (
        SELECT 
            i.id as ingredient_id,
            i.name as ingredient_name,
            ir.quantity_per_gram * id.total_weight_grams * item.quantity as required_quantity,
            ir.quantity_per_gram * id.total_weight_grams * item.quantity * 0.075 as waste_quantity,
            (ir.quantity_per_gram * id.total_weight_grams * item.quantity) * (1 + 0.075) as total_quantity,
            i.current_stock,
            CASE 
                WHEN i.current_stock >= (ir.quantity_per_gram * id.total_weight_grams * item.quantity) * (1 + 0.075) THEN 'sufficient'
                WHEN i.current_stock > 0 THEN 'insufficient'
                ELSE 'out_of_stock'
            END as stock_status,
            s.name as supplier_name,
            s.phone as supplier_phone,
            s.email as supplier_email
        FROM item_details item
        JOIN ingredient_requirements ir ON ir.product_id = item.product_id
        JOIN ingredients i ON i.id = ir.ingredient_id
        LEFT JOIN suppliers s ON s.id = i.supplier_id,
        (
            SELECT SUM(pv.weight_grams) as total_weight_grams
            FROM product_variants pv
            WHERE pv.product_id = item.product_id
        ) id
    )
    SELECT * FROM ingredient_requirements;
END;
$$;


ALTER FUNCTION "public"."calculate_order_item_ingredient_requirements"("p_order_item_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."can_produce_order"("p_order_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN TRUE;
END;
$$;


ALTER FUNCTION "public"."can_produce_order"("p_order_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."can_start_group_production"("p_product_id" "uuid") RETURNS TABLE("can_produce" boolean, "missing_ingredients" "text"[], "message" "text", "total_orders_affected" bigint)
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    missing_ingredients_array TEXT[] := '{}';
    ingredient_record RECORD;
    order_count BIGINT;
BEGIN
    -- Count orders for this product
    SELECT COUNT(DISTINCT oi.order_id) INTO order_count
    FROM order_items oi
    JOIN product_variants pv ON oi.product_variant_id = pv.id
    WHERE pv.product_id = p_product_id
    AND EXISTS (
        SELECT 1 FROM orders o 
        WHERE o.id = oi.order_id AND o.status = 'confirmed'
    );
    
    -- Check each ingredient requirement for all confirmed orders of this product
    FOR ingredient_record IN 
        SELECT 
            i.name as ingredient_name,
            COALESCE(i.current_stock, 0) as current_stock,
            COALESCE(SUM(oi.quantity * pv.weight_grams * (pr.percentage / 100)), 0) as required_quantity
        FROM order_items oi
        JOIN product_variants pv ON oi.product_variant_id = pv.id
        JOIN product_recipes pr ON pv.product_id = pr.product_id
        JOIN ingredients i ON pr.ingredient_id = i.id
        JOIN orders o ON oi.order_id = o.id
        WHERE pv.product_id = p_product_id AND o.status = 'confirmed'
        GROUP BY i.id, i.name, i.current_stock
        HAVING COALESCE(i.current_stock, 0) < COALESCE(SUM(oi.quantity * pv.weight_grams * (pr.percentage / 100)), 0)
    LOOP
        missing_ingredients_array := array_append(missing_ingredients_array, 
            ingredient_record.ingredient_name || ' (Need: ' || ROUND(ingredient_record.required_quantity, 2) || 'g, Have: ' || ROUND(ingredient_record.current_stock, 2) || 'g)'
        );
    END LOOP;
    
    -- Return results
    IF array_length(missing_ingredients_array, 1) > 0 THEN
        RETURN QUERY SELECT 
            FALSE as can_produce,
            missing_ingredients_array as missing_ingredients,
            'Insufficient ingredients for group production' as message,
            order_count as total_orders_affected;
    ELSE
        RETURN QUERY SELECT 
            TRUE as can_produce,
            ARRAY[]::TEXT[] as missing_ingredients,
            'All ingredients available for group production' as message,
            order_count as total_orders_affected;
    END IF;
END;
$$;


ALTER FUNCTION "public"."can_start_group_production"("p_product_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."can_start_production"("p_order_id" "uuid") RETURNS TABLE("can_produce" boolean, "missing_ingredients" "text"[], "message" "text")
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    missing_ingredients_array TEXT[] := '{}';
    ingredient_record RECORD;
BEGIN
    -- Check each ingredient requirement for this order
    -- Using the actual table structure based on your existing functions
    FOR ingredient_record IN 
        SELECT 
            i.name as ingredient_name,
            COALESCE(i.current_stock, 0) as current_stock,
            COALESCE(SUM(oi.quantity * pv.weight_grams * (pr.percentage / 100)), 0) as required_quantity
        FROM orders o
        JOIN order_items oi ON oi.order_id = o.id
        JOIN product_variants pv ON oi.product_variant_id = pv.id  -- Fixed: use product_variant_id
        JOIN product_recipes pr ON pv.product_id = pr.product_id  -- Fixed: use product_recipes table
        JOIN ingredients i ON pr.ingredient_id = i.id
        WHERE o.id = p_order_id
        GROUP BY i.id, i.name, i.current_stock
        HAVING COALESCE(i.current_stock, 0) < COALESCE(SUM(oi.quantity * pv.weight_grams * (pr.percentage / 100)), 0)
    LOOP
        missing_ingredients_array := array_append(missing_ingredients_array, 
            ingredient_record.ingredient_name || ' (Need: ' || ROUND(ingredient_record.required_quantity, 2) || 'g, Have: ' || ROUND(ingredient_record.current_stock, 2) || 'g)'
        );
    END LOOP;
    
    -- Return results
    IF array_length(missing_ingredients_array, 1) > 0 THEN
        RETURN QUERY SELECT 
            FALSE as can_produce,
            missing_ingredients_array as missing_ingredients,
            'Insufficient ingredients for production' as message;
    ELSE
        RETURN QUERY SELECT 
            TRUE as can_produce,
            ARRAY[]::TEXT[] as missing_ingredients,
            'All ingredients available for production' as message;
    END IF;
END;
$$;


ALTER FUNCTION "public"."can_start_production"("p_order_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."cancel_purchase_order"("p_po_id" "uuid") RETURNS TABLE("success" boolean, "message" "text")
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    v_po_status TEXT;
    v_order_number TEXT;
BEGIN
    -- Get PO status and order number
    SELECT status, order_number INTO v_po_status, v_order_number
    FROM purchase_orders
    WHERE id = p_po_id;
    
    -- Check if PO exists
    IF v_order_number IS NULL THEN
        RETURN QUERY SELECT false, 'Purchase order not found';
        RETURN;
    END IF;
    
    -- Check if PO can be cancelled (only draft or sent status)
    IF v_po_status NOT IN ('draft', 'sent') THEN
        RETURN QUERY SELECT false, 'Cannot cancel purchase order in ' || v_po_status || ' status';
        RETURN;
    END IF;
    
    -- Delete the purchase order
    DELETE FROM purchase_orders WHERE id = p_po_id;
    
    -- Return success
    RETURN QUERY SELECT 
        true, 
        'Purchase order ' || v_order_number || ' cancelled successfully';
END;
$$;


ALTER FUNCTION "public"."cancel_purchase_order"("p_po_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_ingredients_for_order"("p_order_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    insufficient_count INTEGER;
BEGIN
    -- Count ingredients that are insufficient
    SELECT COUNT(*) INTO insufficient_count
    FROM (
        SELECT 
            i.id,
            COALESCE(i.current_stock, 0) as stock,
            COALESCE(SUM(oi.quantity * pv.weight_grams * (pr.percentage / 100)), 0) as needed
        FROM orders o
        JOIN order_items oi ON oi.order_id = o.id
        JOIN product_variants pv ON oi.product_variant_id = pv.id
        LEFT JOIN product_recipes pr ON pv.product_id = pr.product_id
        LEFT JOIN ingredients i ON pr.ingredient_id = i.id
        WHERE o.id = p_order_id
        AND i.id IS NOT NULL  -- Only count ingredients that exist
        GROUP BY i.id, i.current_stock
        HAVING COALESCE(i.current_stock, 0) < COALESCE(SUM(oi.quantity * pv.weight_grams * (pr.percentage / 100)), 0)
    ) insufficient;
    
    -- Return FALSE if any ingredients are insufficient
    RETURN COALESCE(insufficient_count, 0) = 0;
END;
$$;


ALTER FUNCTION "public"."check_ingredients_for_order"("p_order_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_order_delivery_ready"("p_order_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    v_total_items INTEGER;
    v_completed_items INTEGER;
BEGIN
    -- Count total items for this order
    SELECT COUNT(*) INTO v_total_items
    FROM order_items
    WHERE order_id = p_order_id;
    
    -- Count items that are in completed batches (corrected logic)
    SELECT COUNT(*) INTO v_completed_items
    FROM order_items oi
    WHERE oi.order_id = p_order_id
    AND EXISTS (
        SELECT 1 
        FROM batch_order_items boi
        JOIN production_batches pb ON pb.id = boi.batch_id
        WHERE boi.order_item_id = oi.id 
        AND pb.status = 'completed'
    );
    
    -- Return true if all items are completed
    RETURN v_completed_items = v_total_items AND v_total_items > 0;
END;
$$;


ALTER FUNCTION "public"."check_order_delivery_ready"("p_order_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."convert_ingredient_quantity"("p_ingredient_id" "uuid", "p_quantity" numeric, "p_from_unit" "text", "p_to_unit" "text") RETURNS numeric
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    v_conversion_factor DECIMAL(10,3);
    v_result DECIMAL(10,3);
BEGIN
    -- If units are the same, no conversion needed
    IF p_from_unit = p_to_unit THEN
        RETURN p_quantity;
    END IF;
    
    -- Get conversion factor
    SELECT conversion_factor INTO v_conversion_factor
    FROM ingredient_unit_conversions
    WHERE ingredient_id = p_ingredient_id
    AND from_unit = p_from_unit
    AND to_unit = p_to_unit
    AND is_primary = true;
    
    -- If no conversion found, assume 1:1
    IF v_conversion_factor IS NULL THEN
        v_conversion_factor := 1.0;
    END IF;
    
    v_result := p_quantity * v_conversion_factor;
    RETURN v_result;
END;
$$;


ALTER FUNCTION "public"."convert_ingredient_quantity"("p_ingredient_id" "uuid", "p_quantity" numeric, "p_from_unit" "text", "p_to_unit" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."correct_egg_stock"() RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    v_egg_id UUID;
    v_current_stock DECIMAL(10,3);
    v_corrected_stock DECIMAL(10,3);
BEGIN
    -- Get egg ingredient
    SELECT id, current_stock INTO v_egg_id, v_current_stock
    FROM ingredients 
    WHERE LOWER(name) LIKE '%egg%' 
    LIMIT 1;
    
    IF v_egg_id IS NULL THEN
        RETURN 'No eggs found in inventory';
    END IF;
    
    -- If stock is less than 1, it's likely in grams
    IF v_current_stock < 1 THEN
        v_corrected_stock := v_current_stock * 50.0;
        
        UPDATE ingredients 
        SET current_stock = v_corrected_stock,
            updated_at = NOW()
        WHERE id = v_egg_id;
        
        RETURN 'Corrected egg stock from ' || v_current_stock || ' to ' || v_corrected_stock || ' pieces';
    ELSE
        RETURN 'Egg stock appears correct: ' || v_current_stock || ' pieces';
    END IF;
END;
$$;


ALTER FUNCTION "public"."correct_egg_stock"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_delivery_for_completed_order"("p_order_id" "uuid") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_delivery_id UUID;
    v_delivery_number TEXT;
    v_order_exists BOOLEAN;
BEGIN
    -- Check if order exists and is ready for delivery
    SELECT EXISTS(
        SELECT 1 FROM orders o 
        WHERE o.id = p_order_id 
        AND o.delivery_created = FALSE
        AND EXISTS(
            SELECT 1 FROM order_items oi
            JOIN batch_order_items boi ON oi.id = boi.order_item_id
            JOIN production_batches pb ON boi.batch_id = pb.id
            WHERE oi.order_id = o.id
            AND pb.status = 'completed'
            AND oi.quantity = boi.quantity
        )
    ) INTO v_order_exists;
    
    IF NOT v_order_exists THEN
        RETURN NULL;
    END IF;
    
    -- Generate unique delivery number using UUID to avoid duplicates
    v_delivery_number := 'DEL-' || TO_CHAR(NOW(), 'YYYY-MM-DD') || '-' || 
                        SUBSTRING(EXTRACT(EPOCH FROM NOW())::TEXT, 1, 6) || '-' ||
                        SUBSTRING(GEN_RANDOM_UUID()::TEXT, 1, 8);
    
    -- Create the delivery
    INSERT INTO deliveries (
        delivery_number,
        order_id,
        status,
        estimated_delivery_date,
        notes,
        created_at,
        updated_at
    ) VALUES (
        v_delivery_number,
        p_order_id,
        'in_progress',
        NOW() + INTERVAL '3 days',
        'Auto-created when all order items were completed for order: ' || 
        (SELECT order_number FROM orders WHERE id = p_order_id),
        NOW(),
        NOW()
    ) RETURNING id INTO v_delivery_id;
    
    -- Update order to mark delivery as created
    UPDATE orders 
    SET delivery_created = TRUE, updated_at = NOW()
    WHERE id = p_order_id;
    
    RETURN v_delivery_id;
END;
$$;


ALTER FUNCTION "public"."create_delivery_for_completed_order"("p_order_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_production_batch"("p_order_id" "uuid", "p_notes" "text" DEFAULT NULL::"text") RETURNS "uuid"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    v_batch_id UUID;
    v_batch_number TEXT;
    v_can_produce BOOLEAN;
    v_order_status TEXT;
    v_packaging_result TEXT;
BEGIN
    -- Check if order can be produced
    v_can_produce := can_produce_order(p_order_id);
    
    IF NOT v_can_produce THEN
        RAISE EXCEPTION 'Order cannot be produced due to insufficient ingredients';
    END IF;
    
    -- Get current order status
    SELECT status INTO v_order_status FROM orders WHERE id = p_order_id;
    
    IF v_order_status != 'pending' THEN
        RAISE EXCEPTION 'Order must be in pending status to start production';
    END IF;
    
    -- Generate batch number
    v_batch_number := generate_batch_number();
    
    -- Create production batch
    INSERT INTO production_batches (
        batch_number,
        order_id,
        status,
        total_weight_grams,
        waste_factor,
        notes,
        created_by
    ) VALUES (
        v_batch_number,
        p_order_id,
        'planned',
        (SELECT SUM(oi.quantity * pv.weight_grams) 
         FROM order_items oi 
         JOIN product_variants pv ON oi.product_variant_id = pv.id 
         WHERE oi.order_id = p_order_id),
        7.5, -- 7.5% waste factor
        p_notes,
        auth.uid()
    ) RETURNING id INTO v_batch_id;
    
    -- Calculate and record ingredient usage with unit conversion
    INSERT INTO batch_ingredient_usage (
        batch_id,
        ingredient_id,
        required_quantity,
        waste_quantity,
        total_quantity,
        stock_before,
        stock_after,
        deduction_status
    )
    SELECT 
        v_batch_id,
        req.ingredient_id,
        req.total_quantity, -- Store in grams for consistency
        req.waste_quantity,
        req.total_quantity,
        req.current_stock,
        req.current_stock - CASE 
            WHEN req.display_unit = 'pieces' AND LOWER(req.ingredient_name) LIKE '%egg%' THEN
                CEIL(req.total_quantity / 50.0) -- Convert grams to pieces, round up for eggs
            ELSE req.total_quantity
        END,
        'deducted'
    FROM calculate_order_ingredient_requirements(p_order_id) req;
    
    -- Update ingredient stock levels with proper unit conversion
    UPDATE ingredients i
    SET current_stock = i.current_stock - CASE 
        WHEN i.unit = 'pieces' AND LOWER(i.name) LIKE '%egg%' THEN
            CEIL(req.total_quantity / 50.0) -- Convert grams to pieces, round up for eggs
        ELSE req.total_quantity
    END
    FROM calculate_order_ingredient_requirements(p_order_id) req
    WHERE i.id = req.ingredient_id;
    
    -- Record stock transactions with proper units
    INSERT INTO stock_transactions (
        ingredient_id,
        transaction_type,
        quantity,
        notes,
        created_by
    )
    SELECT 
        req.ingredient_id,
        'production_use',
        CASE 
            WHEN req.display_unit = 'pieces' AND LOWER(req.ingredient_name) LIKE '%egg%' THEN
                CEIL(req.total_quantity / 50.0) -- Record in pieces for inventory
            ELSE req.total_quantity
        END,
        'Batch: ' || v_batch_number || ' | Used: ' || req.total_quantity || 'g = ' || 
        CASE 
            WHEN req.display_unit = 'pieces' AND LOWER(req.ingredient_name) LIKE '%egg%' THEN
                CEIL(req.total_quantity / 50.0) || ' pieces'
            ELSE req.total_quantity || 'g'
        END,
        auth.uid()
    FROM calculate_order_ingredient_requirements(p_order_id) req
    JOIN ingredients i ON req.ingredient_id = i.id;
    
    -- NEW: Deduct packaging and labels
    v_packaging_result := deduct_packaging_and_labels(p_order_id);
    
    -- Update order status
    UPDATE orders 
    SET status = 'in_production',
        updated_at = NOW()
    WHERE id = p_order_id;
    
    -- Record ingredient updates for tracking
    INSERT INTO ingredient_updates (
        ingredient_id,
        previous_stock,
        new_stock,
        previous_cost,
        new_cost,
        previous_supplier,
        new_supplier,
        update_type,
        notes,
        created_by
    )
    SELECT 
        req.ingredient_id,
        req.current_stock as previous_stock,
        req.current_stock - CASE 
            WHEN req.display_unit = 'pieces' AND LOWER(req.ingredient_name) LIKE '%egg%' THEN
                CEIL(req.total_quantity / 50.0)
            ELSE req.total_quantity
        END as new_stock,
        i.unit_cost as previous_cost,
        i.unit_cost as new_cost,
        i.supplier as previous_supplier,
        i.supplier as new_supplier,
        'production_use',
        'Batch: ' || v_batch_number || ' | Deducted: ' || 
        CASE 
            WHEN req.display_unit = 'pieces' AND LOWER(req.ingredient_name) LIKE '%egg%' THEN
                CEIL(req.total_quantity / 50.0) || ' pieces (' || req.total_quantity || 'g)'
            ELSE req.total_quantity || 'g'
        END || ' | ' || v_packaging_result,
        auth.uid()
    FROM calculate_order_ingredient_requirements(p_order_id) req
    JOIN ingredients i ON req.ingredient_id = i.id;
    
    RETURN v_batch_id;
END;
$$;


ALTER FUNCTION "public"."create_production_batch"("p_order_id" "uuid", "p_notes" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."create_production_batch"("p_order_id" "uuid", "p_notes" "text") IS 'Simple production batch creation with minimal columns and correct product_id references';



CREATE OR REPLACE FUNCTION "public"."create_production_batch_for_product_group"("p_product_id" "uuid") RETURNS "uuid"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    v_batch_id UUID;
    v_batch_number TEXT;
    v_product_group RECORD;
    v_counter INTEGER := 0;
    v_max_attempts INTEGER := 10;
BEGIN
    -- Get product group information
    SELECT * INTO v_product_group 
    FROM get_product_groups_for_batching() 
    WHERE product_id = p_product_id;
    
    IF v_product_group IS NULL THEN
        RAISE EXCEPTION 'No confirmed orders found for product';
    END IF;
    
    -- Generate unique batch number with retry logic
    LOOP
        v_counter := v_counter + 1;
        v_batch_number := 'BATCH-' || TO_CHAR(NOW(), 'YYYY-MM-DD') || '-' || LPAD(EXTRACT(MICROSECONDS FROM NOW())::text, 6, '0') || '-' || v_counter;
        
        -- Check if this batch number already exists
        IF NOT EXISTS (SELECT 1 FROM production_batches WHERE batch_number = v_batch_number) THEN
            EXIT; -- Found a unique batch number
        END IF;
        
        -- Safety check to prevent infinite loop
        IF v_counter >= v_max_attempts THEN
            RAISE EXCEPTION 'Could not generate unique batch number after % attempts', v_max_attempts;
        END IF;
        
        -- Small delay to ensure different microseconds
        PERFORM pg_sleep(0.001);
    END LOOP;
    
    -- Create production batch
    INSERT INTO production_batches (
        batch_number,
        order_id, -- Will be NULL for group batches
        product_id,
        batch_type,
        status,
        total_orders,
        total_quantity_produced,
        quantity_produced,
        notes,
        created_by,
        priority,
        total_weight_grams,
        waste_factor
    ) VALUES (
        v_batch_number,
        NULL, -- No single order for group batches
        p_product_id,
        'group',
        'planned',
        v_product_group.order_count::INTEGER,
        v_product_group.total_quantity::INTEGER,
        v_product_group.total_quantity::INTEGER,
        p_notes,
        COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::UUID),
        1, -- Default priority
        v_product_group.total_weight_grams,
        0.075 -- 7.5% waste factor
    ) RETURNING id INTO v_batch_id;
    
    -- Link order items to batch using batch_order_items table
    INSERT INTO batch_order_items (batch_id, order_id, order_item_id, quantity)
    SELECT 
        v_batch_id, 
        oi.order_id,
        oi.id,
        oi.quantity
    FROM unnest(v_product_group.order_item_ids) as order_item_id
    JOIN order_items oi ON oi.id = order_item_id;
    
    -- Calculate and record ingredient usage for the entire group using batch_ingredients table
    INSERT INTO batch_ingredients (
        batch_id,
        ingredient_id,
        planned_quantity,
        actual_quantity
    )
    SELECT 
        v_batch_id,
        req.ingredient_id,
        SUM(req.total_quantity) as planned_quantity,
        SUM(req.total_quantity) as actual_quantity -- Use planned as actual for now
    FROM (
        SELECT 
            pg.order_item_ids,
            pr.ingredient_id,
            SUM(pr.percentage * oi.quantity / 100 * 1.075) as total_quantity -- including waste
        FROM get_product_groups_for_batching() pg
        JOIN unnest(pg.order_item_ids) order_item_id ON true
        JOIN order_items oi ON oi.id = order_item_id
        JOIN product_variants pv ON oi.product_variant_id = pv.id
        JOIN product_recipes pr ON pv.product_id = pr.product_id
        WHERE pg.product_id = p_product_id
        GROUP BY pr.ingredient_id, pg.order_item_ids
    ) req
    GROUP BY req.ingredient_id;
    
    -- Update ingredient stock levels
    UPDATE ingredients i
    SET current_stock = i.current_stock - usage.total_quantity
    FROM (
        SELECT 
            pr.ingredient_id,
            SUM(pr.percentage * oi.quantity / 100 * 1.075) as total_quantity
        FROM unnest(v_product_group.order_item_ids) as order_item_id
        JOIN order_items oi ON oi.id = order_item_id
        JOIN product_variants pv ON oi.product_variant_id = pv.id
        JOIN product_recipes pr ON pv.product_id = pr.product_id
        GROUP BY pr.ingredient_id
    ) usage
    WHERE i.id = usage.ingredient_id;
    
    -- Update order statuses to in_production
    UPDATE orders 
    SET status = 'in_production',
        updated_at = NOW()
    WHERE id = ANY(
        SELECT DISTINCT order_id 
        FROM unnest(v_product_group.order_item_ids) as order_item_id
        JOIN order_items oi ON oi.id = order_item_id
    );
    
    RETURN v_batch_id;
END;
$$;


ALTER FUNCTION "public"."create_production_batch_for_product_group"("p_product_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_production_batch_for_product_group"("p_product_id" "uuid", "p_notes" "text" DEFAULT NULL::"text") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_batch_id UUID;
    v_batch_number TEXT;
    v_product_group RECORD;
BEGIN
    -- Get product group information
    SELECT * INTO v_product_group 
    FROM get_product_groups_for_batching() 
    WHERE product_id = p_product_id;
    
    IF v_product_group IS NULL THEN
        RAISE EXCEPTION 'No confirmed orders found for product';
    END IF;
    
    -- Generate batch number
    v_batch_number := 'BATCH-' || TO_CHAR(NOW(), 'YYYY-MM-DD') || '-' || LPAD(EXTRACT(MICROSECONDS FROM NOW())::text, 6, '0');
    
    -- Create production batch
    INSERT INTO production_batches (
        batch_number,
        order_id, -- Will be NULL for group batches
        product_id,
        batch_type,
        status,
        total_orders,
        total_quantity_produced,
        quantity_produced,
        notes,
        created_by,
        priority,
        total_weight_grams,
        waste_factor
    ) VALUES (
        v_batch_number,
        NULL, -- No single order for group batches
        p_product_id,
        'group',
        'planned',
        v_product_group.order_count::INTEGER,
        v_product_group.total_quantity::INTEGER,
        v_product_group.total_quantity::INTEGER,
        p_notes,
        COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::UUID),
        1, -- Default priority
        v_product_group.total_weight_grams,
        0.075 -- 7.5% waste factor
    ) RETURNING id INTO v_batch_id;
    
    -- Link order items to batch using batch_order_items table
    INSERT INTO batch_order_items (batch_id, order_id, order_item_id, quantity)
    SELECT 
        v_batch_id, 
        oi.order_id,
        oi.id,
        oi.quantity
    FROM unnest(v_product_group.order_item_ids) as order_item_id
    JOIN order_items oi ON oi.id = order_item_id;
    
    -- Calculate and record ingredient usage for the entire group using batch_ingredients table
    INSERT INTO batch_ingredients (
        batch_id,
        ingredient_id,
        planned_quantity,
        actual_quantity
    )
    SELECT 
        v_batch_id,
        req.ingredient_id,
        SUM(req.total_quantity) as planned_quantity,
        SUM(req.total_quantity) as actual_quantity -- Use planned as actual for now
    FROM (
        SELECT 
            pg.order_item_ids,
            pr.ingredient_id,
            SUM(pr.percentage * oi.quantity / 100 * 1.075) as total_quantity -- including waste
        FROM get_product_groups_for_batching() pg
        JOIN unnest(pg.order_item_ids) order_item_id ON true
        JOIN order_items oi ON oi.id = order_item_id
        JOIN product_variants pv ON oi.product_variant_id = pv.id
        JOIN product_recipes pr ON pv.product_id = pr.product_id
        WHERE pg.product_id = p_product_id
        GROUP BY pr.ingredient_id, pg.order_item_ids
    ) req
    GROUP BY req.ingredient_id;
    
    -- Update ingredient stock levels
    UPDATE ingredients i
    SET current_stock = i.current_stock - usage.total_quantity
    FROM (
        SELECT 
            pr.ingredient_id,
            SUM(pr.percentage * oi.quantity / 100 * 1.075) as total_quantity
        FROM unnest(v_product_group.order_item_ids) as order_item_id
        JOIN order_items oi ON oi.id = order_item_id
        JOIN product_variants pv ON oi.product_variant_id = pv.id
        JOIN product_recipes pr ON pv.product_id = pr.product_id
        GROUP BY pr.ingredient_id
    ) usage
    WHERE i.id = usage.ingredient_id;
    
    -- Update order statuses to in_production
    UPDATE orders 
    SET status = 'in_production',
        updated_at = NOW()
    WHERE id = ANY(
        SELECT DISTINCT order_id 
        FROM unnest(v_product_group.order_item_ids) as order_item_id
        JOIN order_items oi ON oi.id = order_item_id
    );
    
    RETURN v_batch_id;
END;
$$;


ALTER FUNCTION "public"."create_production_batch_for_product_group"("p_product_id" "uuid", "p_notes" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."deduct_order_ingredients"("p_order_id" "uuid") RETURNS TABLE("success" boolean, "message" "text", "ingredients_updated" integer)
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    v_ingredients_updated INTEGER := 0;
    v_ingredient_id UUID;
    v_total_quantity DECIMAL(10,3);
    v_current_stock DECIMAL(10,3);
BEGIN
    -- Get all ingredient requirements for the order
    FOR v_ingredient_id, v_total_quantity IN
        SELECT ingredient_id, SUM(total_quantity)
        FROM calculate_order_ingredient_requirements(p_order_id)
        GROUP BY ingredient_id
    LOOP
        -- Get current stock
        SELECT current_stock INTO v_current_stock
        FROM ingredients
        WHERE id = v_ingredient_id;
        
        -- Check if sufficient stock
        IF v_current_stock >= v_total_quantity THEN
            -- Deduct from inventory
            UPDATE ingredients
            SET current_stock = current_stock - v_total_quantity
            WHERE id = v_ingredient_id;
            
            v_ingredients_updated := v_ingredients_updated + 1;
        END IF;
    END LOOP;
    
    -- Return success
    RETURN QUERY SELECT 
        true, 
        'Deducted ingredients for ' || v_ingredients_updated || ' items',
        v_ingredients_updated;
END;
$$;


ALTER FUNCTION "public"."deduct_order_ingredients"("p_order_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."deduct_packaging_and_labels"("p_order_id" "uuid") RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    v_order_status TEXT;
    v_deduction_count INTEGER := 0;
    v_packaging_deducted INTEGER := 0;
    v_labels_deducted INTEGER := 0;
    v_result TEXT := '';
    item RECORD;
BEGIN
    -- Get current order status
    SELECT status INTO v_order_status FROM orders WHERE id = p_order_id;
    
    IF v_order_status != 'in_production' THEN
        RETURN 'Order must be in production status to deduct packaging';
    END IF;
    
    -- Deduct packaging for each product in the order
    FOR item IN 
        SELECT 
            oi.quantity,
            p.packaging_type,
            p.packaging_quantity_per_product,
            p.label_type,
            p.label_quantity_per_product
        FROM order_items oi
        JOIN product_variants pv ON oi.product_variant_id = pv.id
        JOIN products p ON pv.product_id = p.id
        WHERE oi.order_id = p_order_id
    LOOP
        -- Deduct packaging from ingredients table
        IF item.packaging_type IS NOT NULL THEN
            v_packaging_deducted := item.quantity * item.packaging_quantity_per_product;
            
            UPDATE ingredients 
            SET current_stock = current_stock - v_packaging_deducted
            WHERE name = item.packaging_type;
            
            -- Record stock transaction
            INSERT INTO stock_transactions (
                ingredient_id,
                transaction_type,
                quantity,
                notes,
                created_by
            )
            SELECT 
                id,
                'production_use',
                v_packaging_deducted,
                'Packaging deduction for order ' || p_order_id || ': ' || v_packaging_deducted || ' ' || item.packaging_type,
                auth.uid()
            FROM ingredients 
            WHERE name = item.packaging_type;
            
            v_deduction_count := v_deduction_count + 1;
            v_result := v_result || 'Deducted ' || v_packaging_deducted || ' ' || item.packaging_type || '; ';
        END IF;
        
        -- Deduct labels from ingredients table
        IF item.label_type IS NOT NULL THEN
            v_labels_deducted := item.quantity * item.label_quantity_per_product;
            
            UPDATE ingredients 
            SET current_stock = current_stock - v_labels_deducted
            WHERE name = item.label_type;
            
            -- Record stock transaction
            INSERT INTO stock_transactions (
                ingredient_id,
                transaction_type,
                quantity,
                notes,
                created_by
            )
            SELECT 
                id,
                'production_use',
                v_labels_deducted,
                'Label deduction for order ' || p_order_id || ': ' || v_labels_deducted || ' ' || item.label_type,
                auth.uid()
            FROM ingredients 
            WHERE name = item.label_type;
            
            v_deduction_count := v_deduction_count + 1;
            v_result := v_result || 'Deducted ' || v_labels_deducted || ' ' || item.label_type || '; ';
        END IF;
    END LOOP;
    
    RETURN 'Packaging deduction completed. ' || v_result || 'Total items deducted: ' || v_deduction_count;
END;
$$;


ALTER FUNCTION "public"."deduct_packaging_and_labels"("p_order_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."fix_all_completed_batches"() RETURNS integer
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    v_batch_id UUID;
    v_count INTEGER := 0;
    v_result TEXT;
BEGIN
    -- Process all completed batches that aren't linked
    FOR v_batch_id IN (
        SELECT pb.id
        FROM production_batches pb
        WHERE pb.status = 'completed'
        AND pb.id NOT IN (
            SELECT DISTINCT batch_id 
            FROM batch_order_items
        )
    ) LOOP
        v_result := link_completed_batch_to_order(v_batch_id);
        v_count := v_count + 1;
        RAISE NOTICE 'Batch %: %', v_batch_id, v_result;
    END LOOP;
    
    RETURN v_count;
END;
$$;


ALTER FUNCTION "public"."fix_all_completed_batches"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."fix_all_order_statuses"() RETURNS integer
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    order_count INTEGER := 0;
    order_record RECORD;
BEGIN
    -- Loop through all orders and fix their status based on current production and delivery
    FOR order_record IN 
        SELECT 
            o.id,
            o.status as current_status,
            COALESCE(pb.status, 'none') as production_status,
            COALESCE(d.status, 'none') as delivery_status
        FROM orders o
        LEFT JOIN (
            SELECT DISTINCT ON (order_id) order_id, status 
            FROM production_batches 
            ORDER BY order_id, updated_at DESC
        ) pb ON o.id = pb.order_id
        LEFT JOIN (
            SELECT DISTINCT ON (order_id) order_id, status 
            FROM deliveries 
            ORDER BY order_id, updated_at DESC
        ) d ON o.id = d.order_id
        WHERE o.status NOT IN ('pending', 'confirmed', 'cancelled')
    LOOP
        -- Determine correct status using ALLOWED statuses only
        IF order_record.delivery_status = 'delivered' THEN
            UPDATE orders SET status = 'delivered', updated_at = NOW() WHERE id = order_record.id;
        ELSIF order_record.delivery_status IN ('picked_up', 'in_progress', 'in_transit') THEN
            UPDATE orders SET status = 'out_for_delivery', updated_at = NOW() WHERE id = order_record.id;
        ELSIF order_record.production_status = 'completed' THEN
            UPDATE orders SET status = 'ready', updated_at = NOW() WHERE id = order_record.id;
        ELSIF order_record.production_status = 'in_progress' THEN
            UPDATE orders SET status = 'in_production', updated_at = NOW() WHERE id = order_record.id;
        ELSIF order_record.production_status = 'planned' THEN
            UPDATE orders SET status = 'ready', updated_at = NOW() WHERE id = order_record.id;
        END IF;
        
        order_count := order_count + 1;
    END LOOP;
    
    RETURN order_count;
END;
$$;


ALTER FUNCTION "public"."fix_all_order_statuses"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."fix_all_order_statuses_comprehensive"() RETURNS integer
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    order_count INTEGER := 0;
    order_record RECORD;
BEGIN
    -- Loop through all orders and fix their status based on current production and delivery
    FOR order_record IN 
        SELECT 
            o.id,
            o.status as current_status,
            COALESCE(pb.status, 'none') as production_status,
            COALESCE(d.status, 'none') as delivery_status
        FROM orders o
        LEFT JOIN (
            -- Get latest production status for individual batches
            SELECT DISTINCT ON (order_id) order_id, status 
            FROM production_batches 
            WHERE order_id IS NOT NULL
            ORDER BY order_id, updated_at DESC
        ) pb ON o.id = pb.order_id
        LEFT JOIN (
            -- Get latest delivery status
            SELECT DISTINCT ON (order_id) order_id, status 
            FROM deliveries 
            ORDER BY order_id, updated_at DESC
        ) d ON o.id = d.order_id
        WHERE o.status NOT IN ('pending', 'confirmed', 'cancelled')
        OR (
            -- Also include orders that might be in group batches
            o.status IN ('in_production', 'ready', 'out_for_delivery')
        )
    LOOP
        -- Check if order is in a group batch
        DECLARE
            group_batch_status TEXT;
        BEGIN
            SELECT pb.status INTO group_batch_status
            FROM batch_order_items boi
            JOIN order_items oi ON boi.order_item_id = oi.id
            JOIN production_batches pb ON boi.batch_id = pb.id
            WHERE oi.order_id = order_record.id
            AND pb.batch_type = 'group'
            ORDER BY pb.updated_at DESC
            LIMIT 1;
            
            -- Determine correct status using ALLOWED statuses only
            IF order_record.delivery_status = 'delivered' THEN
                UPDATE orders SET status = 'delivered', updated_at = NOW() WHERE id = order_record.id;
            ELSIF order_record.delivery_status IN ('picked_up', 'in_progress', 'in_transit') THEN
                UPDATE orders SET status = 'out_for_delivery', updated_at = NOW() WHERE id = order_record.id;
            ELSIF group_batch_status = 'completed' OR order_record.production_status = 'completed' THEN
                UPDATE orders SET status = 'ready', updated_at = NOW() WHERE id = order_record.id;
            ELSIF group_batch_status = 'in_progress' OR order_record.production_status = 'in_progress' THEN
                UPDATE orders SET status = 'in_production', updated_at = NOW() WHERE id = order_record.id;
            ELSIF group_batch_status = 'planned' OR order_record.production_status = 'planned' THEN
                UPDATE orders SET status = 'ready', updated_at = NOW() WHERE id = order_record.id;
            END IF;
            
            order_count := order_count + 1;
        END;
    END LOOP;
    
    RETURN order_count;
END;
$$;


ALTER FUNCTION "public"."fix_all_order_statuses_comprehensive"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_batch_number"() RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    year_part TEXT;
    sequence_part TEXT;
BEGIN
    year_part := EXTRACT(YEAR FROM NOW())::TEXT;
    
    SELECT LPAD(COUNT(*) + 1::TEXT, 3, '0') INTO sequence_part
    FROM production_batches 
    WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW());
    
    RETURN 'BATCH-' || year_part || '-' || sequence_part;
END;
$$;


ALTER FUNCTION "public"."generate_batch_number"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_low_stock_alerts"() RETURNS integer
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    DELETE FROM low_stock_alerts WHERE resolved_at IS NULL;
    
    INSERT INTO low_stock_alerts (
        ingredient_id,
        current_stock,
        required_quantity,
        shortage_amount
    ) VALUES (
        gen_random_uuid(),
        100.0,
        200.0,
        100.0
    );
    
    RETURN 1;
END;
$$;


ALTER FUNCTION "public"."generate_low_stock_alerts"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_purchase_order_for_ingredient"("p_ingredient_id" "uuid", "p_required_quantity" numeric DEFAULT NULL::numeric, "p_order_id" "text" DEFAULT NULL::"text") RETURNS TABLE("success" boolean, "message" "text", "purchase_order_id" "uuid")
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    v_vendor_id UUID;
    v_ingredient_name TEXT;
    v_vendor_name TEXT;
    v_purchase_order_id UUID;
    v_reorder_level DECIMAL(10,3);
    v_current_stock DECIMAL(10,3);
    v_order_number TEXT;
    v_unit_cost DECIMAL(10,2);
    v_order_quantity DECIMAL(10,3);
    v_total_amount DECIMAL(10,2);
    v_timestamp BIGINT;
BEGIN
    -- Get ingredient and vendor information
    SELECT 
        i.name,
        i.supplier,
        i.reorder_level,
        i.current_stock,
        v.name,
        i.unit_cost
    INTO v_ingredient_name, v_vendor_id, v_reorder_level, v_current_stock, v_vendor_name, v_unit_cost
    FROM ingredients i
    LEFT JOIN vendors v ON i.supplier = v.id
    WHERE i.id = p_ingredient_id;
    
    -- Check if ingredient exists
    IF v_ingredient_name IS NULL THEN
        RETURN QUERY SELECT false, 'Ingredient not found', NULL::UUID;
        RETURN;
    END IF;
    
    -- Check if vendor exists
    IF v_vendor_id IS NULL THEN
        RETURN QUERY SELECT false, 'No vendor assigned to this ingredient', NULL::UUID;
        RETURN;
    END IF;
    
    -- Use provided quantity or calculate based on reorder level
    IF p_required_quantity IS NOT NULL AND p_required_quantity > 0 THEN
        v_order_quantity := p_required_quantity;
    ELSE
        -- Fallback to reorder level calculation
        v_order_quantity := GREATEST(COALESCE(v_reorder_level, 50) * 1.5 - COALESCE(v_current_stock, 0), 50.0);
    END IF;
    
    -- Generate unique order number without loop (more efficient)
    v_timestamp := extract(epoch from now()) * 1000; -- milliseconds
    v_order_number := 'PO-' || to_char(CURRENT_DATE, 'YYYYMMDD') || '-' || v_timestamp;
    
    -- Calculate total amount
    v_total_amount := v_unit_cost * v_order_quantity;
    
    -- Create purchase order with proper amount and order tracking
    -- Include ingredient name (user-friendly) and ID for tracking
    INSERT INTO purchase_orders (
        order_number,
        vendor_id,
        status,
        notes,
        total_amount,
        created_by
    ) VALUES (
        v_order_number,
        v_vendor_id,
        'draft',
        'Auto-generated for ' || v_ingredient_name ||
        CASE WHEN p_order_id IS NOT NULL THEN ' for order ' || p_order_id ELSE '' END ||
        '. Quantity: ' || v_order_quantity || ' units @ ₹' || v_unit_cost || '/unit' ||
        ' [Ingredient ID: ' || p_ingredient_id || ']',
        v_total_amount,
        '1bdc0d75-de5a-462e-8050-78169ac09139' -- Admin user ID
    ) RETURNING id INTO v_purchase_order_id;
    
    -- Return success
    RETURN QUERY SELECT 
        true, 
        'Purchase order ' || v_order_number || ' created for ' || v_ingredient_name || 
        ' from ' || v_vendor_name || 
        CASE WHEN p_order_id IS NOT NULL THEN ' for order ' || p_order_id ELSE '' END ||
        '. Amount: ₹' || v_total_amount || ', Quantity: ' || v_order_quantity,
        v_purchase_order_id;
END;
$$;


ALTER FUNCTION "public"."generate_purchase_order_for_ingredient"("p_ingredient_id" "uuid", "p_required_quantity" numeric, "p_order_id" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_cumulative_ingredient_requirements"() RETURNS TABLE("ingredient_id" "uuid", "ingredient_name" "text", "total_required" numeric, "total_required_display" numeric, "display_unit" "text", "current_stock" numeric, "current_stock_display" numeric, "shortage" numeric, "shortage_display" numeric, "affected_orders" "text"[], "supplier_name" "text", "supplier_phone" "text", "supplier_email" "text")
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN QUERY
    WITH pending_orders AS (
        SELECT id FROM orders WHERE status = 'pending'
    ),
    all_requirements AS (
        SELECT 
            req.ingredient_id,
            req.ingredient_name,
            i.unit as storage_unit,
            SUM(req.total_quantity) as total_required_grams,
            i.current_stock,
            COALESCE(v.name, 'No Vendor') as supplier_name,
            COALESCE(v.phone, 'N/A') as supplier_phone,
            COALESCE(v.email, 'N/A') as supplier_email
        FROM pending_orders po
        JOIN calculate_order_ingredient_requirements(po.id) req ON true
        LEFT JOIN ingredients i ON req.ingredient_id = i.id
        LEFT JOIN vendors v ON i.supplier = v.id
        GROUP BY req.ingredient_id, req.ingredient_name, i.unit, i.current_stock, v.name, v.phone, v.email
    ),
    converted_quantities AS (
        SELECT 
            ar.ingredient_id,
            ar.ingredient_name,
            ar.storage_unit,
            ar.total_required_grams,
            ar.current_stock,
            ar.supplier_name,
            ar.supplier_phone,
            ar.supplier_email,
            -- Convert total required to storage unit for display
            CASE 
                WHEN ar.storage_unit = 'pieces' AND LOWER(ar.ingredient_name) LIKE '%egg%' THEN
                    ar.total_required_grams / 50.0 -- Convert grams to pieces for eggs
                ELSE ar.total_required_grams
            END as total_required_display,
            -- Current stock is already in storage unit
            ar.current_stock as current_stock_display
        FROM all_requirements ar
    ),
    with_shortage AS (
        SELECT 
            cq.ingredient_id,
            cq.ingredient_name,
            cq.storage_unit,
            cq.total_required_grams,
            cq.total_required_display,
            cq.current_stock,
            cq.current_stock_display,
            GREATEST(0, cq.total_required_grams - cq.current_stock) as shortage_grams,
            GREATEST(0, cq.total_required_display - cq.current_stock_display) as shortage_display,
            cq.supplier_name,
            cq.supplier_phone,
            cq.supplier_email,
            ARRAY_AGG(po.id::text) as affected_orders
        FROM converted_quantities cq
        CROSS JOIN pending_orders po
        WHERE cq.total_required_grams > cq.current_stock -- Only include items with shortage
        GROUP BY cq.ingredient_id, cq.ingredient_name, cq.storage_unit, 
                 cq.total_required_grams, cq.total_required_display, 
                 cq.current_stock, cq.current_stock_display, 
                 cq.supplier_name, cq.supplier_phone, cq.supplier_email
    )
    SELECT 
        ws.ingredient_id,
        ws.ingredient_name,
        ws.total_required_grams,
        ws.total_required_display,
        ws.storage_unit as display_unit,
        ws.current_stock,
        ws.current_stock_display,
        ws.shortage_grams,
        ws.shortage_display,
        ws.affected_orders,
        ws.supplier_name,
        ws.supplier_phone,
        ws.supplier_email
    FROM with_shortage ws
    ORDER BY ws.shortage_grams DESC;
END;
$$;


ALTER FUNCTION "public"."get_cumulative_ingredient_requirements"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_ingredient_po_details"("p_ingredient_id" "uuid") RETURNS TABLE("has_po" boolean, "last_po_date" timestamp without time zone, "active_po_count" integer, "po_statuses" "text"[])
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        has_recent_purchase_order(p_ingredient_id, 24) as has_po,
        MAX(po.created_at) as last_po_date,
        COUNT(CASE WHEN po.status IN ('draft', 'sent', 'confirmed') THEN 1 END) as active_po_count,
        ARRAY_AGG(DISTINCT po.status) as po_statuses
    FROM purchase_orders po
    WHERE po.notes ILIKE '%' || (SELECT name FROM ingredients WHERE id = p_ingredient_id) || '%'
      AND po.notes LIKE '%Auto-generated for%'
      AND po.created_at >= CURRENT_TIMESTAMP - INTERVAL '24 hours';
END;
$$;


ALTER FUNCTION "public"."get_ingredient_po_details"("p_ingredient_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_ingredient_with_vendor"("p_ingredient_id" "uuid") RETURNS TABLE("id" "uuid", "name" "text", "unit" "text", "current_stock" numeric, "vendor_name" "text", "vendor_phone" "text", "vendor_email" "text")
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        i.id,
        i.name,
        i.unit,
        i.current_stock,
        v.name as vendor_name,
        v.phone as vendor_phone,
        v.email as vendor_email
    FROM ingredients i
    LEFT JOIN vendors v ON i.supplier = v.id
    WHERE i.id = p_ingredient_id;
END;
$$;


ALTER FUNCTION "public"."get_ingredient_with_vendor"("p_ingredient_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_order_po_status"("p_order_id" "text") RETURNS TABLE("ingredient_id" "uuid", "has_po" boolean)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT
        i.id as ingredient_id,
        has_recent_purchase_order_for_order(i.id, p_order_id, 24) as has_po
    FROM ingredients i
    WHERE EXISTS (
        SELECT 1 FROM purchase_orders po 
        WHERE po.notes ILIKE '%' || i.name || '%'
        AND po.notes ILIKE '%' || p_order_id || '%'
        AND po.status IN ('draft', 'sent', 'confirmed')
        AND po.created_at >= CURRENT_TIMESTAMP - INTERVAL '24 hours'
    );
END;
$$;


ALTER FUNCTION "public"."get_order_po_status"("p_order_id" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_packaging_alerts"() RETURNS TABLE("material_id" "uuid", "material_name" "text", "material_type" "text", "current_stock" numeric, "reorder_level" numeric, "shortage" numeric, "supplier_name" "text", "supplier_phone" "text", "alert_level" "text")
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pm.id,
        pm.name,
        pm.type,
        pm.current_stock,
        pm.reorder_level,
        GREATEST(0, pm.reorder_level - pm.current_stock) as shortage,
        COALESCE(v.name, 'No Supplier') as supplier_name,
        COALESCE(v.phone, 'N/A') as supplier_phone,
        CASE 
            WHEN pm.current_stock <= pm.reorder_level THEN 'critical'
            WHEN pm.current_stock <= (pm.reorder_level * 1.5) THEN 'warning'
            ELSE 'info'
        END as alert_level
    FROM packaging_materials pm
    LEFT JOIN vendors v ON pm.supplier = v.id
    WHERE pm.current_stock <= (pm.reorder_level * 1.5)
    ORDER BY 
        CASE 
            WHEN pm.current_stock <= pm.reorder_level THEN 1
            ELSE 2
        END,
        pm.current_stock;
END;
$$;


ALTER FUNCTION "public"."get_packaging_alerts"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_product_group_ingredient_requirements"("p_product_id" "uuid") RETURNS TABLE("ingredient_id" "uuid", "ingredient_name" "text", "required_quantity" numeric, "required_quantity_display" numeric, "display_unit" "text", "waste_quantity" numeric, "waste_quantity_display" numeric, "total_quantity" numeric, "total_quantity_display" numeric, "current_stock" numeric, "current_stock_display" numeric, "stock_status" "text", "supplier_name" "text", "supplier_phone" "text", "supplier_email" "text")
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN QUERY
    WITH product_group_items AS (
        SELECT 
            oi.id as order_item_id,
            oi.quantity,
            pv.product_id,
            pv.weight_grams
        FROM get_product_groups_for_batching() pg
        JOIN unnest(pg.order_item_ids) as order_item_id ON true
        JOIN order_items oi ON oi.id = order_item_id
        JOIN product_variants pv ON oi.product_variant_id = pv.id
        WHERE pg.product_id = p_product_id
    ),
    ingredient_requirements AS (
        SELECT 
            pr.ingredient_id,
            i.name as ingredient_name,
            i.unit as storage_unit,
            SUM(pr.percentage * pgi.quantity * pgi.weight_grams / 100) as required_quantity_grams,
            i.current_stock
        FROM product_group_items pgi
        JOIN product_variants pv ON pgi.product_id = pv.product_id
        JOIN product_recipes pr ON pv.product_id = pr.product_id
        JOIN ingredients i ON pr.ingredient_id = i.id
        GROUP BY pr.ingredient_id, i.name, i.unit, i.current_stock
    ),
    converted_quantities AS (
        SELECT 
            ir.ingredient_id,
            ir.ingredient_name,
            ir.storage_unit,
            ir.required_quantity_grams,
            ir.current_stock,
            -- Convert required quantity to storage unit for inventory tracking
            CASE 
                WHEN ir.storage_unit = 'pieces' AND LOWER(ir.ingredient_name) LIKE '%egg%' THEN
                    ir.required_quantity_grams / 50.0 -- Convert grams to pieces for eggs
                ELSE ir.required_quantity_grams
            END as required_quantity_storage,
            -- Convert current stock to grams for calculation
            CASE 
                WHEN ir.storage_unit = 'pieces' AND LOWER(ir.ingredient_name) LIKE '%egg%' THEN
                    ir.current_stock * 50.0 -- Convert pieces to grams for eggs
                ELSE ir.current_stock
            END as current_stock_grams
        FROM ingredient_requirements ir
    ),
    vendor_info AS (
        SELECT 
            cq.ingredient_id,
            cq.ingredient_name,
            cq.storage_unit,
            cq.required_quantity_grams,
            cq.required_quantity_storage,
            cq.current_stock,
            cq.current_stock_grams,
            CASE 
                WHEN cq.current_stock_grams >= cq.required_quantity_grams THEN 'sufficient'
                WHEN cq.current_stock_grams > 0 THEN 'insufficient'
                ELSE 'out_of_stock'
            END as stock_status,
            COALESCE(v.name, 'No Vendor') as supplier_name,
            COALESCE(v.phone, 'N/A') as supplier_phone,
            COALESCE(v.email, 'N/A') as supplier_email
        FROM converted_quantities cq
        LEFT JOIN ingredients i ON cq.ingredient_id = i.id
        LEFT JOIN vendors v ON i.supplier = v.id
    )
    SELECT 
        vi.ingredient_id,
        vi.ingredient_name,
        vi.required_quantity_grams, -- for calculations
        vi.required_quantity_storage, -- for display/inventory
        vi.storage_unit as display_unit,
        vi.required_quantity_grams * 0.075 as waste_quantity, -- for calculations
        CASE 
            WHEN vi.storage_unit = 'pieces' AND LOWER(vi.ingredient_name) LIKE '%egg%' THEN
                (vi.required_quantity_grams * 0.075) / 50.0 -- Convert waste to pieces for eggs
            ELSE vi.required_quantity_grams * 0.075
        END as waste_quantity_display,
        vi.required_quantity_grams * 1.075 as total_quantity, -- for calculations
        CASE 
            WHEN vi.storage_unit = 'pieces' AND LOWER(vi.ingredient_name) LIKE '%egg%' THEN
                (vi.required_quantity_grams * 1.075) / 50.0 -- Convert total to pieces for eggs
            ELSE vi.required_quantity_grams * 1.075
        END as total_quantity_display,
        vi.current_stock_grams, -- for calculations
        vi.current_stock, -- for display
        vi.stock_status,
        vi.supplier_name,
        vi.supplier_phone,
        vi.supplier_email
    FROM vendor_info vi
    ORDER BY 
        CASE vi.stock_status 
            WHEN 'out_of_stock' THEN 1
            WHEN 'insufficient' THEN 2
            WHEN 'sufficient' THEN 3
        END,
        vi.ingredient_name;
END;
$$;


ALTER FUNCTION "public"."get_product_group_ingredient_requirements"("p_product_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_product_groups_for_batching"() RETURNS TABLE("product_id" "uuid", "product_name" "text", "order_count" bigint, "total_quantity" bigint, "total_weight_grams" numeric, "order_item_ids" "uuid"[], "can_produce" boolean, "insufficient_ingredients" "text"[], "total_shortage" numeric)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN QUERY
    WITH available_order_items AS (
        SELECT 
            oi.id as order_item_id,
            oi.order_id,
            pv.product_id as variant_product_id,
            p.name as product_name_from_products,
            oi.quantity,
            pv.weight_grams as variant_weight_grams,
            oi.quantity * pv.weight_grams as calculated_weight_grams
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        JOIN product_variants pv ON oi.product_variant_id = pv.id
        JOIN products p ON pv.product_id = p.id
        WHERE o.status IN ('confirmed', 'in_production')
        AND NOT EXISTS (
            SELECT 1 FROM batch_order_items boi 
            WHERE boi.order_item_id = oi.id
        )
    ),
    product_groups AS (
        SELECT 
            variant_product_id as product_id,
            product_name_from_products as product_name,
            COUNT(DISTINCT order_id) as order_count,
            SUM(quantity) as total_quantity,
            SUM(calculated_weight_grams)::NUMERIC as total_weight_grams,
            ARRAY_AGG(DISTINCT order_item_id) as order_item_ids
        FROM available_order_items
        GROUP BY variant_product_id, product_name_from_products
    )
    SELECT 
        pg.product_id,
        pg.product_name,
        pg.order_count,
        pg.total_quantity,
        pg.total_weight_grams,
        pg.order_item_ids,
        TRUE as can_produce,
        ARRAY[]::TEXT[] as insufficient_ingredients,
        0::DECIMAL(10,3) as total_shortage
    FROM product_groups pg
    ORDER BY pg.order_count DESC, pg.total_quantity DESC;
END;
$$;


ALTER FUNCTION "public"."get_product_groups_for_batching"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_production_queue_summary"() RETURNS TABLE("order_id" "uuid", "order_number" "text", "customer_name" "text", "created_at" timestamp with time zone, "total_weight" bigint, "ingredient_count" bigint, "can_produce" boolean, "insufficient_count" bigint, "priority_order" bigint)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.id as order_id,
        o.order_number,
        COALESCE(p.full_name, 'Customer') as customer_name,
        o.created_at,
        1000::BIGINT as total_weight, -- Explicit cast to BIGINT
        5::BIGINT as ingredient_count, -- Explicit cast to BIGINT
        TRUE as can_produce, -- Mock data for now
        0::BIGINT as insufficient_count, -- Explicit cast to BIGINT
        ROW_NUMBER() OVER (ORDER BY o.created_at ASC)::BIGINT as priority_order
    FROM orders o
    LEFT JOIN profiles p ON o.customer_id = p.id
    WHERE o.status = 'pending'
    ORDER BY o.created_at ASC;
END;
$$;


ALTER FUNCTION "public"."get_production_queue_summary"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_count"() RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM profiles);
END;
$$;


ALTER FUNCTION "public"."get_user_count"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_vendor_purchase_orders"("p_vendor_id" "uuid") RETURNS TABLE("id" "uuid", "order_number" "text", "status" "text", "total_amount" numeric, "notes" "text", "created_at" timestamp with time zone, "sent_at" timestamp with time zone, "confirmed_at" timestamp with time zone, "received_at" timestamp with time zone)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        po.id,
        po.order_number,
        po.status,
        po.total_amount,
        po.notes,
        po.created_at,
        po.sent_at,
        po.confirmed_at,
        po.received_at
    FROM purchase_orders po
    WHERE po.vendor_id = p_vendor_id
    ORDER BY po.created_at DESC;
END;
$$;


ALTER FUNCTION "public"."get_vendor_purchase_orders"("p_vendor_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."has_recent_purchase_order"("p_ingredient_id" "uuid", "p_hours" integer DEFAULT 24) RETURNS boolean
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    v_recent_po_count INTEGER;
    v_ingredient_name TEXT;
BEGIN
    -- Get ingredient name for better matching
    SELECT name INTO v_ingredient_name
    FROM ingredients 
    WHERE id = p_ingredient_id;
    
    IF v_ingredient_name IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Count recent POs for this ingredient using multiple matching strategies
    SELECT COUNT(*) INTO v_recent_po_count
    FROM purchase_orders po
    WHERE po.notes LIKE '%Auto-generated for%'
      AND (
        -- Match by ingredient name (new format)
        po.notes ILIKE '%Auto-generated for ' || v_ingredient_name || '%' OR
        -- Match by ingredient ID in brackets
        po.notes ILIKE '%[Ingredient ID: ' || p_ingredient_id || ']%' OR
        -- Match by old format (backward compatibility)
        po.notes ILIKE '%ingredient: ' || v_ingredient_name || '%' OR
        po.notes ILIKE '%(ID: ' || p_ingredient_id || ')%' OR
        -- Fallback to simple name match
        po.notes ILIKE '%' || v_ingredient_name || '%'
      )
      AND po.status IN ('draft', 'sent', 'confirmed')
      AND po.created_at >= CURRENT_TIMESTAMP - INTERVAL '1 hour' * p_hours;
    
    RETURN v_recent_po_count > 0;
END;
$$;


ALTER FUNCTION "public"."has_recent_purchase_order"("p_ingredient_id" "uuid", "p_hours" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."has_recent_purchase_order_for_order"("p_ingredient_id" "uuid", "p_order_id" "text", "p_hours" integer DEFAULT 24) RETURNS boolean
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    v_recent_po_count INTEGER;
BEGIN
    -- Count recent POs for this ingredient and order combination
    -- We'll use the order number in the PO notes for tracking
    SELECT COUNT(*) INTO v_recent_po_count
    FROM purchase_orders po
    WHERE po.notes LIKE '%Auto-generated for%'
      AND po.notes ILIKE '%' || (SELECT name FROM ingredients WHERE id = p_ingredient_id) || '%'
      AND po.notes ILIKE '%' || p_order_id || '%'
      AND po.status IN ('draft', 'sent', 'confirmed')
      AND po.created_at >= CURRENT_TIMESTAMP - INTERVAL '1 hour' * p_hours;
    
    RETURN v_recent_po_count > 0;
END;
$$;


ALTER FUNCTION "public"."has_recent_purchase_order_for_order"("p_ingredient_id" "uuid", "p_order_id" "text", "p_hours" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."link_completed_batch_to_order"("p_batch_id" "uuid") RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    v_batch_info RECORD;
    v_order_item_id UUID;
    v_order_item_quantity INTEGER;
    v_order_item_product_id UUID;
    v_result TEXT := 'Batch already linked to order';
BEGIN
    -- Check if batch is already linked
    IF EXISTS (SELECT 1 FROM batch_order_items WHERE batch_id = p_batch_id) THEN
        RETURN v_result;
    END IF;
    
    -- Get batch information
    SELECT * INTO v_batch_info
    FROM production_batches
    WHERE id = p_batch_id AND status = 'completed';
    
    IF v_batch_info IS NULL THEN
        RETURN 'Batch not found or not completed';
    END IF;
    
    -- Since batch already has order_id, find order items for that order
    SELECT oi.id, oi.quantity, pv.product_id
    INTO v_order_item_id, v_order_item_quantity, v_order_item_product_id
    FROM order_items oi
    JOIN product_variants pv ON pv.id = oi.product_variant_id
    WHERE oi.order_id = v_batch_info.order_id
    AND oi.order_id NOT IN (
        SELECT DISTINCT boi.order_id 
        FROM batch_order_items boi
        WHERE boi.batch_id != p_batch_id
    )
    ORDER BY oi.created_at DESC
    LIMIT 1;
    
    IF v_order_item_id IS NULL THEN
        RETURN 'No suitable order item found for this batch';
    END IF;
    
    -- Update batch with product_id
    UPDATE production_batches
    SET product_id = v_order_item_product_id,
        updated_at = NOW()
    WHERE id = p_batch_id;
    
    -- Create batch_order_items linkage
    INSERT INTO batch_order_items (
        batch_id,
        order_id,
        order_item_id,
        quantity,
        created_at
    ) VALUES (
        p_batch_id,
        v_batch_info.order_id,
        v_order_item_id,
        v_order_item_quantity,
        NOW()
    );
    
    -- Now check if delivery should be created
    IF check_order_delivery_ready(v_batch_info.order_id) THEN
        PERFORM create_delivery_for_completed_order(v_batch_info.order_id);
        v_result := 'Batch linked to order and delivery created';
    ELSE
        v_result := 'Batch linked to order (delivery not ready yet)';
    END IF;
    
    RETURN v_result;
END;
$$;


ALTER FUNCTION "public"."link_completed_batch_to_order"("p_batch_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."trigger_check_orders_on_batch_completion"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    v_order_id UUID;
BEGIN
    -- Only check if status is changing to 'completed'
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        -- Check all orders that have items in this batch
        FOR v_order_id IN (
            SELECT DISTINCT oi.order_id
            FROM order_items oi
            JOIN batch_order_items boi ON boi.order_item_id = oi.id
            WHERE boi.batch_id = NEW.id
        ) LOOP
            -- Check if all items in this order are now completed
            IF check_order_delivery_ready(v_order_id) THEN
                -- Create delivery for this order
                PERFORM create_delivery_for_completed_order(v_order_id);
            END IF;
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."trigger_check_orders_on_batch_completion"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_batch_status"("p_batch_id" "uuid", "p_new_status" character varying) RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    -- Validate status transition
    IF p_new_status NOT IN ('planned', 'in_progress', 'completed', 'cancelled', 'on_hold') THEN
        RAISE EXCEPTION 'Invalid status: %', p_new_status;
    END IF;
    
    -- Update batch status and timestamps
    UPDATE production_batches 
    SET 
        status = p_new_status,
        start_time = CASE 
            WHEN p_new_status = 'in_progress' AND start_time IS NULL THEN NOW()
            ELSE start_time
        END,
        end_time = CASE 
            WHEN p_new_status IN ('completed', 'cancelled') AND end_time IS NULL THEN NOW()
            ELSE end_time
        END,
        updated_at = NOW()
    WHERE id = p_batch_id;
    
    -- Update batch items status when batch is completed
    IF p_new_status = 'completed' THEN
        UPDATE production_batch_items 
        SET 
            status = 'completed',
            quantity_produced = quantity_planned,
            updated_at = NOW()
        WHERE batch_id = p_batch_id;
    END IF;
    
    RETURN TRUE;
END;
$$;


ALTER FUNCTION "public"."update_batch_status"("p_batch_id" "uuid", "p_new_status" character varying) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."update_batch_status"("p_batch_id" "uuid", "p_new_status" character varying) IS 'Updates batch status and manages workflow transitions with proper timestamp tracking';



CREATE OR REPLACE FUNCTION "public"."update_order_status_from_delivery"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- Update order status based on delivery status
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        IF NEW.status = 'pending' THEN
            UPDATE orders 
            SET 
                status = 'ready',
                delivery_created_at = NEW.created_at,
                updated_at = NOW()
            WHERE id = NEW.order_id;
            
        ELSIF NEW.status = 'scheduled' THEN
            UPDATE orders 
            SET 
                status = 'ready',
                updated_at = NOW()
            WHERE id = NEW.order_id;
            
        ELSIF NEW.status = 'picked_up' THEN
            UPDATE orders 
            SET 
                status = 'out_for_delivery',
                delivery_pickedup_at = NEW.updated_at,
                updated_at = NOW()
            WHERE id = NEW.order_id;
            
        ELSIF NEW.status = 'in_progress' THEN  -- Assuming 'in_progress' means picked up/in transit
            UPDATE orders 
            SET 
                status = 'out_for_delivery',
                delivery_pickedup_at = NEW.updated_at,
                updated_at = NOW()
            WHERE id = NEW.order_id;
            
        ELSIF NEW.status = 'in_transit' THEN
            UPDATE orders 
            SET 
                status = 'out_for_delivery',
                delivery_in_transit_at = NEW.updated_at,
                updated_at = NOW()
            WHERE id = NEW.order_id;
            
        ELSIF NEW.status = 'delivered' THEN
            UPDATE orders 
            SET 
                status = 'delivered',
                delivery_delivered_at = NEW.updated_at,
                delivered_date = NEW.updated_at,  -- FIXED: Use correct column name
                updated_at = NOW()
            WHERE id = NEW.order_id;
            
        ELSIF NEW.status = 'failed' THEN
            UPDATE orders 
            SET 
                status = 'ready',  -- Back to 'ready' for redelivery
                updated_at = NOW()
            WHERE id = NEW.order_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_order_status_from_delivery"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_order_status_from_production"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- Update order status based on production batch status
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        -- Handle individual batches (with order_id)
        IF NEW.order_id IS NOT NULL THEN
            IF NEW.status = 'planned' THEN
                UPDATE orders 
                SET 
                    status = 'ready',
                    production_started_at = NULL,
                    updated_at = NOW()
                WHERE id = NEW.order_id;
                
            ELSIF NEW.status = 'in_progress' THEN
                UPDATE orders 
                SET 
                    status = 'in_production',
                    production_started_at = NEW.created_at,
                    updated_at = NOW()
                WHERE id = NEW.order_id;
                
            ELSIF NEW.status = 'completed' THEN
                -- Check if delivery already exists
                IF EXISTS (SELECT 1 FROM deliveries WHERE order_id = NEW.order_id) THEN
                    -- If delivery exists, don't change status (delivery trigger will handle it)
                    UPDATE orders 
                    SET 
                        production_completed_at = NEW.updated_at,
                        updated_at = NOW()
                    WHERE id = NEW.order_id;
                ELSE
                    -- If no delivery, set to 'ready'
                    UPDATE orders 
                    SET 
                        status = 'ready',
                        production_completed_at = NEW.updated_at,
                        updated_at = NOW()
                    WHERE id = NEW.order_id;
                END IF;
                
            ELSIF NEW.status = 'cancelled' THEN
                UPDATE orders 
                SET 
                    status = 'cancelled',
                    updated_at = NOW()
                WHERE id = NEW.order_id;
            END IF;
            
        -- Handle group batches (no order_id, use batch_order_items)
        ELSIF NEW.order_id IS NULL AND NEW.batch_type = 'group' THEN
            IF NEW.status = 'planned' THEN
                UPDATE orders 
                SET 
                    status = 'ready',
                    production_started_at = NULL,
                    updated_at = NOW()
                WHERE id IN (
                    SELECT oi.order_id 
                    FROM batch_order_items boi
                    JOIN order_items oi ON boi.order_item_id = oi.id
                    WHERE boi.batch_id = NEW.id
                );
                
            ELSIF NEW.status = 'in_progress' THEN
                UPDATE orders 
                SET 
                    status = 'in_production',
                    production_started_at = NEW.created_at,
                    updated_at = NOW()
                WHERE id IN (
                    SELECT oi.order_id 
                    FROM batch_order_items boi
                    JOIN order_items oi ON boi.order_item_id = oi.id
                    WHERE boi.batch_id = NEW.id
                );
                
            ELSIF NEW.status = 'completed' THEN
                -- Check if deliveries already exist for these orders
                UPDATE orders 
                SET 
                    status = CASE 
                        WHEN EXISTS (
                            SELECT 1 FROM deliveries d 
                            WHERE d.order_id = orders.id
                        ) THEN orders.status -- Keep current status if delivery exists
                        ELSE 'ready' -- Set to ready if no delivery
                    END,
                    production_completed_at = NEW.updated_at,
                    updated_at = NOW()
                WHERE id IN (
                    SELECT oi.order_id 
                    FROM batch_order_items boi
                    JOIN order_items oi ON boi.order_item_id = oi.id
                    WHERE boi.batch_id = NEW.id
                );
                
            ELSIF NEW.status = 'cancelled' THEN
                UPDATE orders 
                SET 
                    status = 'cancelled',
                    updated_at = NOW()
                WHERE id IN (
                    SELECT oi.order_id 
                    FROM batch_order_items boi
                    JOIN order_items oi ON boi.order_item_id = oi.id
                    WHERE boi.batch_id = NEW.id
                );
            END IF;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_order_status_from_production"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_production_ingredients"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    validation_result RECORD;
BEGIN
    -- Only validate for individual order batches (not group batches)
    IF NEW.order_id IS NOT NULL THEN
        -- Check if production can start for this order
        SELECT * INTO validation_result FROM can_start_production(NEW.order_id);
        
        -- If cannot produce, raise an error
        IF NOT validation_result.can_produce THEN
            RAISE EXCEPTION 'Cannot start production: Missing ingredients - %', 
                array_to_string(validation_result.missing_ingredients, ', ');
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."validate_production_ingredients"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."batch_order_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "batch_id" "uuid",
    "order_id" "uuid",
    "order_item_id" "uuid",
    "quantity" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."batch_order_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."deliveries" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "order_id" "uuid",
    "delivery_partner_id" "uuid",
    "pickup_time" timestamp with time zone,
    "delivered_time" timestamp with time zone,
    "status" "text" NOT NULL,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "delivery_number" character varying(50),
    "batch_id" "uuid",
    "customer_name" character varying(255),
    "customer_email" character varying(255),
    "customer_phone" character varying(50),
    "delivery_address" "text",
    "delivery_partner_name" character varying(255),
    "delivery_partner_phone" character varying(50),
    "estimated_delivery_date" timestamp with time zone,
    "actual_delivery_date" timestamp with time zone,
    "tracking_number" character varying(100),
    "items_count" integer DEFAULT 0,
    "total_value" numeric(10,2) DEFAULT 0.00,
    "delivery_status" "text" DEFAULT 'pending'::"text",
    CONSTRAINT "deliveries_delivery_status_check" CHECK (("delivery_status" = ANY (ARRAY['pending'::"text", 'scheduled'::"text", 'picked_up'::"text", 'in_transit'::"text", 'delivered'::"text", 'failed'::"text", 'cancelled'::"text"])))
);


ALTER TABLE "public"."deliveries" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."order_items" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "order_id" "uuid",
    "product_variant_id" "uuid",
    "quantity" integer NOT NULL,
    "unit_price" numeric(10,2) NOT NULL,
    "total_price" numeric(10,2) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."order_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."orders" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "order_number" "text" NOT NULL,
    "customer_id" "uuid",
    "status" "text" NOT NULL,
    "payment_method" "text" NOT NULL,
    "payment_status" "text" NOT NULL,
    "subtotal" numeric(10,2) NOT NULL,
    "delivery_fee" numeric(10,2) DEFAULT 0,
    "total_amount" numeric(10,2) NOT NULL,
    "delivery_address_id" "uuid",
    "delivery_notes" "text",
    "order_date" timestamp with time zone DEFAULT "now"(),
    "confirmed_date" timestamp with time zone,
    "production_start_date" timestamp with time zone,
    "ready_date" timestamp with time zone,
    "delivered_date" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "delivery_created" boolean DEFAULT false,
    "production_started_at" timestamp without time zone,
    "production_completed_at" timestamp without time zone,
    "delivery_created_at" timestamp without time zone,
    "delivery_pickedup_at" timestamp without time zone,
    "delivery_in_transit_at" timestamp without time zone,
    "delivery_delivered_at" timestamp without time zone,
    CONSTRAINT "orders_payment_method_check" CHECK (("payment_method" = ANY (ARRAY['cod'::"text", 'online'::"text", 'wallet'::"text"]))),
    CONSTRAINT "orders_payment_status_check" CHECK (("payment_status" = ANY (ARRAY['pending'::"text", 'paid'::"text", 'refunded'::"text"]))),
    CONSTRAINT "orders_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'confirmed'::"text", 'in_production'::"text", 'ready'::"text", 'out_for_delivery'::"text", 'delivered'::"text", 'cancelled'::"text"])))
);


ALTER TABLE "public"."orders" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."production_batches" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "batch_number" "text" NOT NULL,
    "product_id" "uuid",
    "quantity_produced" integer NOT NULL,
    "status" "text" NOT NULL,
    "planned_date" "date",
    "actual_production_date" "date",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "order_id" "uuid",
    "created_by" "uuid",
    "start_time" timestamp with time zone,
    "end_time" timestamp with time zone,
    "priority" integer DEFAULT 1,
    "delivery_created" boolean DEFAULT false,
    "batch_type" "text" DEFAULT 'single'::"text",
    "total_orders" integer DEFAULT 1,
    "total_quantity_produced" integer DEFAULT 0,
    "waste_factor" numeric(5,2) DEFAULT 7.5,
    "total_weight_grams" numeric(10,2),
    CONSTRAINT "production_batches_batch_type_check" CHECK (("batch_type" = ANY (ARRAY['single'::"text", 'group'::"text"]))),
    CONSTRAINT "production_batches_priority_check" CHECK ((("priority" >= 1) AND ("priority" <= 5))),
    CONSTRAINT "production_batches_status_check" CHECK (("status" = ANY (ARRAY['planned'::"text", 'in_progress'::"text", 'completed'::"text", 'cancelled'::"text"])))
);


ALTER TABLE "public"."production_batches" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."products" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "category_id" "uuid",
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "description" "text",
    "short_description" "text",
    "nutritional_info" "jsonb",
    "ingredients_display" "text",
    "image_url" "text",
    "is_active" boolean DEFAULT true,
    "display_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "packaging_type" "text",
    "label_type" "text",
    "packaging_quantity_per_product" integer DEFAULT 1,
    "label_quantity_per_product" integer DEFAULT 1
);


ALTER TABLE "public"."products" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."batch_details_view" AS
 SELECT "pb"."id" AS "batch_id",
    "pb"."batch_number",
    "pb"."status" AS "batch_status",
    "pb"."quantity_produced",
    "pb"."created_at",
    "pb"."updated_at",
    "pb"."notes",
    "pb"."priority",
    "pb"."batch_type",
        CASE
            WHEN ("pb"."batch_type" = 'individual'::"text") THEN "o"."order_number"
            WHEN ("pb"."batch_type" = 'group'::"text") THEN COALESCE("order_stats"."all_order_numbers", 'No orders'::"text")
            ELSE 'Unknown'::"text"
        END AS "order_number",
        CASE
            WHEN ("pb"."batch_type" = 'group'::"text") THEN "order_stats"."all_order_numbers"
            ELSE NULL::"text"
        END AS "all_order_numbers",
        CASE
            WHEN ("pb"."batch_type" = 'individual'::"text") THEN "o"."status"
            WHEN ("pb"."batch_type" = 'group'::"text") THEN COALESCE("order_stats"."order_statuses", 'No orders'::"text")
            ELSE NULL::"text"
        END AS "order_status",
        CASE
            WHEN ("pb"."batch_type" = 'individual'::"text") THEN "o"."total_amount"
            WHEN ("pb"."batch_type" = 'group'::"text") THEN COALESCE("order_stats"."total_amount", (0)::numeric)
            ELSE (0)::numeric
        END AS "order_total",
        CASE
            WHEN ("pb"."batch_type" = 'individual'::"text") THEN COALESCE("individual_stats"."item_count", (0)::bigint)
            WHEN ("pb"."batch_type" = 'group'::"text") THEN COALESCE("order_stats"."item_count", (0)::bigint)
            ELSE (0)::bigint
        END AS "item_count",
    COALESCE("pb"."total_quantity_produced", "pb"."quantity_produced", 0) AS "total_planned_quantity",
    COALESCE("pb"."quantity_produced", 0) AS "total_produced_quantity",
        CASE
            WHEN (COALESCE("pb"."total_quantity_produced", "pb"."quantity_produced", 0) > 0) THEN "round"((((COALESCE("pb"."quantity_produced", 0))::numeric * 100.0) / (COALESCE("pb"."total_quantity_produced", "pb"."quantity_produced", 1))::numeric), 2)
            ELSE (0)::numeric
        END AS "completion_percentage",
    "pb"."start_time",
    "pb"."end_time",
    (EXISTS ( SELECT 1
           FROM "public"."deliveries" "d"
          WHERE ("d"."batch_id" = "pb"."id"))) AS "delivery_created",
    "p"."name" AS "product_name",
    "p"."id" AS "product_id"
   FROM (((("public"."production_batches" "pb"
     LEFT JOIN "public"."orders" "o" ON (("pb"."order_id" = "o"."id")))
     LEFT JOIN "public"."products" "p" ON (("pb"."product_id" = "p"."id")))
     LEFT JOIN LATERAL ( SELECT "count"("oi"."id") AS "item_count"
           FROM "public"."order_items" "oi"
          WHERE ("oi"."order_id" = "o"."id")) "individual_stats" ON (("pb"."batch_type" = 'individual'::"text")))
     LEFT JOIN LATERAL ( SELECT "count"(DISTINCT "oi"."order_id") AS "order_count",
            "count"("oi"."id") AS "item_count",
            "string_agg"(DISTINCT "o_group"."order_number", ', '::"text") AS "all_order_numbers",
            "string_agg"(DISTINCT "o_group"."status", ', '::"text") AS "order_statuses",
            COALESCE("sum"(DISTINCT "o_group"."total_amount"), (0)::numeric) AS "total_amount"
           FROM (("public"."batch_order_items" "boi"
             JOIN "public"."order_items" "oi" ON (("boi"."order_item_id" = "oi"."id")))
             JOIN "public"."orders" "o_group" ON (("oi"."order_id" = "o_group"."id")))
          WHERE ("boi"."batch_id" = "pb"."id")) "order_stats" ON (("pb"."batch_type" = 'group'::"text")))
  ORDER BY "pb"."created_at" DESC;


ALTER VIEW "public"."batch_details_view" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."batch_ingredients" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "batch_id" "uuid",
    "ingredient_id" "uuid",
    "planned_quantity" numeric(12,3) NOT NULL,
    "actual_quantity" numeric(12,3),
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."batch_ingredients" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."production_batch_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "batch_id" "uuid" NOT NULL,
    "order_id" "uuid" NOT NULL,
    "order_item_id" "uuid" NOT NULL,
    "product_id" "uuid" NOT NULL,
    "quantity_planned" numeric(10,3) NOT NULL,
    "quantity_produced" numeric(10,3) DEFAULT 0,
    "weight_grams" numeric(10,3),
    "status" character varying(20) DEFAULT 'pending'::character varying,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "production_batch_items_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['pending'::character varying, 'in_progress'::character varying, 'completed'::character varying, 'waste'::character varying])::"text"[])))
);


ALTER TABLE "public"."production_batch_items" OWNER TO "postgres";


COMMENT ON TABLE "public"."production_batch_items" IS 'Links production batches to specific order items and tracks production quantities';



CREATE OR REPLACE VIEW "public"."batch_items_view" AS
 SELECT "pbi"."id" AS "batch_item_id",
    "pbi"."batch_id",
    "pb"."batch_number",
    "pbi"."order_id",
    "o"."order_number",
    "pbi"."order_item_id",
    "pbi"."product_id",
    "p"."name" AS "product_name",
    "pbi"."quantity_planned",
    "pbi"."quantity_produced",
    "pbi"."weight_grams",
    "pbi"."status" AS "item_status",
    "pbi"."notes",
    "pbi"."created_at",
    "pbi"."updated_at"
   FROM ((("public"."production_batch_items" "pbi"
     JOIN "public"."production_batches" "pb" ON (("pbi"."batch_id" = "pb"."id")))
     JOIN "public"."orders" "o" ON (("pbi"."order_id" = "o"."id")))
     JOIN "public"."products" "p" ON (("pbi"."product_id" = "p"."id")));


ALTER VIEW "public"."batch_items_view" OWNER TO "postgres";


COMMENT ON VIEW "public"."batch_items_view" IS 'Detailed view of all items within production batches with product information';



CREATE TABLE IF NOT EXISTS "public"."batch_orders" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "batch_id" "uuid",
    "order_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."batch_orders" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."categories" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "description" "text",
    "display_order" integer DEFAULT 0,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."communication_log" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "order_id" "uuid",
    "customer_id" "uuid",
    "type" "text" NOT NULL,
    "direction" "text" NOT NULL,
    "content" "text" NOT NULL,
    "status" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."communication_log" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."customer_addresses" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "customer_id" "uuid",
    "label" "text",
    "address_line1" "text" NOT NULL,
    "address_line2" "text",
    "landmark" "text",
    "city" "text" NOT NULL,
    "state" "text" NOT NULL,
    "pincode" "text" NOT NULL,
    "is_default" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "delivery_notes" "text",
    "latitude" numeric(10,8),
    "longitude" numeric(11,8)
);


ALTER TABLE "public"."customer_addresses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."customers" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "profile_id" "uuid",
    "phone" "text" NOT NULL,
    "whatsapp_number" "text",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."customers" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."delivery_details_view" AS
 SELECT "id",
    "delivery_number",
    "order_id",
    "batch_id",
    "delivery_partner_id",
    "tracking_number",
    "status",
    "delivery_status",
    "pickup_time",
    "estimated_delivery_date",
    "actual_delivery_date",
    "delivered_time",
    "notes",
    "created_at",
    "updated_at",
    "customer_name",
    "customer_email",
    "customer_phone",
    "delivery_address",
    "delivery_partner_name",
    "delivery_partner_phone",
    "items_count",
    "total_value"
   FROM "public"."deliveries" "d";


ALTER VIEW "public"."delivery_details_view" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."delivery_partners" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "contact_phone" "text",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."delivery_partners" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ingredients" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "unit" "text" NOT NULL,
    "current_stock" numeric(12,3) DEFAULT 0,
    "reorder_level" numeric(12,3) DEFAULT 0,
    "unit_cost" numeric(10,2) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "supplier" "uuid",
    CONSTRAINT "check_supplier_uuid" CHECK ((("supplier" IS NULL) OR (("supplier")::"text" ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'::"text")))
);


ALTER TABLE "public"."ingredients" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."purchase_orders" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_number" "text" NOT NULL,
    "vendor_id" "uuid",
    "status" "text" DEFAULT 'draft'::"text",
    "total_amount" numeric(10,2) DEFAULT 0,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "sent_at" timestamp with time zone,
    "confirmed_at" timestamp with time zone,
    "received_at" timestamp with time zone,
    "created_by" "uuid",
    CONSTRAINT "purchase_orders_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'sent'::"text", 'confirmed'::"text", 'received'::"text", 'cancelled'::"text"])))
);


ALTER TABLE "public"."purchase_orders" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."ingredient_po_status" AS
 SELECT "i"."id" AS "ingredient_id",
    "i"."name" AS "ingredient_name",
        CASE
            WHEN "public"."has_recent_purchase_order"("i"."id", 24) THEN true
            ELSE false
        END AS "has_recent_po",
    "max"("po"."created_at") AS "last_po_date",
    "count"(
        CASE
            WHEN ("po"."status" = ANY (ARRAY['draft'::"text", 'sent'::"text", 'confirmed'::"text"])) THEN 1
            ELSE NULL::integer
        END) AS "active_po_count"
   FROM ("public"."ingredients" "i"
     LEFT JOIN "public"."purchase_orders" "po" ON ((("po"."notes" ~~ '%Auto-generated for%'::"text") AND (("po"."notes" ~~* (('%Auto-generated for '::"text" || "i"."name") || '%'::"text")) OR ("po"."notes" ~~* (('%[Ingredient ID: '::"text" || "i"."id") || ']%'::"text")) OR ("po"."notes" ~~* (('%ingredient: '::"text" || "i"."name") || '%'::"text")) OR ("po"."notes" ~~* (('%(ID: '::"text" || "i"."id") || ')%'::"text")) OR ("po"."notes" ~~* (('%'::"text" || "i"."name") || '%'::"text"))) AND ("po"."status" = ANY (ARRAY['draft'::"text", 'sent'::"text", 'confirmed'::"text"])) AND ("po"."created_at" >= (CURRENT_TIMESTAMP - '24:00:00'::interval)))))
  GROUP BY "i"."id", "i"."name";


ALTER VIEW "public"."ingredient_po_status" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ingredient_unit_conversions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "ingredient_id" "uuid",
    "from_unit" "text" NOT NULL,
    "to_unit" "text" NOT NULL,
    "conversion_factor" numeric(10,3) NOT NULL,
    "is_primary" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."ingredient_unit_conversions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ingredient_updates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "ingredient_id" "uuid" NOT NULL,
    "previous_stock" numeric(10,2) NOT NULL,
    "new_stock" numeric(10,2) NOT NULL,
    "stock_change_amount" numeric(10,2) GENERATED ALWAYS AS (("new_stock" - "previous_stock")) STORED,
    "previous_cost" numeric(10,2) NOT NULL,
    "new_cost" numeric(10,2) NOT NULL,
    "cost_change_amount" numeric(10,2) GENERATED ALWAYS AS (("new_cost" - "previous_cost")) STORED,
    "cost_change_percent" numeric(5,2) GENERATED ALWAYS AS (
CASE
    WHEN ("previous_cost" = (0)::numeric) THEN (0)::numeric
    ELSE "round"(((("new_cost" - "previous_cost") / "previous_cost") * (100)::numeric), 2)
END) STORED,
    "previous_supplier" "uuid",
    "new_supplier" "uuid",
    "update_type" "text" NOT NULL,
    "notes" "text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "check_new_supplier_uuid" CHECK ((("new_supplier" IS NULL) OR (("new_supplier")::"text" ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'::"text"))),
    CONSTRAINT "check_previous_supplier_uuid" CHECK ((("previous_supplier" IS NULL) OR (("previous_supplier")::"text" ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'::"text"))),
    CONSTRAINT "ingredient_updates_update_type_check" CHECK (("update_type" = ANY (ARRAY['purchase'::"text", 'usage'::"text", 'adjustment'::"text", 'waste'::"text"])))
);


ALTER TABLE "public"."ingredient_updates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."vendors" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "contact_person" "text",
    "phone" "text",
    "email" "text",
    "address" "text",
    "payment_terms" "text",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."vendors" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."ingredients_with_vendors" AS
 SELECT "i"."id",
    "i"."name",
    "i"."unit",
    "i"."current_stock",
    "i"."reorder_level",
    "i"."unit_cost",
    "i"."supplier",
    "i"."created_at",
    "i"."updated_at",
    "v"."name" AS "vendor_name",
    "v"."contact_person",
    "v"."phone" AS "vendor_phone",
    "v"."email" AS "vendor_email",
    "v"."address" AS "vendor_address",
    "v"."payment_terms",
    "v"."is_active" AS "vendor_is_active"
   FROM ("public"."ingredients" "i"
     LEFT JOIN "public"."vendors" "v" ON (("i"."supplier" = "v"."id")));


ALTER VIEW "public"."ingredients_with_vendors" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."low_stock_alerts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "ingredient_id" "uuid",
    "current_stock" numeric(10,3) NOT NULL,
    "required_quantity" numeric(10,3) NOT NULL,
    "shortage_amount" numeric(10,3) NOT NULL,
    "email_sent" boolean DEFAULT false,
    "purchase_order_generated" boolean DEFAULT false,
    "purchase_order_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "email_sent_at" timestamp with time zone,
    "resolved_by" "uuid",
    "resolved_at" timestamp with time zone
);


ALTER TABLE "public"."low_stock_alerts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "type" "text" NOT NULL,
    "title" "text" NOT NULL,
    "message" "text" NOT NULL,
    "is_read" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."notifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "role" "text" NOT NULL,
    "full_name" "text" NOT NULL,
    "phone" "text",
    "email" "text",
    "avatar_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "profiles_role_check" CHECK (("role" = ANY (ARRAY['admin'::"text", 'partner'::"text", 'customer'::"text", 'operations'::"text"])))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."order_lifecycle_view" AS
 SELECT DISTINCT ON ("o"."id") "o"."id",
    "o"."order_number",
    "o"."status" AS "order_status",
    "o"."customer_id",
    "o"."total_amount",
    "o"."created_at" AS "order_created_at",
    "o"."updated_at" AS "order_updated_at",
    "pb"."id" AS "production_batch_id",
    "pb"."status" AS "production_status",
    "pb"."created_at" AS "production_created_at",
    "pb"."updated_at" AS "production_updated_at",
    "d"."id" AS "delivery_id",
    "d"."status" AS "delivery_status",
    "d"."delivery_number",
    "d"."created_at" AS "delivery_created_at",
    "d"."updated_at" AS "delivery_updated_at",
    COALESCE("p"."full_name", 'Unknown Customer'::"text") AS "customer_name",
    "p"."email" AS "customer_email",
        CASE
            WHEN ("o"."status" = 'pending'::"text") THEN 'Order Placed'::"text"
            WHEN ("o"."status" = 'confirmed'::"text") THEN 'Order Confirmed'::"text"
            WHEN ("o"."status" = 'ready_production'::"text") THEN 'Preparing Your Order'::"text"
            WHEN ("o"."status" = 'in_production'::"text") THEN 'Preparing Your Order'::"text"
            WHEN ("o"."status" = 'ready_delivery'::"text") THEN 'Ready for Dispatch'::"text"
            WHEN ("o"."status" = 'out_for_delivery'::"text") THEN 'Out for Delivery'::"text"
            WHEN ("o"."status" = 'delivered'::"text") THEN 'Delivered'::"text"
            WHEN ("o"."status" = 'cancelled'::"text") THEN 'Cancelled'::"text"
            ELSE "o"."status"
        END AS "customer_status",
    GREATEST("o"."updated_at", COALESCE("pb"."updated_at", "o"."updated_at"), COALESCE("d"."updated_at", "o"."updated_at")) AS "last_activity_at"
   FROM ((("public"."orders" "o"
     LEFT JOIN "public"."profiles" "p" ON (("o"."customer_id" = "p"."id")))
     LEFT JOIN LATERAL ( SELECT "production_batches"."id",
            "production_batches"."batch_number",
            "production_batches"."product_id",
            "production_batches"."quantity_produced",
            "production_batches"."status",
            "production_batches"."planned_date",
            "production_batches"."actual_production_date",
            "production_batches"."notes",
            "production_batches"."created_at",
            "production_batches"."updated_at",
            "production_batches"."order_id",
            "production_batches"."created_by",
            "production_batches"."start_time",
            "production_batches"."end_time",
            "production_batches"."priority",
            "production_batches"."delivery_created",
            "production_batches"."batch_type",
            "production_batches"."total_orders",
            "production_batches"."total_quantity_produced",
            "production_batches"."waste_factor",
            "production_batches"."total_weight_grams"
           FROM "public"."production_batches"
          WHERE ("production_batches"."order_id" = "o"."id")
          ORDER BY "production_batches"."updated_at" DESC
         LIMIT 1) "pb" ON (true))
     LEFT JOIN LATERAL ( SELECT "deliveries"."id",
            "deliveries"."order_id",
            "deliveries"."delivery_partner_id",
            "deliveries"."pickup_time",
            "deliveries"."delivered_time",
            "deliveries"."status",
            "deliveries"."notes",
            "deliveries"."created_at",
            "deliveries"."updated_at",
            "deliveries"."delivery_number",
            "deliveries"."batch_id",
            "deliveries"."customer_name",
            "deliveries"."customer_email",
            "deliveries"."customer_phone",
            "deliveries"."delivery_address",
            "deliveries"."delivery_partner_name",
            "deliveries"."delivery_partner_phone",
            "deliveries"."estimated_delivery_date",
            "deliveries"."actual_delivery_date",
            "deliveries"."tracking_number",
            "deliveries"."items_count",
            "deliveries"."total_value",
            "deliveries"."delivery_status"
           FROM "public"."deliveries"
          WHERE ("deliveries"."order_id" = "o"."id")
          ORDER BY "deliveries"."updated_at" DESC
         LIMIT 1) "d" ON (true))
  ORDER BY "o"."id", "o"."created_at" DESC;


ALTER VIEW "public"."order_lifecycle_view" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."product_variants" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "product_id" "uuid",
    "weight_grams" integer NOT NULL,
    "price" numeric(10,2) NOT NULL,
    "sku" "text",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."product_variants" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."order_summary" AS
 SELECT "o"."id",
    "o"."order_number",
    "o"."status",
    "o"."total_amount",
    "o"."order_date",
    "c"."phone" AS "customer_phone",
    "p"."name" AS "product_name",
    "sum"("oi"."quantity") AS "total_quantity"
   FROM (((("public"."orders" "o"
     JOIN "public"."customers" "c" ON (("o"."customer_id" = "c"."id")))
     JOIN "public"."order_items" "oi" ON (("o"."id" = "oi"."order_id")))
     JOIN "public"."product_variants" "pv" ON (("oi"."product_variant_id" = "pv"."id")))
     JOIN "public"."products" "p" ON (("pv"."product_id" = "p"."id")))
  GROUP BY "o"."id", "o"."order_number", "o"."status", "o"."total_amount", "o"."order_date", "c"."phone", "p"."name";


ALTER VIEW "public"."order_summary" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."orders_with_ingredient_status" AS
 SELECT "o"."id",
    "o"."order_number",
    "o"."customer_id",
    "o"."status",
    "o"."payment_method",
    "o"."payment_status",
    "o"."subtotal",
    "o"."delivery_fee",
    "o"."total_amount",
    "o"."delivery_address_id",
    "o"."delivery_notes",
    "o"."order_date",
    "o"."confirmed_date",
    "o"."production_start_date",
    "o"."ready_date",
    "o"."delivered_date",
    "o"."created_at",
    "o"."updated_at",
    "o"."delivery_created",
    "o"."production_started_at",
    "o"."production_completed_at",
    "o"."delivery_created_at",
    "o"."delivery_pickedup_at",
    "o"."delivery_in_transit_at",
    "o"."delivery_delivered_at",
        CASE
            WHEN "prod_check"."can_produce" THEN 'Ready for Production'::"text"
            ELSE 'Insufficient Ingredients'::"text"
        END AS "production_readiness",
    "prod_check"."missing_ingredients",
    "prod_check"."message" AS "ingredient_message"
   FROM ("public"."orders" "o"
     LEFT JOIN LATERAL ( SELECT "can_start_production"."can_produce",
            "can_start_production"."missing_ingredients",
            "can_start_production"."message"
           FROM "public"."can_start_production"("o"."id") "can_start_production"("can_produce", "missing_ingredients", "message")) "prod_check" ON (true))
  WHERE ("o"."status" = ANY (ARRAY['confirmed'::"text", 'ready_production'::"text", 'in_production'::"text"]))
  ORDER BY "o"."created_at" DESC;


ALTER VIEW "public"."orders_with_ingredient_status" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."packaging_materials" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "type" "text" NOT NULL,
    "unit" "text" DEFAULT 'pieces'::"text" NOT NULL,
    "current_stock" numeric(10,2) DEFAULT 0,
    "reorder_level" numeric(10,2) DEFAULT 0,
    "unit_cost" numeric(10,2) DEFAULT 0,
    "supplier" "uuid",
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "packaging_materials_type_check" CHECK (("type" = ANY (ARRAY['packaging'::"text", 'label'::"text"])))
);


ALTER TABLE "public"."packaging_materials" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."packaging_inventory_status" AS
 SELECT "pm"."id",
    "pm"."name",
    "pm"."type",
    "pm"."unit",
    "pm"."current_stock",
    "pm"."reorder_level",
    "pm"."unit_cost",
    "pm"."description",
        CASE
            WHEN ("pm"."current_stock" <= "pm"."reorder_level") THEN 'critical'::"text"
            WHEN ("pm"."current_stock" <= ("pm"."reorder_level" * 1.5)) THEN 'low'::"text"
            ELSE 'sufficient'::"text"
        END AS "stock_status",
    COALESCE("v"."name", 'No Supplier'::"text") AS "supplier_name",
    COALESCE("v"."phone", 'N/A'::"text") AS "supplier_phone",
    "pm"."updated_at"
   FROM ("public"."packaging_materials" "pm"
     LEFT JOIN "public"."vendors" "v" ON (("pm"."supplier" = "v"."id")))
  ORDER BY
        CASE
            WHEN ("pm"."current_stock" <= "pm"."reorder_level") THEN 1
            WHEN ("pm"."current_stock" <= ("pm"."reorder_level" * 1.5)) THEN 2
            ELSE 3
        END, "pm"."type", "pm"."name";


ALTER VIEW "public"."packaging_inventory_status" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."packaging_inventory_view" AS
 SELECT "id",
    "name",
    "unit",
    "current_stock",
    "reorder_level",
    "unit_cost",
    "supplier",
        CASE
            WHEN (("name" ~~ '%Label%'::"text") OR ("name" ~~ '%Sticker%'::"text")) THEN 'label'::"text"
            WHEN (("name" ~~ '%Pouch%'::"text") OR ("name" ~~ '%Jar%'::"text") OR ("name" ~~ '%Box%'::"text")) THEN 'packaging'::"text"
            ELSE 'ingredient'::"text"
        END AS "material_type",
        CASE
            WHEN ("current_stock" <= "reorder_level") THEN 'critical'::"text"
            WHEN ("current_stock" <= ("reorder_level" * 1.5)) THEN 'low'::"text"
            ELSE 'sufficient'::"text"
        END AS "stock_status",
    "updated_at"
   FROM "public"."ingredients" "i"
  WHERE (("name" ~~ '%Pouch%'::"text") OR ("name" ~~ '%Jar%'::"text") OR ("name" ~~ '%Box%'::"text") OR ("name" ~~ '%Label%'::"text") OR ("name" ~~ '%Sticker%'::"text"))
  ORDER BY
        CASE
            WHEN (("name" ~~ '%Label%'::"text") OR ("name" ~~ '%Sticker%'::"text")) THEN 'label'::"text"
            WHEN (("name" ~~ '%Pouch%'::"text") OR ("name" ~~ '%Jar%'::"text") OR ("name" ~~ '%Box%'::"text")) THEN 'packaging'::"text"
            ELSE 'ingredient'::"text"
        END, "name";


ALTER VIEW "public"."packaging_inventory_view" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."product_recipes" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "product_id" "uuid",
    "ingredient_id" "uuid",
    "percentage" numeric(5,2) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."product_recipes" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."production_batch_number_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."production_batch_number_seq" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."production_batches_simple" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "batch_number" "text",
    "status" "text"
);


ALTER TABLE "public"."production_batches_simple" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."production_batches_test" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "batch_number" "text" NOT NULL,
    "order_id" "uuid",
    "status" "text" DEFAULT 'planned'::"text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."production_batches_test" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."production_efficiency" AS
 SELECT "pb"."actual_production_date" AS "production_date",
    "p"."name" AS "product_name",
    "count"(*) AS "batches_produced",
    "sum"("pb"."quantity_produced") AS "total_units",
    "avg"("pb"."quantity_produced") AS "avg_batch_size"
   FROM ("public"."production_batches" "pb"
     JOIN "public"."products" "p" ON (("pb"."product_id" = "p"."id")))
  WHERE ("pb"."status" = 'completed'::"text")
  GROUP BY "pb"."actual_production_date", "p"."name"
  ORDER BY "pb"."actual_production_date" DESC;


ALTER VIEW "public"."production_efficiency" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."purchase_order_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "purchase_order_id" "uuid",
    "ingredient_id" "uuid",
    "quantity" numeric(10,3) NOT NULL,
    "unit_price" numeric(10,2),
    "total_price" numeric(10,2) GENERATED ALWAYS AS (("quantity" * "unit_price")) STORED,
    "status" "text" DEFAULT 'ordered'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "purchase_order_items_status_check" CHECK (("status" = ANY (ARRAY['ordered'::"text", 'received'::"text", 'cancelled'::"text"])))
);


ALTER TABLE "public"."purchase_order_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."simple_test" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text"
);


ALTER TABLE "public"."simple_test" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."stock_levels" AS
 SELECT "id",
    "name",
    "unit",
    "current_stock",
    "reorder_level",
        CASE
            WHEN ("current_stock" <= "reorder_level") THEN 'Low Stock'::"text"
            ELSE 'OK'::"text"
        END AS "stock_status"
   FROM "public"."ingredients" "i";


ALTER VIEW "public"."stock_levels" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."stock_transactions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "ingredient_id" "uuid",
    "transaction_type" "text" NOT NULL,
    "quantity" numeric(12,3) NOT NULL,
    "unit_cost" numeric(10,2),
    "reference_id" "uuid",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "stock_transactions_transaction_type_check" CHECK (("transaction_type" = ANY (ARRAY['purchase'::"text", 'production_use'::"text", 'adjustment'::"text", 'wastage'::"text"])))
);


ALTER TABLE "public"."stock_transactions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."subscriptions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "customer_id" "uuid",
    "product_variant_id" "uuid",
    "frequency" "text" NOT NULL,
    "quantity" integer NOT NULL,
    "status" "text" NOT NULL,
    "start_date" "date" NOT NULL,
    "end_date" "date",
    "next_delivery_date" "date",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "subscriptions_frequency_check" CHECK (("frequency" = ANY (ARRAY['daily'::"text", 'weekly'::"text", 'biweekly'::"text", 'monthly'::"text"]))),
    CONSTRAINT "subscriptions_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'paused'::"text", 'cancelled'::"text"])))
);


ALTER TABLE "public"."subscriptions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."test_table" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text"
);


ALTER TABLE "public"."test_table" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."vendor_order_items" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "vendor_order_id" "uuid",
    "ingredient_id" "uuid",
    "quantity" numeric(12,3) NOT NULL,
    "unit_price" numeric(10,2) NOT NULL,
    "received_quantity" numeric(12,3) DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."vendor_order_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."vendor_orders" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "order_number" "text" NOT NULL,
    "vendor_id" "uuid",
    "order_date" "date" NOT NULL,
    "expected_delivery_date" "date",
    "status" "text" NOT NULL,
    "total_amount" numeric(10,2),
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "vendor_orders_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'confirmed'::"text", 'delivered'::"text", 'cancelled'::"text"])))
);


ALTER TABLE "public"."vendor_orders" OWNER TO "postgres";


ALTER TABLE ONLY "public"."batch_ingredients"
    ADD CONSTRAINT "batch_ingredients_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."batch_order_items"
    ADD CONSTRAINT "batch_order_items_batch_id_order_item_id_key" UNIQUE ("batch_id", "order_item_id");



ALTER TABLE ONLY "public"."batch_order_items"
    ADD CONSTRAINT "batch_order_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."batch_orders"
    ADD CONSTRAINT "batch_orders_batch_id_order_id_key" UNIQUE ("batch_id", "order_id");



ALTER TABLE ONLY "public"."batch_orders"
    ADD CONSTRAINT "batch_orders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."communication_log"
    ADD CONSTRAINT "communication_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."customer_addresses"
    ADD CONSTRAINT "customer_addresses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."customers"
    ADD CONSTRAINT "customers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."deliveries"
    ADD CONSTRAINT "deliveries_delivery_number_key" UNIQUE ("delivery_number");



ALTER TABLE ONLY "public"."deliveries"
    ADD CONSTRAINT "deliveries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."delivery_partners"
    ADD CONSTRAINT "delivery_partners_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ingredient_unit_conversions"
    ADD CONSTRAINT "ingredient_unit_conversions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ingredient_updates"
    ADD CONSTRAINT "ingredient_updates_ingredient_id_created_at_key" UNIQUE ("ingredient_id", "created_at");



ALTER TABLE ONLY "public"."ingredient_updates"
    ADD CONSTRAINT "ingredient_updates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ingredients"
    ADD CONSTRAINT "ingredients_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."ingredients"
    ADD CONSTRAINT "ingredients_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."low_stock_alerts"
    ADD CONSTRAINT "low_stock_alerts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_order_number_key" UNIQUE ("order_number");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."packaging_materials"
    ADD CONSTRAINT "packaging_materials_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."packaging_materials"
    ADD CONSTRAINT "packaging_materials_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_recipes"
    ADD CONSTRAINT "product_recipes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_variants"
    ADD CONSTRAINT "product_variants_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_variants"
    ADD CONSTRAINT "product_variants_sku_key" UNIQUE ("sku");



ALTER TABLE ONLY "public"."production_batch_items"
    ADD CONSTRAINT "production_batch_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."production_batches"
    ADD CONSTRAINT "production_batches_batch_number_key" UNIQUE ("batch_number");



ALTER TABLE ONLY "public"."production_batches"
    ADD CONSTRAINT "production_batches_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."production_batches_simple"
    ADD CONSTRAINT "production_batches_simple_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."production_batches_test"
    ADD CONSTRAINT "production_batches_test_batch_number_key" UNIQUE ("batch_number");



ALTER TABLE ONLY "public"."production_batches_test"
    ADD CONSTRAINT "production_batches_test_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."purchase_order_items"
    ADD CONSTRAINT "purchase_order_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."purchase_orders"
    ADD CONSTRAINT "purchase_orders_order_number_key" UNIQUE ("order_number");



ALTER TABLE ONLY "public"."purchase_orders"
    ADD CONSTRAINT "purchase_orders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."simple_test"
    ADD CONSTRAINT "simple_test_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."stock_transactions"
    ADD CONSTRAINT "stock_transactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."test_table"
    ADD CONSTRAINT "test_table_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."vendor_order_items"
    ADD CONSTRAINT "vendor_order_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."vendor_orders"
    ADD CONSTRAINT "vendor_orders_order_number_key" UNIQUE ("order_number");



ALTER TABLE ONLY "public"."vendor_orders"
    ADD CONSTRAINT "vendor_orders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."vendors"
    ADD CONSTRAINT "vendors_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_batch_orders_batch_id" ON "public"."batch_orders" USING "btree" ("batch_id");



CREATE INDEX "idx_batch_orders_order_id" ON "public"."batch_orders" USING "btree" ("order_id");



CREATE INDEX "idx_customer_addresses_customer" ON "public"."customer_addresses" USING "btree" ("customer_id");



CREATE INDEX "idx_customer_addresses_customer_id" ON "public"."customer_addresses" USING "btree" ("customer_id");



CREATE INDEX "idx_customer_addresses_is_default" ON "public"."customer_addresses" USING "btree" ("is_default");



CREATE INDEX "idx_customers_phone" ON "public"."customers" USING "btree" ("phone");



CREATE INDEX "idx_deliveries_batch_id" ON "public"."deliveries" USING "btree" ("batch_id");



CREATE INDEX "idx_deliveries_customer_name" ON "public"."deliveries" USING "btree" ("customer_name");



CREATE INDEX "idx_deliveries_delivery_number" ON "public"."deliveries" USING "btree" ("delivery_number");



CREATE INDEX "idx_ingredients_current_stock" ON "public"."ingredients" USING "btree" ("current_stock");



CREATE INDEX "idx_ingredients_supplier" ON "public"."ingredients" USING "btree" ("supplier");



CREATE INDEX "idx_low_stock_alerts_created_at" ON "public"."low_stock_alerts" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_low_stock_alerts_ingredient_id" ON "public"."low_stock_alerts" USING "btree" ("ingredient_id");



CREATE INDEX "idx_order_items_order" ON "public"."order_items" USING "btree" ("order_id");



CREATE INDEX "idx_order_items_variant" ON "public"."order_items" USING "btree" ("product_variant_id");



CREATE INDEX "idx_orders_customer" ON "public"."orders" USING "btree" ("customer_id");



CREATE INDEX "idx_orders_date" ON "public"."orders" USING "btree" ("order_date");



CREATE INDEX "idx_orders_delivery_created" ON "public"."orders" USING "btree" ("delivery_created") WHERE ("delivery_created" = true);



CREATE INDEX "idx_orders_number" ON "public"."orders" USING "btree" ("order_number");



CREATE INDEX "idx_orders_status" ON "public"."orders" USING "btree" ("status");



CREATE INDEX "idx_packaging_materials_stock" ON "public"."packaging_materials" USING "btree" ("current_stock");



CREATE INDEX "idx_packaging_materials_type" ON "public"."packaging_materials" USING "btree" ("type");



CREATE INDEX "idx_product_recipes_ingredient" ON "public"."product_recipes" USING "btree" ("ingredient_id");



CREATE INDEX "idx_product_recipes_product" ON "public"."product_recipes" USING "btree" ("product_id");



CREATE INDEX "idx_product_variants_active" ON "public"."product_variants" USING "btree" ("is_active");



CREATE INDEX "idx_product_variants_product" ON "public"."product_variants" USING "btree" ("product_id");



CREATE INDEX "idx_production_batch_items_batch_id" ON "public"."production_batch_items" USING "btree" ("batch_id");



CREATE INDEX "idx_production_batch_items_order_id" ON "public"."production_batch_items" USING "btree" ("order_id");



CREATE INDEX "idx_production_batch_items_product_id" ON "public"."production_batch_items" USING "btree" ("product_id");



CREATE INDEX "idx_production_batch_items_status" ON "public"."production_batch_items" USING "btree" ("status");



CREATE INDEX "idx_production_batches_batch_type" ON "public"."production_batches" USING "btree" ("batch_type");



CREATE INDEX "idx_production_batches_created_at" ON "public"."production_batches" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_production_batches_date" ON "public"."production_batches" USING "btree" ("planned_date");



CREATE INDEX "idx_production_batches_product" ON "public"."production_batches" USING "btree" ("product_id");



CREATE INDEX "idx_production_batches_product_id" ON "public"."production_batches" USING "btree" ("product_id");



CREATE INDEX "idx_production_batches_status" ON "public"."production_batches" USING "btree" ("status");



CREATE INDEX "idx_products_active" ON "public"."products" USING "btree" ("is_active");



CREATE INDEX "idx_products_category" ON "public"."products" USING "btree" ("category_id");



CREATE INDEX "idx_products_slug" ON "public"."products" USING "btree" ("slug");



CREATE INDEX "idx_purchase_orders_status" ON "public"."purchase_orders" USING "btree" ("status");



CREATE INDEX "idx_purchase_orders_vendor_id" ON "public"."purchase_orders" USING "btree" ("vendor_id");



CREATE INDEX "idx_stock_transactions_date" ON "public"."stock_transactions" USING "btree" ("created_at");



CREATE INDEX "idx_stock_transactions_ingredient" ON "public"."stock_transactions" USING "btree" ("ingredient_id");



CREATE INDEX "idx_vendors_active" ON "public"."vendors" USING "btree" ("is_active");



CREATE OR REPLACE TRIGGER "block_insufficient_production_trigger" BEFORE INSERT ON "public"."production_batches" FOR EACH ROW EXECUTE FUNCTION "public"."block_insufficient_production"();



CREATE OR REPLACE TRIGGER "block_ready_production_trigger" BEFORE UPDATE ON "public"."orders" FOR EACH ROW WHEN (("old"."status" IS DISTINCT FROM "new"."status")) EXECUTE FUNCTION "public"."block_ready_production_status"();



CREATE OR REPLACE TRIGGER "handle_customer_addresses_updated_at" BEFORE UPDATE ON "public"."customer_addresses" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "on_delivery_change" AFTER INSERT OR UPDATE ON "public"."deliveries" FOR EACH ROW EXECUTE FUNCTION "public"."update_order_status_from_delivery"();



CREATE OR REPLACE TRIGGER "on_production_batch_change" AFTER INSERT OR UPDATE ON "public"."production_batches" FOR EACH ROW EXECUTE FUNCTION "public"."update_order_status_from_production"();



CREATE OR REPLACE TRIGGER "trigger_check_orders_on_batch_completion" AFTER UPDATE ON "public"."production_batches" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_check_orders_on_batch_completion"();



CREATE OR REPLACE TRIGGER "update_customers_updated_at" BEFORE UPDATE ON "public"."customers" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_deliveries_updated_at" BEFORE UPDATE ON "public"."deliveries" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_orders_updated_at" BEFORE UPDATE ON "public"."orders" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_production_batches_updated_at" BEFORE UPDATE ON "public"."production_batches" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_products_updated_at" BEFORE UPDATE ON "public"."products" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_profiles_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_subscriptions_updated_at" BEFORE UPDATE ON "public"."subscriptions" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_vendor_orders_updated_at" BEFORE UPDATE ON "public"."vendor_orders" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "validate_production_ingredients_trigger" BEFORE INSERT OR UPDATE ON "public"."production_batches" FOR EACH ROW WHEN ((("new"."status" = 'planned'::"text") OR ("new"."status" = 'in_progress'::"text"))) EXECUTE FUNCTION "public"."validate_production_ingredients"();



ALTER TABLE ONLY "public"."batch_ingredients"
    ADD CONSTRAINT "batch_ingredients_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "public"."production_batches"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."batch_ingredients"
    ADD CONSTRAINT "batch_ingredients_ingredient_id_fkey" FOREIGN KEY ("ingredient_id") REFERENCES "public"."ingredients"("id");



ALTER TABLE ONLY "public"."batch_order_items"
    ADD CONSTRAINT "batch_order_items_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "public"."production_batches"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."batch_order_items"
    ADD CONSTRAINT "batch_order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."batch_order_items"
    ADD CONSTRAINT "batch_order_items_order_item_id_fkey" FOREIGN KEY ("order_item_id") REFERENCES "public"."order_items"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."batch_orders"
    ADD CONSTRAINT "batch_orders_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "public"."production_batches"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."batch_orders"
    ADD CONSTRAINT "batch_orders_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."communication_log"
    ADD CONSTRAINT "communication_log_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id");



ALTER TABLE ONLY "public"."communication_log"
    ADD CONSTRAINT "communication_log_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id");



ALTER TABLE ONLY "public"."customer_addresses"
    ADD CONSTRAINT "customer_addresses_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."customers"
    ADD CONSTRAINT "customers_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."deliveries"
    ADD CONSTRAINT "deliveries_delivery_partner_id_fkey" FOREIGN KEY ("delivery_partner_id") REFERENCES "public"."delivery_partners"("id");



ALTER TABLE ONLY "public"."deliveries"
    ADD CONSTRAINT "deliveries_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id");



ALTER TABLE ONLY "public"."ingredient_unit_conversions"
    ADD CONSTRAINT "ingredient_unit_conversions_ingredient_id_fkey" FOREIGN KEY ("ingredient_id") REFERENCES "public"."ingredients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ingredient_updates"
    ADD CONSTRAINT "ingredient_updates_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."ingredient_updates"
    ADD CONSTRAINT "ingredient_updates_ingredient_id_fkey" FOREIGN KEY ("ingredient_id") REFERENCES "public"."ingredients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ingredient_updates"
    ADD CONSTRAINT "ingredient_updates_new_supplier_fkey" FOREIGN KEY ("new_supplier") REFERENCES "public"."vendors"("id");



ALTER TABLE ONLY "public"."ingredient_updates"
    ADD CONSTRAINT "ingredient_updates_previous_supplier_fkey" FOREIGN KEY ("previous_supplier") REFERENCES "public"."vendors"("id");



ALTER TABLE ONLY "public"."ingredients"
    ADD CONSTRAINT "ingredients_supplier_fkey" FOREIGN KEY ("supplier") REFERENCES "public"."vendors"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."low_stock_alerts"
    ADD CONSTRAINT "low_stock_alerts_purchase_order_id_fkey" FOREIGN KEY ("purchase_order_id") REFERENCES "public"."purchase_orders"("id");



ALTER TABLE ONLY "public"."low_stock_alerts"
    ADD CONSTRAINT "low_stock_alerts_resolved_by_fkey" FOREIGN KEY ("resolved_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_product_variant_id_fkey" FOREIGN KEY ("product_variant_id") REFERENCES "public"."product_variants"("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_delivery_address_id_fkey" FOREIGN KEY ("delivery_address_id") REFERENCES "public"."customer_addresses"("id");



ALTER TABLE ONLY "public"."packaging_materials"
    ADD CONSTRAINT "packaging_materials_supplier_fkey" FOREIGN KEY ("supplier") REFERENCES "public"."vendors"("id");



ALTER TABLE ONLY "public"."product_recipes"
    ADD CONSTRAINT "product_recipes_ingredient_id_fkey" FOREIGN KEY ("ingredient_id") REFERENCES "public"."ingredients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."product_recipes"
    ADD CONSTRAINT "product_recipes_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."product_variants"
    ADD CONSTRAINT "product_variants_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."production_batch_items"
    ADD CONSTRAINT "production_batch_items_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "public"."production_batches"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."production_batch_items"
    ADD CONSTRAINT "production_batch_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."production_batch_items"
    ADD CONSTRAINT "production_batch_items_order_item_id_fkey" FOREIGN KEY ("order_item_id") REFERENCES "public"."order_items"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."production_batch_items"
    ADD CONSTRAINT "production_batch_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id");



ALTER TABLE ONLY "public"."production_batches"
    ADD CONSTRAINT "production_batches_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."production_batches"
    ADD CONSTRAINT "production_batches_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id");



ALTER TABLE ONLY "public"."production_batches"
    ADD CONSTRAINT "production_batches_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."purchase_order_items"
    ADD CONSTRAINT "purchase_order_items_purchase_order_id_fkey" FOREIGN KEY ("purchase_order_id") REFERENCES "public"."purchase_orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."purchase_orders"
    ADD CONSTRAINT "purchase_orders_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."stock_transactions"
    ADD CONSTRAINT "stock_transactions_ingredient_id_fkey" FOREIGN KEY ("ingredient_id") REFERENCES "public"."ingredients"("id");



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_product_variant_id_fkey" FOREIGN KEY ("product_variant_id") REFERENCES "public"."product_variants"("id");



ALTER TABLE ONLY "public"."vendor_order_items"
    ADD CONSTRAINT "vendor_order_items_ingredient_id_fkey" FOREIGN KEY ("ingredient_id") REFERENCES "public"."ingredients"("id");



ALTER TABLE ONLY "public"."vendor_order_items"
    ADD CONSTRAINT "vendor_order_items_vendor_order_id_fkey" FOREIGN KEY ("vendor_order_id") REFERENCES "public"."vendor_orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."vendor_orders"
    ADD CONSTRAINT "vendor_orders_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id");



CREATE POLICY "Allow service role to create deliveries" ON "public"."deliveries" FOR INSERT TO "service_role" WITH CHECK (true);



CREATE POLICY "Allow service role to read deliveries" ON "public"."deliveries" FOR SELECT TO "service_role" USING (true);



CREATE POLICY "Allow service role to update deliveries" ON "public"."deliveries" FOR UPDATE TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Enable delete access for all authenticated users" ON "public"."delivery_partners" FOR DELETE USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Enable insert access for all authenticated users" ON "public"."delivery_partners" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Enable read access for all authenticated users" ON "public"."delivery_partners" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Enable update access for all authenticated users" ON "public"."delivery_partners" FOR UPDATE USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Operations users can manage production batches" ON "public"."production_batches" USING (((("auth"."jwt"() ->> 'role'::"text") = 'admin'::"text") OR (("auth"."jwt"() ->> 'role'::"text") = 'operations'::"text")));



CREATE POLICY "Operations users can manage vendors" ON "public"."vendors" USING (((("auth"."jwt"() ->> 'role'::"text") = 'admin'::"text") OR (("auth"."jwt"() ->> 'role'::"text") = 'operations'::"text")));



CREATE POLICY "Operations users can update orders" ON "public"."orders" FOR UPDATE USING (((("auth"."jwt"() ->> 'role'::"text") = 'admin'::"text") OR (("auth"."jwt"() ->> 'role'::"text") = 'operations'::"text")));



CREATE POLICY "Operations users can view ingredients" ON "public"."ingredients" USING (((("auth"."jwt"() ->> 'role'::"text") = 'admin'::"text") OR (("auth"."jwt"() ->> 'role'::"text") = 'operations'::"text")));



CREATE POLICY "Operations users can view orders" ON "public"."orders" FOR SELECT USING (((("auth"."jwt"() ->> 'role'::"text") = 'admin'::"text") OR (("auth"."jwt"() ->> 'role'::"text") = 'operations'::"text")));



CREATE POLICY "Users can delete deliveries" ON "public"."deliveries" FOR DELETE USING (("auth"."role"() = 'admin'::"text"));



CREATE POLICY "Users can delete own customer addresses" ON "public"."customer_addresses" FOR DELETE USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Users can delete their own addresses" ON "public"."customer_addresses" FOR DELETE USING (("auth"."uid"() = "customer_id"));



CREATE POLICY "Users can insert customer addresses" ON "public"."customer_addresses" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Users can insert deliveries" ON "public"."deliveries" FOR INSERT WITH CHECK (("auth"."role"() = 'admin'::"text"));



CREATE POLICY "Users can insert their own addresses" ON "public"."customer_addresses" FOR INSERT WITH CHECK (("auth"."uid"() = "customer_id"));



CREATE POLICY "Users can read customer addresses" ON "public"."customer_addresses" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Users can update deliveries" ON "public"."deliveries" FOR UPDATE USING (("auth"."role"() = 'admin'::"text"));



CREATE POLICY "Users can update own customer addresses" ON "public"."customer_addresses" FOR UPDATE USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Users can update their own addresses" ON "public"."customer_addresses" FOR UPDATE USING (("auth"."uid"() = "customer_id"));



CREATE POLICY "Users can view all deliveries" ON "public"."deliveries" FOR SELECT USING (("auth"."role"() = 'admin'::"text"));



CREATE POLICY "Users can view their own addresses" ON "public"."customer_addresses" FOR SELECT USING (("auth"."uid"() = "customer_id"));



CREATE POLICY "admin_partner_operations_orders_policy" ON "public"."orders" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"text", 'partner'::"text", 'operations'::"text"]))))));



CREATE POLICY "admin_profiles_insert_policy" ON "public"."profiles" FOR INSERT WITH CHECK ((("auth"."jwt"() ->> 'role'::"text") = 'admin'::"text"));



CREATE POLICY "admin_profiles_update_policy" ON "public"."profiles" FOR UPDATE USING ((("auth"."jwt"() ->> 'role'::"text") = 'admin'::"text"));



ALTER TABLE "public"."customer_addresses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."delivery_partners" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."add_inventory_from_po"("p_po_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."add_inventory_from_po"("p_po_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."add_inventory_from_po"("p_po_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."block_insufficient_production"() TO "anon";
GRANT ALL ON FUNCTION "public"."block_insufficient_production"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."block_insufficient_production"() TO "service_role";



GRANT ALL ON FUNCTION "public"."block_ready_production_status"() TO "anon";
GRANT ALL ON FUNCTION "public"."block_ready_production_status"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."block_ready_production_status"() TO "service_role";



GRANT ALL ON FUNCTION "public"."calculate_order_ingredient_requirements"("p_order_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_order_ingredient_requirements"("p_order_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_order_ingredient_requirements"("p_order_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."calculate_order_item_ingredient_requirements"("p_order_item_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_order_item_ingredient_requirements"("p_order_item_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_order_item_ingredient_requirements"("p_order_item_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."can_produce_order"("p_order_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."can_produce_order"("p_order_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."can_produce_order"("p_order_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."can_start_group_production"("p_product_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."can_start_group_production"("p_product_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."can_start_group_production"("p_product_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."can_start_production"("p_order_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."can_start_production"("p_order_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."can_start_production"("p_order_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."cancel_purchase_order"("p_po_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."cancel_purchase_order"("p_po_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."cancel_purchase_order"("p_po_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."check_ingredients_for_order"("p_order_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."check_ingredients_for_order"("p_order_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_ingredients_for_order"("p_order_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."check_order_delivery_ready"("p_order_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."check_order_delivery_ready"("p_order_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_order_delivery_ready"("p_order_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."convert_ingredient_quantity"("p_ingredient_id" "uuid", "p_quantity" numeric, "p_from_unit" "text", "p_to_unit" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."convert_ingredient_quantity"("p_ingredient_id" "uuid", "p_quantity" numeric, "p_from_unit" "text", "p_to_unit" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."convert_ingredient_quantity"("p_ingredient_id" "uuid", "p_quantity" numeric, "p_from_unit" "text", "p_to_unit" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."correct_egg_stock"() TO "anon";
GRANT ALL ON FUNCTION "public"."correct_egg_stock"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."correct_egg_stock"() TO "service_role";



GRANT ALL ON FUNCTION "public"."create_delivery_for_completed_order"("p_order_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."create_delivery_for_completed_order"("p_order_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_delivery_for_completed_order"("p_order_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_production_batch"("p_order_id" "uuid", "p_notes" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."create_production_batch"("p_order_id" "uuid", "p_notes" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_production_batch"("p_order_id" "uuid", "p_notes" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_production_batch_for_product_group"("p_product_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."create_production_batch_for_product_group"("p_product_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_production_batch_for_product_group"("p_product_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_production_batch_for_product_group"("p_product_id" "uuid", "p_notes" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."create_production_batch_for_product_group"("p_product_id" "uuid", "p_notes" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_production_batch_for_product_group"("p_product_id" "uuid", "p_notes" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."deduct_order_ingredients"("p_order_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."deduct_order_ingredients"("p_order_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."deduct_order_ingredients"("p_order_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."deduct_packaging_and_labels"("p_order_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."deduct_packaging_and_labels"("p_order_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."deduct_packaging_and_labels"("p_order_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."fix_all_completed_batches"() TO "anon";
GRANT ALL ON FUNCTION "public"."fix_all_completed_batches"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."fix_all_completed_batches"() TO "service_role";



GRANT ALL ON FUNCTION "public"."fix_all_order_statuses"() TO "anon";
GRANT ALL ON FUNCTION "public"."fix_all_order_statuses"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."fix_all_order_statuses"() TO "service_role";



GRANT ALL ON FUNCTION "public"."fix_all_order_statuses_comprehensive"() TO "anon";
GRANT ALL ON FUNCTION "public"."fix_all_order_statuses_comprehensive"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."fix_all_order_statuses_comprehensive"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_batch_number"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_batch_number"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_batch_number"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_low_stock_alerts"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_low_stock_alerts"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_low_stock_alerts"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_purchase_order_for_ingredient"("p_ingredient_id" "uuid", "p_required_quantity" numeric, "p_order_id" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."generate_purchase_order_for_ingredient"("p_ingredient_id" "uuid", "p_required_quantity" numeric, "p_order_id" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_purchase_order_for_ingredient"("p_ingredient_id" "uuid", "p_required_quantity" numeric, "p_order_id" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_cumulative_ingredient_requirements"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_cumulative_ingredient_requirements"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_cumulative_ingredient_requirements"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_ingredient_po_details"("p_ingredient_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_ingredient_po_details"("p_ingredient_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_ingredient_po_details"("p_ingredient_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_ingredient_with_vendor"("p_ingredient_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_ingredient_with_vendor"("p_ingredient_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_ingredient_with_vendor"("p_ingredient_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_order_po_status"("p_order_id" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_order_po_status"("p_order_id" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_order_po_status"("p_order_id" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_packaging_alerts"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_packaging_alerts"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_packaging_alerts"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_product_group_ingredient_requirements"("p_product_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_product_group_ingredient_requirements"("p_product_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_product_group_ingredient_requirements"("p_product_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_product_groups_for_batching"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_product_groups_for_batching"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_product_groups_for_batching"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_production_queue_summary"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_production_queue_summary"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_production_queue_summary"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_count"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_vendor_purchase_orders"("p_vendor_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_vendor_purchase_orders"("p_vendor_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_vendor_purchase_orders"("p_vendor_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."has_recent_purchase_order"("p_ingredient_id" "uuid", "p_hours" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."has_recent_purchase_order"("p_ingredient_id" "uuid", "p_hours" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_recent_purchase_order"("p_ingredient_id" "uuid", "p_hours" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."has_recent_purchase_order_for_order"("p_ingredient_id" "uuid", "p_order_id" "text", "p_hours" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."has_recent_purchase_order_for_order"("p_ingredient_id" "uuid", "p_order_id" "text", "p_hours" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_recent_purchase_order_for_order"("p_ingredient_id" "uuid", "p_order_id" "text", "p_hours" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."link_completed_batch_to_order"("p_batch_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."link_completed_batch_to_order"("p_batch_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."link_completed_batch_to_order"("p_batch_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."trigger_check_orders_on_batch_completion"() TO "anon";
GRANT ALL ON FUNCTION "public"."trigger_check_orders_on_batch_completion"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."trigger_check_orders_on_batch_completion"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_batch_status"("p_batch_id" "uuid", "p_new_status" character varying) TO "anon";
GRANT ALL ON FUNCTION "public"."update_batch_status"("p_batch_id" "uuid", "p_new_status" character varying) TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_batch_status"("p_batch_id" "uuid", "p_new_status" character varying) TO "service_role";



GRANT ALL ON FUNCTION "public"."update_order_status_from_delivery"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_order_status_from_delivery"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_order_status_from_delivery"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_order_status_from_production"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_order_status_from_production"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_order_status_from_production"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_production_ingredients"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_production_ingredients"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_production_ingredients"() TO "service_role";


















GRANT ALL ON TABLE "public"."batch_order_items" TO "anon";
GRANT ALL ON TABLE "public"."batch_order_items" TO "authenticated";
GRANT ALL ON TABLE "public"."batch_order_items" TO "service_role";



GRANT ALL ON TABLE "public"."deliveries" TO "anon";
GRANT ALL ON TABLE "public"."deliveries" TO "authenticated";
GRANT ALL ON TABLE "public"."deliveries" TO "service_role";



GRANT ALL ON TABLE "public"."order_items" TO "anon";
GRANT ALL ON TABLE "public"."order_items" TO "authenticated";
GRANT ALL ON TABLE "public"."order_items" TO "service_role";



GRANT ALL ON TABLE "public"."orders" TO "anon";
GRANT ALL ON TABLE "public"."orders" TO "authenticated";
GRANT ALL ON TABLE "public"."orders" TO "service_role";



GRANT ALL ON TABLE "public"."production_batches" TO "anon";
GRANT ALL ON TABLE "public"."production_batches" TO "authenticated";
GRANT ALL ON TABLE "public"."production_batches" TO "service_role";



GRANT ALL ON TABLE "public"."products" TO "anon";
GRANT ALL ON TABLE "public"."products" TO "authenticated";
GRANT ALL ON TABLE "public"."products" TO "service_role";



GRANT ALL ON TABLE "public"."batch_details_view" TO "anon";
GRANT ALL ON TABLE "public"."batch_details_view" TO "authenticated";
GRANT ALL ON TABLE "public"."batch_details_view" TO "service_role";



GRANT ALL ON TABLE "public"."batch_ingredients" TO "anon";
GRANT ALL ON TABLE "public"."batch_ingredients" TO "authenticated";
GRANT ALL ON TABLE "public"."batch_ingredients" TO "service_role";



GRANT ALL ON TABLE "public"."production_batch_items" TO "anon";
GRANT ALL ON TABLE "public"."production_batch_items" TO "authenticated";
GRANT ALL ON TABLE "public"."production_batch_items" TO "service_role";



GRANT ALL ON TABLE "public"."batch_items_view" TO "anon";
GRANT ALL ON TABLE "public"."batch_items_view" TO "authenticated";
GRANT ALL ON TABLE "public"."batch_items_view" TO "service_role";



GRANT ALL ON TABLE "public"."batch_orders" TO "anon";
GRANT ALL ON TABLE "public"."batch_orders" TO "authenticated";
GRANT ALL ON TABLE "public"."batch_orders" TO "service_role";



GRANT ALL ON TABLE "public"."categories" TO "anon";
GRANT ALL ON TABLE "public"."categories" TO "authenticated";
GRANT ALL ON TABLE "public"."categories" TO "service_role";



GRANT ALL ON TABLE "public"."communication_log" TO "anon";
GRANT ALL ON TABLE "public"."communication_log" TO "authenticated";
GRANT ALL ON TABLE "public"."communication_log" TO "service_role";



GRANT ALL ON TABLE "public"."customer_addresses" TO "anon";
GRANT ALL ON TABLE "public"."customer_addresses" TO "authenticated";
GRANT ALL ON TABLE "public"."customer_addresses" TO "service_role";



GRANT ALL ON TABLE "public"."customers" TO "anon";
GRANT ALL ON TABLE "public"."customers" TO "authenticated";
GRANT ALL ON TABLE "public"."customers" TO "service_role";



GRANT ALL ON TABLE "public"."delivery_details_view" TO "anon";
GRANT ALL ON TABLE "public"."delivery_details_view" TO "authenticated";
GRANT ALL ON TABLE "public"."delivery_details_view" TO "service_role";



GRANT ALL ON TABLE "public"."delivery_partners" TO "anon";
GRANT ALL ON TABLE "public"."delivery_partners" TO "authenticated";
GRANT ALL ON TABLE "public"."delivery_partners" TO "service_role";



GRANT ALL ON TABLE "public"."ingredients" TO "anon";
GRANT ALL ON TABLE "public"."ingredients" TO "authenticated";
GRANT ALL ON TABLE "public"."ingredients" TO "service_role";



GRANT ALL ON TABLE "public"."purchase_orders" TO "anon";
GRANT ALL ON TABLE "public"."purchase_orders" TO "authenticated";
GRANT ALL ON TABLE "public"."purchase_orders" TO "service_role";



GRANT ALL ON TABLE "public"."ingredient_po_status" TO "anon";
GRANT ALL ON TABLE "public"."ingredient_po_status" TO "authenticated";
GRANT ALL ON TABLE "public"."ingredient_po_status" TO "service_role";



GRANT ALL ON TABLE "public"."ingredient_unit_conversions" TO "anon";
GRANT ALL ON TABLE "public"."ingredient_unit_conversions" TO "authenticated";
GRANT ALL ON TABLE "public"."ingredient_unit_conversions" TO "service_role";



GRANT ALL ON TABLE "public"."ingredient_updates" TO "anon";
GRANT ALL ON TABLE "public"."ingredient_updates" TO "authenticated";
GRANT ALL ON TABLE "public"."ingredient_updates" TO "service_role";



GRANT ALL ON TABLE "public"."vendors" TO "anon";
GRANT ALL ON TABLE "public"."vendors" TO "authenticated";
GRANT ALL ON TABLE "public"."vendors" TO "service_role";



GRANT ALL ON TABLE "public"."ingredients_with_vendors" TO "anon";
GRANT ALL ON TABLE "public"."ingredients_with_vendors" TO "authenticated";
GRANT ALL ON TABLE "public"."ingredients_with_vendors" TO "service_role";



GRANT ALL ON TABLE "public"."low_stock_alerts" TO "anon";
GRANT ALL ON TABLE "public"."low_stock_alerts" TO "authenticated";
GRANT ALL ON TABLE "public"."low_stock_alerts" TO "service_role";



GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."order_lifecycle_view" TO "anon";
GRANT ALL ON TABLE "public"."order_lifecycle_view" TO "authenticated";
GRANT ALL ON TABLE "public"."order_lifecycle_view" TO "service_role";



GRANT ALL ON TABLE "public"."product_variants" TO "anon";
GRANT ALL ON TABLE "public"."product_variants" TO "authenticated";
GRANT ALL ON TABLE "public"."product_variants" TO "service_role";



GRANT ALL ON TABLE "public"."order_summary" TO "anon";
GRANT ALL ON TABLE "public"."order_summary" TO "authenticated";
GRANT ALL ON TABLE "public"."order_summary" TO "service_role";



GRANT ALL ON TABLE "public"."orders_with_ingredient_status" TO "anon";
GRANT ALL ON TABLE "public"."orders_with_ingredient_status" TO "authenticated";
GRANT ALL ON TABLE "public"."orders_with_ingredient_status" TO "service_role";



GRANT ALL ON TABLE "public"."packaging_materials" TO "anon";
GRANT ALL ON TABLE "public"."packaging_materials" TO "authenticated";
GRANT ALL ON TABLE "public"."packaging_materials" TO "service_role";



GRANT ALL ON TABLE "public"."packaging_inventory_status" TO "anon";
GRANT ALL ON TABLE "public"."packaging_inventory_status" TO "authenticated";
GRANT ALL ON TABLE "public"."packaging_inventory_status" TO "service_role";



GRANT ALL ON TABLE "public"."packaging_inventory_view" TO "anon";
GRANT ALL ON TABLE "public"."packaging_inventory_view" TO "authenticated";
GRANT ALL ON TABLE "public"."packaging_inventory_view" TO "service_role";



GRANT ALL ON TABLE "public"."product_recipes" TO "anon";
GRANT ALL ON TABLE "public"."product_recipes" TO "authenticated";
GRANT ALL ON TABLE "public"."product_recipes" TO "service_role";



GRANT ALL ON SEQUENCE "public"."production_batch_number_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."production_batch_number_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."production_batch_number_seq" TO "service_role";



GRANT ALL ON TABLE "public"."production_batches_simple" TO "anon";
GRANT ALL ON TABLE "public"."production_batches_simple" TO "authenticated";
GRANT ALL ON TABLE "public"."production_batches_simple" TO "service_role";



GRANT ALL ON TABLE "public"."production_batches_test" TO "anon";
GRANT ALL ON TABLE "public"."production_batches_test" TO "authenticated";
GRANT ALL ON TABLE "public"."production_batches_test" TO "service_role";



GRANT ALL ON TABLE "public"."production_efficiency" TO "anon";
GRANT ALL ON TABLE "public"."production_efficiency" TO "authenticated";
GRANT ALL ON TABLE "public"."production_efficiency" TO "service_role";



GRANT ALL ON TABLE "public"."purchase_order_items" TO "anon";
GRANT ALL ON TABLE "public"."purchase_order_items" TO "authenticated";
GRANT ALL ON TABLE "public"."purchase_order_items" TO "service_role";



GRANT ALL ON TABLE "public"."simple_test" TO "anon";
GRANT ALL ON TABLE "public"."simple_test" TO "authenticated";
GRANT ALL ON TABLE "public"."simple_test" TO "service_role";



GRANT ALL ON TABLE "public"."stock_levels" TO "anon";
GRANT ALL ON TABLE "public"."stock_levels" TO "authenticated";
GRANT ALL ON TABLE "public"."stock_levels" TO "service_role";



GRANT ALL ON TABLE "public"."stock_transactions" TO "anon";
GRANT ALL ON TABLE "public"."stock_transactions" TO "authenticated";
GRANT ALL ON TABLE "public"."stock_transactions" TO "service_role";



GRANT ALL ON TABLE "public"."subscriptions" TO "anon";
GRANT ALL ON TABLE "public"."subscriptions" TO "authenticated";
GRANT ALL ON TABLE "public"."subscriptions" TO "service_role";



GRANT ALL ON TABLE "public"."test_table" TO "anon";
GRANT ALL ON TABLE "public"."test_table" TO "authenticated";
GRANT ALL ON TABLE "public"."test_table" TO "service_role";



GRANT ALL ON TABLE "public"."vendor_order_items" TO "anon";
GRANT ALL ON TABLE "public"."vendor_order_items" TO "authenticated";
GRANT ALL ON TABLE "public"."vendor_order_items" TO "service_role";



GRANT ALL ON TABLE "public"."vendor_orders" TO "anon";
GRANT ALL ON TABLE "public"."vendor_orders" TO "authenticated";
GRANT ALL ON TABLE "public"."vendor_orders" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































drop extension if exists "pg_net";

drop trigger if exists "handle_customer_addresses_updated_at" on "public"."customer_addresses";

drop trigger if exists "update_customers_updated_at" on "public"."customers";

drop trigger if exists "on_delivery_change" on "public"."deliveries";

drop trigger if exists "update_deliveries_updated_at" on "public"."deliveries";

drop trigger if exists "block_ready_production_trigger" on "public"."orders";

drop trigger if exists "update_orders_updated_at" on "public"."orders";

drop trigger if exists "block_insufficient_production_trigger" on "public"."production_batches";

drop trigger if exists "on_production_batch_change" on "public"."production_batches";

drop trigger if exists "trigger_check_orders_on_batch_completion" on "public"."production_batches";

drop trigger if exists "update_production_batches_updated_at" on "public"."production_batches";

drop trigger if exists "validate_production_ingredients_trigger" on "public"."production_batches";

drop trigger if exists "update_products_updated_at" on "public"."products";

drop trigger if exists "update_profiles_updated_at" on "public"."profiles";

drop trigger if exists "update_subscriptions_updated_at" on "public"."subscriptions";

drop trigger if exists "update_vendor_orders_updated_at" on "public"."vendor_orders";

drop policy "admin_partner_operations_orders_policy" on "public"."orders";

alter table "public"."batch_ingredients" drop constraint "batch_ingredients_batch_id_fkey";

alter table "public"."batch_ingredients" drop constraint "batch_ingredients_ingredient_id_fkey";

alter table "public"."batch_order_items" drop constraint "batch_order_items_batch_id_fkey";

alter table "public"."batch_order_items" drop constraint "batch_order_items_order_id_fkey";

alter table "public"."batch_order_items" drop constraint "batch_order_items_order_item_id_fkey";

alter table "public"."batch_orders" drop constraint "batch_orders_batch_id_fkey";

alter table "public"."batch_orders" drop constraint "batch_orders_order_id_fkey";

alter table "public"."communication_log" drop constraint "communication_log_customer_id_fkey";

alter table "public"."communication_log" drop constraint "communication_log_order_id_fkey";

alter table "public"."customer_addresses" drop constraint "customer_addresses_customer_id_fkey";

alter table "public"."customers" drop constraint "customers_profile_id_fkey";

alter table "public"."deliveries" drop constraint "deliveries_delivery_partner_id_fkey";

alter table "public"."deliveries" drop constraint "deliveries_order_id_fkey";

alter table "public"."ingredient_unit_conversions" drop constraint "ingredient_unit_conversions_ingredient_id_fkey";

alter table "public"."ingredient_updates" drop constraint "ingredient_updates_ingredient_id_fkey";

alter table "public"."ingredient_updates" drop constraint "ingredient_updates_new_supplier_fkey";

alter table "public"."ingredient_updates" drop constraint "ingredient_updates_previous_supplier_fkey";

alter table "public"."ingredients" drop constraint "ingredients_supplier_fkey";

alter table "public"."low_stock_alerts" drop constraint "low_stock_alerts_purchase_order_id_fkey";

alter table "public"."notifications" drop constraint "notifications_user_id_fkey";

alter table "public"."order_items" drop constraint "order_items_order_id_fkey";

alter table "public"."order_items" drop constraint "order_items_product_variant_id_fkey";

alter table "public"."orders" drop constraint "orders_customer_id_fkey";

alter table "public"."orders" drop constraint "orders_delivery_address_id_fkey";

alter table "public"."packaging_materials" drop constraint "packaging_materials_supplier_fkey";

alter table "public"."product_recipes" drop constraint "product_recipes_ingredient_id_fkey";

alter table "public"."product_recipes" drop constraint "product_recipes_product_id_fkey";

alter table "public"."product_variants" drop constraint "product_variants_product_id_fkey";

alter table "public"."production_batch_items" drop constraint "production_batch_items_batch_id_fkey";

alter table "public"."production_batch_items" drop constraint "production_batch_items_order_id_fkey";

alter table "public"."production_batch_items" drop constraint "production_batch_items_order_item_id_fkey";

alter table "public"."production_batch_items" drop constraint "production_batch_items_product_id_fkey";

alter table "public"."production_batch_items" drop constraint "production_batch_items_status_check";

alter table "public"."production_batches" drop constraint "production_batches_order_id_fkey";

alter table "public"."production_batches" drop constraint "production_batches_product_id_fkey";

alter table "public"."products" drop constraint "products_category_id_fkey";

alter table "public"."purchase_order_items" drop constraint "purchase_order_items_purchase_order_id_fkey";

alter table "public"."stock_transactions" drop constraint "stock_transactions_ingredient_id_fkey";

alter table "public"."subscriptions" drop constraint "subscriptions_customer_id_fkey";

alter table "public"."subscriptions" drop constraint "subscriptions_product_variant_id_fkey";

alter table "public"."vendor_order_items" drop constraint "vendor_order_items_ingredient_id_fkey";

alter table "public"."vendor_order_items" drop constraint "vendor_order_items_vendor_order_id_fkey";

alter table "public"."vendor_orders" drop constraint "vendor_orders_vendor_id_fkey";

alter table "public"."batch_ingredients" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."categories" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."communication_log" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."customer_addresses" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."customers" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."deliveries" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."delivery_partners" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."ingredients" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."notifications" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."order_items" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."orders" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."product_recipes" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."product_variants" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."production_batches" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."products" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."stock_transactions" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."subscriptions" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."vendor_order_items" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."vendor_orders" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."vendors" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."batch_ingredients" add constraint "batch_ingredients_batch_id_fkey" FOREIGN KEY (batch_id) REFERENCES public.production_batches(id) ON DELETE CASCADE not valid;

alter table "public"."batch_ingredients" validate constraint "batch_ingredients_batch_id_fkey";

alter table "public"."batch_ingredients" add constraint "batch_ingredients_ingredient_id_fkey" FOREIGN KEY (ingredient_id) REFERENCES public.ingredients(id) not valid;

alter table "public"."batch_ingredients" validate constraint "batch_ingredients_ingredient_id_fkey";

alter table "public"."batch_order_items" add constraint "batch_order_items_batch_id_fkey" FOREIGN KEY (batch_id) REFERENCES public.production_batches(id) ON DELETE CASCADE not valid;

alter table "public"."batch_order_items" validate constraint "batch_order_items_batch_id_fkey";

alter table "public"."batch_order_items" add constraint "batch_order_items_order_id_fkey" FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE not valid;

alter table "public"."batch_order_items" validate constraint "batch_order_items_order_id_fkey";

alter table "public"."batch_order_items" add constraint "batch_order_items_order_item_id_fkey" FOREIGN KEY (order_item_id) REFERENCES public.order_items(id) ON DELETE CASCADE not valid;

alter table "public"."batch_order_items" validate constraint "batch_order_items_order_item_id_fkey";

alter table "public"."batch_orders" add constraint "batch_orders_batch_id_fkey" FOREIGN KEY (batch_id) REFERENCES public.production_batches(id) ON DELETE CASCADE not valid;

alter table "public"."batch_orders" validate constraint "batch_orders_batch_id_fkey";

alter table "public"."batch_orders" add constraint "batch_orders_order_id_fkey" FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE not valid;

alter table "public"."batch_orders" validate constraint "batch_orders_order_id_fkey";

alter table "public"."communication_log" add constraint "communication_log_customer_id_fkey" FOREIGN KEY (customer_id) REFERENCES public.customers(id) not valid;

alter table "public"."communication_log" validate constraint "communication_log_customer_id_fkey";

alter table "public"."communication_log" add constraint "communication_log_order_id_fkey" FOREIGN KEY (order_id) REFERENCES public.orders(id) not valid;

alter table "public"."communication_log" validate constraint "communication_log_order_id_fkey";

alter table "public"."customer_addresses" add constraint "customer_addresses_customer_id_fkey" FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE not valid;

alter table "public"."customer_addresses" validate constraint "customer_addresses_customer_id_fkey";

alter table "public"."customers" add constraint "customers_profile_id_fkey" FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."customers" validate constraint "customers_profile_id_fkey";

alter table "public"."deliveries" add constraint "deliveries_delivery_partner_id_fkey" FOREIGN KEY (delivery_partner_id) REFERENCES public.delivery_partners(id) not valid;

alter table "public"."deliveries" validate constraint "deliveries_delivery_partner_id_fkey";

alter table "public"."deliveries" add constraint "deliveries_order_id_fkey" FOREIGN KEY (order_id) REFERENCES public.orders(id) not valid;

alter table "public"."deliveries" validate constraint "deliveries_order_id_fkey";

alter table "public"."ingredient_unit_conversions" add constraint "ingredient_unit_conversions_ingredient_id_fkey" FOREIGN KEY (ingredient_id) REFERENCES public.ingredients(id) ON DELETE CASCADE not valid;

alter table "public"."ingredient_unit_conversions" validate constraint "ingredient_unit_conversions_ingredient_id_fkey";

alter table "public"."ingredient_updates" add constraint "ingredient_updates_ingredient_id_fkey" FOREIGN KEY (ingredient_id) REFERENCES public.ingredients(id) ON DELETE CASCADE not valid;

alter table "public"."ingredient_updates" validate constraint "ingredient_updates_ingredient_id_fkey";

alter table "public"."ingredient_updates" add constraint "ingredient_updates_new_supplier_fkey" FOREIGN KEY (new_supplier) REFERENCES public.vendors(id) not valid;

alter table "public"."ingredient_updates" validate constraint "ingredient_updates_new_supplier_fkey";

alter table "public"."ingredient_updates" add constraint "ingredient_updates_previous_supplier_fkey" FOREIGN KEY (previous_supplier) REFERENCES public.vendors(id) not valid;

alter table "public"."ingredient_updates" validate constraint "ingredient_updates_previous_supplier_fkey";

alter table "public"."ingredients" add constraint "ingredients_supplier_fkey" FOREIGN KEY (supplier) REFERENCES public.vendors(id) ON DELETE SET NULL not valid;

alter table "public"."ingredients" validate constraint "ingredients_supplier_fkey";

alter table "public"."low_stock_alerts" add constraint "low_stock_alerts_purchase_order_id_fkey" FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_orders(id) not valid;

alter table "public"."low_stock_alerts" validate constraint "low_stock_alerts_purchase_order_id_fkey";

alter table "public"."notifications" add constraint "notifications_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) not valid;

alter table "public"."notifications" validate constraint "notifications_user_id_fkey";

alter table "public"."order_items" add constraint "order_items_order_id_fkey" FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE not valid;

alter table "public"."order_items" validate constraint "order_items_order_id_fkey";

alter table "public"."order_items" add constraint "order_items_product_variant_id_fkey" FOREIGN KEY (product_variant_id) REFERENCES public.product_variants(id) not valid;

alter table "public"."order_items" validate constraint "order_items_product_variant_id_fkey";

alter table "public"."orders" add constraint "orders_customer_id_fkey" FOREIGN KEY (customer_id) REFERENCES public.customers(id) not valid;

alter table "public"."orders" validate constraint "orders_customer_id_fkey";

alter table "public"."orders" add constraint "orders_delivery_address_id_fkey" FOREIGN KEY (delivery_address_id) REFERENCES public.customer_addresses(id) not valid;

alter table "public"."orders" validate constraint "orders_delivery_address_id_fkey";

alter table "public"."packaging_materials" add constraint "packaging_materials_supplier_fkey" FOREIGN KEY (supplier) REFERENCES public.vendors(id) not valid;

alter table "public"."packaging_materials" validate constraint "packaging_materials_supplier_fkey";

alter table "public"."product_recipes" add constraint "product_recipes_ingredient_id_fkey" FOREIGN KEY (ingredient_id) REFERENCES public.ingredients(id) ON DELETE CASCADE not valid;

alter table "public"."product_recipes" validate constraint "product_recipes_ingredient_id_fkey";

alter table "public"."product_recipes" add constraint "product_recipes_product_id_fkey" FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE not valid;

alter table "public"."product_recipes" validate constraint "product_recipes_product_id_fkey";

alter table "public"."product_variants" add constraint "product_variants_product_id_fkey" FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE not valid;

alter table "public"."product_variants" validate constraint "product_variants_product_id_fkey";

alter table "public"."production_batch_items" add constraint "production_batch_items_batch_id_fkey" FOREIGN KEY (batch_id) REFERENCES public.production_batches(id) ON DELETE CASCADE not valid;

alter table "public"."production_batch_items" validate constraint "production_batch_items_batch_id_fkey";

alter table "public"."production_batch_items" add constraint "production_batch_items_order_id_fkey" FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE not valid;

alter table "public"."production_batch_items" validate constraint "production_batch_items_order_id_fkey";

alter table "public"."production_batch_items" add constraint "production_batch_items_order_item_id_fkey" FOREIGN KEY (order_item_id) REFERENCES public.order_items(id) ON DELETE CASCADE not valid;

alter table "public"."production_batch_items" validate constraint "production_batch_items_order_item_id_fkey";

alter table "public"."production_batch_items" add constraint "production_batch_items_product_id_fkey" FOREIGN KEY (product_id) REFERENCES public.products(id) not valid;

alter table "public"."production_batch_items" validate constraint "production_batch_items_product_id_fkey";

alter table "public"."production_batch_items" add constraint "production_batch_items_status_check" CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'in_progress'::character varying, 'completed'::character varying, 'waste'::character varying])::text[]))) not valid;

alter table "public"."production_batch_items" validate constraint "production_batch_items_status_check";

alter table "public"."production_batches" add constraint "production_batches_order_id_fkey" FOREIGN KEY (order_id) REFERENCES public.orders(id) not valid;

alter table "public"."production_batches" validate constraint "production_batches_order_id_fkey";

alter table "public"."production_batches" add constraint "production_batches_product_id_fkey" FOREIGN KEY (product_id) REFERENCES public.products(id) not valid;

alter table "public"."production_batches" validate constraint "production_batches_product_id_fkey";

alter table "public"."products" add constraint "products_category_id_fkey" FOREIGN KEY (category_id) REFERENCES public.categories(id) not valid;

alter table "public"."products" validate constraint "products_category_id_fkey";

alter table "public"."purchase_order_items" add constraint "purchase_order_items_purchase_order_id_fkey" FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_orders(id) ON DELETE CASCADE not valid;

alter table "public"."purchase_order_items" validate constraint "purchase_order_items_purchase_order_id_fkey";

alter table "public"."stock_transactions" add constraint "stock_transactions_ingredient_id_fkey" FOREIGN KEY (ingredient_id) REFERENCES public.ingredients(id) not valid;

alter table "public"."stock_transactions" validate constraint "stock_transactions_ingredient_id_fkey";

alter table "public"."subscriptions" add constraint "subscriptions_customer_id_fkey" FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE not valid;

alter table "public"."subscriptions" validate constraint "subscriptions_customer_id_fkey";

alter table "public"."subscriptions" add constraint "subscriptions_product_variant_id_fkey" FOREIGN KEY (product_variant_id) REFERENCES public.product_variants(id) not valid;

alter table "public"."subscriptions" validate constraint "subscriptions_product_variant_id_fkey";

alter table "public"."vendor_order_items" add constraint "vendor_order_items_ingredient_id_fkey" FOREIGN KEY (ingredient_id) REFERENCES public.ingredients(id) not valid;

alter table "public"."vendor_order_items" validate constraint "vendor_order_items_ingredient_id_fkey";

alter table "public"."vendor_order_items" add constraint "vendor_order_items_vendor_order_id_fkey" FOREIGN KEY (vendor_order_id) REFERENCES public.vendor_orders(id) ON DELETE CASCADE not valid;

alter table "public"."vendor_order_items" validate constraint "vendor_order_items_vendor_order_id_fkey";

alter table "public"."vendor_orders" add constraint "vendor_orders_vendor_id_fkey" FOREIGN KEY (vendor_id) REFERENCES public.vendors(id) not valid;

alter table "public"."vendor_orders" validate constraint "vendor_orders_vendor_id_fkey";

create or replace view "public"."batch_details_view" as  SELECT pb.id AS batch_id,
    pb.batch_number,
    pb.status AS batch_status,
    pb.quantity_produced,
    pb.created_at,
    pb.updated_at,
    pb.notes,
    pb.priority,
    pb.batch_type,
        CASE
            WHEN (pb.batch_type = 'individual'::text) THEN o.order_number
            WHEN (pb.batch_type = 'group'::text) THEN COALESCE(order_stats.all_order_numbers, 'No orders'::text)
            ELSE 'Unknown'::text
        END AS order_number,
        CASE
            WHEN (pb.batch_type = 'group'::text) THEN order_stats.all_order_numbers
            ELSE NULL::text
        END AS all_order_numbers,
        CASE
            WHEN (pb.batch_type = 'individual'::text) THEN o.status
            WHEN (pb.batch_type = 'group'::text) THEN COALESCE(order_stats.order_statuses, 'No orders'::text)
            ELSE NULL::text
        END AS order_status,
        CASE
            WHEN (pb.batch_type = 'individual'::text) THEN o.total_amount
            WHEN (pb.batch_type = 'group'::text) THEN COALESCE(order_stats.total_amount, (0)::numeric)
            ELSE (0)::numeric
        END AS order_total,
        CASE
            WHEN (pb.batch_type = 'individual'::text) THEN COALESCE(individual_stats.item_count, (0)::bigint)
            WHEN (pb.batch_type = 'group'::text) THEN COALESCE(order_stats.item_count, (0)::bigint)
            ELSE (0)::bigint
        END AS item_count,
    COALESCE(pb.total_quantity_produced, pb.quantity_produced, 0) AS total_planned_quantity,
    COALESCE(pb.quantity_produced, 0) AS total_produced_quantity,
        CASE
            WHEN (COALESCE(pb.total_quantity_produced, pb.quantity_produced, 0) > 0) THEN round((((COALESCE(pb.quantity_produced, 0))::numeric * 100.0) / (COALESCE(pb.total_quantity_produced, pb.quantity_produced, 1))::numeric), 2)
            ELSE (0)::numeric
        END AS completion_percentage,
    pb.start_time,
    pb.end_time,
    (EXISTS ( SELECT 1
           FROM public.deliveries d
          WHERE (d.batch_id = pb.id))) AS delivery_created,
    p.name AS product_name,
    p.id AS product_id
   FROM ((((public.production_batches pb
     LEFT JOIN public.orders o ON ((pb.order_id = o.id)))
     LEFT JOIN public.products p ON ((pb.product_id = p.id)))
     LEFT JOIN LATERAL ( SELECT count(oi.id) AS item_count
           FROM public.order_items oi
          WHERE (oi.order_id = o.id)) individual_stats ON ((pb.batch_type = 'individual'::text)))
     LEFT JOIN LATERAL ( SELECT count(DISTINCT oi.order_id) AS order_count,
            count(oi.id) AS item_count,
            string_agg(DISTINCT o_group.order_number, ', '::text) AS all_order_numbers,
            string_agg(DISTINCT o_group.status, ', '::text) AS order_statuses,
            COALESCE(sum(DISTINCT o_group.total_amount), (0)::numeric) AS total_amount
           FROM ((public.batch_order_items boi
             JOIN public.order_items oi ON ((boi.order_item_id = oi.id)))
             JOIN public.orders o_group ON ((oi.order_id = o_group.id)))
          WHERE (boi.batch_id = pb.id)) order_stats ON ((pb.batch_type = 'group'::text)))
  ORDER BY pb.created_at DESC;


create or replace view "public"."batch_items_view" as  SELECT pbi.id AS batch_item_id,
    pbi.batch_id,
    pb.batch_number,
    pbi.order_id,
    o.order_number,
    pbi.order_item_id,
    pbi.product_id,
    p.name AS product_name,
    pbi.quantity_planned,
    pbi.quantity_produced,
    pbi.weight_grams,
    pbi.status AS item_status,
    pbi.notes,
    pbi.created_at,
    pbi.updated_at
   FROM (((public.production_batch_items pbi
     JOIN public.production_batches pb ON ((pbi.batch_id = pb.id)))
     JOIN public.orders o ON ((pbi.order_id = o.id)))
     JOIN public.products p ON ((pbi.product_id = p.id)));


create or replace view "public"."delivery_details_view" as  SELECT id,
    delivery_number,
    order_id,
    batch_id,
    delivery_partner_id,
    tracking_number,
    status,
    delivery_status,
    pickup_time,
    estimated_delivery_date,
    actual_delivery_date,
    delivered_time,
    notes,
    created_at,
    updated_at,
    customer_name,
    customer_email,
    customer_phone,
    delivery_address,
    delivery_partner_name,
    delivery_partner_phone,
    items_count,
    total_value
   FROM public.deliveries d;


create or replace view "public"."ingredient_po_status" as  SELECT i.id AS ingredient_id,
    i.name AS ingredient_name,
        CASE
            WHEN public.has_recent_purchase_order(i.id, 24) THEN true
            ELSE false
        END AS has_recent_po,
    max(po.created_at) AS last_po_date,
    count(
        CASE
            WHEN (po.status = ANY (ARRAY['draft'::text, 'sent'::text, 'confirmed'::text])) THEN 1
            ELSE NULL::integer
        END) AS active_po_count
   FROM (public.ingredients i
     LEFT JOIN public.purchase_orders po ON (((po.notes ~~ '%Auto-generated for%'::text) AND ((po.notes ~~* (('%Auto-generated for '::text || i.name) || '%'::text)) OR (po.notes ~~* (('%[Ingredient ID: '::text || i.id) || ']%'::text)) OR (po.notes ~~* (('%ingredient: '::text || i.name) || '%'::text)) OR (po.notes ~~* (('%(ID: '::text || i.id) || ')%'::text)) OR (po.notes ~~* (('%'::text || i.name) || '%'::text))) AND (po.status = ANY (ARRAY['draft'::text, 'sent'::text, 'confirmed'::text])) AND (po.created_at >= (CURRENT_TIMESTAMP - '24:00:00'::interval)))))
  GROUP BY i.id, i.name;


create or replace view "public"."ingredients_with_vendors" as  SELECT i.id,
    i.name,
    i.unit,
    i.current_stock,
    i.reorder_level,
    i.unit_cost,
    i.supplier,
    i.created_at,
    i.updated_at,
    v.name AS vendor_name,
    v.contact_person,
    v.phone AS vendor_phone,
    v.email AS vendor_email,
    v.address AS vendor_address,
    v.payment_terms,
    v.is_active AS vendor_is_active
   FROM (public.ingredients i
     LEFT JOIN public.vendors v ON ((i.supplier = v.id)));


create or replace view "public"."order_lifecycle_view" as  SELECT DISTINCT ON (o.id) o.id,
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
    COALESCE(p.full_name, 'Unknown Customer'::text) AS customer_name,
    p.email AS customer_email,
        CASE
            WHEN (o.status = 'pending'::text) THEN 'Order Placed'::text
            WHEN (o.status = 'confirmed'::text) THEN 'Order Confirmed'::text
            WHEN (o.status = 'ready_production'::text) THEN 'Preparing Your Order'::text
            WHEN (o.status = 'in_production'::text) THEN 'Preparing Your Order'::text
            WHEN (o.status = 'ready_delivery'::text) THEN 'Ready for Dispatch'::text
            WHEN (o.status = 'out_for_delivery'::text) THEN 'Out for Delivery'::text
            WHEN (o.status = 'delivered'::text) THEN 'Delivered'::text
            WHEN (o.status = 'cancelled'::text) THEN 'Cancelled'::text
            ELSE o.status
        END AS customer_status,
    GREATEST(o.updated_at, COALESCE(pb.updated_at, o.updated_at), COALESCE(d.updated_at, o.updated_at)) AS last_activity_at
   FROM (((public.orders o
     LEFT JOIN public.profiles p ON ((o.customer_id = p.id)))
     LEFT JOIN LATERAL ( SELECT production_batches.id,
            production_batches.batch_number,
            production_batches.product_id,
            production_batches.quantity_produced,
            production_batches.status,
            production_batches.planned_date,
            production_batches.actual_production_date,
            production_batches.notes,
            production_batches.created_at,
            production_batches.updated_at,
            production_batches.order_id,
            production_batches.created_by,
            production_batches.start_time,
            production_batches.end_time,
            production_batches.priority,
            production_batches.delivery_created,
            production_batches.batch_type,
            production_batches.total_orders,
            production_batches.total_quantity_produced,
            production_batches.waste_factor,
            production_batches.total_weight_grams
           FROM public.production_batches
          WHERE (production_batches.order_id = o.id)
          ORDER BY production_batches.updated_at DESC
         LIMIT 1) pb ON (true))
     LEFT JOIN LATERAL ( SELECT deliveries.id,
            deliveries.order_id,
            deliveries.delivery_partner_id,
            deliveries.pickup_time,
            deliveries.delivered_time,
            deliveries.status,
            deliveries.notes,
            deliveries.created_at,
            deliveries.updated_at,
            deliveries.delivery_number,
            deliveries.batch_id,
            deliveries.customer_name,
            deliveries.customer_email,
            deliveries.customer_phone,
            deliveries.delivery_address,
            deliveries.delivery_partner_name,
            deliveries.delivery_partner_phone,
            deliveries.estimated_delivery_date,
            deliveries.actual_delivery_date,
            deliveries.tracking_number,
            deliveries.items_count,
            deliveries.total_value,
            deliveries.delivery_status
           FROM public.deliveries
          WHERE (deliveries.order_id = o.id)
          ORDER BY deliveries.updated_at DESC
         LIMIT 1) d ON (true))
  ORDER BY o.id, o.created_at DESC;


create or replace view "public"."order_summary" as  SELECT o.id,
    o.order_number,
    o.status,
    o.total_amount,
    o.order_date,
    c.phone AS customer_phone,
    p.name AS product_name,
    sum(oi.quantity) AS total_quantity
   FROM ((((public.orders o
     JOIN public.customers c ON ((o.customer_id = c.id)))
     JOIN public.order_items oi ON ((o.id = oi.order_id)))
     JOIN public.product_variants pv ON ((oi.product_variant_id = pv.id)))
     JOIN public.products p ON ((pv.product_id = p.id)))
  GROUP BY o.id, o.order_number, o.status, o.total_amount, o.order_date, c.phone, p.name;


create or replace view "public"."orders_with_ingredient_status" as  SELECT o.id,
    o.order_number,
    o.customer_id,
    o.status,
    o.payment_method,
    o.payment_status,
    o.subtotal,
    o.delivery_fee,
    o.total_amount,
    o.delivery_address_id,
    o.delivery_notes,
    o.order_date,
    o.confirmed_date,
    o.production_start_date,
    o.ready_date,
    o.delivered_date,
    o.created_at,
    o.updated_at,
    o.delivery_created,
    o.production_started_at,
    o.production_completed_at,
    o.delivery_created_at,
    o.delivery_pickedup_at,
    o.delivery_in_transit_at,
    o.delivery_delivered_at,
        CASE
            WHEN prod_check.can_produce THEN 'Ready for Production'::text
            ELSE 'Insufficient Ingredients'::text
        END AS production_readiness,
    prod_check.missing_ingredients,
    prod_check.message AS ingredient_message
   FROM (public.orders o
     LEFT JOIN LATERAL ( SELECT can_start_production.can_produce,
            can_start_production.missing_ingredients,
            can_start_production.message
           FROM public.can_start_production(o.id) can_start_production(can_produce, missing_ingredients, message)) prod_check ON (true))
  WHERE (o.status = ANY (ARRAY['confirmed'::text, 'ready_production'::text, 'in_production'::text]))
  ORDER BY o.created_at DESC;


create or replace view "public"."packaging_inventory_status" as  SELECT pm.id,
    pm.name,
    pm.type,
    pm.unit,
    pm.current_stock,
    pm.reorder_level,
    pm.unit_cost,
    pm.description,
        CASE
            WHEN (pm.current_stock <= pm.reorder_level) THEN 'critical'::text
            WHEN (pm.current_stock <= (pm.reorder_level * 1.5)) THEN 'low'::text
            ELSE 'sufficient'::text
        END AS stock_status,
    COALESCE(v.name, 'No Supplier'::text) AS supplier_name,
    COALESCE(v.phone, 'N/A'::text) AS supplier_phone,
    pm.updated_at
   FROM (public.packaging_materials pm
     LEFT JOIN public.vendors v ON ((pm.supplier = v.id)))
  ORDER BY
        CASE
            WHEN (pm.current_stock <= pm.reorder_level) THEN 1
            WHEN (pm.current_stock <= (pm.reorder_level * 1.5)) THEN 2
            ELSE 3
        END, pm.type, pm.name;


create or replace view "public"."packaging_inventory_view" as  SELECT id,
    name,
    unit,
    current_stock,
    reorder_level,
    unit_cost,
    supplier,
        CASE
            WHEN ((name ~~ '%Label%'::text) OR (name ~~ '%Sticker%'::text)) THEN 'label'::text
            WHEN ((name ~~ '%Pouch%'::text) OR (name ~~ '%Jar%'::text) OR (name ~~ '%Box%'::text)) THEN 'packaging'::text
            ELSE 'ingredient'::text
        END AS material_type,
        CASE
            WHEN (current_stock <= reorder_level) THEN 'critical'::text
            WHEN (current_stock <= (reorder_level * 1.5)) THEN 'low'::text
            ELSE 'sufficient'::text
        END AS stock_status,
    updated_at
   FROM public.ingredients i
  WHERE ((name ~~ '%Pouch%'::text) OR (name ~~ '%Jar%'::text) OR (name ~~ '%Box%'::text) OR (name ~~ '%Label%'::text) OR (name ~~ '%Sticker%'::text))
  ORDER BY
        CASE
            WHEN ((name ~~ '%Label%'::text) OR (name ~~ '%Sticker%'::text)) THEN 'label'::text
            WHEN ((name ~~ '%Pouch%'::text) OR (name ~~ '%Jar%'::text) OR (name ~~ '%Box%'::text)) THEN 'packaging'::text
            ELSE 'ingredient'::text
        END, name;


create or replace view "public"."production_efficiency" as  SELECT pb.actual_production_date AS production_date,
    p.name AS product_name,
    count(*) AS batches_produced,
    sum(pb.quantity_produced) AS total_units,
    avg(pb.quantity_produced) AS avg_batch_size
   FROM (public.production_batches pb
     JOIN public.products p ON ((pb.product_id = p.id)))
  WHERE (pb.status = 'completed'::text)
  GROUP BY pb.actual_production_date, p.name
  ORDER BY pb.actual_production_date DESC;


create or replace view "public"."stock_levels" as  SELECT id,
    name,
    unit,
    current_stock,
    reorder_level,
        CASE
            WHEN (current_stock <= reorder_level) THEN 'Low Stock'::text
            ELSE 'OK'::text
        END AS stock_status
   FROM public.ingredients i;



  create policy "admin_partner_operations_orders_policy"
  on "public"."orders"
  as permissive
  for all
  to public
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'partner'::text, 'operations'::text]))))));


CREATE TRIGGER handle_customer_addresses_updated_at BEFORE UPDATE ON public.customer_addresses FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER on_delivery_change AFTER INSERT OR UPDATE ON public.deliveries FOR EACH ROW EXECUTE FUNCTION public.update_order_status_from_delivery();

CREATE TRIGGER update_deliveries_updated_at BEFORE UPDATE ON public.deliveries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER block_ready_production_trigger BEFORE UPDATE ON public.orders FOR EACH ROW WHEN ((old.status IS DISTINCT FROM new.status)) EXECUTE FUNCTION public.block_ready_production_status();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER block_insufficient_production_trigger BEFORE INSERT ON public.production_batches FOR EACH ROW EXECUTE FUNCTION public.block_insufficient_production();

CREATE TRIGGER on_production_batch_change AFTER INSERT OR UPDATE ON public.production_batches FOR EACH ROW EXECUTE FUNCTION public.update_order_status_from_production();

CREATE TRIGGER trigger_check_orders_on_batch_completion AFTER UPDATE ON public.production_batches FOR EACH ROW EXECUTE FUNCTION public.trigger_check_orders_on_batch_completion();

CREATE TRIGGER update_production_batches_updated_at BEFORE UPDATE ON public.production_batches FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER validate_production_ingredients_trigger BEFORE INSERT OR UPDATE ON public.production_batches FOR EACH ROW WHEN (((new.status = 'planned'::text) OR (new.status = 'in_progress'::text))) EXECUTE FUNCTION public.validate_production_ingredients();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vendor_orders_updated_at BEFORE UPDATE ON public.vendor_orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


  create policy "Allow image uploads 16wiy3a_0"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check (((bucket_id = 'product-images'::text) AND (auth.role() = 'authenticated'::text)));



  create policy "Public Access 16wiy3a_0"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'product-images'::text));



