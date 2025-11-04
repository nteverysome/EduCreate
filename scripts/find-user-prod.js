const { PrismaClient } = require('@prisma/client');

// 使用生產環境數據庫連接
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://neondb_owner:npg_JiVYrWK7L6Ff@ep-hidden-field-a8tai7gk-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require'
    }
  }
});

(async () => {
  try {
    const userId = 'cmgt4vj1y0000jr0434tf8ipd';
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        accounts: true,
        activities: {
          where: { deletedAt: null },
          select: { id: true }
        }
      }
    });
    
    if (user) {
      console.log(`找到用戶: ${userId}`);
      console.log(`  名稱: ${user.name}`);
      console.log(`  郵箱: ${user.email}`);
      console.log(`  活動數: ${user.activities.length}`);
      console.log(`  OAuth 帳號:`);
      user.accounts.forEach(acc => {
        console.log(`    - ${acc.provider}: ${acc.providerAccountId}`);
      });
    } else {
      console.log(`用戶 ${userId} 不存在於生產環境數據庫`);
    }
  } catch (error) {
    console.error('錯誤:', error.message);
  } finally {
    await prisma.$disconnect();
  }
})();

