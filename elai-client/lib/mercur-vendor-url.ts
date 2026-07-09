const vendorBase =
  process.env.NEXT_PUBLIC_MERCUR_VENDOR_URL ?? 'http://localhost:7001'

/** Mercur vendor portal  register then onboarding wizard */
export const MERCUR_VENDOR_REGISTER_URL = `${vendorBase.replace(/\/$/, '')}/register`
