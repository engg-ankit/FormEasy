# ClickNsit — Online Cyber Cafe

India's trusted online cyber cafe for form filling. Users fill their basic details online, upload documents, and pay — ClickNsit's admin team submits the form on the official portal.

**Live**: https://clickandsit.vercel.app

---

## 🚀 Features

### 👤 User Side

| Feature | Description |
|---------|-------------|
| **Browse Forms** | Catalog of exam forms, college registrations, scholarships — filterable by category with search |
| **3-Step Application** | Basic info (name, mobile, email, DOB, gender) → Documents → Review & Pay. Admin fills the official form |
| **Important Notice Popup** | Users see clear instructions before filling — upload clear documents, admin handles the rest |
| **Document Upload** | Upload photo, signature, ID proof with live preview before submission |
| **Razorpay Payment** | Official fee + service fee breakdown, coupon support, secure checkout |
| **User Dashboard** | Overview, My Applications, Payment History, Referrals, Profile tabs |
| **Application Detail** | Full status timeline, uploaded admin documents, payment info, PDF export |
| **Download Documents** | Download filled form, payment receipt, acknowledgement slip uploaded by admin |
| **Referral System** | Unique referral code, ₹25 bonus per successful referral |
| **Deadline Reminders** | Upcoming deadline alerts on dashboard with urgent highlighting |
| **Form Requests** | Request forms not in the catalog — admin reviews and adds them |
| **Profile Edit** | Update name, email, mobile number |
| **Dark Mode** | Toggle dark/light theme — works on desktop and mobile |
| **Forgot Password** | Password reset via email |
| **WhatsApp Support** | Floating WhatsApp button for quick support (+91 9650752995) |
| **Chat Support** | AI-powered chatbot on homepage for FAQs and queries |
| **Splash Screen** | Brand intro animation on first visit |

### 🛠️ Admin Side

| Feature | Description |
|---------|-------------|
| **Dashboard** | Stats cards + "Forms To Process" queue with pending count badge |
| **Application Processing** | Portal links (SSC, IBPS, Railway), "Copy All Fields" button, individual field copy, processing checklist |
| **Status Workflow** | Submitted → In Process → Form Filled → Completed with notifications |
| **Multi-File Upload** | Upload multiple documents (filled form, receipt, acknowledgement) with custom names via drag & drop |
| **Receipt/Documents Management** | Download, delete individual documents per application |
| **Search + Pagination** | Search by name/email/mobile, filter by status, paginated results |
| **CSV Export** | Download filtered applications as Excel-compatible CSV |
| **Internal Notes** | Add comments/notes to applications for team coordination |
| **Exam CRUD** | Create, edit, delete exam forms with category, fees, documents, deadlines |
| **Portal URL Auto-Detect** | 60+ categories auto-detect official portal links (SSC, UPSC, Railway, Banking, etc.) |
| **Payment Tracking** | View all payments with status filters, CSV export, revenue reports |
| **Coupon Management** | Create percentage/flat discount coupons with expiry and usage limits |
| **Analytics** | Revenue charts, application trends, payment success rates |
| **Form Requests** | Approve/decline user requests with fee estimate and admin notes |
| **OTP-Based Form Editing** | Share OTP link with users to edit form data remotely |

### 🤖 Telegram Bot

Full-featured Telegram bot replicating website functionality:

| Feature | Command | Description |
|---------|---------|-------------|
| Browse Exams | `/exams` or 🔍 Browse Exams | Paginated list with fees, dates, details |
| Apply for Form | Apply Now button | 5-step chat: Name → Parents → DOB → Contact → Address → Review → Submit |
| Make Payment | 💳 Pay Now | Razorpay payment link |
| Track Status | 📋 My Applications | Real-time application status |
| Full Details | Tap on application | Form data, payment, documents |
| Payment History | 💰 Payment History | Total spent, all transactions |
| Profile | 👤 My Profile | Name, mobile, applications count, referral |
| Download Receipt | 📥 Download Receipt | Filled form PDF download link |
| Request Form | 📩 Request Form | Submit new form request |
| Contact Support | 💬 Contact Support | Email + website link |
| **Admin: Dashboard** | 📊 Dashboard Stats | Users, apps, revenue, pending count |
| **Admin: Pending** | 📥 Pending Applications | All pending apps with one-tap actions |
| **Admin: Process** | 🔍 Mark In Review | Status SUBMITTED → IN_PROCESS |
| **Admin: Form Filled** | 📝 Mark Form Filled | Status IN_PROCESS → FORM_FILLED |
| **Admin: Complete** | ✅ Mark Completed | Status → COMPLETED |
| **Admin: Reject** | ❌ Reject | Status → REJECTED |
| **Admin: Upload Receipt** | 📤 Upload Receipt | PDF upload → user gets notification |
| **Admin: Revenue** | 💰 Revenue Details | Monthly, weekly, success rate |

