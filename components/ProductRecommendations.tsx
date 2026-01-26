'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Database } from '@/types/database'
import { Heart, Star, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useCartStore } from '@/lib/store/cart'
import toast from 'react-hot-toast'

type Product = Database['public']['Tables']['products']['Row'] & {
  product_variants: Database['public']['Tables']['product_variants']['Row'][]
  categories?: Database['public']['Tables']['categories']['Row']
}

interface ProductRecommendationsProps {
  currentProductId?: string
  category?: string
  limit?: number
  title?: string
  showAddToCart?: boolean
}

export default function ProductRecommendations({ 
  currentProductId, 
  category, 
  limit = 4, 
  title = "You might also like",
  showAddToCart = true 
}: ProductRecommendationsProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { addItem } = useCartStore()

  useEffect(() => {
    fetchRecommendations()
  }, [currentProductId, category])

  const fetchRecommendations = async () => {
    try {
      setLoading(true)

      let query = supabase
        .from('products')
        .select(`
          *,
          product_variants (*),
          categories (*)
        `)
        .eq('is_active', true)

      // Exclude current product
      if (currentProductId) {
        query = query.neq('id', currentProductId)
      }

      // Filter by category if provided
      if (category) {
        query = query.eq('category_id', category)
      }

      // Order by display_order and limit results
      query = query.order('display_order', { ascending: true }).limit(limit)

      const { data, error } = await query

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching recommendations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleQuickAddToCart = (product: Product, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const variant = product.product_variants[0]
    if (!variant) return

    addItem({
      productId: product.id,
      variantId: variant.id,
      productName: product.name,
      weight: variant.weight_grams,
      price: variant.price,
      quantity: 1,
      sku: variant.sku || '',
      productImage: product.image_url
    })

    toast.success(`${product.name} added to cart!`, {
      icon: '🛒'
    })
  }

  const formatWeight = (grams: number) => {
    if (grams >= 1000) {
      return `${grams / 1000}kg`
    }
    return `${grams}g`
  }

  const getCategoryEmoji = (categorySlug: string) => {
    switch (categorySlug) {
      case 'meals': return '🍽️'
      case 'broths': return '🥣'
      case 'cookies': return '🍪'
      case 'cupcakes': return '🧁'
      default: return '📦'
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(limit)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
              <div className="w-full h-32 bg-gray-200 rounded-lg mb-3"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (products.length === 0) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        <Link
          href="/products"
          className="text-orange-600 hover:text-orange-700 font-medium text-sm flex items-center"
        >
          View All
          <ArrowRight className="w-4 h-4 ml-1" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => {
          const variants = product.product_variants
          const minPrice = Math.min(...variants.map(v => v.price))
          const maxPrice = Math.max(...variants.map(v => v.price))
          const hasMultiplePrices = minPrice !== maxPrice

          return (
            <Link
              key={product.id}
              href={`/products/${product.slug || '#'}`}
              className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 overflow-hidden"
            >
              <div className="aspect-square bg-gradient-to-br from-orange-50 to-pink-50 relative overflow-hidden">
                {product.image_url ? (
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-6xl">
                      {product.categories?.slug ? getCategoryEmoji(product.categories.slug) : '📦'}
                    </span>
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                  <span className="mr-1">🐾</span>
                  {product.categories?.slug ? getCategoryEmoji(product.categories.slug) : '📦'}
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors text-sm">
                  {product.name}
                </h3>

                <p className="text-gray-600 mb-3 line-clamp-2 text-xs">
                  {product.short_description || product.description}
                </p>

                <div className="flex items-center justify-between mb-3">
                  <div>
                    {hasMultiplePrices ? (
                      <span className="text-lg font-bold text-orange-600">
                        ₹{minPrice} - ₹{maxPrice}
                      </span>
                    ) : (
                      <span className="text-lg font-bold text-orange-600">
                        ₹{minPrice}
                      </span>
                    )}
                    <div className="text-xs text-gray-500">
                      {variants.length} size{variants.length > 1 ? 's' : ''}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                    <span className="text-xs text-gray-600">4.8</span>
                  </div>

                  {showAddToCart && variants.length === 1 && (
                    <button
                      onClick={(e) => handleQuickAddToCart(product, e)}
                      className="p-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                    >
                      <span className="text-xs">🛒</span>
                    </button>
                  )}

                  {showAddToCart && variants.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        toast.success('Multiple sizes available. Click to view details.', {
                          icon: 'ℹ️'
                        })
                      }}
                      className="p-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                    >
                      <span className="text-xs">📋</span>
                    </button>
                  )}
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
