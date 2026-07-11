import { z } from "zod"
import {
  createFindParams,
  createSelectParams,
} from "@medusajs/medusa/api/utils/validators"

export type AdminGetPlatformShippingOptionsParamsType = z.infer<
  typeof AdminGetPlatformShippingOptionsParams
>
export const AdminGetPlatformShippingOptionsParams = createFindParams({
  offset: 0,
  limit: 50,
}).merge(
  z.object({
    is_active: z.preprocess(
      (val) => {
        if (val === "true") return true
        if (val === "false") return false
        return val
      },
      z.boolean().optional()
    ),
  })
)

export type AdminGetPlatformShippingOptionParamsType = z.infer<
  typeof AdminGetPlatformShippingOptionParams
>
export const AdminGetPlatformShippingOptionParams = createSelectParams()

export type AdminCreatePlatformShippingOptionType = z.infer<
  typeof AdminCreatePlatformShippingOption
>
export const AdminCreatePlatformShippingOption = z.object({
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  courier_label: z.string().nullable().optional(),
  currency_code: z.string().default("inr"),
  amount: z.number().min(0),
  country_codes: z
    .union([
      z.array(z.string()),
      z.object({ countries: z.array(z.string()) }),
    ])
    .optional()
    .transform((val) => {
      if (!val) return { countries: ["in"] }
      if (Array.isArray(val)) return { countries: val }
      return val
    }),
  is_active: z.boolean().optional(),
  is_default: z.boolean().optional(),
  metadata: z.record(z.unknown()).nullable().optional(),
})

export type AdminUpdatePlatformShippingOptionType = z.infer<
  typeof AdminUpdatePlatformShippingOption
>
export const AdminUpdatePlatformShippingOption = z.object({
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  courier_label: z.string().nullable().optional(),
  currency_code: z.string().optional(),
  amount: z.number().min(0).optional(),
  country_codes: z
    .union([
      z.array(z.string()),
      z.object({ countries: z.array(z.string()) }),
    ])
    .optional()
    .transform((val) => {
      if (val === undefined) return undefined
      if (Array.isArray(val)) return { countries: val }
      return val
    }),
  is_active: z.boolean().optional(),
  is_default: z.boolean().optional(),
  metadata: z.record(z.unknown()).nullable().optional(),
})
