# 🚀 FormEasy Deployment Guide

## Prerequisites
- GitHub account
- Vercel account (free)
- Supabase account (free)
- Razorpay account

---

## Step 1: Create Supabase Database (FREE)

1. Go to [supabase.com](https://supabase.com) → Sign up with GitHub
2. Click **"New Project"**
3. Fill in:
   - Organization: Create new
   - Project name: `formeasy-db`
   - Database password: Choose a strong password (SAVE THIS!)
   - Region: **Mumbai** (or closest to India)
4. Click **"Create new project"** (takes 2 minutes)
5. Go to **Settings → Database** → Copy the **Connection string** (URI format)
6. It looks like: `postgresql://postgres.YOUR-REF:YOUR-PASSWORD@aws-0-ap-south-1.pooler.supabase.com:6543/postgres`

---

## Step 2: Push Code to GitHub

**IMPORTANT: Before pushing, switch to PostgreSQL:**

```bash
# Windows: Run the deploy script
scripts\deploy-postgres.bat

# Or manually:
# Edit prisma/schema.prisma: change provider from "sqlite" to "postgresql"
```

Then push:
```bash
git init
git add .
git commit -m "FormEasy - Production Ready"
git remote add origin https://github.com/YOUR-USERNAME/formeasy.git
git push -u origin main
```

---

## Step 3: Deploy on Vercel (FREE)

1. Go to [vercel.com](https://vercel.com) → Sign up with GitHub
2. Click **"Add New Project"**
3. Select your `formeasy` repository
4. Configure:
   - Framework: **Next.js** (auto-detected)
   - Root Directory: `./` (default)
   - Build Command: `npx prisma generate && next build`
5. **DO NOT click Deploy yet!** First add Environment Variables ↓

---

## Step 4: Add Environment Variables on Vercel

In the Vercel project settings → **Environment Variables**, add these:

### Required Variables:

| Name | Value | Where to get |
|------|-------|-------------|
| `DATABASE_URL` | `postgresql://postgres.xxx:password@aws-0...supabase.co:6543/postgres` | Supabase Settings → Database → URI |
| `NEXTAUTH_SECRET` | `any-random-32-char-string` | Generate at: `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `https://your-project.vercel.app` | Your Vercel URL |
| `RAZORPAY_KEY_ID` | `rzp_live_xxx` | Razorpay Dashboard → Settings → API Keys (Live Mode) |
| `RAZORPAY_KEY_SECRET` | `xxx` | Same place |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | `rzp_live_xxx` | Same as RAZORPAY_KEY_ID |

### How to get Supabase DATABASE_URL:
1. Supabase Dashboard → Settings (gear icon) → Database
2. Under "Connection string" → Select "URI"
3. Copy the full string
4. Replace `[YOUR-PASSWORD]` with your actual database password

### How to get Razorpay Live Keys:
1. [dashboard.razorpay.com](https://dashboard.razorpay.com) → Login
2. Settings → API Keys
3. Toggle to **"Live Mode"** (top right)
4. Click "Generate Live Key"
5. Copy Key ID and Key Secret

---

## Step 5: Deploy!

After adding all environment variables:
1. Click **"Deploy"** on Vercel
2. Wait 2-3 minutes for build to complete
3. Your app is LIVE! 🎉

---

## Step 6: Initialize Production Database

After first deploy, your database is empty. Run this locally to set up tables:

```bash
# Update your local .env temporarily:
# DATABASE_URL="your-supabase-connection-string"
# DB_PROVIDER="postgresql"

npx prisma db push
npx prisma generate

# Seed admin user and sample data:
npx tsx prisma/seed.ts
```

Then revert your local .env back to SQLite for development.

---

## Step 7: Custom Domain (Optional)

1. Buy a domain (₹500-800/year) from Namecheap, GoDaddy, etc.
2. In Vercel → Project → Settings → Domains
3. Add your domain
4. Update DNS records as Vercel instructs
5. SSL certificate is automatic (FREE)

---

## Step 8: Update Razorpay to Live Mode

1. Go to Razorpay Dashboard
2. Settings → API Keys → Switch to **Live Mode**
3. Generate Live Key
4. Update Vercel environment variables with live keys
5. Redeploy

---

## Post-Deployment Checklist

- [ ] Test signup/login on live site
- [ ] Test exam browsing
- [ ] Test application submission
- [ ] Test payment with live Razorpay
- [ ] Test admin login
- [ ] Test admin form processing
- [ ] Check email notifications
- [ ] Test mobile responsiveness
- [ ] Verify SSL (https://)
- [ ] Test from different devices

---

## Troubleshooting

### Build fails on Vercel?
- Check if `prisma generate` is in build command
- Make sure all env vars are set

### Database connection error?
- Make sure Supabase database is "Active" (not paused)
- Check DATABASE_URL has correct password
- Make sure you're using the **pooler** connection (port 6543)

### Payment not working?
- Make sure you're using LIVE Razorpay keys (not test keys)
- Check RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are correct

### Admin login not working?
- Make sure you've seeded the admin user in production DB
- Run `npx tsx prisma/seed.ts` with production DATABASE_URL

---

## Free Tier Limits

| Service | Free Limit | Good for |
|---------|-----------|----------|
| Vercel | 100 GB bandwidth/month | ~50,000 visits |
| Supabase | 500 MB database, 50K monthly active users | ~10,000 applications |
| Razorpay | 2% per transaction | No monthly fee |

**Total Monthly Cost: ₹0** (until you exceed free limits)

---

## Cost at Scale

| Users/Month | Hosting | Database | Payment Gateway | Total |
|------------|---------|----------|----------------|-------|
| 100 | Free | Free | ~₹300 | **₹300** |
| 1,000 | Free | Free | ~₹3,000 | **₹3,000** |
| 10,000 | $20 | $25 | ~₹30,000 | **₹50,000** |

*Payment gateway fee = 2% of transactions*
