'use client'

import Link from 'next/link'
import { ShoppingCart, Menu, X, Package, User, LogOut } from 'lucide-react'
import { useState } from 'react'
import { useCartStore } from '@/lib/store/cart'
import { useAuth } from '@/contexts/AuthContext'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const totalItems = useCartStore(state => state.getTotalItems())
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">CC</span>
            </div>
            <span className="font-bold text-xl text-gray-900">CozyCatKitchen</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/products" className="text-gray-700 hover:text-orange-500 transition-colors">
              Products
            </Link>
            <Link href="/track-order" className="text-gray-700 hover:text-orange-500 transition-colors flex items-center gap-1">
              <Package className="w-4 h-4" />
              Track Order
            </Link>
            {user ? (
              <>
                {(user.email?.includes('aditya01889@gmail.com') || user.email?.includes('admin')) && (
                  <Link href="/admin/products" className="text-gray-700 hover:text-orange-500 transition-colors flex items-center gap-1">
                    <Package className="w-4 h-4" />
                    Admin
                  </Link>
                )}
                <Link href="/profile" className="text-gray-700 hover:text-orange-500 transition-colors flex items-center gap-1">
                  <User className="w-4 h-4" />
                  Profile
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-gray-700 hover:text-orange-500 transition-colors flex items-center gap-1"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <Link href="/auth" className="text-gray-700 hover:text-orange-500 transition-colors flex items-center gap-1">
                <User className="w-4 h-4" />
                Sign In
              </Link>
            )}
            <Link href="/cart" className="relative p-2 text-gray-700 hover:text-orange-500 transition-colors">
              <ShoppingCart className="w-6 h-6" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-700 hover:text-orange-500 hover:bg-gray-100"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-2 border-t">
            <Link
              href="/products"
              className="block px-3 py-2 text-gray-700 hover:text-orange-500 hover:bg-gray-100 rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              Products
            </Link>
            <Link
              href="/track-order"
              className="block px-3 py-2 text-gray-700 hover:text-orange-500 hover:bg-gray-100 rounded-md flex items-center gap-2"
              onClick={() => setIsMenuOpen(false)}
            >
              <Package className="w-4 h-4" />
              Track Order
            </Link>
            {user ? (
              <>
                {user.email?.includes('aditya01889@gmail.com') || user.email?.includes('admin') && (
                  <Link
                    href="/admin/products"
                    className="block px-3 py-2 text-gray-700 hover:text-orange-500 hover:bg-gray-100 rounded-md flex items-center gap-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Package className="w-4 h-4" />
                    Admin
                  </Link>
                )}
                <Link
                  href="/profile"
                  className="block px-3 py-2 text-gray-700 hover:text-orange-500 hover:bg-gray-100 rounded-md flex items-center gap-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="w-4 h-4" />
                  Profile
                </Link>
                <button
                  onClick={() => {
                    handleSignOut()
                    setIsMenuOpen(false)
                  }}
                  className="block w-full text-left px-3 py-2 text-gray-700 hover:text-orange-500 hover:bg-gray-100 rounded-md flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/auth"
                className="block px-3 py-2 text-gray-700 hover:text-orange-500 hover:bg-gray-100 rounded-md flex items-center gap-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <User className="w-4 h-4" />
                Sign In
              </Link>
            )}
            <Link
              href="/cart"
              className="block px-3 py-2 text-gray-700 hover:text-orange-500 hover:bg-gray-100 rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              Cart {totalItems > 0 && `(${totalItems})`}
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
