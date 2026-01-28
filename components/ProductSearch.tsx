'use client'

import { useState, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import Link from 'next/link'

interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  image_url?: string
  categories?: {
    name: string
    slug: string
  }
}

export default function ProductSearch() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(!isOpen)
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isMounted])

  useEffect(() => {
    if (!isMounted || query.length < 2) {
      if (isMounted) setResults([])
      return
    }

    const searchProducts = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/products/search?q=${encodeURIComponent(query)}`)
        if (response.ok) {
          const data = await response.json()
          setResults(data)
        }
      } catch (error) {
        console.error('Search error:', error)
      } finally {
        setLoading(false)
      }
    }

    const debounceTimer = setTimeout(searchProducts, 300)
    return () => clearTimeout(debounceTimer)
  }, [query, isMounted])

  // Return placeholder during SSR to prevent hydration mismatch
  if (!isMounted) {
    return (
      <button
        className="flex items-center gap-2 px-4 py-2 text-gray-600"
        disabled
      >
        <Search className="w-5 h-5" />
        <span className="hidden md:inline">Search</span>
        <kbd className="hidden md:inline-flex items-center px-2 py-1 text-xs text-gray-500 bg-gray-100 rounded">
          ⌘K
        </kbd>
      </button>
    )
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-orange-500 transition-colors"
      >
        <Search className="w-5 h-5" />
        <span className="hidden md:inline">Search</span>
        <kbd className="hidden md:inline-flex items-center px-2 py-1 text-xs text-gray-500 bg-gray-100 rounded">
          ⌘K
        </kbd>
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl mx-4">
        <div className="flex items-center gap-3 p-4 border-b">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products..."
            className="flex-1 outline-none text-lg"
            autoFocus
          />
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {loading && (
            <div className="p-8 text-center text-gray-500">
              Searching...
            </div>
          )}

          {!loading && query.length < 2 && (
            <div className="p-8 text-center text-gray-500">
              Type at least 2 characters to search
            </div>
          )}

          {!loading && query.length >= 2 && results.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No products found for "{query}"
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="p-2">
              {results.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  {product.image_url && (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{product.name}</h3>
                    <p className="text-sm text-gray-500">{product.categories?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-orange-500">₹{product.price}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
