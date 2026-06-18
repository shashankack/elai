import { supabase } from '@/lib/supabase'

export async function getSignedStorageUrl(
  key: string,
  expiresInSeconds = 60 * 60 * 24 * 365
): Promise<string | null> {
  const bucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'kyc-documents'
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(key, expiresInSeconds)

  if (error || !data?.signedUrl) {
    console.error('Failed to create signed storage URL:', error?.message)
    return null
  }

  return data.signedUrl
}
