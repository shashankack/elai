import { z } from "zod"

export type VendorOptInPlatformShippingType = z.infer<
  typeof VendorOptInPlatformShipping
>
export const VendorOptInPlatformShipping = z.object({
  platform_shipping_option_id: z.string().min(1),
  stock_location_id: z.string().min(1),
})

export type VendorOptOutPlatformShippingType = z.infer<
  typeof VendorOptOutPlatformShipping
>
export const VendorOptOutPlatformShipping = z.object({
  platform_shipping_option_id: z.string().min(1),
  stock_location_id: z.string().min(1),
})
