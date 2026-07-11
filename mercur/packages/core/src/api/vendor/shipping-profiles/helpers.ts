import { MedusaContainer } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"

import { createSellerShippingProfilesWorkflow } from "../../../workflows/shipping-profile"

export const refetchShippingProfile = async (
  scope: MedusaContainer,
  shippingProfileId: string,
  fields: string[]
) => {
  const query = scope.resolve(ContainerRegistrationKeys.QUERY)

  const {
    data: [shippingProfile],
  } = await query.graph({
    entity: "shipping_profile",
    filters: { id: shippingProfileId },
    fields,
  })

  return shippingProfile
}

export const validateSellerShippingProfile = async (
  scope: MedusaContainer,
  sellerId: string,
  shippingProfileId: string
) => {
  const query = scope.resolve(ContainerRegistrationKeys.QUERY)

  const {
    data: [sellerShippingProfile],
  } = await query.graph({
    entity: "shipping_profile_seller",
    filters: {
      seller_id: sellerId,
      shipping_profile_id: shippingProfileId,
    },
    fields: ["seller_id"],
  })

  if (!sellerShippingProfile) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Shipping profile with id: ${shippingProfileId} was not found`
    )
  }
}

/**
 * Every seller needs at least one shipping profile ("Default") to create
 * delivery options. Create it on demand if missing.
 */
export const ensureSellerDefaultShippingProfile = async (
  scope: MedusaContainer,
  sellerId: string
) => {
  const query = scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data: existing } = await query.graph({
    entity: "shipping_profile_seller",
    fields: ["shipping_profile_id", "shipping_profile.id"],
    filters: { seller_id: sellerId },
  })

  if (existing?.length) {
    return existing[0].shipping_profile_id || existing[0].shipping_profile?.id
  }

  const { result } = await createSellerShippingProfilesWorkflow(scope).run({
    input: {
      seller_id: sellerId,
      shipping_profiles: [
        {
          name: "Default",
          type: "default",
        },
      ],
    },
  })

  return result[0].id
}
