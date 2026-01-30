'use client'

import { useState } from 'react'

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState('story')

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Cat Theme */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 rounded-full mb-4 overflow-hidden">
            <img 
              src="/logo.png" 
              alt="Cozy Cat Kitchen Logo" 
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            About Cozy Cat Kitchen
          </h1>
          <p className="text-xl text-gray-600">
            Where thoughtful meals meet calm curiosity 🐾
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
                    Our Story
                  </h2>
                  <div className="space-y-6">
                    <p className="text-gray-700 text-lg leading-relaxed">
                      At Cozy Cat Kitchen, every meal we prepare comes from a place of calm curiosity, care, and real understanding — just like you'd make for your own family.
                    </p>
                    
                    <p className="text-gray-700 leading-relaxed">
                      It didn't start in a lab or a corporate kitchen. It started in a home kitchen, with two cats who taught us to pay attention — not just to what they ate, but how they ate. Watching them gently explore new flavors, sniffing and inspecting before that first bite, we learned something simple: cats aren't picky — they're aware of what's in their bowl.
                    </p>
                    
                    <p className="text-gray-700 leading-relaxed">
                      That observation became a quiet mission: to make fresh, thoughtful food that feels like a genuine choice — not just something cats eat because it's there, but something they trust.
                    </p>
                    
                    <div className="bg-white rounded-lg p-6 mt-6">
                      <h3 className="font-semibold text-orange-700 mb-4 flex items-center">
                        <span className="mr-2">🍽️</span>
                        Our Kitchen Philosophy
                      </h3>
                      <p className="text-gray-700 mb-4">
                        We began by cooking with ingredients we'd happily eat ourselves — real meat, fresh produce, minimal processing — and never using artificial preservatives, colors, or fillers. Every recipe is handcrafted after you place an order, so nothing sits on shelves waiting to be sold.
                      </p>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <span className="text-orange-500 mr-2">✓</span>
                            <span className="text-gray-600">Real ingredients we'd eat ourselves</span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-orange-500 mr-2">✓</span>
                            <span className="text-gray-600">No artificial preservatives, colors, or fillers</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <span className="text-orange-500 mr-2">✓</span>
                            <span className="text-gray-600">Handcrafted after you place an order</span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-orange-500 mr-2">✓</span>
                            <span className="text-gray-600">Nothing sits on shelves waiting to be sold</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 leading-relaxed italic">
                      Today, Cozy Cat Kitchen is about more than food — it's about giving cat parents a mindful way to nourish their cats with meals that feel like love on a plate.
                    </p>
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
                  <div className="space-y-6">
                    <p className="text-gray-700 text-lg leading-relaxed">
                      Our mission is simple:
                    </p>
                    
                    <blockquote className="text-xl font-medium text-purple-700 italic border-l-4 border-purple-300 pl-4">
                      To bring cats wholesome food that's as honest and calm as their curiosity.
                    </blockquote>
                    
                    <div className="space-y-4">
                      <h3 className="font-semibold text-purple-700 mb-3">We believe:</h3>
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3">
                          <span className="text-purple-500 mt-1">🐾</span>
                          <p className="text-gray-700">cats deserve meals made with real ingredients</p>
                        </div>
                        <div className="flex items-start space-x-3">
                          <span className="text-purple-500 mt-1">🍽️</span>
                          <p className="text-gray-700">food shouldn't compromise quality for convenience</p>
                        </div>
                        <div className="flex items-start space-x-3">
                          <span className="text-purple-500 mt-1">💚</span>
                          <p className="text-gray-700">fresh, slow-cooked meals help support wellbeing and confidence at mealtime</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 mt-6">
                      <p className="text-gray-700 leading-relaxed">
                        We don't chase trends. We don't use buzzwords. We just make food that feels right, because your cat deserves food that's made with the same kind of care you'd put into your own kitchen.
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
                    Our Team
                  </h2>
                  <div className="space-y-6">
                    <p className="text-gray-700 leading-relaxed">
                      Behind Cozy Cat Kitchen is a small team with big hearts — two human cat parents and two feline taste-testers who make sure every recipe feels just right.
                    </p>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-white rounded-lg p-6">
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="w-16 h-16 bg-orange-200 rounded-full flex items-center justify-center">
                            <span className="text-2xl">👩</span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800">Priyanka</h3>
                            <p className="text-sm text-gray-600">Co-Founder & Chief Cat Whisperer</p>
                          </div>
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed">
                          Priyanka brings quiet attention to every detail — from ingredient selection to how meals are presented. She's the calm voice in the kitchen and the one who remembers every cat's preference.
                        </p>
                      </div>
                      
                      <div className="bg-white rounded-lg p-6">
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="w-16 h-16 bg-blue-200 rounded-full flex items-center justify-center">
                            <span className="text-2xl">👨</span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800">Aditya</h3>
                            <p className="text-sm text-gray-600">Co-Founder & Kitchen Craftsman</p>
                          </div>
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed">
                          Aditya leads our kitchen philosophy with gentle precision. His process is deliberate, slow, and mindful — just the way we believe food should be made.
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6">
                      <h3 className="font-semibold text-purple-700 mb-4 flex items-center">
                        <span className="mr-2">😺</span>
                        Official Taste-Testers
                      </h3>
                      <p className="text-gray-700 mb-4">
                        These two aren't just mascots — they set the bar.
                      </p>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-white rounded-lg p-4">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="text-2xl">�</span>
                            <h4 className="font-semibold text-gray-800">Chi</h4>
                          </div>
                          <p className="text-sm text-gray-600">
                            Chi's curiosity makes sure everything smells interesting
                          </p>
                        </div>
                        <div className="bg-white rounded-lg p-4">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="text-2xl">😸</span>
                            <h4 className="font-semibold text-gray-800">Nobita</h4>
                          </div>
                          <p className="text-sm text-gray-600">
                            Nobita's calm, steady approval is the litmus test for every recipe we share
                          </p>
                        </div>
                      </div>
                      <p className="text-gray-700 italic mt-4 text-center">
                        Together, they remind us that cats notice what's in their bowl… and so do we.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Final Note Section */}
            <div className="space-y-8 animate-fade-in">
              <div className="bg-gradient-to-r from-orange-50 to-pink-50 rounded-lg p-6">
                <h2 className="text-2xl font-bold text-orange-800 mb-4 flex items-center">
                  <span className="mr-3">✨</span>
                  Final Note
                </h2>
                <div className="space-y-4">
                  <p className="text-gray-700 leading-relaxed">
                    Cozy Cat Kitchen isn't about being loud or flashy — it's about being thoughtful, honest, and mindful.
                  </p>
                  <p className="text-gray-700 leading-relaxed italic">
                    Because every cat deserves food that feels like it was made just for them — and every parent deserves the peace of mind that comes with it.
                  </p>
                </div>
              </div>
            </div>
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
