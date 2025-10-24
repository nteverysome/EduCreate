import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * 測試 VocabularyItem 創建
 * 用於調試 SRS 系統的 wordId 問題
 */
export async function GET(request: NextRequest) {
  try {
    // 1. 驗證用戶身份
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    const userId = session.user.id;
    console.log('🧪 測試 VocabularyItem 創建');
    console.log(`  - 用戶 ID: ${userId}`);

    // 2. 測試數據
    const testWords = [
      { english: 'test', chinese: '測試' },
      { english: 'hello', chinese: '你好' },
      { english: 'world', chinese: '世界' }
    ];

    const results = [];

    // 3. 測試創建 VocabularyItem
    for (const word of testWords) {
      try {
        console.log(`\n🔍 處理單字: ${word.english} (${word.chinese})`);
        
        // 查找現有
        let vocabItem = await prisma.vocabularyItem.findFirst({
          where: {
            english: word.english,
            chinese: word.chinese
          }
        });

        if (vocabItem) {
          console.log(`  ✅ 找到現有: ${vocabItem.id}`);
          results.push({
            word: word.english,
            action: 'found',
            id: vocabItem.id,
            success: true
          });
        } else {
          // 創建新的
          console.log(`  🆕 創建新 VocabularyItem...`);
          vocabItem = await prisma.vocabularyItem.create({
            data: {
              english: word.english,
              chinese: word.chinese,
              difficultyLevel: 1
            }
          });
          console.log(`  ✅ 創建成功: ${vocabItem.id}`);
          results.push({
            word: word.english,
            action: 'created',
            id: vocabItem.id,
            success: true
          });
        }
      } catch (error: any) {
        console.error(`  ❌ 失敗:`, error);
        results.push({
          word: word.english,
          action: 'error',
          error: error.message,
          success: false
        });
      }
    }

    // 4. 測試查詢
    const allVocabItems = await prisma.vocabularyItem.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' }
    });

    console.log(`\n✅ 測試完成`);
    console.log(`  - 成功: ${results.filter(r => r.success).length}/${results.length}`);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      userId,
      results,
      recentVocabItems: allVocabItems.map(v => ({
        id: v.id,
        english: v.english,
        chinese: v.chinese,
        createdAt: v.createdAt
      })),
      summary: {
        totalTests: results.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      }
    });

  } catch (error: any) {
    console.error('❌ 測試失敗:', error);
    return NextResponse.json(
      { 
        error: '測試失敗',
        message: error.message,
        stack: error.stack
      },
      { status: 500 }
    );
  }
}

