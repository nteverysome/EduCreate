import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const body = await request.json();
    const { title, gameTemplateId, vocabularyItems, type, templateType } = body;

    // 驗證必要字段
    if (!title || !gameTemplateId || !vocabularyItems || vocabularyItems.length === 0) {
      return NextResponse.json({ error: '缺少必要字段' }, { status: 400 });
    }

    // 獲取用戶
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: '用戶不存在' }, { status: 404 });
    }

    // 創建詞彙集合
    const vocabularySet = await prisma.vocabularySet.create({
      data: {
        userId: user.id,
        title: title,
        description: `為 ${gameTemplateId} 遊戲創建的詞彙集合`,
        geptLevel: 'ELEMENTARY',
        isPublic: false,
        totalWords: vocabularyItems.length,
        items: {
          create: vocabularyItems.map((item: any, index: number) => ({
            english: item.english,
            chinese: item.chinese,
            phonetic: item.phonetic || null,
            difficultyLevel: 1,
          }))
        }
      },
      include: {
        items: true
      }
    });

    // 創建活動
    const activity = await prisma.activity.create({
      data: {
        userId: user.id,
        title: title,
        description: `使用 ${gameTemplateId} 遊戲學習詞彙`,
        type: type || 'vocabulary_game',
        templateType: templateType || 'vocabulary',
        content: {
          gameTemplateId,
          vocabularySetId: vocabularySet.id,
          vocabularyItems: vocabularyItems
        },
        elements: vocabularyItems,
        published: false,
        isPublic: false,
        isDraft: false,
        playCount: 0,
        shareCount: 0,
        difficulty: 'EASY',
        estimatedTime: '5-10 分鐘',
        tags: [gameTemplateId, 'vocabulary', 'learning']
      }
    });

    return NextResponse.json({
      id: activity.id,
      title: activity.title,
      vocabularySetId: vocabularySet.id,
      message: '活動創建成功'
    });

  } catch (error) {
    console.error('創建活動時出錯:', error);
    return NextResponse.json(
      { error: '創建活動失敗' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    // 獲取用戶
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: '用戶不存在' }, { status: 404 });
    }

    // 獲取用戶的活動
    const activities = await prisma.activity.findMany({
      where: {
        userId: user.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        _count: {
          select: {
            versions: true
          }
        }
      }
    });

    return NextResponse.json(activities);

  } catch (error) {
    console.error('獲取活動時出錯:', error);
    return NextResponse.json(
      { error: '獲取活動失敗' },
      { status: 500 }
    );
  }
}
