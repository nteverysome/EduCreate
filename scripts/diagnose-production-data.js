#!/usr/bin/env node

/**
 * 🔍 生產環境數據診斷腳本
 * 
 * 功能：檢查生產環境的數據庫連接和數據狀態
 * 用法：node scripts/diagnose-production-data.js
 */

const { PrismaClient } = require('@prisma/client');

// 三個數據庫連接
const databases = {
  production: {
    name: 'Production Branch (ep-curly-salad-a85exs3f)',
    url: 'postgresql://neondb_owner:npg_JiVYrWK7L6Ff@ep-curly-salad-a85exs3f-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require'
  },
  development: {
    name: 'Development Branch (ep-hidden-field-a8tai7gk)',
    url: 'postgresql://neondb_owner:npg_JiVYrWK7L6Ff@ep-hidden-field-a8tai7gk-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require'
  }
};

async function checkDatabase(name, url) {
  console.log(`\n📊 檢查 ${name}...`);
  console.log('='.repeat(60));
  
  try {
    const db = new PrismaClient({
      datasources: { db: { url } }
    });

    // 檢查連接
    await db.$connect();
    console.log('✅ 數據庫連接成功');

    // 檢查用戶
    const users = await db.user.count();
    console.log(`👥 用戶數: ${users}`);

    // 檢查資料夾
    const folders = await db.folder.count({
      where: { deletedAt: null }
    });
    console.log(`📁 活躍資料夾: ${folders}`);

    // 檢查活動
    const activities = await db.activity.count({
      where: { deletedAt: null }
    });
    console.log(`🎮 活躍活動: ${activities}`);

    // 檢查 GameSettings
    const gameSettings = await db.gameSettings.count();
    console.log(`⚙️  GameSettings: ${gameSettings}`);

    // 獲取最近的活動
    const recentActivities = await db.activity.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 3,
      select: { id: true, title: true, createdAt: true }
    });

    if (recentActivities.length > 0) {
      console.log('\n📝 最近的活動:');
      recentActivities.forEach(activity => {
        console.log(`   - ${activity.title} (${activity.createdAt.toLocaleDateString()})`);
      });
    }

    await db.$disconnect();
    
    return {
      status: 'healthy',
      users,
      folders,
      activities,
      gameSettings
    };

  } catch (error) {
    console.error('❌ 連接失敗:', error.message);
    return {
      status: 'error',
      error: error.message
    };
  }
}

async function main() {
  console.log('🔍 EduCreate 生產環境數據診斷');
  console.log('='.repeat(60));

  const results = {};

  // 檢查所有數據庫
  for (const [key, db] of Object.entries(databases)) {
    results[key] = await checkDatabase(db.name, db.url);
  }

  // 生成報告
  console.log('\n\n📋 診斷報告');
  console.log('='.repeat(60));

  console.log('\n✅ Production Branch 狀態:');
  if (results.production.status === 'healthy') {
    console.log(`   - 用戶: ${results.production.users}`);
    console.log(`   - 資料夾: ${results.production.folders}`);
    console.log(`   - 活動: ${results.production.activities}`);
  } else {
    console.log(`   ❌ 連接失敗: ${results.production.error}`);
  }

  console.log('\n✅ Development Branch 狀態:');
  if (results.development.status === 'healthy') {
    console.log(`   - 用戶: ${results.development.users}`);
    console.log(`   - 資料夾: ${results.development.folders}`);
    console.log(`   - 活動: ${results.development.activities}`);
  } else {
    console.log(`   ❌ 連接失敗: ${results.development.error}`);
  }

  // 建議
  console.log('\n\n💡 建議:');
  console.log('='.repeat(60));

  if (results.production.activities === 0 && results.development.activities > 0) {
    console.log('⚠️  生產環境沒有數據，但開發環境有數據');
    console.log('\n🔧 解決方案:');
    console.log('1. 確認 Vercel 的 DATABASE_URL 指向 Production Branch');
    console.log('2. 運行同步腳本: node scripts/sync-databases.js');
    console.log('3. 在 Vercel 上重新部署應用');
  } else if (results.production.activities > 0) {
    console.log('✅ 生產環境有數據，應該可以正常顯示');
  } else {
    console.log('❌ 兩個環境都沒有數據，需要檢查數據庫連接');
  }

  console.log('\n');
}

main().catch(console.error);

