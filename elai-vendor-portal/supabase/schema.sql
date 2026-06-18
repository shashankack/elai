-- Supabase Schema Dump matching previous Prisma Schema
-- To be executed in the Supabase SQL Editor

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

-- Note: In the older application "KYCStatus" was an enum in Prisma. In Postgres we can use text or create an actual enum.
-- We'll just define it as a CHECK constraint on the table text field.
CREATE TABLE IF NOT EXISTS public."KYCApplication" (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" text NOT NULL REFERENCES public.users(id),
  status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'NEEDS_INFO')),
  
  -- Document references
  "businessLicenseKey" text,
  "taxIdDocumentKey" text,
  "governmentIdKey" text,
  
  -- Submitted data
  "businessName" text NOT NULL,
  "taxIdNumber" text NOT NULL,
  "businessAddress" text NOT NULL,
  
  -- Review tracking
  "reviewedBy" text REFERENCES public."AdminUser"("userId"),
  "reviewedAt" timestamp with time zone,
  "rejectionReason" text,
  "reviewerNotes" text,

  -- Mercur marketplace sync
  "mercurSellerId" text,
  "mercurSellerHandle" text,
  "mercurSyncedAt" timestamp with time zone,
  "mercurSyncError" text,
  
  -- Timestamps
  "submittedAt" timestamp with time zone DEFAULT now() NOT NULL,
  "approvedAt" timestamp with time zone,
  "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
  "updatedAt" timestamp with time zone NOT NULL
);

-- Indexes for KYCApplication
CREATE INDEX IF NOT EXISTS kyc_status_idx ON public."KYCApplication" (status);
CREATE INDEX IF NOT EXISTS kyc_user_idx ON public."KYCApplication" ("userId");
CREATE INDEX IF NOT EXISTS kyc_submitted_idx ON public."KYCApplication" ("submittedAt");

CREATE TABLE IF NOT EXISTS public."KYCReviewHistory" (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "applicationId" text NOT NULL REFERENCES public."KYCApplication"(id),
  "reviewerId" text REFERENCES public."AdminUser"("userId"),
  action text NOT NULL,
  notes text,
  "createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
