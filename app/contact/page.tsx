'use client'

import { useState } from 'react'
import { useToast } from '@/components/Toast/ToastProvider'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })
  const { showSuccess } = useToast()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Contact form submitted:', formData)
    // TODO: Implement actual contact form submission
    showSuccess('Thank you for your message! We\'ll get back to you soon. 🐾')
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Cat Theme */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 rounded-full mb-4">
            <span className="text-3xl">📧</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Get in Touch
          </h1>
          <p className="text-xl text-gray-600">
            We'd love to hear from you (and your cats)! 🐾
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-orange-800 mb-6 flex items-center">
                <span className="mr-3">📝</span>
                Send us a Message
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Tell us about your experience with CozyCatKitchen..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-300 transform hover:scale-105"
                >
                  📧 Send Message
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-orange-800 mb-6 flex items-center">
                <span className="mr-3">📞</span>
                Contact Information
              </h2>
              
              <div className="space-y-4">
                <div className="bg-orange-50 rounded-lg p-6">
                  <h3 className="font-semibold text-orange-700 mb-4 flex items-center">
                    <span className="mr-2">🏠</span>
                    Visit Our Kitchen
                  </h3>
                  <div className="space-y-2 text-gray-700">
                    <p>CozyCatKitchen Headquarters</p>
                    <p>Jaypee Klassic, Sector 134</p>
                    <p>Noida, Uttar Pradesh - 201304</p>
                    <p className="text-sm text-gray-500">Come say hi to our office cats!</p>
                  </div>
                </div>

                <div className="bg-pink-50 rounded-lg p-6">
                  <h3 className="font-semibold text-pink-700 mb-4 flex items-center">
                    <span className="mr-2">⏰</span>
                    Business Hours
                  </h3>
                  <div className="space-y-2 text-gray-700">
                    <div className="flex justify-between">
                      <span>Monday - Friday</span>
                      <span>9:00 AM - 6:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Saturday</span>
                      <span>10:00 AM - 4:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sunday</span>
                      <span>Closed (Cat nap day! 😴)</span>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-6">
                  <h3 className="font-semibold text-purple-700 mb-4 flex items-center">
                    <span className="mr-2">📱</span>
                    Get in Touch
                  </h3>
                  <div className="space-y-3">
                    <a
                      href="mailto:cozycatkitchen@gmail.com"
                      className="flex items-center text-orange-500 hover:text-orange-600 transition-colors"
                    >
                      <span className="mr-2">📧</span>
                      cozycatkitchen@gmail.com
                    </a>
                    <a
                      href="https://wa.me/919873648122"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-green-600 hover:text-green-700 transition-colors"
                    >
                      <span className="mr-2">💬</span>
                      +91-98736-48122 (WhatsApp)
                    </a>
                  </div>
                </div>
              </div>

              {/* Cat Illustration */}
              <div className="text-center mt-8">
                <div className="text-6xl mb-4">😺</div>
                <p className="text-gray-600">
                  Our customer service team is powered by cat purrs and coffee! ☕
                </p>
                <div className="flex justify-center space-x-2 mt-4">
                  <span className="text-2xl animate-pulse">🐾</span>
                  <span className="text-2xl animate-bounce" style={{ animationDelay: '0.2s' }}>🐾</span>
                  <span className="text-2xl animate-ping" style={{ animationDelay: '0.4s' }}>🐾</span>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="mr-3">❓</span>
              Frequently Asked Questions
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                  <span className="mr-2">🍽️</span>
                  How do I place an order?
                </h3>
                <p className="text-sm text-gray-600">
                  Simply browse our products, add to cart, and checkout. We'll confirm your order via WhatsApp!
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                  <span className="mr-2">🚚</span>
                  How long does delivery take?
                </h3>
                <p className="text-sm text-gray-600">
                  Orders are typically delivered within 2-4 days. We'll call to confirm the exact time!
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                  <span className="mr-2">💰</span>
                  What payment methods do you accept?
                </h3>
                <p className="text-sm text-gray-600">
                  We accept secure online payments through Razorpay including Credit/Debit Cards, UPI, Net Banking, and Digital Wallets.
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                  <span className="mr-2">🐱</span>
                  Can I customize my order?
                </h3>
                <p className="text-sm text-gray-600">
                  Yes! We can accommodate dietary restrictions and special requests. Just ask!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
