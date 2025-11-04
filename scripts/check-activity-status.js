const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    const activities = await prisma.activity.findMany({
      where: {
        userId: '105965362903711325694'
      },
      select: {
        id: true,
        title: true,
        isPublic: true,
        isPublicShared: true,
        publishedToCommunityAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log('\n=== 用戶的所有活動 ===');
    console.log(`總數: ${activities.length}\n`);
    
    activities.forEach((activity, index) => {
      console.log(`${index + 1}. ${activity.title}`);
      console.log(`   ID: ${activity.id}`);
      console.log(`   isPublic: ${activity.isPublic}`);
      console.log(`   isPublicShared: ${activity.isPublicShared}`);
      console.log(`   publishedToCommunityAt: ${activity.publishedToCommunityAt}`);
      console.log('');
    });

    // 統計
    const publicCount = activities.filter(a => a.isPublic).length;
    const sharedCount = activities.filter(a => a.isPublicShared).length;
    const publicAndShared = activities.filter(a => a.isPublic && a.isPublicShared).length;
    const sharedButNotPublic = activities.filter(a => a.isPublicShared && !a.isPublic).length;

    console.log('\n=== 統計 ===');
    console.log(`公開 (isPublic=true): ${publicCount}`);
    console.log(`已發布到社區 (isPublicShared=true): ${sharedCount}`);
    console.log(`既公開又發布到社區: ${publicAndShared}`);
    console.log(`發布到社區但未公開: ${sharedButNotPublic}`);

  } catch (error) {
    console.error('❌ 錯誤:', error.message);
  } finally {
    await prisma.$disconnect();
  }
})();

