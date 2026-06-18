'use client'

import { useState, useEffect } from 'react'

interface KYCApplication {
  id: string
  status: string
  businessName: string
  submittedAt: string
  reviewedAt?: string
  rejectionReason?: string
}

export default function StatusPage() {
  const [applications, setApplications] = useState<KYCApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      // In a real app, userId would come from authentication
      const response = await fetch('/api/kyc/status?userId=user123')

      if (response.ok) {
        const data = await response.json()
        setApplications(data.applications || [])
      } else {
        setError('Failed to fetch applications')
      }
    } catch (err) {
      setError('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-600 bg-green-50'
      case 'rejected':
        return 'text-red-600 bg-red-50'
      case 'under_review':
        return 'text-blue-600 bg-blue-50'
      case 'needs_info':
        return 'text-yellow-600 bg-yellow-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending Review'
      case 'under_review':
        return 'Under Review'
      case 'approved':
        return 'Approved'
      case 'rejected':
        return 'Rejected'
      case 'needs_info':
        return 'Needs Information'
      default:
        return status
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading application status...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-5xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchApplications}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Application Status</h1>

        {applications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-gray-400 text-5xl mb-4">📋</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Applications Found</h2>
            <p className="text-gray-600 mb-6">
              You haven&apos;t submitted any vendor applications yet.
            </p>
            <button
              onClick={() => window.location.href = '/register'}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Start Application
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {applications.map((application) => (
              <div key={application.id} className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {application.businessName}
                    </h2>
                    <p className="text-sm text-gray-500">
                      Application ID: #{application.id.slice(-8).toUpperCase()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                    {getStatusText(application.status)}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Submitted:</span>
                    <span className="text-gray-900">
                      {new Date(application.submittedAt).toLocaleDateString()} at{' '}
                      {new Date(application.submittedAt).toLocaleTimeString()}
                    </span>
                  </div>

                  {application.reviewedAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Reviewed:</span>
                      <span className="text-gray-900">
                        {new Date(application.reviewedAt).toLocaleDateString()} at{' '}
                        {new Date(application.reviewedAt).toLocaleTimeString()}
                      </span>
                    </div>
                  )}
                </div>

                {application.rejectionReason && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h3 className="font-medium text-red-900 mb-1">Reason for Rejection</h3>
                    <p className="text-sm text-red-700">{application.rejectionReason}</p>
                  </div>
                )}

                {/* Action buttons based on status */}
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  {application.status === 'needs_info' && (
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                      Provide Additional Information
                    </button>
                  )}

                  {application.status === 'approved' && (
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors">
                      Complete Seller Agreement
                    </button>
                  )}

                  {application.status === 'rejected' && (
                    <button className="px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                      Submit New Application
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <button
            onClick={() => window.location.href = '/'}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back to Homepage
          </button>
        </div>
      </div>
    </div>
  )
}