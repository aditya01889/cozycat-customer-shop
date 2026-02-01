-- =============================================================================
-- CozyCatKitchen Staging Database Seed Script
-- Lean staging data for testing purposes
-- =============================================================================

-- NOTE: This script creates minimal test data for staging environment
-- DO NOT run this on production database!

-- Insert sample categories (if they don't exist)
INSERT INTO categories (id, name, description, slug, image_url, created_at, updated_at)
VALUES 
  ('cat-food', 'Cat Food', 'Premium nutrition for your feline friend', 'cat-food', '/images/categories/cat-food.jpg', NOW(), NOW()),
  ('cat-treats', 'Cat Treats', 'Delicious treats for training and rewards', 'cat-treats', '/images/categories/cat-treats.jpg', NOW(), NOW()),
  ('cat-broth', 'Cat Broth', 'Nutritious broths for hydration and taste', 'cat-broth', '/images/categories/cat-broth.jpg', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert sample products (if they don't exist)
INSERT INTO products (id, name, description, price, category_id, image_url, in_stock, created_at, updated_at)
VALUES 
  ('premium-chicken', 'Premium Chicken Meal', 'High-quality chicken formula for adult cats', 299.99, 'cat-food', '/images/products/chicken-meal.jpg', true, NOW(), NOW()),
  ('salmon-treats', 'Salmon Training Treats', 'Omega-rich salmon treats for training', 149.99, 'cat-treats', '/images/products/salmon-treats.jpg', true, NOW(), NOW()),
  ('chicken-broth', 'Chicken Bone Broth', 'Nutritious chicken broth for hydration', 89.99, 'cat-broth', '/images/products/chicken-broth.jpg', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert test user profiles (if they don't exist)
INSERT INTO profiles (id, email, name, role, created_at, updated_at)
VALUES 
  ('staging-admin@cozycatkitchen.com', 'staging-admin@cozycatkitchen.com', 'Staging Admin', 'admin', NOW(), NOW()),
  ('staging-user@cozycatkitchen.com', 'staging-user@cozycatkitchen.com', 'Staging User', 'user', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Insert sample addresses for test user
INSERT INTO addresses (id, user_id, name, phone, street, city, state, postal_code, country, is_default, created_at, updated_at)
VALUES 
  ('addr-001', 'staging-user@cozycatkitchen.com', 'Test User', '+1234567890', '123 Test Street', 'Test City', 'Test State', '12345', 'Test Country', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert sample orders (if they don't exist)
INSERT INTO orders (id, user_id, total_amount, status, payment_status, shipping_address, created_at, updated_at)
VALUES 
  ('order-staging-001', 'staging-user@cozycatkitchen.com', 539.97, 'delivered', 'paid', 'addr-001', NOW() - INTERVAL '7 days', NOW() - INTERVAL '5 days')
ON CONFLICT (id) DO NOTHING;

-- Insert sample order items
INSERT INTO order_items (id, order_id, product_id, quantity, price, created_at, updated_at)
VALUES 
  ('item-staging-001', 'order-staging-001', 'premium-chicken', 1, 299.99, NOW() - INTERVAL '7 days', NOW() - INTERVAL '5 days'),
  ('item-staging-002', 'order-staging-001', 'salmon-treats', 1, 149.99, NOW() - INTERVAL '7 days', NOW() - INTERVAL '5 days'),
  ('item-staging-003', 'order-staging-001', 'chicken-broth', 1, 89.99, NOW() - INTERVAL '7 days', NOW() - INTERVAL '5 days')
ON CONFLICT (id) DO NOTHING;

-- Create test cart items
INSERT INTO cart_items (id, user_id, product_id, quantity, created_at, updated_at)
VALUES 
  ('cart-staging-001', 'staging-user@cozycatkitchen.com', 'premium-chicken', 2, NOW(), NOW()),
  ('cart-staging-002', 'staging-user@cozycatkitchen.com', 'salmon-treats', 1, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Add some analytics data for testing
INSERT INTO analytics_events (id, event_type, user_id, session_id, metadata, created_at)
VALUES 
  ('analytics-001', 'page_view', 'staging-user@cozycatkitchen.com', 'session-staging-001', '{"page": "/products", "product_id": "premium-chicken"}', NOW() - INTERVAL '1 hour'),
  ('analytics-002', 'add_to_cart', 'staging-user@cozycatkitchen.com', 'session-staging-001', '{"product_id": "premium-chicken", "quantity": 1}', NOW() - INTERVAL '1 hour'),
  ('analytics-003', 'purchase', 'staging-user@cozycatkitchen.com', 'session-staging-001', '{"order_id": "order-staging-001", "total": 539.97}', NOW() - INTERVAL '7 days')
ON CONFLICT (id) DO NOTHING;

-- Create some test API keys for staging
INSERT INTO api_keys (id, name, key_hash, permissions, rate_limit, is_active, created_at, updated_at)
VALUES 
  ('staging-api-key-001', 'Staging Test Key', 'hashed_key_here', '{"read": true, "write": false}', 100, true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Add some configuration data
INSERT INTO app_config (id, key, value, description, created_at, updated_at)
VALUES 
  ('config-staging-001', 'maintenance_mode', 'false', 'Enable/disable maintenance mode', NOW(), NOW()),
  ('config-staging-002', 'payment_test_mode', 'true', 'Enable test mode for payments', NOW(), NOW()),
  ('config-staging-003', 'debug_mode', 'true', 'Enable debug logging', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Create some sample reviews
INSERT INTO reviews (id, product_id, user_id, rating, comment, verified_purchase, created_at, updated_at)
VALUES 
  ('review-staging-001', 'premium-chicken', 'staging-user@cozycatkitchen.com', 5, 'Great product! My cat loves it.', true, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
  ('review-staging-002', 'salmon-treats', 'staging-user@cozycatkitchen.com', 4, 'Good treats for training.', true, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days')
ON CONFLICT (id) DO NOTHING;

-- Add some wishlist items
INSERT INTO wishlist_items (id, user_id, product_id, created_at, updated_at)
VALUES 
  ('wishlist-staging-001', 'staging-user@cozycatkitchen.com', 'chicken-broth', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;

-- Create some notifications
INSERT INTO notifications (id, user_id, type, title, message, read, created_at, updated_at)
VALUES 
  ('notif-staging-001', 'staging-user@cozycatkitchen.com', 'order_status', 'Order Delivered', 'Your order has been delivered successfully!', false, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
  ('notif-staging-002', 'staging-user@cozycatkitchen.com', 'promotion', 'Special Offer', 'Get 20% off on all cat food this week!', false, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- Summary of staging data created:
-- - 3 categories
-- - 3 products  
-- - 2 test users (1 admin, 1 regular)
-- - 1 address
-- - 1 order with 3 items
-- - 2 cart items
-- - 3 analytics events
-- - 1 API key
-- - 3 config settings
-- - 2 reviews
-- - 1 wishlist item
-- - 2 notifications
-- 
-- This provides enough data for comprehensive testing without
-- overwhelming the staging environment or exposing real data.
-- =============================================================================
