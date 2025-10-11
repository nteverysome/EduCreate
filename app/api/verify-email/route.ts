import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendWelcomeEmail } from '@/lib/email';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ message: '無效的驗證令牌' }, { status: 400 });
  }

  try {
    // 查找驗證令牌
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token }
    });

    if (!verificationToken) {
      return NextResponse.json({ message: '驗證令牌不存在或已過期' }, { status: 400 });
    }

    // 檢查令牌是否過期（24小時）
    const now = new Date();
    if (verificationToken.expires < now) {
      // 刪除過期令牌
      await prisma.verificationToken.delete({
        where: { token }
      });
      return NextResponse.json({ message: '驗證令牌已過期，請重新註冊' }, { status: 400 });
    }

    // 更新用戶的 emailVerified 狀態
    const user = await prisma.user.update({
      where: { email: verificationToken.identifier },
      data: { emailVerified: now }
    });

    // 刪除已使用的令牌
    await prisma.verificationToken.delete({
      where: { token }
    });

    // 發送歡迎郵件
    await sendWelcomeEmail(user.email, user.name || user.email.split('@')[0]);

    // 重定向到成功頁面
    return NextResponse.redirect(new URL('/auth/email-verified?success=true', request.url));

  } catch (error) {
    console.error('❌ 郵箱驗證錯誤:', error);
    return NextResponse.json({ message: '服務器錯誤' }, { status: 500 });
  }
}
