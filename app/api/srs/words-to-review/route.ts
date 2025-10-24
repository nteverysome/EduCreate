import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getWordsToReview } from '@/lib/srs/getWordsToReview';

export const dynamic = 'force-dynamic';

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

    // 2. 調用共享函數獲取單字
    const result = await getWordsToReview(userId, geptLevel, count);

    return NextResponse.json(result);

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
