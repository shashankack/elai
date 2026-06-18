import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { onboardingUploadSchema } from '@/lib/onboarding-validations'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validationResult = onboardingUploadSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    const { fileName, fileType, email } = validationResult.data
    const safeEmail = email.toLowerCase().replace(/[^a-z0-9@._-]/g, '_')
    const fileKey = `vendor-onboarding/${safeEmail}/${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`

    const bucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'kyc-documents'
    const { data, error } = await supabase.storage.from(bucket).createSignedUploadUrl(fileKey)

    if (error || !data) {
      throw error || new Error('No signed upload URL returned')
    }

    return NextResponse.json({
      uploadUrl: data.signedUrl,
      fileKey,
    })
  } catch (error) {
    console.error('Onboarding upload URL error:', error)
    return NextResponse.json({ error: 'Failed to generate upload URL' }, { status: 500 })
  }
}
