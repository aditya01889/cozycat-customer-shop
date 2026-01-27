'use client'

import { useState } from 'react'
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Play, 
  Eye,
  ChevronDown,
  ChevronUp,
  IndianRupee,
  User,
  Phone,
  Mail,
  MapPin,
  Package
} from 'lucide-react'

interface Order {
  id: string
  order_number: string
  status: string
  total_amount: number
  created_at: string
  delivery_notes: string
  customer_info?: {
    customer_name: string
    customer_phone: string
    customer_email: string
    address_line1: string
    city: string
    state: string
    pincode: string
  }
  order_items: Array<{
    id: string
    product_name: string
    quantity: number
    weight_grams: number
    unit_price: number
    total_price: number
    product_variant?: {
      id: string
      weight_grams: number
      product_id: string
      product: {
        id: string
        name: string
      }
    }
  }>
}

interface OrderWithIngredients extends Order {
  ingredient_requirements: Array<{
    ingredient_id: string
    ingredient_name: string
    required_quantity: number
    waste_quantity: number
    total_quantity: number
    current_stock: number
    stock_status: 'sufficient' | 'insufficient' | 'out_of_stock'
    supplier_name?: string
    supplier_phone?: string
    supplier_email?: string
  }>
  can_produce: boolean
  insufficient_count: number
  total_weight: number
  priority_order: number
}

interface OrderCardProps {
  order: OrderWithIngredients
  isExpanded: boolean
  onToggleExpand: () => void
  onStartProduction: (orderId: string) => void
  updatingOrder: string | null
  createdPOs: Set<string>
}

export default function OrderCard({
  order,
  isExpanded,
  onToggleExpand,
  onStartProduction,
  updatingOrder,
  createdPOs
}: OrderCardProps) {
  // Helper function to display quantities with proper unit conversion
  const displayQuantity = (quantity: number, ingredientName: string) => {
    if (ingredientName.toLowerCase().includes('egg')) {
      // Convert grams to pieces for eggs (50g per piece)
      const pieces = Math.round(quantity / 50 * 10) / 10
      return `${pieces} pieces`
    }
    return `${quantity}g`
  }
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />
      case 'processing':
        return <Play className="h-5 w-5 text-blue-500" />
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatCurrency = (amount: number) => {
    if (amount === undefined || amount === null) return '₹0'
    return `₹${amount.toLocaleString()}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4">
      <div className="p-6">
        {/* Order Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {getStatusIcon(order.status)}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Order #{order.order_number}
              </h3>
              <p className="text-sm text-gray-500">
                {formatDate(order.created_at)} • {order.total_weight}g total
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
              {order.status}
            </span>
            
            <span className="text-lg font-semibold text-gray-900">
              {formatCurrency(order.total_amount)}
            </span>
            
            <button
              onClick={onToggleExpand}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              {isExpanded ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Customer Info */}
        {order.customer_info && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-900">
                {order.customer_info.customer_name}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {order.customer_info.customer_phone}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {order.customer_info.customer_email}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {order.customer_info.city}, {order.customer_info.state} {order.customer_info.pincode}
              </span>
            </div>
          </div>
        )}

        {/* Production Status */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 ${
              order.can_produce ? 'text-green-600' : 'text-red-600'
            }`}>
              <Package className="h-4 w-4" />
              <span className="text-sm font-medium">
                {order.can_produce ? 'Can Produce' : 'Insufficient Ingredients'}
              </span>
            </div>
            
            {!order.can_produce && (
              <span className="text-sm text-red-600">
                {order.insufficient_count} ingredients short
              </span>
            )}
          </div>

          {order.status === 'pending' && order.can_produce && (
            <button
              onClick={() => onStartProduction(order.id)}
              disabled={updatingOrder === order.id}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="h-4 w-4" />
              <span>
                {updatingOrder === order.id ? 'Starting...' : 'Start Production'}
              </span>
            </button>
          )}
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="border-t border-gray-200 pt-4">
            {/* Order Items */}
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Order Items</h4>
              <div className="space-y-2">
                {order.order_items.map((item, index) => (
                  <div key={`${item.id}-${index}`} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <div>
                      <span className="text-sm font-medium text-gray-900">
                        {item.product_name}
                      </span>
                      <span className="text-sm text-gray-500 ml-2">
                        {item.quantity} × {item.weight_grams}g
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(item.total_price)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Ingredient Requirements */}
            {order.ingredient_requirements.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Ingredient Requirements</h4>
                <div className="space-y-2">
                  {order.ingredient_requirements.map((ingredient, index) => (
                    <div 
                      key={`${ingredient.ingredient_id}-${index}`}
                      className={`p-3 rounded-lg border ${
                        ingredient.stock_status === 'sufficient' 
                          ? 'bg-green-50 border-green-200'
                          : ingredient.stock_status === 'insufficient'
                          ? 'bg-yellow-50 border-yellow-200'
                          : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-sm font-medium text-gray-900">
                            {ingredient.ingredient_name}
                          </span>
                          <div className="text-xs text-gray-500">
                            Required: {displayQuantity(ingredient.required_quantity, ingredient.ingredient_name)} • 
                            Current: {displayQuantity(ingredient.current_stock, ingredient.ingredient_name)}
                          </div>
                        </div>
                        <span className={`text-xs font-medium ${
                          ingredient.stock_status === 'sufficient'
                            ? 'text-green-600'
                            : ingredient.stock_status === 'insufficient'
                            ? 'text-yellow-600'
                            : 'text-red-600'
                        }`}>
                          {ingredient.stock_status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
