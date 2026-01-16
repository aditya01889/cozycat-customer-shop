'use client'

import { useState, useEffect } from 'react'
import { Database } from '@/types/database'
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  ChefHat,
  Phone,
  Mail,
  MapPin,
  IndianRupee
} from 'lucide-react'

type Order = Database['public']['Tables']['orders']['Row'] & {
  order_items: Database['public']['Tables']['order_items']['Row'][]
  customer_info?: any
}

interface OrderTrackingProps {
  order: Order
}

export default function OrderTracking({ order }: OrderTrackingProps) {
  const [customerInfo, setCustomerInfo] = useState<any>(null)

  useEffect(() => {
    // Parse customer info from delivery_notes if it's a guest order
    if (order.delivery_notes && typeof order.delivery_notes === 'string') {
      try {
        const parsed = JSON.parse(order.delivery_notes)
        setCustomerInfo(parsed)
      } catch (e) {
        console.error('Failed to parse customer info:', e)
      }
    } else if (order.customer_info) {
      setCustomerInfo(order.customer_info)
    }
  }, [order.delivery_notes, order.customer_info])

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'text-orange-600 bg-orange-50'
      case 'confirmed':
        return 'text-blue-600 bg-blue-50'
      case 'in_production':
        return 'text-purple-600 bg-purple-50'
      case 'ready':
        return 'text-green-600 bg-green-50'
      case 'out_for_delivery':
        return 'text-indigo-600 bg-indigo-50'
      case 'delivered':
        return 'text-gray-600 bg-gray-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Clock className="w-5 h-5" />
      case 'confirmed':
        return <CheckCircle className="w-5 h-5" />
      case 'in_production':
        return <ChefHat className="w-5 h-5" />
      case 'ready':
      case 'out_for_delivery':
        return <Package className="w-5 h-5" />
      case 'delivered':
        return <Truck className="w-5 h-5" />
      default:
        return <Package className="w-5 h-5" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'Order Received'
      case 'confirmed':
        return 'Order Confirmed'
      case 'in_production':
        return 'Being Prepared'
      case 'ready':
        return 'Ready for Delivery'
      case 'out_for_delivery':
        return 'Out for Delivery'
      case 'delivered':
        return 'Delivered'
      default:
        return status
    }
  }

  const getTimelineSteps = () => {
    const allSteps = [
      { key: 'pending', label: 'Order Received', completed: true },
      { key: 'confirmed', label: 'Order Confirmed', completed: ['confirmed', 'in_production', 'ready', 'out_for_delivery', 'delivered'].includes(order.status) },
      { key: 'in_production', label: 'Being Prepared', completed: ['in_production', 'ready', 'out_for_delivery', 'delivered'].includes(order.status) },
      { key: 'ready', label: 'Ready for Delivery', completed: ['ready', 'out_for_delivery', 'delivered'].includes(order.status) },
      { key: 'out_for_delivery', label: 'Out for Delivery', completed: ['out_for_delivery', 'delivered'].includes(order.status) },
      { key: 'delivered', label: 'Delivered', completed: order.status === 'delivered' }
    ]

    return allSteps
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Tracking</h1>
        <p className="text-gray-600">
          Track your CozyCatKitchen order status
        </p>
      </div>

      {/* Order Status Card */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Order #{order.order_number}
            </h2>
            <p className="text-sm text-gray-600">
              Placed on {formatDate(order.created_at)}
            </p>
          </div>
          <div className={`px-4 py-2 rounded-full flex items-center gap-2 ${getStatusColor(order.status)}`}>
            {getStatusIcon(order.status)}
            <span className="font-medium">
              {getStatusText(order.status)}
            </span>
          </div>
        </div>

        {/* Timeline */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Order Timeline</h3>
          <div className="space-y-4">
            {getTimelineSteps().map((step, index) => (
              <div key={step.key} className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step.completed ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-400'
                }`}>
                  {getStatusIcon(step.key)}
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${step.completed ? 'text-gray-900' : 'text-gray-400'}`}>
                    {step.label}
                  </p>
                  {step.completed && (
                    <p className="text-sm text-gray-600">
                      {index === 0 ? formatDate(order.created_at) : 'Completed'}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Order Details */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">Order Details</h3>
        
        {/* Items */}
        <div className="mb-6">
          <h4 className="font-medium mb-3">Items</h4>
          <div className="space-y-3">
            {order.order_items.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-3 border-b">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🍽️</span>
                  </div>
                  <div>
                    <p className="font-medium">
                      Product #{item.product_id}
                    </p>
                    <p className="text-sm text-gray-600">
                      {item.quantity} × Variant #{item.variant_id}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">₹{item.total_price}</p>
                  <p className="text-sm text-gray-600">₹{item.unit_price} each</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing */}
        <div className="border-t pt-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>₹{order.subtotal}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Delivery Fee</span>
              <span>{order.delivery_fee === 0 ? 'FREE' : `₹${order.delivery_fee}`}</span>
            </div>
            <div className="flex justify-between font-semibold text-lg pt-2 border-t">
              <span>Total</span>
              <span className="text-orange-500">₹{order.total_amount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Delivery Information */}
      {customerInfo && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Delivery Information</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Customer Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>{customerInfo.customer_phone}</span>
                </div>
                {customerInfo.customer_email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span>{customerInfo.customer_email}</span>
                  </div>
                )}
                {customerInfo.customer_whatsapp && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>WhatsApp: {customerInfo.customer_whatsapp}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Delivery Address</h4>
              <div className="space-y-1 text-sm">
                <p className="font-medium">{customerInfo.customer_name}</p>
                <p>{customerInfo.address_line1}</p>
                {customerInfo.address_line2 && <p>{customerInfo.address_line2}</p>}
                {customerInfo.landmark && <p>Landmark: {customerInfo.landmark}</p>}
                <p>{customerInfo.city}, {customerInfo.state} - {customerInfo.pincode}</p>
                {customerInfo.delivery_notes && (
                  <p className="text-gray-600 mt-2">Notes: {customerInfo.delivery_notes}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="bg-orange-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-2">Need Help?</h3>
        <p className="text-gray-700 mb-4">
          If you have any questions about your order, feel free to reach out to us.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <a
            href="tel:+91-XXXXXXXXXX"
            className="flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium"
          >
            <Phone className="w-4 h-4" />
            Call Us
          </a>
          <a
            href="mailto:orders@cozycatkitchen.com"
            className="flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium"
          >
            <Mail className="w-4 h-4" />
            Email Us
          </a>
        </div>
      </div>
    </div>
  )
}
