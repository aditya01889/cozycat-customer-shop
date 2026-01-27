export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Cat Theme */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 rounded-full mb-4">
            <span className="text-3xl">🔄</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Return & Refund Policy</h1>
          <p className="text-lg text-gray-600">
            Our commitment to happy cats and satisfied customers! 🐾
          </p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="space-y-8">
            <section className="bg-orange-50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-orange-800 mb-4 flex items-center">
                <span className="mr-3">⏰</span>
                Order Cancellation Policy
              </h2>
              <div className="space-y-4">
                <p className="text-gray-700">
                  Since we prepare fresh food after you place an order, we have specific cancellation windows:
                </p>
                <div className="bg-white rounded-lg p-4 space-y-3">
                  <div className="flex items-start space-x-3">
                    <span className="text-green-500 mt-1">✅</span>
                    <div>
                      <p className="font-semibold text-gray-800">Within 2 hours of ordering</p>
                      <p className="text-gray-600">Full refund, no questions asked</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-yellow-500 mt-1">⚠️</span>
                    <div>
                      <p className="font-semibold text-gray-800">2-6 hours after ordering</p>
                      <p className="text-gray-600">50% refund (ingredients already purchased)</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-red-500 mt-1">❌</span>
                    <div>
                      <p className="font-semibold text-gray-800">After 6 hours</p>
                      <p className="text-gray-600">No refund (food preparation already started)</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-pink-50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-pink-800 mb-4 flex items-center">
                <span className="mr-3">🚚</span>
                Delivery Issues
              </h2>
              <div className="space-y-4">
                <p className="text-gray-700">
                  If you encounter any delivery issues, please contact us immediately:
                </p>
                <div className="bg-white rounded-lg p-4 space-y-3">
                  <div className="flex items-start space-x-3">
                    <span className="text-orange-500 mt-1">📦</span>
                    <div>
                      <p className="font-semibold text-gray-800">Wrong order delivered</p>
                      <p className="text-gray-600">Full refund or correct replacement within 24 hours</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-orange-500 mt-1">🕐</span>
                    <div>
                      <p className="font-semibold text-gray-800">Late delivery (beyond 2 hours)</p>
                      <p className="text-gray-600">20% discount on current order</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-orange-500 mt-1">💔</span>
                    <div>
                      <p className="font-semibold text-gray-800">Damaged packaging</p>
                      <p className="text-gray-600">Free replacement or full refund</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-green-50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-green-800 mb-4 flex items-center">
                <span className="mr-3">😺</span>
                Cat Satisfaction Policy
              </h2>
              <div className="space-y-4">
                <p className="text-gray-700">
                  We understand that cats can be picky! Here's our cat satisfaction guarantee:
                </p>
                <div className="bg-white rounded-lg p-4 space-y-3">
                  <div className="flex items-start space-x-3">
                    <span className="text-green-500 mt-1">🍽️</span>
                    <div>
                      <p className="font-semibold text-gray-800">First-time customers</p>
                      <p className="text-gray-600">If your cat refuses the food, contact us within 24 hours for 50% refund on your first order</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-green-500 mt-1">🤢</span>
                    <div>
                      <p className="font-semibold text-gray-800">Allergic reactions</p>
                      <p className="text-gray-600">Full refund if your cat shows any allergic reaction (vet consultation recommended)</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-purple-50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-purple-800 mb-4 flex items-center">
                <span className="mr-3">💰</span>
                Refund Process
              </h2>
              <div className="space-y-4">
                <p className="text-gray-700">
                  How refunds are processed:
                </p>
                <div className="bg-white rounded-lg p-4 space-y-3">
                  <div className="flex items-start space-x-3">
                    <span className="text-purple-500 mt-1">1️⃣</span>
                    <p className="text-gray-700">Contact us via WhatsApp or email within the specified time frame</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-purple-500 mt-1">2️⃣</span>
                    <p className="text-gray-700">Provide order details and reason for refund</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-purple-500 mt-1">3️⃣</span>
                    <p className="text-gray-700">Our team will review and approve within 24 hours</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-purple-500 mt-1">4️⃣</span>
                    <p className="text-gray-700">Refund processed to original payment method within 5-7 business days</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-yellow-50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-yellow-800 mb-4 flex items-center">
                <span className="mr-3">❌</span>
                Non-Refundable Items
              </h2>
              <div className="space-y-4">
                <p className="text-gray-700">
                  The following items are non-refundable:
                </p>
                <div className="bg-white rounded-lg p-4 space-y-2">
                  <div className="flex items-center space-x-3">
                    <span className="text-red-500">✗</span>
                    <span className="text-gray-700">Custom celebration cakes (made specifically for your cat)</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-red-500">✗</span>
                    <span className="text-gray-700">Orders cancelled after 6 hours of placement</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-red-500">✗</span>
                    <span className="text-gray-700">Perishable items that have been partially consumed</span>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-blue-50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-blue-800 mb-4 flex items-center">
                <span className="mr-3">📞</span>
                Contact Us for Refunds
              </h2>
              <div className="space-y-4">
                <p className="text-gray-700">
                  For any refund-related queries, please reach out:
                </p>
                <div className="bg-white rounded-lg p-4 space-y-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-green-500">📱</span>
                    <div>
                      <p className="font-semibold text-gray-800">WhatsApp</p>
                      <p className="text-gray-600"><a href="https://wa.me/919873648122" className="text-green-600 hover:underline">+91-98736-48122</a></p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-blue-500">📧</span>
                    <div>
                      <p className="font-semibold text-gray-800">Email</p>
                      <p className="text-gray-600"><a href="mailto:cozycatkitchen@gmail.com" className="text-blue-600 hover:underline">cozycatkitchen@gmail.com</a></p>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 italic">
                  Please include your order number and contact details for faster processing.
                </p>
              </div>
            </section>

            <div className="bg-gray-100 rounded-lg p-6 text-center">
              <p className="text-gray-700 font-medium">
                This policy is effective from January 27, 2025 and may be updated periodically.
                We reserve the right to modify these terms at any time.
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Last updated: January 27, 2025
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
