import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const key = searchParams.get('key')

  if (!key) {
    return NextResponse.json({ error: 'Key is required' }, { status: 400 })
  }

  try {
    const bucketName = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'kyc-documents'
    
    // Create a signed URL that expires in 60 seconds
    const { data, error } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(key, 60)

    if (error || !data) {
      throw error || new Error('Failed to generate signed URL')
    }

    // Redirect the user directly to the signed URL so they can view the file natively
    return NextResponse.redirect(data.signedUrl)
  } catch (error) {
    console.error('Error generating signed URL:', error)
    return NextResponse.json({ error: 'Failed to access file' }, { status: 500 })
  }
}
