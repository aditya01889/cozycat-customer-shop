'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

interface Category {
  id: string
  name: string
  slug: string
  product_count: number
}

interface OptimizedProductFiltersProps {
  categories: Category[]
}

const priceRanges = [
  { value: 'under-100', label: 'Under ₹100' },
  { value: '100-200', label: '₹100 - ₹200' },
  { value: '200-400', label: '₹200 - ₹400' },
  { value: 'above-400', label: 'Above ₹400' }
]

export default function OptimizedProductFilters({ categories }: OptimizedProductFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '')
  const [selectedPrice, setSelectedPrice] = useState(searchParams.get('price') || '')
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')

  const handleFilterChange = (type: 'category' | 'price' | 'search', value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    
    switch (type) {
      case 'category':
        if (value) {
          params.set('category', value)
        } else {
          params.delete('category')
        }
        setSelectedCategory(value)
        break
      case 'price':
        if (value) {
          params.set('price', value)
        } else {
          params.delete('price')
        }
        setSelectedPrice(value)
        break
      case 'search':
        if (value) {
          params.set('search', value)
        } else {
          params.delete('search')
        }
        setSearchTerm(value)
        break
    }

    // Reset to page 1 when filters change
    params.delete('page')
    
    router.push(`/products/optimized?${params.toString()}`)
  }

  const clearFilters = () => {
    router.push('/products/optimized')
    setSelectedCategory('')
    setSelectedPrice('')
    setSearchTerm('')
  }

  const activeFiltersCount = [
    selectedCategory,
    selectedPrice,
    searchTerm
  ].filter(Boolean).length

  return (
    <div className="bg-white rounded-lg shadow p-6 sticky top-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        {activeFiltersCount > 0 && (
          <button
            onClick={clearFilters}
            className="text-sm text-orange-600 hover:text-orange-700 font-medium"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Search */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Search
        </label>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          placeholder="Search products..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        />
      </div>

      {/* Categories */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Categories
        </label>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          <button
            onClick={() => handleFilterChange('category', '')}
            className={`w-full text-left px-3 py-2 rounded-lg border transition-colors ${
              !selectedCategory
                ? 'border-orange-500 bg-orange-50 text-orange-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            All Categories
            <span className="block text-xs text-gray-500">
              {categories.reduce((sum, cat) => sum + (cat.product_count || 0), 0)} products
            </span>
          </button>
          
          {categories
            .filter(cat => cat.product_count > 0)
            .map((category) => (
              <button
                key={category.id}
                onClick={() => handleFilterChange('category', category.slug)}
                className={`w-full text-left px-3 py-2 rounded-lg border transition-colors ${
                  selectedCategory === category.slug
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {category.name}
                <span className="block text-xs text-gray-500">
                  {category.product_count} products
                </span>
              </button>
            ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Price Range
        </label>
        <div className="space-y-2">
          <button
            onClick={() => handleFilterChange('price', '')}
            className={`w-full text-left px-3 py-2 rounded-lg border transition-colors ${
              !selectedPrice
                ? 'border-orange-500 bg-orange-50 text-orange-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            All Prices
          </button>
          
          {priceRanges.map((range) => (
            <button
              key={range.value}
              onClick={() => handleFilterChange('price', range.value)}
              className={`w-full text-left px-3 py-2 rounded-lg border transition-colors ${
                selectedPrice === range.value
                  ? 'border-orange-500 bg-orange-50 text-orange-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Active Filters Summary */}
      {activeFiltersCount > 0 && (
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Active Filters ({activeFiltersCount})
          </h4>
          <div className="space-y-1">
            {selectedCategory && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  Category: {categories.find(c => c.slug === selectedCategory)?.name}
                </span>
                <button
                  onClick={() => handleFilterChange('category', '')}
                  className="text-orange-600 hover:text-orange-700"
                >
                  ×
                </button>
              </div>
            )}
            {selectedPrice && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  Price: {priceRanges.find(r => r.value === selectedPrice)?.label}
                </span>
                <button
                  onClick={() => handleFilterChange('price', '')}
                  className="text-orange-600 hover:text-orange-700"
                >
                  ×
                </button>
              </div>
            )}
            {searchTerm && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Search: {searchTerm}</span>
                <button
                  onClick={() => handleFilterChange('search', '')}
                  className="text-orange-600 hover:text-orange-700"
                >
                  ×
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
