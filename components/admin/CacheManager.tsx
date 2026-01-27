'use client'

import { useState } from 'react'
import { RefreshCw, Trash2, Database, Zap, Clock } from 'lucide-react'

interface CacheStats {
  totalKeys: number
  memoryUsage: string
  hitRate: number
  lastCleared: string
}

export default function CacheManager() {
  const [stats, setStats] = useState<CacheStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const fetchStats = async () => {
    try {
      setLoading(true)
      // This would be an API endpoint to get Redis stats
      // For now, we'll simulate it
      setStats({
        totalKeys: 45,
        memoryUsage: '12.5 MB',
        hitRate: 87.3,
        lastCleared: new Date().toISOString()
      })
    } catch (error) {
      setMessage('Failed to fetch cache stats')
    } finally {
      setLoading(false)
    }
  }

  const clearCache = async (pattern?: string) => {
    try {
      setLoading(true)
      const endpoint = pattern 
        ? `/api/admin/cache/clear?pattern=${pattern}`
        : '/api/admin/cache/clear'
      
      const response = await fetch(endpoint, { method: 'DELETE' })
      const result = await response.json()
      
      if (result.success) {
        setMessage(result.message)
        await fetchStats() // Refresh stats
      } else {
        setMessage('Failed to clear cache')
      }
    } catch (error) {
      setMessage('Error clearing cache')
    } finally {
      setLoading(false)
    }
  }

  const clearProductsCache = () => clearCache('products:*')
  const clearAnalyticsCache = () => clearCache('analytics:*')
  const clearAllCache = () => clearCache()

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Database className="h-5 w-5 mr-2 text-blue-600" />
          Redis Cache Manager
        </h3>
        <button
          onClick={fetchStats}
          disabled={loading}
          className="flex items-center px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Cache Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-center text-blue-600 mb-1">
              <Database className="h-4 w-4 mr-1" />
              <span className="text-xs font-medium">Total Keys</span>
            </div>
            <p className="text-xl font-bold text-blue-900">{stats.totalKeys}</p>
          </div>
          
          <div className="bg-green-50 rounded-lg p-3">
            <div className="flex items-center text-green-600 mb-1">
              <Zap className="h-4 w-4 mr-1" />
              <span className="text-xs font-medium">Hit Rate</span>
            </div>
            <p className="text-xl font-bold text-green-900">{stats.hitRate}%</p>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-3">
            <div className="flex items-center text-purple-600 mb-1">
              <Database className="h-4 w-4 mr-1" />
              <span className="text-xs font-medium">Memory</span>
            </div>
            <p className="text-xl font-bold text-purple-900">{stats.memoryUsage}</p>
          </div>
          
          <div className="bg-orange-50 rounded-lg p-3">
            <div className="flex items-center text-orange-600 mb-1">
              <Clock className="h-4 w-4 mr-1" />
              <span className="text-xs font-medium">Last Cleared</span>
            </div>
            <p className="text-sm font-bold text-orange-900">
              {new Date(stats.lastCleared).toLocaleTimeString()}
            </p>
          </div>
        </div>
      )}

      {/* Cache Actions */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Cache Actions</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={clearProductsCache}
            disabled={loading}
            className="flex items-center justify-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Products Cache
          </button>
          
          <button
            onClick={clearAnalyticsCache}
            disabled={loading}
            className="flex items-center justify-center px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 transition-colors"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Analytics Cache
          </button>
          
          <button
            onClick={clearAllCache}
            disabled={loading}
            className="flex items-center justify-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All Cache
          </button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`mt-4 p-3 rounded-lg text-sm ${
          message.includes('Failed') || message.includes('Error') 
            ? 'bg-red-100 text-red-700' 
            : 'bg-green-100 text-green-700'
        }`}>
          {message}
        </div>
      )}

      {/* Cache Info */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Cache Information</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <p>• Products are cached for 1 hour</p>
          <p>• Search results are cached for 15 minutes</p>
          <p>• Analytics data is cached for 30 minutes</p>
          <p>• User profiles are cached for 5 minutes</p>
        </div>
      </div>
    </div>
  )
}
