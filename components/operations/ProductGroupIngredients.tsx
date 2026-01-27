'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { 
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  ChevronDown,
  Phone,
  Mail,
  ShoppingCart
} from 'lucide-react'
import { supabase } from '@/lib/auth/optimized-client'

interface IngredientRequirement {
  ingredient_id: string
  ingredient_name: string
  required_quantity: number
  required_quantity_display: number
  waste_quantity: number
  waste_quantity_display: number
  total_quantity: number
  total_quantity_display: number
  current_stock: number
  current_stock_display: number
  stock_status: 'sufficient' | 'insufficient' | 'out_of_stock'
  supplier_name?: string
  supplier_phone?: string
  supplier_email?: string
  display_unit?: string // This is the unit field from database
}

interface ProductGroupIngredientsProps {
  productName: string
  productId?: string | null
  orders: any[]
  className?: string
  onCreatePurchaseOrder?: (ingredientId: string, ingredientName: string, supplierName: string, suggestedQuantity: number, displayUnit?: string) => Promise<void>
  createdPOs?: Set<string>
}

// Helper function to format quantity with proper units (using database display fields)
const formatQuantity = (displayQuantity: number, ingredientName: string, displayUnit?: string) => {
  const isEgg = ingredientName.toLowerCase().includes('egg')
  
  if (isEgg && displayUnit === 'pieces') {
    return `${displayQuantity.toFixed(1)} pcs`
  } else if (displayUnit === 'kg') {
    return `${displayQuantity.toFixed(2)} kg`
  } else if (displayUnit === 'g') {
    return `${displayQuantity.toFixed(1)} g`
  } else {
    return `${displayQuantity.toFixed(1)} ${displayUnit || 'g'}`
  }
}

