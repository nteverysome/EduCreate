import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';

interface Activity {
  id: string;
  title: string;
  description?: string;
  template: {
    name: string;
    type: string;
    iconUrl?: string;
  };
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  _count: {
    gameResults: number;
    likes: number;
    gameSessions: number;
  };
}

interface DashboardStats {
  totalActivities: number;
  totalPlays: number;
  totalLikes: number;
  averageScore: number;
}

const DashboardPage: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalActivities: 0,
    totalPlays: 0,
    totalLikes: 0,
    averageScore: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const { user, apiRequest } = useAuth();
  const navigate = useNavigate();

  // 載入用戶活動和統計
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // 並行載入活動和統計數據
        const [activitiesResponse, statsResponse] = await Promise.all([
          apiRequest('/activities/user/me?limit=12'),
          apiRequest('/users/me/stats')
        ]);

        setActivities(activitiesResponse.data.activities);
        setStats(statsResponse.data.stats);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        toast.error('載入數據失敗');
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      loadDashboardData();
    }
  }, [user, apiRequest]);

  const handleDeleteActivity = async (activityId: string) => {
    if (!confirm('確定要刪除這個活動嗎？此操作無法撤銷。')) {
      return;
    }

    try {
      await apiRequest(`/activities/${activityId}`, {
        method: 'DELETE',
      });

      setActivities(prev => prev.filter(activity => activity.id !== activityId));
      toast.success('活動已刪除');
    } catch (error) {
      console.error('Delete activity error:', error);
      toast.error('刪除活動失敗');
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">請先登入</h2>
          <Link
            to="/login"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            前往登入
          </Link>
        </div>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 頁面標題 */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                歡迎回來，{user.displayName}！
              </h1>
              <p className="text-gray-600 mt-2">
                管理您的活動和查看學習統計
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/create"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                ➕ 創建新活動
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 統計卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center">
              <div className="text-3xl mr-4">📚</div>
              <div>
                <p className="text-sm font-medium text-gray-600">總活動數</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalActivities}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center">
              <div className="text-3xl mr-4">🎮</div>
              <div>
                <p className="text-sm font-medium text-gray-600">總遊戲次數</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPlays}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center">
              <div className="text-3xl mr-4">❤️</div>
              <div>
                <p className="text-sm font-medium text-gray-600">總喜歡數</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalLikes}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center">
              <div className="text-3xl mr-4">📊</div>
              <div>
                <p className="text-sm font-medium text-gray-600">平均分數</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageScore.toFixed(1)}%</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* 活動列表 */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">我的活動</h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setView('grid')}
                  className={`p-2 rounded-md ${view === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  ⊞
                </button>
                <button
                  onClick={() => setView('list')}
                  className={`p-2 rounded-md ${view === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  ☰
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            {activities.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  還沒有創建任何活動
                </h3>
                <p className="text-gray-600 mb-6">
                  開始創建您的第一個互動式學習活動吧！
                </p>
                <Link
                  to="/create"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  ➕ 創建活動
                </Link>
              </div>
            ) : (
              <div className={view === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                {activities.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow ${
                      view === 'list' ? 'flex items-center justify-between' : ''
                    }`}
                  >
                    <div className={view === 'list' ? 'flex items-center flex-1' : ''}>
                      <div className={`text-3xl ${view === 'list' ? 'mr-4' : 'mb-4'}`}>
                        {getTemplateIcon(activity.template.type)}
                      </div>
                      
                      <div className={view === 'list' ? 'flex-1' : ''}>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {activity.title}
                        </h3>
                        
                        {activity.description && (
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {activity.description}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                          <span>{activity.template.name}</span>
                          <span>{formatDate(activity.updatedAt)}</span>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                          <span>🎮 {activity._count.gameResults} 次遊戲</span>
                          <span>❤️ {activity._count.likes} 個喜歡</span>
                          {activity.isPublic && <span className="text-green-600">🌐 公開</span>}
                        </div>
                      </div>
                    </div>
                    
                    <div className={`flex ${view === 'list' ? 'space-x-2' : 'space-x-2 justify-between'}`}>
                      <Link
                        to={`/activities/${activity.id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        查看
                      </Link>
                      <Link
                        to={`/activities/${activity.id}/edit`}
                        className="text-green-600 hover:text-green-800 text-sm font-medium"
                      >
                        編輯
                      </Link>
                      <button
                        onClick={() => handleDeleteActivity(activity.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        刪除
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
