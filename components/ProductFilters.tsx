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
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h3 className="font-semibold text-lg mb-4">Categories</h3>
      
      <ul className="space-y-2">
        <li>
          <Link
            href="/products"
            className={`block px-3 py-2 rounded-md transition-colors ${
              !selectedCategory
                ? 'text-gray-700 hover:bg-gray-100'
                : 'bg-orange-100 text-orange-700 font-medium'
            }`}
          >
            All Products
          </Link>
        </li>
        
        {categories.map((category) => (
          <li key={category.id}>
            <Link
              href={`/products?category=${category.slug}`}
              className={`block px-3 py-2 rounded-md transition-colors ${
                selectedCategory === category.slug
                  ? 'bg-orange-100 text-orange-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {category.name}
              <span className="block text-sm text-gray-500 mt-1">
                {category.description}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-8 pt-6 border-t">
        <h3 className="font-semibold text-lg mb-4">Price Range</h3>
        
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="mr-2"
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
            <span className="text-sm">Under ₹100</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              className="mr-2"
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
            <span className="text-sm">₹100 - ₹200</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              className="mr-2"
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
            <span className="text-sm">₹200 - ₹400</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              className="mr-2"
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
            <span className="text-sm">Above ₹400</span>
          </label>
        </div>
      </div>
    </div>
  )
}
