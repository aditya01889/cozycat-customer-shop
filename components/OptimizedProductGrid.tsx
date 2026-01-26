'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

interface Product {
  id: string
  name: string
  slug: string
  short_description: string
  image_url: string
  category_name: string
  category_slug: string
  min_price: number
  max_price: number
  variant_count: number
}

interface OptimizedProductGridProps {
  searchParams: {
    category?: string
    price?: string
    search?: string
    page?: string
  }
  categories: any[]
}

export default function OptimizedProductGrid({ searchParams, categories }: OptimizedProductGridProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    totalCount: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  })

  const searchParamsClient = useSearchParams()

  useEffect(() => {
    fetchProducts()
  }, [searchParamsClient])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      
      // Add all search parameters
      if (searchParams.category) params.set('category', searchParams.category)
      if (searchParams.price) params.set('price_range', searchParams.price)
      if (searchParams.search) params.set('search', searchParams.search)
      if (searchParams.page) params.set('page', searchParams.page)
      
      params.set('limit', '20')
      params.set('use_cache', 'true')

      const response = await fetch(`/api/products/optimized?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch products')
      }

      const data = await response.json()
      setProducts(data.products || [])
      setPagination(data.pagination || {})
      
      console.log('📊 Products loaded:', {
        count: data.products?.length || 0,
        pagination: data.pagination,
        performance: data.performance
      })

    } catch (err) {
      console.error('Error fetching products:', err)
      setError(err instanceof Error ? err.message : 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (newPage: number) => {
    const newParams = new URLSearchParams(searchParamsClient.toString())
    newParams.set('page', newPage.toString())
    window.location.href = `/products/optimized?${newParams.toString()}`
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="bg-white rounded-lg shadow-lg overflow-hidden animate-pulse">
            <div className="h-48 bg-gray-200"></div>
            <div className="p-4">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-red-800 font-medium mb-2">Error loading products</h3>
        <p className="text-red-600">{error}</p>
        <button
          onClick={fetchProducts}
          className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <div className="text-gray-400 text-6xl mb-4">🐾</div>
        <h3 className="text-gray-800 font-medium mb-2">No products found</h3>
        <p className="text-gray-600">Try adjusting your filters or search terms</p>
      </div>
    )
  }

  return (
    <div>
      {/* Results Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Products ({pagination.totalCount})
          </h2>
          <p className="text-sm text-gray-600">
            Page {pagination.page} of {pagination.totalPages}
          </p>
        </div>
        
        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={!pagination.hasPrev}
              className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-3 py-1">
              {pagination.page} / {pagination.totalPages}
            </span>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={!pagination.hasNext}
              className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-200"
          >
            <div className="relative">
              <img
                src={product.image_url || '/placeholder-cat-food.jpg'}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
              {product.variant_count > 1 && (
                <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                  {product.variant_count} options
                </div>
              )}
            </div>
            
            <div className="p-4">
              <div className="mb-2">
                <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  {product.category_name}
                </span>
              </div>
              
              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                {product.name}
              </h3>
              
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {product.short_description}
              </p>
              
              <div className="flex items-center justify-between">
                <div>
                  {product.min_price === product.max_price ? (
                    <span className="text-xl font-bold text-orange-600">
                      ₹{product.min_price}
                    </span>
                  ) : (
                    <div>
                      <span className="text-xl font-bold text-orange-600">
                        ₹{product.min_price}
                      </span>
                      <span className="text-sm text-gray-500 ml-1">
                        - ₹{product.max_price}
                      </span>
                    </div>
                  )}
                </div>
                
                <a
                  href={`/products/${product.slug}`}
                  className="bg-orange-500 text-white px-3 py-2 rounded hover:bg-orange-600 text-sm font-medium"
                >
                  View
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-8">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={!pagination.hasPrev}
            className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>
          
          {/* Page numbers */}
          <div className="flex items-center space-x-1">
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              const pageNum = i + 1
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-3 py-1 rounded ${
                    pageNum === pagination.page
                      ? 'bg-orange-500 text-white'
                      : 'border hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              )
            })}
          </div>
          
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={!pagination.hasNext}
            className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  )
}
