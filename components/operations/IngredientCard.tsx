'use client'

import { useState } from 'react'
import { 
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Edit,
  Trash2,
  Package
} from 'lucide-react'

interface Ingredient {
  id: string
  name: string
  current_stock: number
  unit: string
  reorder_level: number
  unit_cost: number
  supplier: string | null
}

interface IngredientCardProps {
  ingredient: Ingredient
  onEdit: (ingredient: Ingredient) => void
  onDelete: (ingredientId: string) => void
  onUpdateStock: (ingredientId: string, newStock: number) => void
}

export default function IngredientCard({
  ingredient,
  onEdit,
  onDelete,
  onUpdateStock
}: IngredientCardProps) {
  const [isEditingStock, setIsEditingStock] = useState(false)
  const [newStock, setNewStock] = useState(ingredient.current_stock.toString())

  const getStockStatus = () => {
    if (ingredient.current_stock <= 0) return 'out-of-stock'
    if (ingredient.current_stock <= ingredient.reorder_level) return 'low-stock'
    return 'in-stock'
  }

  const getStockStatusColor = () => {
    switch (getStockStatus()) {
      case 'out-of-stock':
        return 'bg-red-50 border-red-200 text-red-800'
      case 'low-stock':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      default:
        return 'bg-green-50 border-green-200 text-green-800'
    }
  }

  const getStockStatusIcon = () => {
    switch (getStockStatus()) {
      case 'out-of-stock':
        return <AlertTriangle className="h-4 w-4" />
      case 'low-stock':
        return <TrendingDown className="h-4 w-4" />
      default:
        return <TrendingUp className="h-4 w-4" />
    }
  }

  const handleStockUpdate = () => {
    const stock = parseFloat(newStock)
    if (!isNaN(stock) && stock >= 0) {
      onUpdateStock(ingredient.id, stock)
      setIsEditingStock(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString()}`
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Package className="h-4 w-4 text-green-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {ingredient.name}
            </h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>ingredient</span>
              {ingredient.supplier && (
                <>
                  <span>•</span>
                  <span>{ingredient.supplier}</span>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onEdit(ingredient)}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(ingredient.id)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Stock Status */}
      <div className={`flex items-center justify-between p-3 rounded-lg border ${getStockStatusColor()} mb-4`}>
        <div className="flex items-center space-x-2">
          {getStockStatusIcon()}
          <span className="text-sm font-medium capitalize">
            {getStockStatus().replace('-', ' ')}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          {isEditingStock ? (
            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={newStock}
                onChange={(e) => setNewStock(e.target.value)}
                className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                step="0.01"
                min="0"
              />
              <span className="text-sm text-gray-600">{ingredient.unit}</span>
              <button
                onClick={handleStockUpdate}
                className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setIsEditingStock(false)
                  setNewStock(ingredient.current_stock.toString())
                }}
                className="px-2 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <span className="text-lg font-semibold">
                {ingredient.current_stock.toLocaleString()} {ingredient.unit}
              </span>
              <button
                onClick={() => setIsEditingStock(true)}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Edit
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Additional Info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <p className="text-gray-500">Reorder Level</p>
          <p className="font-medium text-gray-900">
            {ingredient.reorder_level.toLocaleString()} {ingredient.unit}
          </p>
        </div>
        <div>
          <p className="text-gray-500">Unit Cost</p>
          <p className="font-medium text-gray-900">
            {formatCurrency(ingredient.unit_cost)}
          </p>
        </div>
        <div>
          <p className="text-gray-500">Total Value</p>
          <p className="font-medium text-gray-900">
            {formatCurrency(ingredient.current_stock * ingredient.unit_cost)}
          </p>
        </div>
      </div>
    </div>
  )
}
