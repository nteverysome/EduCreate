#!/usr/bin/env node

/**
 * 🔄 同步 Production 數據到 Vercel 的腳本
 * 
 * 功能：
 * 1. 驗證 Production Branch 有數據
 * 2. 確保 Vercel 環境變數正確
 * 3. 提供修復建議
 * 
 * 用法：node scripts/sync-production-to-vercel.js
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const productionDb = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://neondb_owner:npg_JiVYrWK7L6Ff@ep-curly-salad-a85exs3f-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require'
    }
  }
});

async function main() {
  console.log('🔄 EduCreate 生產環境同步檢查');
  console.log('='.repeat(60));

  try {
    // 1. 檢查 Production 數據
    console.log('\n📊 步驟 1: 檢查 Production Branch 數據...');
    
    const users = await productionDb.user.count();
    const folders = await productionDb.folder.count({ where: { deletedAt: null } });
    const activities = await productionDb.activity.count({ where: { deletedAt: null } });
    
    console.log(`✅ 用戶: ${users}`);
    console.log(`✅ 資料夾: ${folders}`);
    console.log(`✅ 活動: ${activities}`);

    if (activities === 0) {
      console.log('\n❌ Production Branch 沒有數據！');
      console.log('需要運行同步腳本: node scripts/sync-databases.js');
      process.exit(1);
    }

    // 2. 生成 Vercel 環境變數配置
    console.log('\n📋 步驟 2: 生成 Vercel 環境變數配置...');
    
    const vercelConfig = {
      DATABASE_URL: 'postgresql://neondb_owner:npg_JiVYrWK7L6Ff@ep-curly-salad-a85exs3f-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require',
      NEXTAUTH_URL: 'https://edu-create.vercel.app',
      NODE_ENV: 'production'
    };

    console.log('\n✅ 需要在 Vercel 中設置的環境變數:');
    console.log('='.repeat(60));
    
    Object.entries(vercelConfig).forEach(([key, value]) => {
      if (key === 'DATABASE_URL') {
        console.log(`${key}=postgresql://neondb_owner:npg_JiVYrWK7L6Ff@ep-curly-salad-a85exs3f-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require`);
      } else {
        console.log(`${key}=${value}`);
      }
    });

    // 3. 生成修復指南
    console.log('\n\n🛠️  修復步驟:');
    console.log('='.repeat(60));
    
    console.log('\n1️⃣  登入 Vercel Dashboard');
    console.log('   https://vercel.com');
    
    console.log('\n2️⃣  進入 EduCreate 項目');
    console.log('   Settings → Environment Variables');
    
    console.log('\n3️⃣  更新 DATABASE_URL');
    console.log('   - 刪除舊的 DATABASE_URL');
    console.log('   - 添加新的 DATABASE_URL (見上面)');
    console.log('   - 選擇環境: Production, Preview, Development');
    console.log('   - 點擊 Save');
    
    console.log('\n4️⃣  重新部署');
    console.log('   - 進入 Deployments 標籤');
    console.log('   - 點擊最新部署的 Redeploy 按鈕');
    console.log('   - 等待部署完成');
    
    console.log('\n5️⃣  驗證');
    console.log('   - 訪問 https://edu-create.vercel.app/my-activities');
    console.log(`   - 應該看到 ${activities} 個活動`);

    // 4. 保存配置到文件
    console.log('\n\n💾 保存配置到文件...');
    
    const configContent = `# Vercel 環境變數配置
# 複製以下內容到 Vercel Dashboard > Settings > Environment Variables

DATABASE_URL=postgresql://neondb_owner:npg_JiVYrWK7L6Ff@ep-curly-salad-a85exs3f-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require
NEXTAUTH_URL=https://edu-create.vercel.app
NODE_ENV=production

# 設置環境: Production, Preview, Development (全選)
# 點擊 Save 後需要重新部署
`;

    fs.writeFileSync('.env.vercel.production', configContent);
    console.log('✅ 配置已保存到 .env.vercel.production');

    // 5. 總結
    console.log('\n\n📊 數據統計:');
    console.log('='.repeat(60));
    console.log(`Production Branch 數據:`);
    console.log(`  - 用戶: ${users}`);
    console.log(`  - 資料夾: ${folders}`);
    console.log(`  - 活動: ${activities}`);
    console.log('\n✅ Production Branch 有足夠的數據');
    console.log('⏳ 等待 Vercel 環境變數更新和重新部署');

  } catch (error) {
    console.error('❌ 錯誤:', error.message);
    process.exit(1);
  } finally {
    await productionDb.$disconnect();
  }
}

main();

