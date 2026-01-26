'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

export default function SearchInput() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const searchTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    setSearchTerm(searchParams.get('search') || '')
  }, [searchParams])

  // Fetch search suggestions
  const fetchSuggestions = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    try {
      const { data } = await supabase
        .from('products')
        .select('name, slug, image_url, short_description')
        .ilike('name', `%${query}%`)
        .eq('is_active', true)
        .limit(5)
      
      setSuggestions(data || [])
      setShowSuggestions(true)
    } catch (error) {
      console.error('Error fetching suggestions:', error)
      setSuggestions([])
    }
  }

  // Debounced search suggestions
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (searchTerm) {
      searchTimeoutRef.current = setTimeout(() => {
        fetchSuggestions(searchTerm)
      }, 300)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }, [searchTerm])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    
    const params = new URLSearchParams(searchParams)
    
    if (searchTerm.trim()) {
      params.set('search', searchTerm.trim())
    } else {
      params.delete('search')
    }
    
    const queryString = params.toString()
    router.push(`/products${queryString ? `?${queryString}` : ''}`)
    setShowSuggestions(false)
    setIsSearching(false)
  }

  const handleClear = () => {
    setSearchTerm('')
    setSuggestions([])
    setShowSuggestions(false)
    const params = new URLSearchParams(searchParams)
    params.delete('search')
    const queryString = params.toString()
    router.push(`/products${queryString ? `?${queryString}` : ''}`)
  }

  const handleSuggestionClick = (suggestion: any) => {
    setSearchTerm(suggestion.name)
    setShowSuggestions(false)
    const params = new URLSearchParams(searchParams)
    params.set('search', suggestion.name)
    const queryString = params.toString()
    router.push(`/products${queryString ? `?${queryString}` : ''}`)
  }

  return (
    <div className="mb-6 relative">
      <form onSubmit={handleSearch}>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setIsSearching(true)
            }}
            onFocus={() => searchTerm.length >= 2 && setShowSuggestions(true)}
            placeholder="Search for delicious cat meals..."
            className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500 shadow-sm"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <span className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</span>
            </button>
          )}
          {isSearching && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-transparent"></div>
            </div>
          )}
        </div>
      </form>

      {/* Search Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50">
          <div className="max-h-64 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <button
                key={suggestion.id}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center space-x-3 border-b border-gray-100 last:border-b-0"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-pink-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {suggestion.image_url ? (
                    <img
                      src={suggestion.image_url}
                      alt={suggestion.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-lg">🐾</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 text-left">{suggestion.name}</div>
                  <div className="text-sm text-gray-500 text-left truncate">{suggestion.short_description}</div>
                </div>
              </button>
            ))}
          </div>
          <div className="px-4 py-2 bg-gray-50 text-center text-sm text-gray-600">
            Press Enter to search or click a suggestion
          </div>
        </div>
      )}
    </div>
  )
}
