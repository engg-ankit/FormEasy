# FormEasy — Every Form. One Platform.

Professional form filling service for students across India. Users fill their details online, upload documents, and pay — FormEasy's admin team submits the form on the official portal via a semi-automated copy-paste workflow.

**Live**: https://formeasy2.vercel.app

---

## 🚀 Features

### 👤 User Side

| Feature | Description |
|---------|-------------|
| **Browse Forms** | Catalog of exam forms, college registrations, scholarships — filterable by category with search |
| **5-Step Application Wizard** | Personal details → Education → Address → Documents → Review & Pay, with auto-save every 30 seconds |
| **Document Upload** | Upload photo, signature, ID proof with live preview before submission |
| **Razorpay Payment** | Official fee + service fee breakdown, coupon support, secure checkout |
| **User Dashboard** | Overview, My Applications, Payment History, Referrals, Profile tabs |
| **Application Detail** | Full status timeline, uploaded documents, payment info, PDF export |
| **Referral System** | Unique referral code, ₹25 bonus per successful referral |
| **Deadline Reminders** | Upcoming deadline alerts on dashboard with urgent highlighting |
| **Form Requests** | Request forms not in the catalog — admin reviews and adds them |
| **Profile Edit** | Update name, email, mobile number |
| **Dark Mode** | Toggle dark/light theme — works on desktop and mobile |
| **Forgot Password** | Password reset via email |

### 🛠️ Admin Side

| Feature | Description |
|---------|-------------|
| **Dashboard** | Stats cards + "Forms To Process" queue with pending count badge |
| **Application Processing** | Portal links (SSC, IBPS, Railway), "Copy All Fields" button, individual field copy, processing checklist |
| **Status Workflow** | Submitted → In Process → Form Filled → Completed with notifications |
| **Search + Pagination** | Search by name/email, filter by status, paginated results |
| **CSV Export** | Download filtered applications as Excel-compatible CSV |
| **Internal Notes** | Add comments/notes to applications for team coordination |
| **Exam CRUD** | Create, edit, delete exam forms with category, fees, documents, deadlines |
| **Payment Tracking** | View all payments with status filters, CSV export |
| **Coupon Management** | Create percentage/flat discount coupons with expiry and usage limits |
| **Analytics** | Revenue charts, application trends, payment success rates |
| **Form Requests** | Approve/decline user requests with fee estimate and admin notes |

### 🌐 Public Pages

| Page | URL | Content |
|------|-----|---------|
| Homepage | `/` | Hero, How It Works, Featured Forms, Testimonials, Stats, CTA |
| Browse Forms | `/exams` | Category filter, search, exam cards |
| About | `/about` | Mission, Values, Our Story |
| Contact | `/contact` | Phone, WhatsApp, Email, Contact Form |
| FAQ | `/faq` | 12+ questions with search, expandable accordion |
| Terms | `/terms` | 8 sections — service, payments, refunds, liability |
| Privacy | `/privacy` | 8 sections — data collection, security, sharing, rights |
| Request Form | `/request-form` | Request forms not in catalog |

---

## 🔄 How It Works (Semi-Automated Workflow)

