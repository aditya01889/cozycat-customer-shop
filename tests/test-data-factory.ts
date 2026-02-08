export const createTestProduct = (overrides = {}) => ({
  id: 'test-product-id',
  name: 'Test Product',
  slug: 'test-product',
  description: 'Test product description',
  price: 299,
  weight_grams: 100,
  is_active: true,
  display_order: 1,
  category_id: 'test-category-id',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides
});

export const createTestOrder = (overrides = {}) => ({
  id: 'test-order-id',
  order_number: 'ORD-001',
  customer_id: 'test-customer-id',
  status: 'pending',
  total_amount: 299,
  order_date: new Date().toISOString(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides
});

export const createTestCategory = (overrides = {}) => ({
  id: 'test-category-id',
  name: 'Test Category',
  slug: 'test-category',
  description: 'Test category description',
  is_active: true,
  display_order: 1,
  created_at: new Date().toISOString(),
  ...overrides
});