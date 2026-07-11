import { fetchQuery } from "@lib/client"
import { queryKeysFactory } from "@lib/query-key-factory"
import {
  QueryKey,
  UseMutationOptions,
  UseQueryOptions,
  useMutation,
  useQuery,
} from "@tanstack/react-query"
import { HttpTypes } from "@mercurjs/types"

const PLATFORM_SHIPPING_OPTIONS_QUERY_KEY = "platform_shipping_options" as const
export const platformShippingOptionsQueryKeys = queryKeysFactory(
  PLATFORM_SHIPPING_OPTIONS_QUERY_KEY
)

type CreateBody = {
  name: string
  description?: string | null
  courier_label?: string | null
  currency_code?: string
  amount: number
  country_codes?: string[] | { countries: string[] }
  is_active?: boolean
  is_default?: boolean
}

type UpdateBody = {
  name?: string
  description?: string | null
  courier_label?: string | null
  currency_code?: string
  amount?: number
  country_codes?: string[] | { countries: string[] }
  is_active?: boolean
  is_default?: boolean
}

export const usePlatformShippingOptions = (
  query?: Record<string, string | number | boolean | undefined>,
  options?: Omit<
    UseQueryOptions<
      HttpTypes.AdminPlatformShippingOptionListResponse,
      Error,
      HttpTypes.AdminPlatformShippingOptionListResponse,
      QueryKey
    >,
    "queryFn" | "queryKey"
  >
) => {
  const { data, ...rest } = useQuery({
    queryKey: platformShippingOptionsQueryKeys.list(query),
    queryFn: () =>
      fetchQuery("/admin/platform-shipping-options", {
        method: "GET",
        query: query as Record<string, string | number | object> | undefined,
      }) as Promise<HttpTypes.AdminPlatformShippingOptionListResponse>,
    ...options,
  })

  return { ...data, ...rest }
}

export const useCreatePlatformShippingOption = (
  options?: UseMutationOptions<
    HttpTypes.AdminPlatformShippingOptionResponse,
    Error,
    CreateBody
  >
) => {
  return useMutation({
    mutationFn: (body) =>
      fetchQuery("/admin/platform-shipping-options", {
        method: "POST",
        body,
      }) as Promise<HttpTypes.AdminPlatformShippingOptionResponse>,
    ...options,
  })
}

export const useUpdatePlatformShippingOption = (
  id: string,
  options?: UseMutationOptions<
    HttpTypes.AdminPlatformShippingOptionResponse,
    Error,
    UpdateBody
  >
) => {
  return useMutation({
    mutationFn: (body) =>
      fetchQuery(`/admin/platform-shipping-options/${id}`, {
        method: "POST",
        body,
      }) as Promise<HttpTypes.AdminPlatformShippingOptionResponse>,
    ...options,
  })
}

export const useDeletePlatformShippingOption = (
  id: string,
  options?: UseMutationOptions<
    HttpTypes.AdminPlatformShippingOptionDeleteResponse,
    Error,
    void
  >
) => {
  return useMutation({
    mutationFn: () =>
      fetchQuery(`/admin/platform-shipping-options/${id}`, {
        method: "DELETE",
      }) as Promise<HttpTypes.AdminPlatformShippingOptionDeleteResponse>,
    ...options,
  })
}
