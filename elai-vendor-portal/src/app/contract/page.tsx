'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

function ContractContent() {
  const searchParams = useSearchParams()
  const applicationId = searchParams.get('applicationId')
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  interface Application {
    id: string
    businessName: string
  }

  const [application, setApplication] = useState<Application | null>(null)

  useEffect(() => {
    if (applicationId) {
      fetchApplication()
    }
  }, [applicationId])

  const fetchApplication = async () => {
    try {
      const response = await fetch(`/api/kyc/status?applicationId=${applicationId}`)
      if (response.ok) {
        const data = await response.json()
        setApplication(data)
      }
    } catch (error) {
      console.error('Error fetching application:', error)
    }
  }

  const handleSignContract = async () => {
    if (!agreed) return

    setLoading(true)
    try {
      const response = await fetch('/api/contract/sign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationId,
          signatureDate: new Date().toISOString(),
        })
      })

      if (response.ok) {
        window.location.href = '/welcome'
      } else {
        alert('Failed to sign contract')
      }
    } catch (error) {
      console.error('Error signing contract:', error)
      alert('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg">
          {/* Header */}
          <div className="px-8 py-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Seller Agreement</h1>
            <p className="text-gray-600 mt-1">
              Please review and sign the ELAI Marketplace Seller Agreement
            </p>
          </div>

          {/* Contract Content */}
          <div className="px-8 py-6 max-h-96 overflow-y-auto">
            <div className="prose max-w-none">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">ELAI Marketplace Seller Agreement</h2>

              <div className="space-y-6 text-gray-700">
                <section>
                  <h3 className="text-lg font-semibold text-gray-900">1. Acceptance of Terms</h3>
                  <p>
                    By signing this agreement, you ("Seller") agree to be bound by these terms and conditions
                    for selling products on the ELAI marketplace platform.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900">2. Commission Structure</h3>
                  <p>
                    ELAI charges a 15% commission on all sales completed through our platform.
                    Sellers will receive 85% of the final sale price. Commissions are calculated on the
                    total amount including shipping and any applicable taxes.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900">3. Payment Processing</h3>
                  <p>
                    Payments will be processed and transferred to Seller's designated bank account within
                    7-10 business days after the customer's return period has expired. Seller is responsible
                    for providing accurate banking information.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900">4. Product Listings</h3>
                  <p>
                    Seller agrees to provide accurate product descriptions, images, and pricing.
                    All products must be authentic, legally obtained, and comply with applicable laws
                    and regulations.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900">5. Shipping and Fulfillment</h3>
                  <p>
                    Seller is responsible for timely order fulfillment and accurate shipping.
                    All orders must be shipped within the timeframe specified in Seller's profile.
                    Tracking information must be provided for all shipments.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900">6. Returns and Refunds</h3>
                  <p>
                    Seller must comply with ELAI's return policy. Customer returns will be processed
                    according to the platform's guidelines, and refunds will be issued accordingly.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900">7. Account Responsibilities</h3>
                  <p>
                    Seller is responsible for maintaining the security of their account credentials and
                    for all activities that occur under their account. ELAI is not liable for any
                    unauthorized access to Seller's account.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900">8. Intellectual Property</h3>
                  <p>
                    Seller retains ownership of all intellectual property rights to their products.
                    However, Seller grants ELAI a non-exclusive, worldwide license to use product
                    images and descriptions for marketing and platform display purposes.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900">9. Termination</h3>
                  <p>
                    Either party may terminate this agreement with 30 days' written notice.
                    ELAI reserves the right to immediately terminate Seller's account for violation
                    of these terms or applicable laws.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900">10. Limitation of Liability</h3>
                  <p>
                    ELAI's liability under this agreement shall not exceed the total commissions
                    paid by Seller in the six months preceding the claim. ELAI is not liable for
                    indirect, incidental, or consequential damages.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900">11. Governing Law</h3>
                  <p>
                    This agreement shall be governed by and construed in accordance with the laws
                    of the jurisdiction where ELAI is headquartered, without regard to conflict
                    of law principles.
                  </p>
                </section>
              </div>
            </div>
          </div>

          {/* Signature Section */}
          <div className="px-8 py-6 border-t border-gray-200 bg-gray-50">
            {application && (
              <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600">
                  <strong>Business Name:</strong> {application.businessName}<br />
                  <strong>Application ID:</strong> #{application.id.slice(-8).toUpperCase()}
                </p>
              </div>
            )}

            <div className="space-y-4">
              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  I have read, understood, and agree to the terms and conditions outlined in the
                  ELAI Marketplace Seller Agreement. I understand that this is a legally binding
                  contract and that electronic signature has the same legal effect as a handwritten signature.
                </span>
              </label>

              <div className="flex space-x-4">
                <button
                  onClick={() => window.location.href = '/status'}
                  className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSignContract}
                  disabled={!agreed || loading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Signing...' : 'Sign Agreement'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ContractPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      }
    >
      <ContractContent />
    </Suspense>
  )
}