# Telegram Notifications - Auto Setup Guide

## Step 1: Create Free Cron Job

1. **https://www.cron-job.org** pe jao
2. Free account banao (email se)
3. **"Create Job"** pe click karo

### Job Settings:
```
URL: https://formeasy2.vercel.app/api/cron/telegram-notifications
Method: GET
Headers:
  Authorization: Bearer formeasy-cron-secret-2026
Schedule: Every 2 minutes
```

4. **Save** pe click karo
5. **Enable** karo

## How It Works:

```
Every 2 minutes:
  cron-job.org → calls → /api/cron/telegram-notifications
  → endpoint checks for UNREAD notifications in DB
  → sends them to Telegram
  → if Telegram fails, notification stays in DB for next retry
```

## Alternative: Manual Retry

Admin panel mein **"Retry to Telegram"** button se manually bhi bhej sakte ho.
