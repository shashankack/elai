import { Input, Textarea } from "@medusajs/ui"
import { useTranslation } from "react-i18next"

import { Form } from "@components/common/form"
import { HandleInput } from "@components/inputs/handle-input"
import { useTabbedForm } from "@components/tabbed-form"
import { ProductCreateSchemaType } from "../../../types"

export const ProductCreateGeneralSection = () => {
  const { t } = useTranslation()
  const form = useTabbedForm<ProductCreateSchemaType>()

  return (
    <div id="general" className="flex flex-col gap-y-6">
      <Form.Field
        control={form.control}
        name="title"
        render={({ field }) => {
          return (
            <Form.Item>
              <Form.Label>{t("products.fields.title.label")}</Form.Label>
              <Form.Control>
                <Input
                  size="small"
                  {...field}
                  placeholder={t("products.fields.title.placeholder")}
                />
              </Form.Control>
              <Form.Hint>{t("products.fields.title.hint")}</Form.Hint>
              <Form.ErrorMessage>
                {form.formState.errors.title?.message}
              </Form.ErrorMessage>
            </Form.Item>
          )
        }}
      />

      <Form.Field
        control={form.control}
        name="subtitle"
        render={({ field }) => {
          return (
            <Form.Item>
              <Form.Label optional>
                {t("products.fields.subtitle.label")}
              </Form.Label>
              <Form.Control>
                <Input
                  size="small"
                  {...field}
                  placeholder={t("products.fields.subtitle.placeholder")}
                />
              </Form.Control>
              <Form.Hint>{t("products.fields.subtitle.hint")}</Form.Hint>
            </Form.Item>
          )
        }}
      />

      <Form.Field
        control={form.control}
        name="description"
        render={({ field }) => {
          return (
            <Form.Item>
              <Form.Label optional>
                {t("products.fields.description.label")}
              </Form.Label>
              <Form.Control>
                <Textarea
                  {...field}
                  rows={4}
                  placeholder={t("products.fields.description.placeholder")}
                />
              </Form.Control>
              <Form.Hint>{t("products.fields.description.hint")}</Form.Hint>
            </Form.Item>
          )
        }}
      />

      <Form.Field
        control={form.control}
        name="handle"
        render={({ field }) => {
          return (
            <Form.Item>
              <Form.Label
                optional
                tooltip={t("products.fields.handle.tooltip")}
              >
                {t("products.fields.handle.label")}
              </Form.Label>
              <Form.Control>
                <HandleInput
                  {...field}
                  placeholder={t("products.fields.handle.placeholder")}
                />
              </Form.Control>
              <Form.Hint>{t("products.fields.handle.hint")}</Form.Hint>
              <Form.ErrorMessage>
                {form.formState.errors.handle?.message}
              </Form.ErrorMessage>
            </Form.Item>
          )
        }}
      />
    </div>
  )
}
