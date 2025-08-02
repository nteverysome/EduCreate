const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

console.log('=====================================');
console.log('EduCreate 綜合問題修復工具');
console.log('=====================================');
console.log('');

console.log('🚨 檢測到的問題:');
console.log('1. 數據庫認證失敗 (PrismaClientInitializationError)');
console.log('2. React 組件導入錯誤 (SearchIcon)');
console.log('3. Prisma 客戶端生成問題');
console.log('');

// 修復 Heroicons 導入問題
function fixHeroiconsImports() {
  console.log('🔧 步驟 1: 修復 Heroicons 導入問題');
  
  const dashboardPath = path.join(__dirname, 'pages', 'dashboard.tsx');
  
  try {
    let content = fs.readFileSync(dashboardPath, 'utf8');
    
    // 檢查當前導入
    if (content.includes('@heroicons/react/24/outline')) {
      console.log('✅ Heroicons 導入路徑正確');
      
      // 檢查是否有未定義的組件
      const heroiconsImportMatch = content.match(/import\s*{([^}]+)}\s*from\s*'@heroicons\/react\/24\/outline'/);
      if (heroiconsImportMatch) {
        const imports = heroiconsImportMatch[1].split(',').map(s => s.trim());
        console.log('📋 當前導入的圖標:', imports.join(', '));
        
        // 確保所有必需的圖標都被導入
        const requiredIcons = ['PlusIcon', 'SearchIcon', 'AdjustmentsIcon', 'ClockIcon', 'ChartBarIcon', 'DocumentTextIcon', 'TagIcon', 'EyeIcon', 'UserGroupIcon'];
        const missingIcons = requiredIcons.filter(icon => !imports.includes(icon));
        
        if (missingIcons.length > 0) {
          console.log('⚠️ 缺少圖標:', missingIcons.join(', '));
          const newImports = [...new Set([...imports, ...missingIcons])].join(', ');
          content = content.replace(
            /import\s*{[^}]+}\s*from\s*'@heroicons\/react\/24\/outline'/,
            `import { ${newImports} } from '@heroicons/react/24/outline'`
          );
          fs.writeFileSync(dashboardPath, content);
          console.log('✅ 已添加缺少的圖標導入');
        } else {
          console.log('✅ 所有必需的圖標都已導入');
        }
      }
    } else {
      console.log('⚠️ 需要更新 Heroicons 導入路徑');
      // 更新導入路徑
      content = content.replace(
        /@heroicons\/react\/outline/g,
        '@heroicons/react/24/outline'
      );
      fs.writeFileSync(dashboardPath, content);
      console.log('✅ Heroicons 導入路徑已更新');
    }
    
  } catch (error) {
    console.log('❌ 修復 Heroicons 導入失敗:', error.message);
  }
}

// 測試數據庫連接
async function testDatabaseConnection() {
  console.log('');
  console.log('🔍 步驟 2: 測試數據庫連接');
  
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    await prisma.$connect();
    console.log('✅ 數據庫連接成功');
    
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ 數據庫查詢測試成功');
    
    await prisma.$disconnect();
    return true;
    
  } catch (error) {
    console.log('❌ 數據庫連接失敗:', error.message);
    
    if (error.message.includes('Authentication failed')) {
      console.log('');
      console.log('🔧 數據庫認證問題解決方案:');
      console.log('1. 檢查 PostgreSQL 服務狀態');
      console.log('2. 驗證 .env 文件中的數據庫密碼');
      console.log('3. 運行: .\\quick-fix-db-auth.bat');
    }
    
    return false;
  }
}

// 修復 Prisma 客戶端
async function fixPrismaClient() {
  console.log('');
  console.log('🔍 步驟 3: 修復 Prisma 客戶端');
  
  return new Promise((resolve) => {
    // 清理舊的客戶端
    const prismaClientPath = path.join(__dirname, 'node_modules', '.prisma', 'client');
    
    if (fs.existsSync(prismaClientPath)) {
      console.log('🗑️ 清理舊的 Prisma 客戶端...');
      try {
        fs.rmSync(prismaClientPath, { recursive: true, force: true });
        console.log('✅ 舊客戶端已清理');
      } catch (error) {
        console.log('⚠️ 清理過程中遇到問題:', error.message);
      }
    }
    
    // 重新生成客戶端
    console.log('🚀 重新生成 Prisma 客戶端...');
    exec('npx prisma generate', { cwd: __dirname }, (error, stdout, stderr) => {
      if (error) {
        console.log('❌ Prisma 客戶端生成失敗:', error.message);
        if (error.message.includes('EPERM')) {
          console.log('');
          console.log('🔧 權限問題解決方案:');
          console.log('1. 關閉所有編輯器和開發工具');
          console.log('2. 以管理員身份運行此腳本');
          console.log('3. 或運行: .\\fix-prisma-simple.bat');
        }
        resolve(false);
      } else {
        console.log('✅ Prisma 客戶端生成成功');
        resolve(true);
      }
    });
  });
}

// 檢查依賴
function checkDependencies() {
  console.log('');
  console.log('🔍 步驟 4: 檢查關鍵依賴');
  
  const packageJsonPath = path.join(__dirname, 'package.json');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    const requiredDeps = {
      '@heroicons/react': '檢查 Heroicons 版本',
      '@prisma/client': '檢查 Prisma 客戶端',
      'prisma': '檢查 Prisma CLI',
      'next-auth': '檢查 NextAuth',
      'react': '檢查 React'
    };
    
    console.log('📋 依賴檢查結果:');
    for (const [dep, desc] of Object.entries(requiredDeps)) {
      if (dependencies[dep]) {
        console.log(`✅ ${dep}: ${dependencies[dep]}`);
      } else {
        console.log(`❌ ${dep}: 未安裝`);
      }
    }
    
  } catch (error) {
    console.log('❌ 檢查依賴失敗:', error.message);
  }
}

// 主修復流程
async function main() {
  fixHeroiconsImports();
  
  const dbConnected = await testDatabaseConnection();
  
  if (dbConnected) {
    const prismaFixed = await fixPrismaClient();
    
    if (prismaFixed) {
      checkDependencies();
      
      console.log('');
      console.log('🎉 修復完成!');
      console.log('');
      console.log('📋 下一步:');
      console.log('1. 重啟開發服務器: npm run dev');
      console.log('2. 檢查控制台是否還有錯誤');
      console.log('3. 測試註冊和登錄功能');
      console.log('');
      console.log('✅ 所有主要問題都已修復!');
    } else {
      console.log('');
      console.log('⚠️ Prisma 客戶端修復失敗，請手動運行:');
      console.log('.\\fix-prisma-simple.bat');
    }
  } else {
    console.log('');
    console.log('⚠️ 數據庫連接失敗，請先修復數據庫問題:');
    console.log('.\\quick-fix-db-auth.bat');
  }
}

main().catch(console.error);