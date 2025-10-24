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
    const { geptLevel } = body;

    console.log('🔄 創建 SRS 學習會話');
    console.log(`  - 用戶 ID: ${userId}`);
    console.log(`  - GEPT 等級: ${geptLevel}`);

    // 2. 獲取需要學習的單字 (直接調用共享函數)
    console.log('🔍 獲取學習單字...');
    const wordsData = await getWordsToReview(userId, geptLevel, 15);
    const words = wordsData.words;

    console.log(`  - 獲取到 ${words.length} 個單字`);

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

