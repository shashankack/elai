import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { uploadRequestSchema } from '@/lib/validations'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validationResult = uploadRequestSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    const { fileName, fileType, email } = validationResult.data

    let userId: string
    if (email) {
      let { data: user } = await supabase.from('users').select('*').eq('email', email).maybeSingle()
      if (!user) {
        const { data: newUser, error } = await supabase.from('users').insert({ email, updatedAt: new Date().toISOString() }).select().single()
        if (error) throw error
        user = newUser
      }
      userId = user.id
    } else {
      return NextResponse.json({ error: "Email is required for upload" }, { status: 400 })
    }

    // Generate unique file key scoped to user
    const fileKey = `kyc-documents/${userId}/${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`

    // Create Supabase signed URL for upload
    const { data, error } = await supabase.storage
      .from(process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'my-bucket')
      .createSignedUploadUrl(fileKey)

    if (error || !data) {
      throw error || new Error('No signed url returned')
    }

    return NextResponse.json({
      uploadUrl: data.signedUrl,
      fileKey: fileKey,
    })
  } catch (error) {
    console.error('Error generating pre-signed URL:', error)
    return NextResponse.json(
      { error: 'Failed to generate upload URL' },
      { status: 500 }
    )
  }
}