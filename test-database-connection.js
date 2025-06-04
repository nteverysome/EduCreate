const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 EduCreate 數據庫連接測試');
console.log('================================');

// 檢查環境變量
function checkEnvironmentVariables() {
  console.log('\n📋 檢查環境變量...');
  
  const envFiles = ['.env.local', '.env'];
  let envFound = false;
  
  for (const envFile of envFiles) {
    if (fs.existsSync(envFile)) {
      console.log(`✅ 找到環境文件: ${envFile}`);
      
      try {
        const envContent = fs.readFileSync(envFile, 'utf8');
        
        if (envContent.includes('DATABASE_URL')) {
          const dbUrlMatch = envContent.match(/DATABASE_URL\s*=\s*["']?([^"'\n]+)["']?/);
          if (dbUrlMatch) {
            const dbUrl = dbUrlMatch[1];
            console.log(`✅ DATABASE_URL 已配置`);
            
            // 解析數據庫 URL
            try {
              const url = new URL(dbUrl);
              console.log(`   主機: ${url.hostname}`);
              console.log(`   端口: ${url.port || '5432'}`);
              console.log(`   數據庫: ${url.pathname.substring(1)}`);
              console.log(`   用戶: ${url.username}`);
            } catch (e) {
              console.log(`⚠️  DATABASE_URL 格式可能有問題: ${e.message}`);
            }
          } else {
            console.log('❌ DATABASE_URL 格式錯誤');
          }
        } else {
          console.log('❌ 未找到 DATABASE_URL');
        }
        
        envFound = true;
        break;
      } catch (error) {
        console.log(`⚠️  讀取 ${envFile} 失敗: ${error.message}`);
      }
    }
  }
  
  if (!envFound) {
    console.log('❌ 未找到環境配置文件 (.env.local 或 .env)');
    return false;
  }
  
  return true;
}

// 測試 Prisma 連接
function testPrismaConnection() {
  console.log('\n🧪 測試 Prisma 數據庫連接...');
  
  return new Promise((resolve) => {
    exec('npx prisma db pull --dry-run', (error, stdout, stderr) => {
      if (error) {
        console.log('❌ Prisma 連接失敗');
        console.log('錯誤信息:', error.message);
        
        if (error.message.includes('ECONNREFUSED')) {
          console.log('💡 提示: PostgreSQL 服務可能未運行');
          console.log('   請運行: .\\check-postgresql.bat');
        } else if (error.message.includes('authentication failed')) {
          console.log('💡 提示: 數據庫認證失敗');
          console.log('   請檢查 DATABASE_URL 中的用戶名和密碼');
        } else if (error.message.includes('database') && error.message.includes('does not exist')) {
          console.log('💡 提示: 數據庫不存在');
          console.log('   請創建數據庫或運行: npx prisma db push');
        }
        
        resolve(false);
      } else {
        console.log('✅ Prisma 數據庫連接成功');
        if (stdout) {
          console.log('輸出:', stdout.trim());
        }
        resolve(true);
      }
    });
  });
}

// 檢查 Prisma 客戶端
function checkPrismaClient() {
  console.log('\n📋 檢查 Prisma 客戶端...');
  
  if (fs.existsSync('node_modules/.prisma/client')) {
    console.log('✅ Prisma 客戶端已生成');
    return true;
  } else {
    console.log('❌ Prisma 客戶端未生成');
    console.log('💡 請運行: npx prisma generate');
    return false;
  }
}

// 檢查 schema.prisma
function checkPrismaSchema() {
  console.log('\n📋 檢查 Prisma Schema...');
  
  if (fs.existsSync('prisma/schema.prisma')) {
    console.log('✅ schema.prisma 文件存在');
    
    try {
      const schemaContent = fs.readFileSync('prisma/schema.prisma', 'utf8');
      
      if (schemaContent.includes('model User')) {
        console.log('✅ User 模型已定義');
      } else {
        console.log('⚠️  未找到 User 模型');
      }
      
      if (schemaContent.includes('provider = "postgresql"')) {
        console.log('✅ PostgreSQL 提供者已配置');
      } else {
        console.log('⚠️  未配置 PostgreSQL 提供者');
      }
      
      return true;
    } catch (error) {
      console.log(`⚠️  讀取 schema.prisma 失敗: ${error.message}`);
      return false;
    }
  } else {
    console.log('❌ schema.prisma 文件不存在');
    return false;
  }
}

// 生成修復建議
function generateFixSuggestions(envOk, schemaOk, clientOk, connectionOk) {
  console.log('\n💡 修復建議:');
  console.log('================================');
  
  if (!envOk) {
    console.log('1. 配置環境變量:');
    console.log('   - 創建 .env.local 文件');
    console.log('   - 添加 DATABASE_URL="postgresql://user:pass@localhost:5432/educreate"');
    console.log('');
  }
  
  if (!connectionOk) {
    console.log('2. 啟動 PostgreSQL 服務:');
    console.log('   - 運行: .\\check-postgresql.bat');
    console.log('   - 或手動啟動: net start postgresql-x64-14');
    console.log('');
  }
  
  if (!clientOk) {
    console.log('3. 生成 Prisma 客戶端:');
    console.log('   - 運行: npx prisma generate');
    console.log('');
  }
  
  if (connectionOk && !schemaOk) {
    console.log('4. 推送數據庫架構:');
    console.log('   - 運行: npx prisma db push');
    console.log('');
  }
  
  if (envOk && schemaOk && clientOk && connectionOk) {
    console.log('✅ 所有檢查都通過！');
    console.log('現在可以測試註冊功能:');
    console.log('1. 運行: npm run dev');
    console.log('2. 訪問: http://localhost:3000/register');
    console.log('3. 或運行: node test-register.js');
  }
}

// 主函數
async function main() {
  try {
    const envOk = checkEnvironmentVariables();
    const schemaOk = checkPrismaSchema();
    const clientOk = checkPrismaClient();
    const connectionOk = await testPrismaConnection();
    
    generateFixSuggestions(envOk, schemaOk, clientOk, connectionOk);
    
    console.log('\n🎯 檢查完成！');
    
    if (envOk && schemaOk && clientOk && connectionOk) {
      console.log('✅ 數據庫連接正常，可以繼續使用註冊功能');
    } else {
      console.log('⚠️  發現問題，請按照上述建議進行修復');
    }
    
  } catch (error) {
    console.error('❌ 檢查過程中出現錯誤:', error);
  }
}

// 如果直接運行此腳本
if (require.main === module) {
  main();
}

module.exports = { main };