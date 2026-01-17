import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  productId: string
  variantId: string
  productName: string
  weight: number
  price: number
  quantity: number
  sku: string
  productImage?: string
}

interface CartStore {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (variantId: string) => void
  updateQuantity: (variantId: string, quantity: number) => void
  clearCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
  updateCartItemsWithImages: () => Promise<void>
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (item) => {
        const { items } = get()
        const existingItem = items.find(i => i.variantId === item.variantId)
        
        if (existingItem) {
          set({
            items: items.map(i =>
              i.variantId === item.variantId
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            )
          })
        } else {
          set({ items: [...items, item] })
        }
      },
      
      removeItem: (variantId) => {
        set({ items: get().items.filter(i => i.variantId !== variantId) })
      },
      
      updateQuantity: (variantId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(variantId)
          return
        }
        
        set({
          items: get().items.map(i =>
            i.variantId === variantId ? { ...i, quantity } : i
          )
        })
      },
      
      clearCart: () => {
        set({ items: [] })
      },
      
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },
      
      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + (item.price * item.quantity), 0)
      },
      
      updateCartItemsWithImages: async () => {
        const { items } = get()
        const itemsWithoutImages = items.filter(item => !item.productImage)
        
        if (itemsWithoutImages.length === 0) return
        
        try {
          // Fetch product data for items without images
          const productIds = [...new Set(itemsWithoutImages.map(item => item.productId))]
          
          for (const productId of productIds) {
            const response = await fetch(`/api/products?id=${productId}`)
            if (response.ok) {
              const data = await response.json()
              const product = data.product
              
              if (product?.image_url) {
                // Update all cart items for this product with the image
                set({
                  items: items.map(item =>
                    item.productId === productId && !item.productImage
                      ? { ...item, productImage: product.image_url }
                      : item
                  )
                })
              }
            }
          }
        } catch (error) {
          console.error('Failed to update cart items with images:', error)
        }
      }
    }),
    {
      name: 'cozycat-cart'
    }
  )
)
