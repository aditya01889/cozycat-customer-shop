'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Database } from '@/types/database'

type Category = Database['public']['Tables']['categories']['Row']

interface ProductFiltersProps {
  categories: Category[]
  selectedCategory?: string
}

export default function ProductFilters({ categories, selectedCategory }: ProductFiltersProps) {
  const searchParams = useSearchParams()
  const priceRange = searchParams.get('price')

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-4">
      <h3 className="text-xl font-bold text-orange-800 mb-6 flex items-center">
        <span className="mr-3">🐾</span>
        Categories
      </h3>
      
      <ul className="space-y-3">
        <li>
          <Link
            href="/products"
            className={`block px-4 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 ${
              !selectedCategory
                ? 'text-gray-700 hover:bg-gray-100'
                : 'bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold shadow-lg'
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

      <div className="mt-8 pt-6 border-t border-orange-200">
        <h3 className="text-xl font-bold text-orange-800 mb-6 flex items-center">
          <span className="mr-3">💰</span>
          Price Range
        </h3>
        
        <div className="space-y-3">
          <label className="flex items-center p-3 bg-white rounded-lg border-2 border-orange-200 hover:bg-orange-50 transition-colors cursor-pointer">
            <input
              type="checkbox"
              className="mr-3 w-5 h-5 text-orange-600"
              checked={priceRange === 'under-100'}
              onChange={(e) => {
                const params = new URLSearchParams(searchParams)
                if (e.target.checked) {
                  params.set('price', 'under-100')
                } else {
                  params.delete('price')
                }
                const queryString = params.toString()
                window.location.href = `/products${queryString ? `?${queryString}` : ''}`
              }}
            />
            <span className="text-gray-700">Under ₹100</span>
          </label>
          
          <label className="flex items-center p-3 bg-white rounded-lg border-2 border-orange-200 hover:bg-orange-50 transition-colors cursor-pointer">
            <input
              type="checkbox"
              className="mr-3 w-5 h-5 text-orange-600"
              checked={priceRange === '100-200'}
              onChange={(e) => {
                const params = new URLSearchParams(searchParams)
                if (e.target.checked) {
                  params.set('price', '100-200')
                } else {
                  params.delete('price')
                }
                const queryString = params.toString()
                window.location.href = `/products${queryString ? `?${queryString}` : ''}`
              }}
            />
            <span className="text-gray-700">₹100 - ₹200</span>
          </label>
          
          <label className="flex items-center p-3 bg-white rounded-lg border-2 border-orange-200 hover:bg-orange-50 transition-colors cursor-pointer">
            <input
              type="checkbox"
              className="mr-3 w-5 h-5 text-orange-600"
              checked={priceRange === '200-400'}
              onChange={(e) => {
                const params = new URLSearchParams(searchParams)
                if (e.target.checked) {
                  params.set('price', '200-400')
                } else {
                  params.delete('price')
                }
                const queryString = params.toString()
                window.location.href = `/products${queryString ? `?${queryString}` : ''}`
              }}
            />
            <span className="text-gray-700">₹200 - ₹400</span>
          </label>
          
          <label className="flex items-center p-3 bg-white rounded-lg border-2 border-orange-200 hover:bg-orange-50 transition-colors cursor-pointer">
            <input
              type="checkbox"
              className="mr-3 w-5 h-5 text-orange-600"
              checked={priceRange === 'above-400'}
              onChange={(e) => {
                const params = new URLSearchParams(searchParams)
                if (e.target.checked) {
                  params.set('price', 'above-400')
                } else {
                  params.delete('price')
                }
                const queryString = params.toString()
                window.location.href = `/products${queryString ? `?${queryString}` : ''}`
              }}
            />
            <span className="text-gray-700">Above ₹400</span>
          </label>
        </div>
      </div>
    </div>
  )
}
