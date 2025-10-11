const fs = require('fs');
const path = require('path');
const readline = require('readline');

// 創建讀取介面
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 提示用戶輸入
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function setupGmailSMTP() {
  console.log('🚀 EduCreate Gmail SMTP 設定助手');
  console.log('=====================================');
  
  try {
    // 1. 收集用戶資訊
    console.log('\n📧 步驟 1: 收集 Gmail 資訊');
    const gmailAddress = await askQuestion('請輸入您的 Gmail 地址: ');
    
    console.log('\n🔑 步驟 2: 應用程式密碼');
    console.log('請按照以下步驟生成 Gmail 應用程式密碼：');
    console.log('1. 前往 https://myaccount.google.com/');
    console.log('2. 點擊「安全性」');
    console.log('3. 確保「兩步驟驗證」已啟用');
    console.log('4. 點擊「應用程式密碼」');
    console.log('5. 選擇「郵件」→「其他」→ 輸入「EduCreate SMTP」');
    console.log('6. 複製生成的 16 位數密碼');
    
    const appPassword = await askQuestion('\n請輸入生成的應用程式密碼 (16位數): ');
    
    // 2. 驗證輸入
    if (!gmailAddress.includes('@gmail.com')) {
      throw new Error('請輸入有效的 Gmail 地址');
    }
    
    if (appPassword.length !== 16) {
      throw new Error('應用程式密碼應該是 16 位數');
    }
    
    // 3. 更新 .env 文件
    console.log('\n📝 步驟 3: 更新環境配置');
    
    const envPath = path.join(process.cwd(), '.env');
    let envContent = '';
    
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }
    
    // 更新郵件配置
    const emailConfig = `
# Gmail SMTP 郵件配置（免費方案）
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="${gmailAddress}"
EMAIL_SERVER_PASSWORD="${appPassword}"
EMAIL_SERVER_SECURE="true"
EMAIL_FROM="${gmailAddress}"
`;
    
    // 替換現有的郵件配置
    const emailConfigRegex = /# Gmail SMTP 郵件配置[\s\S]*?EMAIL_FROM="[^"]*"/;
    
    if (emailConfigRegex.test(envContent)) {
      envContent = envContent.replace(emailConfigRegex, emailConfig.trim());
    } else {
      envContent += emailConfig;
    }
    
    // 寫入文件
    fs.writeFileSync(envPath, envContent);
    
    console.log('✅ .env 文件已更新');
    
    // 4. 生成 Vercel 環境變數配置
    console.log('\n🌐 步驟 4: 生產環境配置');
    
    const vercelEnvConfig = {
      EMAIL_SERVER_HOST: "smtp.gmail.com",
      EMAIL_SERVER_PORT: "587",
      EMAIL_SERVER_USER: gmailAddress,
      EMAIL_SERVER_PASSWORD: appPassword,
      EMAIL_SERVER_SECURE: "true",
      EMAIL_FROM: gmailAddress
    };
    
    const vercelConfigPath = path.join(process.cwd(), 'vercel-env-config.json');
    fs.writeFileSync(vercelConfigPath, JSON.stringify(vercelEnvConfig, null, 2));
    
    console.log('✅ Vercel 環境變數配置已生成: vercel-env-config.json');
    
    // 5. 生成測試腳本
    console.log('\n🧪 步驟 5: 生成測試腳本');
    
    const testScript = `
const nodemailer = require('nodemailer');

async function testEmailSending() {
  console.log('🧪 測試 Gmail SMTP 連接...');
  
  const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: '${gmailAddress}',
      pass: '${appPassword}',
    },
  });
  
  try {
    // 驗證連接
    await transporter.verify();
    console.log('✅ Gmail SMTP 連接成功！');
    
    // 發送測試郵件
    const testEmail = {
      from: '${gmailAddress}',
      to: '${gmailAddress}',
      subject: 'EduCreate SMTP 測試',
      html: '<h1>🎉 Gmail SMTP 設定成功！</h1><p>您的 EduCreate 郵箱驗證系統已準備就緒。</p>'
    };
    
    const result = await transporter.sendMail(testEmail);
    console.log('✅ 測試郵件發送成功！', result.messageId);
    
  } catch (error) {
    console.error('❌ 測試失敗:', error.message);
  }
}

testEmailSending();
`;
    
    const testScriptPath = path.join(process.cwd(), 'test-gmail-smtp.js');
    fs.writeFileSync(testScriptPath, testScript);
    
    console.log('✅ 測試腳本已生成: test-gmail-smtp.js');
    
    // 6. 顯示完成信息
    console.log('\n🎉 Gmail SMTP 設定完成！');
    console.log('=====================================');
    console.log('📋 下一步操作：');
    console.log('1. 運行測試: node test-gmail-smtp.js');
    console.log('2. 在 Vercel 中設定環境變數（使用 vercel-env-config.json）');
    console.log('3. 重新部署應用程式');
    console.log('4. 測試註冊功能的郵箱驗證');
    
    console.log('\n🔧 Vercel 環境變數設定：');
    Object.entries(vercelEnvConfig).forEach(([key, value]) => {
      console.log(`${key}=${value}`);
    });
    
  } catch (error) {
    console.error('❌ 設定失敗:', error.message);
  } finally {
    rl.close();
  }
}

// 執行設定
setupGmailSMTP();
