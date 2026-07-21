/**
 * Opt all sellers into ELAI platform shipping (ELAI Standard Delivery).
 *
 * Creates a stock location when a seller has none, links it to the default
 * sales channel, then runs optInPlatformShippingWorkflow so storefront
 * checkout can return seller-scoped shipping options.
 *
 * Usage (from mercur/apps/api):
 *   bun run seed:seller-shipping -- --force
 *
 * Safe for local Neon. Do not run against production unless explicitly asked.
 */
import { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"
import { linkSalesChannelsToStockLocationWorkflow } from "@medusajs/medusa/core-flows"
import { MercurModules } from "@mercurjs/types"
import {
  createSellerStockLocationsWorkflow,
  optInPlatformShippingWorkflow,
} from "@mercurjs/core/workflows"

type SellerRow = {
  id: string
  name?: string | null
  handle?: string | null
}

type PlatformShippingService = {
  listPlatformShippingOptions: (
    filters?: Record<string, unknown>
  ) => Promise<
    {
      id: string
      name?: string
      is_default?: boolean
      is_active?: boolean
    }[]
  >
  createPlatformShippingOptions: (
    data: Record<string, unknown>[]
  ) => Promise<unknown[]>
}

export default async function seedSellerShipping({
  container,
  args,
}: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const force = (args ?? []).some((a) => a === "force" || a === "--force")

  if (!force) {
    logger.error(
      "Refusing without --force. Example: bun run seed:seller-shipping -- --force",
    )
    return
  }

  const platformShipping = container.resolve(
    MercurModules.PLATFORM_SHIPPING,
  ) as PlatformShippingService

  let [platformOption] = await platformShipping.listPlatformShippingOptions({
    is_default: true,
    is_active: true,
  })

  if (!platformOption) {
    const [anyActive] = await platformShipping.listPlatformShippingOptions({
      is_active: true,
    })
    platformOption = anyActive
  }

  if (!platformOption) {
    logger.info("No platform shipping option found   creating ELAI Standard Delivery…")
    const created = (await platformShipping.createPlatformShippingOptions([
      {
        name: "ELAI Standard Delivery",
        description:
          "ELAI arranges courier pickup and delivery (BlueDart / Shiprocket). You pack the order.",
        courier_label: "BlueDart / Shiprocket",
        currency_code: "inr",
        amount: 79,
        country_codes: { countries: ["in"] },
        is_active: true,
        is_default: true,
      },
    ])) as { id: string }[]
    platformOption = created[0] as typeof platformOption
  }

  if (!platformOption?.id) {
    logger.error("Could not resolve a platform shipping option.")
    return
  }

  logger.info(
    `Using platform option: ${platformOption.name ?? platformOption.id} (${platformOption.id})`,
  )

  const salesChannelModule = container.resolve(Modules.SALES_CHANNEL)
  const storeModule = container.resolve(Modules.STORE)
  const [store] = await storeModule.listStores()
  let salesChannelId = store?.default_sales_channel_id as string | undefined

  if (!salesChannelId) {
    const channels = await salesChannelModule.listSalesChannels({
      name: "Default Sales Channel",
    })
    salesChannelId = channels[0]?.id
  }

  if (!salesChannelId) {
    logger.error("No default sales channel found. Run seed first.")
    return
  }

  const sellerModule = container.resolve(MercurModules.SELLER) as {
    listSellers: (
      filters?: Record<string, unknown>,
      config?: Record<string, unknown>,
    ) => Promise<SellerRow[]>
  }

  const sellers = await sellerModule.listSellers({}, { take: 500 })
  if (!sellers.length) {
    logger.warn("No sellers found.")
    return
  }

  logger.info(`Opting in ${sellers.length} seller(s)…`)

  let ok = 0
  let skipped = 0
  let failed = 0

  for (const seller of sellers) {
    const label = seller.name || seller.handle || seller.id
    try {
      const { data: links } = await query.graph({
        entity: "stock_location_seller",
        filters: { seller_id: seller.id },
        fields: ["stock_location_id", "stock_location.id", "stock_location.name"],
      })

      let stockLocationId = links?.[0]?.stock_location_id as string | undefined

      if (!stockLocationId) {
        logger.info(`[${label}] No stock location   creating “Main dispatch”…`)
        const { result: locations } =
          await createSellerStockLocationsWorkflow(container).run({
            input: {
              seller_id: seller.id,
              locations: [
                {
                  name: "Main dispatch",
                  address: {
                    address_1: "India",
                    city: "Mumbai",
                    country_code: "in",
                    postal_code: "400001",
                  },
                },
              ],
            },
          })
        stockLocationId = locations[0]?.id
      }

      if (!stockLocationId) {
        throw new Error("Could not resolve stock location id")
      }

      const {
        data: [channelLink],
      } = await query.graph({
        entity: "sales_channel_location",
        filters: {
          sales_channel_id: salesChannelId,
          stock_location_id: stockLocationId,
        },
        fields: ["stock_location_id"],
      })

      if (!channelLink) {
        logger.info(`[${label}] Linking location to default sales channel…`)
        await linkSalesChannelsToStockLocationWorkflow(container).run({
          input: {
            id: stockLocationId,
            add: [salesChannelId],
          },
        })
      }

      const { result } = await optInPlatformShippingWorkflow(container).run({
        input: {
          seller_id: seller.id,
          stock_location_id: stockLocationId,
          platform_shipping_option_id: platformOption.id,
        },
      })

      if (result?.is_enabled && result?.shipping_option_id) {
        logger.info(
          `[${label}] OK   shipping_option=${result.shipping_option_id}`,
        )
        ok++
      } else {
        logger.warn(`[${label}] Opt-in returned unexpected shape: ${JSON.stringify(result)}`)
        skipped++
      }
    } catch (error: unknown) {
      failed++
      logger.error(
        `[${label}] Failed: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  logger.info(
    `=== seed:seller-shipping complete   ok=${ok} skipped=${skipped} failed=${failed} ===`,
  )
}
