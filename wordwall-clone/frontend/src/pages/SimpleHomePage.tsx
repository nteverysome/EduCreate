import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const SimpleHomePage: React.FC = () => {
  const [stats, setStats] = useState({
    totalUsers: 1250,
    totalActivities: 89,
    totalGamesPlayed: 15600,
  });

  const [featuredActivities] = useState([
    {
      id: '1',
      title: '數學基礎測驗',
      description: '測試基本數學運算能力',
      template: { name: '測驗', type: 'QUIZ' },
      user: { displayName: 'Demo Teacher', username: 'teacher' },
      _count: { gameResults: 156, likes: 23 }
    },
    {
      id: '2',
      title: '英語詞彙配對',
      description: '學習常用英語單詞',
      template: { name: '配對', type: 'MATCH_UP' },
      user: { displayName: 'Demo Teacher', username: 'teacher' },
      _count: { gameResults: 89, likes: 15 }
    },
    {
      id: '3',
      title: '科學知識轉盤',
      description: '隨機科學知識問答',
      template: { name: '轉盤', type: 'SPIN_WHEEL' },
      user: { displayName: 'Demo Teacher', username: 'teacher' },
      _count: { gameResults: 67, likes: 12 }
    }
  ]);

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

  const features = [
    {
      icon: '🎮',
      title: '8種遊戲類型',
      description: '從測驗到配對，多種互動遊戲滿足不同教學需求'
    },
    {
      icon: '📊',
      title: '學習分析',
      description: '詳細的學習進度追蹤和成效分析'
    },
    {
      icon: '👥',
      title: '多人協作',
      description: '支持班級管理和多人實時遊戲'
    },
    {
      icon: '📱',
      title: '跨平台支持',
      description: '在任何設備上都能完美運行'
    },
    {
      icon: '🎨',
      title: '自定義設計',
      description: '豐富的視覺樣式和個性化設置'
    },
    {
      icon: '🔒',
      title: '安全可靠',
      description: '企業級安全標準，保護用戶隱私'
    }
  ];

  const handleDemoLogin = async (role: 'TEACHER' | 'STUDENT') => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/demo-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('accessToken', data.data.accessToken);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        alert(`成功登入為 ${role === 'TEACHER' ? '教師' : '學生'}！`);
        window.location.reload();
      } else {
        alert('登入失敗');
      }
    } catch (error) {
      console.error('Demo login error:', error);
      alert('登入失敗');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 導航欄 */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="text-2xl mr-2">🎮</div>
              <span className="text-xl font-bold text-gray-900">Wordwall Clone</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => handleDemoLogin('TEACHER')}
                className="text-blue-600 hover:text-blue-800 px-3 py-2 text-sm font-medium"
              >
                教師演示登入
              </button>
              <button
                onClick={() => handleDemoLogin('STUDENT')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                學生演示登入
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 英雄區域 */}
      <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              讓學習變得
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                更有趣
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              創建和分享互動教育遊戲，提高學生參與度和學習效果
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => handleDemoLogin('TEACHER')}
                className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-white hover:bg-gray-50 transition-colors"
              >
                🚀 教師演示
              </button>
              <button
                onClick={() => handleDemoLogin('STUDENT')}
                className="inline-flex items-center px-8 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-white hover:text-blue-700 transition-colors"
              >
                🎮 學生演示
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 統計數據 */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center"
          >
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {stats.totalUsers.toLocaleString()}+
              </div>
              <div className="text-gray-600">活躍用戶</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">
                {stats.totalActivities.toLocaleString()}+
              </div>
              <div className="text-gray-600">創建活動</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">
                {stats.totalGamesPlayed.toLocaleString()}+
              </div>
              <div className="text-gray-600">遊戲次數</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 功能特色 */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              為什麼選擇我們？
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              我們提供最完整的互動學習解決方案，讓教學變得更加生動有趣
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-sm p-8 hover:shadow-md transition-shadow"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 精選活動 */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              精選活動
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              探索由教師創建的熱門學習活動
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredActivities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="text-3xl mr-3">
                      {getTemplateIcon(activity.template.type)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {activity.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {activity.template.name}
                      </p>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4">
                    {activity.description}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>🎮 {activity._count.gameResults} 次遊戲</span>
                    <span>❤️ {activity._count.likes} 個喜歡</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      👤 {activity.user.displayName}
                    </span>
                    <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                      開始遊戲
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 行動呼籲 */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              準備開始了嗎？
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              加入我們的教育社群，創建屬於您的互動學習體驗
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => handleDemoLogin('TEACHER')}
                className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-white hover:bg-gray-50 transition-colors"
              >
                🎮 教師演示
              </button>
              <button
                onClick={() => handleDemoLogin('STUDENT')}
                className="inline-flex items-center px-8 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-white hover:text-blue-700 transition-colors"
              >
                🚀 學生演示
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 頁腳 */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="text-2xl mr-2">🎮</div>
              <span className="text-xl font-bold text-gray-900">Wordwall Clone</span>
            </div>
            <p className="text-gray-600 max-w-md mx-auto">
              創建和分享互動教育遊戲，讓學習變得更有趣！
            </p>
            <div className="mt-8 text-center text-gray-400">
              <p>&copy; 2024 Wordwall Clone. 保留所有權利。</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SimpleHomePage;
