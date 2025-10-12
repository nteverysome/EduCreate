'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import LoginPrompt from '@/components/Auth/LoginPrompt';
import UnifiedNavigation from '@/components/navigation/UnifiedNavigation';

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* 統一導航系統 */}
      <UnifiedNavigation variant="header" />

      {/* 遊戲頭部 - Wordwall 風格設計 */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg">
        <div className="max-w-5xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-10">
          {/* 遊戲信息 - 簡潔專業設計 */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 mb-8">
            <div className="w-24 h-24 sm:w-20 sm:h-20 bg-white bg-opacity-20 backdrop-blur-sm rounded-3xl flex items-center justify-center text-4xl sm:text-3xl flex-shrink-0 shadow-xl border border-white border-opacity-30">
              {gameConfig.icon}
            </div>
            <div className="flex-1 min-w-0 text-center sm:text-left">
              <h1 className="text-3xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-3 leading-tight">{gameConfig.name}</h1>
              <p className="text-lg sm:text-base md:text-lg text-blue-100 leading-relaxed mb-4 px-2 sm:px-0">{gameConfig.description}</p>
              <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-3 sm:space-y-0 sm:space-x-4">
                <div className="flex items-center space-x-2 bg-white bg-opacity-20 backdrop-blur-sm px-4 py-2 rounded-full border border-white border-opacity-30">
                  <span className="text-yellow-300 text-lg">⭐</span>
                  <span className="font-semibold">{gameConfig.category}</span>
                </div>
                <div className="flex items-center space-x-2 bg-white bg-opacity-20 backdrop-blur-sm px-4 py-2 rounded-full border border-white border-opacity-30">
                  <span className="text-green-300 text-lg">📝</span>
                  <span className="font-medium">{gameConfig.minItems}-{gameConfig.maxItems} 個詞彙</span>
                </div>
              </div>
            </div>
          </div>

          {/* 進度指示器 - 現代化設計 */}
          <div className="flex items-center justify-center space-x-4 text-sm">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center font-bold shadow-lg">
                <span className="text-lg">✓</span>
              </div>
              <div className="text-center">
                <div className="font-semibold text-green-200">已完成</div>
                <div className="text-xs text-blue-200">選擇範本</div>
              </div>
            </div>

            <div className="w-12 h-1 bg-white bg-opacity-30 rounded-full overflow-hidden">
              <div className="w-full h-full bg-gradient-to-r from-green-400 to-blue-400 rounded-full"></div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white text-blue-600 rounded-full flex items-center justify-center font-bold shadow-lg animate-pulse">
                <span className="text-lg">2</span>
              </div>
              <div className="text-center">
                <div className="font-semibold">進行中</div>
                <div className="text-xs text-blue-200">輸入內容</div>
              </div>
            </div>

            <div className="w-12 h-1 bg-white bg-opacity-30 rounded-full"></div>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white bg-opacity-30 text-white rounded-full flex items-center justify-center font-bold">
                <span className="text-lg">3</span>
              </div>
              <div className="text-center">
                <div className="font-semibold text-blue-200">待完成</div>
                <div className="text-xs text-blue-300">開始遊戲</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 主要內容區域 - Wordwall 風格 */}
      <div className="max-w-5xl mx-auto py-6 sm:py-8 md:py-10 px-3 sm:px-4 md:px-6 lg:px-8 bg-gray-50 min-h-screen">
        {/* 活動標題 - 簡潔設計 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 mb-6 hover:shadow-md transition-all duration-200">
          <div className="mb-6">
            <h2 className="text-2xl sm:text-xl font-bold text-gray-900 mb-2 flex items-center">
              <span className="w-8 h-8 bg-blue-500 text-white rounded-lg flex items-center justify-center text-lg mr-3">1</span>
              活動標題
            </h2>
            <p className="text-gray-600 ml-11">為您的學習活動取一個有意義的名稱</p>
          </div>
          <input
            type="text"
            value={activityTitle}
            onChange={(e) => setActivityTitle(e.target.value)}
            className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-3 focus:ring-blue-500 focus:ring-opacity-50 focus:border-blue-500 transition-all duration-200 bg-white text-gray-900 placeholder-gray-500 text-lg font-medium hover:border-gray-400"
            placeholder="例如：英語詞彙練習 - 動物篇"
          />
        </div>

        {/* 詞彙輸入區域 - Wordwall 專業風格 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 hover:shadow-md transition-all duration-200">
          {/* 區域標題 - 專業設計 */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl sm:text-xl font-bold text-gray-900 flex items-center">
                <span className="w-8 h-8 bg-green-500 text-white rounded-lg flex items-center justify-center text-lg mr-3">2</span>
                詞彙內容
              </h2>

              {/* 使用說明按鈕 - 簡潔設計 */}
              <button
                onClick={() => setShowInstructions(!showInstructions)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200 font-medium"
              >
                <span className="text-blue-500">💡</span>
                <span>使用說明</span>
                <span className={`transform transition-transform duration-200 ${showInstructions ? 'rotate-180' : ''}`}>▼</span>
              </button>
            </div>
            <p className="text-gray-600 ml-11">輸入您想要在遊戲中使用的詞彙對</p>
          </div>

          {/* 操作說明展開區域 */}
          {showInstructions && (
            <div className="mb-6 p-5 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-xl border border-blue-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
                <div className="flex items-start space-x-2">
                  <span className="text-blue-500 font-semibold">1.</span>
                  <span>在左欄輸入英文單字，右欄輸入中文翻譯</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-blue-500 font-semibold">2.</span>
                  <span>至少需要 {gameConfig.minItems} 個，最多 {gameConfig.maxItems} 個單字</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-blue-500 font-semibold">3.</span>
                  <span>可以添加音標幫助發音學習</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-blue-500 font-semibold">4.</span>
                  <span>使用「交換列」按鈕調整欄位順序</span>
                </div>
              </div>
            </div>
          )}

          {/* 欄位標題和控制區域 - Wordwall 風格 */}
          <div className="mb-8">
            {/* 工具列 */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between space-y-4 sm:space-y-0 mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-center space-x-4">
                <button
                  onClick={swapColumns}
                  className="flex items-center space-x-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-lg border border-gray-300 hover:border-gray-400 transition-all duration-200 font-medium shadow-sm hover:shadow"
                >
                  <span className="text-orange-500">🔄</span>
                  <span>交換欄位</span>
                </button>

                <div className="hidden sm:block w-px h-6 bg-gray-300"></div>

                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="font-medium">
                    {vocabularyItems.filter(item => item.english.trim() && item.chinese.trim()).length} / {gameConfig.maxItems} 已完成
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>最少需要 {gameConfig.minItems} 個詞彙對</span>
              </div>
            </div>

            {/* 欄位標題 - 簡潔設計 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <span className="text-2xl">🇬🇧</span>
                <div>
                  <h4 className="font-bold text-blue-900">英文單字</h4>
                  <p className="text-xs text-blue-700">遊戲中顯示的問題</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg border-l-4 border-red-500">
                <span className="text-2xl">🇹🇼</span>
                <div>
                  <h4 className="font-bold text-red-900">中文翻譯</h4>
                  <p className="text-xs text-red-700">對應的正確答案</p>
                </div>
              </div>
            </div>
          </div>

          {/* 詞彙項目列表 - Wordwall 表格風格 */}
          <div className="space-y-2">
            {vocabularyItems.map((item, index) => (
              <div key={item.id} className="group bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all duration-200">
                {/* 手機版：垂直佈局 */}
                <div className="flex flex-col sm:hidden p-4 space-y-4">
                  {/* 序號和刪除按鈕 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="w-6 h-6 bg-blue-500 text-white rounded text-sm font-bold flex items-center justify-center">
                        {index + 1}
                      </span>
                      <span className="text-sm text-gray-500 font-medium">詞彙對 #{index + 1}</span>
                    </div>
                    {vocabularyItems.length > gameConfig.minItems && (
                      <button
                        onClick={() => removeItem(item.id)}
                        className="w-8 h-8 bg-gray-100 hover:bg-red-100 text-gray-500 hover:text-red-600 rounded-lg transition-all duration-200 flex items-center justify-center"
                        title="刪除此項目"
                      >
                        <span className="text-lg">×</span>
                      </button>
                    )}
                  </div>

                  {/* 英文輸入框 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">🇬🇧 英文單字</label>
                    <input
                      type="text"
                      value={item.english}
                      onChange={(e) => updateItem(item.id, 'english', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-gray-900 placeholder-gray-400"
                      placeholder="輸入英文單字..."
                    />
                  </div>

                  {/* 中文輸入框 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">🇹🇼 中文翻譯</label>
                    <input
                      type="text"
                      value={item.chinese}
                      onChange={(e) => updateItem(item.id, 'chinese', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-gray-900 placeholder-gray-400"
                      placeholder="輸入中文翻譯..."
                    />
                  </div>
                </div>

                {/* 平板桌面版：表格式佈局 */}
                <div className="hidden sm:flex items-center p-4 space-x-4">
                  {/* 序號 */}
                  <div className="w-8 h-8 bg-blue-500 text-white rounded flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {index + 1}
                  </div>

                  {/* 英文單字欄位 */}
                  <div className="flex-1">
                    <input
                      type="text"
                      value={item.english}
                      onChange={(e) => updateItem(item.id, 'english', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-gray-900 placeholder-gray-400 hover:border-gray-400"
                      placeholder="輸入英文單字..."
                    />
                  </div>

                  {/* 中文翻譯欄位 */}
                  <div className="flex-1">
                    <input
                      type="text"
                      value={item.chinese}
                      onChange={(e) => updateItem(item.id, 'chinese', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-gray-900 placeholder-gray-400 hover:border-gray-400"
                      placeholder="輸入中文翻譯..."
                    />
                  </div>

                  {/* 刪除按鈕 */}
                  {vocabularyItems.length > gameConfig.minItems && (
                    <button
                      onClick={() => removeItem(item.id)}
                      className="w-8 h-8 bg-gray-100 hover:bg-red-100 text-gray-500 hover:text-red-600 rounded-lg transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100"
                      title="刪除此項目"
                    >
                      <span className="text-lg font-bold">×</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* 新增項目按鈕 - Wordwall 風格 */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={addNewItem}
              disabled={vocabularyItems.length >= gameConfig.maxItems}
              className="flex items-center space-x-3 px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 border-2 border-dashed border-gray-300 hover:border-blue-400 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium w-full sm:w-auto"
            >
              <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">+</span>
              <span>新增詞彙對</span>
              <span className="text-sm text-gray-500">
                ({vocabularyItems.length}/{gameConfig.maxItems})
              </span>
            </button>
          </div>
        </div>

        {/* 完成按鈕區域 - Wordwall 專業風格 */}
        <div className="mt-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center justify-center">
                <span className="w-8 h-8 bg-blue-500 text-white rounded-lg flex items-center justify-center text-lg mr-3">3</span>
                完成設定
              </h3>
              <p className="text-gray-600">檢查您的詞彙內容，然後開始遊戲</p>
            </div>

            {/* 狀態檢查 */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <span className={`w-3 h-3 rounded-full ${validateItems() ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                  <span className="font-medium">
                    {validateItems() ? '準備就緒' : '需要更多詞彙'}
                  </span>
                </div>
                <span className="text-gray-500">
                  {vocabularyItems.filter(item => item.english.trim() && item.chinese.trim()).length} / {gameConfig.minItems} 最少需求
                </span>
              </div>
            </div>

            {/* 按鈕組 */}
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              {/* 返回按鈕 */}
              <button
                onClick={() => router.push('/create')}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium flex items-center justify-center space-x-2"
              >
                <span>←</span>
                <span>返回選擇範本</span>
              </button>

              {/* 主要行動按鈕 */}
              <button
                onClick={saveActivity}
                disabled={!validateItems() || isLoading}
                className="flex-1 sm:flex-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-bold flex items-center justify-center space-x-3 shadow-sm hover:shadow-md"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>{isEditMode ? '更新中...' : '保存中...'}</span>
                  </>
                ) : (
                  <>
                    <span>🚀</span>
                    <span>{isEditMode ? '更新並開始遊戲' : '完成並開始遊戲'}</span>
                  </>
                )}
              </button>
            </div>

            {/* 提示信息 */}
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                💡 遊戲將會自動保存，您隨時可以回來編輯
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
