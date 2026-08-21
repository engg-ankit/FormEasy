# FormEasy - Professional Form Filling Service

FormEasy is a comprehensive web application that provides professional form filling services for students across India. The platform handles college registrations, exam applications, scholarships, government forms, and more - eliminating the need to visit cyber cafés.

## 🚀 Features

### For Users
- **Browse & Apply**: Extensive catalog of exam forms, college registrations, and scholarship applications
- **Online Form Submission**: Complete entire form filling process online from anywhere
- **Document Upload**: Secure upload of required documents (ID proof, photos, certificates)
- **Payment Integration**: Seamless payment processing via Razorpay
- **Real-time Tracking**: Track application status with detailed history
- **Referral System**: Earn rewards by referring friends (₹25 bonus per referral)
- **Form Requests**: Request forms not currently listed in the catalog
- **User Dashboard**: Manage profile, applications, and view history

### For Admin
- **Application Management**: View, assign, and manage all applications
- **Exam Management**: Add, edit, and deactivate exam forms
- **Payment Tracking**: Monitor all transactions and process refunds
- **Analytics Dashboard**: Comprehensive insights on applications, revenue, and performance
- **Staff Management**: Manage team members and assign applications
- **Coupon System**: Create and manage discount coupons
- **Form Requests**: Review and approve user-submitted form requests

## 🛠️ Tech Stack

- **Frontend**: Next.js 16.3.2, React 18.3.1, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Authentication**: NextAuth.js
- **Payment**: Razorpay
- **File Storage**: AWS S3
- **Form Handling**: React Hook Form, Zod validation
- **Charts**: Recharts

## 📋 Pages & Routes

### Public Pages
- `/` - Homepage with featured forms and information
- `/exams` - Browse all available forms
- `/exams/[id]` - View specific form details
- `/apply/[examId]` - Application submission form
- `/login` - User login
- `/signup` - User registration
- `/forgot-password` - Password reset request
- `/about` - About FormEasy
- `/contact` - Contact page
- `/faq` - Frequently asked questions
- `/request-form` - Request a new form
- `/privacy` - Privacy policy
- `/terms` - Terms and conditions
- `/refund` - Refund policy

### User Dashboard
- `/dashboard` - User dashboard with applications overview
- `/dashboard/applications/[id]` - View specific application details
- `/dashboard/profile/edit` - Edit user profile

### Admin Panel
- `/admin` - Admin dashboard
- `/admin/login` - Admin login
- `/admin/applications` - Manage all applications
- `/admin/applications/[id]` - View/edit specific application
- `/admin/exams` - Manage exam forms
- `/admin/exams/[id]` - Edit specific exam
- `/admin/exams/new` - Add new exam form
- `/admin/payments` - View all payments
- `/admin/payments/[id]` - View specific payment details
- `/admin/analytics` - Analytics dashboard
- `/admin/coupons` - Manage discount coupons
- `/admin/form-requests` - Manage user form requests

### API Routes
- `/api/auth/[...nextauth]` - NextAuth authentication
- `/api/auth/signup` - User registration
- `/api/auth/forgot-password` - Password reset
- `/api/auth/reset-password` - Password reset confirmation
- `/api/exams` - Get all exams
- `/api/exams/[id]` - Get specific exam
- `/api/applications` - Get user applications
- `/api/applications/[id]` - Get specific application
- `/api/applications/cancel` - Cancel application
- `/api/applications/draft/[examId]` - Save draft application
- `/api/payment/create-order` - Create Razorpay order
- `/api/payment/verify` - Verify payment
- `/api/upload` - File upload to S3
- `/api/coupons/validate` - Validate coupon code
- `/api/referral` - Referral system
- `/api/contact` - Contact form submission
- `/api/form-requests` - Submit form request
- `/api/notes` - Add notes to applications
- `/api/user/profile` - Update user profile

### Admin API Routes
- `/api/admin/login` - Admin authentication
- `/api/admin/logout` - Admin logout
- `/api/admin/dashboard` - Admin dashboard data
- `/api/admin/applications` - Manage applications
- `/api/admin/applications/[id]` - Update application status
- `/api/admin/exams` - Manage exams
- `/api/admin/exams/[id]` - Update exam details
- `/api/admin/payments` - Manage payments
- `/api/admin/payments/[id]` - Process refunds
- `/api/admin/analytics` - Get analytics data
- `/api/admin/coupons` - Manage coupons
- `/api/admin/coupons/[id]` - Update coupon
- `/api/admin/form-requests` - Manage form requests
- `/api/admin/form-requests/[id]` - Update form request status

## 🚀 Getting Started

### Prerequisites
- Node.js 20.x or higher
- PostgreSQL database (Supabase recommended)
- AWS S3 bucket for file storage
- Razorpay account for payments

### Installation

1. Clone the repository:
```bash
git clone https://github.com/engg-ankit/FormEasy.git
cd FormEasy
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Copy `.env.example` to `.env` and fill in the required values:
```env
DATABASE_URL="postgresql://postgres:password@db.xxx.supabase.co:5432/postgres"
NEXTAUTH_SECRET="generate-a-random-32-char-string"
NEXTAUTH_URL="http://localhost:3000"
RAZORPAY_KEY_ID="your_razorpay_key_id"
RAZORPAY_KEY_SECRET="your_razorpay_key_secret"
NEXT_PUBLIC_RAZORPAY_KEY_ID="your_razorpay_key_id"
AWS_ACCESS_KEY_ID="your_aws_access_key"
AWS_SECRET_ACCESS_KEY="your_aws_secret_key"
AWS_REGION="your_aws_region"
AWS_S3_BUCKET="your_s3_bucket_name"
```

4. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🗄️ Database Schema

The application uses Prisma ORM with PostgreSQL. Key models include:

- **User**: User accounts with referral system
- **Exam**: Available forms/exams with categories and fees
- **Application**: User applications with status tracking
- **Document**: Uploaded documents for applications
- **Payment**: Payment records with Razorpay integration
- **Staff**: Admin staff members with commission tracking
- **Admin**: Super admin accounts
- **Coupon**: Discount coupon system
- **Referral**: Referral tracking and bonuses
- **FormRequest**: User-submitted form requests

## 🔒 Security Features

- Password hashing with bcrypt
- Secure session management with NextAuth
- Environment variable protection
- SQL injection prevention via Prisma ORM
- File upload validation
- CSRF protection
- Secure payment processing via Razorpay

## 📱 Deployment

The application is deployed on Vercel:
- **Production URL**: https://formeasy2.vercel.app

### Deployment Steps

1. Push code to GitHub
2. Connect repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy automatically on push to main branch

## 🧪 Testing

Before deploying, ensure all features are tested:
- User registration and login
- Form browsing and application submission
- Payment processing
- Admin panel functionality
- File uploads
- Email notifications (if configured)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is proprietary software. All rights reserved.

## 📞 Support

For support, email support@formeasy.com or call +91 98765 43210

---

Built with [Next.js](https://nextjs.org) and deployed on [Vercel](https://vercel.com)