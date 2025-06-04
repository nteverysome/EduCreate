const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

console.log('🔍 EduCreate 快速診斷工具');
console.log('================================');

// 檢查關鍵文件
function checkFiles() {
  console.log('\n📋 檢查關鍵文件...');
  
  const criticalFiles = [
    'pages/register.tsx',
    'pages/api/auth/register.ts',
    '.env.local',
    'package.json',
    'prisma/schema.prisma'
  ];
  
  criticalFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file} - 存在`);
    } else {
      console.log(`❌ ${file} - 缺失`);
    }
  });
}

// 檢查環境變量
function checkEnvironment() {
  console.log('\n📋 檢查環境變量...');
  
  try {
    if (fs.existsSync('.env.local')) {
      const envContent = fs.readFileSync('.env.local', 'utf8');
      
      const requiredVars = ['DATABASE_URL', 'NEXTAUTH_URL', 'NEXTAUTH_SECRET'];
      
      requiredVars.forEach(varName => {
        if (envContent.includes(varName)) {
          console.log(`✅ ${varName} - 已配置`);
        } else {
          console.log(`❌ ${varName} - 缺失`);
        }
      });
    } else {
      console.log('❌ .env.local 文件不存在');
    }
  } catch (error) {
    console.log('⚠️  環境變量檢查失敗:', error.message);
  }
}

// 檢查依賴
function checkDependencies() {
  console.log('\n📋 檢查關鍵依賴...');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    const criticalDeps = [
      '@prisma/client',
      'prisma',
      'next-auth',
      'bcryptjs',
      'next'
    ];
    
    criticalDeps.forEach(dep => {
      if (deps[dep]) {
        console.log(`✅ ${dep} - ${deps[dep]}`);
      } else {
        console.log(`❌ ${dep} - 缺失`);
      }
    });
  } catch (error) {
    console.log('⚠️  依賴檢查失敗:', error.message);
  }
}

// 檢查Prisma狀態
function checkPrisma() {
  console.log('\n📋 檢查Prisma狀態...');
  
  return new Promise((resolve) => {
    exec('npx prisma --version', (error, stdout, stderr) => {
      if (error) {
        console.log('❌ Prisma CLI 不可用');
      } else {
        console.log('✅ Prisma CLI 可用');
        console.log(stdout.trim());
      }
      
      // 檢查生成的客戶端
      if (fs.existsSync('node_modules/.prisma/client')) {
        console.log('✅ Prisma 客戶端已生成');
      } else {
        console.log('❌ Prisma 客戶端未生成');
      }
      
      resolve();
    });
  });
}

// 檢查端口使用情況
function checkPorts() {
  console.log('\n📋 檢查端口使用情況...');
  
  return new Promise((resolve) => {
    exec('netstat -ano | findstr :3000', (error, stdout, stderr) => {
      if (error || !stdout.trim()) {
        console.log('❌ 端口 3000 未被使用 (服務器可能未運行)');
      } else {
        console.log('✅ 端口 3000 正在使用中');
        console.log(stdout.trim());
      }
      resolve();
    });
  });
}

// 生成修復建議
function generateSuggestions() {
  console.log('\n💡 修復建議:');
  console.log('================================');
  
  console.log('1. 如果 Prisma 客戶端未生成:');
  console.log('   npx prisma generate');
  
  console.log('\n2. 如果數據庫連接問題:');
  console.log('   npx prisma db push');
  
  console.log('\n3. 如果依賴問題:');
  console.log('   npm install');
  
  console.log('\n4. 如果服務器未運行:');
  console.log('   npm run dev');
  
  console.log('\n5. 如果仍有問題:');
  console.log('   - 檢查瀏覽器控制台錯誤');
  console.log('   - 檢查終端錯誤信息');
  console.log('   - 運行: node fix-register-issues.js');
}

// 主函數
async function main() {
  try {
    checkFiles();
    checkEnvironment();
    checkDependencies();
    await checkPrisma();
    await checkPorts();
    generateSuggestions();
    
    console.log('\n🎯 診斷完成！');
    console.log('請根據上述檢查結果和建議進行修復。');
    
  } catch (error) {
    console.error('❌ 診斷過程中出現錯誤:', error);
  }
}

main();