export default function ProductGroupIngredients({
  productName,
  productId,
  orders,
  className = '',
  onCreatePurchaseOrder,
  createdPOs = new Set()
}: ProductGroupIngredientsProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [aggregatedRequirements, setAggregatedRequirements] = useState<IngredientRequirement[]>([])
  const [loading, setLoading] = useState(false)

  // Fetch ingredient requirements using the database function
  useEffect(() => {
    const fetchIngredientRequirements = async () => {
      if (orders.length === 0 || !productName) {
        setAggregatedRequirements([])
        return
      }

      setLoading(true)
      try {
        const { data, error } = await supabase
          .rpc('get_product_group_ingredient_requirements_by_name', { 
            p_product_name: productName 
          } as any)

        if (error) {
          console.error('Error fetching product group ingredient requirements:', error)
          setAggregatedRequirements([])
        } else {
          console.log(`🔢 Fetched ingredient requirements for ${productName}:`, data)
          setAggregatedRequirements(data || [])
        }
      } catch (err) {
        console.error('Error:', err)
        setAggregatedRequirements([])
      } finally {
        setLoading(false)
      }
    }

    fetchIngredientRequirements()
  }, [productName, orders.length])

  const handleToggle = () => {
    setIsExpanded(!isExpanded)
  }

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'out_of_stock':
        return 'bg-red-50 border-red-200 text-red-800'
      case 'insufficient':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      case 'sufficient':
        return 'bg-green-50 border-green-200 text-green-800'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  const getStockStatusIcon = (status: string) => {
    switch (status) {
      case 'out_of_stock':
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case 'insufficient':
        return <TrendingDown className="h-4 w-4 text-yellow-600" />
      case 'sufficient':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      default:
        return <Package className="h-4 w-4 text-gray-600" />
    }
  }

  const totalWeight = orders.reduce((sum, order) => sum + (order.total_weight || 0), 0)
  const insufficientCount = aggregatedRequirements.filter((req: IngredientRequirement) => 
    req.stock_status !== 'sufficient'
  ).length

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div 
        className={`p-4 ${!productId ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:bg-blue-50 active:bg-blue-100'} transition-colors duration-200`}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          handleToggle()
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${!productId ? 'bg-gray-100' : 'bg-blue-100'}`}>
              <Package className={`h-5 w-5 ${!productId ? 'text-gray-400' : 'text-blue-600'}`} />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Ingredient Requirements</h4>
              <p className="text-sm text-gray-600">
                Total batch: {totalWeight.toFixed(0)}g • {orders.length} order{orders.length > 1 ? 's' : ''}
                {!productId && (
                  <span className="text-amber-600 ml-2 font-medium">• Product ID not available</span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {insufficientCount > 0 && (
              <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full border border-red-200">
                {insufficientCount} insufficient
              </span>
            )}
            {!productId ? (
              <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full border border-gray-200">
                Unavailable
              </span>
            ) : (
              <div className={`p-1 rounded-full transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ingredient Requirements */}
      {isExpanded && (
        <div className="border-t border-gray-200">
          {aggregatedRequirements.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>No ingredient requirements found</p>
            </div>
          ) : (
            <div className="p-4 space-y-2">
              {aggregatedRequirements.map((ingredient: IngredientRequirement) => (
                <div 
                  key={ingredient.ingredient_id}
                  className={`border rounded-lg p-3 ${getStockStatusColor(ingredient.stock_status)} hover:shadow-md transition-shadow duration-200`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getStockStatusIcon(ingredient.stock_status)}
                      <div>
                        <h5 className="font-semibold text-gray-900">{ingredient.ingredient_name}</h5>
                        <div className="flex items-center space-x-4 text-xs text-gray-600 mt-1">
                          <span>Required: <strong>{formatQuantity(ingredient.required_quantity_display, ingredient.ingredient_name, ingredient.display_unit)}</strong></span>
                          <span>Waste: <strong>{formatQuantity(ingredient.waste_quantity_display, ingredient.ingredient_name, ingredient.display_unit)}</strong></span>
                          <span>Total: <strong className="text-lg">{formatQuantity(ingredient.total_quantity_display, ingredient.ingredient_name, ingredient.display_unit)}</strong></span>
                          <span>Stock: <strong>{formatQuantity(ingredient.current_stock_display, ingredient.ingredient_name, ingredient.display_unit)}</strong></span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStockStatusColor(ingredient.stock_status)}`}>
                        {ingredient.stock_status.replace('_', ' ').toUpperCase()}
                      </span>
                      
                      {/* Show PO creation button only for insufficient ingredients */}
                      {ingredient.stock_status !== 'sufficient' && 
                       ingredient.supplier_name && 
                       onCreatePurchaseOrder &&
                       !createdPOs.has(ingredient.ingredient_id) && (
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            onCreatePurchaseOrder(
                              ingredient.ingredient_id,
                              ingredient.ingredient_name,
                              ingredient.supplier_name!,
                              Math.ceil(ingredient.total_quantity_display), // Use total_quantity_display directly (already includes waste)
                              ingredient.display_unit // Pass the display unit
                            )
                          }}
                          className="mt-2 px-3 py-1 text-xs font-medium text-white bg-orange-500 rounded hover:bg-orange-600 transition-colors duration-200 flex items-center space-x-1"
                        >
                          <ShoppingCart className="h-3 w-3" />
                          <span>Create PO</span>
                        </button>
                      )}
                      
                      {/* Show PO created status */}
                      {createdPOs.has(ingredient.ingredient_id) && (
                        <div className="mt-2 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded border border-green-200">
                          PO Created
                        </div>
                      )}
                      
                      {ingredient.supplier_name && (
                        <div className="mt-2 text-xs text-gray-500">
                          <div className="font-medium text-gray-700">{ingredient.supplier_name}</div>
                          {ingredient.supplier_phone && (
                            <div className="flex items-center space-x-1">
                              <Phone className="h-3 w-3" />
                              <span>{ingredient.supplier_phone}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
