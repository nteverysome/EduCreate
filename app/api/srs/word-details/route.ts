import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // 驗證用戶身份
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '未授權' },
        { status: 401 }
      );
    }

    // 獲取用戶
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: '用戶不存在' },
        { status: 404 }
      );
    }

    // 解析請求體
    const body = await request.json();
    const { wordIds, geptLevel } = body;

    if (!wordIds || !Array.isArray(wordIds) || wordIds.length === 0) {
      return NextResponse.json(
        { error: '缺少單字 IDs' },
        { status: 400 }
      );
    }

    if (!geptLevel) {
      return NextResponse.json(
        { error: '缺少 GEPT 等級' },
        { status: 400 }
      );
    }

    console.log('📊 獲取單字詳細信息:', {
      userId: user.id,
      wordCount: wordIds.length,
      geptLevel,
    });

    // 獲取單字信息和用戶進度
    const vocabularyItems = await prisma.vocabularyItem.findMany({
      where: {
        id: { in: wordIds },
      },
      select: {
        id: true,
        english: true,
        chinese: true,
      },
    });

    // 獲取用戶對這些單字的學習進度
    const userProgress = await prisma.userWordProgress.findMany({
      where: {
        userId: user.id,
        wordId: { in: wordIds },
      },
      select: {
        wordId: true,
        memoryStrength: true,
        nextReviewAt: true,
        reviewCount: true,
        lastReviewedAt: true,
      },
    });

    // 創建進度映射
    const progressMap = new Map(
      userProgress.map(p => [p.wordId, p])
    );

    // 組合單字數據
    const now = new Date();
    const words = vocabularyItems.map(item => {
      const progress = progressMap.get(item.id);
      const memoryStrength = progress?.memoryStrength || 0;
      const nextReviewAt = progress?.nextReviewAt || now;
      const isNew = !progress || memoryStrength < 20;
      const needsReview = progress && nextReviewAt < now;

      return {
        id: item.id,
        english: item.english,
        chinese: item.chinese,
        memoryStrength,
        nextReviewAt: nextReviewAt.toISOString(),
        reviewCount: progress?.reviewCount || 0,
        lastReviewedAt: progress?.lastReviewedAt?.toISOString() || null,
        isNew,
        needsReview,
      };
    });

    console.log('✅ 單字詳細信息已獲取:', {
      totalWords: words.length,
      newWords: words.filter(w => w.isNew).length,
      reviewWords: words.filter(w => w.needsReview).length,
    });

    return NextResponse.json({
      success: true,
      words,
    });

  } catch (error) {
    console.error('❌ 獲取單字詳細信息失敗:', error);
    return NextResponse.json(
      { error: '獲取單字詳細信息失敗' },
      { status: 500 }
    );
  }
}

