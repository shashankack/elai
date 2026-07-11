import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input, Select, Textarea } from "@medusajs/ui";
import i18n from "i18next";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useLoaderData } from "react-router-dom";
import * as z from "zod";

import { Form } from "@components/common/form";
import { HandleInput } from "@components/inputs/handle-input";
import { useStore } from "@hooks/api";
import {
  ELAI_ONBOARDING_DEFAULTS,
  isOnboardingFieldVisible,
} from "../elai-onboarding-config";
import { onboardingLoader } from "../../../pages/onboarding/loader";

const StoreStepSchema = z.object({
  name: z.string().min(1, i18n.t("onboarding.wizard.validation.nameRequired")),
  email: z.string().email(i18n.t("onboarding.wizard.validation.emailInvalid")),
  phone: z.string().optional(),
  currency_code: z.string().min(1, i18n.t("onboarding.wizard.validation.currencyRequired")),
  description: z.string().optional(),
  handle: z.string().optional(),
});

type StoreStepValues = z.infer<typeof StoreStepSchema>;

type StoreStepProps = {
  onSubmit: (data: StoreStepValues) => Promise<void>;
  isPending?: boolean;
};

export const StoreStep = ({ onSubmit, isPending }: StoreStepProps) => {
  const { t } = useTranslation();
  const initialData = useLoaderData() as Awaited<
    ReturnType<typeof onboardingLoader>
  >;
  const { store } = useStore(undefined, { initialData });

  const currencyOptions = useMemo(() => {
    const fromStore = store?.supported_currencies ?? [];
    if (fromStore.length > 0) {
      return fromStore;
    }
    return [{ currency_code: "inr" }, { currency_code: "usd" }, { currency_code: "eur" }];
  }, [store?.supported_currencies]);

  const form = useForm<StoreStepValues>({
    resolver: zodResolver(StoreStepSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      currency_code: isOnboardingFieldVisible("store", "currency_code")
        ? ""
        : ELAI_ONBOARDING_DEFAULTS.currency_code,
      description: "",
      handle: "",
    },
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    await onSubmit(data);
  });

  return (
    <div className="flex flex-col gap-y-8">
      <Form {...form}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-y-6">
          <div className="flex flex-col gap-y-4">
            <Form.Field
              control={form.control}
              name="name"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t("onboarding.wizard.store.name")}</Form.Label>
                  <Form.Control>
                    <Input
                      autoComplete="organization"
                      placeholder={t("onboarding.wizard.store.namePlaceholder")}
                      {...field}
                    />
                  </Form.Control>
                  <Form.Hint>{t("onboarding.wizard.store.nameHint")}</Form.Hint>
                  <Form.ErrorMessage />
                </Form.Item>
              )}
            />
            <Form.Field
              control={form.control}
              name="email"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t("onboarding.wizard.store.email")}</Form.Label>
                  <Form.Control>
                    <Input
                      type="email"
                      autoComplete="email"
                      placeholder={t("onboarding.wizard.store.emailPlaceholder")}
                      {...field}
                    />
                  </Form.Control>
                  <Form.Hint>{t("onboarding.wizard.store.emailHint")}</Form.Hint>
                  <Form.ErrorMessage />
                </Form.Item>
              )}
            />
            {isOnboardingFieldVisible("store", "phone") && (
              <Form.Field
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label optional>{t("fields.phone")}</Form.Label>
                    <Form.Control>
                      <Input type="tel" autoComplete="tel" {...field} />
                    </Form.Control>
                    <Form.ErrorMessage />
                  </Form.Item>
                )}
              />
            )}
            {isOnboardingFieldVisible("store", "description") && (
              <Form.Field
                control={form.control}
                name="description"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label optional>
                      {t("fields.description")}
                    </Form.Label>
                    <Form.Control>
                      <Textarea {...field} />
                    </Form.Control>
                    <Form.ErrorMessage />
                  </Form.Item>
                )}
              />
            )}
            {isOnboardingFieldVisible("store", "handle") && (
              <Form.Field
                control={form.control}
                name="handle"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label
                      optional
                      tooltip={t("onboarding.wizard.store.handleTooltip")}
                    >
                      {t("onboarding.wizard.store.handle")}
                    </Form.Label>
                    <Form.Control>
                      <HandleInput {...field} />
                    </Form.Control>
                    <Form.ErrorMessage />
                  </Form.Item>
                )}
              />
            )}
            {isOnboardingFieldVisible("store", "currency_code") && (
              <Form.Field
                control={form.control}
                name="currency_code"
                render={({ field: { onChange, ref, ...field } }) => (
                  <Form.Item>
                    <Form.Label>
                      {t("onboarding.wizard.store.currency")}
                    </Form.Label>
                    <Form.Control>
                      <Select {...field} onValueChange={onChange}>
                        <Select.Trigger ref={ref}>
                          <Select.Value
                            placeholder={t("onboarding.wizard.store.selectCurrency")}
                          />
                        </Select.Trigger>
                        <Select.Content position="item-aligned">
                          {currencyOptions.map((sc) => (
                            <Select.Item
                              key={sc.currency_code}
                              value={sc.currency_code}
                            >
                              {sc.currency_code.toUpperCase()}
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select>
                    </Form.Control>
                    <Form.ErrorMessage />
                  </Form.Item>
                )}
              />
            )}
          </div>
          <Button type="submit" className="w-full" isLoading={isPending}>
            {t("actions.continue")}
          </Button>
        </form>
      </Form>
    </div>
  );
};
