# elai-mobile

Elai B2C mobile storefront — React Native (Expo) app connected to the Mercur Store API.

## New to React Native? Start here

**What you have:** `elai-mobile` is already scaffolded. You write **React** (same language as your web app), and **Expo** turns it into Android + iOS apps.

| Concept | Plain English |
|---------|----------------|
| **React Native** | Build phone UIs with React instead of HTML |
| **Expo** | Tooling that runs your app on a phone without Xcode/Android Studio at first |
| **Expo Go** | Free app on your phone that loads your project while you develop |
| **Screen** | One full page (e.g. product list, cart) — files live in `app/` |
| **Component** | Reusable UI piece (button, product card) — files in `components/` |

**Fastest way to see the app (recommended):**

1. Install [Expo Go](https://expo.dev/go) on your Android or iPhone.
2. Start Mercur: `cd mercur && bun run dev:apps`
3. Start the app: `cd elai-mobile && npm run start`
4. Scan the QR code with Expo Go (Android: in-app scanner; iPhone: Camera app).
5. Phone and PC must be on the **same Wi‑Fi**.

**Windows note:** You cannot run the **iOS Simulator** on Windows. Use **Expo Go on a real iPhone**, or a Mac later. Android emulator works on Windows (see below).

---

Based on [Medusa's official Expo guide](https://docs.medusajs.com/resources/storefront-development/guides/react-native-expo), extended with customer auth and order history.

## Features

- Product browse and detail
- Cart management
- Checkout (delivery, shipping, payment)
- Order confirmation
- Customer sign in / register
- Order history (Account tab)

## Prerequisites

- Mercur API running (`cd mercur && bun run dev:apps`)
- Redis running locally
- Node.js v20+
- [Expo Go](https://expo.dev/go) on your phone, or Android/iOS simulator

## Setup

```bash
cd elai-mobile
npm install
cp .env.example .env
```

Set in `.env`:

| Variable | Description |
|----------|-------------|
| `EXPO_PUBLIC_MEDUSA_URL` | Mercur API URL (`http://localhost:9000` for simulator; **LAN IP** for physical device) |
| `EXPO_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY` | From Mercur admin → Settings → Publishable API Keys (same key as `elai-client`) |

### CORS (required)

Add your Expo dev server to `mercur/apps/api/.env`:

```env
STORE_CORS=...,http://localhost:8081
AUTH_CORS=...,http://localhost:8081
```

For a physical device, also add your machine's LAN IP if needed.

### Physical device networking

`localhost` on a phone points to the phone itself. Use your PC's LAN address:

```env
EXPO_PUBLIC_MEDUSA_URL=http://192.168.x.x:9000
```

Find your IP: `ipconfig` (Windows) or `ifconfig` (macOS/Linux).

## Run

```bash
npm run start
```

Then press `i` (iOS simulator), `a` (Android emulator), or scan the QR code with Expo Go.

## Project layout

| Path | Purpose |
|------|---------|
| `lib/sdk.ts` | Medusa JS SDK client (JWT auth via AsyncStorage) |
| `context/cart-context.tsx` | Cart state |
| `context/auth-context.tsx` | Customer auth |
| `context/region-context.tsx` | Region / currency selection |
| `app/(drawer)/(tabs)/(home)` | Product list and detail |
| `app/(drawer)/(tabs)/(cart)` | Cart |
| `app/(drawer)/(tabs)/(account)` | Login, profile, orders |
| `app/checkout.tsx` | Checkout flow |
| `app/order-confirmation/[id].tsx` | Post-purchase screen |

## Related projects

- `mercur/` — marketplace backend (API, admin, vendor)
- `elai-client/` — web storefront (Next.js)
