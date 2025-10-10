import { PrismaClient } from '@prisma/client';

// Prevent multiple instances of Prisma Client in development
declare global {
  var __globalPrisma: PrismaClient | undefined;
}

// 簡化的 Prisma 配置，減少構建時錯誤
const prisma = globalThis.__globalPrisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  errorFormat: 'minimal',
});

if (process.env.NODE_ENV !== 'production') {
  globalThis.__globalPrisma = prisma;
}

export default prisma;
export { prisma };
export type { PrismaClient } from '@prisma/client';
