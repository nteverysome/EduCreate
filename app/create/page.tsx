'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import LoginPrompt from '@/components/Auth/LoginPrompt';
import UnifiedNavigation from '@/components/navigation/UnifiedNavigation';

// 從 /games/switcher 整合的實際遊戲數據
const gameTemplates = [
  // 已完成的遊戲（可直接遊玩）
  {
    id: 'shimozurdo-game',
    name: 'Shimozurdo 雲朵遊戲',
    description: '動態反應記憶',
    icon: '☁️',
    category: '動態反應記憶',
    popular: true,
    status: 'completed',
    estimatedLoadTime: 800
  },
  {
    id: 'airplane-vite',
    name: '飛機遊戲 (Vite版)',
    description: '完整版飛機碰撞遊戲，記憶科學驅動的英語詞彙學習',
    icon: '⚡',
    category: '動態反應記憶',
    popular: true,
    status: 'completed',
    estimatedLoadTime: 600
  },

  {
    id: 'starshake-game',
    name: 'Starshake 太空冒險',
    description: '一個充滿樂趣的太空冒險動作遊戲',
    icon: '🌟',
    category: '動態反應記憶',
    popular: true,
    status: 'completed',
    estimatedLoadTime: 1000
  },
  {
    id: 'runner-game',
    name: 'Runner 跑酷遊戲',
    description: '一個刺激的跑酷遊戲，通過跳躍和收集金幣來挑戰高分',
    icon: '🏃',
    category: '動態反應記憶',
    popular: true,
    status: 'completed',
    estimatedLoadTime: 1000
  },
  {
    id: 'pushpull-game',
    name: 'PushPull 推拉方塊',
    description: '一個策略性的推拉方塊遊戲，通過移動彩色方塊到指定位置來解決謎題',
    icon: '🧩',
    category: '重構邏輯記憶',
    popular: false,
    status: 'completed',
    estimatedLoadTime: 1200
  },
  {
    id: 'wallhammer-game',
    name: 'WallHammer 破牆遊戲',
    description: '一個經典的破牆冒險遊戲，通過錘子破壞磚牆收集金幣和道具',
    icon: '🔨',
    category: '動態反應記憶',
    popular: false,
    status: 'completed',
    estimatedLoadTime: 1300
  },
  {
    id: 'zenbaki-game',
    name: 'Zenbaki 數字遊戲',
    description: '一個基於數字的策略遊戲，通過數字計算和邏輯推理來解決謎題',
    icon: '🔢',
    category: '重構邏輯記憶',
    popular: false,
    status: 'completed',
    estimatedLoadTime: 1100
  },
  {
    id: 'mars-game',
    name: 'Mars 火星探險',
    description: '一個火星探險遊戲，通過探索火星地形和收集資源來完成任務',
    icon: '🔴',
    category: '空間視覺記憶',
    popular: false,
    status: 'completed',
    estimatedLoadTime: 1200
  },
  {
    id: 'fate-game',
    name: 'Fate 命運之戰',
    description: '一個3D太空戰鬥遊戲，通過駕駛太空船戰鬥和探索來完成任務',
    icon: '⚡',
    category: '動態反應記憶',
    popular: false,
    status: 'completed',
    estimatedLoadTime: 1400
  },
  {
    id: 'dungeon-game',
    name: 'Dungeon 地牢探險',
    description: '探索神秘地牢，收集寶藏，戰勝怪物。2D 冒險遊戲，訓練空間記憶和策略思維',
    icon: '🏰',
    category: '空間視覺記憶',
    popular: true,
    status: 'completed',
    estimatedLoadTime: 800
  },
  {
    id: 'blastemup-game',
    name: 'Blastemup 太空射擊',
    description: '駕駛太空船在宇宙中戰鬥，射擊敵人和小行星。經典的太空射擊遊戲，訓練反應速度和手眼協調',
    icon: '💥',
    category: '動態反應記憶',
    popular: true,
    status: 'completed',
    estimatedLoadTime: 900
  },
  {
    id: 'math-attack-game',
    name: 'Math Attack 數學攻擊',
    description: '快速解決數學問題，提升計算能力。結合時間壓力的數學遊戲，訓練數字記憶和運算速度',
    icon: '🔢',
    category: '基礎記憶',
    popular: false,
    status: 'completed',
    estimatedLoadTime: 1200
  },
  // 開發中的遊戲
  {
    id: 'matching-pairs',
    name: '配對遊戲',
    description: '通過配對卡片強化視覺記憶和關聯學習',
    icon: '🃏',
    category: '空間視覺記憶',
    popular: true,
    status: 'development',
    estimatedLoadTime: 600
  },
  {
    id: 'quiz-game',
    name: '問答遊戲',
    description: '基於主動回憶的快速問答學習',
    icon: '❓',
    category: '基礎記憶',
    popular: true,
    status: 'development',
    estimatedLoadTime: 500
  }
];

