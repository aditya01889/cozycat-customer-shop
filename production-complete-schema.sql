-- =====================================================
-- CozyCatKitchen Production Database Schema
-- Generated on: 2026-02-01T13:58:43.011Z
-- =====================================================

-- Table: categories
CREATE TABLE IF NOT EXISTS categories (
    id UUID NOT NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT NOT NULL,
    display_order INTEGER NOT NULL,
    is_active BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Sample data for categories:
-- {
  "id": "4c4fb304-ba44-41dc-9a53-8db1fed30ef2",
  "name": "Meals",
  "slug": "meals",
  "description": "Complete nutritious meals - 70g per pack",
  "display_order": 1,
  "is_active": true,
  "created_at": "2026-01-13T18:18:36.485961+00:00"
}

-- Table: products
CREATE TABLE IF NOT EXISTS products (
    id UUID NOT NULL,
    category_id UUID NOT NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT NOT NULL,
    short_description TEXT NOT NULL,
    nutritional_info TEXT,
    ingredients_display TEXT,
    image_url TEXT NOT NULL,
    is_active BOOLEAN NOT NULL,
    display_order INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    packaging_type TEXT NOT NULL,
    label_type TEXT NOT NULL,
    packaging_quantity_per_product INTEGER NOT NULL,
    label_quantity_per_product INTEGER NOT NULL
);

-- Sample data for products:
-- {
  "id": "e017972d-4a82-4461-b24d-8a1fd72b5c71",
  "category_id": "4c4fb304-ba44-41dc-9a53-8db1fed30ef2",
  "name": "Nourish",
  "slug": "nourish",
  "description": "Complete balanced meal with chicken, pumpkin and rice. Perfect for daily nutrition.",
  "short_description": "Balanced chicken meal with pumpkin",
  "nutritional_info": null,
  "ingredients_display": null,
  "image_url": "https://xfnbhheapralprcwjvzl.supabase.co/storage/v1/object/public/product-images/product-images/1768592432205-39fsykfg387.webp",
  "is_active": true,
  "display_order": 1,
  "created_at": "2026-01-13T18:18:36.485961+00:00",
  "updated_at": "2026-01-25T23:19:11.959397+00:00",
  "packaging_type": "70g Stand Up Pouch",
  "label_type": "Nourish Label",
  "packaging_quantity_per_product": 1,
  "label_quantity_per_product": 1
}

-- Table: product_variants
CREATE TABLE IF NOT EXISTS product_variants (
    id UUID NOT NULL,
    product_id UUID NOT NULL,
    weight_grams INTEGER NOT NULL,
    price INTEGER NOT NULL,
    sku TEXT NOT NULL,
    is_active BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Sample data for product_variants:
-- {
  "id": "c53513f9-b34a-4273-94d0-4aa5cbb8edb3",
  "product_id": "0e9204cf-21af-482f-a332-d36269959ffd",
  "weight_grams": 100,
  "price": 100,
  "sku": "BONERICH-100ML",
  "is_active": true,
  "created_at": "2026-01-13T18:18:36.485961+00:00"
}

-- Table: profiles
CREATE TABLE IF NOT EXISTS profiles (
    id UUID NOT NULL,
    role TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Sample data for profiles:
-- {
  "id": "3cbc1133-e8e1-4e8c-9ba6-38ba14434727",
  "role": "operations",
  "full_name": "Ops",
  "phone": "09953940842",
  "email": "cozykitchenemail@gmail.com",
  "avatar_url": null,
  "created_at": "2026-01-17T21:46:59.992545+00:00",
  "updated_at": "2026-01-25T09:06:46.168528+00:00"
}

-- Table: orders
CREATE TABLE IF NOT EXISTS orders (
    id UUID NOT NULL,
    order_number TEXT NOT NULL,
    customer_id UUID NOT NULL,
    status TEXT NOT NULL,
    payment_method TEXT NOT NULL,
    payment_status TEXT NOT NULL,
    subtotal INTEGER NOT NULL,
    delivery_fee INTEGER NOT NULL,
    total_amount INTEGER NOT NULL,
    delivery_address_id TEXT,
    delivery_notes TEXT NOT NULL,
    order_date TIMESTAMP WITH TIME ZONE NOT NULL,
    confirmed_date TEXT,
    production_start_date TEXT,
    ready_date TEXT,
    delivered_date TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    delivery_created BOOLEAN NOT NULL,
    production_started_at TEXT,
    production_completed_at TEXT,
    delivery_created_at TEXT,
    delivery_pickedup_at TEXT,
    delivery_in_transit_at TEXT,
    delivery_delivered_at TEXT
);

-- Sample data for orders:
-- {
  "id": "30671888-b26f-456c-bae4-cec69c1e6a49",
  "order_number": "ORD-40617048",
  "customer_id": "6fec6f12-473a-4218-9ed5-783233bc4252",
  "status": "out_for_delivery",
  "payment_method": "cod",
  "payment_status": "pending",
  "subtotal": 520,
  "delivery_fee": 0,
  "total_amount": 520,
  "delivery_address_id": null,
  "delivery_notes": "{\"customer_name\":\"Priyanka Yadav\",\"customer_phone\":\"+919953940842\",\"customer_email\":\"cozycatkitchen@gmail.com\",\"customer_whatsapp\":\"+919953940842\",\"address_line1\":\"603, Tower - B5, Jaypee Klassic, Sector - 134, Noida\",\"address_line2\":\"\",\"landmark\":\"\",\"city\":\"Noida\",\"state\":\"Uttar Pradesh\",\"pincode\":\"201304\",\"delivery_notes\":\"\",\"is_guest_order\":false}",
  "order_date": "2026-01-17T09:03:37.092453+00:00",
  "confirmed_date": null,
  "production_start_date": null,
  "ready_date": null,
  "delivered_date": null,
  "created_at": "2026-01-17T09:03:37.092453+00:00",
  "updated_at": "2026-01-25T19:51:33.598599+00:00",
  "delivery_created": true,
  "production_started_at": null,
  "production_completed_at": null,
  "delivery_created_at": null,
  "delivery_pickedup_at": null,
  "delivery_in_transit_at": null,
  "delivery_delivered_at": null
}

-- Table: order_items
CREATE TABLE IF NOT EXISTS order_items (
    id UUID NOT NULL,
    order_id UUID NOT NULL,
    product_variant_id UUID NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price INTEGER NOT NULL,
    total_price INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Sample data for order_items:
-- {
  "id": "378c092a-7e4f-40c5-b130-a82c49f27da4",
  "order_id": "3a2be9a6-588a-4a93-9e04-999216891c31",
  "product_variant_id": "8e23464a-0b99-47a6-be88-dcdb822e18ae",
  "quantity": 1,
  "unit_price": 500,
  "total_price": 500,
  "created_at": "2026-01-13T19:13:41.717459+00:00"
}

-- Table: notifications (EMPTY)
-- Could not determine structure - no data available

-- Table: customers
CREATE TABLE IF NOT EXISTS customers (
    id UUID NOT NULL,
    profile_id UUID NOT NULL,
    phone TEXT NOT NULL,
    whatsapp_number TEXT,
    is_active BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Sample data for customers:
-- {
  "id": "1bdc0d75-de5a-462e-8050-78169ac09139",
  "profile_id": "1bdc0d75-de5a-462e-8050-78169ac09139",
  "phone": "09953940842",
  "whatsapp_number": null,
  "is_active": true,
  "created_at": "2026-01-16T18:59:38.254772+00:00",
  "updated_at": "2026-01-18T09:46:49.333449+00:00"
}
