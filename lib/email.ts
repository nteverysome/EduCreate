import nodemailer from 'nodemailer';

// 創建 Gmail SMTP 傳輸器（完全免費）
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_SERVER_USER, // your-gmail@gmail.com
    pass: process.env.EMAIL_SERVER_PASSWORD, // Gmail 應用程式密碼
  },
});

// 發送驗證郵件
export async function sendVerificationEmail(email: string, token: string) {
  // 修復域名問題：確保使用正確的生產域名
  const baseUrl = process.env.NEXTAUTH_URL?.includes('edu-create-hjhmrxr9h-minamisums-projects.vercel.app')
    ? 'https://edu-create.vercel.app'
    : (process.env.NEXTAUTH_URL || 'https://edu-create.vercel.app');

  const verificationUrl = `${baseUrl}/api/email/verify?token=${token}`;
  
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: '驗證您的 EduCreate 帳戶',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #4F46E5;">EduCreate</h1>
          <h2 style="color: #374151;">驗證您的電子郵件地址</h2>
        </div>
        
        <div style="background: #F9FAFB; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <p style="margin: 0; color: #374151;">
            感謝您註冊 EduCreate！請點擊下方按鈕來驗證您的電子郵件地址：
          </p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            驗證電子郵件
          </a>
        </div>
        
        <div style="border-top: 1px solid #E5E7EB; padding-top: 20px; margin-top: 30px;">
          <p style="color: #6B7280; font-size: 14px; margin: 0;">
            如果您無法點擊按鈕，請複製以下連結到瀏覽器：<br>
            <a href="${verificationUrl}" style="color: #4F46E5;">${verificationUrl}</a>
          </p>
          <p style="color: #6B7280; font-size: 14px; margin-top: 15px;">
            此連結將在 24 小時後過期。如果您沒有註冊 EduCreate 帳戶，請忽略此郵件。
          </p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ 驗證郵件發送成功:', email);
    return { success: true };
  } catch (error) {
    console.error('❌ 驗證郵件發送失敗:', error);
    return { success: false, error };
  }
}

// 發送歡迎郵件
export async function sendWelcomeEmail(email: string, name: string) {
  // 修復域名問題：確保使用正確的生產域名
  const baseUrl = process.env.NEXTAUTH_URL?.includes('edu-create-hjhmrxr9h-minamisums-projects.vercel.app')
    ? 'https://edu-create.vercel.app'
    : (process.env.NEXTAUTH_URL || 'https://edu-create.vercel.app');
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: '歡迎加入 EduCreate！',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #4F46E5;">🎉 歡迎加入 EduCreate！</h1>
        </div>
        
        <div style="background: #F0FDF4; padding: 20px; border-radius: 8px; border-left: 4px solid #10B981;">
          <p style="margin: 0; color: #374151;">
            親愛的 ${name}，<br><br>
            恭喜您成功驗證電子郵件並加入 EduCreate 大家庭！🎊
          </p>
        </div>
        
        <div style="margin: 30px 0;">
          <h3 style="color: #374151;">您現在可以：</h3>
          <ul style="color: #6B7280; line-height: 1.6;">
            <li>🎮 創建 25 種不同類型的記憶科學遊戲</li>
            <li>📚 管理您的詞彙和學習內容</li>
            <li>📊 追蹤學習進度和成效</li>
            <li>🌍 與其他學習者分享和協作</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${baseUrl}/dashboard"
             style="background: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            開始使用 EduCreate
          </a>
        </div>
        
        <div style="border-top: 1px solid #E5E7EB; padding-top: 20px; margin-top: 30px;">
          <p style="color: #6B7280; font-size: 14px; text-align: center;">
            如有任何問題，請隨時聯繫我們的支援團隊。<br>
            祝您學習愉快！❤️
          </p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ 歡迎郵件發送成功:', email);
    return { success: true };
  } catch (error) {
    console.error('❌ 歡迎郵件發送失敗:', error);
    return { success: false, error };
  }
}
