import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

/**
 * Mirrors Medusa admin GET /admin/fulfillment-providers/:id/options
 * so vendors can create shipping options with the manual provider.
 */
export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const { id } = req.params
  const fulfillmentModule = req.scope.resolve(Modules.FULFILLMENT) as {
    retrieveFulfillmentOptions?: (providerId: string) => Promise<unknown[]>
    listFulfillmentOptions?: (providerId: string) => Promise<unknown[]>
  }

  try {
    const fulfillment_options =
      (await fulfillmentModule.retrieveFulfillmentOptions?.(id)) ||
      (await fulfillmentModule.listFulfillmentOptions?.(id)) ||
      []

    res.json({
      fulfillment_options,
      count: Array.isArray(fulfillment_options)
        ? fulfillment_options.length
        : 0,
      offset: 0,
      limit: Array.isArray(fulfillment_options)
        ? fulfillment_options.length
        : 0,
    })
  } catch {
    // Manual provider fallback — enough for flat-rate shipping options
    const fulfillment_options =
      id === "manual_manual" || id === "manual"
        ? [
            {
              id: "manual-fulfillment",
              name: "Manual fulfillment",
              is_return: false,
            },
            {
              id: "manual-fulfillment-return",
              name: "Manual return",
              is_return: true,
            },
          ]
        : []

    res.json({
      fulfillment_options,
      count: fulfillment_options.length,
      offset: 0,
      limit: fulfillment_options.length,
    })
  }
}
