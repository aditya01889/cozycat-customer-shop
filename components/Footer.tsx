'use client'

import { useState } from 'react'

export default function Footer() {
  const [currentYear] = useState(new Date().getFullYear())

  return (
    <footer className="bg-gradient-to-r from-orange-50 to-orange-100 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold mb-4 flex items-center">
              <span className="mr-2">🐱</span>
              CozyCatKitchen
            </h3>
            <p className="text-orange-100">
              Your cozy kitchen for happy cats and delicious meals
            </p>
            <div className="flex space-x-4 text-sm text-orange-100">
              <a href="/products" className="hover:text-white transition-colors">
                🍽️ Meals
              </a>
              <a href="/track-order" className="hover:text-white transition-colors">
                📦 Track Order
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold mb-3">Quick Links</h4>
            <div className="space-y-2 text-sm text-orange-100">
              <a href="/about" className="hover:text-white transition-colors">
                🏪 About Us
              </a>
              <a href="/contact" className="hover:text-white transition-colors">
                📧 Contact
              </a>
              <a href="/auth" className="hover:text-white transition-colors">
                🐾 Account
              </a>
            </div>
          </div>

          {/* Cat Paw Prints */}
          <div className="md:col-span-3 space-y-4">
            <div className="text-center text-orange-100">
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
        <div className="border-t border-orange-200 mt-8 pt-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 md:space-x-8">
              <div className="text-center md:text-left text-orange-100">
                <p className="text-sm">
                  © {currentYear} CozyCatKitchen. All rights reserved.
                </p>
                <p className="text-xs mt-2">
                  🐾 Purrfectly crafted with love for happy cats everywhere
                </p>
              </div>
              
              <div className="flex space-x-6 text-sm text-orange-100">
                <a href="/privacy" className="hover:text-white transition-colors">
                  Privacy
                </a>
                <span className="text-orange-200 mx-2">•</span>
                <a href="/terms" className="hover:text-white transition-colors">
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
