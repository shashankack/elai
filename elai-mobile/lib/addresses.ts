import { sdk } from '@/lib/sdk'

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

export type CheckoutAddressForm = {
  firstName: string
  lastName: string
  address: string
  city: string
  postalCode: string
  countryCode: string
  phone: string
}

export async function listCustomerAddresses(): Promise<StoreCustomerAddress[]> {
  const data = await sdk.client.fetch<{
    addresses?: StoreCustomerAddress[]
  }>('/store/customers/me/addresses', {
    query: { limit: 50 },
  })
  return data.addresses ?? []
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

export function addressLabel(address: StoreCustomerAddress): string {
  if (address.address_name?.trim()) return address.address_name.trim()
  if (address.is_default_shipping) return 'Default shipping'
  const city = address.city?.trim()
  if (city) return city
  return 'Saved address'
}

export function customerAddressToForm(
  address: StoreCustomerAddress,
): CheckoutAddressForm {
  return {
    firstName: address.first_name || '',
    lastName: address.last_name || '',
    address: address.address_1 || '',
    city: address.city || '',
    postalCode: address.postal_code || '',
    countryCode: (address.country_code || '').toLowerCase(),
    phone: address.phone || '',
  }
}

export function pickDefaultAddress(
  addresses: StoreCustomerAddress[],
): StoreCustomerAddress | null {
  if (!addresses.length) return null
  return (
    addresses.find((a) => a.is_default_shipping) ||
    addresses.find((a) => a.is_default_billing) ||
    addresses[0]
  )
}
