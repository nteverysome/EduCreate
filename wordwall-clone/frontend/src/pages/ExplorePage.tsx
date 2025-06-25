import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  user: {
    username: string;
    displayName: string;
  };
  isPublic: boolean;
  tags: string[];
  difficultyLevel: number;
  estimatedDuration?: number;
  createdAt: string;
  _count: {
    gameResults: number;
    likes: number;
  };
}

const ExplorePage: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [sortBy, setSortBy] = useState<'createdAt' | 'playCount' | 'likeCount'>('createdAt');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const { apiRequest } = useAuth();

  const templateTypes = [
    { value: '', label: '所有類型' },
    { value: 'QUIZ', label: '測驗', icon: '❓' },
    { value: 'MATCH_UP', label: '配對', icon: '🔗' },
    { value: 'SPIN_WHEEL', label: '轉盤', icon: '🎡' },
    { value: 'GROUP_SORT', label: '分組', icon: '📂' },
    { value: 'FLASH_CARDS', label: '閃卡', icon: '🃏' },
    { value: 'ANAGRAM', label: '字謎', icon: '🧩' },
    { value: 'FIND_MATCH', label: '記憶', icon: '🎯' },
    { value: 'OPEN_BOX', label: '開箱', icon: '📦' },
  ];

  // 載入活動
  const loadActivities = async (reset = false) => {
    try {
      const currentPage = reset ? 1 : page;
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        isPublic: 'true',
        sortBy,
        sortOrder: 'desc',
        ...(searchTerm && { search: searchTerm }),
        ...(selectedTemplate && { templateType: selectedTemplate }),
      });

      const response = await apiRequest(`/activities/public?${params}`);
      const newActivities = response.data.activities;

      if (reset) {
        setActivities(newActivities);
        setPage(2);
      } else {
        setActivities(prev => [...prev, ...newActivities]);
        setPage(prev => prev + 1);
      }

      setHasMore(response.data.pagination.hasNext);
    } catch (error) {
      console.error('Failed to load activities:', error);
      toast.error('載入活動失敗');
    } finally {
      setIsLoading(false);
    }
  };

  // 初始載入
  useEffect(() => {
    setIsLoading(true);
    loadActivities(true);
  }, [searchTerm, selectedTemplate, sortBy]);

  const getTemplateIcon = (type: string) => {
    const template = templateTypes.find(t => t.value === type);
    return template?.icon || '🎮';
  };

  const getDifficultyStars = (level: number) => {
    return '⭐'.repeat(level) + '☆'.repeat(5 - level);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return '';
    if (minutes < 60) return `${minutes} 分鐘`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours} 小時 ${mins} 分鐘`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 頁面標題 */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              探索活動
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              發現由教師創建的精彩互動學習活動，找到適合您的學習內容
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 搜索和篩選 */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* 搜索框 */}
            <div className="md:col-span-2">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                搜索活動
              </label>
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="輸入關鍵字搜索..."
              />
            </div>

            {/* 模板類型篩選 */}
            <div>
              <label htmlFor="template" className="block text-sm font-medium text-gray-700 mb-2">
                遊戲類型
              </label>
              <select
                id="template"
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {templateTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.icon ? `${type.icon} ${type.label}` : type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 排序方式 */}
            <div>
              <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-2">
                排序方式
              </label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="createdAt">最新創建</option>
                <option value="playCount">最多遊戲</option>
                <option value="likeCount">最多喜歡</option>
              </select>
            </div>
          </div>
        </div>

        {/* 活動網格 */}
        {isLoading && activities.length === 0 ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">載入中...</p>
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              沒有找到活動
            </h3>
            <p className="text-gray-600">
              嘗試調整搜索條件或瀏覽其他類型的活動
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-200"
                >
                  <div className="p-6">
                    {/* 活動標題和圖標 */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <div className="text-2xl mr-3">
                            {getTemplateIcon(activity.template.type)}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                              {activity.title}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {activity.template.name}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 活動描述 */}
                    {activity.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {activity.description}
                      </p>
                    )}

                    {/* 標籤 */}
                    {activity.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {activity.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {tag}
                          </span>
                        ))}
                        {activity.tags.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{activity.tags.length - 3} 更多
                          </span>
                        )}
                      </div>
                    )}

                    {/* 難度和時間 */}
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center">
                        <span className="mr-2">難度:</span>
                        <span>{getDifficultyStars(activity.difficultyLevel)}</span>
                      </div>
                      {activity.estimatedDuration && (
                        <span>{formatDuration(activity.estimatedDuration)}</span>
                      )}
                    </div>

                    {/* 統計信息 */}
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                      <span>🎮 {activity._count.gameResults} 次遊戲</span>
                      <span>❤️ {activity._count.likes} 個喜歡</span>
                    </div>

                    {/* 作者和日期 */}
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span>👤 {activity.user.displayName || activity.user.username}</span>
                      <span>{formatDate(activity.createdAt)}</span>
                    </div>

                    {/* 操作按鈕 */}
                    <div className="flex space-x-2">
                      <Link
                        to={`/activities/${activity.id}`}
                        className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        查看詳情
                      </Link>
                      <Link
                        to={`/play/${activity.id}`}
                        className="flex-1 bg-green-600 text-white text-center py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                      >
                        開始遊戲
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* 載入更多按鈕 */}
            {hasMore && (
              <div className="text-center mt-8">
                <button
                  onClick={() => loadActivities(false)}
                  disabled={isLoading}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      載入中...
                    </>
                  ) : (
                    '載入更多'
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ExplorePage;
