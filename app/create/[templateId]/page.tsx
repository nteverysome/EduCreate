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

      {/* 遊戲頭部 - 現代化設計 */}
      <div className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* 遊戲信息 - 優化設計 */}
          <div className="flex items-start sm:items-center space-x-4 sm:space-x-6 mb-6 sm:mb-8">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl flex-shrink-0 shadow-lg">
              {gameConfig.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 leading-tight">{gameConfig.name}</h1>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-3">{gameConfig.description}</p>
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {gameConfig.category}
                </span>
                <span className="text-xs text-gray-500">
                  需要 {gameConfig.minItems}-{gameConfig.maxItems} 個詞彙
                </span>
              </div>
            </div>
          </div>

          {/* 進度指示器 - 現代化設計 */}
          <div className="flex items-center justify-center sm:justify-start space-x-3 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-semibold">✓</div>
              <span className="text-gray-600 font-medium">選擇範本</span>
            </div>
            <div className="w-8 h-0.5 bg-blue-200"></div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-semibold">2</div>
              <span className="text-blue-600 font-semibold">輸入內容</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-200"></div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-xs font-semibold">3</div>
              <span className="text-gray-500">開始遊戲</span>
            </div>
          </div>
        </div>
      </div>

      {/* 主要內容區域 - 現代化設計 */}
      <div className="max-w-5xl mx-auto py-6 sm:py-8 lg:py-12 px-4 sm:px-6 lg:px-8">
        {/* 活動標題 - 現代化設計 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 mb-6 sm:mb-8 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <span className="text-white text-lg">📝</span>
            </div>
            <div>
              <label className="block text-lg font-bold text-gray-900">
                活動標題
              </label>
              <p className="text-sm text-gray-500">為您的學習活動命名</p>
            </div>
          </div>
          <input
            type="text"
            value={activityTitle}
            onChange={(e) => setActivityTitle(e.target.value)}
            className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-400 text-lg"
            placeholder="例如：英語詞彙練習 - 動物篇"
          />
        </div>

        {/* 詞彙輸入區域 - 現代化設計 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 hover:shadow-md transition-shadow duration-200">
          {/* 區域標題 */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-lg">📚</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">詞彙內容</h3>
                <p className="text-sm text-gray-500">添加您的學習詞彙</p>
              </div>
            </div>

            {/* 操作說明按鈕 */}
            <button
              onClick={() => setShowInstructions(!showInstructions)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl transition-colors duration-200"
            >
              <span>💡</span>
              <span className="font-medium">使用說明</span>
            </button>
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

          {/* 欄位標題和控制區域 */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
            {/* 欄位標題 */}
            <div className="flex-1 grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                <h4 className="font-bold text-blue-900 mb-1 flex items-center">
                  <span className="mr-2">🇬🇧</span>
                  英文單字
                </h4>
                <p className="text-xs text-blue-700">遊戲中顯示的內容</p>
              </div>
              <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-xl border border-red-200">
                <h4 className="font-bold text-red-900 mb-1 flex items-center">
                  <span className="mr-2">🇹🇼</span>
                  中文翻譯
                </h4>
                <p className="text-xs text-red-700">對應的中文意思</p>
              </div>
            </div>

            {/* 控制按鈕組 */}
            <div className="flex items-center space-x-3">
              <button
                onClick={swapColumns}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
              >
                <span>🔄</span>
                <span className="font-medium">交換</span>
              </button>
              <div className="text-xs text-gray-500 bg-gray-100 px-3 py-2 rounded-lg">
                {vocabularyItems.filter(item => item.english.trim() && item.chinese.trim()).length} / {gameConfig.maxItems}
              </div>
            </div>
          </div>

          {/* 詞彙項目列表 */}
          <div className="space-y-3">
            {vocabularyItems.map((item, index) => (
              <div key={item.id} className="group bg-gradient-to-r from-gray-50 to-white p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all duration-200">
                <div className="flex items-center space-x-4">
                  {/* 序號 */}
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {index + 1}
                  </div>

                  {/* 英文單字欄位 */}
                  <div className="flex-1">
                    <input
                      type="text"
                      value={item.english}
                      onChange={(e) => updateItem(item.id, 'english', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-gray-900 placeholder-gray-400 font-medium"
                      placeholder="English word..."
                    />
                  </div>

                  {/* 中文翻譯欄位 */}
                  <div className="flex-1">
                    <input
                      type="text"
                      value={item.chinese}
                      onChange={(e) => updateItem(item.id, 'chinese', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-red-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 bg-white text-gray-900 placeholder-gray-400 font-medium"
                      placeholder="中文翻譯..."
                    />
                  </div>

                  {/* 刪除按鈕 */}
                  {vocabularyItems.length > gameConfig.minItems && (
                    <button
                      onClick={() => removeItem(item.id)}
                      className="w-10 h-10 bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-700 rounded-xl transition-all duration-200 flex items-center justify-center group-hover:scale-110 transform"
                      title="刪除此項目"
                    >
                      <span className="text-lg">🗑️</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* 新增項目按鈕 */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={addNewItem}
              disabled={vocabularyItems.length >= gameConfig.maxItems}
              className="flex items-center space-x-3 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
            >
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold">+</span>
              </div>
              <span>新增詞彙項目</span>
              <div className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">
                {vocabularyItems.length}/{gameConfig.maxItems}
              </div>
            </button>
          </div>
        </div>

        {/* 完成按鈕區域 - 現代化設計 */}
        <div className="mt-8 sm:mt-12">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8">
            <div className="text-center mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">準備開始遊戲？</h3>
              <p className="text-gray-600">確認詞彙內容無誤後，點擊下方按鈕開始您的學習之旅</p>
            </div>

            {/* 手機版：垂直布局 */}
            <div className="flex flex-col sm:hidden space-y-4">
              <button
                onClick={saveActivity}
                disabled={!validateItems() || isLoading}
                className="w-full px-6 py-5 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 flex items-center justify-center space-x-3"
              >
                {isLoading ? (
                  <>
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>{isEditMode ? '更新中...' : '保存中...'}</span>
                  </>
                ) : (
                  <>
                    <span className="text-2xl">🚀</span>
                    <span>{isEditMode ? '更新並開始遊戲' : '完成並開始遊戲'}</span>
                  </>
                )}
              </button>
              <button
                onClick={() => router.push('/create')}
                className="w-full px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-semibold flex items-center justify-center space-x-2"
              >
                <span>←</span>
                <span>返回選擇範本</span>
              </button>
            </div>

            {/* 桌面版：水平布局 */}
            <div className="hidden sm:flex justify-center space-x-6">
              <button
                onClick={() => router.push('/create')}
                className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-semibold flex items-center space-x-2"
              >
                <span>←</span>
                <span>返回選擇範本</span>
              </button>
              <button
                onClick={saveActivity}
                disabled={!validateItems() || isLoading}
                className="px-10 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 flex items-center space-x-3"
              >
                {isLoading ? (
                  <>
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>{isEditMode ? '更新中...' : '保存中...'}</span>
                  </>
                ) : (
                  <>
                    <span className="text-xl">🚀</span>
                    <span>{isEditMode ? '更新並開始遊戲' : '完成並開始遊戲'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