### 🌐 Public Pages

| Page | URL | Content |
|------|-----|---------|
| Homepage | `/` | Hero, How It Works, Cyber Cafe Explained, Featured Forms, Testimonials, Stats, CTA |
| Browse Forms | `/exams` | Category filter, search, exam cards |
| About | `/about` | Mission, Values, Our Story |
| Contact | `/contact` | Phone, WhatsApp, Email, Contact Form |
| FAQ | `/faq` | 12+ questions with search, expandable accordion |
| Terms | `/terms` | 8 sections — service, payments, refunds, liability |
| Privacy | `/privacy` | 8 sections — data collection, security, sharing, rights |
| Refund | `/refund` | Refund eligibility, process, policy |
| Request Form | `/request-form` | Request forms not in catalog |

---

## 🔄 How It Works

```
USER SIDE (Cyber Cafe Style):
  1. Sign up / Login
  2. Browse and select exam form
  3. See Important Notice popup
  4. Fill basic details (Name, Mobile, Email, DOB, Gender)
  5. Upload required documents (Photo, Signature, ID, Marksheets)
  6. Review & Pay via Razorpay (official fee + service fee)
  7. Application submitted ✅

ADMIN SIDE (Official Form Filling):
  8. Dashboard shows pending application in queue
  9. Click "Process Form" → opens processing page
  10. Review user details + uploaded documents
  11. Click "Open Official Portal" → auto-detected (SSC, IBPS, Railway, etc.)
  12. Click "Copy All Fields" → data copied to clipboard
  13. Paste on official portal → fill form → upload docs → pay
  14. Upload filled form + receipt + acknowledgement via drag & drop
  15. Change status to "Form Filled" or "Completed"
  16. User gets notified + can download documents ✅
```

---

## 🛠️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| **Next.js 16** | React framework (App Router, Server Components) |
| **React 19** | UI library |
| **TypeScript** | Type safety |
| **Tailwind CSS** | Styling with dark mode support |
| **Prisma** | ORM for PostgreSQL |
| **Supabase** | PostgreSQL database hosting (free tier) |
| **NextAuth.js** | Authentication (credentials provider) |
| **Razorpay** | Payment gateway |
| **jsPDF** | Client-side PDF generation |
| **Sharp** | Image processing (logo generation for Telegram bot) |
| **node-telegram-bot-api** | Telegram Bot API integration |
| **Vercel** | Deployment + hosting |
| **cron-job.org** | Keep-alive pings to prevent cold starts |

---

## 📋 All Routes

### Public Routes
| Route | Description |
|-------|-------------|
| `/` | Homepage with cyber cafe explanation |
| `/exams` | Browse all forms |
| `/exams/[id]` | Form detail page |
| `/apply/[examId]` | 3-step application wizard (basic info + docs + pay) |
| `/payment/[applicationId]` | Razorpay payment page |
| `/login` | User login |
| `/signup` | User registration |
| `/forgot-password` | Password reset |
| `/otp/[id]` | OTP verification for admin form editing |
| `/about` | About page |
| `/contact` | Contact page |
| `/faq` | FAQ page |
| `/terms` | Terms & Conditions |
| `/privacy` | Privacy Policy |
| `/refund` | Refund Policy |
| `/request-form` | Request a form |

### User Dashboard Routes
| Route | Description |
|-------|-------------|
| `/dashboard` | Overview, Applications, Payments, Profile, Referrals |
| `/dashboard/applications/[id]` | Application detail + document download + PDF export |
| `/dashboard/profile/edit` | Edit profile |

### Admin Routes
| Route | Description |
|-------|-------------|
| `/admin/login` | Admin login |
| `/admin` | Dashboard with processing queue |
| `/admin/applications` | Applications list (search, filter, CSV export) |
| `/admin/applications/[id]` | Processing page (copy-paste, portal links, multi-file upload) |
| `/admin/exams` | Exam management |
| `/admin/exams/new` | Create new exam (with portal URL auto-detect) |
| `/admin/exams/[id]` | Edit exam |
| `/admin/payments` | Payment history + revenue reports |
| `/admin/coupons` | Coupon management |
| `/admin/analytics` | Revenue analytics |
| `/admin/form-requests` | Manage user form requests |

