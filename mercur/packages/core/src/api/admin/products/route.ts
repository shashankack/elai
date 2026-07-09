import { createProductsWorkflow } from "@medusajs/core-flows"
import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
  refetchEntities,
  refetchEntity,
} from "@medusajs/framework/http"
import {
  ContainerRegistrationKeys,
  FeatureFlag,
  isPresent,
} from "@medusajs/framework/utils"
import indexEngineFeatureFlag from "@medusajs/medusa/feature-flags/index-engine"
import {
  remapKeysForProduct,
  remapProductResponse,
} from "@medusajs/medusa/api/admin/products/helpers"
import { HttpTypes } from "@medusajs/types"

import { AdminGetProductsParamsType } from "./validators"

export const GET = async (
  req: AuthenticatedMedusaRequest<AdminGetProductsParamsType>,
  res: MedusaResponse<HttpTypes.AdminProductListResponse>
) => {
  if (FeatureFlag.isFeatureEnabled(indexEngineFeatureFlag.key)) {
    if (
      Object.keys(req.filterableFields).length === 0 ||
      isPresent(req.filterableFields.tags) ||
      isPresent(req.filterableFields.categories)
    ) {
      return await getProducts(req, res)
    }

    return await getProductsWithIndexEngine(req, res)
  }

  return await getProducts(req, res)
}

async function getProducts(
  req: AuthenticatedMedusaRequest<AdminGetProductsParamsType>,
  res: MedusaResponse<HttpTypes.AdminProductListResponse>
) {
  const selectFields = remapKeysForProduct(req.queryConfig.fields ?? [])

  const { data: products, metadata } = await refetchEntities({
    entity: "product",
    idOrFilter: req.filterableFields,
    scope: req.scope,
    fields: selectFields,
    pagination: req.queryConfig.pagination,
    withDeleted: req.queryConfig.withDeleted,
  })

  res.json({
    products: products.map(remapProductResponse),
    count: metadata.count,
    offset: metadata.skip,
    limit: metadata.take,
  })
}

async function getProductsWithIndexEngine(
  req: AuthenticatedMedusaRequest<AdminGetProductsParamsType>,
  res: MedusaResponse<HttpTypes.AdminProductListResponse>
) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const filters: Record<string, unknown> = { ...req.filterableFields }

  if (isPresent(filters.sales_channel_id)) {
    const salesChannelIds = filters.sales_channel_id
    const salesChannels = (filters.sales_channels ?? {}) as Record<string, unknown>
    salesChannels.id = salesChannelIds
    filters.sales_channels = salesChannels
    delete filters.sales_channel_id
  }

  const { data: products, metadata } = await query.index({
    entity: "product",
    fields: req.queryConfig.fields ?? [],
    filters,
    pagination: req.queryConfig.pagination,
    withDeleted: req.queryConfig.withDeleted,
  })

  res.json({
    products: products.map(remapProductResponse),
    count: metadata?.estimate_count ?? 0,
    estimate_count: metadata?.estimate_count,
    offset: metadata?.skip ?? 0,
    limit: metadata?.take ?? 0,
  })
}

export const POST = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse<HttpTypes.AdminProductResponse>
) => {
  const { additional_data, ...products } = req.validatedBody as HttpTypes.AdminCreateProduct & {
    additional_data?: Record<string, unknown>
  }

  const { result } = await createProductsWorkflow(req.scope).run({
    input: { products: [products], additional_data },
  })

  const product = await refetchEntity({
    entity: "product",
    idOrFilter: result[0].id,
    scope: req.scope,
    fields: remapKeysForProduct(req.queryConfig.fields ?? []),
  })

  res.status(200).json({ product: remapProductResponse(product) })
}
