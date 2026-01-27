'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function Hero() {
  const [currentCatIndex, setCurrentCatIndex] = useState(0)
  const catEmojis = ['🐱', '🐈', '😸', '😺', '😻', '🐾', '🐈‍⬛', '🐱‍👓', '🐱‍🏃']

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCatIndex((prev) => (prev + 1) % catEmojis.length)
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const currentCat = catEmojis[currentCatIndex]

  return (
    <section className="relative bg-gradient-to-br from-orange-400 via-pink-300 to-yellow-200 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-10 -left-10 w-20 h-20 bg-orange-300 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-10 right-10 w-16 h-16 bg-yellow-300 rounded-full opacity-30 animate-bounce"></div>
        <div className="absolute bottom-10 left-20 w-24 h-24 bg-pink-300 rounded-full opacity-20 animate-ping"></div>
        <div className="absolute top-20 right-20 w-32 h-32 bg-orange-200 rounded-full opacity-10 animate-spin"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
                <span className="inline-block animate-pulse">{currentCat}</span>
                CozyCatKitchen
              </h1>
              <p className="text-xl text-gray-600 mb-6">
                Where every meal is made with 
                <span className="text-orange-500 font-semibold"> love </span>
                and 
                <span className="text-pink-500 font-semibold"> purry </span>
              </p>
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Fresh, Homemade, Cat-Approved! 🐾
              </h2>
              <p className="text-gray-600 mb-8">
                Delicious meals prepared with the finest ingredients for your feline friends. 
                Each recipe is taste-tested by our pickiest eaters!
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/products"
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-lg font-semibold transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  🍽️ Browse Meals
                </Link>
                
                <a
                  href="https://wa.me/919873648122"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-lg font-semibold transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl text-center"
                >
                  � WhatsApp Order
                </a>
              </div>
            </div>
          </div>

          {/* Right Content - Cat Illustration */}
          <div className="hidden lg:block">
            <div className="relative">
              <div className="text-8xl animate-bounce">
                😺
              </div>
              <div className="absolute -bottom-4 left-1/2 transform translate-x-1/4">
                <div className="w-4 h-4 bg-orange-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-orange-300 rounded-full animate-ping"></div>
              </div>
              <div className="absolute -bottom-2 left-1/2 transform translate-x-1/4">
                <div className="w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
                <div className="w-2 h-2 bg-yellow-300 rounded-full animate-ping"></div>
              </div>
            </div>
          </div>
        </div>

      {/* Floating Cat Elements */}
      <div className="absolute top-4 right-4 text-2xl animate-pulse">
        🐾
      </div>
      <div className="absolute bottom-4 left-4 text-xl animate-bounce">
        🐾
      </div>
      </div>
    </section>
  )
}
