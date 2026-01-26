'use client'

import { useState } from 'react'
import { AlertTriangle, TrendingDown, Phone, Mail, Package } from 'lucide-react'

interface CumulativeRequirements {
  ingredient_id: string
  ingredient_name: string
  total_required: number
  current_stock: number
  shortage: number
  affected_orders: string[]
  supplier_name?: string
  supplier_phone?: string
  supplier_email?: string
}

interface CumulativeRequirementsProps {
  requirements: CumulativeRequirements[]
  onCreatePurchaseOrder: (ingredientId: string, ingredientName: string, supplierName: string, suggestedQuantity: number) => void
  createdPOs: Set<string>
}

export default function CumulativeRequirements({
  requirements,
  onCreatePurchaseOrder,
  createdPOs
}: CumulativeRequirementsProps) {
  const [expandedIngredients, setExpandedIngredients] = useState<Set<string>>(new Set())

  const toggleExpanded = (ingredientId: string) => {
    const newExpanded = new Set(expandedIngredients)
    if (newExpanded.has(ingredientId)) {
      newExpanded.delete(ingredientId)
    } else {
      newExpanded.add(ingredientId)
    }
    setExpandedIngredients(newExpanded)
  }

  const getStockStatusColor = (shortage: number) => {
    if (shortage <= 0) return 'bg-green-50 border-green-200 text-green-800'
    if (shortage < 100) return 'bg-yellow-50 border-yellow-200 text-yellow-800'
    return 'bg-red-50 border-red-200 text-red-800'
  }

  const getStockStatusIcon = (shortage: number) => {
    if (shortage <= 0) return <Package className="h-4 w-4" />
    if (shortage < 100) return <AlertTriangle className="h-4 w-4" />
    return <TrendingDown className="h-4 w-4" />
  }

  const formatWeight = (grams: number) => {
    if (grams >= 1000) {
      return `${(grams / 1000).toFixed(1)}kg`
    }
    return `${grams}g`
  }

  const insufficientIngredients = requirements.filter(req => req.shortage > 0)

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Ingredients</p>
              <p className="text-2xl font-bold text-gray-900">{requirements.length}</p>
            </div>
            <Package className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Stock</p>
              <p className="text-2xl font-bold text-green-600">
                {requirements.filter(req => req.shortage <= 0).length}
              </p>
            </div>
            <Package className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Shortage</p>
              <p className="text-2xl font-bold text-red-600">{insufficientIngredients.length}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Insufficient Ingredients Alert */}
      {insufficientIngredients.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <h3 className="text-lg font-semibold text-red-800">
              {insufficientIngredients.length} ingredients need restocking
            </h3>
          </div>
          <p className="text-red-700">
            Create purchase orders for these ingredients to avoid production delays.
          </p>
        </div>
      )}

      {/* Ingredients List */}
      <div className="space-y-4">
        {requirements.map((requirement) => (
          <div
            key={requirement.ingredient_id}
            className={`bg-white rounded-lg shadow-sm border ${
              getStockStatusColor(requirement.shortage)
            }`}
          >
            <div className="p-6">
              {/* Ingredient Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {getStockStatusIcon(requirement.shortage)}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {requirement.ingredient_name}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>Required: {formatWeight(requirement.total_required)}</span>
                      <span>Current: {formatWeight(requirement.current_stock)}</span>
                      {requirement.shortage > 0 && (
                        <span className="font-medium text-red-600">
                          Shortage: {formatWeight(requirement.shortage)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {requirement.shortage > 0 && requirement.supplier_name && (
                    <button
                      onClick={() => onCreatePurchaseOrder(
                        requirement.ingredient_id,
                        requirement.ingredient_name,
                        requirement.supplier_name!,
                        requirement.shortage
                      )}
                      disabled={createdPOs.has(requirement.ingredient_id)}
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                        createdPOs.has(requirement.ingredient_id)
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {createdPOs.has(requirement.ingredient_id) ? 'PO Created' : 'Create PO'}
                    </button>
                  )}

                  <button
                    onClick={() => toggleExpanded(requirement.ingredient_id)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    {expandedIngredients.has(requirement.ingredient_id) ? '▲' : '▼'}
                  </button>
                </div>
              </div>

              {/* Supplier Info */}
              {requirement.supplier_name && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Package className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-900">
                      {requirement.supplier_name}
                    </span>
                  </div>
                  {requirement.supplier_phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {requirement.supplier_phone}
                      </span>
                    </div>
                  )}
                  {requirement.supplier_email && (
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {requirement.supplier_email}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Expanded Details */}
              {expandedIngredients.has(requirement.ingredient_id) && (
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">
                    Affected Orders ({requirement.affected_orders.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {requirement.affected_orders.map((orderId) => (
                      <span
                        key={orderId}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-md"
                      >
                        {orderId}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
