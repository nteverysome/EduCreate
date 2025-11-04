const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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
    
    console.log('=== 所有用戶 ===');
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

