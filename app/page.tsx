import Link from "next/link";
import { ArrowRight, Star, Heart } from "lucide-react";

export default function Home() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-orange-50 to-amber-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Fresh Cat Food,
              <span className="text-orange-500"> Made with Love</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Premium, made-to-order meals and treats for your feline friend. 
              Fresh ingredients, balanced nutrition, delivered with care.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/products"
                className="inline-flex items-center px-8 py-3 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors"
              >
                Shop Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center px-8 py-3 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose CozyCatKitchen?</h2>
            <p className="text-lg text-gray-600">Fresh, nutritious, and made specifically for your cat</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Made Fresh Daily</h3>
              <p className="text-gray-600">Every order is made fresh after you place it. No preservatives, no shelf life concerns.</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Premium Ingredients</h3>
              <p className="text-gray-600">Human-grade ingredients, balanced nutrition, and recipes developed with care.</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ArrowRight className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Delivered Fresh</h3>
              <p className="text-gray-600">Temperature-controlled delivery ensures your cat's food arrives fresh and safe.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Product Categories */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Products</h2>
            <p className="text-lg text-gray-600">Complete meals, broths, cookies, and treats</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6">
            <Link href="/products?category=meals" className="group bg-white rounded-lg p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🍽️</span>
              </div>
              <h3 className="font-semibold mb-2">Complete Meals</h3>
              <p className="text-sm text-gray-600">Nutritionally balanced daily meals</p>
            </Link>
            
            <Link href="/products?category=broths" className="group bg-white rounded-lg p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🥣</span>
              </div>
              <h3 className="font-semibold mb-2">Nutrient Broths</h3>
              <p className="text-sm text-gray-600">Hydrating and nutritious broths</p>
            </Link>
            
            <Link href="/products?category=cookies" className="group bg-white rounded-lg p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🍪</span>
              </div>
              <h3 className="font-semibold mb-2">Cookies</h3>
              <p className="text-sm text-gray-600">Healthy baked treats</p>
            </Link>
            
            <Link href="/products?category=cupcakes" className="group bg-white rounded-lg p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🧁</span>
              </div>
              <h3 className="font-semibold mb-2">Cupcakes</h3>
              <p className="text-sm text-gray-600">Special celebration treats</p>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-orange-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Treat Your Cat?
          </h2>
          <p className="text-xl text-orange-100 mb-8">
            Join hundreds of happy cats who love CozyCatKitchen
          </p>
          <Link
            href="/products"
            className="inline-flex items-center px-8 py-3 bg-white text-orange-500 rounded-full hover:bg-gray-100 transition-colors font-semibold"
          >
            Browse Products
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
