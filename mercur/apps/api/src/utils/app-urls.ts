/**
 * Shared app URL helpers for transactional emails.
 * In production, localhost fallbacks are rejected so reset/invite links never
 * point at developer machines.
 */
export function isProductionRuntime() {
  return process.env.NODE_ENV === "production"
}

export function requireAppUrl(
  envKeys: string[],
  localhostFallback: string,
  label: string,
): string {
  for (const key of envKeys) {
    const value = process.env[key]?.trim()
    if (value) {
      return value.replace(/\/$/, "")
    }
  }

  if (isProductionRuntime()) {
    throw new Error(
      `Missing ${envKeys.join(" or ")} for ${label} in production. ` +
        `Set a public HTTPS URL (localhost fallbacks are not allowed).`,
    )
  }

  return localhostFallback.replace(/\/$/, "")
}

export function storefrontBaseUrl() {
  return requireAppUrl(
    ["STOREFRONT_URL", "MERCUR_STOREFRONT_URL"],
    "http://localhost:3000",
    "customer storefront links",
  )
}

export function vendorBaseUrl() {
  return requireAppUrl(
    ["MERCUR_VENDOR_URL"],
    "http://localhost:7001",
    "vendor portal links",
  )
}

export function adminBaseUrl() {
  return requireAppUrl(
    ["MERCUR_ADMIN_URL", "ADMIN_URL"],
    "http://localhost:7000",
    "admin portal links",
  )
}
