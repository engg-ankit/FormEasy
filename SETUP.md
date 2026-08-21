# FormEasy - Setup Instructions

Complete setup guide for the FormEasy exam form filling platform.

## Prerequisites

- Node.js 20.x or higher
- npm or yarn package manager
- Git (optional, for version control)

## Installation Steps

1. **Clone or download the project**
   ```bash
   cd formlatest
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your configuration:
   - `DATABASE_URL`: Use SQLite for development (`file:./dev.db`) or PostgreSQL for production
   - `NEXTAUTH_SECRET`: Generate a secure secret using `openssl rand -base64 32`
   - `NEXTAUTH_URL`: Set to `http://localhost:3000` for development
   - `RAZORPAY_KEY_ID`: Get from Razorpay dashboard (test mode)
   - `RAZORPAY_KEY_SECRET`: Get from Razorpay dashboard (test mode)
   - `NEXT_PUBLIC_RAZORPAY_KEY_ID`: Same as RAZORPAY_KEY_ID

4. **Set up the database**
   ```bash
   # Run Prisma migrations
   npx prisma migrate dev --name init
   
   # Seed the database with sample data
   npm run seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:3000`

## Database Setup

### SQLite (Development - Default)
The project comes pre-configured with SQLite for development. No additional setup needed.

### PostgreSQL (Production)
For production deployment, switch to PostgreSQL:

1. **Option 1: Neon (Recommended)**
   - Go to https://neon.tech and sign up
   - Create a new project
   - Copy the connection string
   - Update `DATABASE_URL` in `.env`

2. **Option 2: Supabase**
   - Go to https://supabase.com and sign up
   - Create a new project
   - Copy the connection string
   - Update `DATABASE_URL` in `.env`

3. **Option 3: Local PostgreSQL**
   - Install PostgreSQL from https://www.postgresql.org/download/windows/
   - Create a database: `CREATE DATABASE formlatest;`
   - Update `DATABASE_URL` in `.env`:
     ```
     DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/formlatest?schema=public"
     ```

After switching to PostgreSQL, update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Then run migrations:
```bash
npx prisma migrate dev --name init
npm run seed
```

## Razorpay Setup

1. Go to https://razorpay.com and sign up
2. Navigate to Settings → API Keys
3. Generate test mode API keys
4. Add the keys to your `.env` file:
   ```
   RAZORPAY_KEY_ID="rzp_test_..."
   RAZORPAY_KEY_SECRET="..."
   NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_..."
   ```

## Default Credentials

After running the seed script, you can use these credentials:

### Admin Account
- Email: `admin@formeasy.com`
- Password: `admin123`

### Test User
- Sign up through the `/signup` page

### Test Cards (Razorpay Test Mode)
- Card Number: `4111 1111 1111 1111`
- Expiry: Any future date
- CVV: Any 3 digits
- Name: Any name

## Testing the Complete Flow

1. **Browse Exams**
   - Visit `http://localhost:3000`
   - Click on "Browse Exams"
   - View available exams with real data from the database

2. **User Registration**
   - Go to `/signup`
   - Create a new account
   - Verify you can log in at `/login`

3. **Submit Application**
   - Browse exams and click on an exam
   - Click "Apply Now"
   - Complete the 5-step wizard:
     - Personal Details
     - Education
     - Address
     - Document Upload (test with images or PDFs)
     - Review & Pay
   - Use coupon code `FIRST10` for 10% discount or `FLAT50` for ₹50 off

4. **Payment**
   - Complete Razorpay test payment
   - Use test card `4111 1111 1111 1111`
   - Verify redirect to dashboard after success

5. **User Dashboard**
   - Visit `/dashboard`
   - View application status timeline
   - Track progress through stages

6. **Admin Panel**
   - Go to `/admin/login`
   - Login with admin credentials
   - View dashboard with real statistics
   - Manage applications at `/admin/applications`
   - Manage exams at `/admin/exams`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run seed` - Seed database with sample data

## Project Structure

```
formeasy/
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── seed.ts                # Database seeding
│   └── migrations/            # Database migrations
├── src/
│   ├── app/                   # Next.js App Router pages
│   │   ├── admin/            # Admin panel
│   │   ├── api/              # API routes
│   │   ├── apply/            # Application wizard
│   │   ├── dashboard/        # User dashboard
│   │   ├── exams/            # Exam listing
│   │   ├── login/            # User login
│   │   ├── signup/           # User signup
│   │   └── payment/          # Payment processing
│   ├── components/
│   │   ├── ui/               # Reusable UI components
│   │   └── providers.tsx     # Session and theme providers
│   └── lib/
│       ├── admin-auth.ts      # Admin authentication
│       ├── notifications.ts   # SMS/WhatsApp placeholders
│       ├── prisma.ts         # Prisma client
│       ├── razorpay.ts       # Razorpay client utilities
│       ├── razorpay-server.ts # Server-side Razorpay
│       ├── types.ts           # TypeScript types
│       └── utils.ts          # Utility functions
├── public/
│   └── uploads/              # File upload directory
├── .env.example              # Environment variables template
├── .nvmrc                    # Node version specification
├── package.json              # Dependencies and scripts
└── SETUP.md                  # This file
```

## Troubleshooting

### Build Errors
- Ensure all dependencies are installed: `npm install`
- Check that Node.js version is 20.x: `node --version`
- Verify environment variables are set in `.env`

### Database Issues
- If using SQLite, ensure `dev.db` file exists
- If using PostgreSQL, verify connection string is correct
- Run migrations: `npx prisma migrate dev --name init`

### Payment Issues
- Verify Razorpay keys are correct
- Ensure you're using test mode keys for development
- Check that `NEXT_PUBLIC_RAZORPAY_KEY_ID` is set

### File Upload Issues
- Ensure `public/uploads` directory exists
- Check file size limits (max 2MB)
- Verify file types (JPEG, PNG, PDF only)

## Deployment

### Railway (Recommended)
1. Connect your GitHub repository
2. Set environment variables in Railway dashboard
3. Add PostgreSQL addon
4. Deploy - Railway will automatically build and run

### Vercel
1. Connect your GitHub repository
2. Set environment variables in Vercel dashboard
3. Add PostgreSQL database (Neon or Supabase)
4. Deploy - Vercel will automatically build and run

### Manual Deployment
1. Build the project: `npm run build`
2. Set up production database
3. Set environment variables
4. Run: `npm start`

## Support

For issues or questions:
- Email: support@formeasy.com
- Phone: +91 98765 43210
- Documentation: Check inline code comments

## License

This project is proprietary software. All rights reserved.