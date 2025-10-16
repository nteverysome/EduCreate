import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

/**
 * 支援的語言列表
 */
const SUPPORTED_LANGUAGES = [
  'zh-TW', // 繁體中文
  'zh-CN', // 简体中文
  'en',    // English
  'ja',    // 日本語
  'ko',    // 한국어
  'es',    // Español
  'fr',    // Français
  'de',    // Deutsch
  'it',    // Italiano
  'pt',    // Português
  'ru',    // Русский
  'ar',    // العربية
  'hi',    // हिन्दी
  'th',    // ไทย
  'vi',    // Tiếng Việt
];

/**
 * GET /api/user/language
 * 獲取當前用戶的語言設定
 */
export async function GET(request: NextRequest) {
  try {
    // 1. 驗證用戶身份
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '未授權' },
        { status: 401 }
      );
    }

    // 2. 查詢用戶語言設定
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
      select: {
        language: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: '用戶不存在' },
        { status: 404 }
      );
    }

    // 3. 返回語言設定
    return NextResponse.json({
      language: user.language || 'zh-TW',
    });
  } catch (error) {
    console.error('獲取語言設定失敗:', error);
    return NextResponse.json(
      { error: '獲取語言設定失敗' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/user/language
 * 更新當前用戶的語言設定
 */
export async function PATCH(request: NextRequest) {
  try {
    // 1. 驗證用戶身份
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '未授權' },
        { status: 401 }
      );
    }

    // 2. 解析請求數據
    const body = await request.json();
    const { language } = body;

    // 3. 驗證語言代碼
    if (!language) {
      return NextResponse.json(
        { error: '語言代碼為必填欄位' },
        { status: 400 }
      );
    }

    if (!SUPPORTED_LANGUAGES.includes(language)) {
      return NextResponse.json(
        { error: '不支援的語言代碼' },
        { status: 400 }
      );
    }

    // 4. 更新用戶語言設定
    const updatedUser = await prisma.user.update({
      where: {
        email: session.user.email,
      },
      data: {
        language,
        updatedAt: new Date(),
      },
      select: {
        language: true,
      },
    });

    // 5. 返回更新後的語言設定
    return NextResponse.json({
      language: updatedUser.language,
    });
  } catch (error) {
    console.error('更新語言設定失敗:', error);
    return NextResponse.json(
      { error: '更新語言設定失敗' },
      { status: 500 }
    );
  }
}