### API Routes
| Route | Method | Description |
|-------|--------|-------------|
| `/api/auth/[...nextauth]` | * | NextAuth authentication |
| `/api/auth/signup` | POST | User registration |
| `/api/exams` | GET | List all exams |
| `/api/exams/[id]` | GET | Get exam detail |
| `/api/applications` | GET/POST | User applications |
| `/api/applications/[id]` | GET | Application detail |
| `/api/applications/user` | GET | User's applications list |
| `/api/applications/cancel` | POST | Cancel application |
| `/api/applications/draft/[examId]` | GET/POST | Auto-save draft |
| `/api/payment/create-order` | POST | Create Razorpay order |
| `/api/payment/verify` | POST | Verify payment |
| `/api/upload` | POST | File upload (base64 storage) |
| `/api/admin/applications/[id]/receipt` | POST/DELETE | Multi-file document upload/delete |
| `/api/coupons/validate` | POST | Validate coupon |
| `/api/referral` | GET | Referral info |
| `/api/contact` | POST | Contact form |
| `/api/form-requests` | GET/POST | Form requests |
| `/api/notes` | GET/POST | Application notes |
| `/api/health` | GET | DB health check |
| `/api/cron/keep-alive` | GET | Server warmup ping |
| `/api/telegram/webhook` | POST | Telegram bot webhook |
| `/api/telegram/setup` | GET | Register Telegram webhook |
| `/api/telegram/test` | GET | Test Telegram bot |
| `/api/admin/login` | POST | Admin login |
| `/api/admin/dashboard` | GET | Dashboard stats |
| `/api/admin/applications` | GET | All applications |
| `/api/admin/applications/[id]` | GET/PUT | Application detail/update |
| `/api/admin/exams` | GET/POST | Exam CRUD |
| `/api/admin/exams/[id]` | GET/PUT/DELETE | Exam detail |
| `/api/admin/payments` | GET | All payments |
| `/api/admin/coupons` | GET/POST | Coupon CRUD |
| `/api/admin/analytics` | GET | Analytics data |
| `/api/admin/form-requests` | GET | All form requests |
| `/api/admin/form-requests/[id]` | PUT | Update form request |
| `/api/admin/seed` | POST | Seed database |

---

## 🗄️ Database Schema (Prisma)

| Model | Description |
|-------|-------------|
| `User` | User accounts with referral codes and bonus tracking |
| `Exam` | Available forms with category, fees, deadlines, required documents, portal URL |
| `Application` | User applications with form data (JSON), status, assigned staff |
| `Document` | Uploaded documents linked to applications (with custom names) |
| `Payment` | Razorpay payment records with order/payment IDs |
| `Staff` | Staff/agent accounts with commission tracking |
| `Admin` | Admin accounts |
| `Coupon` | Discount coupons (percentage/flat, expiry, usage limits) |
| `StatusHistory` | Audit trail of status changes with timestamps |
| `Note` | Internal notes on applications by admin/staff |
| `Referral` | Referral tracking between users |
| `Commission` | Agent commission tracking with tiers |
| `FormRequest` | User-submitted form requests pending admin approval |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- npm or yarn
- Supabase account (free) for PostgreSQL
- Razorpay account for payments
- Telegram Bot token (from @BotFather)

### Installation

```bash
# Clone the repo
git clone https://github.com/engg-ankit/ClickNsit.git
cd ClickNsit

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your values

# Generate Prisma client + push schema
npx prisma generate
npx prisma db push

# Seed database (creates admin + sample exams)
npx tsx prisma/seed.ts

# Start dev server
npm run dev
```

Open http://localhost:3000

### Environment Variables

```env
DATABASE_URL="postgresql://postgres:password@db.xxx.supabase.co:5432/postgres?sslmode=require"
NEXTAUTH_SECRET="your-random-32-char-secret"
NEXTAUTH_URL="http://localhost:3000"
RAZORPAY_KEY_ID="rzp_test_xxx"
RAZORPAY_KEY_SECRET="your_razorpay_secret"
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_xxx"

# Telegram Bot (optional)
TELEGRAM_BOT_TOKEN="your-bot-token-from-botfather"
TELEGRAM_CHAT_ID="your-chat-id"
TELEGRAM_ADMIN_IDS="your-chat-id"
TELEGRAM_WEBHOOK_URL="https://your-domain.vercel.app/api/telegram/webhook"
```

### Default Credentials

| Account | Email | Password |
|---------|-------|----------|
| Admin | admin@clickandsit.in | admin123 |

---

## 📱 Mobile Responsive

