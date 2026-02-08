import { render, screen, fireEvent, waitFor } from '../test-utils';
import { createTestProduct, createTestCategory } from '../test-data-factory';

// Mock Supabase
const mockSupabase = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => Promise.resolve({ 
        data: [createTestProduct()], 
        error: null 
      })),
      order: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ 
          data: [createTestProduct()], 
          error: null 
        }))
      }))
    })),
    insert: jest.fn(() => Promise.resolve({ 
      data: createTestProduct(), 
      error: null 
    })),
    update: jest.fn(() => Promise.resolve({ 
      data: createTestProduct({ name: 'Updated Product' }), 
      error: null 
    })),
    delete: jest.fn(() => Promise.resolve({ 
      data: null, 
      error: null 
    }))
  }))
};

jest.mock('@/lib/supabase', () => ({
  supabase: mockSupabase
}));

// Mock Product component
const ProductCard = ({ product, onAddToCart }: any) => {
  const React = require('react');
  return React.createElement('div', { 'data-testid': 'product-card' }, [
    React.createElement('h3', null, product.name),
    React.createElement('p', { 'data-testid': 'product-price' }, product.price.toString()),
    React.createElement('button', { 
      'data-testid': 'add-to-cart',
      onClick: () => onAddToCart(product)
    }, 'Add to Cart')
  ]);
};

describe('Product Components', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render product card correctly', () => {
    const testProduct = createTestProduct();
    const onAddToCart = jest.fn();

    render(
      ProductCard({ 
        product: testProduct, 
        onAddToCart: onAddToCart 
      })
    );

    expect(screen.getByText(testProduct.name)).toBeInTheDocument();
    expect(screen.getByTestId('product-price')).toHaveTextContent(testProduct.price.toString());
    expect(screen.getByTestId('add-to-cart')).toBeInTheDocument();
  });

  test('should call onAddToCart when button clicked', async () => {
    const testProduct = createTestProduct();
    const onAddToCart = jest.fn();

    render(
      ProductCard({ 
        product: testProduct, 
        onAddToCart: onAddToCart 
      })
    );

    const addToCartButton = screen.getByTestId('add-to-cart');
    fireEvent.click(addToCartButton);

    expect(onAddToCart).toHaveBeenCalledWith(testProduct);
  });

  test('should handle product loading state', () => {
    const onAddToCart = jest.fn();

    render(
      ProductCard({ 
        product: null, 
        onAddToCart: onAddToCart 
      })
    );

    expect(screen.getByTestId('product-card')).toBeInTheDocument();
  });
});

describe('Product API Functions', () => {
  test('should fetch products successfully', async () => {
    const testProduct = createTestProduct();
    
    const { getProducts } = require('@/lib/api/products');
    const result = await getProducts();

    expect(mockSupabase.from).toHaveBeenCalledWith('products');
    expect(result).toEqual([testProduct]);
  });

  test('should create product successfully', async () => {
    const newProduct = createTestProduct({ name: 'New Product' });
    
    const { createProduct } = require('@/lib/api/products');
    const result = await createProduct(newProduct);

    expect(mockSupabase.from).toHaveBeenCalledWith('products');
    expect(result).toEqual(newProduct);
  });

  test('should update product successfully', async () => {
    const productId = 'test-product-id';
    const updates = { name: 'Updated Product' };
    
    const { updateProduct } = require('@/lib/api/products');
    const result = await updateProduct(productId, updates);

    expect(mockSupabase.from).toHaveBeenCalledWith('products');
    expect(result.name).toBe('Updated Product');
  });

  test('should delete product successfully', async () => {
    const productId = 'test-product-id';
    
    const { deleteProduct } = require('@/lib/api/products');
    await deleteProduct(productId);

    expect(mockSupabase.from).toHaveBeenCalledWith('products');
  });
});
