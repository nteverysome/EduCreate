import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// 遊戲類型映射函數
function getGameDisplayName(gameTemplateId: string): string {
  const gameTypeMap: { [key: string]: string } = {
    'shimozurdo-game': 'Shimozurdo 雲朵遊戲',
    'airplane-vite': '飛機遊戲 (Vite版)',
    'matching-pairs': '配對記憶',
    'flash-cards': '閃卡記憶',
    'whack-mole': '打地鼠',
    'spin-wheel': '轉盤選擇',
    'memory-cards': '記憶卡片',
    'complete-sentence': '完成句子',
    'spell-word': '拼寫單詞',
    'labelled-diagram': '標籤圖表',
    'watch-memorize': '觀察記憶',
    'rank-order': '排序遊戲',
    'math-generator': '數學生成器',
    'word-magnets': '單詞磁鐵',
    'group-sort': '分類遊戲',
    'image-quiz': '圖片問答',
    'maze-chase': '迷宮追逐',
    'crossword-puzzle': '填字遊戲',
    'flying-fruit': '飛行水果',
    'flip-tiles': '翻轉方塊',
    'type-answer': '輸入答案',
    'anagram': '字母重組',
    'hangman': '猜字遊戲',
    'true-false': '是非題',
    'wordsearch': '找字遊戲',
    'match-up': '配對',
    'airplane': '飛機遊戲',
    'balloon-pop': '氣球遊戲',
    'open-box': '開箱遊戲',
    'gameshow-quiz': '競賽測驗',
    'random-wheel': '隨機轉盤',
    'random-cards': '隨機卡片',
    'speaking-cards': '語音卡片',
    'quiz': '測驗',
    'matching': '配對遊戲',
    'flashcards': '單字卡片',
    'flashcard': '單字卡片',
  };

  return gameTypeMap[gameTemplateId] || gameTemplateId;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const body = await request.json();
    const { title, gameTemplateId, vocabularyItems, questions, type, templateType } = body;

    // 驗證必要字段 - 支持 vocabularyItems 或 questions
    const isFlyingFruit = gameTemplateId === 'flying-fruit-game';
    // 允許空詞彙列表（minItems: 0 的遊戲如 runner-game）
    const hasContent = isFlyingFruit ? (questions && questions.length > 0) : true;

    if (!title || !gameTemplateId || !hasContent) {
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
    // Flying Fruit 遊戲使用 questions 數據結構，其他遊戲使用 vocabularyItems
    const contentData = isFlyingFruit ? questions : vocabularyItems;

    const activity = await prisma.activity.create({
      data: {
        userId: user.id,
        title: title,
        description: `使用 ${getGameDisplayName(gameTemplateId)} 遊戲學習詞彙`,
        type: type || (isFlyingFruit ? 'quiz_game' : 'vocabulary_game'),
        templateType: templateType || (isFlyingFruit ? 'quiz' : 'vocabulary'),
        content: {
          gameTemplateId,
          [isFlyingFruit ? 'questions' : 'vocabularyItems']: contentData
        },
        elements: isFlyingFruit ? [] : vocabularyItems,
        published: false,
        isPublic: false,
        isDraft: false,
        playCount: 0,
        shareCount: 0,
        difficulty: 'EASY',
        estimatedTime: '5-10 分鐘',
        tags: [gameTemplateId, isFlyingFruit ? 'quiz' : 'vocabulary', 'learning'],

        // 新增：直接設置詞彙相關字段
        geptLevel: 'ELEMENTARY',
        totalWords: contentData.length,

        // 新增：直接創建詞彙項目（包含所有圖片字段和語音字段）
        // Flying Fruit 不需要創建 vocabularyItems，因為它使用 questions 結構
        ...(isFlyingFruit ? {} : {
          vocabularyItems: {
            create: vocabularyItems.map((item: any) => ({
              english: item.english,
              chinese: item.chinese,
              phonetic: item.phonetic || null,
              difficultyLevel: item.difficultyLevel || 1,
              // 英文圖片字段
              imageId: item.imageId || null,
              imageUrl: item.imageUrl || null,
              imageSize: item.imageSize || null,
              // 中文圖片字段
              chineseImageId: item.chineseImageId || null,
              chineseImageUrl: item.chineseImageUrl || null,
              chineseImageSize: item.chineseImageSize || null,
              // 語音字段
              audioUrl: item.audioUrl || null
            }))
          }
        })
      },
      include: {
        vocabularyItems: !isFlyingFruit
      }
    });

    // 異步生成截圖（不等待完成，避免阻塞響應）
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://edu-create.vercel.app';
    fetch(`${baseUrl}/api/generate-screenshot`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || '' // 傳遞 session cookie
      },
      body: JSON.stringify({ activityId: activity.id })
    }).catch(err => {
      // 靜默處理錯誤，不影響活動創建
      console.error('⚠️ 截圖生成失敗（不影響活動創建）:', err.message);
    });

    console.log(`✅ 活動創建成功，已觸發截圖生成: ${activity.id}`);

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

    // 簡化查詢 - 直接獲取活動和詞彙信息（排除已刪除的活動）
    const activities = await prisma.activity.findMany({
      where: {
        userId: userId,
        deletedAt: null  // 只獲取未刪除的活動
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        templateType: true,
        content: true,
        isPublic: true,
        createdAt: true,
        updatedAt: true,
        playCount: true,
        shareCount: true,
        geptLevel: true,
        totalWords: true,
        folderId: true,
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
          _count: activity._count,
          folderId: activity.folderId, // ✅ 添加 folderId 字段
          isPublicShared: activity.isPublicShared, // ✅ 社區分享狀態
          shareToken: activity.shareToken, // ✅ 分享 token
          communityPlays: activity.communityPlays, // ✅ 社區遊玩次數
          elements: activity.elements, // ✅ 添加 elements 字段（詞彙數據）
          vocabularyItems: activity.vocabularyItems, // ✅ 添加 vocabularyItems 關聯數據
          thumbnailUrl: activity.thumbnailUrl, // ✅ 添加 thumbnailUrl 字段（活動截圖）
          screenshotStatus: activity.screenshotStatus, // ✅ 截圖狀態
          screenshotError: activity.screenshotError, // ✅ 截圖錯誤信息
          screenshotRetryCount: activity.screenshotRetryCount // ✅ 重試次數
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
