/**
 * Production-safe ELAI catalog seed.
 *
 * Creates (idempotent by handle / value / title):
 *   1. Product types
 *   2. Product tags
 *   3. Category tree (7 parents + children)
 *   4. Collections (merchandising rails)
 *   5. Global + category-linked attributes
 *
 * Does NOT create products, seller stores, regions, or wipe data.
 *
 * Local:
 *   cd mercur/apps/api && bun run seed:elai-catalog
 *
 * Production (API host, with prod .env / DATABASE_URL):
 *   cd ~/elai/mercur/apps/api && bun run seed:elai-catalog
 *
 * Safe to re-run — existing rows are skipped.
 */
import { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"
import {
  createCollectionsWorkflow,
  createProductCategoriesWorkflow,
  createProductTagsWorkflow,
  createProductTypesWorkflow,
} from "@medusajs/medusa/core-flows"
import { createAttributesWorkflow } from "@mercurjs/core/workflows/attribute/workflows/create-attributes"
import {
  AttributeSource,
  AttributeUIComponent,
  CreateAttributeDTO,
} from "@mercurjs/types"

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function selectValues(values: string[]) {
  return values.map((value, rank) => ({ value, rank }))
}

const PRODUCT_TYPES = [
  "Necklace",
  "Earrings",
  "Ring",
  "Bracelet / Bangle",
  "Anklet / Waist chain",
  "Brooch / Pin",
  "Jewellery set",
  "Belt",
  "Sunglasses",
  "Hat / Cap",
  "Scarf / Stole",
  "Hair clip / Claw",
  "Scrunchie / Hair tie",
  "Headband",
  "Hair extension / Add-on",
  "Bag",
  "Wallet / Card holder",
  "Pouch / Organiser",
  "Beauty tool / Kit",
  "Press-on nails",
  "Phone case",
  "Phone grip / Pop socket",
  "Earphone / Watch strap",
  "Laptop / Tablet sleeve",
  "Charger / Cable",
  "Keychain / Charm",
  "Stationery",
  "Travel accessory",
  "Gift set",
  "Watch",
  "Eyewear",
  "Footwear add-on",
] as const

/** Merchandising / filter tags vendors can assign on products */
const PRODUCT_TAGS = [
  "New arrival",
  "Bestseller",
  "Trending",
  "Handmade",
  "Festive",
  "Wedding",
  "Office wear",
  "College",
  "Date night",
  "Party",
  "Travel",
  "Gift ready",
  "Under ₹999",
  "Budget",
  "Premium",
  "Ethnic",
  "Minimal",
  "Statement",
  "Limited edition",
  "Exclusive",
] as const

type CategoryNode = {
  name: string
  handle: string
  children: { name: string; handle: string }[]
}

const CATEGORY_TREE: CategoryNode[] = [
  {
    name: "Jewellery Accessories",
    handle: "jewellery-accessories",
    children: [
      { name: "Necklaces", handle: "necklaces" },
      { name: "Earrings", handle: "earrings" },
      { name: "Rings", handle: "rings" },
      { name: "Bracelets & bangles", handle: "bracelets-and-bangles" },
      { name: "Anklets & waist chains", handle: "anklets-and-waist-chains" },
      { name: "Brooches & saree pins", handle: "brooches-and-saree-pins" },
      { name: "Charm jewellery", handle: "charm-jewellery" },
      { name: "Office-wear jewellery sets", handle: "office-wear-jewellery-sets" },
      {
        name: "Festive & wedding jewellery sets",
        handle: "festive-and-wedding-jewellery-sets",
      },
    ],
  },
  {
    name: "Fashion Accessories",
    handle: "fashion-accessories",
    children: [
      { name: "Belts", handle: "belts" },
      { name: "Sunglasses", handle: "sunglasses" },
      { name: "Hats & caps", handle: "hats-and-caps" },
      { name: "Scarves, stoles & shawls", handle: "scarves-stoles-and-shawls" },
      { name: "Gloves & arm warmers", handle: "gloves-and-arm-warmers" },
      {
        name: "Statement collars & detachable add-ons",
        handle: "statement-collars-and-detachable-add-ons",
      },
      {
        name: "Fashion brooches & outfit enhancers",
        handle: "fashion-brooches-and-outfit-enhancers",
      },
      { name: "Trend pins", handle: "trend-pins" },
    ],
  },
  {
    name: "Hair Accessories",
    handle: "hair-accessories",
    children: [
      { name: "Claw clips", handle: "claw-clips" },
      { name: "Scrunchies & elastics", handle: "scrunchies-and-elastics" },
      { name: "Headbands", handle: "headbands" },
      { name: "Decorative clips & pins", handle: "decorative-clips-and-pins" },
      {
        name: "Hair scarves, ribbons & bandanas",
        handle: "hair-scarves-ribbons-and-bandanas",
      },
      { name: "Bun makers & rollers", handle: "bun-makers-and-rollers" },
      { name: "Temporary extensions", handle: "temporary-extensions" },
      { name: "Hair beads & braiding", handle: "hair-beads-and-braiding" },
    ],
  },
  {
    name: "Bags & Small Accessories",
    handle: "bags-and-small-accessories",
    children: [
      { name: "Totes & shoulder bags", handle: "totes-and-shoulder-bags" },
      { name: "Crossbody & sling bags", handle: "crossbody-and-sling-bags" },
      { name: "Mini / baguette bags", handle: "mini-baguette-bags" },
      { name: "Backpacks", handle: "backpacks" },
      { name: "Wallets & card holders", handle: "wallets-and-card-holders" },
      {
        name: "Cosmetic pouches & organisers",
        handle: "cosmetic-pouches-and-organisers",
      },
      { name: "Belt bags / fanny packs", handle: "belt-bags-fanny-packs" },
      { name: "Travel organisers", handle: "travel-organisers" },
      { name: "Mobile sling bags", handle: "mobile-sling-bags" },
    ],
  },
  {
    name: "Beauty Add-On Accessories",
    handle: "beauty-add-on-accessories",
    children: [
      {
        name: "Makeup pouches & vanity kits",
        handle: "makeup-pouches-and-vanity-kits",
      },
      { name: "Brush sets & stands", handle: "brush-sets-and-stands" },
      { name: "Beauty blenders & puffs", handle: "beauty-blenders-and-puffs" },
      {
        name: "Press-on nails & nail tools",
        handle: "press-on-nails-and-nail-tools",
      },
      { name: "Compact mirrors", handle: "compact-mirrors" },
      {
        name: "Travel beauty organisers",
        handle: "travel-beauty-organisers",
      },
      { name: "Hairbrushes & comb sets", handle: "hairbrushes-and-comb-sets" },
    ],
  },
  {
    name: "Tech Accessories",
    handle: "tech-accessories",
    children: [
      { name: "Phone cases", handle: "phone-cases" },
      { name: "Pop sockets & grips", handle: "pop-sockets-and-grips" },
      { name: "AirPods cases", handle: "airpods-cases" },
      { name: "Smartwatch straps", handle: "smartwatch-straps" },
      { name: "Cable organisers", handle: "cable-organisers" },
      {
        name: "Laptop sleeves & tablet covers",
        handle: "laptop-sleeves-and-tablet-covers",
      },
      { name: "Selfie lights & clip-ons", handle: "selfie-lights-and-clip-ons" },
      { name: "Tripods & mounts", handle: "tripods-and-mounts" },
      {
        name: "Keyboard / trackpad covers",
        handle: "keyboard-trackpad-covers",
      },
      {
        name: "Portable chargers & cables",
        handle: "portable-chargers-and-cables",
      },
    ],
  },
  {
    name: "Lifestyle Accessories",
    handle: "lifestyle-accessories",
    children: [
      { name: "Keychains & bag charms", handle: "keychains-and-bag-charms" },
      {
        name: "Pocket perfumes & atomisers",
        handle: "pocket-perfumes-and-atomisers",
      },
      { name: "Planners & stationery", handle: "planners-and-stationery" },
      { name: "Bottle sleeves", handle: "bottle-sleeves" },
      {
        name: "Passport covers & luggage tags",
        handle: "passport-covers-and-luggage-tags",
      },
      { name: "ID holders & badge reels", handle: "id-holders-and-badge-reels" },
      { name: "Mini pouches", handle: "mini-pouches" },
      {
        name: "Gift sets & curated combos",
        handle: "gift-sets-and-curated-combos",
      },
    ],
  },
]

const COLLECTIONS = [
  { title: "Wedding edit", handle: "wedding-edit" },
  { title: "Festive edit", handle: "festive-edit" },
  { title: "College essentials", handle: "college-essentials" },
  { title: "Workwear edit", handle: "workwear-edit" },
  { title: "Date night", handle: "date-night" },
  { title: "Gifting kits", handle: "gifting-kits" },
  { title: "Budget finds", handle: "budget-finds" },
  { title: "Premium picks", handle: "premium-picks" },
  { title: "Creator / influencer edit", handle: "creator-influencer-edit" },
  { title: "New arrivals", handle: "new-arrivals" },
  { title: "Under ₹999", handle: "under-999" },
] as const

type AttributeSeed = CreateAttributeDTO & {
  /** Parent category handle(s) to link; omit for global attributes */
  category_handles?: string[]
}

function buildAttributes(): AttributeSeed[] {
  const global: AttributeSeed[] = [
    {
      name: "Occasion",
      handle: "occasion",
      ui_component: AttributeUIComponent.SELECT,
      is_filterable: true,
      possible_values: selectValues([
        "Daily",
        "Office",
        "College",
        "Date night",
        "Festive",
        "Wedding",
        "Party",
        "Travel",
        "Gifting",
      ]),
    },
    {
      name: "Style",
      handle: "style",
      ui_component: AttributeUIComponent.SELECT,
      is_filterable: true,
      possible_values: selectValues([
        "Minimal",
        "Classic",
        "Trendy",
        "Bold / statement",
        "Ethnic",
        "Cute / aesthetic",
      ]),
    },
    {
      name: "Gender",
      handle: "gender",
      ui_component: AttributeUIComponent.SELECT,
      is_filterable: true,
      possible_values: selectValues(["Women", "Men", "Unisex"]),
    },
    {
      name: "Price tier",
      handle: "price-tier",
      ui_component: AttributeUIComponent.SELECT,
      is_filterable: true,
      possible_values: selectValues(["Budget", "Mid-range", "Premium"]),
    },
    {
      name: "Colour",
      handle: "colour",
      ui_component: AttributeUIComponent.SELECT,
      is_filterable: true,
      possible_values: selectValues([
        "Gold",
        "Silver",
        "Rose gold",
        "Black",
        "White",
        "Brown",
        "Multicolour",
        "Other",
      ]),
    },
    {
      name: "Material",
      handle: "material",
      ui_component: AttributeUIComponent.SELECT,
      is_filterable: true,
      possible_values: selectValues([
        "Metal",
        "Brass",
        "Alloy",
        "Sterling silver",
        "Gold-plated",
        "Leather",
        "Fabric",
        "Plastic",
        "Resin",
        "Silicone",
        "Glass",
        "Wood",
        "Mixed",
      ]),
    },
    {
      name: "Finish",
      handle: "finish",
      ui_component: AttributeUIComponent.SELECT,
      is_filterable: true,
      possible_values: selectValues([
        "Matte",
        "Glossy",
        "Textured",
        "Oxidised",
        "Enamel",
      ]),
    },
    {
      name: "Set type",
      handle: "set-type",
      ui_component: AttributeUIComponent.SELECT,
      is_filterable: true,
      possible_values: selectValues(["Single piece", "Pair", "Set / combo"]),
    },
    {
      name: "Handmade",
      handle: "handmade",
      ui_component: AttributeUIComponent.TOGGLE,
      is_filterable: true,
    },
    {
      name: "Fragile",
      handle: "fragile",
      description: "Needs careful packing / shipping",
      ui_component: AttributeUIComponent.TOGGLE,
      is_filterable: false,
    },
  ]

  const jewellery: AttributeSeed[] = [
    {
      name: "Plating",
      handle: "plating",
      category_handles: ["jewellery-accessories"],
      ui_component: AttributeUIComponent.SELECT,
      is_filterable: true,
      possible_values: selectValues(["Gold", "Silver", "Rose gold", "None"]),
    },
    {
      name: "Stone",
      handle: "stone",
      category_handles: ["jewellery-accessories"],
      ui_component: AttributeUIComponent.SELECT,
      is_filterable: true,
      possible_values: selectValues([
        "None",
        "Pearl",
        "Crystal",
        "Kundan",
        "Meenakari",
        "Gemstone",
      ]),
    },
    {
      name: "Jewellery closure",
      handle: "jewellery-closure",
      category_handles: ["jewellery-accessories"],
      ui_component: AttributeUIComponent.SELECT,
      is_filterable: true,
      possible_values: selectValues([
        "Hook",
        "Stud",
        "Clip-on",
        "Lobster",
        "Adjustable",
      ]),
    },
    {
      name: "Hypoallergenic",
      handle: "hypoallergenic",
      category_handles: ["jewellery-accessories"],
      ui_component: AttributeUIComponent.TOGGLE,
      is_filterable: true,
    },
    {
      name: "Length / size",
      handle: "jewellery-length-size",
      category_handles: ["jewellery-accessories"],
      ui_component: AttributeUIComponent.TEXTAREA,
      is_filterable: false,
    },
  ]

  const fashion: AttributeSeed[] = [
    {
      name: "Size",
      handle: "fashion-size",
      category_handles: ["fashion-accessories"],
      ui_component: AttributeUIComponent.SELECT,
      is_filterable: true,
      possible_values: selectValues([
        "Free size",
        "S",
        "M",
        "L",
        "Adjustable",
      ]),
    },
    {
      name: "Frame shape",
      handle: "frame-shape",
      category_handles: ["fashion-accessories"],
      ui_component: AttributeUIComponent.SELECT,
      is_filterable: true,
      possible_values: selectValues([
        "Round",
        "Square",
        "Cat-eye",
        "Oversized",
        "Aviator",
      ]),
    },
    {
      name: "UV protection",
      handle: "uv-protection",
      category_handles: ["fashion-accessories"],
      ui_component: AttributeUIComponent.TOGGLE,
      is_filterable: true,
    },
  ]

  const hair: AttributeSeed[] = [
    {
      name: "Hold strength",
      handle: "hold-strength",
      category_handles: ["hair-accessories"],
      ui_component: AttributeUIComponent.SELECT,
      is_filterable: true,
      possible_values: selectValues(["Light", "Medium", "Strong"]),
    },
    {
      name: "Hair type fit",
      handle: "hair-type-fit",
      category_handles: ["hair-accessories"],
      ui_component: AttributeUIComponent.SELECT,
      is_filterable: true,
      possible_values: selectValues(["Fine", "Thick", "Curly", "All"]),
    },
  ]

  const bags: AttributeSeed[] = [
    {
      name: "Bag size",
      handle: "bag-size",
      category_handles: ["bags-and-small-accessories"],
      ui_component: AttributeUIComponent.SELECT,
      is_filterable: true,
      possible_values: selectValues(["Mini", "Small", "Medium", "Large"]),
    },
    {
      name: "Bag closure",
      handle: "bag-closure",
      category_handles: ["bags-and-small-accessories"],
      ui_component: AttributeUIComponent.SELECT,
      is_filterable: true,
      possible_values: selectValues([
        "Zip",
        "Flap",
        "Drawstring",
        "Magnetic",
        "Open",
      ]),
    },
    {
      name: "Strap type",
      handle: "strap-type",
      category_handles: ["bags-and-small-accessories"],
      ui_component: AttributeUIComponent.SELECT,
      is_filterable: true,
      possible_values: selectValues([
        "Shoulder",
        "Crossbody",
        "Handheld",
        "Backpack",
        "Belt",
      ]),
    },
    {
      name: "Compartments",
      handle: "compartments",
      category_handles: ["bags-and-small-accessories"],
      ui_component: AttributeUIComponent.TEXTAREA,
      is_filterable: false,
    },
  ]

  const beauty: AttributeSeed[] = [
    {
      name: "Kit contents",
      handle: "kit-contents",
      category_handles: ["beauty-add-on-accessories"],
      ui_component: AttributeUIComponent.TEXTAREA,
      is_filterable: false,
    },
    {
      name: "Reusable",
      handle: "reusable",
      category_handles: ["beauty-add-on-accessories"],
      ui_component: AttributeUIComponent.TOGGLE,
      is_filterable: true,
    },
    {
      name: "Travel-friendly",
      handle: "travel-friendly",
      category_handles: ["beauty-add-on-accessories"],
      ui_component: AttributeUIComponent.TOGGLE,
      is_filterable: true,
    },
  ]

  const tech: AttributeSeed[] = [
    {
      name: "Device compatibility",
      handle: "device-compatibility",
      category_handles: ["tech-accessories"],
      ui_component: AttributeUIComponent.SELECT,
      is_filterable: true,
      possible_values: selectValues([
        "iPhone",
        "Android",
        "Universal",
        "AirPods",
        "Apple Watch",
        "Samsung Watch",
        "Laptop",
        "Tablet",
      ]),
    },
    {
      name: "Case type",
      handle: "case-type",
      category_handles: ["tech-accessories"],
      ui_component: AttributeUIComponent.SELECT,
      is_filterable: true,
      possible_values: selectValues([
        "Soft",
        "Hard",
        "Clear",
        "Printed",
        "Rugged",
      ]),
    },
    {
      name: "Wireless charging compatible",
      handle: "wireless-charging-compatible",
      category_handles: ["tech-accessories"],
      ui_component: AttributeUIComponent.TOGGLE,
      is_filterable: true,
    },
  ]

  const lifestyle: AttributeSeed[] = [
    {
      name: "Gift-ready",
      handle: "gift-ready",
      category_handles: ["lifestyle-accessories"],
      ui_component: AttributeUIComponent.TOGGLE,
      is_filterable: true,
    },
    {
      name: "Bundle includes",
      handle: "bundle-includes",
      category_handles: ["lifestyle-accessories"],
      ui_component: AttributeUIComponent.TEXTAREA,
      is_filterable: false,
    },
  ]

  return [
    ...global,
    ...jewellery,
    ...fashion,
    ...hair,
    ...bags,
    ...beauty,
    ...tech,
    ...lifestyle,
  ].map((attr) => ({
    ...attr,
    source: AttributeSource.ADMIN,
    handle: attr.handle ?? slugify(attr.name),
  }))
}

async function listAll<T>(
  fetchPage: (skip: number, take: number) => Promise<T[]>,
  take = 100
): Promise<T[]> {
  const all: T[] = []
  let skip = 0
  for (;;) {
    const page = await fetchPage(skip, take)
    all.push(...page)
    if (page.length < take) break
    skip += take
  }
  return all
}

export default async function seedElaiCatalog({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const productModule = container.resolve(Modules.PRODUCT)

  logger.info("=== ELAI catalog seed (types / categories / collections / attributes) ===")

  // --- Product types ---
  logger.info("Seeding product types...")
  const existingTypes = await listAll((skip, take) =>
    productModule.listProductTypes({}, { take, skip })
  )
  const existingTypeValues = new Set(existingTypes.map((t) => t.value))
  const typesToCreate = PRODUCT_TYPES.filter((v) => !existingTypeValues.has(v)).map(
    (value) => ({ value })
  )

  if (typesToCreate.length) {
    await createProductTypesWorkflow(container).run({
      input: { product_types: typesToCreate },
    })
    logger.info(`Created ${typesToCreate.length} product type(s).`)
  } else {
    logger.info("Product types already exist, skipping.")
  }

  // --- Product tags ---
  logger.info("Seeding product tags...")
  const existingTags = await listAll((skip, take) =>
    productModule.listProductTags({}, { take, skip })
  )
  const existingTagValues = new Set(
    existingTags.map((t) => t.value.toLowerCase())
  )
  const tagsToCreate = PRODUCT_TAGS.filter(
    (value) => !existingTagValues.has(value.toLowerCase())
  ).map((value) => ({ value }))

  if (tagsToCreate.length) {
    await createProductTagsWorkflow(container).run({
      input: { product_tags: tagsToCreate },
    })
    logger.info(`Created ${tagsToCreate.length} product tag(s).`)
  } else {
    logger.info("Product tags already exist, skipping.")
  }

  // --- Categories ---
  // List ALL categories (do not filter by handle array — Medusa may not match $in
  // correctly, which caused "handle already exists" on re-runs).
  logger.info("Seeding categories...")
  const childHandles = CATEGORY_TREE.flatMap((c) => c.children.map((ch) => ch.handle))

  const existingCategories = await listAll((skip, take) =>
    productModule.listProductCategories({}, { take, skip })
  )
  const categoryByHandle = new Map(
    existingCategories.map((c) => [c.handle, c] as const)
  )

  const parentsToCreate = CATEGORY_TREE.filter((p) => !categoryByHandle.has(p.handle))
  if (parentsToCreate.length) {
    const { result: createdParents } = await createProductCategoriesWorkflow(
      container
    ).run({
      input: {
        product_categories: parentsToCreate.map((p, index) => ({
          name: p.name,
          handle: p.handle,
          is_active: true,
          rank: index,
        })),
      },
    })
    for (const cat of createdParents) {
      categoryByHandle.set(cat.handle, cat)
    }
    logger.info(`Created ${createdParents.length} parent categor(ies).`)
  } else {
    logger.info("Parent categories already exist, skipping.")
  }

  const childrenToCreate: {
    name: string
    handle: string
    parent_category_id: string
    is_active: boolean
    rank: number
  }[] = []

  for (const parent of CATEGORY_TREE) {
    const parentCat = categoryByHandle.get(parent.handle)
    if (!parentCat) {
      throw new Error(`Missing parent category after seed: ${parent.handle}`)
    }
    parent.children.forEach((child, rank) => {
      if (!categoryByHandle.has(child.handle)) {
        childrenToCreate.push({
          name: child.name,
          handle: child.handle,
          parent_category_id: parentCat.id,
          is_active: true,
          rank,
        })
      }
    })
  }

  if (childrenToCreate.length) {
    const { result: createdChildren } = await createProductCategoriesWorkflow(
      container
    ).run({
      input: { product_categories: childrenToCreate },
    })
    for (const cat of createdChildren) {
      categoryByHandle.set(cat.handle, cat)
    }
    logger.info(`Created ${createdChildren.length} child categor(ies).`)
  } else {
    logger.info("Child categories already exist, skipping.")
  }

  // --- Collections ---
  logger.info("Seeding collections...")
  const existingCollections = await listAll((skip, take) =>
    productModule.listProductCollections({}, { take, skip })
  )
  const existingCollectionHandles = new Set(
    existingCollections.map((c) => c.handle)
  )
  const collectionsToCreate = COLLECTIONS.filter(
    (c) => !existingCollectionHandles.has(c.handle)
  ).map((c) => ({ title: c.title, handle: c.handle }))

  if (collectionsToCreate.length) {
    await createCollectionsWorkflow(container).run({
      input: { collections: collectionsToCreate },
    })
    logger.info(`Created ${collectionsToCreate.length} collection(s).`)
  } else {
    logger.info("Collections already exist, skipping.")
  }

  // --- Attributes ---
  // Uniqueness is by name (createAttributesStep), not only handle.
  logger.info("Seeding attributes...")
  const attributeDefs = buildAttributes()

  const existingAttributes = await listAll(async (skip, take) => {
    const { data } = await query.graph({
      entity: "attribute",
      fields: ["id", "handle", "name"],
      pagination: { skip, take },
    })
    return data as { id: string; handle: string; name: string }[]
  })

  const existingAttrHandles = new Set(existingAttributes.map((a) => a.handle))
  const existingAttrNames = new Set(
    existingAttributes.map((a) => a.name.toLowerCase())
  )

  const attributesToCreate = attributeDefs
    .filter((a) => {
      if (existingAttrHandles.has(a.handle!)) return false
      if (existingAttrNames.has(a.name.toLowerCase())) {
        logger.info(
          `Attribute name "${a.name}" already exists, skipping (handle ${a.handle}).`
        )
        return false
      }
      return true
    })
    .map((a) => {
      const { category_handles, ...rest } = a
      const product_category_ids = category_handles
        ?.map((h) => categoryByHandle.get(h)?.id)
        .filter((id): id is string => Boolean(id))

      if (category_handles?.length && !product_category_ids?.length) {
        logger.warn(
          `Attribute "${a.name}" skipped category link — parents not found: ${category_handles.join(", ")}`
        )
      }

      return {
        ...rest,
        product_category_ids:
          product_category_ids && product_category_ids.length
            ? product_category_ids
            : undefined,
      } satisfies CreateAttributeDTO
    })

  if (attributesToCreate.length) {
    // One-at-a-time: createAttributesStep rejects the whole batch if any name exists
    let created = 0
    for (const attr of attributesToCreate) {
      try {
        await createAttributesWorkflow(container).run({
          input: {
            attributes: [
              {
                ...attr,
                possible_values: attr.possible_values?.map((v) => ({ ...v })),
                product_category_ids: attr.product_category_ids
                  ? [...attr.product_category_ids]
                  : undefined,
              },
            ],
          },
        })
        created++
        existingAttrNames.add(attr.name.toLowerCase())
      } catch (err) {
        logger.warn(
          `Could not create attribute "${attr.name}": ${
            err instanceof Error ? err.message : String(err)
          }`
        )
      }
    }
    logger.info(`Created ${created}/${attributesToCreate.length} attribute(s).`)
  } else {
    logger.info("Attributes already exist, skipping.")
  }

  logger.info("=== ELAI catalog seed complete ===")
  logger.info(
    `Summary: ${PRODUCT_TYPES.length} types, ${PRODUCT_TAGS.length} tags, ${CATEGORY_TREE.length} parents + ${childHandles.length} children, ${COLLECTIONS.length} collections, ${attributeDefs.length} attributes (created only if missing).`
  )
}
