import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getWordsToReview } from '@/lib/srs/getWordsToReview';

export const dynamic = 'force-dynamic';

/**
 * POST /api/srs/sessions
 * 創建學習會話
 */
export async function POST(request: NextRequest) {
  try {
    // 1. 驗證用戶身份
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '未授權' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body = await request.json();
    let { geptLevel, wordIds } = body;

    // 標準化 geptLevel 格式 (轉換為大寫)
    if (geptLevel) {
      geptLevel = geptLevel.toUpperCase().replace('-', '_');
      // elementary -> ELEMENTARY
      // intermediate -> INTERMEDIATE
      // high-intermediate -> HIGH_INTERMEDIATE
      // advanced -> HIGH_INTERMEDIATE
      if (geptLevel === 'ADVANCED') {
        geptLevel = 'HIGH_INTERMEDIATE';
      }
    }

    console.log('🔄 創建 SRS 學習會話');
    console.log(`  - 用戶 ID: ${userId}`);
    console.log(`  - GEPT 等級: ${geptLevel}`);
    console.log(`  - 指定單字 IDs: ${wordIds ? wordIds.length : 0} 個`);

    // 2. 獲取需要學習的單字
    let words;

    if (wordIds && wordIds.length > 0) {
      // 如果指定了單字 ID,則使用指定的單字
      console.log('🎯 使用指定的單字 IDs...');
      console.log('  - wordIds 類型:', typeof wordIds);
      console.log('  - wordIds 是否為陣列:', Array.isArray(wordIds));
      console.log('  - wordIds 內容:', JSON.stringify(wordIds).substring(0, 200));

      let vocabularyItems;
      try {
        vocabularyItems = await prisma.vocabularyItem.findMany({
          where: {
            id: { in: wordIds }
            // 不過濾 geptLevel,因為用戶可能選擇了不同等級的單字
          },
          include: {
            ttsCache: {
              where: {
                language: 'zh-TW'
              }
            }
          }
        });

        console.log(`  - 查詢到 ${vocabularyItems.length} 個單字`);
      } catch (queryError: any) {
        console.error('❌ Prisma 查詢失敗:', queryError);
        console.error('  - 錯誤訊息:', queryError.message);
        console.error('  - 錯誤代碼:', queryError.code);
        throw queryError;
      }

      // 獲取用戶的學習進度
      let userProgress;
      try {
        userProgress = await prisma.userWordProgress.findMany({
          where: {
            userId,
            wordId: { in: wordIds }
          }
        });
        console.log(`  - 查詢到 ${userProgress.length} 個學習進度記錄`);
      } catch (progressError: any) {
        console.error('❌ 學習進度查詢失敗:', progressError);
        console.error('  - 錯誤訊息:', progressError.message);
        throw progressError;
      }

      const progressMap = new Map(userProgress.map(p => [p.wordId, p]));

      // 組合單字數據
      words = vocabularyItems.map(item => {
        const progress = progressMap.get(item.id);
        const isNew = !progress || progress.memoryStrength < 20;
        const needsReview = progress && progress.nextReviewAt < new Date();

        return {
          id: item.id,
          word: item.word,
          translation: item.translation,
          geptLevel: item.geptLevel,
          audioUrl: item.ttsCache[0]?.audioUrl || null,
          isNew,
          needsReview,
          memoryStrength: progress?.memoryStrength || 0,
          nextReviewAt: progress?.nextReviewAt || new Date()
        };
      });

      console.log(`  - 載入指定單字: ${words.length} 個`);
    } else {
      // 否則使用智能選擇算法
      console.log('🔍 使用智能選擇算法...');
      const wordsData = await getWordsToReview(userId, geptLevel, 15);
      words = wordsData.words;
      console.log(`  - 智能選擇單字: ${words.length} 個`);
    }

    // 2.5. 驗證用戶是否存在
    console.log('🔍 驗證用戶是否存在...');
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true }
    });

    if (!userExists) {
      console.error(`❌ 用戶不存在: ${userId}`);
      throw new Error(`用戶不存在: ${userId}`);
    }

    console.log(`✅ 用戶存在: ${userExists.email}`);

    // 3. 創建學習會話
    console.log('🔄 創建學習會話記錄...');

    try {
      const learningSession = await prisma.learningSession.create({
        data: {
          userId,
          geptLevel,
          newWordsCount: words.filter((w: any) => w.isNew).length,
          reviewWordsCount: words.filter((w: any) => w.needsReview).length,
          totalWords: words.length
        }
      });

      console.log('✅ 學習會話創建成功');
      console.log(`  - 會話 ID: ${learningSession.id}`);

      return NextResponse.json({
        sessionId: learningSession.id,
        words,
        newWords: words.filter((w: any) => w.isNew),
        reviewWords: words.filter((w: any) => w.needsReview)
      });

    } catch (dbError: any) {
      console.error('❌ 資料庫寫入失敗:', dbError);
      console.error('  - 錯誤代碼:', dbError.code);
      console.error('  - 錯誤訊息:', dbError.message);
      console.error('  - Meta:', dbError.meta);
      throw new Error(`資料庫寫入失敗: ${dbError.message}`);
    }

  } catch (error: any) {
    console.error('❌ 創建會話失敗:', error);
    console.error('  - 錯誤詳情:', error.message);
    console.error('  - 錯誤堆棧:', error.stack);
    return NextResponse.json(
      {
        error: '創建會話失敗',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

