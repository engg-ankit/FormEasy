# Database Setup for FormEasy

Since Docker is not available on your system, you have several options for setting up PostgreSQL:

## Option 1: Use Neon (Recommended for Development)
1. Go to https://neon.tech and sign up for a free account
2. Create a new project
3. Copy the connection string from Neon
4. Update the `DATABASE_URL` in your `.env` file with the Neon connection string

## Option 2: Use Supabase
1. Go to https://supabase.com and sign up for a free account
2. Create a new project
3. Copy the connection string from Supabase
4. Update the `DATABASE_URL` in your `.env` file with the Supabase connection string

## Option 3: Install PostgreSQL Locally
1. Download PostgreSQL from https://www.postgresql.org/download/windows/
2. Install PostgreSQL with default settings
3. During installation, set a password for the postgres user
4. After installation, create a database:
   ```sql
   CREATE DATABASE formlatest;
   ```
5. Update the `DATABASE_URL` in your `.env` file:
   ```
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/formlatest?schema=public"
   ```

## After Setting Up Database
Once you have your PostgreSQL connection string in the `.env` file, run:
```bash
npx prisma migrate dev --name init
```

This will create the database schema and generate the Prisma client.