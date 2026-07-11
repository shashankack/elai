import { DeleteResponse, PaginatedResponse } from "@medusajs/types"
import {
  PlatformShippingOptInDTO,
  PlatformShippingOptionDTO,
} from "../platform-shipping"

export interface AdminPlatformShippingOptionResponse {
  platform_shipping_option: PlatformShippingOptionDTO
}

export type AdminPlatformShippingOptionListResponse = PaginatedResponse<{
  platform_shipping_options: PlatformShippingOptionDTO[]
}>

export type AdminPlatformShippingOptionDeleteResponse =
  DeleteResponse<"platform_shipping_option">

export interface VendorPlatformShippingOptionListResponse {
  platform_shipping_options: PlatformShippingOptionDTO[]
}

export interface VendorPlatformShippingOptInResponse {
  platform_shipping_opt_in: PlatformShippingOptInDTO
}

export interface VendorPlatformShippingOptInListResponse {
  platform_shipping_opt_ins: PlatformShippingOptInDTO[]
}
