import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

function createPrismaClient() {
  // connection_limit=1: each Vercel serverless instance uses 1 connection max
  // pool_timeout=5: fail fast if no connection available
  const dbUrl = process.env.DATABASE_URL + '?connection_limit=1&pool_timeout=5&connect_timeout=5';
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: dbUrl,
      },
    },
  });
}

// In serverless (Vercel), each invocation gets its own scope.
// Use global to reuse the client within the same invocation.
export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Graceful shutdown - disconnect when process ends
if (typeof process !== 'undefined') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect();
  });
}
