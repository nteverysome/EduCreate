// 臨時數據庫模擬 - 用於無 Prisma 測試
export const mockDb = {
  user: {
    findUnique: async () => null,
    create: async () => ({ id: 'mock-id', email: 'test@example.com' }),
    update: async () => ({ id: 'mock-id', email: 'test@example.com' }),
  },
  session: {
    findUnique: async () => null,
    create: async () => ({ id: 'mock-session', userId: 'mock-id' }),
    delete: async () => ({ id: 'mock-session' }),
  },
  account: {
    findUnique: async () => null,
    create: async () => ({ id: 'mock-account', userId: 'mock-id' }),
  },
  verificationToken: {
    findUnique: async () => null,
    create: async () => ({ identifier: 'test', token: 'mock-token' }),
    delete: async () => ({ identifier: 'test', token: 'mock-token' }),
  }
};

export default mockDb;
