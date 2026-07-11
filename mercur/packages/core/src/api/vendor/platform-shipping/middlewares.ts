import {
  validateAndTransformBody,
  MiddlewareRoute,
} from "@medusajs/framework"

import {
  VendorOptInPlatformShipping,
  VendorOptOutPlatformShipping,
} from "./validators"

export const vendorPlatformShippingMiddlewares: MiddlewareRoute[] = [
  {
    method: ["GET"],
    matcher: "/vendor/platform-shipping/options",
    middlewares: [],
  },
  {
    method: ["GET"],
    matcher: "/vendor/platform-shipping/opt-ins",
    middlewares: [],
  },
  {
    method: ["POST"],
    matcher: "/vendor/platform-shipping/opt-in",
    middlewares: [validateAndTransformBody(VendorOptInPlatformShipping)],
  },
  {
    method: ["POST"],
    matcher: "/vendor/platform-shipping/opt-out",
    middlewares: [validateAndTransformBody(VendorOptOutPlatformShipping)],
  },
]
