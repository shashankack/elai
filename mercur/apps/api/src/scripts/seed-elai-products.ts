/**
 * Seed dummy ELAI-domain products for one vendor store.
 *
 * Resolves the seller by brand/login email, then creates one demo product
 * per leaf category in the Elai catalog (jewellery, fashion, hair, bags,
 * beauty, tech, lifestyle). Products are linked only to that seller.
 *
 * Prerequisites:
 *   - Platform seed (region, sales channel, publishable key)
 *   - bun run seed:elai-catalog
 *   - Vendor account exists for the given email (approved = OPEN to appear on shop)
 *
 * Usage (from mercur/apps/api):
 *   bun run seed:elai-products -- seller@example.com
 *   bun run seed:elai-products -- --email=seller@example.com
 *   bun run seed:elai-products -- seller@example.com --require-open
 *   bun run seed:elai-products -- seller@example.com --dry-run
 *
 * Safe to re-run   existing handles owned by this seller are skipped.
 */
import { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils"
import { createProductsWorkflow } from "@medusajs/medusa/core-flows"
import { SellerStatus } from "@mercurjs/types"

/** Parent category handles that belong to Elai's accessories domain */
const ELAI_PARENT_HANDLES = new Set([
  "jewellery-accessories",
  "fashion-accessories",
  "hair-accessories",
  "bags-and-small-accessories",
  "beauty-add-on-accessories",
  "tech-accessories",
  "lifestyle-accessories",
])

/** Map leaf category handle → product type value (from seed-elai-catalog) */
const CATEGORY_TYPE: Record<string, string> = {
  necklaces: "Necklace",
  earrings: "Earrings",
  rings: "Ring",
  "bracelets-and-bangles": "Bracelet / Bangle",
  "anklets-and-waist-chains": "Anklet / Waist chain",
  "brooches-and-saree-pins": "Brooch / Pin",
  "charm-jewellery": "Keychain / Charm",
  "office-wear-jewellery-sets": "Jewellery set",
  "festive-and-wedding-jewellery-sets": "Jewellery set",
  belts: "Belt",
  sunglasses: "Sunglasses",
  "hats-and-caps": "Hat / Cap",
  "scarves-stoles-and-shawls": "Scarf / Stole",
  "gloves-and-arm-warmers": "Scarf / Stole",
  "statement-collars-and-detachable-add-ons": "Brooch / Pin",
  "fashion-brooches-and-outfit-enhancers": "Brooch / Pin",
  "trend-pins": "Brooch / Pin",
  "claw-clips": "Hair clip / Claw",
  "scrunchies-and-elastics": "Scrunchie / Hair tie",
  headbands: "Headband",
  "decorative-clips-and-pins": "Hair clip / Claw",
  "hair-scarves-ribbons-and-bandanas": "Scarf / Stole",
  "bun-makers-and-rollers": "Hair extension / Add-on",
  "temporary-extensions": "Hair extension / Add-on",
  "hair-beads-and-braiding": "Hair extension / Add-on",
  "totes-and-shoulder-bags": "Bag",
  "crossbody-and-sling-bags": "Bag",
  "mini-baguette-bags": "Bag",
  backpacks: "Bag",
  "wallets-and-card-holders": "Wallet / Card holder",
  "cosmetic-pouches-and-organisers": "Pouch / Organiser",
  "belt-bags-fanny-packs": "Bag",
  "travel-organisers": "Travel accessory",
  "mobile-sling-bags": "Bag",
  "makeup-pouches-and-vanity-kits": "Pouch / Organiser",
  "brush-sets-and-stands": "Beauty tool / Kit",
  "beauty-blenders-and-puffs": "Beauty tool / Kit",
  "press-on-nails-and-nail-tools": "Press-on nails",
  "compact-mirrors": "Beauty tool / Kit",
  "travel-beauty-organisers": "Travel accessory",
  "hairbrushes-and-comb-sets": "Beauty tool / Kit",
  "phone-cases": "Phone case",
  "pop-sockets-and-grips": "Phone grip / Pop socket",
  "airpods-cases": "Phone case",
  "smartwatch-straps": "Earphone / Watch strap",
  "cable-organisers": "Charger / Cable",
  "laptop-sleeves-and-tablet-covers": "Laptop / Tablet sleeve",
  "selfie-lights-and-clip-ons": "Phone grip / Pop socket",
  "tripods-and-mounts": "Phone grip / Pop socket",
  "keyboard-trackpad-covers": "Laptop / Tablet sleeve",
  "portable-chargers-and-cables": "Charger / Cable",
  "keychains-and-bag-charms": "Keychain / Charm",
  "pocket-perfumes-and-atomisers": "Travel accessory",
  "planners-and-stationery": "Stationery",
  "bottle-sleeves": "Travel accessory",
  "passport-covers-and-luggage-tags": "Travel accessory",
  "id-holders-and-badge-reels": "Travel accessory",
  "mini-pouches": "Pouch / Organiser",
  "gift-sets-and-curated-combos": "Gift set",
}

const MATERIAL_BY_PARENT: Record<string, string> = {
  "jewellery-accessories": "Brass with gold plating",
  "fashion-accessories": "Mixed materials",
  "hair-accessories": "Acetate / fabric",
  "bags-and-small-accessories": "Vegan leather",
  "beauty-add-on-accessories": "Cosmetic-grade materials",
  "tech-accessories": "TPU / silicone",
  "lifestyle-accessories": "Mixed materials",
}

function parseArgs(args: string[]) {
  const normalized = args.map((a) => a.replace(/^--/, ""))
  const emailArg =
    args.find((a) => a.startsWith("--email="))?.slice("--email=".length) ??
    args.find((a) => a.includes("@") && !a.startsWith("--"))
  const email = emailArg?.trim().toLowerCase()
  const dryRun =
    normalized.includes("dry-run") || normalized.includes("dryrun")
  const requireOpen =
    normalized.includes("require-open") ||
    normalized.includes("requireopen")
  return { email, dryRun, requireOpen }
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
}

function priceForHandle(handle: string) {
  let hash = 0
  for (let i = 0; i < handle.length; i++) {
    hash = (hash * 31 + handle.charCodeAt(i)) >>> 0
  }
  // ₹349 – ₹2,449 in steps of ₹50 (major units, same as vendor UI)
  return 349 + (hash % 43) * 50
}

function formatError(err: unknown): string {
  if (err instanceof Error) {
    const anyErr = err as Error & { cause?: unknown; details?: unknown }
    const parts = [anyErr.message || err.name || "Error"]
    if (anyErr.cause) {
      parts.push(
        `cause=${
          anyErr.cause instanceof Error
            ? anyErr.cause.message
            : JSON.stringify(anyErr.cause)
        }`
      )
    }
    if (anyErr.details !== undefined) {
      parts.push(`details=${JSON.stringify(anyErr.details)}`)
    }
    try {
      parts.push(JSON.stringify(err, Object.getOwnPropertyNames(err)))
    } catch {
      // ignore circular
    }
    return parts.filter(Boolean).join(" | ")
  }
  try {
    return JSON.stringify(err)
  } catch {
    return String(err)
  }
}

async function queryAll(
  query: {
    graph: (input: Record<string, unknown>) => Promise<{
      data: Record<string, unknown>[]
    }>
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

type CategoryRow = {
  id: string
  name: string
  handle: string
  parent_category_id?: string | null
  parent_category?: { id?: string; handle?: string; name?: string } | null
}

type SellerRow = {
  id: string
  email?: string | null
  name?: string | null
  status?: string | null
}

export default async function seedElaiProducts({
  container,
  args,
}: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const { email, dryRun, requireOpen } = parseArgs(args ?? [])

  logger.info("=== Seed Elai demo products for one vendor ===")

  if (!email || !isValidEmail(email)) {
    throw new Error(
      "Valid vendor email required. Example: bun run seed:elai-products -- seller@example.com"
    )
  }

  // --- Resolve seller (member login email → seller, else seller.email) ---
  const { data: members } = await query.graph({
    entity: "member",
    fields: ["id", "email"],
    filters: { email },
  })

  let seller: SellerRow | undefined

  if (members.length) {
    const memberIds = members.map((m) => m.id as string)
    const links = await queryAll(
      query,
      "seller_member",
      ["seller_id", "member_id"],
      { member_id: memberIds }
    )
    const sellerIds = [
      ...new Set(links.map((l) => l.seller_id as string).filter(Boolean)),
    ]
    if (sellerIds.length > 1) {
      throw new Error(
        `Email ${email} is linked to ${sellerIds.length} sellers (${sellerIds.join(
          ", "
        )}). Use a unique brand/login email.`
      )
    }
    if (sellerIds.length === 1) {
      const {
        data: [row],
      } = await query.graph({
        entity: "seller",
        fields: ["id", "email", "name", "status"],
        filters: { id: sellerIds[0] },
      })
      seller = row as SellerRow
    }
  }

  if (!seller) {
    const { data: sellers } = await query.graph({
      entity: "seller",
      fields: ["id", "email", "name", "status"],
      filters: { email },
    })
    if (sellers.length > 1) {
      throw new Error(
        `Multiple sellers share store email ${email}. Fix data before seeding.`
      )
    }
    seller = sellers[0] as SellerRow | undefined
  }

  if (!seller?.id) {
    throw new Error(
      `No seller found for email ${email}. Register/onboard the vendor first.`
    )
  }

  logger.info(
    `Seller: ${seller.name ?? "(unnamed)"} <${seller.email ?? email}> [${seller.id}] status=${seller.status}`
  )

  if (seller.status !== SellerStatus.OPEN) {
    const msg = `Seller status is "${seller.status}" (need "${SellerStatus.OPEN}" for shop visibility).`
    if (requireOpen) {
      throw new Error(`${msg} Approve the seller in admin, or omit --require-open.`)
    }
    logger.warn(`${msg} Products will still be seeded for the vendor dashboard.`)
  }

  // --- Sales channel ---
  const { data: salesChannels } = await query.graph({
    entity: "sales_channel",
    fields: ["id", "name"],
    pagination: { take: 20 },
  })
  const salesChannel =
    salesChannels.find(
      (c) =>
        String(c.name ?? "")
          .toLowerCase()
          .includes("default")
    ) ?? salesChannels[0]

  if (!salesChannel?.id) {
    throw new Error(
      "No sales channel found. Run the platform seed first (bun run seed)."
    )
  }
  logger.info(`Sales channel: ${salesChannel.name} (${salesChannel.id})`)

  // --- Elai leaf categories ---
  const allCategories = (await queryAll(
    query,
    "product_category",
    [
      "id",
      "name",
      "handle",
      "parent_category_id",
      "parent_category.id",
      "parent_category.handle",
      "parent_category.name",
    ]
  )) as CategoryRow[]

  const byId = new Map(allCategories.map((c) => [c.id, c]))

  const leafCategories = allCategories.filter((cat) => {
    if (!cat.parent_category_id) return false
    const parent =
      cat.parent_category ??
      (cat.parent_category_id
        ? byId.get(cat.parent_category_id)
        : undefined)
    const parentHandle = parent?.handle
    return parentHandle ? ELAI_PARENT_HANDLES.has(parentHandle) : false
  })

  if (!leafCategories.length) {
    throw new Error(
      "No Elai leaf categories found. Run: bun run seed:elai-catalog"
    )
  }

  logger.info(`Found ${leafCategories.length} Elai leaf categories`)

  // --- Types & tags (optional enrichment) ---
  const { data: productTypes } = await query.graph({
    entity: "product_type",
    fields: ["id", "value"],
    pagination: { take: 200 },
  })
  const typeByValue = new Map(
    productTypes.map((t) => [String(t.value), t.id as string])
  )

  const { data: productTags } = await query.graph({
    entity: "product_tag",
    fields: ["id", "value"],
    pagination: { take: 200 },
  })
  const tagByValue = new Map(
    productTags.map((t) => [String(t.value), t.id as string])
  )

  const sellerSlug =
    slugify(seller.name || email.split("@")[0] || "seller") || "seller"
  // Handles must be lowercase URL-safe (Medusa rejects uppercase)
  const sellerKey = seller.id
    .replace(/^sel_/i, "")
    .slice(0, 8)
    .toLowerCase()

  // Existing products for this seller (for ownership checks)
  const ownedLinks = await queryAll(
    query,
    "product_seller",
    ["product_id", "seller_id"],
    { seller_id: seller.id }
  )
  const ownedProductIds = new Set(
    ownedLinks.map((l) => l.product_id as string)
  )

  type Planned = {
    handle: string
    title: string
    category: CategoryRow
    parentHandle: string
    price: number
    typeId?: string
    tagIds: string[]
  }

  const planned: Planned[] = []

  for (const category of leafCategories) {
    const parent =
      category.parent_category ??
      (category.parent_category_id
        ? byId.get(category.parent_category_id)
        : undefined)
    const parentHandle = parent?.handle ?? "accessories"
    const handle = `elai-demo-${sellerKey}-${category.handle}`.slice(0, 120)
    const typeValue = CATEGORY_TYPE[category.handle]
    const typeId = typeValue ? typeByValue.get(typeValue) : undefined

    const tagIds: string[] = []
    for (const value of ["New arrival", "Handmade", "Gift ready"]) {
      const id = tagByValue.get(value)
      if (id) tagIds.push(id)
    }

    planned.push({
      handle,
      title: `${category.name}   sample`,
      category,
      parentHandle,
      price: priceForHandle(handle),
      typeId,
      tagIds: tagIds.slice(0, 2),
    })
  }

  // Idempotency: check handles that already exist
  const existingByHandle = new Map<string, { id: string }>()
  for (let i = 0; i < planned.length; i += 40) {
    const chunk = planned.slice(i, i + 40)
    const { data: existing } = await query.graph({
      entity: "product",
      fields: ["id", "handle"],
      filters: { handle: chunk.map((p) => p.handle) },
      pagination: { take: chunk.length },
    })
    for (const row of existing) {
      existingByHandle.set(String(row.handle), { id: row.id as string })
    }
  }

  const toCreate: Planned[] = []
  let skippedOwned = 0
  let conflict = 0

  for (const item of planned) {
    const existing = existingByHandle.get(item.handle)
    if (!existing) {
      toCreate.push(item)
      continue
    }
    if (ownedProductIds.has(existing.id)) {
      skippedOwned++
      continue
    }
    conflict++
    logger.warn(
      `Handle "${item.handle}" exists but is not owned by this seller (${existing.id})   skipping.`
    )
  }

  logger.info(
    `Plan: create ${toCreate.length}, skip existing ${skippedOwned}, conflicts ${conflict}${
      dryRun ? " (dry-run)" : ""
    }`
  )

  if (dryRun) {
    for (const item of toCreate.slice(0, 5)) {
      logger.info(
        `  would create: ${item.title} → ${item.handle} @ ₹${item.price} [${item.category.handle}]`
      )
    }
    if (toCreate.length > 5) {
      logger.info(`  …and ${toCreate.length - 5} more`)
    }
    logger.info("Dry-run complete. No products created.")
    return
  }

  if (!toCreate.length) {
    logger.info("Nothing to create   seller already has demo products.")
    return
  }

  let created = 0
  let failed = 0

  for (const item of toCreate) {
    const material =
      MATERIAL_BY_PARENT[item.parentHandle] ?? "Mixed materials"
    const sku = `ELAI-${sellerKey}-${item.category.handle}`
      .toUpperCase()
      .replace(/[^A-Z0-9-]/g, "")
      .slice(0, 46)

    const product: Record<string, unknown> = {
      title: item.title,
      subtitle: `Demo · ${item.category.name}`,
      handle: item.handle,
      description: [
        `Sample ${item.category.name.toLowerCase()} for Elai marketplace demos.`,
        "Accessories-only listing   jewellery, fashion, hair, bags, beauty, tech & lifestyle.",
        `Material note: ${material}. Made for India gifting & everyday styling.`,
      ].join("\n\n"),
      status: ProductStatus.PUBLISHED,
      origin_country: "in",
      material,
      category_ids: [item.category.id],
      sales_channels: [{ id: salesChannel.id as string }],
      options: [
        {
          title: "Style",
          values: ["Default"],
        },
      ],
      variants: [
        {
          title: "Default",
          sku,
          options: { Style: "Default" },
          prices: [
            {
              currency_code: "inr",
              amount: item.price,
            },
          ],
          manage_inventory: false,
          allow_backorder: false,
        },
      ],
      metadata: {
        elai_demo: true,
        elai_demo_seller: seller.id,
        elai_category_handle: item.category.handle,
      },
    }

    if (item.typeId) {
      product.type_id = item.typeId
    }
    if (item.tagIds.length) {
      product.tags = item.tagIds.map((id) => ({ id }))
    }

    try {
      await createProductsWorkflow(container).run({
        input: {
          products: [product as any],
          additional_data: {
            seller_id: seller.id,
          },
        },
      })
      created++
      if (created % 10 === 0 || created === toCreate.length) {
        logger.info(`Created ${created}/${toCreate.length}…`)
      }
    } catch (err) {
      failed++
      logger.warn(`Skip ${item.handle}: ${formatError(err)}`)
    }
  }

  // Verify ownership links
  const verifyLinks = await queryAll(
    query,
    "product_seller",
    ["product_id"],
    { seller_id: seller.id }
  )
  logger.info(
    `Done. Created ${created}, failed ${failed}. Seller now owns ${verifyLinks.length} product link(s).`
  )
  logger.info(
    seller.status === SellerStatus.OPEN
      ? "Seller is OPEN   products should appear on /shop after cache refresh."
      : "Seller is not OPEN   approve in admin before expecting /shop listings."
  )
}
