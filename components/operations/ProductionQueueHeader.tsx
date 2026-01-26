'use client'

import { RefreshCw, Eye, Package } from 'lucide-react'

interface ProductionQueueHeaderProps {
  loading: boolean
  showCumulativeView: boolean
  showProductGroupView: boolean
  onRefresh: () => void
  onToggleCumulativeView: () => void
  onToggleProductGroupView: () => void
}

export default function ProductionQueueHeader({
  loading,
  showCumulativeView,
  showProductGroupView,
  onRefresh,
  onToggleCumulativeView,
  onToggleProductGroupView
}: ProductionQueueHeaderProps) {
  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-3">
            <Package className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Production Queue</h1>
              <p className="text-sm text-gray-500">
                {showCumulativeView 
                  ? 'Cumulative ingredient requirements view'
                  : showProductGroupView
                  ? 'Product group view'
                  : 'Individual orders view'
                }
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onToggleProductGroupView}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                showProductGroupView
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Eye className="h-4 w-4 mr-1 inline" />
              Product Groups
            </button>
            
            <button
              onClick={onToggleCumulativeView}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                showCumulativeView
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Eye className="h-4 w-4 mr-1 inline" />
              Cumulative View
            </button>
            
            <button
              onClick={onRefresh}
              disabled={loading}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
