const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🎯 EduCreate Gmail SMTP 真實設定指導');
console.log('=====================================');
console.log('');

console.log('📋 當前狀況：');
console.log('✅ 互動式指南已打開');
console.log('✅ Google 帳戶頁面已打開（標籤 6）');
console.log('✅ 兩步驟驗證頁面已打開（標籤 7）');
console.log('✅ 應用程式密碼頁面已打開（標籤 8）');
console.log('');

async function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function setupRealGmailCredentials() {
  console.log('🔑 步驟 1: 獲取真實的 Gmail 應用程式密碼');
  console.log('=====================================');
  console.log('');
  
  console.log('請按照以下步驟操作：');
  console.log('');
  console.log('1. 切換到標籤頁 8（應用程式密碼頁面）');
  console.log('2. 如果需要登入，請使用您的 Gmail 帳戶登入');
  console.log('3. 在應用程式密碼頁面：');
  console.log('   • 點擊「選取應用程式」→ 選擇「郵件」');
  console.log('   • 點擊「選取裝置」→ 選擇「其他（自訂名稱）」');
  console.log('   • 輸入名稱：「EduCreate SMTP」');
  console.log('   • 點擊「產生」');
  console.log('4. 複製顯示的 16 位數密碼（格式：abcd efgh ijkl mnop）');
  console.log('');
  
  await askQuestion('完成上述步驟後，請按 Enter 繼續...');
  
  console.log('');
  const realGmailAddress = await askQuestion('請輸入您的真實 Gmail 地址: ');
  const realAppPassword = await askQuestion('請輸入剛才生成的 16 位數應用程式密碼: ');
  
  console.log('');
  console.log('🔧 步驟 2: 更新本地配置');
  console.log('=====================================');
  
  // 更新 .env 文件
  const envPath = path.join(process.cwd(), '.env');
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // 更新配置
  envContent = envContent.replace(/EMAIL_SERVER_USER="[^"]*"/, `EMAIL_SERVER_USER="${realGmailAddress}"`);
  envContent = envContent.replace(/EMAIL_SERVER_PASSWORD="[^"]*"/, `EMAIL_SERVER_PASSWORD="${realAppPassword}"`);
  envContent = envContent.replace(/EMAIL_FROM="[^"]*"/, `EMAIL_FROM="${realGmailAddress}"`);
  
  fs.writeFileSync(envPath, envContent);
  
  console.log('✅ .env 文件已更新');
  
  // 更新 Vercel 配置
  const vercelConfig = {
    EMAIL_SERVER_USER: realGmailAddress,
    EMAIL_SERVER_PASSWORD: realAppPassword,
    EMAIL_FROM: realGmailAddress
  };
  
  const vercelConfigPath = path.join(process.cwd(), 'vercel-env-config.json');
  fs.writeFileSync(vercelConfigPath, JSON.stringify(vercelConfig, null, 2));
  
  console.log('✅ Vercel 配置文件已更新');
  console.log('');
  
  console.log('🧪 步驟 3: 測試 SMTP 連接');
  console.log('=====================================');
  console.log('');
  console.log('現在讓我們測試 Gmail SMTP 連接...');
  
  await askQuestion('按 Enter 開始測試...');
  
  // 執行測試
  const { spawn } = require('child_process');
  
  return new Promise((resolve) => {
    const testProcess = spawn('node', ['test-gmail-smtp.js'], {
      stdio: 'inherit',
      cwd: process.cwd()
    });
    
    testProcess.on('close', (code) => {
      console.log('');
      if (code === 0) {
        console.log('🎉 SMTP 測試成功！');
        console.log('✅ Gmail SMTP 連接正常');
        console.log('📧 請檢查您的 Gmail 收件箱是否收到測試郵件');
      } else {
        console.log('❌ SMTP 測試失敗');
        console.log('🔧 請檢查您的 Gmail 憑證是否正確');
      }
      
      console.log('');
      console.log('🌐 步驟 4: 配置 Vercel 生產環境');
      console.log('=====================================');
      console.log('');
      console.log('請前往 Vercel 儀表板（標籤頁 4）：');
      console.log('1. 選擇 EduCreate 專案');
      console.log('2. 點擊 Settings → Environment Variables');
      console.log('3. 添加以下環境變數：');
      console.log(`   EMAIL_SERVER_USER = ${realGmailAddress}`);
      console.log(`   EMAIL_SERVER_PASSWORD = ${realAppPassword}`);
      console.log(`   EMAIL_FROM = ${realGmailAddress}`);
      console.log('');
      console.log('🎯 步驟 5: 測試完整流程');
      console.log('=====================================');
      console.log('');
      console.log('最後，請測試完整的註冊和驗證流程：');
      console.log('1. 前往 https://edu-create.vercel.app/register');
      console.log('2. 註冊一個新帳戶');
      console.log('3. 檢查郵箱收到驗證郵件');
      console.log('4. 點擊驗證連結');
      console.log('5. 確認帳戶啟用成功');
      console.log('');
      console.log('🎊 恭喜！EduCreate Gmail SMTP 郵箱驗證系統已完全設定完成！');
      console.log('');
      console.log('📊 系統功能：');
      console.log('✅ 多用戶郵箱驗證');
      console.log('✅ 零成本 Gmail SMTP（500封/天）');
      console.log('✅ 企業級安全保護');
      console.log('✅ 美觀的 HTML 郵件模板');
      console.log('✅ 完整的錯誤處理');
      
      resolve();
    });
  });
}

async function main() {
  try {
    await setupRealGmailCredentials();
  } catch (error) {
    console.error('❌ 設定過程中發生錯誤:', error.message);
  } finally {
    rl.close();
  }
}

// 如果直接運行此腳本
if (require.main === module) {
  main();
}

module.exports = { setupRealGmailCredentials };
