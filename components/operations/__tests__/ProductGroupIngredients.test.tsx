import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import ProductGroupIngredients from '../ProductGroupIngredients'

// Mock fetch
const mockFetch = global.fetch as jest.MockedFunction<typeof global.fetch>

// Mock types
interface MockOrder {
  id: string
  order_number: string
  total_weight: number
  ingredient_count: number
  insufficient_count: number
  order_items: Array<{
    product_variants: {
      products: {
        id: string
      }
    }
  }>
}

const mockOrders = [
  {
    id: '1',
    order_number: 'ORD-001',
    total_weight: 500,
    ingredient_count: 5,
    insufficient_count: 1,
    order_items: [
      {
        product_variants: {
          products: {
            id: 'product-123'
          }
        }
      }
    ]
  },
  {
    id: '2',
    order_number: 'ORD-002', 
    total_weight: 300,
    ingredient_count: 3,
    insufficient_count: 0,
    order_items: [
      {
        product_variants: {
          products: {
            id: 'product-123'
          }
        }
      }
    ]
  }
]

const mockIngredientRequirements = [
  {
    ingredient_id: 'ing-1',
    ingredient_name: 'Chicken',
    required_quantity: 400,
    waste_quantity: 30,
    total_quantity: 430,
    current_stock: 500,
    stock_status: 'sufficient',
    supplier_name: 'Meat Supplier',
    supplier_phone: '123-456-7890',
    supplier_email: 'meat@supplier.com'
  },
  {
    ingredient_id: 'ing-2',
    ingredient_name: 'Rice',
    required_quantity: 200,
    waste_quantity: 15,
    total_quantity: 215,
    current_stock: 100,
    stock_status: 'insufficient',
    supplier_name: 'Grain Supplier',
    supplier_phone: '098-765-4321',
    supplier_email: 'grain@supplier.com'
  }
]

describe('ProductGroupIngredients', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders component header correctly', () => {
    render(
      <ProductGroupIngredients
        productName="Test Product"
        productId="product-123"
        orders={mockOrders}
      />
    )

    expect(screen.getByText('Ingredient Requirements')).toBeInTheDocument()
    expect(screen.getByText('Total batch: 800g • 2 orders')).toBeInTheDocument()
  })

  test('shows unavailable state when no product ID', () => {
    render(
      <ProductGroupIngredients
        productName="Test Product"
        productId={undefined}
        orders={mockOrders}
      />
    )

    expect(screen.getByText('Product ID not available')).toBeInTheDocument()
    expect(screen.getByText('Unavailable')).toBeInTheDocument()
  })

  test('expands and shows ingredient requirements on click', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ingredient_requirements: mockIngredientRequirements
      })
    })

    render(
      <ProductGroupIngredients
        productName="Test Product"
        productId="product-123"
        orders={mockOrders}
      />
    )

    const header = screen.getByText('Ingredient Requirements').closest('div')
    fireEvent.click(header!)

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        '/api/admin/get-product-group-ingredients',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ product_id: 'product-123' })
        })
      )
    })

    await waitFor(() => {
      expect(screen.getByText('Chicken')).toBeInTheDocument()
      expect(screen.getByText('Rice')).toBeInTheDocument()
      expect(screen.getByText('Meat Supplier')).toBeInTheDocument()
      expect(screen.getByText('Grain Supplier')).toBeInTheDocument()
    })
  })

  test('shows insufficient count badge', () => {
    render(
      <ProductGroupIngredients
        productName="Test Product"
        productId="product-123"
        orders={mockOrders}
      />
    )

    // Initially shows insufficient count from orders
    expect(screen.getByText('1 insufficient')).toBeInTheDocument()
  })
})
