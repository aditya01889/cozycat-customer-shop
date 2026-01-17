'use client'

import Link from 'next/link'
import { ShoppingCart, Menu, X, Package, User, LogOut } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useCartStore } from '@/lib/store/cart'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase/client'
import ProductSearch from '@/components/ProductSearch'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [role, setRole] = useState<string | null>(null)
  const totalItems = useCartStore(state => state.getTotalItems())
  const { user, signOut } = useAuth()

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    const loadRole = async () => {
      if (!user) {
        setRole(null)
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (error) {
        setRole(null)
        return
      }

      setRole((data as any)?.role ?? null)
    }

    loadRole()
  }, [user])

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <nav className="bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-2xl">🐱</span>
            </div>
            <span className="font-bold text-xl text-white">CozyCatKitchen</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <ProductSearch />
            <Link href="/products" className="text-white hover:text-orange-100 transition-colors flex items-center gap-1">
              <span className="text-lg">🍽️</span>
              Products
            </Link>
            <Link href="/track-order" className="text-white hover:text-orange-100 transition-colors flex items-center gap-1">
              <span className="text-lg">📦</span>
              Track Order
            </Link>
            {user ? (
              <>
                {(user.email?.includes('aditya01889@gmail.com') || user.email?.includes('admin')) && (
                  <Link href="/admin" className="text-white hover:text-orange-100 transition-colors flex items-center gap-1">
                    <span className="text-lg">⚙️</span>
                    Admin
                  </Link>
                )}
                {(role === 'operations' || role === 'admin') && (
                  <Link href="/operations" className="text-white hover:text-orange-100 transition-colors flex items-center gap-1">
                    <span className="text-lg">🏭</span>
                    Operations
                  </Link>
                )}
                <Link href="/profile" className="text-white hover:text-orange-100 transition-colors flex items-center gap-1">
                  <span className="text-lg">👤</span>
                  Profile
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-white hover:text-orange-100 transition-colors flex items-center gap-1"
                >
                  <span className="text-lg">🚪</span>
                  Sign Out
                </button>
              </>
            ) : (
              <Link href="/auth" className="text-white hover:text-orange-100 transition-colors flex items-center gap-1">
                <span className="text-lg">🔑</span>
                Sign In
              </Link>
            )}
            <Link href="/cart" className="relative p-2 text-white hover:text-orange-100 transition-colors">
              <span className="text-2xl">🛒</span>
              {isClient && totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-white hover:text-orange-100 hover:bg-orange-700"
            >
              {isMenuOpen ? <span className="text-2xl">❌</span> : <span className="text-2xl">🐾</span>}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-2 border-t border-orange-400">
            <Link
              href="/products"
              className="block px-3 py-2 text-white hover:text-orange-100 hover:bg-orange-700 rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              <span className="mr-2">🍽️</span>
              Products
            </Link>
            <Link
              href="/track-order"
              className="block px-3 py-2 text-white hover:text-orange-100 hover:bg-orange-700 rounded-md flex items-center gap-2"
              onClick={() => setIsMenuOpen(false)}
            >
              <span className="mr-2">📦</span>
              Track Order
            </Link>
            {user ? (
              <>
                {user.email?.includes('aditya01889@gmail.com') || user.email?.includes('admin') && (
                  <Link
                    href="/admin"
                    className="block px-3 py-2 text-white hover:text-orange-100 hover:bg-orange-700 rounded-md flex items-center gap-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="mr-2">⚙️</span>
                    Admin
                  </Link>
                )}
                {(role === 'operations' || role === 'admin') && (
                  <Link
                    href="/operations"
                    className="block px-3 py-2 text-white hover:text-orange-100 hover:bg-orange-700 rounded-md flex items-center gap-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="mr-2">🏭</span>
                    Operations
                  </Link>
                )}
                <Link
                  href="/profile"
                  className="block px-3 py-2 text-white hover:text-orange-100 hover:bg-orange-700 rounded-md flex items-center gap-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="mr-2">👤</span>
                  Profile
                </Link>
                <button
                  onClick={() => {
                    handleSignOut()
                    setIsMenuOpen(false)
                  }}
                  className="block w-full text-left px-3 py-2 text-white hover:text-orange-100 hover:bg-orange-700 rounded-md flex items-center gap-2"
                >
                  <span className="mr-2">🚪</span>
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/auth"
                className="block px-3 py-2 text-white hover:text-orange-100 hover:bg-orange-700 rounded-md flex items-center gap-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="mr-2">🔑</span>
                Sign In
              </Link>
            )}
            <Link
              href="/cart"
              className="block px-3 py-2 text-white hover:text-orange-100 hover:bg-orange-700 rounded-md flex items-center gap-2"
              onClick={() => setIsMenuOpen(false)}
            >
              <span className="mr-2">🛒</span>
              Cart {isClient && totalItems > 0 && `(${totalItems})`}
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
