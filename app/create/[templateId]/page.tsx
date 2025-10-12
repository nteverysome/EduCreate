'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
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
    maxItems: 100,
    inputType: 'vocabulary' // 單字類型
  },
  'airplane-game': {
    name: '飛機碰撞遊戲',
    description: '通過飛機碰撞雲朵學習英語詞彙，基於主動回憶和視覺記憶原理',
    icon: '✈️',
    category: '動態反應記憶',
    minItems: 3,
    maxItems: 100,
    inputType: 'vocabulary'
  },
  'airplane-iframe': {
    name: '飛機遊戲 (iframe版)',
    description: 'Phaser 3 + Vite 完整版飛機碰撞遊戲，記憶科學驅動的英語詞彙學習',
    icon: '🎮',
    category: '動態反應記憶',
    minItems: 3,
    maxItems: 100,
    inputType: 'vocabulary'
  },
  'blastemup-game': {
    name: 'Blastemup 太空射擊',
    description: '駕駛太空船在宇宙中戰鬥，射擊敵人和小行星。經典的太空射擊遊戲，訓練反應速度和手眼協調',
    icon: '💥',
    category: '動態反應記憶',
    minItems: 5,
    maxItems: 100,
    inputType: 'vocabulary'
  },
  'dungeon-game': {
    name: 'Dungeon 地牢探險',
    description: '探索神秘地牢，收集寶藏，戰勝怪物。基於 Phaser 3 的 2D 冒險遊戲，訓練空間記憶和策略思維',
    icon: '🏰',
    category: '空間視覺記憶',
    minItems: 5,
    maxItems: 100,
    inputType: 'vocabulary'
  },
  'runner-game': {
    name: 'Runner 跑酷遊戲',
    description: '一個刺激的跑酷遊戲，通過跳躍和收集金幣來挑戰高分，基於 Phaser 3 引擎開發',
    icon: '🏃',
    category: '動態反應記憶',
    minItems: 5,
    maxItems: 100,
    inputType: 'vocabulary'
  },
  'shimozurdo-game': {
    name: 'shimozurdo 響應式遊戲',
    description: 'Phaser 3 響應式遊戲，支援全螢幕和方向切換，記憶科學驅動學習',
    icon: '🎯',
    category: '動態反應記憶',
    minItems: 3,
    maxItems: 100,
    inputType: 'vocabulary'
  },
  'shimozurdo-cloud': {
    name: 'Shimozurdo 雲朵遊戲',
    description: 'Phaser 3 雲朵碰撞遊戲，支援全螢幕和響應式設計，記憶科學驅動的英語學習',
    icon: '☁️',
    category: '動態反應記憶',
    minItems: 3,
    maxItems: 100,
    inputType: 'vocabulary'
  },
  'shimozurdo-responsive': {
    name: 'Shimozurdo 響應式遊戲',
    description: 'Phaser 3 響應式遊戲，支援全螢幕和方向切換，記憶科學驅動學習',
    icon: '🎯',
    category: '動態反應記憶',
    minItems: 3,
    maxItems: 100,
    inputType: 'vocabulary'
  },
  'starshake-game': {
    name: 'Starshake 太空冒險',
    description: '一個充滿樂趣的太空冒險遊戲，基於 Phaser 3 引擎開發的動作遊戲',
    icon: '🌟',
    category: '動態反應記憶',
    minItems: 5,
    maxItems: 100,
    inputType: 'vocabulary'
  },
  'math-attack': {
    name: 'Math Attack 數學攻擊',
    description: '快速解決數學問題，提升計算能力。結合時間壓力的數學遊戲，訓練數字記憶和運算速度',
    icon: '🔢',
    category: '基礎記憶',
    minItems: 10,
    maxItems: 100,
    inputType: 'math'
  },
  // 默認配置
  'default': {
    name: '未知遊戲',
    description: '請選擇一個有效的遊戲模板',
    icon: '🎮',
    category: '基礎記憶',
    minItems: 1,
    maxItems: 100,
    inputType: 'vocabulary'
  }
};

