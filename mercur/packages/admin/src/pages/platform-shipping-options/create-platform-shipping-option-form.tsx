import { zodResolver } from "@hookform/resolvers/zod"
import { Button, Heading, Input, Switch, Text, Textarea, toast } from "@medusajs/ui"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import * as zod from "zod"

import { Form } from "../../components/common/form"
import { RouteFocusModal, useRouteModal } from "../../components/modals"
import { KeyboundForm } from "../../components/utilities/keybound-form"
import { useCreatePlatformShippingOption } from "../../hooks/api/platform-shipping-options"

const Schema = zod.object({
  name: zod.string().min(1),
  description: zod.string().optional(),
  courier_label: zod.string().optional(),
  amount: zod.coerce.number().min(0),
  currency_code: zod.string().default("inr"),
  is_active: zod.boolean(),
  is_default: zod.boolean(),
})

export const CreatePlatformShippingOptionForm = () => {
  const { t } = useTranslation()
  const { handleSuccess } = useRouteModal()
  const { mutateAsync, isPending } = useCreatePlatformShippingOption()

  const form = useForm<zod.infer<typeof Schema>>({
    defaultValues: {
      name: "ELAI Standard Delivery",
      description:
        "ELAI arranges courier pickup and delivery (BlueDart / Shiprocket). You pack the order.",
      courier_label: "BlueDart / Shiprocket",
      amount: 79,
      currency_code: "inr",
      is_active: true,
      is_default: true,
    },
    resolver: zodResolver(Schema),
  })

  const handleSubmit = form.handleSubmit(async (values) => {
    await mutateAsync(
      {
        ...values,
        description: values.description || null,
        courier_label: values.courier_label || null,
        country_codes: { countries: ["in"] },
      },
      {
        onSuccess: () => {
          toast.success(t("platformShipping.create.successToast"))
          handleSuccess("/settings/platform-shipping-options")
        },
        onError: (e) => toast.error(e.message),
      }
    )
  })

  return (
    <RouteFocusModal.Form form={form}>
      <KeyboundForm
        onSubmit={handleSubmit}
        className="flex h-full flex-col overflow-hidden"
      >
        <RouteFocusModal.Header />
        <RouteFocusModal.Body className="flex flex-1 flex-col overflow-y-auto">
          <div className="mx-auto flex w-full max-w-lg flex-col gap-y-6 px-2 py-12">
            <div>
              <Heading>{t("platformShipping.create.header")}</Heading>
              <Text size="small" className="text-ui-fg-subtle">
                {t("platformShipping.create.description")}
              </Text>
            </div>

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
                    <Input
                      placeholder="BlueDart / Shiprocket"
                      {...field}
                    />
                  </Form.Control>
                  <Form.Hint>
                    {t("platformShipping.fields.courierHint")}
                  </Form.Hint>
                  <Form.ErrorMessage />
                </Form.Item>
              )}
            />

            <Form.Field
              control={form.control}
              name="amount"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t("platformShipping.fields.amount")}</Form.Label>
                  <Form.Control>
                    <Input type="number" min={0} step="1" {...field} />
                  </Form.Control>
                  <Form.Hint>
                    {t("platformShipping.fields.amountHint")}
                  </Form.Hint>
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
                  <Form.Hint>
                    {t("platformShipping.fields.defaultHint")}
                  </Form.Hint>
                </Form.Item>
              )}
            />
          </div>
        </RouteFocusModal.Body>
        <RouteFocusModal.Footer>
          <div className="flex items-center justify-end gap-x-2">
            <RouteFocusModal.Close asChild>
              <Button size="small" variant="secondary">
                {t("actions.cancel")}
              </Button>
            </RouteFocusModal.Close>
            <Button size="small" type="submit" isLoading={isPending}>
              {t("actions.save")}
            </Button>
          </div>
        </RouteFocusModal.Footer>
      </KeyboundForm>
    </RouteFocusModal.Form>
  )
}
