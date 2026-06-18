import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const applicationId = searchParams.get('applicationId')

    if (applicationId) {
      // Get specific application status
      const { data: application } = await supabase
        .from('KYCApplication')
        .select(`
          *,
          user:users ( firstName, lastName, email )
        `)
        .eq('id', applicationId)
        .maybeSingle()

      if (!application) {
        return NextResponse.json(
          { error: 'Application not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        id: application.id,
        status: application.status.toLowerCase(),
        businessName: application.businessName,
        submittedAt: application.submittedAt,
        reviewedAt: application.reviewedAt,
        rejectionReason: application.rejectionReason,
        reviewerNotes: application.reviewerNotes,
      })
    }

    if (userId) {
      // Get all applications for a user
      const { data: applications } = await supabase
        .from('KYCApplication')
        .select(`
          id,
          status,
          businessName,
          submittedAt,
          reviewedAt,
          rejectionReason
        `)
        .eq('userId', userId)
        .order('submittedAt', { ascending: false })

      if (!applications) {
        return NextResponse.json({ applications: [] })
      }

      return NextResponse.json({
        applications: applications.map(app => ({
          id: app.id,
          status: app.status.toLowerCase(),
          businessName: app.businessName,
          submittedAt: app.submittedAt,
          reviewedAt: app.reviewedAt,
          rejectionReason: app.rejectionReason,
        }))
      })
    }

    return NextResponse.json(
      { error: 'userId or applicationId is required' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error fetching KYC status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch status' },
      { status: 500 }
    )
  }
}