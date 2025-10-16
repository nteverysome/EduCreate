'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Play, RotateCcw, Clock, Target, Trophy, Star } from 'lucide-react';

interface Activity {
  id: string;
  title: string;
  description?: string;
  gameType: string;
  difficulty?: string;
  estimatedTime?: string;
  geptLevel?: string;
  totalWords: number;
  content: any;
  elements: any;
  vocabularyItems: any[];
  gameSettings: any;
}

interface GameScore {
  score: number;
  total: number;
  accuracy: number;
  timeSpent: number;
}

export default function AnonymousGamePage() {
  const params = useParams();
  const activityId = params.activityId as string;
  const token = params.token as string;

  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [finalScore, setFinalScore] = useState<GameScore | null>(null);

  // 載入活動數據
  useEffect(() => {
    loadActivity();
  }, [activityId, token]);

  const loadActivity = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/share/${activityId}/${token}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '載入遊戲失敗');
      }

      const data = await response.json();
      setActivity(data.activity);
    } catch (error) {
      console.error('Error loading activity:', error);
      setError(error instanceof Error ? error.message : '載入遊戲失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleGameComplete = (score: GameScore) => {
    setFinalScore(score);
    setGameCompleted(true);
    
    // 可選：記錄匿名完成統計
    recordCompletion(score);
  };

  const recordCompletion = async (score: GameScore) => {
    try {
      await fetch(`/api/share/${activityId}/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          score: score.score,
          timeSpent: score.timeSpent,
          completedAt: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error('Error recording completion:', error);
    }
  };

  const restartGame = () => {
    setGameStarted(false);
    setGameCompleted(false);
    setFinalScore(null);
  };

  // 載入中狀態
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">載入遊戲中...</p>
        </div>
      </div>
    );
  }

  // 錯誤狀態
  if (error || !activity) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">遊戲無法載入</h1>
          <p className="text-gray-600 mb-6">
            {error || '找不到這個遊戲，可能連結已過期或遊戲已停止分享。'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            重新載入
          </button>
        </div>
      </div>
    );
  }

  // 遊戲完成狀態
  if (gameCompleted && finalScore) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-green-600 mb-4">遊戲完成！</h2>
          
          <div className="text-5xl font-bold text-blue-600 mb-2">
            {finalScore.score}
          </div>
          <p className="text-gray-600 mb-6">分 / {finalScore.total} 題</p>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <Target className="w-6 h-6 mx-auto mb-2 text-green-600" />
              <div className="font-semibold text-sm text-gray-700">正確率</div>
              <div className="text-xl font-bold text-green-600">
                {Math.round(finalScore.accuracy)}%
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <Clock className="w-6 h-6 mx-auto mb-2 text-blue-600" />
              <div className="font-semibold text-sm text-gray-700">用時</div>
              <div className="text-xl font-bold text-blue-600">
                {Math.round(finalScore.timeSpent)}秒
              </div>
            </div>
          </div>

          {/* 成績評價 */}
          <div className="mb-6">
            {finalScore.accuracy >= 90 ? (
              <div className="flex items-center justify-center gap-2 text-yellow-600">
                <Star className="w-5 h-5 fill-current" />
                <span className="font-semibold">優秀！</span>
              </div>
            ) : finalScore.accuracy >= 70 ? (
              <div className="flex items-center justify-center gap-2 text-blue-600">
                <Trophy className="w-5 h-5" />
                <span className="font-semibold">很好！</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 text-green-600">
                <Target className="w-5 h-5" />
                <span className="font-semibold">繼續加油！</span>
              </div>
            )}
          </div>
          
          <button
            onClick={restartGame}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            再玩一次
          </button>

          <p className="mt-4 text-xs text-gray-400">
            這是社區分享的遊戲，結果不會被保存
          </p>
        </div>
      </div>
    );
  }

  // 遊戲開始前的介紹頁面
  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">🎮</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {activity.title}
          </h1>
          {activity.description && (
            <p className="text-gray-600 mb-6">{activity.description}</p>
          )}
          
          {/* 遊戲信息 */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">遊戲類型：</span>
                <span className="font-medium">{activity.gameType}</span>
              </div>
              <div>
                <span className="text-gray-500">單字數量：</span>
                <span className="font-medium">{activity.totalWords}</span>
              </div>
              {activity.difficulty && (
                <div>
                  <span className="text-gray-500">難度：</span>
                  <span className="font-medium">{activity.difficulty}</span>
                </div>
              )}
              {activity.estimatedTime && (
                <div>
                  <span className="text-gray-500">預計時間：</span>
                  <span className="font-medium">{activity.estimatedTime}</span>
                </div>
              )}
              {activity.geptLevel && (
                <div className="col-span-2">
                  <span className="text-gray-500">GEPT 等級：</span>
                  <span className="font-medium">{activity.geptLevel}</span>
                </div>
              )}
            </div>
          </div>
          
          <button
            onClick={() => setGameStarted(true)}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-lg"
          >
            <Play className="w-5 h-5" />
            開始遊戲
          </button>
          
          <p className="mt-4 text-xs text-gray-400">
            無需註冊，立即開始！結果不會被保存。
          </p>
        </div>
      </div>
    );
  }

  // 實際遊戲組件（這裡需要根據具體的遊戲類型來渲染）
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* 這裡應該渲染實際的遊戲組件 */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl w-full text-center">
          <h2 className="text-xl font-bold mb-4">遊戲進行中...</h2>
          <p className="text-gray-600 mb-6">
            遊戲組件將在這裡渲染。需要根據 activity.gameType 來載入對應的遊戲組件。
          </p>
          
          {/* 臨時的完成按鈕，用於測試 */}
          <button
            onClick={() => handleGameComplete({
              score: 85,
              total: 100,
              accuracy: 85,
              timeSpent: 120
            })}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            模擬完成遊戲
          </button>
        </div>
      </div>
    </div>
  );
}
