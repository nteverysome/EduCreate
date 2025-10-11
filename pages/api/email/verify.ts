import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { sendWelcomeEmail } from '../../../lib/email';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('🔍 驗證端點被調用:', {
    method: req.method,
    query: req.query,
    timestamp: new Date().toISOString()
  });

  if (req.method !== 'GET') {
    console.log('❌ 不支援的請求方法:', req.method);
    return res.status(405).json({ message: '只允許 GET 請求' });
  }

  const { token } = req.query;

  if (!token || typeof token !== 'string') {
    console.log('❌ 無效的驗證令牌:', token);
    return res.status(400).json({ message: '無效的驗證令牌' });
  }

  try {
    console.log('🔍 查找驗證令牌:', token);
    
    // 查找驗證令牌
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token }
    });

    if (!verificationToken) {
      console.log('❌ 驗證令牌不存在:', token);
      return res.status(400).json({ message: '驗證令牌不存在或已過期' });
    }

    console.log('✅ 找到驗證令牌:', {
      identifier: verificationToken.identifier,
      expires: verificationToken.expires
    });

    // 檢查令牌是否過期（24小時）
    const now = new Date();
    if (verificationToken.expires < now) {
      console.log('❌ 驗證令牌已過期:', {
        expires: verificationToken.expires,
        now: now
      });
      
      // 刪除過期令牌
      await prisma.verificationToken.delete({
        where: { token }
      });
      return res.status(400).json({ message: '驗證令牌已過期，請重新註冊' });
    }

    console.log('🔄 更新用戶驗證狀態...');
    
    // 更新用戶的 emailVerified 狀態
    const user = await prisma.user.update({
      where: { email: verificationToken.identifier },
      data: { emailVerified: now }
    });

    console.log('✅ 用戶驗證狀態已更新:', {
      email: user.email,
      emailVerified: user.emailVerified
    });

    // 刪除已使用的令牌
    await prisma.verificationToken.delete({
      where: { token }
    });

    console.log('🗑️ 驗證令牌已刪除');

    // 發送歡迎郵件
    try {
      await sendWelcomeEmail(user.email, user.name || user.email.split('@')[0]);
      console.log('📧 歡迎郵件已發送');
    } catch (emailError) {
      console.error('⚠️ 歡迎郵件發送失敗:', emailError);
      // 不影響驗證流程
    }

    // 返回成功頁面的 HTML
    const successHtml = `
    <!DOCTYPE html>
    <html lang="zh-TW">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>郵箱驗證成功 - EduCreate</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                margin: 0;
                padding: 20px;
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .container {
                background: white;
                border-radius: 12px;
                padding: 40px;
                text-align: center;
                box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                max-width: 500px;
                width: 100%;
            }
            .success-icon {
                font-size: 64px;
                color: #10B981;
                margin-bottom: 20px;
            }
            h1 {
                color: #1F2937;
                margin-bottom: 16px;
                font-size: 28px;
            }
            p {
                color: #6B7280;
                margin-bottom: 30px;
                line-height: 1.6;
            }
            .btn {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 12px 30px;
                border: none;
                border-radius: 8px;
                font-size: 16px;
                cursor: pointer;
                text-decoration: none;
                display: inline-block;
                transition: transform 0.2s;
            }
            .btn:hover {
                transform: translateY(-2px);
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="success-icon">✅</div>
            <h1>郵箱驗證成功！</h1>
            <p>恭喜您！您的 EduCreate 帳戶已成功驗證。<br>
            歡迎郵件已發送到您的信箱，您現在可以開始使用所有功能了。</p>
            <a href="/login" class="btn">立即登入</a>
        </div>
        <script>
            // 3秒後自動跳轉到登入頁面
            setTimeout(() => {
                window.location.href = '/login';
            }, 3000);
        </script>
    </body>
    </html>
    `;

    console.log('✅ 驗證成功，返回成功頁面');
    return res.status(200).setHeader('Content-Type', 'text/html').send(successHtml);

  } catch (error) {
    console.error('❌ 郵箱驗證錯誤:', error);
    return res.status(500).json({ message: '服務器錯誤' });
  }
}
