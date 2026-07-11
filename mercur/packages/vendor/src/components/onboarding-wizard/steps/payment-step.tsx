import { zodResolver } from "@hookform/resolvers/zod"
import { Button, Input } from "@medusajs/ui"
import i18n from "i18next"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import * as z from "zod"

import { Form } from "@components/common/form"
import { ELAI_ONBOARDING_DEFAULTS } from "../elai-onboarding-config"

const PaymentStepSchema = z.object({
  holder_name: z
    .string()
    .min(1, i18n.t("onboarding.wizard.validation.accountNameRequired")),
  bank_name: z.string().optional(),
  account_number: z.string().optional(),
  routing_number: z.string().optional(),
})

type PaymentStepFormValues = z.infer<typeof PaymentStepSchema>

export type PaymentStepValues = PaymentStepFormValues & {
  country_code: string
}

type PaymentStepProps = {
  sellerId: string
  onSubmit: (data: PaymentStepValues) => Promise<void>
  onSkip: () => void
  isPending?: boolean
}

export const PaymentStep = ({
  onSubmit,
  onSkip,
  isPending,
}: PaymentStepProps) => {
  const { t } = useTranslation()

  const form = useForm<PaymentStepFormValues>({
    resolver: zodResolver(PaymentStepSchema),
    defaultValues: {
      holder_name: "",
      bank_name: "",
      account_number: "",
      routing_number: "",
    },
  })

  const handleSubmit = form.handleSubmit(async (data) => {
    await onSubmit({
      ...data,
      country_code: ELAI_ONBOARDING_DEFAULTS.country_code,
      routing_number: data.routing_number?.toUpperCase(),
    })
  })

  return (
    <div className="flex flex-col gap-y-8">
      <Form {...form}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-y-6">
          <div className="flex flex-col gap-y-4">
            <Form.Field
              control={form.control}
              name="holder_name"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>
                    {t("onboarding.wizard.payment.accountName")}
                  </Form.Label>
                  <Form.Control>
                    <Input
                      placeholder={t(
                        "onboarding.wizard.payment.accountNamePlaceholder",
                      )}
                      autoComplete="name"
                      {...field}
                    />
                  </Form.Control>
                  <Form.Hint>
                    {t("onboarding.wizard.payment.accountNameHint")}
                  </Form.Hint>
                  <Form.ErrorMessage />
                </Form.Item>
              )}
            />
            <Form.Field
              control={form.control}
              name="bank_name"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label optional>
                    {t("onboarding.wizard.payment.bankName")}
                  </Form.Label>
                  <Form.Control>
                    <Input
                      placeholder={t(
                        "onboarding.wizard.payment.bankNamePlaceholder",
                      )}
                      {...field}
                    />
                  </Form.Control>
                  <Form.Hint>
                    {t("onboarding.wizard.payment.bankNameHint")}
                  </Form.Hint>
                  <Form.ErrorMessage />
                </Form.Item>
              )}
            />
            <Form.Field
              control={form.control}
              name="account_number"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label optional>
                    {t("onboarding.wizard.payment.accountNumber")}
                  </Form.Label>
                  <Form.Control>
                    <Input
                      {...field}
                      className="font-mono"
                      inputMode="numeric"
                      placeholder={t(
                        "onboarding.wizard.payment.accountNumberPlaceholder",
                      )}
                    />
                  </Form.Control>
                  <Form.Hint>
                    {t("onboarding.wizard.payment.accountNumberHint")}
                  </Form.Hint>
                  <Form.ErrorMessage />
                </Form.Item>
              )}
            />
            <Form.Field
              control={form.control}
              name="routing_number"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label optional>
                    {t("onboarding.wizard.payment.ifsc")}
                  </Form.Label>
                  <Form.Control>
                    <Input
                      {...field}
                      className="font-mono uppercase tracking-wide"
                      placeholder={t(
                        "onboarding.wizard.payment.ifscPlaceholder",
                      )}
                      onChange={(e) =>
                        field.onChange(e.target.value.toUpperCase())
                      }
                    />
                  </Form.Control>
                  <Form.Hint>
                    {t("onboarding.wizard.payment.ifscHint")}
                  </Form.Hint>
                  <Form.ErrorMessage />
                </Form.Item>
              )}
            />
          </div>
          <div className="flex flex-col gap-y-2">
            <Button type="submit" className="w-full" isLoading={isPending}>
              {t("actions.continue")}
            </Button>
            <Button
              type="button"
              variant="transparent"
              className="w-full"
              onClick={onSkip}
            >
              {t("onboarding.wizard.skip")}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
