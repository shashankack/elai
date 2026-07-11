/**
 * Wipe one vendor/seller and their operational data, by email.
 *
 * Resolves seller via member.email (login) or seller.email (store contact).
 * Soft-deletes linked products, inventory, locations, shipping, promos, etc.,
 * then the seller + member, and removes the emailpass auth identity so they
 * can register again.
 *
 * Does NOT delete historical orders/payouts (logged if present).
 * Does NOT wipe admin catalog, regions, or other sellers.
 *
 * Usage (from mercur/apps/api):
 *   bun run wipe:vendor -- seller@example.com --force
 */
import { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"
import {
  deleteCampaignsWorkflow,
  deleteFulfillmentSetsWorkflow,
  deleteInventoryItemWorkflow,
  deletePriceListsWorkflow,
  deleteProductsWorkflow,
  deletePromotionsWorkflow,
  deleteShippingOptionsWorkflow,
  deleteShippingProfileWorkflow,
  deleteStockLocationsWorkflow,
} from "@medusajs/medusa/core-flows"
import { deleteSellersWorkflow } from "@mercurjs/core/workflows"
import { MercurModules } from "@mercurjs/types"

function parseArgs(args: string[]) {
  const normalized = args.map((a) => a.replace(/^--/, ""))
  const force = normalized.includes("force")
  const email = args.find((a) => a.includes("@"))?.trim().toLowerCase()
  return { force, email }
}

async function queryAll(
  query: {
    graph: (input: Record<string, unknown>) => Promise<{ data: Record<string, unknown>[] }>
  },
  entity: string,
  fields: string[],
  filters: Record<string, unknown> = {},
  take = 100
) {
  const all: Record<string, unknown>[] = []
  let skip = 0
  for (;;) {
    const { data } = await query.graph({
      entity,
      fields,
      filters,
      pagination: { skip, take },
    })
    all.push(...data)
    if (data.length < take) break
    skip += take
  }
  return all
}

async function deleteIds(
  label: string,
  ids: string[],
  logger: { info: (m: string) => void; warn: (m: string) => void },
  run: (batch: string[]) => Promise<unknown>,
  batchSize = 25
) {
  if (!ids.length) {
    logger.info(`No ${label} to delete.`)
    return
  }
  for (let i = 0; i < ids.length; i += batchSize) {
    const batch = ids.slice(i, i + batchSize)
    try {
      await run(batch)
    } catch (err) {
      logger.warn(
        `Failed deleting ${label} batch: ${
          err instanceof Error ? err.message : String(err)
        }`
      )
      // fall back to one-by-one so one bad row doesn't block the rest
      for (const id of batch) {
        try {
          await run([id])
        } catch (inner) {
          logger.warn(
            `Skip ${label} ${id}: ${
              inner instanceof Error ? inner.message : String(inner)
            }`
          )
        }
      }
    }
  }
  logger.info(`Deleted ${ids.length} ${label}.`)
}

export default async function wipeVendor({ container, args }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const authModule = container.resolve(Modules.AUTH)
  const sellerModule = container.resolve(MercurModules.SELLER) as {
    softDeleteMembers: (ids: string[]) => Promise<unknown>
    listMembers: (
      filters: Record<string, unknown>,
      config?: Record<string, unknown>
    ) => Promise<{ id: string; email: string }[]>
  }

  const { force, email } = parseArgs(args ?? [])

  logger.info("=== Wipe vendor by email ===")

  if (!email) {
    logger.error(
      "Email required. Example: bun run wipe:vendor -- seller@example.com --force"
    )
    return
  }

  if (!force) {
    logger.error(
      `Refusing to wipe ${email} without --force. Example: bun run wipe:vendor -- ${email} --force`
    )
    return
  }

  // Resolve seller: prefer member login email, fall back to seller store email
  const { data: members } = await query.graph({
    entity: "member",
    fields: ["id", "email"],
    filters: { email },
  })

  let sellerId: string | undefined
  let memberIds: string[] = members.map((m) => m.id as string)

  if (memberIds.length) {
    const links = await queryAll(
      query,
      "seller_member",
      ["seller_id", "member_id"],
      { member_id: memberIds }
    )
    const sellerIds = [...new Set(links.map((l) => l.seller_id as string))]
    if (sellerIds.length > 1) {
      logger.warn(
        `Member email maps to ${sellerIds.length} sellers; wiping the first: ${sellerIds[0]}`
      )
    }
    sellerId = sellerIds[0]
  }

  if (!sellerId) {
    const { data: sellers } = await query.graph({
      entity: "seller",
      fields: ["id", "email", "name"],
      filters: { email },
    })
    sellerId = sellers[0]?.id as string | undefined
    if (sellerId) {
      const links = await queryAll(
        query,
        "seller_member",
        ["member_id"],
        { seller_id: sellerId }
      )
      memberIds = links.map((l) => l.member_id as string)
    }
  }

  if (!sellerId) {
    logger.error(`No seller found for email: ${email}`)
    return
  }

  const {
    data: [seller],
  } = await query.graph({
    entity: "seller",
    fields: ["id", "email", "name", "status"],
    filters: { id: sellerId },
  })

  logger.info(
    `Wiping seller ${seller?.name ?? sellerId} <${seller?.email ?? email}> (${sellerId})`
  )

  const orders = await queryAll(query, "order_seller", ["order_id"], {
    seller_id: sellerId,
  })
  if (orders.length) {
    logger.warn(
      `Seller has ${orders.length} order link(s) — leaving orders/payouts intact for audit.`
    )
  }

  const productLinks = await queryAll(
    query,
    "product_seller",
    ["product_id"],
    { seller_id: sellerId }
  )
  const inventoryLinks = await queryAll(
    query,
    "inventory_item_seller",
    ["inventory_item_id"],
    { seller_id: sellerId }
  )
  const locationLinks = await queryAll(
    query,
    "stock_location_seller",
    ["stock_location_id"],
    { seller_id: sellerId }
  )
  const shippingOptionLinks = await queryAll(
    query,
    "shipping_option_seller",
    ["shipping_option_id"],
    { seller_id: sellerId }
  )
  const shippingProfileLinks = await queryAll(
    query,
    "shipping_profile_seller",
    ["shipping_profile_id"],
    { seller_id: sellerId }
  )
  const fulfillmentSetIds = new Set<string>()
  // Prefer sets linked to the seller's stock locations (how vendor UI validates ownership)
  for (const loc of locationLinks) {
    const locSets = await queryAll(
      query,
      "location_fulfillment_set",
      ["fulfillment_set_id"],
      { stock_location_id: loc.stock_location_id }
    )
    for (const row of locSets) {
      if (row.fulfillment_set_id) {
        fulfillmentSetIds.add(row.fulfillment_set_id as string)
      }
    }
  }
  // Also try direct seller↔fulfillment_set link if present
  for (const entity of ["seller_fulfillment_set", "fulfillment_set_seller"]) {
    try {
      const direct = await queryAll(query, entity, ["fulfillment_set_id"], {
        seller_id: sellerId,
      })
      for (const row of direct) {
        if (row.fulfillment_set_id) {
          fulfillmentSetIds.add(row.fulfillment_set_id as string)
        }
      }
    } catch {
      // entity name may not exist
    }
  }

  const priceListLinks = await queryAll(
    query,
    "price_list_seller",
    ["price_list_id"],
    { seller_id: sellerId }
  )
  const promotionLinks = await queryAll(
    query,
    "promotion_seller",
    ["promotion_id"],
    { seller_id: sellerId }
  )
  const campaignLinks = await queryAll(
    query,
    "campaign_seller",
    ["campaign_id"],
    { seller_id: sellerId }
  )

  await deleteIds(
    "campaigns",
    campaignLinks.map((l) => l.campaign_id as string),
    logger,
    (ids) => deleteCampaignsWorkflow(container).run({ input: { ids } })
  )
  await deleteIds(
    "promotions",
    promotionLinks.map((l) => l.promotion_id as string),
    logger,
    (ids) => deletePromotionsWorkflow(container).run({ input: { ids } })
  )
  await deleteIds(
    "price lists",
    priceListLinks.map((l) => l.price_list_id as string),
    logger,
    (ids) => deletePriceListsWorkflow(container).run({ input: { ids } })
  )
  await deleteIds(
    "products",
    productLinks.map((l) => l.product_id as string),
    logger,
    (ids) => deleteProductsWorkflow(container).run({ input: { ids } })
  )
  await deleteIds(
    "inventory items",
    inventoryLinks.map((l) => l.inventory_item_id as string),
    logger,
    (ids) => deleteInventoryItemWorkflow(container).run({ input: ids })
  )
  await deleteIds(
    "shipping options",
    shippingOptionLinks.map((l) => l.shipping_option_id as string),
    logger,
    (ids) => deleteShippingOptionsWorkflow(container).run({ input: { ids } })
  )
  await deleteIds(
    "shipping profiles",
    shippingProfileLinks.map((l) => l.shipping_profile_id as string),
    logger,
    (ids) => deleteShippingProfileWorkflow(container).run({ input: { ids } })
  )
  await deleteIds(
    "fulfillment sets",
    [...fulfillmentSetIds],
    logger,
    (ids) => deleteFulfillmentSetsWorkflow(container).run({ input: { ids } })
  )
  await deleteIds(
    "stock locations",
    locationLinks.map((l) => l.stock_location_id as string),
    logger,
    (ids) => deleteStockLocationsWorkflow(container).run({ input: { ids } })
  )

  logger.info("Soft-deleting seller...")
  await deleteSellersWorkflow(container).run({
    input: { ids: [sellerId] },
  })

  if (memberIds.length) {
    try {
      await sellerModule.softDeleteMembers(memberIds)
      logger.info(`Soft-deleted ${memberIds.length} member(s).`)
    } catch (err) {
      logger.warn(
        `Could not soft-delete members: ${
          err instanceof Error ? err.message : String(err)
        }`
      )
    }
  }

  // Remove auth identity so the email can register again
  try {
    const identities = await authModule.listAuthIdentities(
      {},
      { relations: ["provider_identities"], take: 1000 }
    )
    const toDelete = identities
      .filter((identity) =>
        (identity.provider_identities ?? []).some(
          (pi: { entity_id?: string; provider?: string }) =>
            pi.provider === "emailpass" &&
            pi.entity_id?.toLowerCase() === email
        )
      )
      .map((identity) => identity.id)

    if (toDelete.length) {
      await authModule.deleteAuthIdentities(toDelete)
      logger.info(`Deleted ${toDelete.length} auth identity(ies) for ${email}.`)
    } else {
      logger.info("No matching auth identity found.")
    }
  } catch (err) {
    logger.warn(
      `Auth cleanup failed (seller data still wiped): ${
        err instanceof Error ? err.message : String(err)
      }`
    )
  }

  logger.info(`=== Vendor wipe complete for ${email} ===`)
}
