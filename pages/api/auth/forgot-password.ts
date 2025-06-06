import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '只允許POST請求' });
  }

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: '電子郵件是必填的' });
    }

    // 檢查用戶是否存在
    const user = await prisma.user.findUnique({
      where: { email }
    });

    // 即使用戶不存在，也返回成功以防止枚舉攻擊
    if (!user) {
      return res.status(200).json({ message: '如果該郵箱已註冊，重置密碼鏈接將發送到您的郵箱' });
    }

    // 生成重置令牌
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1小時後過期

    // 保存重置令牌到數據庫 (暫時註釋掉，因為模型不存在)
    // await prisma.passwordReset.upsert({
    //   where: { userId: user.id },
    //   update: {
    //     token: resetToken,
    //     expires: resetTokenExpiry
    //   },
    //   create: {
    //     userId: user.id,
    //     token: resetToken,
    //     expires: resetTokenExpiry
    //   }
    // });

    // 發送重置郵件
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;

    // 配置郵件傳輸器
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
      secure: process.env.EMAIL_SERVER_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: '重置您的EduCreate密碼',
      text: `您好，\n\n請點擊以下鏈接重置您的密碼：\n${resetUrl}\n\n此鏈接將在1小時後過期。\n\n如果您沒有請求重置密碼，請忽略此郵件。\n\nEduCreate團隊`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4f46e5;">重置您的EduCreate密碼</h2>
          <p>您好，</p>
          <p>我們收到了重置您EduCreate帳戶密碼的請求。請點擊下面的按鈕重置您的密碼：</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">重置密碼</a>
          </div>
          <p>或者，您可以複製並粘貼以下URL到您的瀏覽器：</p>
          <p style="word-break: break-all;">${resetUrl}</p>
          <p>此鏈接將在1小時後過期。</p>
          <p>如果您沒有請求重置密碼，請忽略此郵件。</p>
          <p>謝謝，<br>EduCreate團隊</p>
        </div>
      `
    });

    return res.status(200).json({ message: '如果該郵箱已註冊，重置密碼鏈接將發送到您的郵箱' });
  } catch (error) {
    console.error('忘記密碼錯誤:', error);
    return res.status(500).json({ message: '服務器錯誤，請稍後再試' });
  }
}