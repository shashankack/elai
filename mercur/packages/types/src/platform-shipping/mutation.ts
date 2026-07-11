export interface CreatePlatformShippingOptionDTO {
  name: string
  description?: string | null
  courier_label?: string | null
  currency_code?: string
  amount: number
  country_codes?: string[] | { countries: string[] }
  is_active?: boolean
  is_default?: boolean
  metadata?: Record<string, unknown> | null
}

export interface UpdatePlatformShippingOptionDTO {
  id: string
  name?: string
  description?: string | null
  courier_label?: string | null
  currency_code?: string
  amount?: number
  country_codes?: string[] | { countries: string[] }
  is_active?: boolean
  is_default?: boolean
  metadata?: Record<string, unknown> | null
}

export interface CreatePlatformShippingOptInDTO {
  seller_id: string
  stock_location_id: string
  platform_shipping_option_id: string
  shipping_option_id?: string | null
  is_enabled?: boolean
  metadata?: Record<string, unknown> | null
}

export interface UpdatePlatformShippingOptInDTO {
  id: string
  shipping_option_id?: string | null
  is_enabled?: boolean
  metadata?: Record<string, unknown> | null
}
