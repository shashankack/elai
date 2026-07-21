import { mercurConfig } from './config'

export class MercurStoreError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

type StoreFetchOptions = {
  method?: 'GET' | 'POST' | 'DELETE'
  body?: unknown
  searchParams?: Record<string, string | number | boolean | undefined>
  /** Skip Next.js Data Cache (required for cart mutations). */
  cache?: RequestCache
  revalidate?: number | false
  /** Bearer JWT for customer-authenticated store/auth calls. */
  token?: string | null
  /** Skip publishable key (rarely needed for pure /auth routes). */
  skipPublishableKey?: boolean
}

export async function storeFetch<T>(
  path: string,
  options: StoreFetchOptions = {},
): Promise<T> {
  const url = new URL(`${mercurConfig.backendUrl}${path}`)
  const method = options.method ?? 'GET'

  if (options.searchParams) {
    for (const [key, value] of Object.entries(options.searchParams)) {
      if (value !== undefined && value !== '') {
        url.searchParams.set(key, String(value))
      }
    }
  }

  const headers: Record<string, string> = {
    Accept: 'application/json',
  }

  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  if (mercurConfig.publishableApiKey && !options.skipPublishableKey) {
    headers['x-publishable-api-key'] = mercurConfig.publishableApiKey
  }

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`
  }

  const isMutation = method !== 'GET'
  const init: RequestInit = {
    method,
    headers,
    body:
      options.body !== undefined ? JSON.stringify(options.body) : undefined,
    cache: options.cache ?? (isMutation ? 'no-store' : undefined),
  }

  // `next.revalidate` is only valid in the Next.js server runtime.
  if (
    typeof window === 'undefined' &&
    !isMutation &&
    options.revalidate !== false
  ) {
    ;(init as RequestInit & { next?: { revalidate: number } }).next = {
      revalidate: options.revalidate ?? 60,
    }
  }

  const response = await fetch(url, init)

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

  if (response.status === 204) {
    return {} as T
  }

  const text = await response.text()
  if (!text) return {} as T
  try {
    return JSON.parse(text) as T
  } catch {
    // Some Medusa routes return plain text like "Created" on success.
    // For our flows, returning {} is enough to proceed (caller often re-reads /me).
    return {} as T
  }
}
