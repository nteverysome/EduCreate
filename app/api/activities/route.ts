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

    // 簡化創建邏輯 - 一次事務創建 Activity 和 VocabularyItem
    const activity = await prisma.activity.create({
      data: {
        userId: user.id,
        title: title,
        description: `使用 ${gameTemplateId} 遊戲學習詞彙`,
        type: type || 'vocabulary_game',
        templateType: templateType || 'vocabulary',
        content: {
          gameTemplateId,
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
        tags: [gameTemplateId, 'vocabulary', 'learning'],

        // 新增：直接設置詞彙相關字段
        geptLevel: 'ELEMENTARY',
        totalWords: vocabularyItems.length,

        // 新增：直接創建詞彙項目
        vocabularyItems: {
          create: vocabularyItems.map((item: any) => ({
            english: item.english,
            chinese: item.chinese,
            phonetic: item.phonetic || null,
            difficultyLevel: item.difficultyLevel || 1
          }))
        }
      },
      include: {
        vocabularyItems: true
      }
    });

    return NextResponse.json({
      id: activity.id,
      title: activity.title,
      totalWords: activity.totalWords,
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

    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const userId = session.user.id;
    console.log('🔍 GET /api/activities 調用:', { userId });

    // 簡化查詢 - 直接獲取活動和詞彙信息
    const activities = await prisma.activity.findMany({
      where: {
        userId: userId
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        vocabularyItems: true,
        _count: {
          select: {
            versions: true,
            vocabularyItems: true
          }
        }
      }
    });

    console.log(`✅ 找到 ${activities.length} 個活動`);

    // 簡化活動數據處理
    const activitiesWithVocabulary = activities.map((activity) => {
      // 優先使用新的字段，回退到舊的邏輯
      const vocabularyInfo = {
        totalWords: activity.totalWords || activity._count.vocabularyItems || 0,
        geptLevel: activity.geptLevel || 'ELEMENTARY'
      };

      return {
          id: activity.id,
          title: activity.title,
          description: activity.description,
          type: activity.type,
          templateType: activity.templateType,
          content: activity.content,
          isPublic: activity.isPublic,
          createdAt: activity.createdAt,
          updatedAt: activity.updatedAt,
          playCount: activity.playCount,
          difficulty: activity.difficulty,
          estimatedTime: activity.estimatedTime,
          tags: activity.tags,
          vocabularyInfo: vocabularyInfo,
          _count: activity._count
        };
      });

    return NextResponse.json({
      success: true,
      data: activitiesWithVocabulary
    });

  } catch (error) {
    console.error('獲取活動時出錯:', error);
    return NextResponse.json(
      { error: '獲取活動失敗' },
      { status: 500 }
    );
  }
}
