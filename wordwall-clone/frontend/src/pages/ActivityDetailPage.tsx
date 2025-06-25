import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';

interface Activity {
  id: string;
  title: string;
  description?: string;
  template: {
    id: string;
    name: string;
    type: string;
    iconUrl?: string;
  };
  user: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
  };
  content: any;
  settings: any;
  isPublic: boolean;
  tags: string[];
  difficultyLevel: number;
  estimatedDuration?: number;
  createdAt: string;
  updatedAt: string;
  _count: {
    gameResults: number;
    likes: number;
    gameSessions: number;
  };
}

const ActivityDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [showContent, setShowContent] = useState(false);

  const { user, apiRequest } = useAuth();
  const navigate = useNavigate();

  // 載入活動詳情
  useEffect(() => {
    const loadActivity = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const response = await apiRequest(`/activities/${id}`);
        setActivity(response.data.activity);
        
        // 檢查是否已喜歡（如果用戶已登入）
        if (user) {
          try {
            const likeResponse = await apiRequest(`/activities/${id}/like-status`);
            setIsLiked(likeResponse.data.isLiked);
          } catch (error) {
            // 忽略錯誤，可能是 API 不存在
          }
        }
      } catch (error) {
        console.error('Failed to load activity:', error);
        toast.error('載入活動失敗');
        navigate('/explore');
      } finally {
        setIsLoading(false);
      }
    };

    loadActivity();
  }, [id, user, apiRequest, navigate]);

  // 切換喜歡狀態
  const toggleLike = async () => {
    if (!user) {
      toast.error('請先登入');
      navigate('/login');
      return;
    }

    if (!activity) return;

    try {
      const response = await apiRequest(`/activities/${activity.id}/like`, {
        method: 'POST',
      });
      
      setIsLiked(response.data.isLiked);
      setActivity(prev => prev ? {
        ...prev,
        _count: {
          ...prev._count,
          likes: prev._count.likes + (response.data.isLiked ? 1 : -1)
        }
      } : null);
      
      toast.success(response.data.isLiked ? '已添加到喜歡' : '已取消喜歡');
    } catch (error) {
      console.error('Toggle like error:', error);
      toast.error('操作失敗');
    }
  };

  // 複製活動
  const duplicateActivity = async () => {
    if (!user) {
      toast.error('請先登入');
      navigate('/login');
      return;
    }

    if (!activity) return;

    try {
      const response = await apiRequest(`/activities/${activity.id}/duplicate`, {
        method: 'POST',
        body: JSON.stringify({
          title: `${activity.title} (副本)`
        }),
      });
      
      toast.success('活動複製成功！');
      navigate(`/activities/${response.data.activity.id}/edit`);
    } catch (error) {
      console.error('Duplicate activity error:', error);
      toast.error('複製活動失敗');
    }
  };

  const getTemplateIcon = (type: string) => {
    const iconMap: Record<string, string> = {
      QUIZ: '❓',
      MATCH_UP: '🔗',
      SPIN_WHEEL: '🎡',
      GROUP_SORT: '📂',
      FLASH_CARDS: '🃏',
      ANAGRAM: '🧩',
      FIND_MATCH: '🎯',
      OPEN_BOX: '📦',
    };
    return iconMap[type] || '🎮';
  };

  const getDifficultyStars = (level: number) => {
    return '⭐'.repeat(level) + '☆'.repeat(5 - level);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return '未設定';
    if (minutes < 60) return `${minutes} 分鐘`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours} 小時 ${mins} 分鐘`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">活動不存在</h2>
          <p className="text-gray-600 mb-6">您訪問的活動可能已被刪除或設為私有</p>
          <Link
            to="/explore"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            瀏覽其他活動
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = user?.id === activity.user.id;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 返回按鈕 */}
        <div className="mb-6">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            ← 返回
          </button>
        </div>

        {/* 活動標題區域 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm p-8 mb-8"
        >
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center flex-1">
              <div className="text-4xl mr-4">
                {getTemplateIcon(activity.template.type)}
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {activity.title}
                </h1>
                <p className="text-lg text-gray-600">
                  {activity.template.name} 遊戲
                </p>
              </div>
            </div>

            {/* 操作按鈕 */}
            <div className="flex items-center space-x-3">
              {user && (
                <button
                  onClick={toggleLike}
                  className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isLiked
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {isLiked ? '❤️' : '🤍'} {activity._count.likes}
                </button>
              )}
              
              <Link
                to={`/play/${activity.id}`}
                className="inline-flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                🎮 開始遊戲
              </Link>
              
              {isOwner ? (
                <Link
                  to={`/activities/${activity.id}/edit`}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  ✏️ 編輯
                </Link>
              ) : user && (
                <button
                  onClick={duplicateActivity}
                  className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                >
                  📋 複製
                </button>
              )}
            </div>
          </div>

          {/* 活動描述 */}
          {activity.description && (
            <div className="mb-6">
              <p className="text-gray-700 leading-relaxed">
                {activity.description}
              </p>
            </div>
          )}

          {/* 標籤 */}
          {activity.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {activity.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* 活動信息 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-gray-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{getDifficultyStars(activity.difficultyLevel)}</div>
              <div className="text-sm text-gray-600">難度等級</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{formatDuration(activity.estimatedDuration)}</div>
              <div className="text-sm text-gray-600">預估時間</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{activity._count.gameResults}</div>
              <div className="text-sm text-gray-600">遊戲次數</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{activity._count.gameSessions}</div>
              <div className="text-sm text-gray-600">參與人數</div>
            </div>
          </div>
        </motion.div>

        {/* 作者信息 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm p-6 mb-8"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">作者信息</h2>
          <div className="flex items-center">
            <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg mr-4">
              {activity.user.displayName?.charAt(0).toUpperCase() || activity.user.username?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-medium text-gray-900">
                {activity.user.displayName || activity.user.username}
              </div>
              <div className="text-sm text-gray-600">
                創建於 {formatDate(activity.createdAt)}
              </div>
              {activity.updatedAt !== activity.createdAt && (
                <div className="text-sm text-gray-500">
                  更新於 {formatDate(activity.updatedAt)}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* 遊戲內容預覽 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">遊戲內容</h2>
            <button
              onClick={() => setShowContent(!showContent)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              {showContent ? '隱藏內容' : '查看內容'}
            </button>
          </div>

          {showContent ? (
            <div className="bg-gray-50 rounded-lg p-4">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap overflow-auto max-h-96">
                {JSON.stringify(activity.content, null, 2)}
              </pre>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">👁️</div>
              <p>點擊「查看內容」來預覽遊戲內容</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ActivityDetailPage;
