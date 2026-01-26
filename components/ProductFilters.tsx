'use client'

import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { Database } from '@/types/database'
import { Filter, X } from 'lucide-react'
import { useState } from 'react'

type Category = Database['public']['Tables']['categories']['Row']

interface ProductFiltersProps {
  categories: Category[]
  selectedCategory?: string
}

export default function ProductFilters({ categories, selectedCategory }: ProductFiltersProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [priceRange, setPriceRange] = useState(searchParams.get('price') || '')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const handlePriceChange = (range: string) => {
    setIsUpdating(true)
    const params = new URLSearchParams(searchParams)
    if (range === '') {
      params.delete('price')
    } else {
      params.set('price', range)
    }
    const queryString = params.toString()
    
    // Use replace instead of push to avoid full page reload
    router.replace(`/products${queryString ? `?${queryString}` : ''}`)
    
    // Update local state immediately for better UX
    setPriceRange(range)
    
    // Reset updating state after a short delay
    setTimeout(() => setIsUpdating(false), 100)
  }

  const clearAllFilters = () => {
    setIsUpdating(true)
    const params = new URLSearchParams(searchParams)
    params.delete('category')
    params.delete('price')
    const queryString = params.toString()
    router.replace(`/products${queryString ? `?${queryString}` : ''}`)
    setPriceRange('')
    setTimeout(() => setIsUpdating(false), 100)
  }

  const hasActiveFilters = selectedCategory || priceRange

  return (
    <>
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden mb-6">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="w-full bg-white rounded-2xl shadow-lg p-4 flex items-center justify-between"
        >
          <div className="flex items-center">
            <Filter className="w-5 h-5 mr-2 text-orange-500" />
            <span className="font-medium text-gray-900">
              {hasActiveFilters ? 'Filters Applied' : 'Filter Products'}
            </span>
          </div>
          <span className="text-gray-500">
            {hasActiveFilters ? '✓' : '▼'}
          </span>
        </button>
      </div>

      {/* Desktop Sidebar */}
      <div className={`${mobileMenuOpen ? 'block' : 'hidden'} lg:block bg-white rounded-2xl shadow-lg p-6 sticky top-4`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-orange-800 flex items-center">
            <span className="mr-3">🐾</span>
            Filters
          </h3>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center"
            >
              <X className="w-4 h-4 mr-1" />
              Clear All
            </button>
          )}
        </div>
      
        {/* Categories */}
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">📂</span>
            Categories
          </h4>
          <ul className="space-y-2">
            <li>
              <Link
                href="/products"
                className={`block px-4 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                  !selectedCategory
                    ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold shadow-lg'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="mr-2">🍽️</span>
                All Products
              </Link>
            </li>
            
            {categories.map((category) => (
              <li key={category.id}>
                <Link
                  href={`/products?category=${category.slug}`}
                  className={`block px-4 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                    selectedCategory === category.slug
                      ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold shadow-lg'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-2">
                    {category.slug === 'meals' ? '🍽️' : category.slug === 'broths' ? '🥣' : category.slug === 'cookies' ? '🍪' : category.slug === 'cupcakes' ? '🧁' : '📦'}
                  </span>
                  <div>
                    <div className="font-bold">{category.name}</div>
                    <div className="text-sm text-gray-500 mt-1">
                      {category.description}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Price Range */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">💰</span>
            Price Range
          </h4>
          <div className="space-y-2">
            <label className={`flex items-center p-3 rounded-lg border-2 transition-all cursor-pointer ${
              !priceRange && !isUpdating
                ? 'border-orange-500 bg-orange-50 text-orange-700'
                : 'border-gray-200 hover:border-orange-300 bg-white text-gray-700'
            } ${isUpdating ? 'opacity-50 cursor-waiting' : ''}`}>
              <input
                type="radio"
                name="price"
                className="mr-3 w-5 h-5 text-orange-600"
                checked={!priceRange}
                onChange={() => handlePriceChange('')}
                disabled={isUpdating}
              />
              <div className="flex items-center">
                <span className="font-medium">All Prices</span>
                {isUpdating && !priceRange && (
                  <div className="ml-2 w-4 h-4 border-2 border-orange-300 border-t-transparent animate-spin rounded-full"></div>
                )}
              </div>
            </label>
            
            <label className={`flex items-center p-3 rounded-lg border-2 transition-all cursor-pointer ${
              priceRange === 'under-100' && !isUpdating
                ? 'border-orange-500 bg-orange-50 text-orange-700'
                : 'border-gray-200 hover:border-orange-300 bg-white text-gray-700'
            } ${isUpdating ? 'opacity-50 cursor-waiting' : ''}`}>
              <input
                type="radio"
                name="price"
                className="mr-3 w-5 h-5 text-orange-600"
                checked={priceRange === 'under-100'}
                onChange={() => handlePriceChange('under-100')}
                disabled={isUpdating}
              />
              <div className="flex items-center">
                <div>
                  <div className="text-gray-700 font-medium">Under ₹100</div>
                  <div className="text-xs text-gray-500">Budget-friendly options</div>
                </div>
                {isUpdating && priceRange === 'under-100' && (
                  <div className="ml-2 w-4 h-4 border-2 border-orange-300 border-t-transparent animate-spin rounded-full"></div>
                )}
              </div>
            </label>
            
            <label className={`flex items-center p-3 rounded-lg border-2 transition-all cursor-pointer ${
              priceRange === '100-200' && !isUpdating
                ? 'border-orange-500 bg-orange-50 text-orange-700'
                : 'border-gray-200 hover:border-orange-300 bg-white text-gray-700'
            } ${isUpdating ? 'opacity-50 cursor-waiting' : ''}`}>
              <input
                type="radio"
                name="price"
                className="mr-3 w-5 h-5 text-orange-600"
                checked={priceRange === '100-200'}
                onChange={() => handlePriceChange('100-200')}
                disabled={isUpdating}
              />
              <div className="flex items-center">
                <div>
                  <div className="text-gray-700 font-medium">₹100 - ₹200</div>
                  <div className="text-xs text-gray-500">Mid-range selections</div>
                </div>
                {isUpdating && priceRange === '100-200' && (
                  <div className="ml-2 w-4 h-4 border-2 border-orange-300 border-t-transparent animate-spin rounded-full"></div>
                )}
              </div>
            </label>
            
            <label className={`flex items-center p-3 rounded-lg border-2 transition-all cursor-pointer ${
              priceRange === '200-400' && !isUpdating
                ? 'border-orange-500 bg-orange-50 text-orange-700'
                : 'border-gray-200 hover:border-orange-300 bg-white text-gray-700'
            } ${isUpdating ? 'opacity-50 cursor-waiting' : ''}`}>
              <input
                type="radio"
                name="price"
                className="mr-3 w-5 h-5 text-orange-600"
                checked={priceRange === '200-400'}
                onChange={() => handlePriceChange('200-400')}
                disabled={isUpdating}
              />
              <div className="flex items-center">
                <div>
                  <div className="text-gray-700 font-medium">₹200 - ₹400</div>
                  <div className="text-xs text-gray-500">Premium choices</div>
                </div>
                {isUpdating && priceRange === '200-400' && (
                  <div className="ml-2 w-4 h-4 border-2 border-orange-300 border-t-transparent animate-spin rounded-full"></div>
                )}
              </div>
            </label>
            
            <label className={`flex items-center p-3 rounded-lg border-2 transition-all cursor-pointer ${
              priceRange === 'above-400' && !isUpdating
                ? 'border-orange-500 bg-orange-50 text-orange-700'
                : 'border-gray-200 hover:border-orange-300 bg-white text-gray-700'
            } ${isUpdating ? 'opacity-50 cursor-waiting' : ''}`}>
              <input
                type="radio"
                name="price"
                className="mr-3 w-5 h-5 text-orange-600"
                checked={priceRange === 'above-400'}
                onChange={() => handlePriceChange('above-400')}
                disabled={isUpdating}
              />
              <div className="flex items-center">
                <div>
                  <div className="text-gray-700 font-medium">Above ₹400</div>
                  <div className="text-xs text-gray-500">Luxury items</div>
                </div>
                {isUpdating && priceRange === 'above-400' && (
                  <div className="ml-2 w-4 h-4 border-2 border-orange-300 border-t-transparent animate-spin rounded-full"></div>
                )}
              </div>
            </label>
          </div>
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div className="text-sm text-orange-700 font-medium mb-2">
              <Filter className="w-4 h-4 mr-2 inline" />
              Active Filters:
            </div>
            <div className="space-y-1">
              {selectedCategory && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">
                    Category: {categories.find(c => c.slug === selectedCategory)?.name}
                  </span>
                  <button
                    onClick={() => {
                      const params = new URLSearchParams(searchParams)
                      params.delete('category')
                      const queryString = params.toString()
                      router.push(`/products${queryString ? `?${queryString}` : ''}`)
                    }}
                    className="text-xs text-orange-600 hover:text-orange-700"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              {priceRange && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">
                    Price: {priceRange === 'under-100' ? 'Under ₹100' :
                           priceRange === '100-200' ? '₹100 - ₹200' :
                           priceRange === '200-400' ? '₹200 - ₹400' : 'Above ₹400'}
                  </span>
                  <button
                    onClick={() => {
                      const params = new URLSearchParams(searchParams)
                      params.delete('price')
                      const queryString = params.toString()
                      router.push(`/products${queryString ? `?${queryString}` : ''}`)
                    }}
                    className="text-xs text-orange-600 hover:text-orange-700"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  )
}
