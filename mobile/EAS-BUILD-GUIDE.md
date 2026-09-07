# 📱 EAS Development Build — Payment & Push Testing Guide

Razorpay checkout and push notifications are **native features** — they do
**not** work in Expo Go. To test them you need a **development build** built in
Expo's cloud (EAS Build). No Android Studio, no SDK — just an Expo account.

> ⏱️ Total time: ~20–30 minutes (build itself takes 10–20 min in the cloud).
> You only need to type a few commands — everything else is automated.

---

## Step 0 — What's already done ✅

- `eas.json` (development / preview / production profiles) — done
- `android.package` = `in.clicknsit.app` in `app.json` — done
- `eas-cli` installed in the project — done
- Razorpay (`react-native-razorpay`), push (`expo-notifications`), image
  picker, secure store — all installed — done

---

## Step 1 — Create an Expo account (5 min, one time)

1. Open **https://expo.dev/signup** on your phone/computer
2. Sign up free (email or Google)
3. Note your username/email — you'll need it in Step 2

## Step 2 — Login to EAS from your computer

Open the terminal (VS Code → Terminal, or Windows Terminal), go to the mobile
folder and login:

```bash
cd mobile
npx eas-cli login
```

- A browser window opens → login with your new Expo account
- Back in the terminal it will show `Logged in`

## Step 3 — Link the project (one time)

```bash
npx eas-cli init
```

- It asks **"Would you like to automatically create an EAS project?"** → press **Enter (Yes)**
- This creates a `projectId` in `app.json` (needed for push tokens)

## Step 4 — Start the cloud build

```bash
npx eas-cli build --platform android --profile development
```

- First time it may ask about the Android package → press Enter (it's already
  set to `in.clicknsit.app`)
- It uploads your code and builds in Expo's cloud (**10–20 minutes**)
- When done, the terminal shows a **link to download the .apk**

> 💡 Tip: you can close the terminal; the build continues in the cloud.
> Watch progress at https://expo.dev → your project → Builds.

## Step 5 — Install the dev build on your phone

1. Open the **.apk link** on your phone (or scan the QR Expo shows)
2. Download & install (Android will warn about "unknown sources" → **Allow**)
3. App icon: **ClickNsit** (dark navy, orange) — open it once

## Step 6 — Run the dev client and test payments + push

Keep your computer and phone on the **same WiFi**. In the terminal:

```bash
npx expo start --dev-client
```

Then in the installed ClickNsit app, tap where it says **"Enter URL
manually"** (or scan the QR Expo shows) and enter:

```
exp://192.168.1.10:8081
```

Now everything works — including **Razorpay checkout** and **push
notifications** 🎉

---

## ✅ How to verify each feature

| Feature | Test |
|---|---|
| **Razorpay payment** | Create account → apply for any form → at the payment screen tap **Pay Now** → real Razorpay checkout opens (UPI/card) — use **test mode only if** you switch keys to `rzp_test_`, otherwise a real small payment happens |
| **Push notifications** | Login → note your application → open the web admin (`/admin`) → change the application status → your phone gets a notification |
| **Documents upload** | In the apply flow, tap each document box → choose a photo |

> ⚠️ **Payment test warning:** your Razorpay keys are currently **LIVE**.
> A completed test payment charges real money. For safe testing, switch
> `RAZORPAY_KEY_ID`/`RAZORPAY_KEY_SECRET` in the backend to **test keys**
> (from the Razorpay dashboard → Settings → API Keys, `rzp_test_…`).

---

## Store release (later, not needed for testing)

```bash
npx eas-cli build --platform android --profile production   # Play Store .aab
# iOS needs a paid Apple Developer account:
npx eas-cli build --platform ios --profile production
```

Before store release: replace `mobile/assets/images/` with final artwork and
set `EXPO_PUBLIC_API_URL=https://clickandsit.vercel.app` in `mobile/.env`.

---

## Troubleshooting

- **"Cannot find module" / red screen on build install** → the dev build must
  connect to `expo start --dev-client`; it is not a standalone app yet.
- **Push token still null** → push needs `projectId` (Step 3) and a physical
  phone (not emulator). If you re-create the EAS project, re-run Step 3.
- **Build queue / error in cloud** → paste the error here; usually a free
  account just needs a few minutes in the queue.
- **Windows Firewall blocks the phone again** → the rule from earlier already
  allows ports 8081/63789; if a new port appears, run the firewall allow step
  again.