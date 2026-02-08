import { renderHook, act } from '@testing-library/react';
import { createTestProduct } from '../test-data-factory';

// Mock cart store (we'll need to create this)
const mockCartStore = {
  items: [],
  addItem: jest.fn(),
  removeItem: jest.fn(),
  updateQuantity: jest.fn(),
  clearCart: jest.fn(),
  getTotalItems: jest.fn(() => 0),
  getSubtotal: jest.fn(() => 0),
  getTotal: jest.fn(() => 0),
};

jest.mock('@/lib/store/cart', () => ({
  useCartStore: () => mockCartStore,
}));

describe('Cart Store', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCartStore.items = [];
    mockCartStore.getTotalItems.mockReturnValue(0);
    mockCartStore.getSubtotal.mockReturnValue(0);
    mockCartStore.getTotal.mockReturnValue(0);
  });

  test('should add item to cart', () => {
    const testProduct = createTestProduct();
    
    act(() => {
      mockCartStore.addItem({
        productId: testProduct.id,
        variantId: 'test-variant-id',
        productName: testProduct.name,
        weight: testProduct.weight_grams,
        price: testProduct.price,
        quantity: 1,
        sku: 'TEST-001'
      });
    });

    expect(mockCartStore.addItem).toHaveBeenCalledWith({
      productId: testProduct.id,
      variantId: 'test-variant-id',
      productName: testProduct.name,
      weight: testProduct.weight_grams,
      price: testProduct.price,
      quantity: 1,
      sku: 'TEST-001'
    });
  });

  test('should remove item from cart', () => {
    const productId = 'test-product-id';
    
    act(() => {
      mockCartStore.removeItem(productId);
    });

    expect(mockCartStore.removeItem).toHaveBeenCalledWith(productId);
  });

  test('should update item quantity', () => {
    const productId = 'test-product-id';
    const newQuantity = 3;
    
    act(() => {
      mockCartStore.updateQuantity(productId, newQuantity);
    });

    expect(mockCartStore.updateQuantity).toHaveBeenCalledWith(productId, newQuantity);
  });

  test('should clear cart', () => {
    act(() => {
      mockCartStore.clearCart();
    });

    expect(mockCartStore.clearCart).toHaveBeenCalled();
  });

  test('should calculate total items correctly', () => {
    mockCartStore.items = [
      { quantity: 2 },
      { quantity: 3 },
      { quantity: 1 }
    ];
    mockCartStore.getTotalItems.mockReturnValue(6);

    const total = mockCartStore.getTotalItems();
    expect(total).toBe(6);
  });

  test('should calculate subtotal correctly', () => {
    mockCartStore.items = [
      { price: 299, quantity: 2 },
      { price: 199, quantity: 1 }
    ];
    mockCartStore.getSubtotal.mockReturnValue(797);

    const subtotal = mockCartStore.getSubtotal();
    expect(subtotal).toBe(797);
  });
});
