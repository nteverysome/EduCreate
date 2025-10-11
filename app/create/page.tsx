'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import LoginPrompt from '@/components/Auth/LoginPrompt';

// 從 /games/switcher 整合的實際遊戲數據
const gameTemplates = [
  // 已完成的遊戲（可直接遊玩）
  {
    id: 'airplane-vite',
    name: '飛機遊戲 (Vite版)',
    description: 'Phaser 3 + Vite 完整版飛機碰撞遊戲，記憶科學驅動的英語詞彙學習',
    icon: '⚡',
    category: '動態反應記憶',
    popular: true,
    status: 'completed',
    estimatedLoadTime: 600
  },
  {
    id: 'airplane-main',
    name: '飛機碰撞遊戲',
    description: '通過飛機碰撞雲朵學習英語詞彙，基於主動回憶和視覺記憶原理',
    icon: '✈️',
    category: '動態反應記憶',
    popular: true,
    status: 'completed',
    estimatedLoadTime: 800
  },
  {
    id: 'airplane-iframe',
    name: '飛機遊戲 (iframe版)',
    description: 'Phaser 3 + Vite 完整版飛機碰撞遊戲，記憶科學驅動的英語詞彙學習',
    icon: '🎮',
    category: '動態反應記憶',
    popular: true,
    status: 'completed',
    estimatedLoadTime: 1000
  },
  {
    id: 'shimozurdo-game',
    name: 'Shimozurdo 雲朵遊戲',
    description: 'Phaser 3 雲朵碰撞遊戲，支援全螢幕和響應式設計，記憶科學驅動的英語學習',
    icon: '☁️',
    category: '動態反應記憶',
    popular: true,
    status: 'completed',
    estimatedLoadTime: 800
  },
  {
    id: 'shimozurdo-responsive',
    name: 'shimozurdo 響應式遊戲',
    description: 'Phaser 3 響應式遊戲，支援全螢幕和方向切換，記憶科學驅動學習',
    icon: '🎯',
    category: '動態反應記憶',
    popular: true,
    status: 'completed',
    estimatedLoadTime: 800
  },
  {
    id: 'starshake-game',
    name: 'Starshake 太空冒險',
    description: '一個充滿樂趣的太空冒險遊戲，基於 Phaser 3 引擎開發的動作遊戲',
    icon: '🌟',
    category: '動態反應記憶',
    popular: true,
    status: 'completed',
    estimatedLoadTime: 1000
  },
  {
    id: 'runner-game',
    name: 'Runner 跑酷遊戲',
    description: '一個刺激的跑酷遊戲，通過跳躍和收集金幣來挑戰高分，基於 Phaser 3 引擎開發',
    icon: '🏃',
    category: '動態反應記憶',
    popular: true,
    status: 'completed',
    estimatedLoadTime: 1000
  },
  {
    id: 'pushpull-game',
    name: 'PushPull 推拉方塊',
    description: '一個策略性的推拉方塊遊戲，通過移動彩色方塊到指定位置來解決謎題，基於 Phaser 3 引擎開發',
    icon: '🧩',
    category: '重構邏輯記憶',
    popular: false,
    status: 'completed',
    estimatedLoadTime: 1200
  },
  {
    id: 'wallhammer-game',
    name: 'WallHammer 破牆遊戲',
    description: '一個經典的破牆冒險遊戲，通過錘子破壞磚牆收集金幣和道具，基於 Phaser 3 引擎開發',
    icon: '🔨',
    category: '動態反應記憶',
    popular: false,
    status: 'completed',
    estimatedLoadTime: 1300
  },
  {
    id: 'zenbaki-game',
    name: 'Zenbaki 數字遊戲',
    description: '一個基於數字的策略遊戲，通過數字計算和邏輯推理來解決謎題，基於 Phaser 3 引擎開發',
    icon: '🔢',
    category: '重構邏輯記憶',
    popular: false,
    status: 'completed',
    estimatedLoadTime: 1100
  },
  {
    id: 'mars-game',
    name: 'Mars 火星探險',
    description: '一個火星探險遊戲，通過探索火星地形和收集資源來完成任務，基於 Phaser 3 引擎開發',
    icon: '🔴',
    category: '空間視覺記憶',
    popular: false,
    status: 'completed',
    estimatedLoadTime: 1200
  },
  {
    id: 'fate-game',
    name: 'Fate 命運之戰',
    description: '一個3D太空戰鬥遊戲，通過駕駛太空船戰鬥和探索來完成任務，基於 Phaser 3 引擎開發',
    icon: '⚡',
    category: '動態反應記憶',
    popular: false,
    status: 'completed',
    estimatedLoadTime: 1400
  },
  {
    id: 'dungeon-game',
    name: 'Dungeon 地牢探險',
    description: '探索神秘地牢，收集寶藏，戰勝怪物。基於 Phaser 3 的 2D 冒險遊戲，訓練空間記憶和策略思維',
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

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('popular'); // 'popular' or 'alphabetical'

  if (status === 'loading') {
    return <div className="p-8">載入中...</div>;
  }

  if (!session) {
    return <LoginPrompt />;
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
    // 導航到內容編輯頁面，讓用戶輸入標題和單字
    router.push(`/create/${templateId}`);
  };



  return (
    <div className="min-h-screen bg-gray-50">
      {/* 導航欄 */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-blue-600">EduCreate</h1>
                <span className="ml-2 text-sm text-gray-500">更快地創建更好的課程</span>
              </div>
              <a href="/create" className="text-blue-600 hover:text-blue-800">創建活動</a>
            </div>
            <div className="flex items-center space-x-4">
              <a href="/community" className="text-gray-600 hover:text-gray-800">👥 社區</a>
              <a href="/my-activities" className="text-gray-600 hover:text-gray-800">我的活動</a>
              <a href="/my-results" className="text-gray-600 hover:text-gray-800">我的結果</a>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">{session.user?.name}</span>
                <button className="text-gray-600 hover:text-gray-800">▼</button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* 主要內容 */}
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* 頁面標題和搜索 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">選擇範本</h1>
              <div className="flex items-center space-x-2 text-sm text-gray-500 mt-2">
                <span className="text-blue-600 font-medium">選擇範本</span>
                <span>→</span>
                <span>輸入內容</span>
                <span>→</span>
                <span>播放</span>
              </div>
            </div>
          </div>

          {/* 搜索和排序 */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="輸入名稱或說明..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-80 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400">🔍</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">排序:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="popular">最受歡迎的</option>
                <option value="alphabetical">字母</option>
              </select>
            </div>
          </div>
        </div>

        {/* 遊戲模板網格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedTemplates.map((template) => (
            <div
              key={template.id}
              onClick={() => handleTemplateClick(template.id)}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-200 hover:border-blue-300"
            >
              <div className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">{template.icon}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-1">{template.name}</h3>
                    <div className="flex items-center space-x-2">
                      {template.popular && (
                        <span className="inline-block px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">
                          熱門
                        </span>
                      )}
                      {template.status === 'completed' && (
                        <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                          ✅ 可玩
                        </span>
                      )}
                      {template.status === 'development' && (
                        <span className="inline-block px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                          🚧 開發中
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {template.description}
                </p>
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {template.category}
                  </span>
                  {template.estimatedLoadTime && (
                    <span className="text-xs text-gray-400">
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
