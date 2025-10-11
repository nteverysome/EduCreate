import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { sendVerificationEmail } from '../../../lib/email';
import crypto from 'crypto';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('🔄 重發驗證郵件端點被調用:', {
    method: req.method,
    body: req.body,
    timestamp: new Date().toISOString()
  });

  if (req.method !== 'POST') {
    console.log('❌ 不支援的請求方法:', req.method);
    return res.status(405).json({ message: '只允許 POST 請求' });
  }

  const { email } = req.body;

  if (!email || typeof email !== 'string') {
    console.log('❌ 無效的郵箱地址:', email);
    return res.status(400).json({ message: '請提供有效的郵箱地址' });
  }

  try {
    console.log('🔍 查找用戶:', email);
    
    // 檢查用戶是否存在
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.log('❌ 用戶不存在:', email);
      // 為了安全，不透露用戶是否存在
      return res.status(200).json({ 
        message: '如果該郵箱已註冊且未驗證，驗證郵件將重新發送',
        success: true 
      });
    }

    // 檢查用戶是否已經驗證
    if (user.emailVerified) {
      console.log('✅ 用戶已經驗證:', email);
      return res.status(200).json({ 
        message: '該郵箱已經驗證，無需重發驗證郵件',
        success: true,
        alreadyVerified: true
      });
    }

    console.log('🔄 用戶未驗證，準備重發驗證郵件');

    // 刪除現有的驗證令牌（如果有）
    await prisma.verificationToken.deleteMany({
      where: { identifier: email }
    });

    console.log('🗑️ 已刪除舊的驗證令牌');

    // 生成新的驗證令牌
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const expires = new Date();
    expires.setHours(expires.getHours() + 24); // 24小時後過期

    // 保存新的驗證令牌
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: verificationToken,
        expires,
      }
    });

    console.log('✅ 新驗證令牌已創建');

    // 發送驗證郵件
    const emailResult = await sendVerificationEmail(email, verificationToken);

    if (!emailResult.success) {
      console.error('❌ 驗證郵件發送失敗:', emailResult.error);
      return res.status(500).json({ 
        message: '驗證郵件發送失敗，請稍後再試',
        success: false 
      });
    }

    console.log('✅ 驗證郵件重發成功:', email);

    return res.status(200).json({
      message: '驗證郵件已重新發送，請檢查您的信箱',
      success: true,
      emailSent: true
    });

  } catch (error) {
    console.error('❌ 重發驗證郵件錯誤:', error);
    return res.status(500).json({ 
      message: '服務器錯誤，請稍後再試',
      success: false 
    });
  }
}
