# elai-client

Elai B2C storefront  marketing site and shop UI powered by the Mercur Store API.

## Setup

```bash
npm install
cp .env.example .env
```

Set `MERCUR_PUBLISHABLE_API_KEY` from Mercur admin (Settings → Publishable API Keys). The Mercur API must be running (`cd mercur && bun run dev:apps`).

Seller onboarding links go to the Mercur vendor portal (`NEXT_PUBLIC_MERCUR_VENDOR_URL`, default `http://localhost:7001/register`).

## Checkout + Razorpay

Checkout is account-only (`/shop/checkout`): delivery → per-seller shipping → payment.

**Local without Razorpay keys:** Medusa `pp_system_default` (manual) is used   “Place order” completes without a card charge.

**With Razorpay:**

1. Add to `mercur/apps/api/.env`:
   ```
   RAZORPAY_KEY_ID=rzp_test_...
   RAZORPAY_KEY_SECRET=...
   RAZORPAY_WEBHOOK_SECRET=...   # optional
   ```
2. Add to `elai-client/.env`:
   ```
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_...
   ```
3. Restart the API, then link the provider to India:
   ```bash
   cd mercur/apps/api
   bun run link:razorpay -- --force
   ```
4. Restart Next.js so the public key is picked up.

Webhook URL (if using): `https://api.elaai.co/hooks/payment/razorpay_razorpay`

## Development

```bash
npm run dev
```

- `/`  marketing landing page
- `/shop`  product listing from Mercur
- `/shop/products/[handle]`  product detail
- `/shop/checkout`  authenticated checkout
- `/shop/order-confirmation/[id]`  order group confirmation
- `/account`  profile, addresses, orders
