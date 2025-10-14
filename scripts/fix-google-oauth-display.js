const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixGoogleOAuthDisplay() {
  console.log('🔧 修復 Google OAuth 用戶顯示問題...\n');

  try {
    // 1. 檢查當前用戶狀態
    console.log('🔍 檢查當前用戶狀態...');
    const currentUser = await prisma.user.findUnique({
      where: { email: 'nteverysome@gmail.com' },
      include: {
        accounts: true,
        activities: true,
        _count: {
          select: {
            activities: true,
            vocabularySets: true
          }
        }
      }
    });

    if (!currentUser) {
      console.log('✅ 沒有找到問題用戶，數據庫是乾淨的');
      return { success: true, message: '數據庫已經是乾淨狀態' };
    }

    console.log(`📊 找到用戶: ${currentUser.email} (${currentUser.name})`);
    console.log(`   - 用戶 ID: ${currentUser.id}`);
    console.log(`   - 頭像: ${currentUser.image ? '有' : '無'}`);
    console.log(`   - 活動數量: ${currentUser._count.activities}`);
    console.log(`   - OAuth 帳號數量: ${currentUser.accounts.length}`);

    // 2. 檢查 OAuth 帳號關聯
    if (currentUser.accounts.length === 0) {
      console.log('\n🚨 問題確認：用戶存在但沒有 OAuth 帳號記錄');
      console.log('💡 這會導致 NextAuth 無法正確處理 Google 登入');
      
      // 3. 安全清理用戶數據
      console.log('\n🧹 開始清理用戶數據...');
      
      // 刪除相關的活動數據
      if (currentUser._count.activities > 0) {
        console.log(`   刪除 ${currentUser._count.activities} 個活動...`);
        
        // 刪除詞彙項目
        await prisma.vocabularyItem.deleteMany({
          where: {
            activity: {
              userId: currentUser.id
            }
          }
        });
        console.log('   ✅ 詞彙項目已刪除');

        // 刪除活動版本
        await prisma.activityVersion.deleteMany({
          where: { userId: currentUser.id }
        });
        console.log('   ✅ 活動版本已刪除');

        // 刪除活動版本日誌
        await prisma.activityVersionLog.deleteMany({
          where: { userId: currentUser.id }
        });
        console.log('   ✅ 活動版本日誌已刪除');

        // 刪除活動
        await prisma.activity.deleteMany({
          where: { userId: currentUser.id }
        });
        console.log('   ✅ 活動已刪除');
      }

      // 刪除其他相關數據
      await prisma.folder.deleteMany({
        where: { userId: currentUser.id }
      });
      
      await prisma.h5PContent.deleteMany({
        where: { userId: currentUser.id }
      });
      
      await prisma.invoice.deleteMany({
        where: { userId: currentUser.id }
      });
      
      await prisma.notificationSettings.deleteMany({
        where: { userId: currentUser.id }
      });
      
      await prisma.passwordReset.deleteMany({
        where: { userId: currentUser.id }
      });

      await prisma.vocabularySet.deleteMany({
        where: { userId: currentUser.id }
      });

      console.log('   ✅ 所有相關數據已清理');

      // 最後刪除用戶
      await prisma.user.delete({
        where: { id: currentUser.id }
      });
      
      console.log('   ✅ 用戶記錄已刪除');
      
      console.log('\n🎉 清理完成！');
      console.log('📋 接下來的步驟：');
      console.log('   1. 清除瀏覽器中的所有 cookie 和 session');
      console.log('   2. 重新訪問登入頁面');
      console.log('   3. 使用 Google 帳號登入');
      console.log('   4. NextAuth 會創建完整的用戶和 OAuth 記錄');
      console.log('   5. 用戶郵箱將正確顯示為 nteverysome@gmail.com');
      
      return { 
        success: true, 
        message: '用戶數據已清理，準備重新 Google OAuth 登入',
        activitiesDeleted: currentUser._count.activities
      };
      
    } else {
      console.log('\n✅ OAuth 帳號記錄存在，問題可能在其他地方');
      console.log('🔍 檢查 OAuth 帳號詳情：');
      
      currentUser.accounts.forEach((account, index) => {
        console.log(`   ${index + 1}. ${account.provider} 帳號`);
        console.log(`      Provider ID: ${account.providerAccountId}`);
        console.log(`      類型: ${account.type}`);
      });
      
      return { 
        success: true, 
        message: 'OAuth 記錄正常，問題可能在前端顯示邏輯',
        accounts: currentUser.accounts
      };
    }

  } catch (error) {
    console.error('❌ 修復過程中發生錯誤:', error);
    return { success: false, error: error.message };
  } finally {
    await prisma.$disconnect();
  }
}

// 執行修復
fixGoogleOAuthDisplay().then(result => {
  console.log('\n🎯 修復完成！');
  
  if (result.success) {
    console.log('✅', result.message);
    if (result.activitiesDeleted) {
      console.log(`📊 已刪除 ${result.activitiesDeleted} 個活動`);
    }
  } else {
    console.log('❌ 修復失敗:', result.error);
  }
}).catch(error => {
  console.error('❌ 執行失敗:', error);
});
