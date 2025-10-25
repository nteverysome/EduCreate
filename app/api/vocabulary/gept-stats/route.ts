import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const geptLevel = searchParams.get('geptLevel') || 'ELEMENTARY';

    console.log(`📊 獲取 GEPT 統計數據: geptLevel=${geptLevel}`);

    // 獲取該等級的總單字數
    const totalWords = await prisma.vocabularyItem.count({
      where: {
        geptLevel: geptLevel as any
      }
    });

    // 獲取各個分組類型的統計
    const pathStats: Record<string, { groupCount: number; totalWords: number }> = {};

    // 1. 詞性分組統計
    const partOfSpeechCounts = await prisma.vocabularyItem.groupBy({
      by: ['partOfSpeech'],
      where: {
        geptLevel: geptLevel as any,
        partOfSpeech: { not: null }
      },
      _count: true
    });
    pathStats.partOfSpeech = {
      groupCount: partOfSpeechCounts.length,
      totalWords: partOfSpeechCounts.reduce((sum, item) => sum + item._count, 0)
    };

    // 2. 音節分組統計
    const syllableCounts = await prisma.vocabularyItem.groupBy({
      by: ['syllableCount'],
      where: {
        geptLevel: geptLevel as any,
        syllableCount: { not: null }
      },
      _count: true
    });
    pathStats.syllable = {
      groupCount: syllableCounts.length,
      totalWords: syllableCounts.reduce((sum, item) => sum + item._count, 0)
    };

    // 3. 情境分組統計
    const contextCounts = await prisma.vocabularyItem.groupBy({
      by: ['context'],
      where: {
        geptLevel: geptLevel as any,
        context: { not: null }
      },
      _count: true
    });
    pathStats.context = {
      groupCount: contextCounts.length,
      totalWords: contextCounts.reduce((sum, item) => sum + item._count, 0)
    };

    // 4. 情感分組統計
    const emotionalCounts = await prisma.vocabularyItem.groupBy({
      by: ['emotionalTone'],
      where: {
        geptLevel: geptLevel as any,
        emotionalTone: { not: null }
      },
      _count: true
    });
    pathStats.emotional = {
      groupCount: emotionalCounts.length,
      totalWords: emotionalCounts.reduce((sum, item) => sum + item._count, 0)
    };

    // 5. 視覺分組統計
    const visualCounts = await prisma.vocabularyItem.groupBy({
      by: ['visualFeature'],
      where: {
        geptLevel: geptLevel as any,
        visualFeature: { not: null }
      },
      _count: true
    });
    pathStats.visual = {
      groupCount: visualCounts.length,
      totalWords: visualCounts.reduce((sum, item) => sum + item._count, 0)
    };

    // 6. 時間分組統計
    const temporalCounts = await prisma.vocabularyItem.groupBy({
      by: ['temporalCategory'],
      where: {
        geptLevel: geptLevel as any,
        temporalCategory: { not: null }
      },
      _count: true
    });
    pathStats.temporal = {
      groupCount: temporalCounts.length,
      totalWords: temporalCounts.reduce((sum, item) => sum + item._count, 0)
    };

    // 7. 動作分組統計
    const actionCounts = await prisma.vocabularyItem.groupBy({
      by: ['actionType'],
      where: {
        geptLevel: geptLevel as any,
        actionType: { not: null }
      },
      _count: true
    });
    pathStats.action = {
      groupCount: actionCounts.length,
      totalWords: actionCounts.reduce((sum, item) => sum + item._count, 0)
    };

    // 8. 字首分組統計
    const prefixCount = await prisma.vocabularyItem.count({
      where: {
        geptLevel: geptLevel as any,
        prefix: { not: null }
      }
    });
    pathStats.prefix = {
      groupCount: 22, // 固定 22 組
      totalWords: prefixCount
    };

    // 9. 字根分組統計
    const rootCount = await prisma.vocabularyItem.count({
      where: {
        geptLevel: geptLevel as any,
        root: { not: null }
      }
    });
    pathStats.root = {
      groupCount: 20, // 固定 20 組
      totalWords: rootCount
    };

    // 10. 字尾分組統計
    const suffixCount = await prisma.vocabularyItem.count({
      where: {
        geptLevel: geptLevel as any,
        suffix: { not: null }
      }
    });
    pathStats.suffix = {
      groupCount: 20, // 固定 20 組
      totalWords: suffixCount
    };

    // 11. 主題分組統計
    const themeCounts = await prisma.vocabularyItem.groupBy({
      by: ['theme'],
      where: {
        geptLevel: geptLevel as any,
        theme: { not: null }
      },
      _count: true
    });
    pathStats.theme = {
      groupCount: themeCounts.length,
      totalWords: themeCounts.reduce((sum, item) => sum + item._count, 0)
    };

    // 12. 頻率分組統計
    const frequencyCounts = await prisma.vocabularyItem.groupBy({
      by: ['frequency'],
      where: {
        geptLevel: geptLevel as any,
        frequency: { not: null }
      },
      _count: true
    });
    pathStats.frequency = {
      groupCount: frequencyCounts.length,
      totalWords: frequencyCounts.reduce((sum, item) => sum + item._count, 0)
    };

    // 13. 混合分組（字首 + 主題）
    pathStats.mixed = {
      groupCount: 22 + themeCounts.length,
      totalWords: totalWords
    };

    console.log(`✅ GEPT 統計數據:`, {
      level: geptLevel,
      totalWords,
      pathStats
    });

    return NextResponse.json({
      level: geptLevel,
      totalWords,
      pathStats
    });

  } catch (error) {
    console.error('❌ 獲取 GEPT 統計數據失敗:', error);
    return NextResponse.json(
      { error: '獲取統計數據失敗' },
      { status: 500 }
    );
  }
}

