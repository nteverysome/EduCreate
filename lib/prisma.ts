import { PrismaClient } from '@prisma/client';

// Prevent multiple instances of Prisma Client in development
declare global {
  var __globalPrisma: PrismaClient | undefined;
}

const prisma = globalThis.__globalPrisma ?? new PrismaClient({
  log: ['query', 'error', 'warn'],
  // Add missing configuration options for Prisma v6 compatibility
  engineType: 'library',
  errorFormat: 'pretty',
});

if (process.env.NODE_ENV !== 'production') {
  globalThis.__globalPrisma = prisma;
}

export default prisma;
export type { PrismaClient } from '@prisma/client';