import {
  AuthenticatedMedusaRequest,
  maybeApplyLinkFilter,
  MedusaNextFunction,
  MedusaResponse,
  MiddlewareRoute,
} from "@medusajs/framework/http"
import { validateAndTransformQuery } from "@medusajs/framework"
import { FeatureFlag } from "@medusajs/framework/utils"
import indexEngineFeatureFlag from "@medusajs/medusa/feature-flags/index-engine"
import { listProductQueryConfig } from "@medusajs/medusa/api/admin/products/query-config"
import { AdminGetProductsParams } from "@medusajs/medusa/api/admin/products/validators"
import { maybeApplyPriceListsFilter } from "@medusajs/medusa/api/admin/products/utils/maybe-apply-price-lists-filter"

const maybeApplySellerProductFilter = (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) => {
  if (!req.query.seller_id) {
    return next()
  }

  req.filterableFields.seller_id = req.query.seller_id

  return maybeApplyLinkFilter({
    entryPoint: "product_seller",
    resourceId: "product_id",
    filterableField: "seller_id",
  })(req, res, next)
}

export const adminProductsMiddlewares: MiddlewareRoute[] = [
  {
    method: ["GET"],
    matcher: "/admin/products",
    middlewares: [
      validateAndTransformQuery(
        AdminGetProductsParams,
        listProductQueryConfig
      ),
      (req: AuthenticatedMedusaRequest, res: MedusaResponse, next: MedusaNextFunction) => {
        if (FeatureFlag.isFeatureEnabled(indexEngineFeatureFlag.key)) {
          return next()
        }

        return maybeApplyLinkFilter({
          entryPoint: "product_sales_channel",
          resourceId: "product_id",
          filterableField: "sales_channel_id",
        })(req, res, next)
      },
      maybeApplyPriceListsFilter(),
      maybeApplySellerProductFilter,
    ],
  },
]
