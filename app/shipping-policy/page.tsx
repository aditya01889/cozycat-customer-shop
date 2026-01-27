export default function ShippingPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 py-12">
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
        
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="space-y-8">
            <section className="bg-orange-50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-orange-800 mb-4 flex items-center">
                <span className="mr-3">📍</span>
                Delivery Areas
              </h2>
              <div className="space-y-4">
                <p className="text-gray-700">
                  We currently deliver fresh cat food to the following areas:
                </p>
                <div className="bg-white rounded-lg p-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">🏙️ Delhi NCR</h3>
                      <ul className="text-gray-600 space-y-1">
                        <li>• Delhi (All areas)</li>
                        <li>• Gurgaon (Gurugram)</li>
                        <li>• Noida</li>
                        <li>• Ghaziabad</li>
                        <li>• Faridabad</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">🌆 Other Cities</h3>
                      <ul className="text-gray-600 space-y-1">
                        <li>• Mumbai (Limited areas)</li>
                        <li>• Bengaluru (Limited areas)</li>
                        <li>• Pune (Limited areas)</li>
                        <li>• Hyderabad (Limited areas)</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 italic">
                  Don't see your area? Contact us - we're expanding our delivery zones!
                </p>
              </div>
            </section>

            <section className="bg-green-50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-green-800 mb-4 flex items-center">
                <span className="mr-3">⏰</span>
                Delivery Timeframes
              </h2>
              <div className="space-y-4">
                <p className="text-gray-700">
                  Since we prepare food fresh after ordering, delivery times vary:
                </p>
                <div className="bg-white rounded-lg p-4 space-y-3">
                  <div className="flex items-start space-x-3">
                    <span className="text-green-500 mt-1">🍽️</span>
                    <div>
                      <p className="font-semibold text-gray-800">Complete Meals</p>
                      <p className="text-gray-600">Within 2-4 hours after preparation</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-green-500 mt-1">🥣</span>
                    <div>
                      <p className="font-semibold text-gray-800">Nutritious Broths</p>
                      <p className="text-gray-600">Within 1-2 hours after preparation</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-green-500 mt-1">🍪</span>
                    <div>
                      <p className="font-semibold text-gray-800">Healthy Treats</p>
                      <p className="text-gray-600">Within 4-6 hours (baking time included)</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-green-500 mt-1">🧁</span>
                    <div>
                      <p className="font-semibold text-gray-800">Celebration Bakes</p>
                      <p className="text-gray-600">Within 6-8 hours (custom baking time)</p>
                    </div>
                  </div>
                </div>
                <div className="bg-yellow-100 rounded-lg p-4">
                  <p className="text-yellow-800 font-medium">
                    ⚠️ Order before 6 PM for same-day delivery. Orders after 6 PM will be delivered next day.
                  </p>
                </div>
              </div>
            </section>

            <section className="bg-blue-50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-blue-800 mb-4 flex items-center">
                <span className="mr-3">💰</span>
                Delivery Charges
              </h2>
              <div className="space-y-4">
                <p className="text-gray-700">
                  Our delivery charges are based on distance and order value:
                </p>
                <div className="bg-white rounded-lg p-4 space-y-3">
                  <div className="flex items-start space-x-3">
                    <span className="text-blue-500 mt-1">🆓</span>
                    <div>
                      <p className="font-semibold text-gray-800">Free Delivery</p>
                      <p className="text-gray-600">Orders above ₹500 within Delhi NCR</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-blue-500 mt-1">💵</span>
                    <div>
                      <p className="font-semibold text-gray-800">Standard Delivery</p>
                      <p className="text-gray-600">₹40 for orders below ₹500 (Delhi NCR)</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-blue-500 mt-1">🚀</span>
                    <div>
                      <p className="font-semibold text-gray-800">Express Delivery</p>
                      <p className="text-gray-600">₹80 extra for delivery within 1 hour (select areas only)</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-blue-500 mt-1">🌆</span>
                    <div>
                      <p className="font-semibold text-gray-800">Other Cities</p>
                      <p className="text-gray-600">₹80-120 based on distance and order value</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-purple-50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-purple-800 mb-4 flex items-center">
                <span className="mr-3">🧊</span>
                Freshness & Packaging
              </h2>
              <div className="space-y-4">
                <p className="text-gray-700">
                  We ensure maximum freshness during delivery:
                </p>
                <div className="bg-white rounded-lg p-4 space-y-3">
                  <div className="flex items-start space-x-3">
                    <span className="text-purple-500 mt-1">🥡</span>
                    <p className="text-gray-700">Food-grade, airtight containers to maintain freshness</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-purple-500 mt-1">🧊</span>
                    <p className="text-gray-700">Ice packs for perishable items during warm weather</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-purple-500 mt-1">🏷️</span>
                    <p className="text-gray-700">Clear labeling with preparation time and best-before instructions</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-purple-500 mt-1">♻️</span>
                    <p className="text-gray-700">Eco-friendly packaging materials</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-pink-50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-pink-800 mb-4 flex items-center">
                <span className="mr-3">📦</span>
                Order Tracking
              </h2>
              <div className="space-y-4">
                <p className="text-gray-700">
                  Stay updated on your order status:
                </p>
                <div className="bg-white rounded-lg p-4 space-y-3">
                  <div className="flex items-start space-x-3">
                    <span className="text-pink-500 mt-1">📱</span>
                    <p className="text-gray-700">Real-time WhatsApp updates on order preparation and delivery</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-pink-500 mt-1">📍</span>
                    <p className="text-gray-700">Live tracking link once delivery partner is assigned</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-pink-500 mt-1">📞</span>
                    <p className="text-gray-700">Direct contact with delivery partner for specific instructions</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-yellow-50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-yellow-800 mb-4 flex items-center">
                <span className="mr-3">⚠️</span>
                Important Delivery Notes
              </h2>
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 space-y-3">
                  <div className="flex items-start space-x-3">
                    <span className="text-yellow-500 mt-1">🏠</span>
                    <p className="text-gray-700">Someone must be available to receive the order - we cannot leave food unattended</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-yellow-500 mt-1">🌧️</span>
                    <p className="text-gray-700">During heavy rain or extreme weather, delivery may be delayed for safety</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-yellow-500 mt-1">📞</span>
                    <p className="text-gray-700">Please keep your phone accessible - delivery partner will call before arrival</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-yellow-500 mt-1">🕐</span>
                    <p className="text-gray-700">Delivery timing may vary during peak hours (6-9 PM)</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-green-50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-green-800 mb-4 flex items-center">
                <span className="mr-3">🎁</span>
                Special Delivery Services
              </h2>
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 space-y-3">
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
