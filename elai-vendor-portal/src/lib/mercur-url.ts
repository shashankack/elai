const DEFAULT_VENDOR_URL = 'http://localhost:7001'

export function getMercurVendorUrl(): string {
  return (
    process.env.NEXT_PUBLIC_MERCUR_VENDOR_URL ||
    process.env.MERCUR_VENDOR_URL ||
    DEFAULT_VENDOR_URL
  ).replace(/\/$/, '')
}

export function getMercurVendorRegisterUrl(): string {
  return `${getMercurVendorUrl()}/register`
}

export function getMercurVendorLoginUrl(): string {
  return `${getMercurVendorUrl()}/login`
}
