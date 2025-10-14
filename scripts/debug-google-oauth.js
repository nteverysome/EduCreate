const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugGoogleOAuth() {
  console.log('🔍 Google OAuth 深度診斷...\n');

  try {
    // 1. 檢查所有用戶
    console.log('👥 數據庫中的所有用戶：');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (users.length === 0) {
      console.log('   ❌ 沒有找到任何用戶');
    } else {
      users.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.email} (${user.name})`);
        console.log(`      ID: ${user.id}`);
        console.log(`      頭像: ${user.image || '無'}`);
        console.log(`      郵箱驗證: ${user.emailVerified ? '已驗證' : '未驗證'}`);
        console.log(`      創建時間: ${user.createdAt}`);
        console.log(`      更新時間: ${user.updatedAt}`);
        console.log('');
      });
    }

    // 2. 檢查所有 OAuth 帳號記錄
    console.log('🔗 OAuth 帳號記錄：');
    const accounts = await prisma.account.findMany({
      include: {
        user: {
          select: {
            email: true,
            name: true
          }
        }
      }
    });

    if (accounts.length === 0) {
      console.log('   ❌ 沒有找到任何 OAuth 帳號記錄');
      console.log('   💡 這解釋了為什麼會出現 OAuthAccountNotLinked 錯誤');
    } else {
      accounts.forEach((account, index) => {
        console.log(`   ${index + 1}. ${account.provider} 帳號`);
        console.log(`      用戶: ${account.user.email} (${account.user.name})`);
        console.log(`      Provider ID: ${account.providerAccountId}`);
        console.log(`      類型: ${account.type}`);
        console.log(`      創建時間: ${account.createdAt}`);
        console.log('');
      });
    }

    // 3. 檢查 Session 記錄
    console.log('📱 Session 記錄：');
    const sessions = await prisma.session.findMany({
      include: {
        user: {
          select: {
            email: true,
            name: true
          }
        }
      }
    });

    if (sessions.length === 0) {
      console.log('   ❌ 沒有找到任何 Session 記錄');
      console.log('   💡 這是正常的，因為我們使用 JWT 策略');
    } else {
      sessions.forEach((session, index) => {
        console.log(`   ${index + 1}. Session Token: ${session.sessionToken.substring(0, 20)}...`);
        console.log(`      用戶: ${session.user.email} (${session.user.name})`);
        console.log(`      過期時間: ${session.expires}`);
        console.log('');
      });
    }

    // 4. 問題分析
    console.log('📊 問題分析：');
    
    if (users.length > 0 && accounts.length === 0) {
      console.log('   🚨 發現問題：用戶存在但沒有 OAuth 記錄');
      console.log('   🔍 這意味著：');
      console.log('      - 用戶可能是通過其他方式創建的（如演示模式）');
      console.log('      - NextAuth 無法將 Google OAuth 與現有用戶關聯');
      console.log('      - 需要清理現有用戶，讓 NextAuth 重新創建完整記錄');
      
      console.log('\n   💡 解決方案：');
      console.log('      1. 刪除現有用戶記錄');
      console.log('      2. 清除瀏覽器中的所有 session 和 cookie');
      console.log('      3. 重新用 Google 帳號登入');
      console.log('      4. NextAuth 會創建完整的用戶和 OAuth 記錄');
      
      return { needsCleanup: true, users: users };
    } else if (users.length > 0 && accounts.length > 0) {
      console.log('   ✅ 用戶和 OAuth 記錄都存在');
      console.log('   🔍 問題可能在於：');
      console.log('      - 前端組件顯示邏輯');
      console.log('      - NextAuth session callback');
      console.log('      - 瀏覽器緩存問題');
      
      return { needsCleanup: false, users: users, accounts: accounts };
    } else {
      console.log('   ✅ 數據庫是乾淨的，準備接受新的 Google OAuth 登入');
      return { needsCleanup: false, users: [], accounts: [] };
    }

  } catch (error) {
    console.error('❌ 診斷過程中發生錯誤:', error);
    return { error: error.message };
  } finally {
    await prisma.$disconnect();
  }
}

// 執行診斷
debugGoogleOAuth().then(result => {
  console.log('\n🎯 診斷完成！');
  
  if (result.needsCleanup) {
    console.log('⚠️  需要清理現有用戶以解決 OAuth 問題');
    console.log('💡 運行 node scripts/cleanup-for-oauth.js 來清理');
  } else if (result.error) {
    console.log('❌ 診斷失敗:', result.error);
  } else {
    console.log('✅ 數據庫狀態正常');
  }
});
