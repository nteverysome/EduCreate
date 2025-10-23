import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * POST /api/srs/test-data
 * 創建測試數據 (僅用於開發和測試)
 */
export async function POST() {
  try {
    console.log('🧪 開始創建 SRS 測試數據...');

    // 1. 檢查是否已有數據
    const existingCount = await prisma.tTSCache.count({
      where: {
        geptLevel: 'ELEMENTARY',
        language: 'en-US'
      }
    });

    console.log(`  - 現有 ELEMENTARY 單字數: ${existingCount}`);

    if (existingCount >= 15) {
      console.log('✅ 已有足夠的測試數據');
      return NextResponse.json({
        success: true,
        message: '已有足夠的測試數據',
        count: existingCount
      });
    }

    // 2. 創建測試單字
    const testWords = [
      { text: 'apple', geptLevel: 'ELEMENTARY', language: 'en-US', audioUrl: 'https://example.com/apple.mp3' },
      { text: 'banana', geptLevel: 'ELEMENTARY', language: 'en-US', audioUrl: 'https://example.com/banana.mp3' },
      { text: 'cat', geptLevel: 'ELEMENTARY', language: 'en-US', audioUrl: 'https://example.com/cat.mp3' },
      { text: 'dog', geptLevel: 'ELEMENTARY', language: 'en-US', audioUrl: 'https://example.com/dog.mp3' },
      { text: 'elephant', geptLevel: 'ELEMENTARY', language: 'en-US', audioUrl: 'https://example.com/elephant.mp3' },
      { text: 'fish', geptLevel: 'ELEMENTARY', language: 'en-US', audioUrl: 'https://example.com/fish.mp3' },
      { text: 'girl', geptLevel: 'ELEMENTARY', language: 'en-US', audioUrl: 'https://example.com/girl.mp3' },
      { text: 'house', geptLevel: 'ELEMENTARY', language: 'en-US', audioUrl: 'https://example.com/house.mp3' },
      { text: 'ice', geptLevel: 'ELEMENTARY', language: 'en-US', audioUrl: 'https://example.com/ice.mp3' },
      { text: 'juice', geptLevel: 'ELEMENTARY', language: 'en-US', audioUrl: 'https://example.com/juice.mp3' },
      { text: 'kite', geptLevel: 'ELEMENTARY', language: 'en-US', audioUrl: 'https://example.com/kite.mp3' },
      { text: 'lion', geptLevel: 'ELEMENTARY', language: 'en-US', audioUrl: 'https://example.com/lion.mp3' },
      { text: 'monkey', geptLevel: 'ELEMENTARY', language: 'en-US', audioUrl: 'https://example.com/monkey.mp3' },
      { text: 'nose', geptLevel: 'ELEMENTARY', language: 'en-US', audioUrl: 'https://example.com/nose.mp3' },
      { text: 'orange', geptLevel: 'ELEMENTARY', language: 'en-US', audioUrl: 'https://example.com/orange.mp3' }
    ];

    console.log(`  - 準備創建 ${testWords.length} 個測試單字`);

    // 3. 批量創建
    const result = await prisma.tTSCache.createMany({
      data: testWords,
      skipDuplicates: true
    });

    console.log(`✅ 測試數據創建成功: ${result.count} 個單字`);

    // 4. 驗證創建結果
    const finalCount = await prisma.tTSCache.count({
      where: {
        geptLevel: 'ELEMENTARY',
        language: 'en-US'
      }
    });

    console.log(`  - 最終 ELEMENTARY 單字數: ${finalCount}`);

    return NextResponse.json({
      success: true,
      message: '測試數據創建成功',
      created: result.count,
      total: finalCount
    });

  } catch (error: any) {
    console.error('❌ 創建測試數據失敗:', error);
    console.error('  - 錯誤詳情:', error.message);
    console.error('  - 錯誤堆棧:', error.stack);
    return NextResponse.json(
      { 
        error: '創建測試數據失敗', 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/srs/test-data
 * 查看測試數據統計
 */
export async function GET() {
  try {
    const stats = {
      elementary: await prisma.tTSCache.count({
        where: { geptLevel: 'ELEMENTARY', language: 'en-US' }
      }),
      intermediate: await prisma.tTSCache.count({
        where: { geptLevel: 'INTERMEDIATE', language: 'en-US' }
      }),
      highIntermediate: await prisma.tTSCache.count({
        where: { geptLevel: 'HIGH_INTERMEDIATE', language: 'en-US' }
      }),
      total: await prisma.tTSCache.count()
    };

    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error: any) {
    console.error('❌ 獲取統計失敗:', error);
    return NextResponse.json(
      { error: '獲取統計失敗', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/srs/test-data
 * 刪除測試數據
 */
export async function DELETE() {
  try {
    console.log('🗑️ 開始刪除測試數據...');

    const result = await prisma.tTSCache.deleteMany({
      where: {
        geptLevel: 'ELEMENTARY',
        language: 'en-US',
        audioUrl: {
          contains: 'example.com'
        }
      }
    });

    console.log(`✅ 測試數據刪除成功: ${result.count} 個單字`);

    return NextResponse.json({
      success: true,
      message: '測試數據刪除成功',
      deleted: result.count
    });

  } catch (error: any) {
    console.error('❌ 刪除測試數據失敗:', error);
    return NextResponse.json(
      { error: '刪除測試數據失敗', details: error.message },
      { status: 500 }
    );
  }
}

