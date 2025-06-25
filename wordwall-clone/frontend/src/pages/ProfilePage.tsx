import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';

interface UserStats {
  totalActivities: number;
  totalGames: number;
  totalScore: number;
  averageScore: number;
  bestScore: number;
  totalTimeSpent: number;
}

const ProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'stats'>('profile');
  const [profileData, setProfileData] = useState({
    displayName: '',
    username: '',
    email: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [stats, setStats] = useState<UserStats>({
    totalActivities: 0,
    totalGames: 0,
    totalScore: 0,
    averageScore: 0,
    bestScore: 0,
    totalTimeSpent: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { user, updateProfile, changePassword, apiRequest } = useAuth();

  // 初始化用戶資料
  useEffect(() => {
    if (user) {
      setProfileData({
        displayName: user.displayName || '',
        username: user.username || '',
        email: user.email || '',
      });
    }
  }, [user]);

  // 載入用戶統計
  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await apiRequest('/users/me/stats');
        setStats(response.data.stats);
      } catch (error) {
        console.error('Failed to load stats:', error);
      }
    };

    if (user) {
      loadStats();
    }
  }, [user, apiRequest]);

  // 更新個人資料
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!profileData.displayName.trim()) {
      setErrors({ displayName: '顯示名稱不能為空' });
      return;
    }

    if (!profileData.username.trim()) {
      setErrors({ username: '用戶名不能為空' });
      return;
    }

    setIsLoading(true);

    try {
      const result = await updateProfile({
        displayName: profileData.displayName,
        username: profileData.username,
      });

      if (result.success) {
        toast.success('個人資料更新成功！');
      } else {
        toast.error(result.error || '更新失敗');
      }
    } catch (error) {
      toast.error('更新失敗');
    } finally {
      setIsLoading(false);
    }
  };

  // 修改密碼
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!passwordData.currentPassword) {
      setErrors({ currentPassword: '請輸入當前密碼' });
      return;
    }

    if (!passwordData.newPassword) {
      setErrors({ newPassword: '請輸入新密碼' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setErrors({ newPassword: '新密碼至少需要6個字符' });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrors({ confirmPassword: '兩次輸入的密碼不一致' });
      return;
    }

    setIsLoading(true);

    try {
      const result = await changePassword(passwordData.currentPassword, passwordData.newPassword);

      if (result.success) {
        toast.success('密碼修改成功！');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        toast.error(result.error || '密碼修改失敗');
      }
    } catch (error) {
      toast.error('密碼修改失敗');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (milliseconds: number) => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours} 小時 ${minutes} 分鐘`;
    }
    return `${minutes} 分鐘`;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">請先登入</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 頁面標題 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">個人資料</h1>
          <p className="text-gray-600 mt-2">管理您的帳戶設置和偏好</p>
        </div>

        {/* 用戶信息卡片 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm p-6 mb-8"
        >
          <div className="flex items-center">
            <div className="h-16 w-16 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-2xl mr-6">
              {user.displayName?.charAt(0).toUpperCase() || user.username?.charAt(0).toUpperCase() || '?'}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{user.displayName || user.username}</h2>
              <p className="text-gray-600">{user.email}</p>
              <p className="text-sm text-gray-500">
                {user.role === 'TEACHER' ? '👨‍🏫 教師' : '👨‍🎓 學生'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* 標籤頁 */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'profile', name: '基本資料', icon: '👤' },
                { id: 'password', name: '修改密碼', icon: '🔒' },
                { id: 'stats', name: '統計數據', icon: '📊' },
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
            {/* 基本資料標籤 */}
            {activeTab === 'profile' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div>
                    <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
                      顯示名稱
                    </label>
                    <input
                      type="text"
                      id="displayName"
                      value={profileData.displayName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, displayName: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.displayName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="您希望其他人看到的名稱"
                    />
                    {errors.displayName && (
                      <p className="mt-1 text-sm text-red-600">{errors.displayName}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                      用戶名
                    </label>
                    <input
                      type="text"
                      id="username"
                      value={profileData.username}
                      onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.username ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="用戶名"
                    />
                    {errors.username && (
                      <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      電子郵件
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={profileData.email}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    />
                    <p className="mt-1 text-sm text-gray-500">電子郵件無法修改</p>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isLoading ? '更新中...' : '更新資料'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* 修改密碼標籤 */}
            {activeTab === 'password' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <form onSubmit={handlePasswordChange} className="space-y-6">
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      當前密碼
                    </label>
                    <input
                      type="password"
                      id="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.currentPassword ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="請輸入當前密碼"
                    />
                    {errors.currentPassword && (
                      <p className="mt-1 text-sm text-red-600">{errors.currentPassword}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      新密碼
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.newPassword ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="請輸入新密碼（至少6個字符）"
                    />
                    {errors.newPassword && (
                      <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      確認新密碼
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="請再次輸入新密碼"
                    />
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                    )}
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isLoading ? '修改中...' : '修改密碼'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* 統計數據標籤 */}
            {activeTab === 'stats' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-blue-50 rounded-lg p-6">
                    <div className="flex items-center">
                      <div className="text-3xl mr-4">📚</div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">創建活動</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalActivities}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-6">
                    <div className="flex items-center">
                      <div className="text-3xl mr-4">🎮</div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">遊戲次數</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalGames}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 rounded-lg p-6">
                    <div className="flex items-center">
                      <div className="text-3xl mr-4">🏆</div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">最高分數</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.bestScore}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-6">
                    <div className="flex items-center">
                      <div className="text-3xl mr-4">📊</div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">平均分數</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.averageScore.toFixed(1)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-indigo-50 rounded-lg p-6">
                    <div className="flex items-center">
                      <div className="text-3xl mr-4">⏱️</div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">總遊戲時間</p>
                        <p className="text-2xl font-bold text-gray-900">{formatTime(stats.totalTimeSpent)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-pink-50 rounded-lg p-6">
                    <div className="flex items-center">
                      <div className="text-3xl mr-4">🎯</div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">總分數</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalScore}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 text-center text-gray-600">
                  <p>繼續學習和創建活動來提升您的統計數據！</p>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
