import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

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

    // 2. 獲取需要學習的單字
    const baseUrl = process.env.NEXTAUTH_URL || 'https://edu-create.vercel.app';
    const wordsUrl = `${baseUrl}/api/srs/words-to-review?geptLevel=${geptLevel}`;

    console.log(`  - 調用 API: ${wordsUrl}`);

    const wordsResponse = await fetch(wordsUrl, {
      headers: {
        'Cookie': request.headers.get('cookie') || ''
      }
    });

    console.log(`  - API 響應狀態: ${wordsResponse.status}`);

    if (!wordsResponse.ok) {
      const errorText = await wordsResponse.text();
      console.error(`  - API 錯誤響應: ${errorText}`);
      throw new Error(`獲取單字失敗: ${wordsResponse.status} - ${errorText}`);
    }

    const wordsData = await wordsResponse.json();
    const words = wordsData.words;

    console.log(`  - 獲取到 ${words.length} 個單字`);

    // 3. 創建學習會話
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

