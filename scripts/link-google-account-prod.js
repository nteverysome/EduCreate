const { PrismaClient } = require('@prisma/client');

// 使用生產環境數據庫連接
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://neondb_owner:npg_JiVYrWK7L6Ff@ep-hidden-field-a8tai7gk-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require'
    }
  }
});

(async () => {
  try {
    const userId = '105965362903711325694';
    const googleId = '105965362903711325694';
    
    // 檢查是否已存在
    const existingAccount = await prisma.account.findUnique({
      where: {
        provider_providerAccountId: {
          provider: 'google',
          providerAccountId: googleId
        }
      }
    });
    
    if (existingAccount) {
      console.log('Google 帳號已存在');
      return;
    }
    
    // 創建 Google OAuth 帳號記錄
    const account = await prisma.account.create({
      data: {
        userId: userId,
        type: 'oauth',
        provider: 'google',
        providerAccountId: googleId,
        refresh_token: null,
        access_token: null,
        expires_at: null,
        token_type: null,
        scope: null,
        id_token: null,
        session_state: null
      }
    });
    
    console.log('✅ 成功為用戶添加 Google OAuth 帳號');
    console.log(`用戶 ID: ${userId}`);
    console.log(`Google ID: ${googleId}`);
  } catch (error) {
    console.error('❌ 錯誤:', error.message);
  } finally {
    await prisma.$disconnect();
  }
})();

