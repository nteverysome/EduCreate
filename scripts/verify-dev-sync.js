#!/usr/bin/env node

/**
 * 驗證 Development Branch 的數據同步
 * 檢查本地開發環境是否能正確訪問同步的數據
 */

const { PrismaClient } = require('@prisma/client');

async function verifyDevSync() {
  console.log('🔍 驗證 Development Branch 數據同步...\n');

  const devDb = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_JiVYrWK7L6Ff@ep-hidden-field-a8tai7gk-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require'
      }
    }
  });

  try {
    // 1. 驗證用戶數據
    console.log('👥 1. 驗證用戶數據...');
    const users = await devDb.user.findMany();
    console.log(`   ✅ 找到 ${users.length} 個用戶`);
    users.forEach(user => {
      console.log(`      - ${user.email} (${user.name || 'No name'})`);
    });

    // 2. 驗證資料夾數據
    console.log('\n📁 2. 驗證資料夾數據...');
    const folders = await devDb.folder.findMany({
      where: { deletedAt: null }
    });
    console.log(`   ✅ 找到 ${folders.length} 個活躍資料夾`);

    // 3. 驗證活動數據
    console.log('\n🎮 3. 驗證活動數據...');
    const activities = await devDb.activity.findMany({
      where: { deletedAt: null },
      include: {
        user: true,
        folder: true,
        gameSettings: true
      },
      take: 5
    });
    console.log(`   ✅ 找到 ${activities.length} 個活躍活動（顯示前 5 個）`);
    activities.forEach(activity => {
      console.log(`      - ${activity.title} (${activity.type}) - 用戶: ${activity.user?.email}`);
    });

    // 4. 驗證活動總數
    console.log('\n📊 4. 活動統計...');
    const totalActivities = await devDb.activity.count({
      where: { deletedAt: null }
    });
    console.log(`   ✅ 總共 ${totalActivities} 個活躍活動`);

    // 5. 驗證 GameSettings
    console.log('\n⚙️  5. 驗證 GameSettings...');
    const gameSettings = await devDb.gameSettings.count();
    console.log(`   ✅ 找到 ${gameSettings} 個 GameSettings 記錄`);

    // 6. 驗證 VocabularyItem
    console.log('\n📚 6. 驗證 VocabularyItem...');
    const vocabItems = await devDb.vocabularyItem.count();
    console.log(`   ℹ️  找到 ${vocabItems} 個詞彙項目（預期為 0，因為 schema 不同）`);

    console.log('\n✅ Development Branch 數據同步驗證完成！');
    console.log('\n📝 同步摘要：');
    console.log(`   - 用戶: ${users.length}`);
    console.log(`   - 資料夾: ${folders.length}`);
    console.log(`   - 活動: ${totalActivities}`);
    console.log(`   - GameSettings: ${gameSettings}`);

    console.log('\n🎉 本地開發環境已準備好使用同步的數據！');

  } catch (error) {
    console.error('❌ 驗證失敗:', error.message);
    process.exit(1);
  } finally {
    await devDb.$disconnect();
  }
}

verifyDevSync();

