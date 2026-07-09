/**
 * Toggle onboarding field visibility for ELAI.
 * Add field names here to hide them in the wizard UI.
 * Hidden required fields use defaults from ELAI_ONBOARDING_DEFAULTS.
 */
export const ELAI_ONBOARDING_HIDDEN_FIELDS = {
  store: ["phone", "description", "handle", "currency_code"],
  address: ["address_2", "province", "country_code"],
  company: ["registration_number"],
  payment: [] as const,
} as const;

export type OnboardingFieldStep = keyof typeof ELAI_ONBOARDING_HIDDEN_FIELDS;

export const ELAI_ONBOARDING_DEFAULTS = {
  currency_code: "inr",
  country_code: "in",
} as const;

export const isOnboardingFieldVisible = (
  step: OnboardingFieldStep,
  field: string,
): boolean => {
  return !(
    ELAI_ONBOARDING_HIDDEN_FIELDS[step] as readonly string[]
  ).includes(field);
};

export const slugifyStoreHandle = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};
