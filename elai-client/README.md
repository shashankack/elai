# elai-client

Elai B2C storefront — marketing site and shop UI powered by the Mercur Store API.

## Setup

```bash
npm install
cp .env.example .env
```

Set `MERCUR_PUBLISHABLE_API_KEY` from Mercur admin (Settings → Publishable API Keys). The Mercur API must be running (`cd mercur && bun run dev:apps`).

## Development

```bash
npm run dev
```

- `/` — marketing landing page
- `/shop` — product listing from Mercur
- `/shop/products/[handle]` — product detail
