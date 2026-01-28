'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/lib/store/cart'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/components/Toast/ToastProvider'
import { ErrorHandler, ErrorType } from '@/lib/errors/error-handler'
import { ArrowLeft, Truck, Shield, CreditCard, User, Phone, MapPin } from 'lucide-react'
import { RazorpayClient, RazorpayOptions, RazorpayResponse } from '@/lib/razorpay/client'
import { getCSRFHeader } from '@/lib/security/csrf-client'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getTotalPrice, clearCart } = useCartStore()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { showError, showSuccess } = useToast()

  // Fetch CSRF token on component mount
  useEffect(() => {
    const fetchCSRFToken = async () => {
      try {
        const response = await fetch('/api/csrf')
        const data = await response.json()
      } catch (error) {
        console.error('Error fetching CSRF token:', error)
      }
    }
    
    fetchCSRFToken()
  }, [])

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

  const [geoLocation, setGeoLocation] = useState<null | {
    latitude: number
    longitude: number
    accuracy: number
    capturedAt: string
  }>(null)

  const [isGettingLocation, setIsGettingLocation] = useState(false)

  const [paymentMethod, setPaymentMethod] = useState<'online'>('online')
  const [razorpayOrderId, setRazorpayOrderId] = useState<string | null>(null)

  const subtotal = getTotalPrice()
  const deliveryFee = subtotal >= 500 ? 0 : 40
  const total = subtotal + deliveryFee

  const handleGetCurrentLocation = async () => {
    if (typeof window === 'undefined') return

    if (!navigator.geolocation) {
      showError(
        ErrorHandler.createError(
          ErrorType.VALIDATION,
          'Location is not supported on this device/browser. Please enter address manually.',
          null,
          400,
          'checkout geolocation'
        )
      )
      return
    }

    setIsGettingLocation(true)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const payload = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          capturedAt: new Date().toISOString()
        }

        setGeoLocation(payload)
        showSuccess('Location captured. We’ll include it with your order for accurate delivery.')
        setIsGettingLocation(false)
      },
      (error) => {
        setIsGettingLocation(false)
        const message =
          error.code === error.PERMISSION_DENIED
            ? 'Location permission was denied. You can still place the order by entering the address manually.'
            : error.code === error.POSITION_UNAVAILABLE
              ? 'Location is unavailable right now. Please try again or enter address manually.'
              : 'Unable to get your location. Please try again or enter address manually.'

        showError(
          ErrorHandler.createError(
            ErrorType.NETWORK,
            message,
            { code: error.code, message: error.message },
            400,
            'checkout geolocation'
          )
        )
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }

  const processRazorpayPayment = async (orderId: string, orderNumber: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const razorpayClient = RazorpayClient.getInstance()
      
      const options: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: total * 100, // Convert to paise
        currency: 'INR',
        name: 'CozyCat',
        description: `Order ${orderNumber}`,
        order_id: orderId,
        prefill: {
          name: `${customerInfo.firstName} ${customerInfo.lastName}`,
          email: customerInfo.email,
          contact: customerInfo.phone,
        },
        notes: {
          order_number: orderNumber,
          customer_name: `${customerInfo.firstName} ${customerInfo.lastName}`,
          customer_phone: customerInfo.phone,
        },
        theme: {
          color: '#f97316', // Orange color
        },
        handler: async (response: RazorpayResponse) => {
          try {
            // Verify payment on server
            const verifyResponse = await fetch('/api/razorpay/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                orderNumber: orderNumber,
              })
            })

            const verificationData = await verifyResponse.json()
            
            if (verificationData.success) {
              resolve(true)
            } else {
              showError(ErrorHandler.createError(
                ErrorType.PAYMENT,
                'Payment verification failed',
                null,
                400,
                'payment verification'
              ))
              resolve(false)
            }
          } catch (error) {
            const appError = ErrorHandler.fromError(error, 'payment verification')
            showError(appError)
            resolve(false)
          }
        },
        modal: {
          ondismiss: () => {
            resolve(false)
          },
        },
      }

      // Load Razorpay script and open payment modal
      razorpayClient.loadScript().then(() => {
        razorpayClient.openPayment(options)
      }).catch((error) => {
        console.error('Failed to load Razorpay:', error)
        showError(ErrorHandler.createError(
          ErrorType.PAYMENT,
          'Failed to load payment gateway',
          null,
          500,
          'payment gateway'
        ))
        resolve(false)
      })
    })
  }

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
      const deliveryLocation = geoLocation
        ? {
            ...geoLocation,
            maps_url: `https://www.google.com/maps?q=${geoLocation.latitude},${geoLocation.longitude}`
          }
        : null

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
          delivery_location: deliveryLocation,
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

      // Handle payment based on method
      if (paymentMethod === 'online') {
        // Get authentication token (optional for guest orders)
        const { data: { session } } = await supabase.auth.getSession()
        
        // Debug: Check CSRF token
        const csrfToken = getCSRFHeader()

        // Prepare headers
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          ...csrfToken,
        }

        // Add authorization header only if user is authenticated
        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`
        }

        // Create Razorpay order first
        const razorpayResponse = await fetch('/api/razorpay/create-order', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            amount: total,
            currency: 'INR',
            receipt: orderNumber,
            notes: {
              order_number: orderNumber,
              customer_name: `${customerInfo.firstName} ${customerInfo.lastName}`,
              customer_phone: customerInfo.phone,
              customer_email: customerInfo.email,
              is_guest_order: (!user).toString()
            }
          })
        })

        if (!razorpayResponse.ok) {
          const errorText = await razorpayResponse.text()
          throw new Error(`Payment order creation failed: ${razorpayResponse.status} - ${errorText}`)
        }

        const razorpayData = await razorpayResponse.json()
        
        if (!razorpayData.success) {
          throw new Error('Failed to create payment order')
        }

        setRazorpayOrderId(razorpayData.order.id)

        // Process payment with Razorpay
        const paymentSuccess = await processRazorpayPayment(razorpayData.order.id, orderNumber)
        
        if (!paymentSuccess) {
          throw new Error('Payment failed')
        }
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
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
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
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
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
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-orange-800 mb-6 flex items-center">
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
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-orange-800 mb-6 flex items-center">
              <span className="mr-3">🏠</span>
              Delivery Address
            </h2>

            <div className="mb-6">
              <button
                type="button"
                onClick={handleGetCurrentLocation}
                disabled={isGettingLocation}
                className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-orange-200 bg-orange-50 text-orange-800 hover:bg-orange-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <MapPin className="w-4 h-4 mr-2" />
                {isGettingLocation ? 'Getting location…' : 'Use my current location'}
              </button>

              {geoLocation && (
                <div className="mt-3 text-sm text-gray-600">
                  <div>
                    Location captured (±{Math.round(geoLocation.accuracy)}m)
                  </div>
                  <a
                    href={`https://www.google.com/maps?q=${geoLocation.latitude},${geoLocation.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-orange-600 hover:text-orange-700 underline"
                  >
                    Open in Google Maps
                  </a>
                </div>
              )}
            </div>
            
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
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-orange-800 mb-6 flex items-center">
              <span className="mr-3">💳</span>
              Payment Method
            </h2>
            
            <div className="space-y-3">
              <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 bg-orange-50 border-orange-200">
                <input
                  type="radio"
                  name="payment"
                  value="online"
                  checked={paymentMethod === 'online'}
                  onChange={(e) => setPaymentMethod(e.target.value as 'online')}
                  className="mr-3"
                />
                <div>
                  <div className="font-medium">Secure Online Payment via Razorpay</div>
                  <div className="text-sm text-gray-600">Pay securely with Credit/Debit Cards, UPI, Net Banking, Wallets</div>
                  <div className="flex items-center mt-2 space-x-2">
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">✓ Secure</span>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">✓ Instant</span>
                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">✓ Multiple Options</span>
                  </div>
                </div>
              </label>
            </div>

            {/* Payment Methods Showcase */}
            <div className="mt-6 p-4 bg-gradient-to-r from-orange-50 to-pink-50 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                <span className="mr-2">🎯</span>
                Supported Payment Methods
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="flex items-center space-x-2 bg-white p-2 rounded-lg">
                  <div className="w-6 h-4 bg-blue-600 rounded"></div>
                  <span className="text-xs text-gray-700">Cards</span>
                </div>
                <div className="flex items-center space-x-2 bg-white p-2 rounded-lg">
                  <div className="w-6 h-4 bg-green-600 rounded"></div>
                  <span className="text-xs text-gray-700">UPI</span>
                </div>
                <div className="flex items-center space-x-2 bg-white p-2 rounded-lg">
                  <div className="w-6 h-4 bg-purple-600 rounded"></div>
                  <span className="text-xs text-gray-700">Wallets</span>
                </div>
                <div className="flex items-center space-x-2 bg-white p-2 rounded-lg">
                  <div className="w-6 h-4 bg-orange-600 rounded"></div>
                  <span className="text-xs text-gray-700">Net Banking</span>
                </div>
              </div>
              <div className="mt-3 text-xs text-gray-600">
                <span className="font-medium">Popular Options:</span> Visa, Mastercard, RuPay, Google Pay, PhonePe, Paytm, Amazon Pay + 100+ more
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg p-8 sticky top-24">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-orange-800 mb-6 flex items-center">
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
