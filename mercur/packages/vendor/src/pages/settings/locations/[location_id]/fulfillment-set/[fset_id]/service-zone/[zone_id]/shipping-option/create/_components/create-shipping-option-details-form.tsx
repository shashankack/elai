import { Heading, Input, Text } from "@medusajs/ui"
import { useEffect } from "react"
import { UseFormReturn } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { VendorExtendedAdminServiceZone } from "@custom-types/stock-location"

import { Form } from "@components/common/form"
import { Combobox } from "@components/inputs/combobox"
import { shippingProfileQueryKeys } from "@hooks/api/shipping-profiles"
import { useComboboxData } from "@hooks/use-combobox-data"
import { fetchQuery } from "@lib/client"
import { FulfillmentSetType } from "@pages/settings/locations/_common/constants"
import { CreateShippingOptionSchema } from "./schema"

type CreateShippingOptionDetailsFormProps = {
  form: UseFormReturn<CreateShippingOptionSchema>
  isReturn?: boolean
  zone: VendorExtendedAdminServiceZone
  type: FulfillmentSetType
}

export const CreateShippingOptionDetailsForm = ({
  form,
  isReturn = false,
  zone,
  type,
}: CreateShippingOptionDetailsFormProps) => {
  const { t } = useTranslation()

  const isPickup = type === FulfillmentSetType.Pickup

  const shippingProfiles = useComboboxData({
    queryFn: () =>
      fetchQuery(`/vendor/shipping-profiles`, {
        method: "GET",
      }),
    queryKey: shippingProfileQueryKeys.lists(),
    getOptions: (data) =>
      (data.shipping_profiles || []).map((profile: any) => {
        const name = profile.shipping_profile?.name ?? profile.name ?? ""
        const id = profile.shipping_profile?.id ?? profile.id
        return {
          label: name.includes(":") ? name.split(":")[1] : name,
          value: id,
        }
      }),
  })

  // Auto-pick the first (usually Default) profile so sellers don't get stuck
  useEffect(() => {
    const current = form.getValues("shipping_profile_id")
    if (!current && shippingProfiles.options?.length) {
      form.setValue("shipping_profile_id", shippingProfiles.options[0].value, {
        shouldValidate: true,
      })
    }
  }, [shippingProfiles.options, form])

  return (
    <div className="flex flex-1 flex-col items-center overflow-y-auto">
      <div className="flex w-full max-w-[720px] flex-col gap-y-8 px-6 py-16">
        <div>
          <Heading>
            {t(
              `stockLocations.shippingOptions.create.${
                isPickup ? "pickup" : isReturn ? "returns" : "shipping"
              }.header`,
              {
                zone: zone.name,
              }
            )}
          </Heading>
          <Text size="small" className="text-ui-fg-subtle">
            {t(
              `stockLocations.shippingOptions.create.${
                isReturn ? "returns" : isPickup ? "pickup" : "shipping"
              }.hint`
            )}
          </Text>
        </div>

        <Form.Field
          control={form.control}
          name="name"
          render={({ field }) => {
            return (
              <Form.Item>
                <Form.Label>
                  {t("stockLocations.shippingOptions.fields.name")}
                </Form.Label>
                <Form.Control>
                  <Input
                    placeholder={t(
                      "stockLocations.shippingOptions.fields.namePlaceholder"
                    )}
                    {...field}
                  />
                </Form.Control>
                <Form.Hint>
                  {t("stockLocations.shippingOptions.fields.nameHint")}
                </Form.Hint>
                <Form.ErrorMessage />
              </Form.Item>
            )
          }}
        />

        <Form.Field
          control={form.control}
          name="shipping_profile_id"
          render={({ field }) => {
            return (
              <Form.Item>
                <Form.Label>
                  {t("stockLocations.shippingOptions.fields.profile")}
                </Form.Label>
                <Form.Control>
                  <Combobox
                    {...field}
                    options={shippingProfiles.options}
                    searchValue={shippingProfiles.searchValue}
                    onSearchValueChange={shippingProfiles.onSearchValueChange}
                    disabled={shippingProfiles.disabled}
                  />
                </Form.Control>
                <Form.Hint>
                  {shippingProfiles.options?.length
                    ? t("stockLocations.shippingOptions.fields.profileHint")
                    : t(
                        "stockLocations.shippingOptions.fields.profileLoading"
                      )}
                </Form.Hint>
                <Form.ErrorMessage />
              </Form.Item>
            )
          }}
        />

        <Text size="small" className="text-ui-fg-subtle">
          {t("stockLocations.shippingOptions.fields.priceType.simpleHint")}
        </Text>
      </div>
    </div>
  )
}
