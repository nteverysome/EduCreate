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
    // 查詢所有用戶
    const users = await prisma.user.findMany({
      include: {
        accounts: true,
        activities: {
          where: { deletedAt: null },
          select: { id: true }
        }
      }
    });
    
    console.log('=== 生產環境所有用戶 ===');
    users.forEach(user => {
      console.log(`用戶 ID: ${user.id}`);
      console.log(`  名稱: ${user.name}`);
      console.log(`  郵箱: ${user.email}`);
      console.log(`  活動數: ${user.activities.length}`);
      console.log(`  OAuth 帳號:`);
      user.accounts.forEach(acc => {
        console.log(`    - ${acc.provider}: ${acc.providerAccountId}`);
      });
      console.log('');
    });
  } catch (error) {
    console.error('錯誤:', error.message);
  } finally {
    await prisma.$disconnect();
  }
})();

