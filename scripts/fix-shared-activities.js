const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    // 找出所有發布到社區但未公開的活動
    const activitiesToFix = await prisma.activity.findMany({
      where: {
        userId: '105965362903711325694',
        isPublicShared: true,
        isPublic: false
      },
      select: {
        id: true,
        title: true
      }
    });

    console.log(`\n找到 ${activitiesToFix.length} 個需要修復的活動\n`);

    if (activitiesToFix.length === 0) {
      console.log('✅ 沒有需要修復的活動');
      return;
    }

    // 修復這些活動
    const result = await prisma.activity.updateMany({
      where: {
        userId: '105965362903711325694',
        isPublicShared: true,
        isPublic: false
      },
      data: {
        isPublic: true
      }
    });

    console.log(`✅ 成功修復 ${result.count} 個活動\n`);

    // 顯示修復後的活動列表
    console.log('修復的活動：');
    activitiesToFix.forEach((activity, index) => {
      console.log(`${index + 1}. ${activity.title}`);
    });

    // 驗證修復結果
    console.log('\n=== 驗證修復結果 ===');
    const publicCount = await prisma.activity.count({
      where: {
        userId: '105965362903711325694',
        isPublic: true
      }
    });

    const sharedCount = await prisma.activity.count({
      where: {
        userId: '105965362903711325694',
        isPublicShared: true
      }
    });

    const publicAndShared = await prisma.activity.count({
      where: {
        userId: '105965362903711325694',
        isPublic: true,
        isPublicShared: true
      }
    });

    console.log(`公開 (isPublic=true): ${publicCount}`);
    console.log(`已發布到社區 (isPublicShared=true): ${sharedCount}`);
    console.log(`既公開又發布到社區: ${publicAndShared}`);

  } catch (error) {
    console.error('❌ 錯誤:', error.message);
  } finally {
    await prisma.$disconnect();
  }
})();

