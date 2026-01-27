export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Cat Theme */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 rounded-full mb-4">
            <span className="text-3xl">🔒</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-lg text-gray-600">
            Your trust is important to us and your feline friends! 🐾
          </p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="space-y-8">
            <section className="bg-orange-50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-orange-800 mb-4 flex items-center">
                <span className="mr-3">📝</span>
                Information We Collect
              </h2>
              <p className="text-gray-700 mb-4">We collect information you provide directly to us, such as when you:</p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <span className="text-orange-500 mt-1">🐱</span>
                  <span className="text-gray-700">Create an account or place an order</span>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-orange-500 mt-1">📧</span>
                  <span className="text-gray-700">Provide contact information</span>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-orange-500 mt-1">🏠</span>
                  <span className="text-gray-700">Provide delivery address</span>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-orange-500 mt-1">💬</span>
                  <span className="text-gray-700">Communicate with customer service</span>
                </div>
              </div>
            </section>

            <section className="bg-pink-50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-pink-800 mb-4 flex items-center">
                <span className="mr-3">🎯</span>
                How We Use Your Information
              </h2>
              <p className="text-gray-700 mb-4">We use the information we collect to:</p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <span className="text-pink-500 mt-1">🍽️</span>
                  <span className="text-gray-700">Process and fulfill your orders</span>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-pink-500 mt-1">🤝</span>
                  <span className="text-gray-700">Provide customer support</span>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-pink-500 mt-1">📨</span>
                  <span className="text-gray-700">Send order confirmations and updates</span>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-pink-500 mt-1">✨</span>
                  <span className="text-gray-700">Improve our products and services</span>
                </div>
              </div>
            </section>

            <section className="bg-purple-50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-purple-800 mb-4 flex items-center">
                <span className="mr-3">🛡️</span>
                Data Security
              </h2>
              <p className="text-gray-700">
                We implement appropriate security measures to protect your personal information 
                against unauthorized access, alteration, disclosure, or destruction. All payment 
                information is processed securely through our payment partners. Your data is 
                safer than a cat in a sunny spot! 😺
              </p>
            </section>

            <section className="bg-yellow-50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-yellow-800 mb-4 flex items-center">
                <span className="mr-3">🤝</span>
                Third-Party Services
              </h2>
              <p className="text-gray-700 mb-4">We use third-party services to operate our business, including:</p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <span className="text-yellow-600 mt-1">💳</span>
                  <span className="text-gray-700">Payment processors for secure transactions</span>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-yellow-600 mt-1">🚚</span>
                  <span className="text-gray-700">Delivery services for order fulfillment</span>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-yellow-600 mt-1">📊</span>
                  <span className="text-gray-700">Analytics services to improve our website</span>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-yellow-600 mt-1">📧</span>
                  <span className="text-gray-700">Email services for order communications</span>
                </div>
              </div>
            </section>

            <section className="bg-green-50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-green-800 mb-4 flex items-center">
                <span className="mr-3">🔑</span>
                Your Rights
              </h2>
              <p className="text-gray-700 mb-4">You have the right to:</p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <span className="text-green-600 mt-1">👁️</span>
                  <span className="text-gray-700">Access your personal information</span>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-green-600 mt-1">✏️</span>
                  <span className="text-gray-700">Correct inaccurate information</span>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-green-600 mt-1">🗑️</span>
                  <span className="text-gray-700">Delete your account and personal data</span>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-green-600 mt-1">🔕</span>
                  <span className="text-gray-700">Opt out of marketing communications</span>
                </div>
              </div>
            </section>

            <section className="bg-blue-50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-blue-800 mb-4 flex items-center">
                <span className="mr-3">📞</span>
                Contact Us
              </h2>
              <p className="text-gray-700 mb-4">
                If you have any questions about this Privacy Policy, please contact us:
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
                This Privacy Policy may be updated from time to time. Any changes will be posted on this page.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