```
USER SIDE:
  1. Sign up / Login
  2. Browse and select exam form
  3. Fill 5-step application wizard
  4. Upload documents (photo, signature, ID)
  5. Pay via Razorpay (official fee + service fee)
  6. Application submitted ✅

ADMIN SIDE:
  7. Dashboard shows pending application in queue
  8. Click "Process Form" → opens processing page
  9. Click "Open Official Portal" → opens ssc.nic.in / ibps.in
  10. Click "Copy All Fields" → data copied to clipboard
  11. Paste on official portal → fill form → upload docs → pay
  12. Change status to "Form Filled" or "Completed"
  13. User gets notified ✅
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
| **Vercel** | Deployment + hosting |

---

## 📋 All Routes

### Public Routes
| Route | Description |
|-------|-------------|
| `/` | Homepage |
| `/exams` | Browse all forms |
| `/exams/[id]` | Form detail page |
| `/apply/[examId]` | 5-step application wizard |
| `/payment/[applicationId]` | Razorpay payment page |
| `/login` | User login |
| `/signup` | User registration |
| `/forgot-password` | Password reset |
| `/about` | About page |
| `/contact` | Contact page |
| `/faq` | FAQ page |
| `/terms` | Terms & Conditions |
| `/privacy` | Privacy Policy |
| `/request-form` | Request a form |

### User Dashboard Routes
| Route | Description |
|-------|-------------|
| `/dashboard` | Overview, Applications, Payments, Profile, Referrals |
| `/dashboard/applications/[id]` | Application detail + PDF export |
| `/dashboard/profile/edit` | Edit profile |

### Admin Routes
| Route | Description |
|-------|-------------|
| `/admin/login` | Admin login |
| `/admin` | Dashboard with processing queue |
| `/admin/applications` | Applications list (search, filter, CSV export) |
| `/admin/applications/[id]` | Processing page (copy-paste, portal links) |
| `/admin/exams` | Exam management |
| `/admin/exams/new` | Create new exam |
| `/admin/exams/[id]` | Edit exam |
| `/admin/payments` | Payment history |
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
| `/api/applications/cancel` | POST | Cancel application |
| `/api/applications/draft/[examId]` | GET/POST | Auto-save draft |
| `/api/payment/create-order` | POST | Create Razorpay order |
| `/api/payment/verify` | POST | Verify payment |
| `/api/upload` | POST | File upload |
| `/api/coupons/validate` | POST | Validate coupon |
| `/api/referral` | GET | Referral info |
| `/api/contact` | POST | Contact form |
| `/api/form-requests` | GET/POST | Form requests |
| `/api/notes` | GET/POST | Application notes |
| `/api/health` | GET | DB health check |
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
| `Exam` | Available forms with category, fees, deadlines, required documents |
| `Application` | User applications with form data (JSON), status, assigned staff |
| `Document` | Uploaded documents linked to applications |
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

### Installation

```bash
# Clone the repo
git clone https://github.com/engg-ankit/FormEasy.git
cd FormEasy

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
```

### Default Credentials

| Account | Email | Password |
|---------|-------|----------|
| Admin | admin@formeasy.com | admin123 |

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

---

## 📦 Deployment (Vercel)

```bash
# Switch to PostgreSQL schema
# (Update prisma/schema.prisma provider to "postgresql")

# Push to GitHub
git push origin main

# Vercel auto-deploys on push
# Set environment variables in Vercel dashboard
```

**Database**: Supabase PostgreSQL (free tier, 500MB)
**Hosting**: Vercel (free tier, 100GB bandwidth)

---

## 📁 Project Structure

```
src/
├── app/
│   ├── (public)/          # Public pages
│   │   ├── page.tsx       # Homepage
│   │   ├── exams/         # Browse + detail
│   │   ├── apply/         # Application wizard
│   │   ├── payment/       # Payment page
│   │   ├── login/         # Auth pages
│   │   ├── signup/
│   │   ├── about/
│   │   ├── contact/
│   │   ├── faq/
│   │   ├── terms/
│   │   ├── privacy/
│   │   └── request-form/
│   ├── dashboard/         # User dashboard
│   ├── admin/             # Admin panel
│   ├── api/               # API routes
│   └── layout.tsx         # Root layout
├── components/
│   ├── ui/                # Button, Input, Card
│   ├── site-nav.tsx       # Main navigation
│   ├── mobile-menu.tsx    # Mobile drawer
│   ├── theme-toggle.tsx   # Dark mode toggle
│   ├── logo.tsx           # FormEasy logo
│   ├── pdf-export.tsx     # PDF generation
│   └── referral-panel.tsx # Referral UI
├── lib/
│   ├── prisma.ts          # Prisma client
│   ├── auth-options.ts    # NextAuth config
│   ├── admin-auth.ts      # Admin session
│   ├── i18n.tsx           # Translations
│   ├── razorpay.ts        # Payment helpers
│   ├── types.ts           # TypeScript types
│   └── notifications.ts   # Notification stubs
prisma/
├── schema.prisma          # Database schema
└── seed.ts                # Seed script
```

---

## 📞 Support

- **Email**: support@formeasy.com
- **Phone**: +91 9650X XXX95

---

Built with ❤️ using Next.js + Supabase + Razorpay
