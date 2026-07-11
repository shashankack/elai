import { Module } from "@medusajs/framework/utils"
import { MercurModules } from "@mercurjs/types"

import PlatformShippingModuleService from "./service"

export const PLATFORM_SHIPPING_MODULE = MercurModules.PLATFORM_SHIPPING

export default Module(MercurModules.PLATFORM_SHIPPING, {
  service: PlatformShippingModuleService,
})
