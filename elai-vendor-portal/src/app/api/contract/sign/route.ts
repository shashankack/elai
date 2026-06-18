import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { emailService } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { applicationId, signatureDate } = await request.json()

    if (!applicationId || !signatureDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get application details
    const { data: application } = await supabase
      .from('KYCApplication')
      .select('*, user:users(*)')
      .eq('id', applicationId)
      .maybeSingle()

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    // Update application to show contract signed
    await supabase.from('KYCApplication').update({
      updatedAt: new Date().toISOString(),
      // Add a field for contract signature if needed in schema
      reviewerNotes: `Contract signed on ${signatureDate}`,
    }).eq('id', applicationId)

    // Add to review history
    await supabase.from('KYCReviewHistory').insert({
      applicationId: applicationId,
      reviewerId: 'system', // System action
      action: 'CONTRACT_SIGNED',
      notes: `Seller agreement signed electronically on ${signatureDate}`,
    })

    // Send confirmation email
    await emailService.sendApplicationApproved(
      application.user.email,
      application.businessName
    )

    return NextResponse.json({
      success: true,
      message: 'Contract signed successfully'
    })

  } catch (error) {
    console.error('Error signing contract:', error)
    return NextResponse.json(
      { error: 'Failed to sign contract' },
      { status: 500 }
    )
  }
}