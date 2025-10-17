import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/activities/copy
 * 複製活動到當前用戶的活動列表
 */
export async function POST(request: NextRequest) {
  try {
    // 驗證用戶身份
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '未授權：請先登入' },
        { status: 401 }
      );
    }

    // 獲取當前用戶
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: '用戶不存在' },
        { status: 404 }
      );
    }

    // 解析請求體
    const body = await request.json();
    const { sourceActivityId } = body;

    if (!sourceActivityId) {
      return NextResponse.json(
        { error: '缺少必要參數：sourceActivityId' },
        { status: 400 }
      );
    }

    // 獲取源活動
    const sourceActivity = await prisma.activity.findUnique({
      where: { id: sourceActivityId },
      include: {
        vocabularyItems: true,
      },
    });

    if (!sourceActivity) {
      return NextResponse.json(
        { error: '源活動不存在' },
        { status: 404 }
      );
    }

    // 創建新活動（複製）
    const newActivity = await prisma.activity.create({
      data: {
        title: `${sourceActivity.title} (副本)`,
        description: sourceActivity.description,
        type: sourceActivity.type,
        templateType: sourceActivity.templateType,
        geptLevel: sourceActivity.geptLevel,
        tags: sourceActivity.tags,
        userId: currentUser.id,
        shareToken: generateShareToken(),
        // 複製詞彙項目
        vocabularyItems: {
          create: sourceActivity.vocabularyItems.map((item) => ({
            word: item.word,
            translation: item.translation,
            pronunciation: item.pronunciation,
            example: item.example,
            imageUrl: item.imageUrl,
            audioUrl: item.audioUrl,
            order: item.order,
          })),
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: '活動複製成功',
      newActivityId: newActivity.id,
      newActivity: {
        id: newActivity.id,
        title: newActivity.title,
        templateType: newActivity.templateType,
      },
    });
  } catch (error) {
    console.error('❌ 複製活動時出錯:', error);
    return NextResponse.json(
      { error: '複製活動失敗', details: error instanceof Error ? error.message : '未知錯誤' },
      { status: 500 }
    );
  }
}

/**
 * 生成分享令牌
 */
function generateShareToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 16; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

