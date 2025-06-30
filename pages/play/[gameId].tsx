import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

interface GameData {
  id: string;
  title: string;
  description: string;
  type: string;
  content: any;
  isPublic: boolean;
  createdAt: string;
  author: string;
}

export default function PlayGame() {
  const router = useRouter();
  const { gameId } = router.query;
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEmbedded, setIsEmbedded] = useState(false);

  useEffect(() => {
    if (gameId) {
      loadGameData();
      checkIfEmbedded();
    }
  }, [gameId]);

  const checkIfEmbedded = () => {
    const urlParams = new URLSearchParams(window.location.search);
    setIsEmbedded(urlParams.get('embed') === 'true');
  };

  const loadGameData = async () => {
    setLoading(true);
    try {
      // 從 localStorage 獲取遊戲數據（演示用）
      const savedGames = localStorage.getItem('saved_games');
      const games = savedGames ? JSON.parse(savedGames) : [];
      
      let game = games.find((g: GameData) => g.id === gameId);
      
      // 如果沒有找到，創建演示數據
      if (!game) {
        game = {
          id: gameId as string,
          title: '英語動物詞彙學習',
          description: '學習常見動物的英文名稱和中文對照',
          type: 'quiz',
          content: {
            questions: [
              {
                question: '這個動物的英文是什麼？',
                image: '🐱',
                options: ['Cat', 'Dog', 'Bird', 'Fish'],
                correct: 0,
                explanation: 'Cat 是貓的英文'
              },
              {
                question: '這個動物的英文是什麼？',
                image: '🐶',
                options: ['Cat', 'Dog', 'Bird', 'Fish'],
                correct: 1,
                explanation: 'Dog 是狗的英文'
              }
            ]
          },
          isPublic: true,
          createdAt: new Date().toISOString(),
          author: 'Demo Teacher'
        };
      }
      
      setGameData(game);
      
      // 更新瀏覽統計
      updateViewStats(game.id);
      
    } catch (err) {
      setError('載入遊戲失敗');
      console.error('載入遊戲錯誤:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateViewStats = (gameId: string) => {
    const statsKey = `share_stats_${gameId}`;
    const stats = localStorage.getItem(statsKey);
    const currentStats = stats ? JSON.parse(stats) : { views: 0, plays: 0, shares: 0 };
    
    currentStats.views += 1;
    localStorage.setItem(statsKey, JSON.stringify(currentStats));
  };

  const startGame = () => {
    if (gameData) {
      // 更新遊戲統計
      const statsKey = `share_stats_${gameData.id}`;
      const stats = localStorage.getItem(statsKey);
      const currentStats = stats ? JSON.parse(stats) : { views: 0, plays: 0, shares: 0 };
      
      currentStats.plays += 1;
      localStorage.setItem(statsKey, JSON.stringify(currentStats));
      
      // 跳轉到實際遊戲
      if (isEmbedded) {
        window.open(`/interactive-demo.html#${gameData.type}`, '_blank');
      } else {
        router.push(`/interactive-demo.html#${gameData.type}`);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">載入遊戲中...</p>
        </div>
      </div>
    );
  }

  if (error || !gameData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">遊戲不存在</h1>
          <p className="text-gray-600 mb-6">{error || '找不到指定的遊戲'}</p>
          <Link href="/" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
            返回首頁
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{gameData.title} - EduCreate</title>
        <meta name="description" content={gameData.description} />
        <meta property="og:title" content={gameData.title} />
        <meta property="og:description" content={gameData.description} />
        <meta property="og:type" content="game" />
        <meta property="og:url" content={`${process.env.NEXT_PUBLIC_BASE_URL}/play/${gameData.id}`} />
      </Head>

      <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 ${isEmbedded ? 'p-4' : ''}`}>
        {/* Navigation - 只在非嵌入模式顯示 */}
        {!isEmbedded && (
          <nav className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <Link href="/" className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                    E
                  </div>
                  <span className="text-xl font-bold text-gray-900">EduCreate</span>
                </Link>
                
                <div className="flex items-center space-x-4">
                  <Link href="/games-showcase" className="text-gray-600 hover:text-gray-900">
                    遊戲展示
                  </Link>
                  <Link href="/unified-content-manager.html" className="text-gray-600 hover:text-gray-900">
                    創建遊戲
                  </Link>
                </div>
              </div>
            </div>
          </nav>
        )}

        {/* Main Content */}
        <main className={`${isEmbedded ? '' : 'max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12'}`}>
          <div className="bg-white rounded-lg shadow-xl overflow-hidden">
            {/* Game Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{gameData.title}</h1>
                  <p className="text-blue-100 mb-4">{gameData.description}</p>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full">
                      {gameData.type === 'quiz' ? '❓ 測驗' : 
                       gameData.type === 'match' ? '🔗 配對' :
                       gameData.type === 'flashcard' ? '🃏 閃卡' : '🎮 遊戲'}
                    </span>
                    <span>作者: {gameData.author}</span>
                    <span>{new Date(gameData.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                
                {!isEmbedded && (
                  <div className="text-right">
                    <div className="text-4xl mb-2">🎯</div>
                    <div className="text-sm text-blue-100">準備開始遊戲</div>
                  </div>
                )}
              </div>
            </div>

            {/* Game Preview */}
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">遊戲內容預覽</h3>
                  {gameData.content.questions && (
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-lg font-semibold mb-2">
                          問題數量: {gameData.content.questions.length}
                        </div>
                        <div className="text-sm text-gray-600">
                          第一題預覽: {gameData.content.questions[0]?.question}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">遊戲說明</h3>
                  <div className="space-y-3 text-gray-600">
                    <div className="flex items-center space-x-2">
                      <span className="text-green-500">✓</span>
                      <span>選擇正確答案</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-green-500">✓</span>
                      <span>獲得即時反饋</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-green-500">✓</span>
                      <span>查看詳細解釋</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-green-500">✓</span>
                      <span>追蹤學習進度</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Start Game Button */}
              <div className="mt-8 text-center">
                <button
                  onClick={startGame}
                  className="bg-blue-600 text-white px-8 py-4 rounded-lg text-xl font-semibold hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
                >
                  🚀 開始遊戲
                </button>
              </div>

              {/* Powered by EduCreate - 只在嵌入模式顯示 */}
              {isEmbedded && (
                <div className="mt-6 text-center">
                  <a 
                    href="/" 
                    target="_blank" 
                    className="text-sm text-gray-500 hover:text-blue-600"
                  >
                    Powered by EduCreate
                  </a>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
