import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { emailService } from '@/lib/email'
import { mercurService, type KycMercurInput } from '@/lib/mercur'
import { decrypt } from '@/lib/encryption'
import { getSignedStorageUrl } from '@/lib/storage'

function safeDecrypt(value?: string | null): string {
  if (!value) return ''
  try {
    return decrypt(value)
  } catch {
    return value
  }
}

async function buildMercurInput(application: Record<string, unknown>): Promise<KycMercurInput> {
  const user = application.user as { email: string }
  const logoUrl = application.logoKey
    ? await getSignedStorageUrl(application.logoKey as string)
    : null
  const firstProductImageUrl = application.firstProductImageKey
    ? await getSignedStorageUrl(application.firstProductImageKey as string)
    : null

  return {
    applicationId: application.id as string,
    businessName: application.businessName as string,
    businessAddress: application.businessAddress as string,
    taxIdNumber: safeDecrypt(application.taxIdNumber as string),
    vendorEmail: user.email,
    existingMercurSellerId: (application.mercurSellerId as string | null) || null,
    bankAccountName: (application.bankAccountName as string | null) || null,
    bankAccountNumber: safeDecrypt(application.bankAccountNumber as string | null),
    bankRoutingNumber: safeDecrypt(application.bankRoutingNumber as string | null),
    shippingMethod: (application.shippingMethod as string | null) || null,
    leadTime: (application.leadTime as string | null) || null,
    aboutUs: (application.aboutUs as string | null) || null,
    logoUrl,
    firstProductTitle: (application.firstProductTitle as string | null) || null,
    firstProductPrice: (application.firstProductPrice as string | null) || null,
    firstProductCategory: (application.firstProductCategory as string | null) || null,
    firstProductImageUrl,
  }
}

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params
  try {
    const { data: application } = await supabase
      .from('KYCApplication')
      .select(`
        *,
        user:users ( firstName, lastName, email ),
        reviewHistory:KYCReviewHistory (
          *,
          reviewer:AdminUser (
            user:users ( firstName, lastName )
          )
        )
      `)
      .eq('id', params.id)
      .maybeSingle()

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    return NextResponse.json(application)
  } catch (error) {
    console.error('Error fetching application:', error)
    return NextResponse.json({ error: 'Failed to fetch application' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params
  try {
    const { action, notes, reviewerId } = await request.json()

    if (!action || !reviewerId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { data: application } = await supabase
      .from('KYCApplication')
      .select(`
        *,
        user:users ( email )
      `)
      .eq('id', params.id)
      .maybeSingle()

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    }

    let newStatus = ''
    let mercurResult = null

    switch (action) {
      case 'approve':
        newStatus = 'APPROVED'
        updateData.status = newStatus
        updateData.reviewedBy = reviewerId
        updateData.reviewedAt = new Date().toISOString()
        updateData.approvedAt = new Date().toISOString()
        updateData.mercurSyncError = null

        if (mercurService.isConfigured()) {
          try {
            mercurResult = await mercurService.provisionSellerFromKyc(
              await buildMercurInput(application)
            )

            updateData.mercurSellerId = mercurResult.sellerId
            updateData.mercurSellerHandle = mercurResult.handle
            updateData.mercurSyncedAt = new Date().toISOString()
          } catch (mercurError) {
            const message =
              mercurError instanceof Error ? mercurError.message : 'Unknown Mercur error'

            console.error('Mercur sync failed during KYC approval:', mercurError)

            await supabase
              .from('KYCApplication')
              .update({
                mercurSyncError: message,
                updatedAt: new Date().toISOString(),
              })
              .eq('id', params.id)

            return NextResponse.json(
              {
                error: 'Mercur seller provisioning failed — application was not approved',
                details: message,
              },
              { status: 502 }
            )
          }
        }
        break
      case 'reject':
        newStatus = 'REJECTED'
        updateData.status = newStatus
        updateData.reviewedBy = reviewerId
        updateData.reviewedAt = new Date().toISOString()
        if (notes) {
          updateData.rejectionReason = notes
        }
        break
      case 'request_info':
        newStatus = 'NEEDS_INFO'
        updateData.status = newStatus
        updateData.reviewedBy = reviewerId
        updateData.reviewedAt = new Date().toISOString()
        if (notes) {
          updateData.reviewerNotes = notes
        }
        break
      case 'assign':
        updateData.reviewedBy = reviewerId
        break
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const { data: updatedApplication, error: updateError } = await supabase
      .from('KYCApplication')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating KYC application:', updateError)
      return NextResponse.json(
        {
          error: 'Failed to update application',
          details: updateError.message,
        },
        { status: 500 }
      )
    }

    await supabase.from('KYCReviewHistory').insert({
      applicationId: params.id,
      reviewerId,
      action: action.replace('_', ' ').toUpperCase(),
      notes: notes || null,
    })

    if (action === 'approve') {
      try {
        await emailService.sendApplicationApproved(
          application.user.email,
          application.businessName,
          process.env.MERCUR_VENDOR_URL
        )
      } catch (emailError) {
        console.error('Failed to send approval email:', emailError)
      }
    }

    if (action === 'reject' && notes) {
      try {
        await emailService.sendApplicationRejected(
          application.user.email,
          application.businessName,
          notes
        )
      } catch (emailError) {
        console.error('Failed to send rejection email:', emailError)
      }
    }

    if (action === 'request_info' && notes) {
      try {
        await emailService.sendInfoRequested(
          application.user.email,
          application.businessName,
          notes
        )
      } catch (emailError) {
        console.error('Failed to send info request email:', emailError)
      }
    }

    return NextResponse.json({
      success: true,
      application: updatedApplication,
      newStatus,
      mercur: mercurResult,
      mercurConfigured: mercurService.isConfigured(),
      vendorPanelUrl: process.env.MERCUR_VENDOR_URL || 'http://localhost:7001',
    })
  } catch (error) {
    console.error('Error updating application:', error)
    return NextResponse.json({ error: 'Failed to update application' }, { status: 500 })
  }
}
