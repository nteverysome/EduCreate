'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import LoginPrompt from '@/components/Auth/LoginPrompt';

interface VocabularyItem {
  id: string;
  english: string;
  chinese: string;
  phonetic?: string;
  imageUrl?: string;
  audioUrl?: string;
}

// 實際遊戲配置（來自 /games/switcher）
const gameTemplateConfig = {
  'airplane-vite': {
    name: '飛機遊戲 (Vite版)',
    description: 'Phaser 3 + Vite 完整版飛機碰撞遊戲，記憶科學驅動的英語詞彙學習',
    icon: '⚡',
    category: '動態反應記憶',
    minItems: 3,
    maxItems: 20,
    inputType: 'vocabulary' // 單字類型
  },
  'airplane-game': {
    name: '飛機碰撞遊戲',
    description: '通過飛機碰撞雲朵學習英語詞彙，基於主動回憶和視覺記憶原理',
    icon: '✈️',
    category: '動態反應記憶',
    minItems: 3,
    maxItems: 20,
    inputType: 'vocabulary'
  },
  'airplane-iframe': {
    name: '飛機遊戲 (iframe版)',
    description: 'Phaser 3 + Vite 完整版飛機碰撞遊戲，記憶科學驅動的英語詞彙學習',
    icon: '🎮',
    category: '動態反應記憶',
    minItems: 3,
    maxItems: 20,
    inputType: 'vocabulary'
  },
  'blastemup-game': {
    name: 'Blastemup 太空射擊',
    description: '駕駛太空船在宇宙中戰鬥，射擊敵人和小行星。經典的太空射擊遊戲，訓練反應速度和手眼協調',
    icon: '💥',
    category: '動態反應記憶',
    minItems: 5,
    maxItems: 25,
    inputType: 'vocabulary'
  },
  'dungeon-game': {
    name: 'Dungeon 地牢探險',
    description: '探索神秘地牢，收集寶藏，戰勝怪物。基於 Phaser 3 的 2D 冒險遊戲，訓練空間記憶和策略思維',
    icon: '🏰',
    category: '空間視覺記憶',
    minItems: 5,
    maxItems: 30,
    inputType: 'vocabulary'
  },
  'runner-game': {
    name: 'Runner 跑酷遊戲',
    description: '一個刺激的跑酷遊戲，通過跳躍和收集金幣來挑戰高分，基於 Phaser 3 引擎開發',
    icon: '🏃',
    category: '動態反應記憶',
    minItems: 5,
    maxItems: 20,
    inputType: 'vocabulary'
  },
  'shimozurdo-game': {
    name: 'shimozurdo 響應式遊戲',
    description: 'Phaser 3 響應式遊戲，支援全螢幕和方向切換，記憶科學驅動學習',
    icon: '🎯',
    category: '動態反應記憶',
    minItems: 3,
    maxItems: 15,
    inputType: 'vocabulary'
  },
  'shimozurdo-cloud': {
    name: 'Shimozurdo 雲朵遊戲',
    description: 'Phaser 3 雲朵碰撞遊戲，支援全螢幕和響應式設計，記憶科學驅動的英語學習',
    icon: '☁️',
    category: '動態反應記憶',
    minItems: 3,
    maxItems: 15,
    inputType: 'vocabulary'
  },
  'starshake-game': {
    name: 'Starshake 太空冒險',
    description: '一個充滿樂趣的太空冒險遊戲，基於 Phaser 3 引擎開發的動作遊戲',
    icon: '🌟',
    category: '動態反應記憶',
    minItems: 5,
    maxItems: 25,
    inputType: 'vocabulary'
  },
  'math-attack': {
    name: 'Math Attack 數學攻擊',
    description: '快速解決數學問題，提升計算能力。結合時間壓力的數學遊戲，訓練數字記憶和運算速度',
    icon: '🔢',
    category: '基礎記憶',
    minItems: 10,
    maxItems: 50,
    inputType: 'math'
  },
  // 默認配置
  'default': {
    name: '未知遊戲',
    description: '請選擇一個有效的遊戲模板',
    icon: '🎮',
    category: '基礎記憶',
    minItems: 1,
    maxItems: 50,
    inputType: 'vocabulary'
  }
};

