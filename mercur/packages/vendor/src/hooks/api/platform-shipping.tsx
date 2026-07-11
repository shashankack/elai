import { fetchQuery } from "../../lib/client"
import { queryKeysFactory } from "../../lib/query-key-factory"
import { HttpTypes } from "@mercurjs/types"
import {
  QueryKey,
  UseMutationOptions,
  UseQueryOptions,
  useMutation,
  useQuery,
} from "@tanstack/react-query"

const PLATFORM_SHIPPING_QUERY_KEY = "platform_shipping" as const
export const platformShippingQueryKeys = queryKeysFactory(
  PLATFORM_SHIPPING_QUERY_KEY
)

export const usePlatformShippingOptions = (
  options?: Omit<
    UseQueryOptions<
      HttpTypes.VendorPlatformShippingOptionListResponse,
      Error,
      HttpTypes.VendorPlatformShippingOptionListResponse,
      QueryKey
    >,
    "queryFn" | "queryKey"
  >
) => {
  const { data, ...rest } = useQuery({
    queryKey: platformShippingQueryKeys.list(),
    queryFn: () =>
      fetchQuery("/vendor/platform-shipping/options", {
        method: "GET",
      }) as Promise<HttpTypes.VendorPlatformShippingOptionListResponse>,
    ...options,
  })

  return { ...data, ...rest }
}

export const usePlatformShippingOptIns = (
  stockLocationId?: string,
  options?: Omit<
    UseQueryOptions<
      HttpTypes.VendorPlatformShippingOptInListResponse,
      Error,
      HttpTypes.VendorPlatformShippingOptInListResponse,
      QueryKey
    >,
    "queryFn" | "queryKey"
  >
) => {
  const { data, ...rest } = useQuery({
    queryKey: platformShippingQueryKeys.detail(stockLocationId || "all"),
    queryFn: () =>
      fetchQuery("/vendor/platform-shipping/opt-ins", {
        method: "GET",
        query: stockLocationId
          ? { stock_location_id: stockLocationId }
          : undefined,
      }) as Promise<HttpTypes.VendorPlatformShippingOptInListResponse>,
    ...options,
  })

  return { ...data, ...rest }
}

export const useOptInPlatformShipping = (
  options?: UseMutationOptions<
    HttpTypes.VendorPlatformShippingOptInResponse,
    Error,
    { platform_shipping_option_id: string; stock_location_id: string }
  >
) => {
  return useMutation({
    mutationFn: (body) =>
      fetchQuery("/vendor/platform-shipping/opt-in", {
        method: "POST",
        body,
      }) as Promise<HttpTypes.VendorPlatformShippingOptInResponse>,
    ...options,
  })
}

export const useOptOutPlatformShipping = (
  options?: UseMutationOptions<
    HttpTypes.VendorPlatformShippingOptInResponse,
    Error,
    { platform_shipping_option_id: string; stock_location_id: string }
  >
) => {
  return useMutation({
    mutationFn: (body) =>
      fetchQuery("/vendor/platform-shipping/opt-out", {
        method: "POST",
        body,
      }) as Promise<HttpTypes.VendorPlatformShippingOptInResponse>,
    ...options,
  })
}
