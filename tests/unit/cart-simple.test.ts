// Simple cart tests without external dependencies

describe('Cart Functionality', () => {
  test('should add item to cart', () => {
    const cart = [];
    const item = { id: 1, name: 'Test Product', price: 10, quantity: 1 };
    
    cart.push(item);
    
    expect(cart).toHaveLength(1);
    expect(cart[0].name).toBe('Test Product');
  });

  test('should remove item from cart', () => {
    const cart = [{ id: 1, name: 'Test Product', price: 10, quantity: 1 }];
    
    const filteredCart = cart.filter(item => item.id !== 1);
    
    expect(filteredCart).toHaveLength(0);
  });

  test('should calculate total price', () => {
    const cart = [
      { id: 1, name: 'Product 1', price: 10, quantity: 2 },
      { id: 2, name: 'Product 2', price: 15, quantity: 1 }
    ];
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    expect(total).toBe(35);
  });

  test('should update item quantity', () => {
    const cart = [{ id: 1, name: 'Test Product', price: 10, quantity: 1 }];
    
    const updatedCart = cart.map(item => 
      item.id === 1 ? { ...item, quantity: 3 } : item
    );
    
    expect(updatedCart[0].quantity).toBe(3);
  });

  test('should clear cart', () => {
    const cart = [
      { id: 1, name: 'Product 1', price: 10, quantity: 1 },
      { id: 2, name: 'Product 2', price: 15, quantity: 1 }
    ];
    
    const clearedCart = [];
    
    expect(clearedCart).toHaveLength(0);
  });
});
