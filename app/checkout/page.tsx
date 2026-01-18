'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/lib/store/cart'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/components/Toast/ToastProvider'
import { ErrorHandler, ErrorType } from '@/lib/errors/error-handler'
import { ArrowLeft, Truck, Shield, CreditCard, User, Phone, MapPin } from 'lucide-react'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getTotalPrice, clearCart } = useCartStore()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { showError, showSuccess } = useToast()

  // Form state
  const [customerInfo, setCustomerInfo] = useState({
    firstName: user?.user_metadata?.name?.split(' ')[0] || '',
    lastName: user?.user_metadata?.name?.split(' ').slice(1).join(' ') || '',
    phone: '',
    email: user?.email || '',
    whatsappNumber: ''
  })

  const [address, setAddress] = useState({
    addressLine1: '',
    addressLine2: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    deliveryNotes: ''
  })

  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('cod')

  const subtotal = getTotalPrice()
  const deliveryFee = subtotal >= 500 ? 0 : 40
  const total = subtotal + deliveryFee

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validate form
      if (!customerInfo.firstName || !customerInfo.phone || !address.addressLine1 || !address.city || !address.pincode) {
        const error = ErrorHandler.createError(
          ErrorType.VALIDATION,
          'Please fill all required fields',
          null,
          400,
          'checkout validation'
        )
        showError(error)
        return
      }

      // Phone number validation
      const phoneRegex = /^[+]?[0-9]{10,15}$/
      if (!phoneRegex.test(customerInfo.phone.replace(/[-\s]/g, ''))) {
        const error = ErrorHandler.createError(
          ErrorType.VALIDATION,
          'Please enter a valid phone number',
          null,
          400,
          'checkout validation'
        )
        showError(error)
        return
      }

      // Pincode validation
      const pincodeRegex = /^[0-9]{6}$/
      if (!pincodeRegex.test(address.pincode)) {
        const error = ErrorHandler.createError(
          ErrorType.VALIDATION,
          'Please enter a valid 6-digit pincode',
          null,
          400,
          'checkout validation'
        )
        showError(error)
        return
      }

      // Create order (save to Supabase)
      // Test Supabase connection first
      try {
        const { data: testData, error: testError } = await supabase
          .from('categories')
          .select('id')
          .limit(1)
        
        console.log('Supabase connection test:', { testData, testError })
        
        if (testError) {
          throw new Error(`Supabase connection failed: ${testError.message}`)
        }
      } catch (testErr) {
        console.error('Supabase connection test failed:', testErr)
        throw new Error('Unable to connect to database')
      }

      // Generate order number
      const orderNumber = 'ORD-' + Date.now().toString().slice(-8)

      // Create order with customer info
      const orderData = {
        order_number: orderNumber,
        customer_id: user?.id || null, // Use user ID if logged in
        delivery_address_id: null, // Could be enhanced to save addresses
        payment_method: paymentMethod,
        payment_status: 'pending',
        subtotal,
        delivery_fee: deliveryFee,
        total_amount: total,
        delivery_notes: JSON.stringify({
          customer_name: `${customerInfo.firstName} ${customerInfo.lastName}`,
          customer_phone: customerInfo.phone,
          customer_email: customerInfo.email,
          customer_whatsapp: customerInfo.whatsappNumber || customerInfo.phone,
          address_line1: address.addressLine1,
          address_line2: address.addressLine2,
          landmark: address.landmark,
          city: address.city,
          state: address.state,
          pincode: address.pincode,
          delivery_notes: address.deliveryNotes,
          is_guest_order: !user // Flag to identify guest orders
        }),
        status: 'pending'
      }

      console.log('Order data being sent:', orderData)

      // Insert order into Supabase
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single()

      console.log('Order response:', { order, orderError })

      if (orderError) {
        throw orderError
      }

      // Insert order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_variant_id: item.variantId,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity
      }))

      console.log('Order items being sent:', orderItems)

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      console.log('Order items response:', { itemsError })

      if (itemsError) {
        throw itemsError
      }

      // Clear cart and redirect to success
      clearCart()
      showSuccess('Order placed successfully!')
      router.push(`/order-success?order=${orderNumber}`)
      
    } catch (error) {
      console.error('Order placement error:', error)
      const appError = ErrorHandler.fromError(error, 'order placement')
      showError(appError)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
        <p className="text-gray-600 mb-8">Add some products before checking out.</p>
        <button
          onClick={() => router.push('/products')}
          className="text-orange-500 hover:text-orange-600 font-medium"
        >
          Browse Products
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Cat Theme */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 rounded-full mb-4">
            <span className="text-3xl">🛒</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Checkout
          </h1>
          <p className="text-xl text-gray-600">
            Almost there! Let's get your cat's delicious meals ready for delivery 🐾
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Customer Information */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-orange-800 mb-6 flex items-center">
                <span className="mr-3">👤</span>
                Customer Information
              </h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  required
                  value={customerInfo.firstName}
                  onChange={(e) => setCustomerInfo({...customerInfo, firstName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  value={customerInfo.lastName}
                  onChange={(e) => setCustomerInfo({...customerInfo, lastName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                  placeholder="+91-XXXXXXXXXX"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  WhatsApp Number (Same as phone if not provided)
                </label>
                <input
                  type="tel"
                  value={customerInfo.whatsappNumber}
                  onChange={(e) => setCustomerInfo({...customerInfo, whatsappNumber: e.target.value})}
                  placeholder="+91-XXXXXXXXXX"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-orange-800 mb-6 flex items-center">
              <span className="mr-3">🏠</span>
              Delivery Address
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address Line 1 *
                </label>
                <input
                  type="text"
                  required
                  value={address.addressLine1}
                  onChange={(e) => setAddress({...address, addressLine1: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address Line 2
                </label>
                <input
                  type="text"
                  value={address.addressLine2}
                  onChange={(e) => setAddress({...address, addressLine2: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Landmark
                </label>
                <input
                  type="text"
                  value={address.landmark}
                  onChange={(e) => setAddress({...address, landmark: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={address.city}
                    onChange={(e) => setAddress({...address, city: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    value={address.state}
                    onChange={(e) => setAddress({...address, state: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={address.pincode}
                    onChange={(e) => setAddress({...address, pincode: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Instructions
                </label>
                <textarea
                  value={address.deliveryNotes}
                  onChange={(e) => setAddress({...address, deliveryNotes: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Any special instructions for delivery..."
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-orange-800 mb-6 flex items-center">
              <span className="mr-3">💳</span>
              Payment Method
            </h2>
            
            <div className="space-y-3">
              <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={(e) => setPaymentMethod(e.target.value as 'cod')}
                  className="mr-3"
                />
                <div>
                  <div className="font-medium">Cash on Delivery (COD)</div>
                  <div className="text-sm text-gray-600">Pay when you receive your order</div>
                </div>
              </label>
              
              <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 opacity-50">
                <input
                  type="radio"
                  name="payment"
                  value="online"
                  checked={paymentMethod === 'online'}
                  onChange={(e) => setPaymentMethod(e.target.value as 'online')}
                  className="mr-3"
                  disabled
                />
                <div>
                  <div className="font-medium">Online Payment</div>
                  <div className="text-sm text-gray-600">Coming soon</div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg p-8 sticky top-24">
            <h2 className="text-2xl font-bold text-orange-800 mb-6 flex items-center">
              <span className="mr-3">📋</span>
              Order Summary
            </h2>
            
            {/* Items List */}
            <div className="space-y-3 mb-6">
              {items.map((item) => (
                <div key={item.variantId} className="flex justify-between text-sm">
                  <div>
                    <div className="font-medium">{item.productName}</div>
                    <div className="text-gray-600">{item.quantity} × {item.weight}g</div>
                  </div>
                  <span>₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
            
            {/* Pricing */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span>Delivery Fee</span>
                <span className={deliveryFee === 0 ? 'text-green-600' : ''}>
                  {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                </span>
              </div>
              
              <div className="border-t pt-2">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span className="text-orange-500">₹{total}</span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white py-4 px-6 rounded-full hover:from-orange-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 font-bold disabled:opacity-50 disabled:cursor-not-allowed mt-6 flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></span>
                  Placing Order...
                </>
              ) : (
                <>
                  <span className="mr-2">🐾</span>
                  Place Order
                </>
              )}
            </button>

            <div className="mt-4 text-xs text-gray-500 space-y-1">
              <p>• Order confirmation via WhatsApp</p>
              <p>• 2-4 days delivery after confirmation</p>
              <p>• Fresh food made to order</p>
            </div>
          </div>
        </div>
      </form>
      </div>
    </div>
  )
}