- All pages optimized for mobile (375px+)
- Hamburger menu with dark mode toggle
- Touch-friendly buttons (44x44px minimum)
- No horizontal overflow
- Responsive text sizing
- Scrollable tables and cards

---

## 🔒 Security

- Passwords hashed with bcrypt
- NextAuth.js session management
- Prisma ORM (SQL injection prevention)
- Razorpay secure payment processing
- Environment variable protection (.env not committed)
- httpOnly cookies for admin sessions
- Base64 document storage (Vercel-compatible)
- Database connection pooling (connection_limit=1 per function)

---

## 📦 Deployment (Vercel)

```bash
# Push to GitHub
git push origin master

# Vercel auto-deploys on push
# Set environment variables in Vercel dashboard
```

### Post-Deploy Setup
1. **Register Telegram webhook**: Visit `https://your-domain.vercel.app/api/telegram/setup`
2. **Set up keep-alive**: Create a cron job on cron-job.org → URL: `https://your-domain.vercel.app/api/cron/keep-alive` → Every 5 minutes
3. **Test Telegram bot**: Visit `https://your-domain.vercel.app/api/telegram/test`

**Database**: Supabase PostgreSQL (free tier, 500MB)
**Hosting**: Vercel (free tier, 100GB bandwidth)

---

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx              # Homepage
│   ├── layout.tsx            # Root layout (splash, footer, WhatsApp)
│   ├── exams/                # Browse + detail
│   ├── apply/                # 3-step application wizard
│   ├── payment/              # Razorpay payment page
│   ├── otp/                  # OTP verification for form editing
│   ├── login/                # Auth pages
│   ├── signup/
│   ├── forgot-password/
│   ├── about/
│   ├── contact/
│   ├── faq/
│   ├── terms/
│   ├── privacy/
│   ├── refund/
│   ├── request-form/
│   ├── dashboard/            # User dashboard
│   │   ├── page.tsx          # Overview
│   │   ├── applications/     # Application list + detail
│   │   └── profile/          # Profile edit
│   ├── admin/                # Admin panel
│   │   ├── page.tsx          # Dashboard
│   │   ├── applications/     # Applications list + processing
│   │   ├── exams/            # Exam CRUD
│   │   ├── payments/         # Payment tracking
│   │   ├── coupons/          # Coupon management
│   │   ├── analytics/        # Revenue analytics
│   │   └── form-requests/    # Form request management
│   └── api/
│       ├── auth/             # NextAuth + signup
│       ├── exams/            # Exam APIs
│       ├── applications/     # Application APIs
│       ├── payment/          # Razorpay order + verify
│       ├── upload/           # File upload (base64)
│       ├── admin/            # Admin APIs
│       ├── telegram/         # Telegram bot webhook + setup
│       ├── cron/             # Keep-alive ping
│       └── health/           # DB health check
├── components/
│   ├── ui/                   # Button, Input, Card
│   ├── site-nav.tsx          # Main navigation
│   ├── site-footer.tsx       # Site-wide footer
│   ├── mobile-menu.tsx       # Mobile drawer
│   ├── theme-toggle.tsx      # Dark mode toggle
│   ├── logo.tsx              # ClickNsit logo
│   ├── logo-icon.tsx         # Logo icon only
│   ├── splash-screen.tsx     # First-visit splash animation
│   ├── whatsapp-button.tsx   # Floating WhatsApp button
│   ├── chat-support.tsx      # AI chatbot widget
│   ├── pdf-export.tsx        # PDF generation
│   ├── referral-panel.tsx    # Referral UI
│   ├── homepage-header.tsx   # Homepage navigation
│   └── contact-content.tsx   # Contact page content
├── lib/
│   ├── prisma.ts             # Prisma client (connection pooling)
│   ├── auth-options.ts       # NextAuth config
│   ├── admin-auth.ts         # Admin session
│   ├── razorpay.ts           # Payment helpers
│   ├── types.ts              # TypeScript types
│   ├── portal-links.ts       # 60+ official portal URL mapping
│   ├── telegram-bot.ts       # Telegram bot handler
│   ├── telegram-keyboards.ts # Telegram bot keyboards
│   ├── sms.ts                # SMS/OTP integration
│   └── otp.ts                # OTP generation + verification
prisma/
├── schema.prisma             # Database schema
└── seed.ts                   # Seed script
```

---

## 📞 Support

- **Email**: support@clickandsit.in
- **Phone**: +91 9650752995
- **WhatsApp**: +91 9650752995
- **Telegram Bot**: @clicknsit_bot

---

Built with ❤️ using Next.js + Supabase + Razorpay + Telegram Bot
