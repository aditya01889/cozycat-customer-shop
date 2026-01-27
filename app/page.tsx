import Link from "next/link";
import { ArrowRight, Star, Heart } from "lucide-react";
import { Metadata } from 'next'
import Hero from "@/components/Hero";

export const metadata: Metadata = {
  title: 'Home - Fresh Homemade Cat Food | CozyCatKitchen',
  description: 'Discover fresh, homemade cat food at CozyCatKitchen. Complete meals, nutritious broths, healthy treats, and celebration bakes - all made to order with real ingredients. No preservatives, no fillers.',
  keywords: [
    'fresh cat food',
    'homemade cat food delivery', 
    'natural cat meals',
    'healthy cat treats',
    'cat food online',
    'preservative-free cat food',
    'cozy cat kitchen products'
  ],
  openGraph: {
    title: 'CozyCatKitchen - Fresh Homemade Cat Food for Your Feline Friend',
    description: 'Order fresh, homemade cat food made to order. Complete meals, broths, treats & celebration bakes with real ingredients.',
    url: 'https://cozycatkitchen.vercel.app',
    images: [
      {
        url: '/logo.png',
        width: 400,
        height: 400,
        alt: 'CozyCatKitchen Fresh Cat Food',
      },
    ],
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "CozyCatKitchen",
  "description": "Fresh, homemade cat food made to order with real ingredients. No preservatives, no fillers.",
  "url": "https://cozycatkitchen.vercel.app",
  "logo": "https://cozycatkitchen.vercel.app/logo.png",
  "image": "https://cozycatkitchen.vercel.app/logo.png",
  "telephone": "+91-98736-48122",
  "email": "cozycatkitchen@gmail.com",
  "sameAs": [
    "https://wa.me/919873648122"
  ],
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "IN"
  },
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Cat Food Products",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Product",
          "name": "Complete Meals",
          "description": "Balanced, protein-rich meals for everyday feeding"
        }
      },
      {
        "@type": "Offer", 
        "itemOffered": {
          "@type": "Product",
          "name": "Nutritious Broths",
          "description": "Light, hydrating, and comforting broths"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Product", 
          "name": "Healthy Treats",
          "description": "Baked treats made with care, not chemicals"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Product",
          "name": "Celebration Bakes", 
          "description": "Cupcakes and special treats for special days"
        }
      }
    ]
  }
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="bg-white">
        <Hero />

      {/* Product Categories */}
      <section className="py-20 bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center">
              <span className="mr-3">🐾</span>
              Why Choose Cozy Cat Kitchen
            </h2>
            <p className="text-lg text-gray-600">Thoughtfully prepared meals that cats notice and trust</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 text-center hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">🥘</span>
              </div>
              <h3 className="font-semibold mb-4 text-orange-800 text-lg">Real Ingredients</h3>
              <p className="text-gray-700 leading-relaxed">
                We make fresh, homemade food for cats using simple, real ingredients — the kind you trust.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 text-center hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">⏰</span>
              </div>
              <h3 className="font-semibold mb-4 text-green-800 text-lg">Made Fresh</h3>
              <p className="text-gray-700 leading-relaxed">
                Our meals are cooked in small batches only after you place an order. No artificial preservatives. No long shelf life. Just honest food, made thoughtfully.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 text-center hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">💚</span>
              </div>
              <h3 className="font-semibold mb-4 text-purple-800 text-lg">Happy Cats</h3>
              <p className="text-gray-700 leading-relaxed">
                Many cat parents notice better digestion, steady energy, and calmer mealtimes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Products Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Our Products
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/products?category=meals" className="text-center p-6 hover:shadow-lg transition-all duration-300 rounded-lg block group">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-200 transition-colors">
                <span className="text-3xl">🍽️</span>
              </div>
              <h3 className="font-semibold mb-3 text-gray-800 group-hover:text-orange-600 transition-colors">Complete Meals</h3>
              <p className="text-sm text-gray-600">Balanced, protein-rich meals for everyday feeding.</p>
              <div className="mt-3 text-orange-500 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Shop Now →
              </div>
            </Link>
            
            <Link href="/products?category=broths" className="text-center p-6 hover:shadow-lg transition-all duration-300 rounded-lg block group">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-pink-200 transition-colors">
                <span className="text-3xl">🥣</span>
              </div>
              <h3 className="font-semibold mb-3 text-gray-800 group-hover:text-pink-600 transition-colors">Nutritious Broths</h3>
              <p className="text-sm text-gray-600">Light, hydrating, and comforting — great on their own or mixed.</p>
              <div className="mt-3 text-pink-500 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Shop Now →
              </div>
            </Link>
            
            <Link href="/products?category=cookies" className="text-center p-6 hover:shadow-lg transition-all duration-300 rounded-lg block group">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-yellow-200 transition-colors">
                <span className="text-3xl">🍪</span>
              </div>
              <h3 className="font-semibold mb-3 text-gray-800 group-hover:text-yellow-600 transition-colors">Healthy Treats</h3>
              <p className="text-sm text-gray-600">Baked treats made with care, not chemicals.</p>
              <div className="mt-3 text-yellow-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Shop Now →
              </div>
            </Link>
            
            <Link href="/products?category=cupcakes" className="text-center p-6 hover:shadow-lg transition-all duration-300 rounded-lg block group">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
                <span className="text-3xl">🧁</span>
              </div>
              <h3 className="font-semibold mb-3 text-gray-800 group-hover:text-purple-600 transition-colors">Celebration Bakes</h3>
              <p className="text-sm text-gray-600">Cupcakes and special treats for special days.</p>
              <div className="mt-3 text-purple-500 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Shop Now →
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-500 to-pink-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-white">
            <h2 className="text-3xl font-bold mb-4 flex items-center justify-center">
              <span className="mr-3">🐾</span>
              Ready to Make Your Cat Happy?
            </h2>
            <p className="text-xl mb-8">Join thousands of happy cats who love CozyCatKitchen meals</p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/products"
                className="inline-flex items-center px-8 py-3 bg-white text-orange-500 rounded-full font-semibold hover:bg-gray-100 transition-colors"
              >
                <span className="mr-2">🍽️</span>
                Browse Products
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="https://wa.me/919873648122"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-8 py-3 bg-green-600 text-white rounded-full font-semibold hover:bg-green-700 transition-colors"
              >
                <span className="mr-2">�</span>
                WhatsApp Order
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center">
              <span className="mr-3">💬</span>
              Happy Cats & Happy Humans
            </h2>
            <p className="text-lg text-gray-600">See what our customers (and their cats) have to say</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="relative">
                <img 
                  src="/testimonials/whatsapp-1.jpg" 
                  alt="Customer testimonial about cat food excitement"
                  className="w-full h-auto"
                />
                <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                  WhatsApp
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center mb-2">
                  <div className="text-2xl mr-2">😺</div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Happy Customer</h4>
                    <p className="text-sm text-gray-500">Verified Purchase</p>
                  </div>
                </div>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400">⭐</span>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="relative">
                <img 
                  src="/testimonials/whatsapp-2.jpg" 
                  alt="Customer testimonial about cat food improvement"
                  className="w-full h-auto"
                />
                <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                  WhatsApp
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center mb-2">
                  <div className="text-2xl mr-2">😸</div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Satisfied Owner</h4>
                    <p className="text-sm text-gray-500">Verified Purchase</p>
                  </div>
                </div>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400">⭐</span>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="relative">
                <img 
                  src="/testimonials/whatsapp-3.jpg" 
                  alt="Customer conversation about cat eating habits"
                  className="w-full h-auto"
                />
                <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                  WhatsApp
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center mb-2">
                  <div className="text-2xl mr-2">😻</div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Concerned Owner</h4>
                    <p className="text-sm text-gray-500">Verified Purchase</p>
                  </div>
                </div>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400">⭐</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
    </>
  )
}
