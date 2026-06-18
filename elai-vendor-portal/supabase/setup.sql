-- ELAI Vendor Portal — full Supabase setup
-- Run this entire file in: Supabase Dashboard → SQL Editor → New query → Run

-- ---------------------------------------------------------------------------
-- 1. Core tables
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.users (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email text UNIQUE NOT NULL,
  "firstName" text,
  "lastName" text,
  role text NOT NULL DEFAULT 'user',
  "emailVerified" timestamp with time zone,
  image text,
  "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
  "updatedAt" timestamp with time zone NOT NULL
);

CREATE TABLE IF NOT EXISTS public.accounts (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" text NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  provider text NOT NULL,
  "providerAccountId" text NOT NULL,
  refresh_token text,
  access_token text,
  expires_at integer,
  token_type text,
  scope text,
  id_token text,
  session_state text,
  UNIQUE(provider, "providerAccountId")
);

CREATE TABLE IF NOT EXISTS public.sessions (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "sessionToken" text UNIQUE NOT NULL,
  "userId" text NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  expires timestamp with time zone NOT NULL
);

CREATE TABLE IF NOT EXISTS public.verification_tokens (
  identifier text NOT NULL,
  token text UNIQUE NOT NULL,
  expires timestamp with time zone NOT NULL,
  UNIQUE(identifier, token)
);

CREATE TABLE IF NOT EXISTS public."AdminUser" (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" text UNIQUE NOT NULL REFERENCES public.users(id),
  role text NOT NULL DEFAULT 'admin',
  "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
  "updatedAt" timestamp with time zone NOT NULL
);

CREATE TABLE IF NOT EXISTS public."KYCApplication" (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" text NOT NULL REFERENCES public.users(id),
  status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'NEEDS_INFO')),

  "businessLicenseKey" text,
  "taxIdDocumentKey" text,
  "governmentIdKey" text,

  "businessName" text NOT NULL,
  "taxIdNumber" text NOT NULL,
  "businessAddress" text NOT NULL,

  "bankAccountName" text,
  "bankAccountNumber" text,
  "bankRoutingNumber" text,
  "shippingMethod" text,
  "leadTime" text,
  "aboutUs" text,
  "logoKey" text,
  "firstProductTitle" text,
  "firstProductPrice" text,
  "firstProductCategory" text,
  "firstProductImageKey" text,

  "reviewedBy" text REFERENCES public."AdminUser"("userId"),
  "reviewedAt" timestamp with time zone,
  "rejectionReason" text,
  "reviewerNotes" text,

  "mercurSellerId" text,
  "mercurSellerHandle" text,
  "mercurSyncedAt" timestamp with time zone,
  "mercurSyncError" text,

  "submittedAt" timestamp with time zone DEFAULT now() NOT NULL,
  "approvedAt" timestamp with time zone,
  "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
  "updatedAt" timestamp with time zone NOT NULL
);

CREATE INDEX IF NOT EXISTS kyc_status_idx ON public."KYCApplication" (status);
CREATE INDEX IF NOT EXISTS kyc_user_idx ON public."KYCApplication" ("userId");
CREATE INDEX IF NOT EXISTS kyc_submitted_idx ON public."KYCApplication" ("submittedAt");
CREATE INDEX IF NOT EXISTS kyc_mercur_seller_idx ON public."KYCApplication" ("mercurSellerId");

CREATE TABLE IF NOT EXISTS public."KYCReviewHistory" (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "applicationId" text NOT NULL REFERENCES public."KYCApplication"(id),
  "reviewerId" text REFERENCES public."AdminUser"("userId"),
  action text NOT NULL,
  notes text,
  "createdAt" timestamp with time zone DEFAULT now() NOT NULL
);

-- ---------------------------------------------------------------------------
-- 2. Seed a default admin reviewer (used by /admin dashboard)
-- ---------------------------------------------------------------------------

INSERT INTO public.users (id, email, role, "updatedAt")
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin@elai.local',
  'admin',
  now()
)
ON CONFLICT (email) DO UPDATE SET "updatedAt" = now();

INSERT INTO public."AdminUser" (id, "userId", role, "updatedAt")
VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'admin',
  now()
)
ON CONFLICT ("userId") DO UPDATE SET "updatedAt" = now();

-- ---------------------------------------------------------------------------
-- 3. Row Level Security (optional — API uses service role and bypasses RLS)
-- ---------------------------------------------------------------------------

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."KYCApplication" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."KYCReviewHistory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."AdminUser" ENABLE ROW LEVEL SECURITY;

-- No public policies: all access goes through Next.js API routes with service role key.

-- ---------------------------------------------------------------------------
-- 4. Verify
-- ---------------------------------------------------------------------------

SELECT 'users' AS table_name, count(*) AS row_count FROM public.users
UNION ALL
SELECT 'AdminUser', count(*) FROM public."AdminUser"
UNION ALL
SELECT 'KYCApplication', count(*) FROM public."KYCApplication";