export default function CreateGamePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const templateId = params.templateId as string;
  
  // 獲取遊戲配置
  const gameConfig = gameTemplateConfig[templateId as keyof typeof gameTemplateConfig] || gameTemplateConfig.default;

  const [activityTitle, setActivityTitle] = useState('無標題活動');
  const [vocabularyItems, setVocabularyItems] = useState<VocabularyItem[]>([
    { id: '1', english: '', chinese: '' },
    { id: '2', english: '', chinese: '' },
    { id: '3', english: '', chinese: '' },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  // 如果未登入，顯示登入提示
  if (status === 'loading') {
    return <div className="p-8">載入中...</div>;
  }

  if (!session) {
    return <LoginPrompt />;
  }

  // 如果遊戲模板不存在，重定向到選擇頁面
  if (!gameConfig) {
    router.push('/create');
    return <div className="p-8">重定向中...</div>;
  }

  const addNewItem = () => {
    if (vocabularyItems.length < gameConfig.maxItems) {
      const newId = (vocabularyItems.length + 1).toString();
      setVocabularyItems([...vocabularyItems, { id: newId, english: '', chinese: '' }]);
    }
  };

  const removeItem = (id: string) => {
    if (vocabularyItems.length > gameConfig.minItems) {
      setVocabularyItems(vocabularyItems.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: 'english' | 'chinese' | 'phonetic', value: string) => {
    setVocabularyItems(vocabularyItems.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const swapColumns = () => {
    setVocabularyItems(vocabularyItems.map(item => ({
      ...item,
      english: item.chinese,
      chinese: item.english,
    })));
  };

  // 保存活動到數據庫
  const saveActivity = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: activityTitle,
          gameTemplateId: templateId,
          vocabularyItems: vocabularyItems.filter(item => item.english.trim() && item.chinese.trim()),
          type: 'vocabulary_game',
          templateType: gameConfig.inputType,
        }),
      });

      if (response.ok) {
        const activity = await response.json();
        // 跳轉到遊戲頁面，並傳遞活動 ID
        router.push(`/games/switcher?game=${templateId}&activityId=${activity.id}`);
      } else {
        alert('保存失敗，請重試');
      }
    } catch (error) {
      console.error('保存活動時出錯:', error);
      alert('保存失敗，請重試');
    } finally {
      setIsLoading(false);
    }
  };

  // 驗證詞彙項目
  const validateItems = () => {
    const validItems = vocabularyItems.filter(item =>
      item.english.trim() !== '' && item.chinese.trim() !== ''
    );
    return validItems.length >= gameConfig.minItems;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Wordwall 風格導航欄 */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-blue-600">EduCreate</h1>
                <span className="ml-2 text-sm text-gray-500">更快地創建更好的課程</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">{session.user?.name || '測試用戶'}</span>
                <button className="text-gray-600 hover:text-gray-800">▼</button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Wordwall 風格頭部 */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* 遊戲信息 */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
              {gameConfig.icon}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{gameConfig.name}</h2>
              <p className="text-sm text-gray-600">{gameConfig.description}</p>
            </div>
          </div>

          {/* 進度指示器 */}
          <div className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
            <span className="text-blue-600">選擇範本</span>
            <span>→</span>
            <span className="text-blue-600 font-medium">輸入內容</span>
            <span>→</span>
            <span>播放</span>
          </div>
        </div>
      </div>

      {/* 主要內容區域 */}
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* 活動標題 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            活動標題
          </label>
          <input
            type="text"
            value={activityTitle}
            onChange={(e) => setActivityTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="輸入活動標題..."
          />
        </div>

        {/* 詞彙輸入區域 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* 操作說明 */}
          <div className="mb-6">
            <button
              onClick={() => setShowInstructions(!showInstructions)}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
            >
              <span>📋</span>
              <span>操作說明</span>
            </button>
            {showInstructions && (
              <div className="mt-2 p-4 bg-blue-50 rounded-lg text-sm text-gray-700">
                <p>1. 在左欄輸入英文單字，在右欄輸入對應的中文翻譯</p>
                <p>2. 可以添加音標來幫助發音學習</p>
                <p>3. 至少需要 {gameConfig.minItems} 個單字，最多 {gameConfig.maxItems} 個</p>
                <p>4. 點擊「交換列」可以交換英文和中文的位置</p>
              </div>
            )}
          </div>

          {/* 欄位標題和交換按鈕 */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">英文單字</h3>
              <p className="text-sm text-gray-500">這些將在遊戲中顯示</p>
            </div>
            <button
              onClick={swapColumns}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              交換列
            </button>
            <div className="flex-1 ml-4">
              <h3 className="font-medium text-gray-900">中文翻譯</h3>
              <p className="text-sm text-gray-500">對應的中文意思</p>
            </div>
          </div>

          {/* 詞彙項目列表 */}
          <div className="space-y-4">
            {vocabularyItems.map((item, index) => (
              <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                <div className="w-8 text-center text-sm text-gray-500 font-medium">
                  {index + 1}.
                </div>

                {/* 英文單字欄位 */}
                <div className="flex-1">
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={item.english}
                      onChange={(e) => updateItem(item.id, 'english', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="輸入英文單字..."
                    />
                    <input
                      type="text"
                      value={item.phonetic || ''}
                      onChange={(e) => updateItem(item.id, 'phonetic', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="音標 (可選)..."
                    />
                  </div>
                </div>

                {/* 中文翻譯欄位 */}
                <div className="flex-1">
                  <input
                    type="text"
                    value={item.chinese}
                    onChange={(e) => updateItem(item.id, 'chinese', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="輸入中文翻譯..."
                  />
                </div>

                {/* 刪除按鈕 */}
                {vocabularyItems.length > gameConfig.minItems && (
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                    title="刪除此項目"
                  >
                    🗑️
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* 新增項目按鈕 */}
          <div className="mt-6">
            <button
              onClick={addNewItem}
              disabled={vocabularyItems.length >= gameConfig.maxItems}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-lg">+</span>
              <span>新增項目</span>
              <span className="text-sm text-gray-500">
                最小{gameConfig.minItems} 最大{gameConfig.maxItems}
              </span>
            </button>
          </div>
        </div>

        {/* 完成按鈕 */}
        <div className="mt-8 flex justify-end space-x-4">
          <button
            onClick={() => router.push('/create')}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            返回
          </button>
          <button
            onClick={saveActivity}
            disabled={!validateItems() || isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? '保存中...' : '完成並開始遊戲'}
          </button>
        </div>
      </div>
    </div>
  );
}
