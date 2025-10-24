import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { updateWithSM2 } from '@/lib/srs/sm2';

/**
 * POST /api/srs/update-progress
 * 更新單字的學習進度 (使用 SM-2 算法)
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
    const { wordId, isCorrect, responseTime, sessionId } = body;

    console.log('📝 更新單字進度');
    console.log(`  - 用戶 ID: ${userId}`);
    console.log(`  - 單字 ID: ${wordId}`);
    console.log(`  - 是否正確: ${isCorrect}`);
    console.log(`  - 反應時間: ${responseTime}ms`);

    // 2. 驗證 wordId 是否存在於 VocabularyItem 表中
    const vocabularyItem = await prisma.vocabularyItem.findUnique({
      where: { id: wordId }
    });

    if (!vocabularyItem) {
      console.error(`❌ 找不到單字: ${wordId}`);
      return NextResponse.json(
        { error: `找不到單字: ${wordId}` },
        { status: 404 }
      );
    }

    // 3. 獲取或創建學習記錄
    let progress = await prisma.userWordProgress.findUnique({
      where: {
        userId_wordId: {
          userId,
          wordId
        }
      }
    });

    if (!progress) {
      console.log('  - 創建新的學習記錄');
      progress = await prisma.userWordProgress.create({
        data: {
          userId,
          wordId,
          status: 'NEW',
          memoryStrength: 0,
          easeFactor: 2.5,
          interval: 1,
          repetitions: 0,
          totalReviews: 0,
          correctReviews: 0,
          incorrectReviews: 0
        }
      });
    }

    // 3. 保存更新前的數據
    const before = {
      memoryStrength: progress.memoryStrength,
      interval: progress.interval
    };

    // 4. 使用 SuperMemo SM-2 算法更新
    const updated = updateWithSM2(
      {
        repetitions: progress.repetitions,
        interval: progress.interval,
        easeFactor: progress.easeFactor,
        memoryStrength: progress.memoryStrength,
        nextReviewAt: progress.nextReviewAt,
        status: progress.status as any
      },
      isCorrect
    );

    console.log('  - SM-2 算法更新完成');
    console.log(`    記憶強度: ${before.memoryStrength} → ${updated.memoryStrength}`);
    console.log(`    複習間隔: ${before.interval} → ${updated.interval} 天`);
    console.log(`    下次複習: ${updated.nextReviewAt.toLocaleDateString()}`);

    // 5. 更新統計數據
    const totalReviews = progress.totalReviews + 1;
    const correctReviews = progress.correctReviews + (isCorrect ? 1 : 0);
    const incorrectReviews = progress.incorrectReviews + (isCorrect ? 0 : 1);

    // 6. 保存到資料庫
    const savedProgress = await prisma.userWordProgress.update({
      where: { id: progress.id },
      data: {
        repetitions: updated.repetitions,
        interval: updated.interval,
        easeFactor: updated.easeFactor,
        memoryStrength: updated.memoryStrength,
        nextReviewAt: updated.nextReviewAt,
        status: updated.status,
        lastReviewedAt: new Date(),
        totalReviews,
        correctReviews,
        incorrectReviews
      }
    });

    // 7. 記錄複習歷史
    if (sessionId) {
      await prisma.wordReview.create({
        data: {
          sessionId,
          wordId,
          isCorrect,
          responseTime,
          memoryStrengthBefore: before.memoryStrength,
          memoryStrengthAfter: updated.memoryStrength,
          intervalBefore: before.interval,
          intervalAfter: updated.interval
        }
      });
      console.log('  - 複習歷史已記錄');
    }

    console.log('✅ 進度更新成功');

    return NextResponse.json({
      success: true,
      progress: savedProgress,
      nextReviewAt: savedProgress.nextReviewAt
    });

  } catch (error) {
    console.error('❌ 進度更新失敗:', error);
    return NextResponse.json(
      { error: '進度更新失敗' },
      { status: 500 }
    );
  }
}