export default function CreateActivityPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('popular'); // 'popular' or 'alphabetical'
  const [editingActivity, setEditingActivity] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // 檢查是否為編輯模式
  useEffect(() => {
    const editId = searchParams.get('edit');
    if (editId) {
      setIsEditMode(true);
      loadActivityForEdit(editId);
    }
  }, [searchParams]);

  // 載入要編輯的活動數據
  const loadActivityForEdit = async (activityId: string) => {
    try {
      const response = await fetch(`/api/activities/${activityId}`);
      if (response.ok) {
        const activity = await response.json();
        setEditingActivity(activity);
        console.log('📝 載入編輯活動:', activity.title);
      } else {
        console.error('❌ 載入活動失敗:', response.status);
        alert('載入活動失敗，請稍後再試');
      }
    } catch (error) {
      console.error('❌ 載入活動錯誤:', error);
      alert('載入活動失敗，請稍後再試');
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50">
        <UnifiedNavigation />
        <div className="p-8">載入中...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UnifiedNavigation />
        <LoginPrompt />
      </div>
    );
  }

  // 過濾和排序遊戲模板（只顯示已完成的遊戲）
  const filteredTemplates = gameTemplates.filter(template =>
    template.status === 'completed' && (
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const sortedTemplates = [...filteredTemplates].sort((a, b) => {
    if (sortBy === 'popular') {
      // 先按受歡迎程度排序，然後按字母順序
      if (a.popular && !b.popular) return -1;
      if (!a.popular && b.popular) return 1;
      return a.name.localeCompare(b.name);
    } else {
      // 按字母順序排序
      return a.name.localeCompare(b.name);
    }
  });

  const handleTemplateClick = (templateId: string) => {
    if (isEditMode && editingActivity) {
      // 編輯模式：導航到編輯頁面並傳遞活動數據
      router.push(`/create/${templateId}?edit=${editingActivity.id}`);
    } else {
      // 創建模式：導航到內容編輯頁面，讓用戶輸入標題和單字
      router.push(`/create/${templateId}`);
    }
  };



  return (
    <div className="min-h-screen bg-gray-50">
      {/* 統一導航組件 */}
      <UnifiedNavigation />

      {/* 主要內容 - 優化手機和平板 */}
      <div className="max-w-7xl mx-auto py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8">
        {/* 頁面標題和搜索 - 響應式優化 */}
        <div className="mb-6 sm:mb-8">
          <div className="mb-4 sm:mb-6">
            <div className="text-center sm:text-left">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 sm:mb-2">
                {isEditMode ? `編輯活動${editingActivity ? ` - ${editingActivity.title}` : ''}` : '選擇範本'}
              </h1>
              {/* 步驟指示器 - 手機版優化 */}
              <div className="flex items-center justify-center sm:justify-start space-x-2 text-sm text-gray-500">
                {isEditMode ? (
                  <>
                    <span className="text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-full">選擇遊戲類型</span>
                    <span className="text-gray-400">→</span>
                    <span className="bg-gray-100 px-2 py-1 rounded-full">編輯詞彙</span>
                    <span className="text-gray-400">→</span>
                    <span className="bg-gray-100 px-2 py-1 rounded-full">保存</span>
                  </>
                ) : (
                  <>
                    <span className="text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-full">選擇範本</span>
                    <span className="text-gray-400">→</span>
                    <span className="bg-gray-100 px-2 py-1 rounded-full">輸入內容</span>
                    <span className="text-gray-400">→</span>
                    <span className="bg-gray-100 px-2 py-1 rounded-full">播放</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* 搜索和排序 - 響應式優化 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 mb-6">
            {/* 手機版：垂直布局 */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* 搜索框 - 響應式寬度 */}
              <div className="flex-1 sm:max-w-md">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="輸入名稱或說明..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-500"
                  />
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* 排序選擇器 - 手機版優化 */}
              <div className="flex items-center space-x-3 sm:space-x-4">
                <span className="text-sm font-medium text-gray-700 whitespace-nowrap">排序:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="flex-1 sm:flex-none px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 font-medium min-w-0 sm:min-w-[140px]"
                >
                  <option value="popular">最受歡迎的</option>
                  <option value="alphabetical">字母</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* 遊戲模板網格 - 響應式優化 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {sortedTemplates.map((template) => (
            <div
              key={template.id}
              onClick={() => handleTemplateClick(template.id)}
              className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer border border-gray-100 hover:border-blue-300 hover:scale-[1.02] transform"
            >
              <div className="p-4 sm:p-6">
                {/* 頭部區域 - 手機版優化 */}
                <div className="flex items-start space-x-3 sm:space-x-4 mb-3 sm:mb-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-xl sm:text-2xl">{template.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base leading-tight">{template.name}</h3>
                    {/* 標籤區域 - 手機版優化 */}
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      {template.popular && (
                        <span className="inline-block px-2 py-1 text-xs bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 rounded-full font-medium">
                          熱門
                        </span>
                      )}
                      {template.status === 'completed' && (
                        <span className="inline-block px-2 py-1 text-xs bg-gradient-to-r from-green-100 to-green-200 text-green-800 rounded-full font-medium">
                          ✅ 可玩
                        </span>
                      )}
                      {template.status === 'development' && (
                        <span className="inline-block px-2 py-1 text-xs bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 rounded-full font-medium">
                          🚧 開發中
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* 描述文字 - 手機版優化 */}
                <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-2 sm:line-clamp-3">
                  {template.description}
                </p>

                {/* 底部信息 - 手機版優化 */}
                <div className="pt-3 sm:pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
                  <span className="text-xs text-gray-500 bg-gradient-to-r from-gray-100 to-gray-200 px-3 py-1.5 rounded-full font-medium">
                    {template.category}
                  </span>
                  {template.estimatedLoadTime && (
                    <span className="text-xs text-gray-400 font-medium">
                      載入: ~{template.estimatedLoadTime}ms
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 如果沒有找到模板 */}
        {sortedTemplates.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">找不到匹配的模板</h3>
            <p className="text-gray-600">請嘗試使用不同的搜索詞</p>
          </div>
        )}
      </div>
    </div>
  );
}
