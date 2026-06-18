import { mercurConfig } from './config'

export class MercurStoreError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

type StoreFetchOptions = {
  searchParams?: Record<string, string | number | boolean | undefined>
}

export async function storeFetch<T>(
  path: string,
  options: StoreFetchOptions = {},
): Promise<T> {
  const url = new URL(`${mercurConfig.backendUrl}${path}`)

  if (options.searchParams) {
    for (const [key, value] of Object.entries(options.searchParams)) {
      if (value !== undefined && value !== '') {
        url.searchParams.set(key, String(value))
      }
    }
  }

  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  }

  if (mercurConfig.publishableApiKey) {
    headers['x-publishable-api-key'] = mercurConfig.publishableApiKey
  }

  const response = await fetch(url, {
    headers,
    next: { revalidate: 60 },
  })

  if (!response.ok) {
    let detail = response.statusText
    try {
      const body = (await response.json()) as { message?: string }
      if (body.message) detail = body.message
    } catch {
      // ignore parse errors
    }
    throw new MercurStoreError(detail, response.status)
  }

  return response.json() as Promise<T>
}
