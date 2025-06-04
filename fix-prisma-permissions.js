const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

console.log('=====================================');
console.log('Prisma 客戶端權限修復工具');
console.log('=====================================');
console.log('');

console.log('🚨 檢測到錯誤: EPERM - operation not permitted');
console.log('📋 問題: query_engine-windows.dll.node 文件權限問題');
console.log('');

async function fixPrismaPermissions() {
  const prismaClientPath = path.join(__dirname, 'node_modules', '.prisma', 'client');
  
  console.log('🔍 步驟 1: 檢查 Prisma 客戶端目錄');
  
  if (fs.existsSync(prismaClientPath)) {
    console.log('✅ Prisma 客戶端目錄存在');
    
    try {
      console.log('🗑️ 步驟 2: 清理舊的客戶端文件');
      
      // 遞歸刪除 .prisma/client 目錄
      function removeDir(dirPath) {
        if (fs.existsSync(dirPath)) {
          const files = fs.readdirSync(dirPath);
          
          files.forEach(file => {
            const filePath = path.join(dirPath, file);
            const stat = fs.statSync(filePath);
            
            if (stat.isDirectory()) {
              removeDir(filePath);
            } else {
              try {
                fs.unlinkSync(filePath);
              } catch (error) {
                console.log(`⚠️ 無法刪除文件: ${filePath}`);
              }
            }
          });
          
          try {
            fs.rmdirSync(dirPath);
          } catch (error) {
            console.log(`⚠️ 無法刪除目錄: ${dirPath}`);
          }
        }
      }
      
      removeDir(prismaClientPath);
      console.log('✅ 舊客戶端文件已清理');
      
    } catch (error) {
      console.log('⚠️ 清理過程中遇到問題:', error.message);
    }
  } else {
    console.log('ℹ️ Prisma 客戶端目錄不存在，將創建新的');
  }
  
  console.log('');
  console.log('🚀 步驟 3: 重新生成 Prisma 客戶端');
  
  return new Promise((resolve) => {
    exec('npx prisma generate', { cwd: __dirname }, (error, stdout, stderr) => {
      if (error) {
        console.log('❌ Prisma 客戶端生成失敗:');
        console.log('錯誤信息:', error.message);
        console.log('標準錯誤:', stderr);
        
        if (error.message.includes('EPERM')) {
          console.log('');
          console.log('🔧 權限問題解決方案:');
          console.log('1. 以管理員身份運行命令提示符');
          console.log('2. 關閉所有可能使用 node_modules 的程序');
          console.log('3. 重新運行此腳本');
          console.log('4. 或者重新安裝依賴: npm install');
        }
        
        resolve(false);
      } else {
        console.log('✅ Prisma 客戶端生成成功!');
        console.log('標準輸出:', stdout);
        resolve(true);
      }
    });
  });
}

async function testPrismaConnection() {
  console.log('');
  console.log('🧪 步驟 4: 測試 Prisma 連接');
  
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    await prisma.$connect();
    console.log('✅ Prisma 連接測試成功!');
    
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ 數據庫查詢測試成功:', result);
    
    await prisma.$disconnect();
    return true;
    
  } catch (error) {
    console.log('❌ Prisma 連接測試失敗:');
    console.log('錯誤信息:', error.message);
    return false;
  }
}

async function main() {
  const generateSuccess = await fixPrismaPermissions();
  
  if (generateSuccess) {
    const connectionSuccess = await testPrismaConnection();
    
    if (connectionSuccess) {
      console.log('');
      console.log('🎉 修復完成!');
      console.log('');
      console.log('📋 下一步:');
      console.log('1. 啟動開發服務器: npm run dev');
      console.log('2. 訪問註冊頁面: http://localhost:3000/register');
      console.log('3. 測試註冊功能');
      console.log('');
      console.log('✅ 數據庫認證和 Prisma 客戶端都已修復!');
    }
  } else {
    console.log('');
    console.log('❌ 修復失敗，請嘗試以下解決方案:');
    console.log('1. 以管理員身份運行');
    console.log('2. 關閉 VS Code 和其他編輯器');
    console.log('3. 重新安裝依賴: npm install');
    console.log('4. 手動刪除 node_modules 並重新安裝');
  }
}

main().catch(console.error);