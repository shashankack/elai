'use client'

import { useState, useEffect } from 'react'

interface KYCApplication {
  id: string
  businessName: string
  status: string
  submittedAt: string
  user: {
    firstName: string
    lastName: string
    email: string
  }
}

interface ApplicationDetail extends KYCApplication {
  businessLicenseKey?: string
  taxIdDocumentKey?: string
  governmentIdKey?: string
  taxIdNumber: string
  businessAddress: string
  bankAccountName?: string
  bankAccountNumber?: string
  bankRoutingNumber?: string
  shippingMethod?: string
  leadTime?: string
  aboutUs?: string
  logoKey?: string
  firstProductTitle?: string
  firstProductPrice?: string
  firstProductCategory?: string
  firstProductImageKey?: string
  rejectionReason?: string
  reviewerNotes?: string
  mercurSellerId?: string
  mercurSellerHandle?: string
  mercurSyncedAt?: string
  mercurSyncError?: string
  reviewHistory: Array<{
    action: string
    notes?: string
    createdAt: string
    reviewer: {
      user: {
        firstName: string
        lastName: string
      }
    }
  }>
}

export default function AdminDashboard() {
  const [applications, setApplications] = useState<KYCApplication[]>([])
  const [selectedApplication, setSelectedApplication] = useState<ApplicationDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [reviewNotes, setReviewNotes] = useState('')
  const [stats, setStats] = useState({
    pending: 0,
    underReview: 0,
    approved: 0,
    rejected: 0
  })

  useEffect(() => {
    fetchApplications()
    fetchStats()
  }, [])

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/admin/kyc/pending?status=PENDING')
      if (response.ok) {
        const data = await response.json()
        setApplications(data.applications)
      }
    } catch (error) {
      console.error('Error fetching applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const statuses = ['PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED']
      const newStats = { ...stats }
      
      for (const status of statuses) {
        const response = await fetch(`/api/admin/kyc/pending?status=${status}&limit=1`)
        if (response.ok) {
          const data = await response.json()
          newStats[status.toLowerCase() as keyof typeof newStats] = data.pagination.total
        }
      }
      
      setStats(newStats)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchApplicationDetail = async (applicationId: string) => {
    try {
      const response = await fetch(`/api/admin/kyc/${applicationId}`)
      if (response.ok) {
        const application = await response.json()
        setSelectedApplication(application)
      }
    } catch (error) {
      console.error('Error fetching application detail:', error)
    }
  }

  const handleReviewAction = async (action: 'approve' | 'reject' | 'request_info') => {
    if (!selectedApplication) return

    try {
      const response = await fetch(`/api/admin/kyc/${selectedApplication.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          notes: reviewNotes,
          reviewerId: '00000000-0000-0000-0000-000000000001'
        })
      })

      const data = await response.json()

      if (response.ok) {
        if (action === 'approve' && data.mercur) {
          alert(
            `Approved and synced to Mercur.\nSeller: ${data.mercur.handle}\nVendor panel: ${data.vendorPanelUrl}`
          )
        } else if (action === 'approve' && data.mercurConfigured === false) {
          alert('Approved in KYC portal. Mercur sync skipped (MERCUR_* env vars not set).')
        }

        await fetchApplications()
        await fetchStats()
        setSelectedApplication(null)
        setReviewNotes('')
      } else {
        alert(data.details || data.error || 'Review action failed')
      }
    } catch (error) {
      console.error('Error updating application:', error)
      alert('An unexpected error occurred')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'text-green-600 bg-green-50'
      case 'REJECTED':
        return 'text-red-600 bg-red-50'
      case 'UNDER_REVIEW':
        return 'text-blue-600 bg-blue-50'
      case 'NEEDS_INFO':
        return 'text-yellow-600 bg-yellow-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getFileUrl = (key?: string) => {
    if (!key) return '#'
    // Use the secure API router to generate a temporary signed URL to view private KYC files
    return `/api/admin/kyc/file?key=${encodeURIComponent(key)}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Admin User</span>
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                A
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
          Vendors now sign up directly in the Mercur vendor dashboard at{' '}
          <a
            href={process.env.NEXT_PUBLIC_MERCUR_VENDOR_URL || 'http://localhost:7001'}
            className="font-medium underline"
            target="_blank"
            rel="noreferrer"
          >
            {process.env.NEXT_PUBLIC_MERCUR_VENDOR_URL || 'http://localhost:7001'}
          </a>
          . This KYC queue is legacy and no longer required for new sellers.
        </div>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-yellow-600">⏳</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600">👁️</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Under Review</p>
                <p className="text-2xl font-bold text-gray-900">{stats.underReview}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600">✓</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600">✗</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Applications List */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Pending Applications ({applications.length})
              </h2>
            </div>
            <div className="divide-y divide-gray-200">
              {applications.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No pending applications
                </div>
              ) : (
                applications.map((application) => (
                  <div
                    key={application.id}
                    className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => fetchApplicationDetail(application.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          {application.businessName}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {application.user.firstName} {application.user.lastName}
                        </p>
                        <p className="text-xs text-gray-400">
                          Submitted {new Date(application.submittedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                        Review
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Application Detail */}
          <div className="bg-white rounded-lg shadow">
            {selectedApplication ? (
              <>
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">
                    Reviewing: {selectedApplication.businessName}
                  </h2>
                  <p className="text-sm text-gray-500">
                    ID: #{selectedApplication.id.slice(-8).toUpperCase()}
                  </p>
                </div>

                <div className="p-6 space-y-6">
                  {/* Business Details */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Business Details</h3>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm text-gray-900">
                      <div><strong>Name:</strong> {selectedApplication.businessName}</div>
                      <div><strong>Tax ID:</strong> {selectedApplication.taxIdNumber}</div>
                      <div><strong>Address:</strong> {selectedApplication.businessAddress}</div>
                      <div><strong>Email:</strong> {selectedApplication.user.email}</div>
                      {selectedApplication.aboutUs && (
                        <div><strong>About:</strong> {selectedApplication.aboutUs}</div>
                      )}
                      {selectedApplication.mercurSellerHandle && (
                        <div><strong>Mercur seller:</strong> {selectedApplication.mercurSellerHandle}</div>
                      )}
                      {selectedApplication.mercurSyncError && (
                        <div className="text-red-600"><strong>Mercur sync error:</strong> {selectedApplication.mercurSyncError}</div>
                      )}
                    </div>
                  </div>

                  {/* Banking & Shipping */}
                  {(selectedApplication.bankAccountName || selectedApplication.shippingMethod) && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-2">Banking & Shipping</h3>
                      <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm text-gray-900">
                        {selectedApplication.bankAccountName && (
                          <div><strong>Account name:</strong> {selectedApplication.bankAccountName}</div>
                        )}
                        {selectedApplication.bankAccountNumber && (
                          <div><strong>Account number:</strong> on file (encrypted)</div>
                        )}
                        {selectedApplication.shippingMethod && (
                          <div><strong>Shipping:</strong> {selectedApplication.shippingMethod.replace('_', ' ')}</div>
                        )}
                        {selectedApplication.leadTime && (
                          <div><strong>Lead time:</strong> {selectedApplication.leadTime.replace('_', ' ')}</div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* First Product */}
                  {selectedApplication.firstProductTitle && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-2">First Product</h3>
                      <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm text-gray-900">
                        <div><strong>Title:</strong> {selectedApplication.firstProductTitle}</div>
                        <div><strong>Price:</strong> {selectedApplication.firstProductPrice}</div>
                        <div><strong>Category:</strong> {selectedApplication.firstProductCategory}</div>
                      </div>
                    </div>
                  )}

                  {/* Documents */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Documents</h3>
                    <div className="space-y-2">
                      {selectedApplication.businessLicenseKey && (
                        <a
                          href={getFileUrl(selectedApplication.businessLicenseKey)}
                          target="_blank"
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <span className="text-sm text-gray-900">Business License</span>
                          <span className="text-blue-600 text-sm">View PDF</span>
                        </a>
                      )}
                      {selectedApplication.taxIdDocumentKey && (
                        <a
                          href={getFileUrl(selectedApplication.taxIdDocumentKey)}
                          target="_blank"
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <span className="text-sm text-gray-900">Tax ID Document</span>
                          <span className="text-blue-600 text-sm">View Image</span>
                        </a>
                      )}
                      {selectedApplication.governmentIdKey && (
                        <a
                          href={getFileUrl(selectedApplication.governmentIdKey)}
                          target="_blank"
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <span className="text-sm text-gray-900">Government ID</span>
                          <span className="text-blue-600 text-sm">View Image</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Review Notes */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Reviewer Notes</h3>
                    <textarea
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      placeholder="Add internal notes about this application..."
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleReviewAction('approve')}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                    >
                      ✅ Approve
                    </button>
                    <button
                      onClick={() => handleReviewAction('reject')}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                    >
                      ❌ Reject
                    </button>
                    <button
                      onClick={() => handleReviewAction('request_info')}
                      className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg font-medium hover:bg-yellow-700 transition-colors"
                    >
                      📧 Request Info
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-12 text-center text-gray-500">
                <div className="text-4xl mb-4">📋</div>
                <p>Select an application to review</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}