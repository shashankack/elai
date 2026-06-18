-- Run in Supabase SQL Editor after initial schema

ALTER TABLE public."KYCApplication"
  ADD COLUMN IF NOT EXISTS "mercurSellerId" text,
  ADD COLUMN IF NOT EXISTS "mercurSellerHandle" text,
  ADD COLUMN IF NOT EXISTS "mercurSyncedAt" timestamp with time zone,
  ADD COLUMN IF NOT EXISTS "mercurSyncError" text;

CREATE INDEX IF NOT EXISTS kyc_mercur_seller_idx ON public."KYCApplication" ("mercurSellerId");

ALTER TABLE public."KYCReviewHistory"
  ALTER COLUMN "reviewerId" DROP NOT NULL;
