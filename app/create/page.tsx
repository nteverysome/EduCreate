'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import LoginPrompt from '@/components/Auth/LoginPrompt';

// 遊戲模板數據
const gameTemplates = [
  {
    id: 'quiz',
    name: '測驗',
    description: '一系列多選題。點擊正確答案繼續。',
    icon: '📝',
    category: '基礎記憶',
    popular: true
  },
  {
    id: 'match-game',
    name: '匹配遊戲',
    description: '將每個關鍵字拖放到其定義旁邊。',
    icon: '🔗',
    category: '空間視覺記憶',
    popular: true
  },
  {
    id: 'find-match',
    name: '查找匹配項',
    description: '點擊匹配答案以消除它。重複，直到所有答案消失。',
    icon: '🎯',
    category: '空間視覺記憶',
    popular: true
  },
  {
    id: 'flash-cards',
    name: '快閃記憶體卡',
    description: '使用前面有提示的卡片和背面的答案來測試自己。',
    icon: '📚',
    category: '基礎記憶',
    popular: true
  },
  {
    id: 'anagram',
    name: '拼字遊戲',
    description: '將字母拖動到正確的位置以解寫單字或短語。',
    icon: '🔤',
    category: '重構邏輯記憶',
    popular: false
  },
  {
    id: 'random-cards',
    name: '隨機卡',
    description: '從洗好的卡牌中隨機抽取一張。',
    icon: '🎴',
    category: '基礎記憶',
    popular: false
  },
  {
    id: 'unscramble',
    name: '句子排列',
    description: '拖放單詞以將每個句子重新排列到正確的順序。',
    icon: '📝',
    category: '重構邏輯記憶',
    popular: false
  },
  {
    id: 'spin-wheel',
    name: '隨機輪盤',
    description: '旋轉滾輪以查看下一個項目。',
    icon: '🎡',
    category: '壓力情緒記憶',
    popular: false
  },
  {
    id: 'complete-sentence',
    name: '完成句子',
    description: '一種完形填空活動，您可以在其中將單詞拖放到文本中的空白處。',
    icon: '✏️',
    category: '重構邏輯記憶',
    popular: false
  },
  {
    id: 'matching-pairs',
    name: '配對遊戲',
    description: '一次點擊一對卡片，以顯示它們是否匹配。',
    icon: '🃏',
    category: '空間視覺記憶',
    popular: true
  },
  {
    id: 'open-box',
    name: '開箱遊戲',
    description: '點擊每個框以打開它們並顯示裡面的內容。',
    icon: '📦',
    category: '壓力情緒記憶',
    popular: true
  },
  {
    id: 'type-answer',
    name: '拼寫單詞',
    description: '將字母拖動或鍵入到正確的位置以拼寫答案。',
    icon: '⌨️',
    category: '基礎記憶',
    popular: false
  },
  {
    id: 'gameshow-quiz',
    name: '問答遊戲',
    description: '帶有時間壓力，生命線和獎金回合的多項選擇測驗。',
    icon: '🎪',
    category: '壓力情緒記憶',
    popular: true
  },
  {
    id: 'flying-fruit',
    name: '飛果',
    description: '答案在螢幕上移動。當您看到正確答案時，請點擊它。',
    icon: '🍎',
    category: '動態反應記憶',
    popular: true
  },
  {
    id: 'image-quiz',
    name: '標籤圖表',
    description: '將針腳拖至圖像上的正確位置。',
    icon: '🏷️',
    category: '空間視覺記憶',
    popular: false
  },
  {
    id: 'group-sort',
    name: '按組排序',
    description: '將每個項目拖入其正確的組。',
    icon: '📊',
    category: '重構邏輯記憶',
    popular: true
  },
  {
    id: 'whack-mole',
    name: '打地鼠',
    description: '地鼠一次出現一個，只擊中正確的一個即可獲勝。',
    icon: '🔨',
    category: '動態反應記憶',
    popular: false
  },
  {
    id: 'wordsearch',
    name: '搜字遊戲',
    description: '單字隱藏在字母網格中。 儘快找到它們。',
    icon: '🔍',
    category: '搜索發現記憶',
    popular: true
  },
  {
    id: 'flip-tiles',
    name: '翻轉卡片',
    description: '通過點擊縮放和輕掃以翻轉來探索一系列雙面卡片。',
    icon: '🔄',
    category: '空間視覺記憶',
    popular: false
  },
  {
    id: 'hangman',
    name: '猜字遊戲',
    description: '嘗試通過選擇正確的字母來完成單詞。',
    icon: '🎭',
    category: '關聯配對記憶',
    popular: true
  },
  {
    id: 'image-quiz-slow',
    name: '圖像測驗',
    description: '圖像顯示緩慢。 當您可以回答問題時，請拍下按鈕作答。',
    icon: '🖼️',
    category: '空間視覺記憶',
    popular: false
  },
  {
    id: 'balloon-pop',
    name: '刺破氣球',
    description: '彈出氣球，將每個關鍵字放到其匹配內容上。',
    icon: '🎈',
    category: '動態反應記憶',
    popular: true
  },
  {
    id: 'maze-chase',
    name: '迷宮追逐',
    description: '跑到正確答案區，同時避開敵人。',
    icon: '🏃',
    category: '空間視覺記憶',
    popular: true
  },
  {
    id: 'true-false',
    name: '真假遊戲',
    description: '物品飛快地飛過。看看在時間用完之前你能答對多少。',
    icon: '✅',
    category: '基礎記憶',
    popular: false
  },
  {
    id: 'airplane',
    name: '飛機遊戲',
    description: '使用觸摸或鍵盤飛入正確的答案，避免錯誤的答案。',
    icon: '✈️',
    category: '動態反應記憶',
    popular: true
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

  // 過濾和排序遊戲模板
  const filteredTemplates = gameTemplates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description.toLowerCase().includes(searchTerm.toLowerCase())
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
                    {template.popular && (
                      <span className="inline-block px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">
                        熱門
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {template.description}
                </p>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {template.category}
                  </span>
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
