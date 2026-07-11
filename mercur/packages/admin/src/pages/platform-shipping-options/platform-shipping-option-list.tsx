import { Children, ReactNode } from "react"
import {
  Button,
  Container,
  Heading,
  StatusBadge,
  Text,
  toast,
  usePrompt,
} from "@medusajs/ui"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { PencilSquare, Trash } from "@medusajs/icons"
import { PlatformShippingOptionDTO } from "@mercurjs/types"

import { ActionMenu } from "../../components/common/action-menu"
import { SingleColumnPage } from "../../components/layout/pages"
import {
  useDeletePlatformShippingOption,
  usePlatformShippingOptions,
} from "../../hooks/api/platform-shipping-options"

const getCountryCodes = (
  countryCodes: PlatformShippingOptionDTO["country_codes"]
) => {
  if (Array.isArray(countryCodes)) {
    return countryCodes
  }
  if (
    countryCodes &&
    typeof countryCodes === "object" &&
    Array.isArray((countryCodes as { countries?: string[] }).countries)
  ) {
    return (countryCodes as { countries: string[] }).countries
  }
  return []
}

const OptionRow = ({
  option,
  onChanged,
}: {
  option: PlatformShippingOptionDTO
  onChanged: () => void
}) => {
  const { t } = useTranslation()
  const prompt = usePrompt()
  const { mutateAsync } = useDeletePlatformShippingOption(option.id)

  const handleDelete = async () => {
    const confirmed = await prompt({
      title: t("general.areYouSure"),
      description: t("platformShipping.delete.confirmation", {
        name: option.name,
      }),
      confirmText: t("actions.delete"),
      cancelText: t("actions.cancel"),
    })
    if (!confirmed) return

    await mutateAsync(undefined, {
      onSuccess: () => {
        toast.success(t("platformShipping.delete.successToast"))
        onChanged()
      },
      onError: (e) => toast.error(e.message),
    })
  }

  const countries = getCountryCodes(option.country_codes)

  return (
    <div className="flex items-center justify-between gap-4 px-6 py-4">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Text weight="plus">{option.name}</Text>
          <StatusBadge color={option.is_active ? "green" : "grey"}>
            {option.is_active
              ? t("statuses.enabled")
              : t("statuses.disabled")}
          </StatusBadge>
          {option.is_default && (
            <StatusBadge color="blue">
              {t("platformShipping.fields.default")}
            </StatusBadge>
          )}
        </div>
        <Text size="small" className="text-ui-fg-subtle">
          {option.courier_label || t("platformShipping.fields.noCourier")}
          {" · "}₹{Number(option.amount).toLocaleString("en-IN")}{" "}
          {(option.currency_code || "inr").toUpperCase()}
          {" · "}
          {countries.join(", ").toUpperCase() || "IN"}
        </Text>
        {option.description && (
          <Text size="small" className="text-ui-fg-muted mt-1">
            {option.description}
          </Text>
        )}
      </div>
      <ActionMenu
        groups={[
          {
            actions: [
              {
                label: t("actions.edit"),
                icon: <PencilSquare />,
                to: `/settings/platform-shipping-options/${option.id}/edit`,
              },
            ],
          },
          {
            actions: [
              {
                label: t("actions.delete"),
                icon: <Trash />,
                onClick: handleDelete,
              },
            ],
          },
        ]}
      />
    </div>
  )
}

const List = () => {
  const { t } = useTranslation()
  const { platform_shipping_options, isPending, refetch } =
    usePlatformShippingOptions()

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading>{t("platformShipping.domain")}</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            {t("platformShipping.description")}
          </Text>
        </div>
        <Button size="small" asChild>
          <Link to="/settings/platform-shipping-options/create">
            {t("actions.create")}
          </Link>
        </Button>
      </div>

      {isPending && (
        <div className="px-6 py-8">
          <Text size="small">{t("general.loading")}</Text>
        </div>
      )}

      {!isPending && !platform_shipping_options?.length && (
        <div className="px-6 py-8">
          <Text size="small" className="text-ui-fg-subtle">
            {t("platformShipping.list.empty")}
          </Text>
        </div>
      )}

      {platform_shipping_options?.map((option) => (
        <OptionRow key={option.id} option={option} onChanged={() => refetch()} />
      ))}
    </Container>
  )
}

const Root = ({ children }: { children?: ReactNode }) => {
  return (
    <SingleColumnPage>
      {Children.count(children) > 0 ? children : <List />}
    </SingleColumnPage>
  )
}

export const PlatformShippingOptionListPage = Object.assign(Root, { List })

export const Component = PlatformShippingOptionListPage
