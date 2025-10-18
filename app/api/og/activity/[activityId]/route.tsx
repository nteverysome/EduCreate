/**
 * Open Graph Image Generation API Route
 * 使用 Next.js 14 原生的 @vercel/og 功能動態生成遊戲預覽圖
 * 
 * 特性：
 * - Edge Runtime（極快）
 * - 自動緩存
 * - 無需資料庫存儲
 * - 完美支援社交分享和 SEO
 */

import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

// 啟用 Edge Runtime（關鍵！）
export const runtime = 'edge';

// 遊戲類型圖標映射
const GAME_ICONS: { [key: string]: string } = {
  'quiz': '❓',
  'matching': '🔗',
  'match': '🔗',
  'flashcards': '📚',
  'vocabulary': '📝',
  'hangman': '🎯',
  'airplane': '✈️',
  'memory-cards': '🧠',
  'memory': '🧠',
  'shimozurdo': '🎮',
  '飛機遊戲': '✈️',
  '配對遊戲': '🔗',
  '測驗': '❓',
  '單字卡片': '📚',
  '詞彙遊戲': '📝',
  '猜字遊戲': '🎯',
  '記憶卡片': '🧠',
};

// 遊戲類型名稱映射
const GAME_TYPE_NAMES: { [key: string]: string } = {
  'quiz': '測驗遊戲',
  'matching': '配對遊戲',
  'match': '配對遊戲',
  'flashcards': '單字卡片',
  'vocabulary': '詞彙遊戲',
  'hangman': '猜字遊戲',
  'airplane': '飛機遊戲',
  'memory-cards': '記憶卡片',
  'memory': '記憶卡片',
  'shimozurdo': 'Shimozurdo 遊戲',
};

// 遊戲類型漸變色映射
const GAME_GRADIENTS: { [key: string]: { from: string; to: string } } = {
  'quiz': { from: '#3b82f6', to: '#8b5cf6' },
  'matching': { from: '#ec4899', to: '#8b5cf6' },
  'flashcards': { from: '#f59e0b', to: '#ef4444' },
  'vocabulary': { from: '#10b981', to: '#06b6d4' },
  'hangman': { from: '#14b8a6', to: '#06b6d4' },
  'airplane': { from: '#0ea5e9', to: '#3b82f6' },
  'memory': { from: '#8b5cf6', to: '#ec4899' },
  'shimozurdo': { from: '#1e293b', to: '#475569' },
};

/**
 * GET /api/og/activity/[activityId]
 * 動態生成活動預覽圖
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { activityId: string } }
) {
  try {
    const { activityId } = params;

    // 從 URL 查詢參數獲取活動數據（避免在 Edge Runtime 中訪問資料庫）
    const searchParams = request.nextUrl.searchParams;
    const title = searchParams.get('title') || '未命名活動';
    const gameType = searchParams.get('gameType') || 'vocabulary';
    const vocabularyParam = searchParams.get('vocabulary');
    
    // 解析詞彙數據
    let vocabulary: Array<{ english: string; chinese: string }> = [];
    if (vocabularyParam) {
      try {
        vocabulary = JSON.parse(decodeURIComponent(vocabularyParam));
      } catch (e) {
        console.error('Failed to parse vocabulary:', e);
      }
    }

    // 如果沒有詞彙數據，使用佔位符
    if (vocabulary.length === 0) {
      vocabulary = [
        { english: 'Loading...', chinese: '載入中...' }
      ];
    }

    // 獲取遊戲類型相關信息
    const gameIcon = getGameIcon(gameType);
    const gameTypeName = getGameTypeName(gameType);
    const gradient = getGameGradient(gameType);

    // 使用 JSX 渲染預覽圖
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: `linear-gradient(135deg, ${gradient.from} 0%, ${gradient.to} 100%)`,
            padding: '40px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            position: 'relative',
          }}
        >
          {/* 背景裝飾 */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 0.1,
              display: 'flex',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '-50px',
                left: '-50px',
                width: '150px',
                height: '150px',
                background: 'white',
                borderRadius: '50%',
                filter: 'blur(40px)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: '-50px',
                right: '-50px',
                width: '150px',
                height: '150px',
                background: 'white',
                borderRadius: '50%',
                filter: 'blur(40px)',
              }}
            />
          </div>

          {/* 主要內容 */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              zIndex: 1,
            }}
          >
            {/* 遊戲類型圖標 */}
            <div
              style={{
                fontSize: 60,
                marginBottom: 15,
                filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2))',
              }}
            >
              {gameIcon}
            </div>

            {/* 遊戲類型標籤 */}
            <div
              style={{
                fontSize: 14,
                color: 'rgba(255, 255, 255, 0.95)',
                marginBottom: 25,
                fontWeight: 600,
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
              }}
            >
              {gameTypeName}
            </div>

            {/* 詞彙列表 */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                width: '100%',
                maxWidth: 320,
              }}
            >
              {vocabulary.slice(0, 3).map((word, index) => (
                <div
                  key={index}
                  style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    padding: '10px 18px',
                    borderRadius: 8,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                  }}
                >
                  <span
                    style={{
                      fontWeight: 600,
                      color: '#1f2937',
                      fontSize: 13,
                    }}
                  >
                    {word.english}
                  </span>
                  <span
                    style={{
                      color: '#6b7280',
                      fontSize: 13,
                    }}
                  >
                    {word.chinese}
                  </span>
                </div>
              ))}
            </div>

            {/* 詞彙數量提示 */}
            {vocabulary.length > 3 && (
              <div
                style={{
                  marginTop: 12,
                  fontSize: 11,
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontWeight: 500,
                }}
              >
                +{vocabulary.length - 3} 個詞彙
              </div>
            )}
          </div>

          {/* 底部品牌標識 */}
          <div
            style={{
              position: 'absolute',
              bottom: 15,
              right: 20,
              fontSize: 10,
              color: 'rgba(255, 255, 255, 0.6)',
              fontWeight: 500,
              letterSpacing: '0.5px',
            }}
          >
            EduCreate
          </div>
        </div>
      ),
      {
        width: 400,
        height: 300,
      }
    );
  } catch (error) {
    console.error('Failed to generate OG image:', error);
    
    // 返回錯誤預覽圖
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            padding: '40px',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 20 }}>⚠️</div>
          <div style={{ fontSize: 16, color: 'white', fontWeight: 600 }}>
            預覽圖生成失敗
          </div>
        </div>
      ),
      {
        width: 400,
        height: 300,
      }
    );
  }
}

// 輔助函數：獲取遊戲圖標
function getGameIcon(gameType: string): string {
  const normalizedType = gameType.toLowerCase();
  return GAME_ICONS[normalizedType] || GAME_ICONS[gameType] || '🎮';
}

// 輔助函數：獲取遊戲類型名稱
function getGameTypeName(gameType: string): string {
  const normalizedType = gameType.toLowerCase();
  return GAME_TYPE_NAMES[normalizedType] || GAME_TYPE_NAMES[gameType] || gameType;
}

// 輔助函數：獲取遊戲漸變色
function getGameGradient(gameType: string): { from: string; to: string } {
  const normalizedType = gameType.toLowerCase();
  return GAME_GRADIENTS[normalizedType] || GAME_GRADIENTS[gameType] || { from: '#667eea', to: '#764ba2' };
}

