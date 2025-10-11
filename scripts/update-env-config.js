const fs = require('fs');
const path = require('path');

// 從互動式指南獲取的配置（示例）
const gmailConfig = {
  EMAIL_SERVER_HOST: "smtp.gmail.com",
  EMAIL_SERVER_PORT: "587",
  EMAIL_SERVER_USER: "demo@gmail.com", // 替換為實際的 Gmail 地址
  EMAIL_SERVER_PASSWORD: "abcd efgh ijkl mnop", // 替換為實際的應用程式密碼
  EMAIL_SERVER_SECURE: "true",
  EMAIL_FROM: "demo@gmail.com" // 替換為實際的 Gmail 地址
};

function updateEnvFile() {
  console.log('🔧 更新 .env 文件...');
  
  const envPath = path.join(process.cwd(), '.env');
  let envContent = '';
  
  // 讀取現有的 .env 文件
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
    console.log('✅ 找到現有的 .env 文件');
  } else {
    console.log('⚠️ 未找到 .env 文件，將創建新文件');
  }
  
  // 更新或添加郵件配置
  Object.entries(gmailConfig).forEach(([key, value]) => {
    const regex = new RegExp(`^${key}=.*$`, 'm');
    const newLine = `${key}="${value}"`;
    
    if (regex.test(envContent)) {
      envContent = envContent.replace(regex, newLine);
      console.log(`✅ 更新 ${key}`);
    } else {
      envContent += `\n${newLine}`;
      console.log(`✅ 添加 ${key}`);
    }
  });
  
  // 寫入文件
  fs.writeFileSync(envPath, envContent);
  console.log('🎉 .env 文件更新完成！');
}

function generateVercelConfig() {
  console.log('🌐 生成 Vercel 環境變數配置...');
  
  const vercelConfig = {
    EMAIL_SERVER_USER: gmailConfig.EMAIL_SERVER_USER,
    EMAIL_SERVER_PASSWORD: gmailConfig.EMAIL_SERVER_PASSWORD,
    EMAIL_FROM: gmailConfig.EMAIL_FROM
  };
  
  const configPath = path.join(process.cwd(), 'vercel-env-config.json');
  fs.writeFileSync(configPath, JSON.stringify(vercelConfig, null, 2));
  
  console.log('✅ Vercel 配置已生成: vercel-env-config.json');
  console.log('📋 請在 Vercel 中添加以下環境變數：');
  
  Object.entries(vercelConfig).forEach(([key, value]) => {
    console.log(`   ${key} = ${value}`);
  });
}

function createTestScript() {
  console.log('🧪 創建測試腳本...');
  
  const testScript = `
const nodemailer = require('nodemailer');
require('dotenv').config();

async function testGmailSMTP() {
  console.log('🧪 測試 Gmail SMTP 連接...');
  
  const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  });
  
  try {
    // 驗證連接
    await transporter.verify();
    console.log('✅ Gmail SMTP 連接成功！');
    
    // 發送測試郵件
    const testEmail = {
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_SERVER_USER, // 發送給自己
      subject: '🎉 EduCreate SMTP 測試成功',
      html: \`
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #007bff;">🎉 Gmail SMTP 設定成功！</h1>
          <p>恭喜！您的 EduCreate 郵箱驗證系統已準備就緒。</p>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>✅ 設定完成項目：</h3>
            <ul>
              <li>Gmail SMTP 連接 ✅</li>
              <li>應用程式密碼配置 ✅</li>
              <li>郵件發送功能 ✅</li>
              <li>HTML 郵件模板 ✅</li>
            </ul>
          </div>
          <p>現在您可以在 EduCreate 中測試註冊功能了！</p>
          <a href="https://edu-create.vercel.app/register" 
             style="background: #007bff; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            測試註冊功能
          </a>
        </div>
      \`
    };
    
    const result = await transporter.sendMail(testEmail);
    console.log('✅ 測試郵件發送成功！');
    console.log('📧 郵件 ID:', result.messageId);
    console.log('📬 請檢查您的 Gmail 收件箱');
    
  } catch (error) {
    console.error('❌ 測試失敗:', error.message);
    console.log('🔧 請檢查以下設定：');
    console.log('   1. Gmail 地址是否正確');
    console.log('   2. 應用程式密碼是否正確（16位數）');
    console.log('   3. 兩步驟驗證是否已啟用');
    console.log('   4. .env 文件是否正確配置');
  }
}

testGmailSMTP();
`;
  
  const testPath = path.join(process.cwd(), 'test-gmail-smtp.js');
  fs.writeFileSync(testPath, testScript);
  
  console.log('✅ 測試腳本已創建: test-gmail-smtp.js');
}

function main() {
  console.log('🚀 EduCreate Gmail SMTP 自動配置');
  console.log('=====================================');
  
  try {
    updateEnvFile();
    generateVercelConfig();
    createTestScript();
    
    console.log('\n🎉 配置完成！');
    console.log('=====================================');
    console.log('📋 下一步操作：');
    console.log('1. 編輯 .env 文件，替換為真實的 Gmail 憑證');
    console.log('2. 運行測試: npm install dotenv && node test-gmail-smtp.js');
    console.log('3. 在 Vercel 中設定環境變數');
    console.log('4. 重新部署應用程式');
    console.log('5. 測試註冊功能');
    
  } catch (error) {
    console.error('❌ 配置失敗:', error.message);
  }
}

// 如果直接運行此腳本
if (require.main === module) {
  main();
}

module.exports = {
  updateEnvFile,
  generateVercelConfig,
  createTestScript,
  gmailConfig
};
