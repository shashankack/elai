import { useParams } from "react-router-dom"
import { Heading, Text, toast } from "@medusajs/ui"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button, Input, Switch, Textarea } from "@medusajs/ui"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import * as zod from "zod"
import { useEffect } from "react"

import { Form } from "../../components/common/form"
import { RouteDrawer, useRouteModal } from "../../components/modals"
import { KeyboundForm } from "../../components/utilities/keybound-form"
import {
  usePlatformShippingOptions,
  useUpdatePlatformShippingOption,
} from "../../hooks/api/platform-shipping-options"

const Schema = zod.object({
  name: zod.string().min(1),
  description: zod.string().optional(),
  courier_label: zod.string().optional(),
  amount: zod.coerce.number().min(0),
  is_active: zod.boolean(),
  is_default: zod.boolean(),
})

export const PlatformShippingOptionEditPage = () => {
  const { id } = useParams()
  const { t } = useTranslation()
  const { handleSuccess } = useRouteModal()
  const { platform_shipping_options, isPending } = usePlatformShippingOptions()
  const option = platform_shipping_options?.find((o) => o.id === id)
  const { mutateAsync, isPending: isSaving } = useUpdatePlatformShippingOption(
    id!
  )

  const form = useForm<zod.infer<typeof Schema>>({
    defaultValues: {
      name: "",
      description: "",
      courier_label: "",
      amount: 0,
      is_active: true,
      is_default: false,
    },
    resolver: zodResolver(Schema),
  })

  useEffect(() => {
    if (!option) return
    form.reset({
      name: option.name,
      description: option.description || "",
      courier_label: option.courier_label || "",
      amount: Number(option.amount),
      is_active: !!option.is_active,
      is_default: !!option.is_default,
    })
  }, [option, form])

  const handleSubmit = form.handleSubmit(async (values) => {
    await mutateAsync(
      {
        ...values,
        description: values.description || null,
        courier_label: values.courier_label || null,
      },
      {
        onSuccess: () => {
          toast.success(t("platformShipping.edit.successToast"))
          handleSuccess("/settings/platform-shipping-options")
        },
        onError: (e) => toast.error(e.message),
      }
    )
  })

  return (
    <RouteDrawer>
      <RouteDrawer.Header>
        <Heading>{t("platformShipping.edit.header")}</Heading>
      </RouteDrawer.Header>
      {isPending || !option ? (
        <RouteDrawer.Body>
          <Text size="small">{t("general.loading")}</Text>
        </RouteDrawer.Body>
      ) : (
        <RouteDrawer.Form form={form}>
          <KeyboundForm
            onSubmit={handleSubmit}
            className="flex flex-1 flex-col overflow-hidden"
          >
            <RouteDrawer.Body className="flex flex-col gap-y-6 overflow-y-auto">
              <Form.Field
                control={form.control}
                name="name"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t("platformShipping.fields.name")}</Form.Label>
                    <Form.Control>
                      <Input {...field} />
                    </Form.Control>
                    <Form.ErrorMessage />
                  </Form.Item>
                )}
              />
              <Form.Field
                control={form.control}
                name="courier_label"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>
                      {t("platformShipping.fields.courier")}
                    </Form.Label>
                    <Form.Control>
                      <Input {...field} />
                    </Form.Control>
                    <Form.ErrorMessage />
                  </Form.Item>
                )}
              />
              <Form.Field
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>
                      {t("platformShipping.fields.amount")}
                    </Form.Label>
                    <Form.Control>
                      <Input type="number" min={0} step="1" {...field} />
                    </Form.Control>
                    <Form.ErrorMessage />
                  </Form.Item>
                )}
              />
              <Form.Field
                control={form.control}
                name="description"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>
                      {t("platformShipping.fields.description")}
                    </Form.Label>
                    <Form.Control>
                      <Textarea rows={3} {...field} />
                    </Form.Control>
                    <Form.ErrorMessage />
                  </Form.Item>
                )}
              />
              <Form.Field
                control={form.control}
                name="is_active"
                render={({ field: { value, onChange, ...field } }) => (
                  <Form.Item>
                    <div className="flex items-center justify-between">
                      <Form.Label>
                        {t("platformShipping.fields.active")}
                      </Form.Label>
                      <Form.Control>
                        <Switch
                          checked={value}
                          onCheckedChange={onChange}
                          {...field}
                        />
                      </Form.Control>
                    </div>
                  </Form.Item>
                )}
              />
              <Form.Field
                control={form.control}
                name="is_default"
                render={({ field: { value, onChange, ...field } }) => (
                  <Form.Item>
                    <div className="flex items-center justify-between">
                      <Form.Label>
                        {t("platformShipping.fields.default")}
                      </Form.Label>
                      <Form.Control>
                        <Switch
                          checked={value}
                          onCheckedChange={onChange}
                          {...field}
                        />
                      </Form.Control>
                    </div>
                  </Form.Item>
                )}
              />
            </RouteDrawer.Body>
            <RouteDrawer.Footer>
              <div className="flex items-center justify-end gap-x-2">
                <RouteDrawer.Close asChild>
                  <Button size="small" variant="secondary">
                    {t("actions.cancel")}
                  </Button>
                </RouteDrawer.Close>
                <Button size="small" type="submit" isLoading={isSaving}>
                  {t("actions.save")}
                </Button>
              </div>
            </RouteDrawer.Footer>
          </KeyboundForm>
        </RouteDrawer.Form>
      )}
    </RouteDrawer>
  )
}

export const Component = PlatformShippingOptionEditPage
