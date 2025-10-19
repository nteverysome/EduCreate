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

    // 獲取源活動（包含作者信息）
    const sourceActivity = await prisma.activity.findUnique({
      where: { id: sourceActivityId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!sourceActivity) {
      return NextResponse.json(
        { error: '源活動不存在' },
        { status: 404 }
      );
    }

    console.log('📋 源活動數據:', {
      id: sourceActivity.id,
      title: sourceActivity.title,
      hasContent: !!sourceActivity.content,
      hasElements: !!sourceActivity.elements,
      elementsType: typeof sourceActivity.elements,
      elementsLength: Array.isArray(sourceActivity.elements) ? sourceActivity.elements.length : 'not array',
    });

    // 準備複製的數據
    const copyData: any = {
      title: `${sourceActivity.title} (副本)`,
      description: sourceActivity.description,
      type: sourceActivity.type,
      templateType: sourceActivity.templateType,
      geptLevel: sourceActivity.geptLevel,
      tags: sourceActivity.tags,
      difficulty: sourceActivity.difficulty,
      estimatedTime: sourceActivity.estimatedTime,
      totalWords: sourceActivity.totalWords,
      userId: currentUser.id,
      shareToken: generateShareToken(),
      // 保存原作者信息
      originalAuthorId: sourceActivity.originalAuthorId || sourceActivity.userId,
      originalAuthorName: sourceActivity.originalAuthorName || sourceActivity.user.name,
      copiedFromActivityId: sourceActivityId,
    };

    // 複製 content（如果存在）
    if (sourceActivity.content) {
      copyData.content = sourceActivity.content;
    }

    // 複製 elements（如果存在）
    if (sourceActivity.elements) {
      copyData.elements = sourceActivity.elements;
    }

    console.log('📝 準備複製的數據:', {
      title: copyData.title,
      hasContent: !!copyData.content,
      hasElements: !!copyData.elements,
    });

    // 創建新活動（複製）
    const newActivity = await prisma.activity.create({
      data: copyData,
    });

    console.log('✅ 新活動已創建:', {
      id: newActivity.id,
      title: newActivity.title,
      hasContent: !!newActivity.content,
      hasElements: !!newActivity.elements,
    });

    // 異步生成截圖（不等待完成，避免阻塞響應）
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://edu-create.vercel.app';
    fetch(`${baseUrl}/api/generate-screenshot`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || '' // 傳遞 session cookie
      },
      body: JSON.stringify({ activityId: newActivity.id })
    }).catch(err => {
      // 靜默處理錯誤，不影響活動複製
      console.error('⚠️ 截圖生成失敗（不影響活動複製）:', err.message);
    });

    console.log(`✅ 已觸發截圖生成: ${newActivity.id}`);

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

