-- Onboarding fields collected in /register but previously not persisted

ALTER TABLE public."KYCApplication"
  ADD COLUMN IF NOT EXISTS "bankAccountName" text,
  ADD COLUMN IF NOT EXISTS "bankAccountNumber" text,
  ADD COLUMN IF NOT EXISTS "bankRoutingNumber" text,
  ADD COLUMN IF NOT EXISTS "shippingMethod" text,
  ADD COLUMN IF NOT EXISTS "leadTime" text,
  ADD COLUMN IF NOT EXISTS "aboutUs" text,
  ADD COLUMN IF NOT EXISTS "logoKey" text,
  ADD COLUMN IF NOT EXISTS "firstProductTitle" text,
  ADD COLUMN IF NOT EXISTS "firstProductPrice" text,
  ADD COLUMN IF NOT EXISTS "firstProductCategory" text,
  ADD COLUMN IF NOT EXISTS "firstProductImageKey" text;
