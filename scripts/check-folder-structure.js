const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    console.log('🔍 檢查用戶 105965362903711325694 的資料夾結構...\n');
    
    const folders = await prisma.folder.findMany({
      where: { userId: '105965362903711325694' },
      include: { _count: { select: { activities: true } } },
      orderBy: { createdAt: 'asc' }
    });
    
    console.log('📊 資料夾總數:', folders.length);
    console.log('\n📋 資料夾列表：');
    
    folders.forEach(folder => {
      console.log(`
ID: ${folder.id}
名稱: ${folder.name}
父資料夾 ID: ${folder.parentId || '(根資料夾)'}
活動數: ${folder._count.activities}`);
    });
    
    // 檢查父子關係
    console.log('\n\n🔗 父子關係分析：');
    const rootFolders = folders.filter(f => !f.parentId);
    console.log('根資料夾數:', rootFolders.length);
    
    const orphanFolders = folders.filter(f => f.parentId && !folders.find(pf => pf.id === f.parentId));
    if (orphanFolders.length > 0) {
      console.log('\n⚠️  孤立資料夾（父資料夾不存在）:', orphanFolders.length);
      orphanFolders.forEach(f => {
        console.log(`- ${f.name} (ID: ${f.id}, 父ID: ${f.parentId})`);
      });
    } else {
      console.log('✅ 沒有孤立資料夾');
    }
    
  } catch (error) {
    console.error('❌ 錯誤:', error.message);
  } finally {
    await prisma.$disconnect();
  }
})();

