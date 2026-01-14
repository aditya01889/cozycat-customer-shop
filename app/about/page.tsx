export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="prose max-w-none">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">About CozyCatKitchen</h1>
        
        <div className="space-y-6 text-gray-600">
          <p>
            Welcome to CozyCatKitchen, where we believe every cat deserves fresh, nutritious, 
            and delicious food made with love and care.
          </p>
        </div>
          
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Story</h2>
          <p>
            Founded with a simple mission: to provide cats with the same quality food 
            that we would serve our own furry family members. We started in our home kitchen, 
            experimenting with recipes that cats would naturally love.
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Philosophy</h2>
          <div className="grid md:grid-cols-2 gap-8 my-6">
            <div>
              <h3 className="text-lg font-medium text-orange-500 mb-3">Fresh to Order</h3>
              <p>
                Unlike commercial pet food that sits on shelves for months, we make every 
                batch fresh after you place your order. No preservatives, no artificial flavors, 
                just real ingredients prepared with care.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-orange-500 mb-3">Nutrition First</h3>
              <p>
                Every recipe is carefully balanced to provide complete nutrition. We work with 
                veterinary nutritionists to ensure our meals support optimal health, energy levels, 
                and digestive wellness.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-orange-500 mb-3">Transparent Sourcing</h3>
              <p>
                We source our ingredients from trusted local suppliers. Every ingredient is 
                human-grade, and we believe in complete transparency about what goes into 
                your cat's food.
              </p>
            </div>
            
          </div>
          
          <div>
          <p>
            When you choose CozyCatKitchen, you're not just buying cat food - you're 
            investing in your cat's health and happiness. We stand behind every product with 
            our freshness guarantee and our commitment to quality.
          </p>
        </div>
      </div>
    </div>
  )
}
