import { assertMercurConfigured, mercurConfig } from './config'
import { storeFetch, MercurStoreError } from './store-client'

export type StoreCustomer = {
  id: string
  email: string
  first_name?: string | null
  last_name?: string | null
  phone?: string | null
  company_name?: string | null
  has_account?: boolean
  metadata?: Record<string, unknown> | null
}

type TokenResponse = { token: string }
type CustomerResponse = { customer: StoreCustomer }

async function authFetch<T>(
  path: string,
  options: {
    method?: 'GET' | 'POST' | 'DELETE'
    body?: unknown
    token?: string | null
  } = {},
): Promise<T> {
  const url = `${mercurConfig.backendUrl}${path}`
  const headers: Record<string, string> = {
    Accept: 'application/json',
  }
  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }
  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`
  }

  const response = await fetch(url, {
    method: options.method ?? 'POST',
    headers,
    body:
      options.body !== undefined ? JSON.stringify(options.body) : undefined,
    cache: 'no-store',
  })

  if (!response.ok) {
    let detail = response.statusText
    try {
      const body = (await response.json()) as { message?: string }
      if (body.message) detail = body.message
    } catch {
      // ignore
    }
    throw new MercurStoreError(detail, response.status)
  }

  if (response.status === 204) return {} as T
  const text = await response.text()
  if (!text) return {} as T
  try {
    return JSON.parse(text) as T
  } catch {
    // Some Medusa routes return plain text like "Created" on success.
    return {} as T
  }
}

function isIdentityExistsError(error: unknown): boolean {
  return (
    error instanceof MercurStoreError &&
    error.status === 401 &&
    /identity.*already exists|already exists/i.test(error.message)
  )
}

function tokenHasCustomerActor(token: string): boolean {
  try {
    const [, payload] = token.split('.')
    if (!payload) return false
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    const pad = normalized.length % 4
    const padded = pad ? normalized + '='.repeat(4 - pad) : normalized
    const json = JSON.parse(atob(padded)) as { actor_id?: string }
    return Boolean(json.actor_id)
  } catch {
    return false
  }
}

async function requestLoginToken(
  email: string,
  password: string,
): Promise<string> {
  const data = await authFetch<TokenResponse>('/auth/customer/emailpass', {
    body: { email, password },
  })
  if (!data.token) throw new Error('Login succeeded but no token was returned.')
  return data.token
}

/**
 * Auth identity can exist without a store customer (failed/partial signup).
 * Login then returns a JWT with empty actor_id and /me returns 401.
 * Create the customer when needed, then re-login so the JWT includes actor_id.
 * (Token refresh alone is easy to get wrong; a fresh login is reliable.)
 */
async function ensureStoreCustomer(
  token: string,
  input: {
    email: string
    password: string
    first_name?: string
    last_name?: string
  },
): Promise<string> {
  if (tokenHasCustomerActor(token)) {
    try {
      await retrieveCustomer(token)
      return token
    } catch {
      // fall through and repair
    }
  } else {
    try {
      await retrieveCustomer(token)
      return token
    } catch (err) {
      if (!(err instanceof MercurStoreError) || err.status !== 401) {
        throw err
      }
    }
  }

  try {
    await storeFetch<CustomerResponse>('/store/customers', {
      method: 'POST',
      token,
      body: {
        email: input.email.trim().toLowerCase(),
        first_name: input.first_name?.trim() || undefined,
        last_name: input.last_name?.trim() || undefined,
      },
      cache: 'no-store',
    })
  } catch (err) {
    if (err instanceof MercurStoreError && err.status === 500) {
      throw new MercurStoreError(
        'This email has a broken login record from a previous signup. In dev, run `bun run wipe:customers-dev -- --force` in mercur/apps/api, then register again.',
        409,
      )
    }
    // Already linked in a race, or customer row exists   re-login below.
    if (
      !(err instanceof MercurStoreError) ||
      (err.status !== 400 && err.status !== 401)
    ) {
      throw err
    }
  }

  return requestLoginToken(input.email, input.password)
}

export async function loginCustomer(
  email: string,
  password: string,
  profile?: { first_name?: string; last_name?: string },
): Promise<string> {
  const normalized = email.trim().toLowerCase()
  const token = await requestLoginToken(normalized, password)

  return ensureStoreCustomer(token, {
    email: normalized,
    password,
    first_name: profile?.first_name,
    last_name: profile?.last_name,
  })
}

/**
 * Medusa v2 customer signup:
 * 1) register auth identity (ignore "already exists"   finish via login)
 * 2) login + ensure store customer exists
 * 3) return a JWT that includes customer actor_id (required for /me)
 */
export async function registerCustomer(input: {
  email: string
  password: string
  first_name?: string
  last_name?: string
}): Promise<string> {
  assertMercurConfigured()
  const email = input.email.trim().toLowerCase()
  let identityAlreadyExisted = false

  try {
    await authFetch<TokenResponse>('/auth/customer/emailpass/register', {
      body: { email, password: input.password },
    })
  } catch (err) {
    if (!isIdentityExistsError(err)) throw err
    identityAlreadyExisted = true
  }

  try {
    return await loginCustomer(email, input.password, {
      first_name: input.first_name,
      last_name: input.last_name,
    })
  } catch (err) {
    if (
      identityAlreadyExisted &&
      err instanceof MercurStoreError &&
      err.status === 401
    ) {
      throw new MercurStoreError(
        'An account with this email already exists. Sign in, or reset your password.',
        409,
      )
    }
    throw err
  }
}

export async function retrieveCustomer(token: string): Promise<StoreCustomer> {
  assertMercurConfigured()
  const data = await storeFetch<CustomerResponse>('/store/customers/me', {
    token,
    cache: 'no-store',
  })
  return data.customer
}

export async function updateCustomer(
  token: string,
  input: {
    first_name?: string
    last_name?: string
    phone?: string
  },
): Promise<StoreCustomer> {
  assertMercurConfigured()
  const data = await storeFetch<CustomerResponse>('/store/customers/me', {
    method: 'POST',
    token,
    body: {
      first_name: input.first_name?.trim() || undefined,
      last_name: input.last_name?.trim() || undefined,
      phone: input.phone?.trim() || undefined,
    },
    cache: 'no-store',
  })
  return data.customer
}

export async function requestPasswordReset(email: string): Promise<void> {
  await authFetch('/auth/customer/emailpass/reset-password', {
    body: {
      identifier: email.trim().toLowerCase(),
    },
  })
}

export async function updatePasswordWithToken(
  password: string,
  token: string,
): Promise<void> {
  await authFetch('/auth/customer/emailpass/update', {
    body: { password },
    token,
  })
}

/** Attach a guest bag to the logged-in customer before checkout. */
export async function transferCartToCustomer(
  cartId: string,
  token: string,
): Promise<void> {
  assertMercurConfigured()
  try {
    await storeFetch(`/store/carts/${cartId}/customer`, {
      method: 'POST',
      token,
      body: {},
      cache: 'no-store',
    })
  } catch {
    // Non-fatal   bag still works; checkout will require a linked customer.
  }
}

export { MercurStoreError }
