'use client';

import { useEffect } from 'react';
import { Home, RefreshCw, Mail } from 'lucide-react';
import { useToast } from '@/components/Toast/ToastProvider';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { showError } = useToast();

  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
    
    // Show a toast notification
    showError(error);
  }, [error, showError]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        {/* Cat Icon */}
        <div className="mb-8">
          <div className="w-32 h-32 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-6xl">😿</span>
          </div>
          <h1 className="text-6xl font-bold text-red-600 mb-2">500</h1>
        </div>

        {/* Error Message */}
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Kitchen Overheated! 🐾
        </h2>
        
        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
          Our kitchen is experiencing technical difficulties right now. 
          The ovens are too hot and our chefs are working to fix everything!
        </p>

        {/* Recovery Instructions */}
        <div className="bg-red-50 rounded-lg p-6 mb-8">
          <h3 className="font-semibold text-red-800 mb-3">What's happening?</h3>
          <p className="text-red-700 mb-4">
            Something went wrong in our kitchen, but don't worry! 
            Our team of expert cats is already on the case.
          </p>
          <h3 className="font-semibold text-red-800 mb-3">What you can do:</h3>
          <ul className="text-left text-red-700 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-1">•</span>
              <span>Try refreshing the page</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-1">•</span>
              <span>Check your internet connection</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-1">•</span>
              <span>Come back in a few minutes</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-1">•</span>
              <span>Contact us if the problem persists</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <button
            onClick={reset}
            className="flex items-center justify-center gap-2 px-8 py-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </button>
          
          <a
            href="/"
            className="flex items-center justify-center gap-2 px-8 py-4 bg-white text-red-600 border-2 border-red-500 rounded-lg hover:bg-red-50 transition-colors font-medium text-lg"
          >
            <Home className="w-5 h-5" />
            Go Home
          </a>
        </div>

        {/* Contact Support */}
        <div className="bg-orange-50 rounded-lg p-6">
          <h3 className="font-semibold text-orange-800 mb-3">Still having trouble?</h3>
          <p className="text-orange-700 mb-4">
            Our customer support team is here to help! 
            We're available 24/7 to assist you with any issues.
          </p>
          <a
            href="mailto:support@cozycatkitchen.com"
            className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
          >
            <Mail className="w-4 h-4" />
            Contact Support
          </a>
        </div>

        {/* Error ID for Development */}
        {process.env.NODE_ENV === 'development' && error.digest && (
          <div className="mt-8 p-4 bg-gray-100 rounded text-sm text-gray-600">
            <strong>Error ID:</strong> {error.digest}
          </div>
        )}

        {/* Fun Message */}
        <div className="mt-8 text-sm text-gray-500 italic">
          "Even the best kitchens have their off days. We'll be back to purr-fection soon!"
        </div>
      </div>
    </div>
  );
}
