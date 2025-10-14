const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function deleteDemoUser() {
  try {
    console.log('🗑️ 開始刪除演示用戶...');

    // 查找演示用戶
    const demoUser = await prisma.user.findUnique({
      where: { email: 'demo@example.com' },
      include: {
        activities: true,
        _count: {
          select: {
            activities: true,
            vocabularySets: true
          }
        }
      }
    });

    if (!demoUser) {
      console.log('✅ 演示用戶不存在，無需刪除');
      return;
    }

    console.log('📊 演示用戶信息：');
    console.log(`   ID: ${demoUser.id}`);
    console.log(`   Email: ${demoUser.email}`);
    console.log(`   Name: ${demoUser.name}`);
    console.log(`   活動數量: ${demoUser._count.activities}`);
    console.log(`   詞彙集數量: ${demoUser._count.vocabularySets}`);

    // 開始刪除過程
    console.log('\n🔄 開始刪除相關數據...');

    // 1. 刪除用戶的活動相關數據
    if (demoUser._count.activities > 0) {
      console.log('🗑️ 刪除活動相關數據...');
      
      // 刪除詞彙項目
      await prisma.vocabularyItem.deleteMany({
        where: {
          activity: {
            userId: demoUser.id
          }
        }
      });
      console.log('   ✅ 詞彙項目已刪除');

      // 刪除活動版本
      await prisma.activityVersion.deleteMany({
        where: { userId: demoUser.id }
      });
      console.log('   ✅ 活動版本已刪除');

      // 刪除活動版本日誌
      await prisma.activityVersionLog.deleteMany({
        where: { userId: demoUser.id }
      });
      console.log('   ✅ 活動版本日誌已刪除');

      // 刪除活動
      await prisma.activity.deleteMany({
        where: { userId: demoUser.id }
      });
      console.log('   ✅ 活動已刪除');
    }

    // 2. 刪除其他相關數據
    await prisma.folder.deleteMany({
      where: { userId: demoUser.id }
    });
    console.log('   ✅ 文件夾已刪除');

    await prisma.h5PContent.deleteMany({
      where: { userId: demoUser.id }
    });
    console.log('   ✅ H5P 內容已刪除');

    await prisma.invoice.deleteMany({
      where: { userId: demoUser.id }
    });
    console.log('   ✅ 發票記錄已刪除');

    // 3. 刪除通知設定
    await prisma.notificationSettings.deleteMany({
      where: { userId: demoUser.id }
    });
    console.log('   ✅ 通知設定已刪除');

    // 4. 刪除密碼重置記錄
    await prisma.passwordReset.deleteMany({
      where: { userId: demoUser.id }
    });
    console.log('   ✅ 密碼重置記錄已刪除');

    // 5. 最後刪除用戶本身
    await prisma.user.delete({
      where: { id: demoUser.id }
    });
    console.log('   ✅ 演示用戶已刪除');

    console.log('\n🎉 演示用戶刪除完成！');
    console.log('📊 刪除統計：');
    console.log(`   - 用戶: 1`);
    console.log(`   - 活動: ${demoUser._count.activities}`);
    console.log(`   - 詞彙集: ${demoUser._count.vocabularySets}`);

    // 驗證刪除結果
    const remainingUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    });

    console.log('\n✅ 剩餘用戶：');
    remainingUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} (${user.name}) - ${user.id}`);
    });

  } catch (error) {
    console.error('❌ 刪除演示用戶失敗:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 執行刪除
if (require.main === module) {
  deleteDemoUser()
    .then(() => {
      console.log('\n🎯 演示用戶刪除任務完成！');
      process.exit(0);
    })
    .catch((error) => {
      console.error('刪除過程中發生錯誤:', error);
      process.exit(1);
    });
}

module.exports = deleteDemoUser;
