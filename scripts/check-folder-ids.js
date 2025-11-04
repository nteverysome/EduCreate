const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    const activities = await prisma.activity.findMany({
      where: {
        userId: '105965362903711325694',
        isPublicShared: true
      },
      select: {
        id: true,
        title: true,
        folderId: true,
        isPublic: true
      }
    });

    console.log('\n=== 已發布到社區的活動及其 folderId ===\n');
    activities.forEach((a, i) => {
      console.log(`${i+1}. ${a.title}`);
      console.log(`   folderId: ${a.folderId}`);
      console.log(`   isPublic: ${a.isPublic}`);
      console.log('');
    });

    // 統計 folderId 分佈
    const folderIdCounts = {};
    activities.forEach(a => {
      const folderId = a.folderId || 'null';
      folderIdCounts[folderId] = (folderIdCounts[folderId] || 0) + 1;
    });

    console.log('\n=== folderId 分佈 ===');
    Object.entries(folderIdCounts).forEach(([folderId, count]) => {
      console.log(`${folderId}: ${count} 個活動`);
    });

  } catch (error) {
    console.error('❌ 錯誤:', error.message);
  } finally {
    await prisma.$disconnect();
  }
})();

