# elai-mobile

Elai B2C mobile storefront — React Native (Expo 54) app connected to the Mercur Store API, with Razorpay checkout.

## Dev vs store builds

| Mode | Use when | Razorpay? |
|------|----------|-----------|
| **Expo Go** | UI / browse / cart | No — native Razorpay needs a custom build |
| **Dev client** (`expo run:*` / EAS `development`) | Local payment testing | Yes |
| **EAS production** | Play Store / App Store | Yes |

## Setup

```bash
cd elai-mobile
npm install
cp .env.example .env
```

| Variable | Description |
|----------|-------------|
| `EXPO_PUBLIC_MEDUSA_URL` | Mercur API (`http://LAN_IP:9000` on device; `https://api.elaai.co` in prod builds) |
| `EXPO_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY` | Same publishable key as `elai-client` |
| `EXPO_PUBLIC_RAZORPAY_KEY_ID` | Same as web `NEXT_PUBLIC_RAZORPAY_KEY_ID` (fallback if session omits `key_id`) |

### CORS

Add Expo / device origins to `mercur/apps/api/.env` `STORE_CORS` and `AUTH_CORS` as needed for local testing.

## Run (UI only — Expo Go)

```bash
npm run start
```

Scan with Expo Go. Razorpay will not open in Expo Go.

## Run with Razorpay (dev client)

Needs a one-time native build (Windows: Android; Mac: iOS too):

```bash
npx expo prebuild
npm run run:android
# or on macOS:
npm run run:ios
```

Then place an order with the Razorpay provider (sign in required). Flow matches web:

1. Initiate payment session  
2. Open native Razorpay Checkout  
3. `POST /store/carts/:id/razorpay/confirm`  
4. Complete cart → order group confirmation  

## Deploy (EAS — Android + iOS)

### One-time

1. Apple Developer + Google Play accounts  
2. Install CLI and log in:

```bash
npm i -g eas-cli
cd elai-mobile
npx eas-cli login
npx eas-cli init
```

3. Set store secrets (do not commit):

```bash
npx eas-cli secret:create --name EXPO_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY --value pk_...
npx eas-cli secret:create --name EXPO_PUBLIC_RAZORPAY_KEY_ID --value rzp_...
```

`eas.json` already sets `EXPO_PUBLIC_MEDUSA_URL=https://api.elaai.co` for preview/production.

Bundle IDs (already in config): `co.elaai.app` (iOS + Android).

### Build

```bash
npm run build:android   # Play Store AAB
npm run build:ios       # App Store IPA (cloud; no Mac required for build)
npm run build:all
```

Internal APK/test build:

```bash
npm run build:preview
```

### Submit

```bash
npm run submit:android
npm run submit:ios
```

Finish listing / review in Play Console and App Store Connect.

## Project layout

| Path | Purpose |
|------|---------|
| `lib/sdk.ts` | Medusa JS SDK (JWT via AsyncStorage) |
| `lib/razorpay.ts` | Native Razorpay Checkout wrapper |
| `lib/checkout.ts` | Confirm + complete helpers |
| `lib/order-groups.ts` | Mercur marketplace order groups |
| `app/checkout.tsx` | Delivery → shipping → payment |
| `eas.json` / `app.config.js` | Store build config |

## Related

- `mercur/` — API / admin / vendor  
- `elai-client/` — web storefront  
