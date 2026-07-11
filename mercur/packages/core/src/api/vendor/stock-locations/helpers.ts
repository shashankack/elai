import { MedusaContainer } from "@medusajs/framework"
import {
  ContainerRegistrationKeys,
  MedusaError,
  Modules,
} from "@medusajs/framework/utils"

export const validateSellerStockLocation = async (
  scope: MedusaContainer,
  sellerId: string,
  stockLocationId: string
) => {
  const query = scope.resolve(ContainerRegistrationKeys.QUERY)

  const {
    data: [sellerStockLocation],
  } = await query.graph({
    entity: "stock_location_seller",
    filters: {
      seller_id: sellerId,
      stock_location_id: stockLocationId,
    },
    fields: ["seller_id", "stock_location_id"],
  })

  if (!sellerStockLocation) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Stock location with id: ${stockLocationId} was not found`
    )
  }
}

export const refetchStockLocation = async (
  scope: MedusaContainer,
  stockLocationId: string,
  fields: string[]
) => {
  const query = scope.resolve(ContainerRegistrationKeys.QUERY)

  const {
    data: [stockLocation],
  } = await query.graph({
    entity: "stock_location",
    filters: { id: stockLocationId },
    fields,
  })

  return stockLocation
}

/**
 * Link a fulfillment provider to a stock location if it is not already linked.
 * Sellers need this before creating shipping options (Medusa rejects otherwise).
 */
export const ensureStockLocationFulfillmentProvider = async (
  scope: MedusaContainer,
  stockLocationId: string,
  providerId = "manual_manual"
) => {
  const query = scope.resolve(ContainerRegistrationKeys.QUERY)
  const link = scope.resolve(ContainerRegistrationKeys.LINK)

  const {
    data: [location],
  } = await query.graph({
    entity: "stock_location",
    filters: { id: stockLocationId },
    fields: ["id", "fulfillment_providers.id"],
  })

  const alreadyLinked = location?.fulfillment_providers?.some(
    (p: { id?: string }) => p?.id === providerId
  )

  if (alreadyLinked) {
    return
  }

  await link.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: stockLocationId,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_provider_id: providerId,
    },
  })
}

/**
 * Resolve the stock location that owns a service zone, then ensure the
 * given fulfillment provider is enabled on it.
 */
export const ensureServiceZoneFulfillmentProvider = async (
  scope: MedusaContainer,
  serviceZoneId: string,
  providerId = "manual_manual"
) => {
  const query = scope.resolve(ContainerRegistrationKeys.QUERY)

  const {
    data: [serviceZone],
  } = await query.graph({
    entity: "service_zone",
    fields: ["id", "fulfillment_set.location.id"],
    filters: { id: serviceZoneId },
  })

  const locationId = serviceZone?.fulfillment_set?.location?.id

  if (!locationId) {
    return
  }

  await ensureStockLocationFulfillmentProvider(scope, locationId, providerId)
}
