import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { calculateDeliveryFee } from '@/lib/shipping/config'

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
  getSubtotal: () => number
  getDeliveryFee: (pincode?: string) => number
  getTotal: (pincode?: string) => number
  getMinimumOrderAmount: (pincode?: string) => number
  meetsMinimumOrder: (pincode?: string) => boolean
  getMinimumOrderMessage: (pincode?: string) => string
  getFreeDeliveryThreshold: (pincode?: string) => number
  getAmountForFreeDelivery: (pincode?: string) => number
  isFreeDelivery: (pincode?: string) => boolean
  getItemsCount: () => number
  hasItems: () => boolean
  getCartItemQuantity: (productId: string, variantId: string) => number
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
        // Skip API calls during CI build
        if (process.env.CI_DUMMY_ENV === '1' || process.env.CI_DUMMY_ENV === 'true') {
          return
        }
        
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
      },

      getSubtotal: () => {
        return get().items.reduce((total, item) => total + (item.price * item.quantity), 0)
      },

      getDeliveryFee: (pincode = '110001') => {
        const subtotal = get().getSubtotal()
        const shippingCalculation = calculateDeliveryFee(pincode, subtotal)
        return shippingCalculation.isServiceable ? shippingCalculation.deliveryFee : 0
      },

      getTotal: (pincode = '110001') => {
        const subtotal = get().getSubtotal()
        const deliveryFee = get().getDeliveryFee(pincode)
        return subtotal + deliveryFee
      },

      getMinimumOrderAmount: (pincode = '110001') => {
        const shippingCalculation = calculateDeliveryFee(pincode, 0)
        return shippingCalculation.isServiceable ? shippingCalculation.minOrderAmount : 0
      },

      meetsMinimumOrder: (pincode = '110001') => {
        const subtotal = get().getSubtotal()
        const minimumOrder = get().getMinimumOrderAmount(pincode)
        return subtotal >= minimumOrder
      },

      getMinimumOrderMessage: (pincode = '110001') => {
        const shippingCalculation = calculateDeliveryFee(pincode, get().getSubtotal())
        return shippingCalculation.isServiceable ? shippingCalculation.message : 'Delivery not available in your area'
      },

      getFreeDeliveryThreshold: (pincode = '110001') => {
        const shippingCalculation = calculateDeliveryFee(pincode, 0)
        return shippingCalculation.isServiceable ? shippingCalculation.zone?.deliveryFees?.freeAbove || 0 : 0
      },

      getAmountForFreeDelivery: (pincode = '110001') => {
        const subtotal = get().getSubtotal()
        const threshold = get().getFreeDeliveryThreshold(pincode)
        return Math.max(0, threshold - subtotal)
      },

      isFreeDelivery: (pincode = '110001') => {
        const subtotal = get().getSubtotal()
        return subtotal >= get().getFreeDeliveryThreshold(pincode)
      },

      getItemsCount: () => {
        return get().items.length
      },

      hasItems: () => {
        return get().items.length > 0
      },

      getCartItemQuantity: (productId: string, variantId: string) => {
        const { items } = get()
        const item = items.find(i => i.productId === productId && i.variantId === variantId)
        return item ? item.quantity : 0
      }
    }),
    {
      name: 'cozycat-cart'
    }
  )
)
