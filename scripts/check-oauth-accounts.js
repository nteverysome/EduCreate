const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkOAuthAccounts() {
  try {
    console.log('🔍 檢查 OAuth 帳號狀況...');

    // 查看所有用戶
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    });

    console.log('\n👥 數據庫中的用戶：');
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} (${user.name}) - ID: ${user.id}`);
      console.log(`      創建時間: ${user.createdAt}`);
    });

    // 查看所有 OAuth 帳號記錄
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

    console.log('\n🔗 OAuth 帳號記錄：');
    if (accounts.length === 0) {
      console.log('   ❌ 沒有找到任何 OAuth 帳號記錄');
      console.log('   這解釋了為什麼會出現 OAuthAccountNotLinked 錯誤');
    } else {
      accounts.forEach((account, index) => {
        console.log(`   ${index + 1}. 提供者: ${account.provider}`);
        console.log(`      用戶: ${account.user.email} (${account.user.name})`);
        console.log(`      提供者帳號ID: ${account.providerAccountId}`);
        console.log(`      類型: ${account.type}`);
      });
    }

    // 分析問題
    console.log('\n📊 問題分析：');
    if (users.length > 0 && accounts.length === 0) {
      console.log('   🚨 發現問題：用戶存在但沒有 OAuth 記錄');
      console.log('   💡 解決方案：刪除現有用戶，讓 NextAuth 重新創建完整記錄');
      
      console.log('\n🔧 建議操作：');
      console.log('   1. 刪除現有用戶');
      console.log('   2. 清除瀏覽器 session');
      console.log('   3. 重新用 Google 登入');
      console.log('   4. NextAuth 會創建完整的用戶和 OAuth 記錄');
      
      return { needsCleanup: true, users: users };
    } else if (accounts.length > 0) {
      console.log('   ✅ OAuth 記錄存在，問題可能在其他地方');
      return { needsCleanup: false, users: users, accounts: accounts };
    } else {
      console.log('   📝 數據庫為空，可以直接進行 Google 登入');
      return { needsCleanup: false, users: users };
    }

  } catch (error) {
    console.error('❌ 檢查過程中發生錯誤:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 執行檢查
if (require.main === module) {
  checkOAuthAccounts()
    .then((result) => {
      console.log('\n🎯 檢查完成！');
      if (result.needsCleanup) {
        console.log('⚠️  需要清理現有用戶以解決 OAuth 問題');
      }
      process.exit(0);
    })
    .catch((error) => {
      console.error('檢查過程中發生錯誤:', error);
      process.exit(1);
    });
}

module.exports = checkOAuthAccounts;
