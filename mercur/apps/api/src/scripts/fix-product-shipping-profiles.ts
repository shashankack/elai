/**
 * Assign each seller's Default shipping profile to products that have none.
 * Without this, cart complete fails with:
 * "The cart items require shipping profiles that are not satisfied..."
 *
 * Usage (from mercur/apps/api):
 *   bun run fix:product-shipping-profiles -- --force
 */
import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { updateProductsWorkflow } from "@medusajs/medusa/core-flows"
import { MercurModules } from "@mercurjs/types"
import { createSellerShippingProfilesWorkflow } from "@mercurjs/core/workflows"

export default async function fixProductShippingProfiles({
  container,
  args,
}: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const force = (args ?? []).some((a) => a === "force" || a === "--force")

  if (!force) {
    logger.error(
      "Refusing without --force. Example: bun run fix:product-shipping-profiles -- --force",
    )
    return
  }

  const ensureProfile = async (sellerId: string) => {
    const { data: existing } = await query.graph({
      entity: "shipping_profile_seller",
      fields: ["shipping_profile_id", "shipping_profile.id"],
      filters: { seller_id: sellerId },
    })
    if (existing?.length) {
      return (
        existing[0].shipping_profile_id || existing[0].shipping_profile?.id
      ) as string
    }
    const { result } = await createSellerShippingProfilesWorkflow(container).run(
      {
        input: {
          seller_id: sellerId,
          shipping_profiles: [{ name: "Default", type: "default" }],
        },
      },
    )
    return result[0].id as string
  }

  const sellerModule = container.resolve(MercurModules.SELLER) as {
    listSellers: (
      filters?: Record<string, unknown>,
      config?: Record<string, unknown>,
    ) => Promise<{ id: string; name?: string }[]>
  }
  const sellers = await sellerModule.listSellers({}, { take: 500 })

  let fixed = 0
  let skipped = 0

  for (const seller of sellers) {
    const profileId = await ensureProfile(seller.id)
    const { data: productLinks } = await query.graph({
      entity: "product_seller",
      filters: { seller_id: seller.id },
      fields: ["product_id"],
      pagination: { take: 500 },
    })

    const productIds = (productLinks || [])
      .map((row: { product_id?: string }) => row.product_id)
      .filter(Boolean) as string[]

    if (!productIds.length) {
      continue
    }

    const { data: products } = await query.graph({
      entity: "product",
      filters: { id: productIds },
      fields: ["id", "title", "shipping_profile.id"],
    })

    const missing = (products || []).filter(
      (p: { shipping_profile?: { id?: string } }) => !p.shipping_profile?.id,
    )

    if (!missing.length) {
      skipped += (products || []).length
      continue
    }

    logger.info(
      `[${seller.name ?? seller.id}] Assigning profile ${profileId} to ${missing.length} product(s)`,
    )

    await updateProductsWorkflow(container).run({
      input: {
        products: missing.map((p: { id: string }) => ({
          id: p.id,
          shipping_profile_id: profileId,
        })),
      },
    })

    fixed += missing.length
    for (const p of missing) {
      logger.info(`  fixed: ${p.title} (${p.id})`)
    }
  }

  logger.info(
    `=== fix:product-shipping-profiles complete   fixed=${fixed} already_ok≈${skipped} ===`,
  )
}
