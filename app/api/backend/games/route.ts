import { NextResponse } from 'next/server';

// 遊戲列表 API
export async function GET() {
  try {
    // 返回可用的遊戲列表
    const games = [
      {
        id: 'shimozurdo',
        name: 'Shimozurdo Game',
        description: '互動式詞彙學習遊戲，支持 GEPT 分級',
        category: 'vocabulary',
        difficulty: 'medium',
        features: ['GEPT分級', '記憶科學', '互動學習']
      },
      {
        id: 'airplane',
        name: 'Airplane Collision Game',
        description: '基於主動回憶記憶科學原理的飛機碰撞遊戲',
        category: 'memory',
        difficulty: 'hard',
        features: ['60fps性能', '視覺記憶', '觸覺反饋']
      },
      {
        id: 'match',
        name: 'Match配對遊戲',
        description: '基於記憶科學原理的配對遊戲',
        category: 'matching',
        difficulty: 'easy',
        features: ['無障礙設計', '多種模式', '智能適配']
      }
    ];

    return NextResponse.json({
      status: 'success',
      message: '遊戲列表獲取成功',
      data: games,
      total: games.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('獲取遊戲列表失敗:', error);
    return NextResponse.json({
      status: 'error',
      message: '獲取遊戲列表失敗',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
