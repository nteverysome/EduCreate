import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const activityId = params.id;

    // 獲取活動和相關的詞彙數據
    const activity = await prisma.activity.findUnique({
      where: {
        id: activityId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!activity) {
      return NextResponse.json({ error: '活動不存在' }, { status: 404 });
    }

    // 🔥 修復：允許公開訪問（用於遊戲播放）
    // 如果用戶已登錄，檢查權限
    if (session?.user?.email) {
      // 已登錄用戶：只能訪問自己的活動或公開活動
      if (activity.user.email !== session.user.email && !activity.isPublic) {
        return NextResponse.json({ error: '無權限訪問此活動' }, { status: 403 });
      }
    } else {
      // 未登錄用戶：只能訪問公開活動
      if (!activity.isPublic) {
        return NextResponse.json({ error: '此活動不是公開的' }, { status: 403 });
      }
    }

    // 從活動內容中獲取詞彙集合 ID
    const content = activity.content as any;
    const vocabularySetId = content?.vocabularySetId;

    let vocabularyItems = [];

    if (vocabularySetId) {
      // 從詞彙集合中獲取詞彙
      const vocabularySet = await prisma.vocabularySet.findUnique({
        where: {
          id: vocabularySetId
        },
        include: {
          items: true
        }
      });

      if (vocabularySet) {
        vocabularyItems = vocabularySet.items.map(item => ({
          id: item.id,
          english: item.english,
          chinese: item.chinese,
          phonetic: item.phonetic,
          partOfSpeech: item.partOfSpeech,
          difficultyLevel: item.difficultyLevel,
          exampleSentence: item.exampleSentence,
          notes: item.notes,
          imageUrl: item.imageUrl,
          audioUrl: item.audioUrl
        }));
      }
    } else if (content?.vocabularyItems && content.vocabularyItems.length > 0) {
      // 從活動內容中直接獲取詞彙（向後兼容）
      vocabularyItems = content.vocabularyItems;
    } else if (activity.elements && Array.isArray(activity.elements) && activity.elements.length > 0) {
      // 從 elements 字段獲取詞彙（向後兼容）
      vocabularyItems = activity.elements as any[];
    }

    return NextResponse.json({
      activity: {
        id: activity.id,
        title: activity.title,
        description: activity.description,
        type: activity.type,
        templateType: activity.templateType,
        gameTemplateId: content?.gameTemplateId,
        difficulty: activity.difficulty,
        estimatedTime: activity.estimatedTime,
        tags: activity.tags,
        createdAt: activity.createdAt,
        updatedAt: activity.updatedAt,
        playCount: activity.playCount
      },
      vocabularyItems: vocabularyItems,
      totalItems: vocabularyItems.length
    });

  } catch (error) {
    console.error('獲取活動詞彙時出錯:', error);
    return NextResponse.json(
      { error: '獲取活動詞彙失敗' },
      { status: 500 }
    );
  }
}
