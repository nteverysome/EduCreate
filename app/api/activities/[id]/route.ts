import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// 🔥 CORS 头配置
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

// 🔥 OPTIONS 处理 (CORS preflight)
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授權' }, {
        status: 401,
        headers: corsHeaders,
      });
    }

    const activityId = params.id;
    const userId = session.user.id;

    console.log('🔍 DELETE API 調用:', {
      activityId,
      userId,
      sessionUser: session.user
    });

    // 檢查活動是否存在且屬於該用戶（排除已刪除的活動）
    const activity = await prisma.activity.findFirst({
      where: {
        id: activityId,
        userId: userId,
        deletedAt: null  // 只能刪除未刪除的活動
      }
    });

    if (!activity) {
      console.log('❌ 活動不存在、無權限或已刪除:', { activityId, userId });
      return NextResponse.json({ error: '活動不存在或無權限刪除' }, {
        status: 404,
        headers: corsHeaders,
      });
    }

    // 軟刪除 - 設置 deletedAt 時間戳，並同步取消社區發布
    console.log('🗑️ 軟刪除活動:', activityId);

    // 檢查活動是否已發布到社區
    if (activity.isPublicShared) {
      console.log('📢 活動已發布到社區，將同步取消發布');
    }

    const deletedActivity = await prisma.activity.update({
      where: { id: activityId },
      data: {
        deletedAt: new Date(),  // 設置刪除時間戳
        // 如果活動已發布到社區，同步取消發布
        ...(activity.isPublicShared ? {
          isPublicShared: false,
          publishedToCommunityAt: null,
          communityCategory: null,
          communityTags: [],
          communityDescription: null,
          communityThumbnail: null,
        } : {})
      }
    });

    console.log('✅ 活動已移至回收桶');
    if (activity.isPublicShared) {
      console.log('✅ 已同步取消社區發布');
    }

    return NextResponse.json({
      message: '活動已移至回收桶',
      deletedActivityId: activityId,
      deletedAt: deletedActivity.deletedAt
    }, {
      headers: corsHeaders,
    });

  } catch (error) {
    console.error('刪除活動時出錯:', error);
    return NextResponse.json(
      { error: '刪除活動失敗', details: error instanceof Error ? error.message : '未知錯誤' },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const activityId = params.id;

    // 🔥 修復：支持公開訪問（當活動是公開的時）
    // 首先嘗試獲取活動（不限制用戶）
    // 使用 select 而不是 include，以避免訪問不存在的列
    const activity = await prisma.activity.findUnique({
      where: {
        id: activityId
      },
      select: {
        id: true,
        title: true,
        description: true,
        elements: true,
        content: true,
        matchUpOptions: true,
        createdAt: true,
        updatedAt: true,
        communityDescription: true,
        communityTags: true,
        communityCategory: true,
        geptLevel: true,
        templateType: true,
        tags: true,
        copiedFromActivityId: true,
        originalAuthorId: true,
        originalAuthorName: true,
        isPublic: true,
        shareToken: true,
        gameSettings: true,
        vocabularyItems: true,
        versions: {
          orderBy: { createdAt: 'desc' as const }
        },
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        _count: {
          select: {
            versions: true
          }
        }
      }
    });

    if (!activity) {
      return NextResponse.json({ error: '活動不存在' }, {
        status: 404,
        headers: corsHeaders,
      });
    }

    // 🔥 修復：允許任何人訪問任何活動（用於遊戲播放）
    // 注意：這允許公開訪問所有活動的詞彙數據
    // 如果需要隱私保護，應該在前端實現訪問控制或使用分享 token
    console.log('✅ 允許公開訪問活動:', {
      activityId,
      isAuthenticated: !!session?.user?.id,
      activityTitle: activity.title,
      vocabularyItemsCount: activity.vocabularyItems?.length || 0,
      hasElements: !!activity.elements,
      hasContent: !!activity.content
    });

    // 轉換 GameSettings 到 gameOptions 格式
    let gameOptions = null;
    if (activity.gameSettings) {
      const gs = activity.gameSettings;

      // 轉換 Timer
      let timer: any = { type: 'countUp', minutes: 5, seconds: 0 };
      if (gs.timerType === 'NONE') {
        timer = { type: 'none', minutes: 0, seconds: 0 };
      } else if (gs.timerType === 'COUNT_UP') {
        const totalSeconds = gs.timerDuration || 300;
        timer = {
          type: 'countUp',
          minutes: Math.floor(totalSeconds / 60),
          seconds: totalSeconds % 60
        };
      } else if (gs.timerType === 'COUNT_DOWN') {
        const totalSeconds = gs.timerDuration || 300;
        timer = {
          type: 'countDown',
          minutes: Math.floor(totalSeconds / 60),
          seconds: totalSeconds % 60
        };
      }

      gameOptions = {
        timer,
        lives: gs.livesCount || 5,
        speed: gs.speed || 3,  // 從 GameSettings 讀取 speed
        random: gs.shuffleQuestions ?? true,
        showAnswers: gs.showAnswers ?? true,
        visualStyle: gs.visualStyle || 'clouds'  // 從 GameSettings 讀取 visualStyle
      };

      console.log('✅ [GET] GameSettings 轉換為 gameOptions:', gameOptions);
    }

    // 返回活動數據，包含 gameOptions、matchUpOptions 和 flyingFruitOptions
    const responseData: any = {
      ...activity,
      gameOptions,
      matchUpOptions: activity.matchUpOptions || null,  // 🔥 添加 matchUpOptions
    };

    // 🔥 安全地添加 flyingFruitOptions（如果數據庫列存在）
    try {
      if ((activity as any).flyingFruitOptions) {
        responseData.flyingFruitOptions = (activity as any).flyingFruitOptions;
      } else {
        responseData.flyingFruitOptions = null;
      }
    } catch (e) {
      // 如果列不存在，設置為 null
      responseData.flyingFruitOptions = null;
    }

    return NextResponse.json(responseData, {
      headers: corsHeaders,
    });

  } catch (error) {
    console.error('獲取活動詳情時出錯:', error);
    return NextResponse.json(
      { error: '獲取活動詳情失敗', details: error instanceof Error ? error.message : '未知錯誤' },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}

// PATCH 方法：用於部分更新（例如重新命名）
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const activityId = params.id;
    const userId = session.user.id;
    const body = await request.json();

    console.log('🔍 PATCH API 調用:', {
      activityId,
      userId,
      body
    });

    // 檢查活動是否存在且屬於該用戶
    const existingActivity = await prisma.activity.findFirst({
      where: {
        id: activityId,
        userId: userId
      }
    });

    if (!existingActivity) {
      console.log('❌ 活動不存在或無權限:', { activityId, userId });
      return NextResponse.json({ error: '活動不存在或無權限編輯' }, { status: 404 });
    }

    // 更新活動（只更新提供的字段）
    const updateData: any = {
      updatedAt: new Date()
    };

    // 如果有 title，只更新 title
    if (body.title !== undefined) {
      updateData.title = body.title;
    }

    // 如果有 communityTags，更新社區標籤
    if (body.communityTags !== undefined) {
      updateData.communityTags = body.communityTags;
    }

    // 如果有 communityCategory，更新社區分類
    if (body.communityCategory !== undefined) {
      updateData.communityCategory = body.communityCategory;
    }

    // 如果有 communityDescription，更新社區描述
    if (body.communityDescription !== undefined) {
      updateData.communityDescription = body.communityDescription;
    }

    // 更新活動
    const updatedActivity = await prisma.activity.update({
      where: {
        id: activityId
      },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    });

    console.log('✅ 活動部分更新成功:', updatedActivity.title);

    return NextResponse.json(updatedActivity);

  } catch (error) {
    console.error('部分更新活動時出錯:', error);
    return NextResponse.json(
      { error: '更新活動失敗' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const activityId = params.id;
    const body = await request.json();

    // 🔥 [v53.0] 允許未登錄用戶保存遊戲選項（matchUpOptions 或 flyingFruitOptions）
    // 但不允許編輯活動內容（title, vocabularyItems）
    const isOnlyGameOptions = (body.matchUpOptions !== undefined || body.flyingFruitOptions !== undefined) &&
                              !body.title &&
                              !body.vocabularyItems;

    if (isOnlyGameOptions) {
      console.log('🎮 [v53.0] 允許未登錄用戶保存遊戲選項:', {
        activityId,
        matchUpOptions: body.matchUpOptions,
        flyingFruitOptions: body.flyingFruitOptions,
        isAuthenticated: !!session?.user?.id
      });

      try {
        // 直接保存到 Activity 的選項字段
        const updateData: any = { updatedAt: new Date() };
        if (body.matchUpOptions !== undefined) {
          updateData.matchUpOptions = body.matchUpOptions;
        }
        if (body.flyingFruitOptions !== undefined) {
          updateData.flyingFruitOptions = body.flyingFruitOptions;
        }

        const updatedActivity = await prisma.activity.update({
          where: { id: activityId },
          data: updateData
        });

        console.log('✅ [v53.0] 遊戲選項保存成功:', {
          activityId,
          matchUpOptions: updatedActivity.matchUpOptions,
          flyingFruitOptions: (updatedActivity as any).flyingFruitOptions
        });

        return NextResponse.json({
          success: true,
          activity: updatedActivity,
          matchUpOptions: updatedActivity.matchUpOptions,
          flyingFruitOptions: (updatedActivity as any).flyingFruitOptions
        }, {
          headers: corsHeaders,
        });
      } catch (error) {
        console.error('❌ [v53.0] 保存遊戲選項失敗:', error);
        return NextResponse.json(
          { error: '保存遊戲選項失敗' },
          { status: 500, headers: corsHeaders }
        );
      }
    }

    // 其他操作需要認證
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授權' }, {
        status: 401,
        headers: corsHeaders,
      });
    }

    const userId = session.user.id;

    console.log('🔍 PUT API 調用:', {
      activityId,
      userId,
      body
    });

    // 檢查活動是否存在且屬於該用戶
    const existingActivity = await prisma.activity.findFirst({
      where: {
        id: activityId,
        userId: userId
      }
    });

    if (!existingActivity) {
      console.log('❌ 活動不存在或無權限:', { activityId, userId });
      return NextResponse.json({ error: '活動不存在或無權限編輯' }, { status: 404 });
    }

    // 更新活動
    const updateData: any = {
      updatedAt: new Date()
    };

    // 🔥 檢查是否是 Flying Fruit 遊戲
    const isFlyingFruit = body.gameTemplateId === 'flying-fruit-game';

    // 如果有 title，更新 title 和詞彙/問題數據
    if (body.title !== undefined) {
      updateData.title = body.title;

      if (isFlyingFruit) {
        // Flying Fruit 遊戲：保存 questions 數據
        updateData.type = 'quiz_game';
        updateData.templateType = 'quiz';
        updateData.content = {
          gameTemplateId: body.gameTemplateId,
          questions: body.questions || []
        };
        console.log('🔍 更新 Flying Fruit questions 數據:', body.questions?.length, '個問題');
      } else {
        // 標準詞彙遊戲：保存 vocabularyItems 數據
        updateData.type = 'vocabulary';
        updateData.content = {
          gameTemplateId: body.gameTemplateId, // 存儲在 content 中
          vocabularyItems: body.vocabularyItems || []
        };

        // 🔥 同時更新關聯表中的詞彙數據（包含圖片字段）
        if (body.vocabularyItems && Array.isArray(body.vocabularyItems)) {
          console.log('🔍 更新關聯表詞彙數據:', body.vocabularyItems.length, '個詞彙');

          // 使用事務確保數據一致性
          await prisma.$transaction(async (tx) => {
            // 1. 刪除舊的詞彙項目
            await tx.vocabularyItem.deleteMany({
              where: { activityId }
            });

            // 2. 創建新的詞彙項目（包含所有圖片字段）
            if (body.vocabularyItems.length > 0) {
              await tx.vocabularyItem.createMany({
                data: body.vocabularyItems.map((item: any) => ({
                  activityId,
                  english: item.english || '',
                  chinese: item.chinese || '',
                  phonetic: item.phonetic || null,
                  imageId: item.imageId || null,           // ✅ 保存 imageId
                  imageUrl: item.imageUrl || null,         // ✅ 保存 imageUrl
                  imageSize: item.imageSize || null,       // ✅ 保存 imageSize
                  chineseImageId: item.chineseImageId || null,     // ✅ 保存 chineseImageId
                  chineseImageUrl: item.chineseImageUrl || null,   // ✅ 保存 chineseImageUrl
                  chineseImageSize: item.chineseImageSize || null, // ✅ 保存 chineseImageSize
                  audioUrl: item.audioUrl || null,
                  partOfSpeech: item.partOfSpeech || null,
                  difficultyLevel: item.difficultyLevel || 1,
                  exampleSentence: item.exampleSentence || null,
                  notes: item.notes || null
                }))
              });
              console.log('✅ 關聯表詞彙數據更新成功');
            }
          });
        }
      }
    }

    // 如果有 gameOptions，更新 GameSettings
    if (body.gameOptions !== undefined) {
      console.log('🎮 [GameOptions] 開始更新遊戲選項:', {
        activityId,
        gameOptions: body.gameOptions,
        timestamp: new Date().toISOString()
      });

      const gameOptions = body.gameOptions;

      // ✅ 數據驗證
      try {
        // 驗證 timer 設置
        if (gameOptions.timer) {
          const validTimerTypes = ['none', 'countUp', 'countDown'];
          if (!validTimerTypes.includes(gameOptions.timer.type)) {
            console.error('❌ [GameOptions] 無效的計時器類型:', gameOptions.timer.type);
            return NextResponse.json(
              { error: `無效的計時器類型: ${gameOptions.timer.type}` },
              { status: 400 }
            );
          }

          // 驗證時間範圍
          if (gameOptions.timer.type !== 'none') {
            const minutes = gameOptions.timer.minutes || 0;
            const seconds = gameOptions.timer.seconds || 0;

            if (minutes < 0 || minutes > 60) {
              console.error('❌ [GameOptions] 無效的分鐘數:', minutes);
              return NextResponse.json(
                { error: '分鐘數必須在 0-60 之間' },
                { status: 400 }
              );
            }

            if (seconds < 0 || seconds > 59) {
              console.error('❌ [GameOptions] 無效的秒數:', seconds);
              return NextResponse.json(
                { error: '秒數必須在 0-59 之間' },
                { status: 400 }
              );
            }

            console.log('✅ [GameOptions] 計時器驗證通過:', { minutes, seconds });
          }
        }

        // 驗證 lives 設置
        if (gameOptions.lives !== undefined) {
          if (typeof gameOptions.lives !== 'number' || gameOptions.lives < 1 || gameOptions.lives > 10) {
            console.error('❌ [GameOptions] 無效的生命值:', gameOptions.lives);
            return NextResponse.json(
              { error: '生命值必須是 1-10 之間的數字' },
              { status: 400 }
            );
          }
          console.log('✅ [GameOptions] 生命值驗證通過:', gameOptions.lives);
        }

        // 驗證 speed 設置
        if (gameOptions.speed !== undefined) {
          if (typeof gameOptions.speed !== 'number' || gameOptions.speed < 1 || gameOptions.speed > 20) {
            console.error('❌ [GameOptions] 無效的速度:', gameOptions.speed);
            return NextResponse.json(
              { error: '速度必須是 1-20 之間的數字' },
              { status: 400 }
            );
          }
          console.log('✅ [GameOptions] 速度驗證通過:', gameOptions.speed);
        }

        // 驗證 random 設置
        if (gameOptions.random !== undefined && typeof gameOptions.random !== 'boolean') {
          console.error('❌ [GameOptions] 無效的隨機設置:', gameOptions.random);
          return NextResponse.json(
            { error: '隨機設置必須是布爾值' },
            { status: 400 }
          );
        }

        // 驗證 showAnswers 設置
        if (gameOptions.showAnswers !== undefined && typeof gameOptions.showAnswers !== 'boolean') {
          console.error('❌ [GameOptions] 無效的顯示答案設置:', gameOptions.showAnswers);
          return NextResponse.json(
            { error: '顯示答案設置必須是布爾值' },
            { status: 400 }
          );
        }

        console.log('✅ [GameOptions] 所有數據驗證通過');

      } catch (validationError) {
        console.error('❌ [GameOptions] 數據驗證失敗:', validationError);
        return NextResponse.json(
          { error: '數據驗證失敗' },
          { status: 400 }
        );
      }

      // 轉換 gameOptions 到 GameSettings 格式
      const gameSettingsData: any = {
        activityId: activityId,
        updatedAt: new Date()
      };

      // Timer 設置
      if (gameOptions.timer) {
        if (gameOptions.timer.type === 'none') {
          gameSettingsData.timerType = 'NONE';
          gameSettingsData.timerDuration = null;
          console.log('🔧 [GameOptions] 設置計時器: 無');
        } else if (gameOptions.timer.type === 'countUp') {
          gameSettingsData.timerType = 'COUNT_UP';
          const totalSeconds = (gameOptions.timer.minutes || 0) * 60 + (gameOptions.timer.seconds || 0);
          gameSettingsData.timerDuration = totalSeconds;
          console.log('🔧 [GameOptions] 設置計時器: 正計時', { totalSeconds });
        } else if (gameOptions.timer.type === 'countDown') {
          gameSettingsData.timerType = 'COUNT_DOWN';
          const totalSeconds = (gameOptions.timer.minutes || 0) * 60 + (gameOptions.timer.seconds || 0);
          gameSettingsData.timerDuration = totalSeconds;
          console.log('🔧 [GameOptions] 設置計時器: 倒計時', { totalSeconds });
        }
      }

      // Lives 設置
      if (gameOptions.lives !== undefined) {
        gameSettingsData.livesCount = gameOptions.lives;
        console.log('🔧 [GameOptions] 設置生命值:', gameOptions.lives);
      }

      // Speed 設置
      if (gameOptions.speed !== undefined) {
        gameSettingsData.speed = gameOptions.speed;
        console.log('🔧 [GameOptions] 設置速度:', gameOptions.speed);
      }

      // Random (Shuffle Questions) 設置
      if (gameOptions.random !== undefined) {
        gameSettingsData.shuffleQuestions = gameOptions.random;
        console.log('🔧 [GameOptions] 設置隨機順序:', gameOptions.random);
      }

      // Show Answers 設置
      if (gameOptions.showAnswers !== undefined) {
        gameSettingsData.showAnswers = gameOptions.showAnswers;
        console.log('🔧 [GameOptions] 設置顯示答案:', gameOptions.showAnswers);
      }

      // Visual Style 設置
      if (gameOptions.visualStyle !== undefined) {
        gameSettingsData.visualStyle = gameOptions.visualStyle;
        console.log('🔧 [GameOptions] 設置視覺風格:', gameOptions.visualStyle);
      }

      // 使用 upsert 創建或更新 GameSettings
      try {
        console.log('💾 [GameOptions] 開始保存到數據庫:', gameSettingsData);

        const result = await prisma.gameSettings.upsert({
          where: { activityId: activityId },
          update: gameSettingsData,
          create: gameSettingsData
        });

        console.log('✅ [GameOptions] GameSettings 更新成功:', {
          id: result.id,
          activityId: result.activityId,
          timerType: result.timerType,
          timerDuration: result.timerDuration,
          livesCount: result.livesCount,
          speed: result.speed,
          shuffleQuestions: result.shuffleQuestions,
          showAnswers: result.showAnswers,
          visualStyle: result.visualStyle,
          updatedAt: result.updatedAt
        });
      } catch (dbError) {
        console.error('❌ [GameOptions] 數據庫操作失敗:', dbError);
        return NextResponse.json(
          { error: '保存遊戲設置失敗' },
          { status: 500 }
        );
      }
    }

    // 🔥 如果有 matchUpOptions，直接保存到 Activity
    if (body.matchUpOptions !== undefined) {
      console.log('🎮 [MatchUpOptions] 開始更新 Match-up 選項:', {
        activityId,
        matchUpOptions: body.matchUpOptions,
        timestamp: new Date().toISOString()
      });

      updateData.matchUpOptions = body.matchUpOptions;
      console.log('✅ [MatchUpOptions] Match-up 選項已添加到更新數據');
    }

    // 如果有 folderId，更新 folderId（支持拖拽功能）
    if (body.folderId !== undefined) {
      updateData.folderId = body.folderId;
      console.log('📁 更新活動資料夾:', { activityId, folderId: body.folderId });

      // 🚀 [新方案] 使用事务确保数据一致性，并返回更新后的资料夹数据
      const { updatedActivity, updatedFolders } = await prisma.$transaction(async (tx) => {
        // 更新活动的 folderId
        const activity = await tx.activity.update({
          where: { id: activityId },
          data: updateData
        });

        // 强制等待一小段时间确保事务完全提交
        await new Promise(resolve => setTimeout(resolve, 100));

        // 获取更新后的所有资料夹数据
        const folders = await tx.folder.findMany({
          where: {
            userId: userId,
            deletedAt: null
          },
          include: {
            activities: {
              select: {
                id: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        });

        // 计算每个资料夹的活动数量
        const foldersWithCount = await Promise.all(folders.map(async folder => {
          const activityCount = folder.activities.length;
          return {
            id: folder.id,
            name: folder.name,
            description: folder.description,
            color: folder.color,
            icon: folder.icon,
            createdAt: folder.createdAt,
            updatedAt: folder.updatedAt,
            activityCount: activityCount
          };
        }));

        return { updatedActivity: activity, updatedFolders: foldersWithCount };
      });

      console.log('✅ 活動更新成功:', updatedActivity.title);
      console.log('🚀 [新方案] 返回更新后的资料夹数据:', updatedFolders.length, '个资料夹');

      return NextResponse.json({
        success: true,
        activity: updatedActivity,
        folders: updatedFolders
      });
    }

    // 如果不是拖拽操作，使用原来的逻辑
    const updatedActivity = await prisma.activity.update({
      where: {
        id: activityId
      },
      data: updateData
    });

    console.log('✅ 活動更新成功:', updatedActivity.title);

    // 🔥 v44.0：確保返回的數據包含 matchUpOptions，並使用一致的響應格式
    if (body.matchUpOptions !== undefined) {
      console.log('✅ [MatchUpOptions] 保存成功，返回更新後的數據:', {
        activityId,
        matchUpOptions: updatedActivity.matchUpOptions
      });

      // 返回一致的格式，包含 success 標誌
      return NextResponse.json({
        success: true,
        activity: updatedActivity,
        matchUpOptions: updatedActivity.matchUpOptions
      });
    }

    return NextResponse.json({
      success: true,
      activity: updatedActivity
    });

  } catch (error) {
    console.error('更新活動時出錯:', error);
    return NextResponse.json(
      { error: '更新活動失敗' },
      { status: 500 }
    );
  }
}
