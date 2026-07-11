import {
  validateAndTransformBody,
  validateAndTransformQuery,
  MiddlewareRoute,
} from "@medusajs/framework"

import { platformShippingOptionQueryConfig } from "./query-config"
import {
  AdminCreatePlatformShippingOption,
  AdminGetPlatformShippingOptionParams,
  AdminGetPlatformShippingOptionsParams,
  AdminUpdatePlatformShippingOption,
} from "./validators"

export const adminPlatformShippingOptionRoutesMiddlewares: MiddlewareRoute[] = [
  {
    method: ["GET"],
    matcher: "/admin/platform-shipping-options",
    middlewares: [
      validateAndTransformQuery(
        AdminGetPlatformShippingOptionsParams,
        platformShippingOptionQueryConfig.list
      ),
    ],
  },
  {
    method: ["POST"],
    matcher: "/admin/platform-shipping-options",
    middlewares: [
      validateAndTransformBody(AdminCreatePlatformShippingOption),
      validateAndTransformQuery(
        AdminGetPlatformShippingOptionParams,
        platformShippingOptionQueryConfig.retrieve
      ),
    ],
  },
  {
    method: ["GET"],
    matcher: "/admin/platform-shipping-options/:id",
    middlewares: [
      validateAndTransformQuery(
        AdminGetPlatformShippingOptionParams,
        platformShippingOptionQueryConfig.retrieve
      ),
    ],
  },
  {
    method: ["POST"],
    matcher: "/admin/platform-shipping-options/:id",
    middlewares: [
      validateAndTransformBody(AdminUpdatePlatformShippingOption),
      validateAndTransformQuery(
        AdminGetPlatformShippingOptionParams,
        platformShippingOptionQueryConfig.retrieve
      ),
    ],
  },
  {
    method: ["DELETE"],
    matcher: "/admin/platform-shipping-options/:id",
    middlewares: [],
  },
]
