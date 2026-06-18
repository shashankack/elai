import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { kycFormSchema } from '@/lib/validations'
import { encrypt } from '@/lib/encryption'
import { emailService } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validationResult = kycFormSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid submission data', details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    const data = validationResult.data

    let { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('email', data.email)
      .maybeSingle()

    if (!user) {
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({ email: data.email, updatedAt: new Date().toISOString() })
        .select()
        .single()

      if (createError) throw createError
      user = newUser
    }

    const encryptedTaxId = encrypt(data.taxIdNumber)

    const { data: kycApplication, error: appError } = await supabase
      .from('KYCApplication')
      .insert({
        userId: user.id,
        businessName: data.businessName,
        taxIdNumber: encryptedTaxId,
        businessAddress: data.businessAddress,
        bankAccountName: data.bankAccountName,
        bankAccountNumber: encrypt(data.bankAccountNumber),
        bankRoutingNumber: encrypt(data.bankRoutingNumber),
        shippingMethod: data.shippingMethod,
        leadTime: data.leadTime,
        aboutUs: data.aboutUs || null,
        logoKey: data.logoKey || null,
        firstProductTitle: data.firstProductTitle,
        firstProductPrice: data.firstProductPrice,
        firstProductCategory: data.firstProductCategory,
        firstProductImageKey: data.firstProductImageKey || null,
        businessLicenseKey: data.businessLicenseKey,
        taxIdDocumentKey: data.taxIdDocumentKey,
        governmentIdKey: data.governmentIdKey,
        status: 'PENDING',
        submittedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .select()
      .single()

    if (appError) throw appError

    await supabase.from('KYCReviewHistory').insert({
      applicationId: kycApplication.id,
      reviewerId: null,
      action: 'SUBMITTED',
      notes: 'Application submitted via vendor onboarding form',
    })

    try {
      await emailService.sendApplicationSubmitted(
        user.email,
        kycApplication.businessName,
        kycApplication.id
      )
    } catch (emailError) {
      console.error('Failed to send confirmation email', emailError)
    }

    return NextResponse.json({
      success: true,
      applicationId: kycApplication.id,
      status: kycApplication.status,
    })
  } catch (error) {
    console.error('Error submitting KYC application:', error)
    return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 })
  }
}
