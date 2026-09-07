# ClickNsit — Mobile App (Expo / React Native)

The ClickNsit app for Android & iOS. It reuses the existing Next.js backend
(`/api/*` on the deployed web app) — no separate server needed.

## Stack

- **Expo SDK 57** + expo-router (file-based navigation)
- **TypeScript**
- Auth via a **JWT** issued by the new backend endpoint `POST /api/mobile/login`
  (Bearer token, stored in expo-secure-store)
- Payments via **Razorpay** (`react-native-razorpay`)
- **Push notifications** via `expo-notifications` + the new backend
  `/api/mobile/push-token` route (Expo push service)

## Prerequisites

1. **Backend schema change** (one time): the mobile app adds a `PushToken`
   table. Run on your database:

   ```bash
   npx prisma db push
   ```

   (Locally and again after deploying — Vercel runs `prisma generate` only,
   so push the schema first against your Supabase/Postgres URL.)

2. Point the app at your backend — create `mobile/.env`:

   ```bash
   cp .env.example .env   # set EXPO_PUBLIC_API_URL to your deployed URL
   ```

## Payment & push testing (Razorpay, notifications)

Expo Go does not support remote push (SDK 53+) or the Razorpay native
checkout. For payment + push testing, build a development build with EAS:
see **[EAS-BUILD-GUIDE.md](EAS-BUILD-GUIDE.md)** (cloud build — no Android
Studio needed).

---

## Run locally

Razorpay checkout is a **native module — it will not work in Expo Go**. Use a
development build for anything involving payments:

```bash
cd mobile
npm install
npx expo run:android     # or: npx expo run:ios
# or a dev build via EAS:
# eas build --platform android --profile development
```

For pure UI work (no payments) you can still run:

```bash
npx expo start          # then press a / i / w in Expo Go or a simulator
```

## Build for the stores

```bash
cd mobile
npx eas-cli build --platform android    # Play Store (AAB)
npx eas-cli build --platform ios        # App Store (needs a paid Apple account)
```

Store listing, icon and splash assets live in `assets/images/`. Replace them
with final artwork before release (`app.json` already sets brand colors).

## Backend endpoints used (all already exist / added)

| Purpose | Endpoint | Auth |
|---|---|---|
| Login (JWT) | `POST /api/mobile/login` | — |
| Signup | `POST /api/auth/signup` | — |
| Browse forms | `GET /api/exams`, `/api/exams/[id]` | — |
| My applications | `GET /api/applications/user` | Bearer |
| Application detail | `GET /api/applications/[id]` | Bearer |
| Create application | `POST /api/applications` | Bearer |
| Upload document | `POST /api/upload` (multipart) | Bearer |
| Razorpay order | `POST /api/payment/create-order` | Bearer |
| Verify payment | `POST /api/payment/verify` | — |
| Referral info | `GET /api/referral` | Bearer |
| Profile | `GET /api/user/profile` | Bearer |
| Register push token | `POST /api/mobile/push-token` | Bearer |

## Push notifications

Status changes made in the web admin panel automatically push to the user's
devices (via `src/lib/push.ts` on the backend, wired into the admin
application-status route and payment verification). A push token is registered
automatically after the user logs in on the app.

## Notes

- `EXPO_PUBLIC_API_URL` defaults to `https://clickandsit.vercel.app`.
- The exam `apply` flow collects photo/signature/ID images with
  `expo-image-picker` and uploads them as multipart files (3 MB limit per
  document on the backend).
