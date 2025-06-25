import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  };
  content: any;
  settings: any;
  isPublic: boolean;
  tags: string[];
  difficultyLevel: number;
  estimatedDuration?: number;
}

interface ActivityFormData {
  title: string;
  description: string;
  content: any;
  settings: any;
  isPublic: boolean;
  tags: string[];
  difficultyLevel: number;
  estimatedDuration?: number;
}

const EditActivityPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [formData, setFormData] = useState<ActivityFormData>({
    title: '',
    description: '',
    content: {},
    settings: {},
    isPublic: false,
    tags: [],
    difficultyLevel: 1,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'content' | 'settings'>('basic');

  const { user, apiRequest } = useAuth();
  const navigate = useNavigate();

  // 載入活動數據
  useEffect(() => {
    const loadActivity = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const response = await apiRequest(`/activities/${id}`);
        const activityData = response.data.activity;
        
        // 檢查用戶權限
        if (activityData.user.id !== user?.id) {
          toast.error('您沒有權限編輯此活動');
          navigate('/dashboard');
          return;
        }

        setActivity(activityData);
        setFormData({
          title: activityData.title,
          description: activityData.description || '',
          content: activityData.content,
          settings: activityData.settings,
          isPublic: activityData.isPublic,
          tags: activityData.tags,
          difficultyLevel: activityData.difficultyLevel,
          estimatedDuration: activityData.estimatedDuration,
        });
      } catch (error) {
        console.error('Failed to load activity:', error);
        toast.error('載入活動失敗');
        navigate('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    loadActivity();
  }, [id, user, apiRequest, navigate]);

  // 保存活動
  const handleSave = async () => {
    if (!activity) return;

    if (!formData.title.trim()) {
      toast.error('請輸入活動標題');
      return;
    }

    setIsSaving(true);

    try {
      const response = await apiRequest(`/activities/${activity.id}`, {
        method: 'PUT',
        body: JSON.stringify(formData),
      });

      toast.success('活動保存成功！');
      setActivity(response.data.activity);
    } catch (error) {
      console.error('Save activity error:', error);
      toast.error('保存活動失敗');
    } finally {
      setIsSaving(false);
    }
  };

  // 刪除活動
  const handleDelete = async () => {
    if (!activity) return;

    if (!confirm('確定要刪除這個活動嗎？此操作無法撤銷。')) {
      return;
    }

    try {
      await apiRequest(`/activities/${activity.id}`, {
        method: 'DELETE',
      });

      toast.success('活動已刪除');
      navigate('/dashboard');
    } catch (error) {
      console.error('Delete activity error:', error);
      toast.error('刪除活動失敗');
    }
  };

  const handleInputChange = (field: keyof ActivityFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
          <p className="text-gray-600 mb-6">您訪問的活動可能已被刪除</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 頁面標題 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">編輯活動</h1>
              <p className="text-gray-600 mt-2">修改您的 {activity.template.name} 活動</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(`/activities/${activity.id}`)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSaving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>

        {/* 標籤頁 */}
        <div className="bg-white rounded-xl shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'basic', name: '基本信息', icon: '📝' },
                { id: 'content', name: '遊戲內容', icon: '🎮' },
                { id: 'settings', name: '遊戲設置', icon: '⚙️' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* 基本信息標籤 */}
            {activeTab === 'basic' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* 活動標題 */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    活動標題 *
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="輸入活動標題"
                  />
                </div>

                {/* 活動描述 */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    活動描述
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="描述這個活動的目的和內容"
                  />
                </div>

                {/* 難度等級 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    難度等級
                  </label>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => handleInputChange('difficultyLevel', level)}
                        className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                          formData.difficultyLevel >= level
                            ? 'bg-yellow-400 text-white'
                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        }`}
                      >
                        ⭐
                      </button>
                    ))}
                  </div>
                </div>

                {/* 預估時間 */}
                <div>
                  <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                    預估時間（分鐘）
                  </label>
                  <input
                    type="number"
                    id="duration"
                    value={formData.estimatedDuration || ''}
                    onChange={(e) => handleInputChange('estimatedDuration', e.target.value ? parseInt(e.target.value) : undefined)}
                    min="1"
                    max="120"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="預估完成時間"
                  />
                </div>

                {/* 標籤 */}
                <div>
                  <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                    標籤（用逗號分隔）
                  </label>
                  <input
                    type="text"
                    id="tags"
                    value={formData.tags.join(', ')}
                    onChange={(e) => handleInputChange('tags', e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="例如：數學, 小學, 加法"
                  />
                </div>

                {/* 公開設置 */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={formData.isPublic}
                    onChange={(e) => handleInputChange('isPublic', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-700">
                    公開活動（其他用戶可以查看和複製）
                  </label>
                </div>
              </motion.div>
            )}

            {/* 遊戲內容標籤 */}
            {activeTab === 'content' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🚧</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    內容編輯器開發中
                  </h3>
                  <p className="text-gray-600 mb-6">
                    高級內容編輯器正在開發中，敬請期待！
                  </p>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">當前內容預覽：</h4>
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap overflow-auto max-h-64 text-left">
                      {JSON.stringify(formData.content, null, 2)}
                    </pre>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 遊戲設置標籤 */}
            {activeTab === 'settings' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">⚙️</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    設置編輯器開發中
                  </h3>
                  <p className="text-gray-600 mb-6">
                    遊戲設置編輯器正在開發中，敬請期待！
                  </p>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">當前設置預覽：</h4>
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap overflow-auto max-h-64 text-left">
                      {JSON.stringify(formData.settings, null, 2)}
                    </pre>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* 危險操作區域 */}
        <div className="bg-white rounded-xl shadow-sm border border-red-200">
          <div className="px-6 py-4 border-b border-red-200">
            <h3 className="text-lg font-medium text-red-900">危險操作</h3>
            <p className="text-sm text-red-600">以下操作無法撤銷，請謹慎操作</p>
          </div>
          <div className="p-6">
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              🗑️ 刪除活動
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditActivityPage;
