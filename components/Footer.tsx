'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'

export default function Footer() {
  const [currentYear] = useState(new Date().getFullYear())
  const { user } = useAuth()

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold mb-4 flex items-center text-white">
              <span className="mr-2">🐱</span>
              CozyCatKitchen
            </h3>
            <p className="text-gray-400">
              Your cozy kitchen for happy cats and delicious meals
            </p>
            <div className="flex space-x-4 text-sm text-gray-400">
              <a href="/about" className="hover:text-orange-400 transition-colors">
                🏪 About Us
              </a>
              <a href="/contact" className="hover:text-orange-400 transition-colors">
                📧 Contact
              </a>
              <a href="/privacy" className="hover:text-orange-400 transition-colors">
                📋 Privacy
              </a>
              <a href="/terms" className="hover:text-orange-400 transition-colors">
                📜 Terms
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold mb-3 text-white">Quick Links</h4>
            <div className="space-y-2 text-sm text-gray-400">
              <a href="/products" className="hover:text-orange-400 transition-colors">
                🍽️ Products
              </a>
              <a href="/track-order" className="hover:text-orange-400 transition-colors">
                📦 Track Order
              </a>
              <Link 
                href={user ? "/profile" : "/auth"} 
                className="hover:text-orange-400 transition-colors"
              >
                🐾 Account
              </Link>
            </div>
          </div>

          {/* Cat Paw Prints */}
          <div className="md:col-span-3 space-y-4">
            <div className="text-center text-gray-400">
              <div className="inline-block">
                <span className="text-2xl">🐾</span>
                <span className="text-xs ml-1">Made with love</span>
              </div>
              <div className="mt-2 text-xs">
                <span className="inline-block">🐾</span>
                <span className="inline-block">🐾</span>
                <span className="inline-block">🐾</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar with Cat Theme */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 md:space-x-8">
              <div className="text-center md:text-left text-gray-400">
                <p className="text-sm">
                  © {currentYear} CozyCatKitchen. All rights reserved.
                </p>
                <p className="text-xs mt-2">
                  🐾 Purrfectly crafted with love for happy cats everywhere
                </p>
              </div>
              
              <div className="flex space-x-6 text-sm text-gray-400">
                <a href="/privacy" className="hover:text-orange-400 transition-colors">
                  Privacy
                </a>
                <span className="text-gray-500 mx-2">•</span>
                <a href="/terms" className="hover:text-orange-400 transition-colors">
                  Terms
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
