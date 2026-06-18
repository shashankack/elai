export interface MercurSellerOnboardingResult {
  sellerId: string
  handle: string
  status: string
}

export interface CreateVendorSellerInput {
  first_name: string
  last_name: string
  email: string
  password: string
  name: string
  store_email: string
  phone: string
  description?: string
  handle?: string
  address_1: string
  city: string
  province: string
  postal_code: string
  corporate_name: string
  tax_id: string
  registration_number?: string
  holder_name: string
  bank_name: string
  routing_number: string
  account_number: string
  metadata?: Record<string, unknown>
}

function getMercurBaseUrl(): string {
  const baseUrl = (process.env.MERCUR_API_URL || '').replace(/\/$/, '')
  if (!baseUrl) {
    throw new Error('MERCUR_API_URL is not configured')
  }
  return baseUrl
}

function getDefaultCurrency(): string {
  return (process.env.MERCUR_DEFAULT_CURRENCY_CODE || 'usd').toLowerCase()
}

function getDefaultCountry(): string {
  return (process.env.MERCUR_DEFAULT_COUNTRY_CODE || 'in').toLowerCase()
}

function slugifyHandle(name: string): string | undefined {
  const handle = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)
  return handle || undefined
}

function extractErrorMessage(body: unknown, status: number): string {
  if (body && typeof body === 'object') {
    const record = body as Record<string, unknown>
    if (typeof record.message === 'string') return record.message
    if (typeof record.error === 'string') return record.error
  }
  return `Mercur API error (${status})`
}

async function mercurRequest<T>(
  path: string,
  options: RequestInit & { token?: string } = {}
): Promise<T> {
  const { token, headers, ...rest } = options
  const response = await fetch(`${getMercurBaseUrl()}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers || {}),
    },
  })

  const body = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(extractErrorMessage(body, response.status))
  }

  return body as T
}

export async function registerMercurMember(
  email: string,
  password: string
): Promise<string> {
  const data = await mercurRequest<{ token?: string }>(
    '/auth/member/emailpass/register',
    {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }
  )

  if (!data.token) {
    throw new Error('Mercur registration did not return a token')
  }

  return data.token
}

export async function createMercurVendorSeller(
  token: string,
  input: CreateVendorSellerInput
): Promise<MercurSellerOnboardingResult> {
  const countryCode = getDefaultCountry()
  const currencyCode = getDefaultCurrency()
  const handle = input.handle?.trim() || slugifyHandle(input.name)

  const data = await mercurRequest<{
    seller: { id: string; handle: string; status: string }
  }>('/vendor/sellers', {
    method: 'POST',
    token,
    body: JSON.stringify({
      name: input.name,
      handle,
      email: input.store_email,
      phone: input.phone,
      member_email: input.email,
      first_name: input.first_name,
      last_name: input.last_name,
      currency_code: currencyCode,
      description: input.description || undefined,
      address: {
        address_1: input.address_1,
        city: input.city,
        province: input.province,
        postal_code: input.postal_code,
        country_code: countryCode,
      },
      professional_details: {
        corporate_name: input.corporate_name,
        registration_number: input.registration_number || null,
        tax_id: input.tax_id,
      },
      payment_details: {
        country_code: countryCode,
        holder_name: input.holder_name,
        bank_name: input.bank_name,
        routing_number: input.routing_number,
        account_number: input.account_number,
      },
      metadata: {
        onboarding_source: 'elai-vendor-portal',
        ...input.metadata,
      },
    }),
  })

  return {
    sellerId: data.seller.id,
    handle: data.seller.handle,
    status: data.seller.status,
  }
}

export async function submitVendorOnboarding(
  input: CreateVendorSellerInput
): Promise<MercurSellerOnboardingResult> {
  const token = await registerMercurMember(input.email, input.password)
  return createMercurVendorSeller(token, input)
}
