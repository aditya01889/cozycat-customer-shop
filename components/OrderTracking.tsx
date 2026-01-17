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
  IndianRupee,
  ArrowLeft,
  User,
  Home
} from 'lucide-react'
import Link from 'next/link'

type Order = Database['public']['Tables']['orders']['Row'] & {
  order_items: Database['public']['Tables']['order_items']['Row'][]
  customer_info?: any
}

interface OrderTrackingProps {
  order: Order
  fromProfile?: boolean
  fromAdmin?: boolean
}

export default function OrderTracking({ order, fromProfile = false, fromAdmin = false }: OrderTrackingProps) {
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
        return 'text-orange-700 bg-orange-100 border-orange-200'
      case 'confirmed':
        return 'text-blue-700 bg-blue-100 border-blue-200'
      case 'in_production':
        return 'text-purple-700 bg-purple-100 border-purple-200'
      case 'ready':
        return 'text-green-700 bg-green-100 border-green-200'
      case 'out_for_delivery':
        return 'text-indigo-700 bg-indigo-100 border-indigo-200'
      case 'delivered':
        return 'text-gray-700 bg-gray-100 border-gray-200'
      default:
        return 'text-gray-700 bg-gray-100 border-gray-200'
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href={fromAdmin ? "/admin/orders" : fromProfile ? "/profile" : "/track-order"} className="flex items-center text-gray-600 hover:text-gray-900 mr-4">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to {fromAdmin ? "Order Management" : fromProfile ? "Profile" : "Track Order"}
              </Link>
              <span className="text-2xl mr-3">🐾</span>
              <h1 className="text-xl font-bold text-gray-900">Order Tracking</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 rounded-full mb-4">
            <span className="text-3xl">📦</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Track Your Order
          </h2>
          <p className="text-xl text-gray-600">
            Follow your CozyCat Kitchen order journey 🐾
          </p>
        </div>

        {/* Order Status Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border-l-4 border-orange-500">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Order #{order.order_number}
              </h3>
              <p className="text-gray-600">
                Placed on {formatDate(order.created_at)}
              </p>
            </div>
            <div className={`mt-4 sm:mt-0 px-6 py-3 rounded-2xl border flex items-center gap-3 ${getStatusColor(order.status)}`}>
              {getStatusIcon(order.status)}
              <span className="font-semibold text-lg">
                {getStatusText(order.status)}
              </span>
            </div>
          </div>

          {/* Timeline */}
          <div className="mt-8">
            <h4 className="text-xl font-semibold text-gray-900 mb-6">Order Timeline</h4>
            <div className="space-y-6">
              {getTimelineSteps().map((step, index) => (
                <div key={step.key} className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                    step.completed 
                      ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white border-orange-500' 
                      : 'bg-gray-100 text-gray-400 border-gray-300'
                  }`}>
                    {getStatusIcon(step.key)}
                  </div>
                  <div className="flex-1">
                    <p className={`font-semibold text-lg ${step.completed ? 'text-gray-900' : 'text-gray-400'}`}>
                      {step.label}
                    </p>
                    {step.completed && (
                      <p className="text-sm text-gray-600 mt-1">
                        {index === 0 ? formatDate(order.created_at) : 'Completed'}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-6 border-b bg-gradient-to-r from-orange-50 to-pink-50">
                <h3 className="text-xl font-semibold text-gray-900">Order Details</h3>
              </div>
              
              <div className="p-6">
                {/* Items */}
                <div className="mb-8">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <Package className="w-5 h-5 mr-2 text-orange-500" />
                    Items ({order.order_items.length})
                  </h4>
                  <div className="space-y-4">
                    {order.order_items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-pink-100 rounded-xl flex items-center justify-center">
                            <span className="text-2xl">🍽️</span>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              Product #{item.product_id}
                            </p>
                            <p className="text-sm text-gray-600">
                              {item.quantity} × Variant #{item.variant_id}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg text-gray-900">₹{item.total_price}</p>
                          <p className="text-sm text-gray-600">₹{item.unit_price} each</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pricing */}
                <div className="border-t pt-6">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <IndianRupee className="w-5 h-5 mr-2 text-green-500" />
                    Order Summary
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span>₹{order.subtotal}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Delivery Fee</span>
                      <span className={order.delivery_fee === 0 ? 'text-green-600 font-medium' : ''}>
                        {order.delivery_fee === 0 ? 'FREE' : `₹${order.delivery_fee}`}
                      </span>
                    </div>
                    <div className="flex justify-between font-bold text-xl pt-4 border-t-2 border-gray-200">
                      <span>Total Amount</span>
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-500">
                        ₹{order.total_amount}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Information */}
          <div className="lg:col-span-1">
            {customerInfo && (
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
                <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-purple-50">
                  <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-blue-500" />
                    Delivery Information
                  </h3>
                </div>
                
                <div className="p-6 space-y-6">
                  {/* Customer Details */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <User className="w-4 h-4 mr-2 text-purple-500" />
                      Customer Details
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700">{customerInfo.customer_phone}</span>
                      </div>
                      {customerInfo.customer_email && (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700">{customerInfo.customer_email}</span>
                        </div>
                      )}
                      {customerInfo.customer_whatsapp && (
                        <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                          <Phone className="w-4 h-4 text-green-500" />
                          <span className="text-gray-700">WhatsApp: {customerInfo.customer_whatsapp}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Delivery Address */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <Home className="w-4 h-4 mr-2 text-orange-500" />
                      Delivery Address
                    </h4>
                    <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                      <p className="font-semibold text-gray-900">{customerInfo.customer_name}</p>
                      <p className="text-gray-700">{customerInfo.address_line1}</p>
                      {customerInfo.address_line2 && <p className="text-gray-700">{customerInfo.address_line2}</p>}
                      {customerInfo.landmark && <p className="text-gray-600 text-sm">Landmark: {customerInfo.landmark}</p>}
                      <p className="text-gray-700">{customerInfo.city}, {customerInfo.state} - {customerInfo.pincode}</p>
                      {customerInfo.delivery_notes && (
                        <p className="text-gray-600 text-sm mt-3 p-2 bg-white rounded border-l-4 border-orange-300">
                          📝 {customerInfo.delivery_notes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Help Section */}
            <div className="bg-gradient-to-br from-orange-100 to-pink-100 rounded-2xl p-6 border border-orange-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                <span className="mr-2">💬</span>
                Need Help?
              </h3>
              <p className="text-gray-700 mb-6">
                If you have any questions about your order, feel free to reach out to us. We're here to help!
              </p>
              <div className="space-y-3">
                <a
                  href="tel:+91-XXXXXXXXXX"
                  className="flex items-center gap-3 p-3 bg-white rounded-xl hover:bg-gray-50 transition-colors text-gray-700"
                >
                  <Phone className="w-5 h-5 text-orange-500" />
                  <span className="font-medium">Call Us</span>
                </a>
                <a
                  href="mailto:orders@cozycatkitchen.com"
                  className="flex items-center gap-3 p-3 bg-white rounded-xl hover:bg-gray-50 transition-colors text-gray-700"
                >
                  <Mail className="w-5 h-5 text-blue-500" />
                  <span className="font-medium">Email Us</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Cat Illustration */}
        <div className="text-center mt-12">
          <div className="text-6xl mb-4">🐾</div>
          <p className="text-gray-600">
            Thank you for choosing CozyCatKitchen! Your cat will love you for it! 😺
          </p>
          <div className="flex justify-center space-x-4 mt-4">
            <span className="text-2xl animate-pulse">🐾</span>
            <span className="text-2xl animate-bounce" style={{ animationDelay: '0.2s' }}>🐾</span>
            <span className="text-2xl animate-ping" style={{ animationDelay: '0.4s' }}>🐾</span>
          </div>
        </div>
      </div>
    </div>
  )
}
