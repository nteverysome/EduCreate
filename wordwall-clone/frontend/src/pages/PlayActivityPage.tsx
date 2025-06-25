import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { GameRegistry } from '../components/games/GameRegistry';

interface Activity {
  id: string;
  title: string;
  description?: string;
  template: {
    id: string;
    name: string;
    type: string;
  };
  user: {
    username: string;
    displayName: string;
  };
  content: any;
  settings: any;
  difficultyLevel: number;
  estimatedDuration?: number;
}

interface GameResult {
  score: number;
  totalQuestions?: number;
  percentage: number;
  timeSpent: number;
  answers?: any[];
  [key: string]: any;
}

const PlayActivityPage: React.FC = () => {
  const { activityId } = useParams<{ activityId: string }>();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);

  const { user, apiRequest } = useAuth();
  const navigate = useNavigate();

  // 載入活動數據
  useEffect(() => {
    const loadActivity = async () => {
      if (!activityId) return;

      try {
        setIsLoading(true);
        const response = await apiRequest(`/activities/${activityId}`);
        setActivity(response.data.activity);
      } catch (error) {
        console.error('Failed to load activity:', error);
        toast.error('載入活動失敗');
        navigate('/explore');
      } finally {
        setIsLoading(false);
      }
    };

    loadActivity();
  }, [activityId, apiRequest, navigate]);

  // 開始遊戲
  const handleStartGame = () => {
    setGameStarted(true);
  };

  // 遊戲完成處理
  const handleGameComplete = async (result: GameResult) => {
    setGameResult(result);
    setGameCompleted(true);

    // 保存遊戲結果到後端
    if (user && activity) {
      try {
        await apiRequest('/game-results', {
          method: 'POST',
          body: JSON.stringify({
            activityId: activity.id,
            score: result.score,
            maxScore: result.totalQuestions || 100,
            percentage: result.percentage,
            timeSpent: result.timeSpent,
            answers: result.answers || [],
            metadata: {
              gameType: activity.template.type,
              ...result
            }
          }),
        });
      } catch (error) {
        console.error('Failed to save game result:', error);
        // 不顯示錯誤，因為這不影響用戶體驗
      }
    }
  };

  // 重新開始遊戲
  const handleRestartGame = () => {
    setGameStarted(false);
    setGameCompleted(false);
    setGameResult(null);
  };

  // 返回活動詳情
  const handleBackToActivity = () => {
    navigate(`/activities/${activityId}`);
  };

  const getDifficultyStars = (level: number) => {
    return '⭐'.repeat(level) + '☆'.repeat(5 - level);
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return '未設定';
    if (minutes < 60) return `${minutes} 分鐘`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours} 小時 ${mins} 分鐘`;
  };

  const formatTime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes} 分 ${remainingSeconds} 秒`;
    }
    return `${remainingSeconds} 秒`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">載入遊戲中...</p>
        </div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">遊戲不存在</h2>
          <p className="text-gray-600 mb-6">您訪問的遊戲可能已被刪除或設為私有</p>
          <button
            onClick={() => navigate('/explore')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            瀏覽其他遊戲
          </button>
        </div>
      </div>
    );
  }

  // 獲取遊戲組件
  const gameTemplate = GameRegistry[activity.template.type as keyof typeof GameRegistry];
  
  if (!gameTemplate || !gameTemplate.isAvailable) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🚧</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">遊戲暫不可用</h2>
          <p className="text-gray-600 mb-6">此遊戲類型正在開發中</p>
          <button
            onClick={() => navigate('/explore')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            瀏覽其他遊戲
          </button>
        </div>
      </div>
    );
  }

  const GameComponent = gameTemplate.component;

  // 遊戲完成結果頁面
  if (gameCompleted && gameResult) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-lg p-8 text-center"
          >
            <div className="text-6xl mb-6">
              {gameResult.percentage >= 80 ? '🎉' : gameResult.percentage >= 60 ? '👍' : '💪'}
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-4">遊戲完成！</h2>
            
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-3xl font-bold text-blue-600">{gameResult.score}</div>
                <div className="text-sm text-gray-600">
                  {gameResult.totalQuestions ? `/ ${gameResult.totalQuestions}` : '分數'}
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-3xl font-bold text-green-600">{gameResult.percentage.toFixed(1)}%</div>
                <div className="text-sm text-gray-600">正確率</div>
              </div>
            </div>
            
            <div className="text-gray-600 mb-8">
              <p className="mb-2">用時：{formatTime(gameResult.timeSpent)}</p>
              <p>遊戲：{activity.title}</p>
              <p>作者：{activity.user.displayName || activity.user.username}</p>
            </div>
            
            <div className="space-y-2 mb-8">
              {gameResult.percentage >= 90 && (
                <p className="text-green-600 font-semibold">🏆 完美！您的表現非常出色！</p>
              )}
              {gameResult.percentage >= 80 && gameResult.percentage < 90 && (
                <p className="text-blue-600 font-semibold">⭐ 優秀！繼續保持！</p>
              )}
              {gameResult.percentage >= 60 && gameResult.percentage < 80 && (
                <p className="text-yellow-600 font-semibold">👍 不錯！還有進步空間！</p>
              )}
              {gameResult.percentage < 60 && (
                <p className="text-orange-600 font-semibold">💪 多練習會更好！</p>
              )}
            </div>
            
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleRestartGame}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                🔄 再玩一次
              </button>
              <button
                onClick={handleBackToActivity}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                📋 查看詳情
              </button>
              <button
                onClick={() => navigate('/explore')}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                🎮 更多遊戲
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // 遊戲進行中
  if (gameStarted) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* 遊戲頂部信息欄 */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button
                  onClick={() => {
                    if (confirm('確定要退出遊戲嗎？進度將不會保存。')) {
                      setGameStarted(false);
                    }
                  }}
                  className="text-gray-500 hover:text-gray-700 mr-4"
                >
                  ← 退出
                </button>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">{activity.title}</h1>
                  <p className="text-sm text-gray-600">{activity.template.name}</p>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                {activity.user.displayName || activity.user.username}
              </div>
            </div>
          </div>
        </div>

        {/* 遊戲內容 */}
        <div className="py-8">
          <GameComponent
            {...activity.content}
            {...activity.settings}
            onComplete={handleGameComplete}
          />
        </div>
      </div>
    );
  }

  // 遊戲開始前的介紹頁面
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-8"
        >
          {/* 返回按鈕 */}
          <div className="mb-6">
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
            >
              ← 返回
            </button>
          </div>

          {/* 遊戲信息 */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">{gameTemplate.icon}</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{activity.title}</h1>
            <p className="text-lg text-gray-600 mb-4">{activity.template.name}</p>
            
            {activity.description && (
              <p className="text-gray-700 mb-6">{activity.description}</p>
            )}
          </div>

          {/* 遊戲詳情 */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="text-center">
              <div className="text-2xl mb-2">{getDifficultyStars(activity.difficultyLevel)}</div>
              <div className="text-sm text-gray-600">難度等級</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">⏱️</div>
              <div className="text-sm text-gray-600">{formatDuration(activity.estimatedDuration)}</div>
            </div>
          </div>

          {/* 作者信息 */}
          <div className="text-center mb-8 text-gray-600">
            <p>由 {activity.user.displayName || activity.user.username} 創建</p>
          </div>

          {/* 遊戲說明 */}
          <div className="bg-blue-50 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-blue-900 mb-2">遊戲說明：</h3>
            <p className="text-blue-800 text-sm">{gameTemplate.description}</p>
          </div>

          {/* 開始按鈕 */}
          <div className="text-center">
            <button
              onClick={handleStartGame}
              className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-lg font-semibold"
            >
              🎮 開始遊戲
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PlayActivityPage;
