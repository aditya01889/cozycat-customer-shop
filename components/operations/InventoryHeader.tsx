'use client'

import { Search, Filter, Plus, Package as InventoryIcon } from 'lucide-react'

interface InventoryHeaderProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  onAddIngredient: () => void
  onAddVendor: () => void
  activeTab: 'ingredients' | 'vendors'
  onTabChange: (tab: 'ingredients' | 'vendors') => void
}

export default function InventoryHeader({
  searchTerm,
  onSearchChange,
  onAddIngredient,
  onAddVendor,
  activeTab,
  onTabChange
}: InventoryHeaderProps) {
  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-3">
            <InventoryIcon className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
              <p className="text-sm text-gray-500">
                Manage ingredients, packaging materials, and vendors
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onAddIngredient}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              <span>Add Ingredient</span>
            </button>
            
            <button
              onClick={onAddVendor}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              <Plus className="h-4 w-4" />
              <span>Add Vendor</span>
            </button>
          </div>
        </div>
        
        {/* Search and Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 space-y-4 sm:space-y-0 border-t border-gray-200">
          <div className="flex items-center space-x-1">
            <button
              onClick={() => onTabChange('ingredients')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'ingredients'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Ingredients
            </button>
            <button
              onClick={() => onTabChange('vendors')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'vendors'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Vendors
            </button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 w-64"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
