import { NextRequest, NextResponse } from 'next/server'
import { onboardingSubmitSchema } from '@/lib/onboarding-validations'
import { submitVendorOnboarding } from '@/lib/mercur-vendor-onboarding'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validationResult = onboardingSubmitSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid submission', details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    const { account, store, business, bank } = validationResult.data

    const metadata: Record<string, unknown> = {}
    if (bank.gst_certificate_key) {
      metadata.gst_certificate_path = bank.gst_certificate_key
    }
    if (bank.cancelled_cheque_key) {
      metadata.cancelled_cheque_path = bank.cancelled_cheque_key
    }

    const result = await submitVendorOnboarding({
      first_name: account.first_name,
      last_name: account.last_name,
      email: account.email,
      password: account.password,
      name: store.name,
      store_email: store.email,
      phone: store.phone,
      description: store.description,
      handle: store.handle || undefined,
      address_1: business.address_1,
      city: business.city,
      province: business.province,
      postal_code: business.postal_code,
      corporate_name: business.corporate_name,
      tax_id: business.tax_id.toUpperCase(),
      registration_number: business.registration_number || undefined,
      holder_name: bank.holder_name,
      bank_name: bank.bank_name,
      routing_number: bank.routing_number.toUpperCase(),
      account_number: bank.account_number,
      metadata,
    })

    return NextResponse.json({
      sellerId: result.sellerId,
      handle: result.handle,
      status: result.status,
    })
  } catch (error) {
    console.error('Vendor onboarding error:', error)
    const message = error instanceof Error ? error.message : 'Onboarding failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
