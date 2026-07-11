/**
 * Wipe admin-managed catalog data (not a full DB wipe).
 *
 * Soft-deletes:
 *   - attributes (+ their product attribute values)
 *   - product categories
 *   - collections
 *   - product types
 * Optional: all products (`--with-products`)
 *
 * Does NOT touch: sellers, members, auth, regions, shipping, API keys, orders.
 *
 * Usage (from mercur/apps/api):
 *   bun run wipe:admin-catalog -- --force
 *   bun run wipe:admin-catalog -- --force --with-products
 *   bun run wipe:admin-catalog -- --force --reseed
 */
import { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"
import {
  deleteCollectionsWorkflow,
  deleteProductCategoriesWorkflow,
  deleteProductTypesWorkflow,
  deleteProductsWorkflow,
} from "@medusajs/medusa/core-flows"
import { deleteAttributeWorkflow } from "@mercurjs/core/workflows/attribute/workflows/delete-attribute"
import { deleteAttributeValueWorkflow } from "@mercurjs/core/workflows/product-attribute/workflows/delete-attribute-value"
import { MercurModules } from "@mercurjs/types"
import seedElaiCatalog from "./seed-elai-catalog"

function parseFlags(args: string[]) {
  const normalized = args.map((a) => a.replace(/^--/, ""))
  return {
    force: normalized.includes("force"),
    withProducts: normalized.includes("with-products"),
    reseed: normalized.includes("reseed"),
  }
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

export default async function wipeAdminCatalog({ container, args }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const productModule = container.resolve(Modules.PRODUCT)
  const { force, withProducts, reseed } = parseFlags(args ?? [])

  logger.info("=== Wipe admin catalog ===")
  logger.info(
    `Options: withProducts=${withProducts} reseed=${reseed} force=${force}`
  )

  if (!force) {
    logger.error(
      "Refusing to run without --force. Example: bun run wipe:admin-catalog -- --force"
    )
    return
  }

  // --- Products (optional) ---
  if (withProducts) {
    logger.info("Deleting all products...")
    const products = await listAll((skip, take) =>
      productModule.listProducts({}, { take, skip })
    )
    const ids = products.map((p) => p.id)
    if (ids.length) {
      const batchSize = 50
      for (let i = 0; i < ids.length; i += batchSize) {
        await deleteProductsWorkflow(container).run({
          input: { ids: ids.slice(i, i + batchSize) },
        })
      }
      logger.info(`Deleted ${ids.length} product(s).`)
    } else {
      logger.info("No products to delete.")
    }
  }

  // --- Attribute values then attributes ---
  logger.info("Clearing attribute values...")
  const attributeValues = await queryAll(query, "attribute_value", ["id"])
  const attributeValueIds = attributeValues.map((v) => v.id as string)
  if (attributeValueIds.length) {
    const batchSize = 50
    for (let i = 0; i < attributeValueIds.length; i += batchSize) {
      await deleteAttributeValueWorkflow(container).run({
        input: attributeValueIds.slice(i, i + batchSize),
      })
    }
    logger.info(`Deleted ${attributeValueIds.length} attribute value(s).`)
  } else {
    logger.info("No attribute values to delete.")
  }

  // Vendor product attributes that extend admin attributes block delete
  try {
    const vendorAttrModule = container.resolve(
      MercurModules.VENDOR_PRODUCT_ATTRIBUTE
    ) as {
      listVendorProductAttributes: (
        filters: Record<string, unknown>,
        config?: Record<string, unknown>
      ) => Promise<{ id: string }[]>
      softDeleteVendorProductAttributes: (ids: string[]) => Promise<unknown>
    }
    const vendorAttrs = await listAll((skip, take) =>
      vendorAttrModule.listVendorProductAttributes({}, { take, skip })
    )
    if (vendorAttrs.length) {
      await vendorAttrModule.softDeleteVendorProductAttributes(
        vendorAttrs.map((a) => a.id)
      )
      logger.info(`Soft-deleted ${vendorAttrs.length} vendor product attribute(s).`)
    }
  } catch (err) {
    logger.warn(
      `Skipping vendor_product_attribute cleanup: ${
        err instanceof Error ? err.message : String(err)
      }`
    )
  }

  logger.info("Deleting attributes...")
  const attributes = await queryAll(query, "attribute", ["id", "name", "handle"])
  let deletedAttrs = 0
  for (const attr of attributes) {
    try {
      await deleteAttributeWorkflow(container).run({
        input: { id: attr.id as string },
      })
      deletedAttrs++
    } catch (err) {
      logger.warn(
        `Could not delete attribute ${attr.handle ?? attr.name}: ${
          err instanceof Error ? err.message : String(err)
        }`
      )
    }
  }
  logger.info(`Deleted ${deletedAttrs}/${attributes.length} attribute(s).`)

  // --- Categories (children before parents) ---
  logger.info("Deleting product categories...")
  const categories = await listAll((skip, take) =>
    productModule.listProductCategories({}, { take, skip })
  )
  const children = categories.filter((c) => c.parent_category_id)
  const parents = categories.filter((c) => !c.parent_category_id)

  for (const group of [children, parents]) {
    const ids = group.map((c) => c.id)
    if (!ids.length) continue
    const batchSize = 50
    for (let i = 0; i < ids.length; i += batchSize) {
      // deleteProductCategoriesWorkflow takes id[] directly (not { ids })
      await deleteProductCategoriesWorkflow(container).run({
        input: ids.slice(i, i + batchSize),
      })
    }
  }
  logger.info(`Deleted ${categories.length} categor(ies).`)

  // --- Collections ---
  logger.info("Deleting collections...")
  const collections = await listAll((skip, take) =>
    productModule.listProductCollections({}, { take, skip })
  )
  const collectionIds = collections.map((c) => c.id)
  if (collectionIds.length) {
    await deleteCollectionsWorkflow(container).run({
      input: { ids: collectionIds },
    })
    logger.info(`Deleted ${collectionIds.length} collection(s).`)
  } else {
    logger.info("No collections to delete.")
  }

  // --- Product types ---
  logger.info("Deleting product types...")
  const types = await listAll((skip, take) =>
    productModule.listProductTypes({}, { take, skip })
  )
  const typeIds = types.map((t) => t.id)
  if (typeIds.length) {
    await deleteProductTypesWorkflow(container).run({
      input: { ids: typeIds },
    })
    logger.info(`Deleted ${typeIds.length} product type(s).`)
  } else {
    logger.info("No product types to delete.")
  }

  logger.info("=== Admin catalog wipe complete ===")

  if (reseed) {
    logger.info("Re-seeding ELAI catalog...")
    await seedElaiCatalog({ container, args: [] })
  }
}
