const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    // 查詢 API 會使用的條件
    const whereCondition = {
      userId: '105965362903711325694',
      publishedToCommunityAt: {
        not: null,
      },
      deletedAt: null,
      // 注意：這裡沒有 folderId 條件，因為 folderId 為 null
    };

    const count = await prisma.activity.count({
      where: whereCondition,
    });

    console.log(`\n=== API 查詢結果 ===`);
    console.log(`總數: ${count}\n`);

    const activities = await prisma.activity.findMany({
      where: whereCondition,
      select: {
        id: true,
        title: true,
        isPublic: true,
        isPublicShared: true,
        folderId: true,
      },
      orderBy: {
        publishedToCommunityAt: 'desc',
      },
    });

    console.log('活動列表：');
    activities.forEach((a, i) => {
      console.log(`${i+1}. ${a.title}`);
      console.log(`   isPublic: ${a.isPublic}, isPublicShared: ${a.isPublicShared}`);
      console.log(`   folderId: ${a.folderId}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ 錯誤:', error.message);
  } finally {
    await prisma.$disconnect();
  }
})();

