const backendUrl =
  process.env.MERCUR_BACKEND_URL ??
  process.env.NEXT_PUBLIC_MERCUR_BACKEND_URL ??
  'http://localhost:9000'

export const mercurConfig = {
  backendUrl: backendUrl.replace(/\/$/, ''),
  publishableApiKey:
    process.env.MERCUR_PUBLISHABLE_API_KEY ??
    process.env.NEXT_PUBLIC_MERCUR_PUBLISHABLE_API_KEY ??
    '',
}

export function assertMercurConfigured() {
  if (!mercurConfig.publishableApiKey) {
    throw new Error(
      'Missing MERCUR_PUBLISHABLE_API_KEY. Create a publishable key in Mercur admin and add it to .env.',
    )
  }
}