export default function CreateGamePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
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
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);

  // 檢查是否為編輯模式並載入活動數據
  useEffect(() => {
    const editId = searchParams.get('edit');
    if (editId) {
      setIsEditMode(true);
      setEditingActivityId(editId);
      loadActivityForEdit(editId);
    }
  }, [searchParams]);

  // 載入要編輯的活動數據
  const loadActivityForEdit = async (activityId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/activities/${activityId}`);
      if (response.ok) {
        const activity = await response.json();
        setActivityTitle(activity.title);

        // 載入詞彙數據 - 支援新舊架構
        let vocabularyData = [];

        if (activity.vocabularyItems && Array.isArray(activity.vocabularyItems)) {
          // 新架構：從關聯表中獲取詞彙數據
          vocabularyData = activity.vocabularyItems;
          console.log('📝 從關聯表載入詞彙數據:', vocabularyData.length, '個詞彙');
        } else if (activity.content && activity.content.vocabularyItems) {
          // 舊架構：從 content 中獲取詞彙數據
          vocabularyData = activity.content.vocabularyItems;
          console.log('📝 從 content 載入詞彙數據:', vocabularyData.length, '個詞彙');
        }

        if (vocabularyData.length > 0) {
          const loadedVocabulary = vocabularyData.map((item: any, index: number) => ({
            id: (index + 1).toString(),
            english: item.english || item.word || '',
            chinese: item.chinese || item.translation || '',
            phonetic: item.phonetic || '',
            imageUrl: item.imageUrl || '',
            audioUrl: item.audioUrl || ''
          }));
          setVocabularyItems(loadedVocabulary);
          console.log('✅ 詞彙數據載入成功:', loadedVocabulary);
        } else {
          console.log('⚠️ 未找到詞彙數據');
        }

        console.log('📝 載入編輯活動成功:', activity.title);
      } else {
        console.error('❌ 載入活動失敗:', response.status);
        alert('載入活動失敗，請稍後再試');
      }
    } catch (error) {
      console.error('❌ 載入活動錯誤:', error);
      alert('載入活動失敗，請稍後再試');
    } finally {
      setIsLoading(false);
    }
  };

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
      const filteredVocabulary = vocabularyItems.filter(item => item.english.trim() && item.chinese.trim());

      if (isEditMode && editingActivityId) {
        // 編輯模式：更新現有活動
        const response = await fetch(`/api/activities/${editingActivityId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: activityTitle,
            gameTemplateId: templateId,
            vocabularyItems: filteredVocabulary,
            type: 'vocabulary_game',
            templateType: gameConfig.inputType,
          }),
        });

        if (response.ok) {
          const activity = await response.json();
          alert('活動更新成功！');
          // 跳轉到遊戲頁面，並傳遞活動 ID
          router.push(`/games/switcher?game=${templateId}&activityId=${activity.id}`);
        } else {
          alert('更新失敗，請重試');
        }
      } else {
        // 創建模式：創建新活動
        const response = await fetch('/api/activities', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: activityTitle,
            gameTemplateId: templateId,
            vocabularyItems: filteredVocabulary,
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
      }
    } catch (error) {
      console.error('保存活動時出錯:', error);
      alert(isEditMode ? '更新失敗，請重試' : '保存失敗，請重試');
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
      {/* 導航欄 - 響應式優化 */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 桌面版導航 */}
          <div className="hidden md:flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center">
                <a href="/" className="text-xl font-bold text-blue-600 hover:text-blue-800 transition-colors">
                  EduCreate
                </a>
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

          {/* 手機版導航 - 優化版 */}
          <div className="md:hidden">
            {/* 頂部行：Logo 和用戶 */}
            <div className="flex justify-between items-center h-14 border-b border-gray-100">
              <div className="flex items-center">
                <a href="/" className="text-lg font-bold text-blue-600">
                  EduCreate
                </a>
              </div>
              <div className="flex items-center space-x-2 bg-gray-50 px-3 py-1.5 rounded-full">
                <span className="text-sm text-gray-700 font-medium">{session.user?.name || '測試用戶'}</span>
                <button className="text-gray-500 hover:text-gray-700">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* 底部行：標語 */}
            <div className="py-2">
              <div className="text-center">
                <span className="text-sm text-gray-600 bg-blue-50 px-3 py-1 rounded-full">更快地創建更好的課程</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* 遊戲頭部 - 響應式優化 */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          {/* 遊戲信息 - 手機版優化 */}
          <div className="flex items-start sm:items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center text-xl sm:text-2xl flex-shrink-0">
              {gameConfig.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 leading-tight">{gameConfig.name}</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{gameConfig.description}</p>
            </div>
          </div>

          {/* 進度指示器 - 手機版優化 */}
          <div className="flex items-center justify-center sm:justify-start space-x-2 text-sm text-gray-500 mb-4 sm:mb-6">
            <span className="bg-gray-100 px-2 py-1 rounded-full">選擇範本</span>
            <span className="text-gray-400">→</span>
            <span className="text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-full">輸入內容</span>
            <span className="text-gray-400">→</span>
            <span className="bg-gray-100 px-2 py-1 rounded-full">播放</span>
          </div>
        </div>
      </div>

      {/* 主要內容區域 - 響應式優化 */}
      <div className="max-w-4xl mx-auto py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8">
        {/* 活動標題 - 手機版優化 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 mb-4 sm:mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            活動標題
          </label>
          <input
            type="text"
            value={activityTitle}
            onChange={(e) => setActivityTitle(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-500"
            placeholder="輸入活動標題..."
          />
        </div>

        {/* 詞彙輸入區域 - 響應式優化 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
          {/* 操作說明 - 手機版優化 */}
          <div className="mb-4 sm:mb-6">
            <button
              onClick={() => setShowInstructions(!showInstructions)}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
            >
              <span>📋</span>
              <span className="font-medium">操作說明</span>
            </button>
            {showInstructions && (
              <div className="mt-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl text-sm text-gray-700 border border-blue-100">
                <div className="space-y-2">
                  <p>1. 在左欄輸入英文單字，在右欄輸入對應的中文翻譯</p>
                  <p>2. 可以添加音標來幫助發音學習</p>
                  <p>3. 至少需要 {gameConfig.minItems} 個單字，最多 {gameConfig.maxItems} 個</p>
                  <p>4. 點擊「交換列」可以交換英文和中文的位置</p>
                </div>
              </div>
            )}
          </div>

          {/* 欄位標題和交換按鈕 - 響應式優化 */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3 sm:gap-0">
            {/* 手機版：垂直布局 */}
            <div className="flex items-center justify-between sm:hidden">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">英文單字</h3>
                <p className="text-sm text-gray-500">這些將在遊戲中顯示</p>
              </div>
              <div className="flex-1 ml-4">
                <h3 className="font-semibold text-gray-900">中文翻譯</h3>
                <p className="text-sm text-gray-500">對應的中文意思</p>
              </div>
            </div>

            {/* 交換按鈕 - 居中顯示 */}
            <div className="flex justify-center sm:order-2">
              <button
                onClick={swapColumns}
                className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
              >
                🔄 交換列
              </button>
            </div>

            {/* 桌面版：水平布局 */}
            <div className="hidden sm:flex sm:items-center sm:justify-between sm:flex-1 sm:order-1">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">英文單字</h3>
                <p className="text-sm text-gray-500">這些將在遊戲中顯示</p>
              </div>
              <div className="flex-1 ml-4">
                <h3 className="font-semibold text-gray-900">中文翻譯</h3>
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
                  <input
                    type="text"
                    value={item.english}
                    onChange={(e) => updateItem(item.id, 'english', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="輸入英文單字..."
                  />
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

        {/* 完成按鈕 - 響應式優化 */}
        <div className="mt-6 sm:mt-8">
          {/* 手機版：垂直布局 */}
          <div className="flex flex-col sm:hidden space-y-3">
            <button
              onClick={saveActivity}
              disabled={!validateItems() || isLoading}
              className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl"
            >
              {isLoading ? (isEditMode ? '更新中...' : '保存中...') : (isEditMode ? '更新並開始遊戲' : '完成並開始遊戲')}
            </button>
            <button
              onClick={() => router.push('/create')}
              className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
            >
              返回選擇範本
            </button>
          </div>

          {/* 桌面版：水平布局 */}
          <div className="hidden sm:flex justify-end space-x-4">
            <button
              onClick={() => router.push('/create')}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
            >
              返回
            </button>
            <button
              onClick={saveActivity}
              disabled={!validateItems() || isLoading}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
            >
              {isLoading ? (isEditMode ? '更新中...' : '保存中...') : (isEditMode ? '更新並開始遊戲' : '完成並開始遊戲')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
