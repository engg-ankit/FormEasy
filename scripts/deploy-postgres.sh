#!/bin/bash
# Run this before deploying to Vercel
# This switches the Prisma schema from SQLite to PostgreSQL

echo "🔄 Switching to PostgreSQL for deployment..."

# Backup current schema
cp prisma/schema.prisma prisma/schema.sqlite.bak

# Replace provider
sed -i 's/provider = "sqlite"/provider = "postgresql"/' prisma/schema.prisma

echo "✅ Schema switched to PostgreSQL"
echo "📋 Now run: npx prisma db push && git add . && git commit -m 'deploy: switch to postgres' && git push"
echo ""
echo "⚠️  After deploy, run: cp prisma/schema.sqlite.bak prisma/schema.prisma to restore local dev"
