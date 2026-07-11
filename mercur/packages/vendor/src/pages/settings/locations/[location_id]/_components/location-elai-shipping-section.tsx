import { Container, Heading, Switch, Text, toast } from "@medusajs/ui"
import { useTranslation } from "react-i18next"
import { useQueryClient } from "@tanstack/react-query"

import { HeadingSkeleton, Skeleton, TextSkeleton } from "@components/common/skeleton"
import {
  platformShippingQueryKeys,
  useOptInPlatformShipping,
  useOptOutPlatformShipping,
  usePlatformShippingOptIns,
  usePlatformShippingOptions,
} from "@hooks/api/platform-shipping"
import { stockLocationsQueryKeys } from "@hooks/api/stock-locations"

type Props = {
  locationId: string
}

export const LocationElaiShippingSection = ({ locationId }: Props) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const { platform_shipping_options, isPending: loadingOptions } =
    usePlatformShippingOptions()
  const { platform_shipping_opt_ins, isPending: loadingOptIns } =
    usePlatformShippingOptIns(locationId)

  const { mutateAsync: optIn, isPending: optingIn } = useOptInPlatformShipping()
  const { mutateAsync: optOut, isPending: optingOut } =
    useOptOutPlatformShipping()

  const options = platform_shipping_options || []
  const optIns = platform_shipping_opt_ins || []

  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: platformShippingQueryKeys.details(),
      }),
      queryClient.invalidateQueries({
        queryKey: stockLocationsQueryKeys.details(),
      }),
    ])
  }

  if (loadingOptions || loadingOptIns) {
    return (
      <Container className="divide-y p-0" role="status" aria-busy="true">
        <div className="px-6 py-4">
          <HeadingSkeleton level="h2" characters={14} />
          <div className="mt-2">
            <TextSkeleton size="small" characters={48} />
          </div>
        </div>
        <div className="flex items-center justify-between gap-4 px-6 py-4">
          <div className="flex flex-1 flex-col gap-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-28" />
          </div>
          <Skeleton className="h-5 w-9 rounded-full" />
        </div>
      </Container>
    )
  }

  if (!options.length) {
    return null
  }

  return (
    <Container className="divide-y p-0">
      <div className="px-6 py-4">
        <Heading level="h2">{t("platformShipping.vendor.header")}</Heading>
        <Text size="small" className="text-ui-fg-subtle mt-1">
          {t("platformShipping.vendor.hint")}
        </Text>
      </div>

      {options.map((option) => {
        const optInRecord = optIns.find(
          (o) => o.platform_shipping_option?.id === option.id
        )
        const enabled = !!optInRecord?.is_enabled
        const busy = optingIn || optingOut

        return (
          <div
            key={option.id}
            className="flex items-start justify-between gap-4 px-6 py-4"
          >
            <div className="min-w-0 flex-1">
              <Text weight="plus">{option.name}</Text>
              <Text size="small" className="text-ui-fg-subtle">
                {option.courier_label
                  ? t("platformShipping.vendor.courier", {
                      courier: option.courier_label,
                    })
                  : null}
                {option.courier_label ? " · " : ""}
                ₹{Number(option.amount).toLocaleString("en-IN")}
              </Text>
              {option.description && (
                <Text size="small" className="text-ui-fg-muted mt-1">
                  {option.description}
                </Text>
              )}
            </div>
            <Switch
              checked={enabled}
              disabled={busy}
              onCheckedChange={async (checked) => {
                try {
                  if (checked) {
                    await optIn({
                      platform_shipping_option_id: option.id,
                      stock_location_id: locationId,
                    })
                    toast.success(t("platformShipping.vendor.enabledToast"))
                  } else {
                    await optOut({
                      platform_shipping_option_id: option.id,
                      stock_location_id: locationId,
                    })
                    toast.success(t("platformShipping.vendor.disabledToast"))
                  }
                  await refresh()
                } catch (e: any) {
                  toast.error(e?.message || t("general.error"))
                }
              }}
            />
          </div>
        )
      })}
    </Container>
  )
}
