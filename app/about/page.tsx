'use client'

import { useState } from 'react'

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState('story')

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Cat Theme */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 rounded-full mb-4">
            <span className="text-3xl">🐱</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            About CozyCatKitchen
          </h1>
          <p className="text-xl text-gray-600">
            Where every meal tells a story and every cat purrs with delight! 🐾
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Tab Navigation */}
          <div className="flex flex-wrap space-x-1 mb-8 border-b border-orange-200">
            <button
              onClick={() => setActiveTab('story')}
              className={`px-6 py-3 font-semibold transition-colors rounded-t-lg ${
                activeTab === 'story' 
                  ? 'text-orange-600 bg-orange-50 border-b-2 border-orange-600' 
                  : 'text-gray-500 hover:text-orange-600 hover:bg-orange-50'
              }`}
            >
              📖 Our Story
            </button>
            <button
              onClick={() => setActiveTab('mission')}
              className={`px-6 py-3 font-semibold transition-colors rounded-t-lg ${
                activeTab === 'mission' 
                  ? 'text-orange-600 bg-orange-50 border-b-2 border-orange-600' 
                  : 'text-gray-500 hover:text-orange-600 hover:bg-orange-50'
              }`}
            >
              🎯 Mission
            </button>
            <button
              onClick={() => setActiveTab('team')}
              className={`px-6 py-3 font-semibold transition-colors rounded-t-lg ${
                activeTab === 'team' 
                  ? 'text-orange-600 bg-orange-50 border-b-2 border-orange-600' 
                  : 'text-gray-500 hover:text-orange-600 hover:bg-orange-50'
              }`}
            >
              👥 Our Team
            </button>
          </div>

          {/* Tab Content */}
          <div className="mt-8">
            {activeTab === 'story' && (
              <div className="space-y-8 animate-fade-in">
                <div className="bg-orange-50 rounded-lg p-6">
                  <h2 className="text-2xl font-bold text-orange-800 mb-4 flex items-center">
                    <span className="mr-3">📖</span>
                    The Purrfect Beginning
                  </h2>
                  <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div className="space-y-4">
                      <div className="text-6xl mb-4">🐱</div>
                      <p className="text-gray-700">
                        It all started with a simple dream: creating meals that would make even the pickiest cats purr with delight. Our founder, Sarah, believed that every cat deserved food that was made with the same love and care as human food.
                      </p>
                      <p className="text-gray-700">
                        What began as experiments in her home kitchen quickly grew into a passion project. Her own cats, Whiskers and Mittens, became the official taste-testers, giving their approval through enthusiastic purrs and empty bowls.
                      </p>
                    </div>
                    <div className="space-y-4">
                      <h3 className="font-semibold text-orange-700 mb-2 flex items-center">
                        <span className="mr-2">🍽️</span>
                        Quality Ingredients
                      </h3>
                      <p className="text-gray-700">
                        We source only the finest ingredients - free-range chicken, fresh vegetables, and herbs that cats would love if they could shop for themselves!
                      </p>
                      <div className="bg-white rounded-lg p-4 mt-4">
                        <h4 className="font-semibold text-gray-800 mb-2">Our Kitchen Philosophy</h4>
                        <ul className="space-y-2 text-gray-600">
                          <li className="flex items-center">
                            <span className="text-orange-500 mr-2">✓</span>
                            Fresh ingredients, never frozen
                          </li>
                          <li className="flex items-center">
                            <span className="text-orange-500 mr-2">✓</span>
                            No artificial preservatives
                          </li>
                          <li className="flex items-center">
                            <span className="text-orange-500 mr-2">✓</span>
                            Cat-approved recipes
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'mission' && (
              <div className="space-y-8 animate-fade-in">
                <div className="bg-purple-50 rounded-lg p-6">
                  <h2 className="text-2xl font-bold text-purple-800 mb-4 flex items-center">
                    <span className="mr-3">🎯</span>
                    Our Mission
                  </h2>
                  <p className="text-gray-700 mb-6">
                    To provide fresh, nutritious, and delicious meals that make every cat feel loved and cared for, one purr at a time.
                  </p>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-lg p-4">
                      <h3 className="font-semibold text-purple-700 mb-2 flex items-center">
                        <span className="mr-2">🐾</span>
                        Cat-Approved Recipes
                      </h3>
                      <p className="text-gray-600">
                        Every recipe is taste-tested by our panel of feline food critics. We've perfected the art of the gentle simmer and the aromatic bake to create meals that satisfy both human and cat palates.
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <h3 className="font-semibold text-purple-700 mb-2 flex items-center">
                        <span className="mr-2">🌈</span>
                        Happy Customers
                      </h3>
                      <p className="text-gray-600">
                        Your satisfaction is our top priority. We're not happy until you and your cats are completely satisfied with every order.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'team' && (
              <div className="space-y-8 animate-fade-in">
                <div className="bg-green-50 rounded-lg p-6">
                  <h2 className="text-2xl font-bold text-green-800 mb-4 flex items-center">
                    <span className="mr-3">👥</span>
                    The Kitchen Crew
                  </h2>
                  <p className="text-gray-700 mb-6">
                    Meet the passionate team behind CozyCatKitchen - humans and cats working together!
                  </p>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-lg p-6 text-center">
                      <div className="w-20 h-20 bg-orange-200 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">👩‍🍳</span>
                      </div>
                      <h3 className="font-semibold text-gray-800">Sarah</h3>
                      <p className="text-sm text-gray-600 mb-2">Founder & Head Chef</p>
                      <p className="text-xs text-gray-500">Cat mom to Whiskers & Mittens</p>
                    </div>
                    <div className="bg-white rounded-lg p-6 text-center">
                      <div className="w-20 h-20 bg-pink-200 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">👨‍🍳</span>
                      </div>
                      <h3 className="font-semibold text-gray-800">Mike</h3>
                      <p className="text-sm text-gray-600 mb-2">Master Baker</p>
                      <p className="text-xs text-gray-500">Treat specialist</p>
                    </div>
                    <div className="bg-white rounded-lg p-6 text-center">
                      <div className="w-20 h-20 bg-purple-200 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">😸</span>
                      </div>
                      <h3 className="font-semibold text-gray-800">Lisa</h3>
                      <p className="text-sm text-gray-600 mb-2">Cat Nutritionist</p>
                      <p className="text-xs text-gray-500">Health & wellness expert</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  )
}
