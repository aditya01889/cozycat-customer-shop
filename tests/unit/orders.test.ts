import { renderHook, act } from '@testing-library/react';
import { createTestOrder, createTestProduct } from '../test-data-factory';

// Mock order store
const mockOrderStore = {
  orders: [],
  createOrder: jest.fn(),
  updateOrderStatus: jest.fn(),
  getOrderHistory: jest.fn(() => []),
  getOrderById: jest.fn(() => null),
};

jest.mock('@/lib/store/orders', () => ({
  useOrderStore: () => mockOrderStore,
}));

// Mock Supabase
const mockSupabase = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => Promise.resolve({ 
        data: [createTestOrder()], 
        error: null 
      })),
      insert: jest.fn(() => Promise.resolve({ 
        data: createTestOrder(), 
        error: null 
      })),
      update: jest.fn(() => Promise.resolve({ 
        data: createTestOrder({ status: 'confirmed' }), 
        error: null 
      }))
    }))
  }))
};

jest.mock('@/lib/supabase', () => ({
  supabase: mockSupabase
}));

describe('Order Store', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOrderStore.orders = [];
    mockOrderStore.getOrderHistory.mockReturnValue([]);
    mockOrderStore.getOrderById.mockReturnValue(null);
  });

  test('should create order successfully', () => {
    const orderData = {
      customer_id: 'test-customer-id',
      items: [
        {
          product_id: 'test-product-id',
          variant_id: 'test-variant-id',
          quantity: 2,
          price: 299
        }
      ],
      total_amount: 598,
      delivery_address: {
        street: '123 Test St',
        city: 'Test City',
        postal_code: '12345'
      }
    };

    act(() => {
      mockOrderStore.createOrder(orderData);
    });

    expect(mockOrderStore.createOrder).toHaveBeenCalledWith(orderData);
  });

  test('should update order status', () => {
    const orderId = 'test-order-id';
    const newStatus = 'confirmed';

    act(() => {
      mockOrderStore.updateOrderStatus(orderId, newStatus);
    });

    expect(mockOrderStore.updateOrderStatus).toHaveBeenCalledWith(orderId, newStatus);
  });

  test('should get order history', () => {
    const testOrders = [createTestOrder(), createTestOrder({ id: 'order-2' })];
    mockOrderStore.getOrderHistory.mockReturnValue(testOrders);

    const history = mockOrderStore.getOrderHistory();
    expect(history).toEqual(testOrders);
  });

  test('should get order by id', () => {
    const testOrder = createTestOrder();
    mockOrderStore.getOrderById.mockReturnValue(testOrder);

    const order = mockOrderStore.getOrderById(testOrder.id);
    expect(order).toEqual(testOrder);
  });
});

describe('Order API Functions', () => {
  test('should fetch user orders successfully', async () => {
    const testOrder = createTestOrder();
    const customerId = 'test-customer-id';
    
    const { getUserOrders } = require('@/lib/api/orders');
    const result = await getUserOrders(customerId);

    expect(mockSupabase.from).toHaveBeenCalledWith('orders');
    expect(result).toEqual([testOrder]);
  });

  test('should create order successfully', async () => {
    const newOrder = createTestOrder();
    
    const { createOrder } = require('@/lib/api/orders');
    const result = await createOrder(newOrder);

    expect(mockSupabase.from).toHaveBeenCalledWith('orders');
    expect(result).toEqual(newOrder);
  });

  test('should update order status successfully', async () => {
    const orderId = 'test-order-id';
    const status = 'confirmed';
    
    const { updateOrderStatus } = require('@/lib/api/orders');
    const result = await updateOrderStatus(orderId, status);

    expect(mockSupabase.from).toHaveBeenCalledWith('orders');
    expect(result.status).toBe('confirmed');
  });
});

describe('Order Validation', () => {
  test('should validate order data', () => {
    const validOrder = createTestOrder();
    
    const { validateOrder } = require('@/lib/validation/orders');
    const result = validateOrder(validOrder);

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  test('should reject invalid order data', () => {
    const invalidOrder = {
      customer_id: '', // Invalid: empty
      total_amount: -100, // Invalid: negative
      status: 'invalid-status' // Invalid: not in allowed values
    };
    
    const { validateOrder } = require('@/lib/validation/orders');
    const result = validateOrder(invalidOrder);

    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  test('should calculate order total correctly', () => {
    const items = [
      { price: 299, quantity: 2 },
      { price: 199, quantity: 1 },
      { price: 99, quantity: 3 }
    ];
    
    const { calculateOrderTotal } = require('@/lib/utils/orders');
    const total = calculateOrderTotal(items);

    expect(total).toBe(1194); // (299 * 2) + (199 * 1) + (99 * 3)
  });
});
