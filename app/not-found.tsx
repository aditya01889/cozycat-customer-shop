'use client';

import Link from 'next/link';
import { Home, Search, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        {/* Cat Icon */}
        <div className="mb-8">
          <div className="w-32 h-32 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-6xl">🐱‍👤</span>
          </div>
          <h1 className="text-6xl font-bold text-orange-600 mb-2">404</h1>
        </div>

        {/* Error Message */}
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Page Ran Away! 🐾
        </h2>
        
        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
          The page you're looking for seems to have wandered off. 
          Even our best cats can't find it right now!
        </p>

        {/* Recovery Instructions */}
        <div className="bg-orange-50 rounded-lg p-6 mb-8">
          <h3 className="font-semibold text-orange-800 mb-3">What can you do?</h3>
          <ul className="text-left text-orange-700 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-orange-500 mt-1">•</span>
              <span>Check the URL for typos or errors</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-500 mt-1">•</span>
              <span>Use the search bar to find what you need</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-500 mt-1">•</span>
              <span>Browse our delicious cat food products</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-500 mt-1">•</span>
              <span>Return to the homepage and start fresh</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-8 py-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
          >
            <Home className="w-5 h-5" />
            Go Home
          </Link>
          
          <Link
            href="/products"
            className="flex items-center justify-center gap-2 px-8 py-4 bg-white text-orange-600 border-2 border-orange-500 rounded-lg hover:bg-orange-50 transition-colors font-medium text-lg"
          >
            <Search className="w-5 h-5" />
            Browse Products
          </Link>
        </div>

        {/* Popular Links */}
        <div className="mt-12">
          <h3 className="text-sm font-semibold text-gray-500 mb-4">Popular Pages</h3>
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              href="/products" 
              className="text-orange-600 hover:text-orange-700 underline text-sm"
            >
              Fresh Cat Food
            </Link>
            <Link 
              href="/track-order" 
              className="text-orange-600 hover:text-orange-700 underline text-sm"
            >
              Track Order
            </Link>
            <Link 
              href="/contact" 
              className="text-orange-600 hover:text-orange-700 underline text-sm"
            >
              Contact Us
            </Link>
            <Link 
              href="/about" 
              className="text-orange-600 hover:text-orange-700 underline text-sm"
            >
              About Us
            </Link>
          </div>
        </div>

        {/* Fun Message */}
        <div className="mt-8 text-sm text-gray-500 italic">
          "Every cat has its favorite hiding spot. This page found a really good one!"
        </div>
      </div>
    </div>
  );
}
