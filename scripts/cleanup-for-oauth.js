const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanupForOAuth() {
  try {
    console.log('🧹 開始清理用戶數據以解決 OAuth 問題...');

    // 查找需要清理的用戶
    const user = await prisma.user.findUnique({
      where: { email: 'nteverysome@gmail.com' },
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

    if (!user) {
      console.log('✅ 用戶不存在，無需清理');
      return;
    }

    console.log('📊 用戶信息：');
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   活動數量: ${user._count.activities}`);
    console.log(`   詞彙集數量: ${user._count.vocabularySets}`);

    // 檢查是否有 OAuth 記錄
    const accounts = await prisma.account.findMany({
      where: { userId: user.id }
    });

    console.log(`   OAuth 記錄數量: ${accounts.length}`);

    if (accounts.length > 0) {
      console.log('⚠️  用戶已有 OAuth 記錄，問題可能在其他地方');
      accounts.forEach((account, index) => {
        console.log(`   ${index + 1}. 提供者: ${account.provider}`);
      });
      return;
    }

    console.log('\n🔄 開始清理過程...');

    // 1. 刪除用戶的活動相關數據
    if (user._count.activities > 0) {
      console.log('🗑️ 刪除活動相關數據...');
      
      // 刪除詞彙項目
      await prisma.vocabularyItem.deleteMany({
        where: {
          activity: {
            userId: user.id
          }
        }
      });
      console.log('   ✅ 詞彙項目已刪除');

      // 刪除活動版本
      await prisma.activityVersion.deleteMany({
        where: { userId: user.id }
      });
      console.log('   ✅ 活動版本已刪除');

      // 刪除活動版本日誌
      await prisma.activityVersionLog.deleteMany({
        where: { userId: user.id }
      });
      console.log('   ✅ 活動版本日誌已刪除');

      // 刪除活動
      await prisma.activity.deleteMany({
        where: { userId: user.id }
      });
      console.log('   ✅ 活動已刪除');
    }

    // 2. 刪除其他相關數據
    await prisma.folder.deleteMany({
      where: { userId: user.id }
    });
    console.log('   ✅ 文件夾已刪除');

    await prisma.h5PContent.deleteMany({
      where: { userId: user.id }
    });
    console.log('   ✅ H5P 內容已刪除');

    await prisma.invoice.deleteMany({
      where: { userId: user.id }
    });
    console.log('   ✅ 發票記錄已刪除');

    await prisma.notificationSettings.deleteMany({
      where: { userId: user.id }
    });
    console.log('   ✅ 通知設定已刪除');

    await prisma.passwordReset.deleteMany({
      where: { userId: user.id }
    });
    console.log('   ✅ 密碼重置記錄已刪除');

    // 3. 刪除用戶本身
    await prisma.user.delete({
      where: { id: user.id }
    });
    console.log('   ✅ 用戶已刪除');

    console.log('\n🎉 清理完成！');
    console.log('📊 清理統計：');
    console.log(`   - 用戶: 1`);
    console.log(`   - 活動: ${user._count.activities}`);
    console.log(`   - 詞彙集: ${user._count.vocabularySets}`);

    // 驗證清理結果
    const remainingUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    });

    console.log('\n✅ 清理後的數據庫狀態：');
    if (remainingUsers.length === 0) {
      console.log('   📝 數據庫現在為空，可以進行全新的 Google OAuth 登入');
    } else {
      console.log('   👥 剩餘用戶：');
      remainingUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.email} (${user.name}) - ${user.id}`);
      });
    }

    console.log('\n🎯 下一步操作：');
    console.log('   1. 清除瀏覽器的 NextAuth session cookies');
    console.log('   2. 訪問登入頁面');
    console.log('   3. 點擊 "使用 Google 登入"');
    console.log('   4. NextAuth 會創建完整的用戶和 OAuth 記錄');

  } catch (error) {
    console.error('❌ 清理過程中發生錯誤:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 執行清理
if (require.main === module) {
  cleanupForOAuth()
    .then(() => {
      console.log('\n🎯 OAuth 清理任務完成！');
      process.exit(0);
    })
    .catch((error) => {
      console.error('清理過程中發生錯誤:', error);
      process.exit(1);
    });
}

module.exports = cleanupForOAuth;
