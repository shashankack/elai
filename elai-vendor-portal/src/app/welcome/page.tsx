export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-green-600 text-6xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome to ELAI Marketplace!
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Congratulations! Your account has been successfully activated and you&apos;re now ready to start selling. cheers!.
          </p>

          <div className="bg-green-50 p-6 rounded-lg mb-8">
            <h2 className="text-xl font-semibold text-green-900 mb-4">What's Next?</h2>
            <div className="space-y-3 text-left">
              <div className="flex items-start">
                <span className="text-green-600 mr-3">✓</span>
                <div>
                  <strong>Your seller account is active</strong>
                  <p className="text-sm text-gray-600">You can now access the seller dashboard</p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-green-600 mr-3">📦</span>
                <div>
                  <strong>Start adding products</strong>
                  <p className="text-sm text-gray-600">Upload your products to the marketplace</p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-green-600 mr-3">💰</span>
                <div>
                  <strong>Configure payments</strong>
                  <p className="text-sm text-gray-600">Set up your payout methods</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <button className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
              Go to Seller Dashboard
            </button>
            <button className="w-full px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors">
              Browse Marketplace
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Need help? Contact our support team at
              <a href="mailto:support@elai.com" className="text-blue-600 hover:text-blue-700 ml-1">
                support@elai.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}