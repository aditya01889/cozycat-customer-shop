import Link from "next/link";
import { ArrowRight, Star, Heart } from "lucide-react";
import Hero from "@/components/Hero";

export default function Home() {
  return (
    <div className="bg-white">
      <Hero />

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-orange-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center">
              <span className="mr-3">🐾</span>
              Why Choose CozyCatKitchen?
            </h2>
            <p className="text-lg text-gray-600">Fresh, nutritious, and made with love for your feline friends</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">❤️</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-orange-800">Made Fresh Daily</h3>
              <p className="text-gray-600">Every order is made fresh after you place it. No preservatives, no shelf life concerns. Your cat deserves the best!</p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⭐</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-pink-800">Premium Ingredients</h3>
              <p className="text-gray-600">Human-grade ingredients, balanced nutrition, and recipes developed with care.</p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚚</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-purple-800">Delivered Fresh</h3>
              <p className="text-gray-600">Temperature-controlled delivery ensures your cat's food arrives fresh and safe. We deliver with care!</p>
            </div>
          </div>
        </div>
      </section>

      {/* Product Categories */}
      <section className="py-20 bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center">
              <span className="mr-3">🍽️</span>
              Our Products
            </h2>
            <p className="text-lg text-gray-600">Complete meals, broths, cookies, and treats for every cat</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6">
            <Link href="/products?category=meals" className="group bg-white rounded-2xl p-6 text-center hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🍽️</span>
              </div>
              <h3 className="font-semibold mb-2 text-orange-800">Complete Meals</h3>
              <p className="text-sm text-gray-600">Nutritionally balanced daily meals</p>
              <div className="mt-2 text-orange-500 font-semibold">Shop Now →</div>
            </Link>
            
            <Link href="/products?category=broths" className="group bg-white rounded-2xl p-6 text-center hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🥣</span>
              </div>
              <h3 className="font-semibold mb-2 text-pink-800">Nutrient Broths</h3>
              <p className="text-sm text-gray-600">Hydrating and nutritious broths</p>
              <div className="mt-2 text-pink-500 font-semibold">Shop Now →</div>
            </Link>
            
            <Link href="/products?category=cookies" className="group bg-white rounded-2xl p-6 text-center hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🍪</span>
              </div>
              <h3 className="font-semibold mb-2 text-yellow-800">Cookies</h3>
              <p className="text-sm text-gray-600">Healthy baked treats</p>
              <div className="mt-2 text-yellow-600 font-semibold">Shop Now →</div>
            </Link>
            
            <Link href="/products?category=cupcakes" className="group bg-white rounded-2xl p-6 text-center hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🧁</span>
              </div>
              <h3 className="font-semibold mb-2 text-purple-800">Cupcakes</h3>
              <p className="text-sm text-gray-600">Special celebration treats</p>
              <div className="mt-2 text-purple-500 font-semibold">Shop Now →</div>
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
  )
}
