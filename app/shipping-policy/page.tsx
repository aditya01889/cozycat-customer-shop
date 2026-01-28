'use client'

import { getShippingPolicySummary } from '@/lib/shipping/config'

export default function ShippingPolicy() {
  const shippingPolicy = getShippingPolicySummary()

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Cat Theme */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 rounded-full mb-4">
            <span className="text-3xl">🚚</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Shipping & Delivery Policy</h1>
          <p className="text-lg text-gray-600">
            Fresh food delivered with care to your doorstep! 🐾
          </p>
        </div>
        
        {/* Shipping Zones */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Local Delivery */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-orange-200">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-2xl">🏠</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-orange-800">
                  {shippingPolicy.local.name}
                </h2>
                <p className="text-gray-600">Express delivery</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                <span className="font-medium">Minimum Order</span>
                <span className="text-xl font-bold text-orange-600">
                  ₹{shippingPolicy.local.minOrder}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="font-medium">Delivery Fee</span>
                <span className="text-lg font-semibold">
                  ₹{shippingPolicy.local.deliveryFee}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <span className="font-medium">Free Delivery Above</span>
                <span className="text-lg font-semibold text-green-600">
                  ₹{shippingPolicy.local.freeAbove}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <span className="font-medium">Estimated Time</span>
                <span className="text-lg font-semibold text-blue-600">
                  {shippingPolicy.local.estimatedDays}
                </span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
              <h3 className="font-semibold text-yellow-800 mb-2">📍 Serviceable Areas:</h3>
              <p className="text-sm text-yellow-700">
                Delhi, Noida, Gurgaon, Ghaziabad, Faridabad, and surrounding areas.
              </p>
            </div>
          </div>

          {/* National Delivery */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-blue-200">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-2xl">🇮🇳</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-blue-800">
                  {shippingPolicy.national.name}
                </h2>
                <p className="text-gray-600">Pan India delivery</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <span className="font-medium">Minimum Order</span>
                <span className="text-xl font-bold text-blue-600">
                  ₹{shippingPolicy.national.minOrder}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="font-medium">Delivery Fee</span>
                <span className="text-lg font-semibold">
                  ₹{shippingPolicy.national.deliveryFee}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <span className="font-medium">Free Delivery Above</span>
                <span className="text-lg font-semibold text-green-600">
                  ₹{shippingPolicy.national.freeAbove}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                <span className="font-medium">Estimated Time</span>
                <span className="text-lg font-semibold text-purple-600">
                  {shippingPolicy.national.estimatedDays}
                </span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
              <h3 className="font-semibold text-indigo-800 mb-2">📍 Serviceable Areas:</h3>
              <p className="text-sm text-indigo-700">
                All metro cities, Tier 1 and Tier 2 cities across India.
              </p>
            </div>
          </div>
        </div>
        
        {/* Important Information */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="mr-3">📋</span>
            Important Information
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-green-600 text-sm">✓</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Fresh Guarantee</h3>
                  <p className="text-sm text-gray-600">
                    All meals are prepared fresh after order confirmation to ensure maximum nutrition and taste.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-blue-600 text-sm">�</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Secure Packaging</h3>
                  <p className="text-sm text-gray-600">
                    Vacuum-sealed packaging with ice packs to maintain freshness during transit.
                  </p>
                </div>
              </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-green-500 mt-1">🎂</span>
                    <div>
                      <p className="font-semibold text-gray-800">Birthday Surprises</p>
                      <p className="text-gray-600">Scheduled delivery with special packaging and birthday message</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-green-500 mt-1">📅</span>
                    <div>
                      <p className="font-semibold text-gray-800">Subscription Orders</p>
                      <p className="text-gray-600">Weekly/bi-weekly delivery with 10% discount on subscription plans</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-green-500 mt-1">🏥</span>
                    <div>
                      <p className="font-semibold text-gray-800">Post-Surgery Care</p>
                      <p className="text-gray-600">Priority delivery for cats recovering from surgery (vet prescription required)</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <div className="bg-gray-100 rounded-lg p-6 text-center">
              <p className="text-gray-700 font-medium">
                For any delivery-related queries or special requirements, please contact us:
              </p>
              <div className="mt-4 space-y-2">
                <p className="text-gray-600">
                  📱 WhatsApp: <a href="https://wa.me/919873648122" className="text-green-600 hover:underline">+91-98736-48122</a>
                </p>
                <p className="text-gray-600">
                  📧 Email: <a href="mailto:cozycatkitchen@gmail.com" className="text-blue-600 hover:underline">cozycatkitchen@gmail.com</a>
                </p>
              </div>
              <p className="text-sm text-gray-600 mt-4 italic">
                This policy is effective from January 27, 2025. Last updated: January 27, 2025
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
