import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { calculatePriority } from '@/lib/srs/sm2';
import fs from 'fs';
import path from 'path';

/**
 * GET /api/srs/words-to-review
 * 獲取需要學習的單字 (新單字 + 複習單字)
 */
export async function GET(request: NextRequest) {
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
    const { searchParams } = new URL(request.url);
    const geptLevel = searchParams.get('geptLevel') || 'elementary';
    const count = parseInt(searchParams.get('count') || '15');

    console.log('🔍 獲取需要複習的單字');
    console.log(`  - 用戶 ID: ${userId}`);
    console.log(`  - GEPT 等級: ${geptLevel}`);
    console.log(`  - 數量: ${count}`);

    // 2. 獲取該等級的所有單字 (從 TTSCache 表)
    let allWords = await prisma.tTSCache.findMany({
      where: {
        geptLevel: geptLevel.toUpperCase() as any,
        language: 'en-US'  // 只獲取英文單字
      },
      select: {
        id: true,
        text: true,
        audioUrl: true,
        geptLevel: true
      }
    });

    console.log(`  - 找到 ${allWords.length} 個單字`);

    // 如果 TTSCache 沒有數據,從 GEPT 詞彙列表獲取
    if (allWords.length === 0) {
      console.log('⚠️ TTSCache 沒有數據,從 GEPT 詞彙列表獲取');

      try {
        // 讀取詞彙文件
        const wordListPath = path.join(process.cwd(), 'data', 'word-lists', `gept-${geptLevel}-unique.txt`);
        console.log(`  - 讀取詞彙文件: ${wordListPath}`);

        const wordListContent = fs.readFileSync(wordListPath, 'utf-8');
        const wordList = wordListContent.split('\n').filter(line => line.trim());

        console.log(`  - 詞彙文件包含 ${wordList.length} 個單字`);

        // 隨機選擇 15 個單字
        const selectedWords = wordList
          .sort(() => Math.random() - 0.5)
          .slice(0, 15);

        console.log(`  - 選擇了 ${selectedWords.length} 個單字用於 SRS`);

        // 創建臨時單字對象 (不生成 TTS,使用空 audioUrl)
        allWords = selectedWords.map((word, index) => ({
          id: `temp-${index}`,
          text: word,
          audioUrl: '', // 暫時不生成 TTS
          geptLevel: geptLevel.toUpperCase() as any
        }));

        console.log(`  - 創建了 ${allWords.length} 個臨時單字對象`);

      } catch (error: any) {
        console.error('❌ 讀取詞彙文件失敗:', error);
        console.error('  - 錯誤詳情:', error.message);

        // 使用硬編碼的預設詞彙作為後備
        console.log('⚠️ 使用硬編碼的預設詞彙');
        allWords = [
          { id: 'default-1', text: 'apple', audioUrl: '', geptLevel: 'ELEMENTARY' as any },
          { id: 'default-2', text: 'banana', audioUrl: '', geptLevel: 'ELEMENTARY' as any },
          { id: 'default-3', text: 'cat', audioUrl: '', geptLevel: 'ELEMENTARY' as any },
          { id: 'default-4', text: 'dog', audioUrl: '', geptLevel: 'ELEMENTARY' as any },
          { id: 'default-5', text: 'elephant', audioUrl: '', geptLevel: 'ELEMENTARY' as any },
          { id: 'default-6', text: 'fish', audioUrl: '', geptLevel: 'ELEMENTARY' as any },
          { id: 'default-7', text: 'girl', audioUrl: '', geptLevel: 'ELEMENTARY' as any },
          { id: 'default-8', text: 'house', audioUrl: '', geptLevel: 'ELEMENTARY' as any },
          { id: 'default-9', text: 'ice', audioUrl: '', geptLevel: 'ELEMENTARY' as any },
          { id: 'default-10', text: 'juice', audioUrl: '', geptLevel: 'ELEMENTARY' as any },
          { id: 'default-11', text: 'kite', audioUrl: '', geptLevel: 'ELEMENTARY' as any },
          { id: 'default-12', text: 'lion', audioUrl: '', geptLevel: 'ELEMENTARY' as any },
          { id: 'default-13', text: 'monkey', audioUrl: '', geptLevel: 'ELEMENTARY' as any },
          { id: 'default-14', text: 'nose', audioUrl: '', geptLevel: 'ELEMENTARY' as any },
          { id: 'default-15', text: 'orange', audioUrl: '', geptLevel: 'ELEMENTARY' as any }
        ];
      }
    }

    // 3. 獲取用戶的學習記錄
    const userProgress = await prisma.userWordProgress.findMany({
      where: { userId }
    });

    console.log(`  - 用戶已學習 ${userProgress.length} 個單字`);

    // 4. 分類單字
    const learnedWordIds = new Set(userProgress.map(p => p.wordId));
    const newWords = allWords.filter(w => !learnedWordIds.has(w.id));

    console.log(`  - 新單字: ${newWords.length} 個`);

    // 5. 選擇需要複習的單字
    const now = new Date();
    const dueWords = userProgress.filter(p => 
      p.nextReviewAt <= now && p.status !== 'MASTERED'
    );

    console.log(`  - 需要複習: ${dueWords.length} 個`);

    // 6. 按優先級排序
    const sortedDueWords = dueWords.sort((a, b) => {
      const priorityA = calculatePriority({
        nextReviewAt: a.nextReviewAt,
        memoryStrength: a.memoryStrength,
        totalReviews: a.totalReviews,
        incorrectReviews: a.incorrectReviews
      });
      const priorityB = calculatePriority({
        nextReviewAt: b.nextReviewAt,
        memoryStrength: b.memoryStrength,
        totalReviews: b.totalReviews,
        incorrectReviews: b.incorrectReviews
      });
      return priorityB - priorityA;
    });

    // 7. 選擇單字 (5 新 + 10 複習)
    const newWordsCount = Math.min(5, newWords.length);
    const reviewWordsCount = Math.min(count - newWordsCount, sortedDueWords.length);

    const selectedNewWords = newWords.slice(0, newWordsCount);
    const selectedReviewWordIds = sortedDueWords.slice(0, reviewWordsCount).map(p => p.wordId);
    const selectedReviewWords = allWords.filter(w => selectedReviewWordIds.includes(w.id));

    console.log(`  - 選擇新單字: ${selectedNewWords.length} 個`);
    console.log(`  - 選擇複習單字: ${selectedReviewWords.length} 個`);

    // 8. 組合結果
    const words = [
      ...selectedNewWords.map(w => ({
        id: w.id,
        english: w.text,
        chinese: '',  // TODO: 從其他來源獲取中文
        audioUrl: w.audioUrl,
        geptLevel: w.geptLevel,
        isNew: true,
        needsReview: false,
        memoryStrength: 0
      })),
      ...selectedReviewWords.map(w => {
        const progress = userProgress.find(p => p.wordId === w.id);
        return {
          id: w.id,
          english: w.text,
          chinese: '',  // TODO: 從其他來源獲取中文
          audioUrl: w.audioUrl,
          geptLevel: w.geptLevel,
          isNew: false,
          needsReview: true,
          memoryStrength: progress?.memoryStrength || 0
        };
      })
    ];

    // 9. 統計數據
    const statistics = {
      totalWords: allWords.length,
      learnedWords: learnedWordIds.size,
      masteredWords: userProgress.filter(p => p.status === 'MASTERED').length,
      dueForReview: dueWords.length
    };

    console.log('✅ 單字選擇完成');
    console.log(`  - 總共: ${words.length} 個單字`);

    return NextResponse.json({
      words,
      newWords: selectedNewWords,
      reviewWords: selectedReviewWords,
      statistics
    });

  } catch (error: any) {
    console.error('❌ 獲取單字失敗:', error);
    console.error('  - 錯誤詳情:', error.message);
    console.error('  - 錯誤堆棧:', error.stack);
    return NextResponse.json(
      {
        error: '獲取單字失敗',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

