import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

function buildDbUrl(): string {
  const base = process.env.DATABASE_URL || '';
  if (!base) return base;

  const hasParams = base.includes('?');
  const sep = hasParams ? '&' : '?';
  // One connection per serverless invocation. The connect timeout is generous
  // because a cold Supabase pooler can take a few seconds to answer, and the
  // old 5s limit surfaced as a misleading "can't reach database server".
  const params = ['connection_limit=1', 'pool_timeout=10', 'connect_timeout=15'];

  // Transaction-mode pooling (port 6543) needs pgbouncer=true for prepared statements.
  if (base.includes(':6543') && !base.includes('pgbouncer=')) params.push('pgbouncer=true');

  return `${base}${sep}${params.join('&')}`;
}

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: buildDbUrl(),
      },
    },
  });
}

// In serverless (Vercel), each invocation gets its own scope.
// Use global to reuse the client within the same invocation.
export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Graceful shutdown - disconnect when the process ends (not on every serverless
// invocation, where beforeExit fires between requests and would drop the pool).
if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect();
  });
}
