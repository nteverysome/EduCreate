const { PrismaClient } = require('@prisma/client');

// 連接到 Production Branch
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://neondb_owner:npg_JiVYrWK7L6Ff@ep-curly-salad-a85exs3f-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require'
    }
  }
});

(async () => {
  try {
    console.log('🔍 檢查 Production Branch 中的用戶...\n');
    
    const user = await prisma.user.findUnique({
      where: { id: 'cmh93tjuh0001l404hszkdf94' },
      include: { accounts: true, _count: { select: { activities: true } } }
    });
    
    if (user) {
      console.log('✅ 找到用戶：');
      console.log('ID:', user.id);
      console.log('名稱:', user.name);
      console.log('郵箱:', user.email);
      console.log('活動數:', user._count.activities);
      console.log('OAuth 帳號:', user.accounts.map(a => a.provider + ':' + a.providerAccountId).join(', ') || '無');
    } else {
      console.log('❌ 未找到用戶 cmh93tjuh0001l404hszkdf94');
      
      // 列出 Production Branch 中的所有用戶
      console.log('\n📋 Production Branch 中的所有用戶：');
      const allUsers = await prisma.user.findMany({
        include: { _count: { select: { activities: true } } }
      });
      
      allUsers.forEach(u => {
        console.log('- ' + u.id + ' (' + u.name + '): ' + u._count.activities + ' 個活動');
      });
    }
  } catch (error) {
    console.error('❌ 錯誤:', error.message);
  } finally {
    await prisma.$disconnect();
  }
})();

