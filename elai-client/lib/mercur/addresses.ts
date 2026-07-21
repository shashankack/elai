import { assertMercurConfigured } from './config'
import { storeFetch } from './store-client'

export type StoreCustomerAddress = {
  id: string
  address_name?: string | null
  is_default_shipping?: boolean
  is_default_billing?: boolean
  company?: string | null
  first_name?: string | null
  last_name?: string | null
  address_1?: string | null
  address_2?: string | null
  city?: string | null
  country_code?: string | null
  province?: string | null
  postal_code?: string | null
  phone?: string | null
}

export type AddressInput = {
  address_name?: string
  first_name?: string
  last_name?: string
  phone?: string
  company?: string
  address_1: string
  address_2?: string
  city: string
  province?: string
  postal_code: string
  country_code?: string
  is_default_shipping?: boolean
  is_default_billing?: boolean
}

type AddressListResponse = {
  addresses: StoreCustomerAddress[]
  count?: number
}

type AddressResponse = {
  address?: StoreCustomerAddress
  customer?: { addresses?: StoreCustomerAddress[] }
}

function pickAddressFromResponse(
  data: AddressResponse,
  fallbackMatch?: (a: StoreCustomerAddress) => boolean,
): StoreCustomerAddress {
  if (data.address?.id) return data.address
  const list = data.customer?.addresses ?? []
  if (fallbackMatch) {
    const matched = list.find(fallbackMatch)
    if (matched) return matched
  }
  const latest = list[list.length - 1]
  if (latest?.id) return latest
  throw new Error('Address was saved but the API did not return it.')
}

export async function listCustomerAddresses(
  token: string,
): Promise<StoreCustomerAddress[]> {
  assertMercurConfigured()
  const data = await storeFetch<AddressListResponse>(
    '/store/customers/me/addresses',
    {
      token,
      searchParams: { limit: 50 },
      cache: 'no-store',
    },
  )
  return data.addresses ?? []
}

export async function createCustomerAddress(
  token: string,
  input: AddressInput,
): Promise<StoreCustomerAddress> {
  assertMercurConfigured()
  const body = normalizeAddress(input)
  const data = await storeFetch<AddressResponse>(
    '/store/customers/me/addresses',
    {
      method: 'POST',
      token,
      body,
      cache: 'no-store',
    },
  )
  return pickAddressFromResponse(data, (a) => {
    return (
      a.address_1 === body.address_1 &&
      a.postal_code === body.postal_code &&
      a.city === body.city
    )
  })
}

export async function updateCustomerAddress(
  token: string,
  addressId: string,
  input: AddressInput,
): Promise<StoreCustomerAddress> {
  assertMercurConfigured()
  const data = await storeFetch<AddressResponse>(
    `/store/customers/me/addresses/${addressId}`,
    {
      method: 'POST',
      token,
      body: normalizeAddress(input),
      cache: 'no-store',
    },
  )
  return pickAddressFromResponse(data, (a) => a.id === addressId)
}

export async function deleteCustomerAddress(
  token: string,
  addressId: string,
): Promise<void> {
  assertMercurConfigured()
  await storeFetch(`/store/customers/me/addresses/${addressId}`, {
    method: 'DELETE',
    token,
    cache: 'no-store',
  })
}

export function formatAddressLines(address: StoreCustomerAddress): string[] {
  const lines: string[] = []
  const name = [address.first_name, address.last_name].filter(Boolean).join(' ')
  if (name) lines.push(name)
  if (address.company) lines.push(address.company)
  if (address.address_1) lines.push(address.address_1)
  if (address.address_2) lines.push(address.address_2)
  const cityLine = [address.city, address.province, address.postal_code]
    .filter(Boolean)
    .join(', ')
  if (cityLine) lines.push(cityLine)
  if (address.country_code) lines.push(address.country_code.toUpperCase())
  if (address.phone) lines.push(address.phone)
  return lines
}

function normalizeAddress(input: AddressInput) {
  return {
    address_name: input.address_name?.trim() || undefined,
    first_name: input.first_name?.trim() || undefined,
    last_name: input.last_name?.trim() || undefined,
    phone: input.phone?.trim() || undefined,
    company: input.company?.trim() || undefined,
    address_1: input.address_1.trim(),
    address_2: input.address_2?.trim() || undefined,
    city: input.city.trim(),
    province: input.province?.trim() || undefined,
    postal_code: input.postal_code.trim(),
    country_code: (input.country_code || 'in').trim().toLowerCase(),
    is_default_shipping: Boolean(input.is_default_shipping),
    is_default_billing: Boolean(input.is_default_billing),
  }
}
