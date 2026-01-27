export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Cat Theme */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 rounded-full mb-4">
            <span className="text-3xl">📜</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-lg text-gray-600">
            Our purr-fect agreement for happy cats and happy humans! 🐾
          </p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="space-y-8">
            <section className="bg-orange-50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-orange-800 mb-4 flex items-center">
                <span className="mr-3">✅</span>
                1. Acceptance of Terms
              </h2>
              <p className="text-gray-700">
                By accessing and using CozyCatKitchen, you accept and agree to be bound by the terms 
                and provision of this agreement. It's like when your cat accepts treats - no takebacks! 😸
              </p>
            </section>

            <section className="bg-pink-50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-pink-800 mb-4 flex items-center">
                <span className="mr-3">🍽️</span>
                2. Products and Services
              </h2>
              <p className="text-gray-700 mb-4">CozyCatKitchen offers:</p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <span className="text-pink-500 mt-1">🐟</span>
                  <span className="text-gray-700">Fresh, made-to-order cat food and treats</span>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-pink-500 mt-1">🚚</span>
                  <span className="text-gray-700">Delivery services within specified areas</span>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-pink-500 mt-1">📍</span>
                  <span className="text-gray-700">Order tracking and customer support</span>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-pink-500 mt-1">🥘</span>
                  <span className="text-gray-700">Product customization based on dietary needs</span>
                </div>
              </div>
            </section>

            <section className="bg-purple-50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-purple-800 mb-4 flex items-center">
                <span className="mr-3">💳</span>
                3. Ordering and Payment
              </h2>
              <p className="text-gray-700 mb-4">When placing an order:</p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <span className="text-purple-500 mt-1">📝</span>
                  <span className="text-gray-700">Provide accurate contact and delivery information</span>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-purple-500 mt-1">💰</span>
                  <span className="text-gray-700">Payment is required at the time of order placement</span>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-purple-500 mt-1">🔄</span>
                  <span className="text-gray-700">We accept secure online payments through Razorpay including Credit/Debit Cards, UPI, Net Banking, and Digital Wallets</span>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-purple-500 mt-1">📈</span>
                  <span className="text-gray-700">Prices are subject to change without notice</span>
                </div>
              </div>
            </section>

            <section className="bg-yellow-50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-yellow-800 mb-4 flex items-center">
                <span className="mr-3">🚚</span>
                4. Delivery
              </h2>
              <p className="text-gray-700 mb-4">Delivery terms:</p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <span className="text-yellow-600 mt-1">⏰</span>
                  <span className="text-gray-700">Orders are typically delivered within 2-4 days</span>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-yellow-600 mt-1">📍</span>
                  <span className="text-gray-700">Delivery times may vary based on location and order volume</span>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-yellow-600 mt-1">🏠</span>
                  <span className="text-gray-700">Someone must be available to receive the delivery</span>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-yellow-600 mt-1">📞</span>
                  <span className="text-gray-700">We will call to confirm delivery details</span>
                </div>
              </div>
            </section>

            <section className="bg-green-50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-green-800 mb-4 flex items-center">
                <span className="mr-3">🔄</span>
                5. Returns and Refunds
              </h2>
              <p className="text-gray-700 mb-4">Our return policy:</p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <span className="text-green-600 mt-1">🚫</span>
                  <span className="text-gray-700">Fresh food products cannot be returned once delivered</span>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-green-600 mt-1">💵</span>
                  <span className="text-gray-700">Refunds may be issued for quality issues or delivery problems</span>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-green-600 mt-1">⏱️</span>
                  <span className="text-gray-700">Please contact us within 24 hours of delivery for any issues</span>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-green-600 mt-1">🔍</span>
                  <span className="text-gray-700">We reserve the right to evaluate each refund request individually</span>
                </div>
              </div>
            </section>

            <section className="bg-blue-50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-blue-800 mb-4 flex items-center">
                <span className="mr-3">✨</span>
                6. Product Quality
              </h2>
              <p className="text-gray-700">
                All our products are made fresh to order using high-quality ingredients. 
                We follow strict food safety standards and ensure proper handling and storage 
                throughout the delivery process. Your cat's satisfaction is our top priority! 
                We test all recipes on the pickiest cats first! 😺
              </p>
            </section>

            <section className="bg-indigo-50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-indigo-800 mb-4 flex items-center">
                <span className="mr-3">👤</span>
                7. User Responsibilities
              </h2>
              <p className="text-gray-700 mb-4">As a user, you agree to:</p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <span className="text-indigo-500 mt-1">📋</span>
                  <span className="text-gray-700">Provide accurate information for orders</span>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-indigo-500 mt-1">🏠</span>
                  <span className="text-gray-700">Ensure proper storage of products after delivery</span>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-indigo-500 mt-1">📖</span>
                  <span className="text-gray-700">Follow feeding guidelines for your pets</span>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-indigo-500 mt-1">🚫</span>
                  <span className="text-gray-700">Not misuse our services or website</span>
                </div>
              </div>
            </section>

            <section className="bg-red-50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-red-800 mb-4 flex items-center">
                <span className="mr-3">⚖️</span>
                8. Limitation of Liability
              </h2>
              <p className="text-gray-700">
                CozyCatKitchen shall not be liable for any indirect, incidental, or consequential 
                damages arising from the use of our products or services. We're not responsible 
                if your cat becomes too demanding after trying our food! 😸
              </p>
            </section>

            <section className="bg-teal-50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-teal-800 mb-4 flex items-center">
                <span className="mr-3">📞</span>
                9. Contact Information
              </h2>
              <p className="text-gray-700 mb-4">
                For questions about these Terms of Service, please contact us:
              </p>
              <div className="grid md:grid-cols-2 gap-4 text-center">
                <div className="bg-white rounded-lg p-4">
                  <span className="text-2xl mb-2 block">📧</span>
                  <p className="font-semibold text-gray-800">Email</p>
                  <p className="text-sm text-gray-600">cozycatkitchen@gmail.com</p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <span className="text-2xl mb-2 block">�</span>
                  <p className="font-semibold text-gray-800">WhatsApp</p>
                  <a 
                    href="https://wa.me/919873648122"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-green-600 hover:text-green-700 hover:underline"
                  >
                    +91-98736-48122
                  </a>
                </div>
              </div>
            </section>

            <section className="border-t pt-6 text-center">
              <p className="text-sm text-gray-500">
                <span className="inline-block mr-2">🐾</span>
                <strong>Last updated:</strong> {new Date().toLocaleDateString()}
                <span className="inline-block ml-2">🐾</span>
              </p>
              <p className="text-xs text-gray-400 mt-2">
                These terms may be updated periodically. Continued use of our services constitutes 
                acceptance of any changes. Just like how cats accept treats - enthusiastically! 😸
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
