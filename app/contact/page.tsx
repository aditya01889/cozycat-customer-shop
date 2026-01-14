export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="prose max-w-none">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Contact Us</h1>
        
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Get in Touch</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Phone</h3>
                <p className="text-gray-600">
                  <a href="tel:+919873648122" className="text-orange-500 hover:text-orange-600">
                    +91-98736-48122
                  </a>
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">WhatsApp</h3>
                <p className="text-gray-600">
                  <a 
                    href="https://wa.me/919873648122" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-green-600 hover:text-green-700"
                  >
                    +91-98736-48122
                  </a>
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Email</h3>
                <p className="text-gray-600">
                  <a href="mailto:orders@cozycatkitchen.com" className="text-orange-500 hover:text-orange-600">
                    orders@cozycatkitchen.com
                  </a>
                </p>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Business Hours</h2>
            
            <div className="space-y-3 text-gray-600">
              <div className="flex justify-between">
                <span>Monday - Friday:</span>
                <span className="font-medium">9:00 AM - 7:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span>Saturday:</span>
                <span className="font-medium">10:00 AM - 6:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span>Sunday:</span>
                <span className="font-medium">Closed</span>
              </div>
            </div>
            
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 mt-8">Location</h2>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <address className="not-italic text-gray-600 space-y-2">
                <div className="font-medium">CozyCatKitchen</div>
                <div>123 Pet Food Lane</div>
                <div>Kitchen Area, Culinary District</div>
                <div>Mumbai, Maharashtra 400001</div>
                <div>India</div>
              </address>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
