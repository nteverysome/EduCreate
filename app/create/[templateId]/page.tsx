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

      {/* Wordwall 完全複製風格頭部 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* 簡潔的標題區域 */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{gameConfig.name}</h1>
            <p className="text-gray-600">{gameConfig.description}</p>
          </div>

          {/* Wordwall 風格的進度指示 */}
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">✓</div>
              <span className="text-green-600 font-medium">選擇範本</span>
            </div>
            <div className="w-4 h-px bg-gray-300"></div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
              <span className="text-blue-600 font-medium">輸入內容</span>
            </div>
            <div className="w-4 h-px bg-gray-300"></div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-xs font-bold">3</div>
              <span className="text-gray-500">完成</span>
            </div>
          </div>
        </div>
      </div>

      {/* Wordwall 完全複製風格主要內容 */}
      <div className="max-w-4xl mx-auto py-8 px-4 bg-white min-h-screen">
        {/* 活動標題 - Wordwall 簡潔風格 */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Activity title
          </label>
          <input
            type="text"
            value={activityTitle}
            onChange={(e) => setActivityTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            placeholder="Enter activity title"
          />
        </div>

        {/* Wordwall 完全複製風格詞彙輸入 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Enter your content
            </label>
            <div className="flex items-center space-x-4">
              <button
                onClick={swapColumns}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Swap columns
              </button>
              <span className="text-sm text-gray-500">
                {vocabularyItems.filter(item => item.english.trim() && item.chinese.trim()).length} items
              </span>
            </div>
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

          {/* Wordwall 完全複製風格表格 */}
          <div className="border border-gray-300 rounded">
            {/* 表格頭部 */}
            <div className="bg-gray-50 border-b border-gray-300 grid grid-cols-2 gap-0">
              <div className="px-4 py-3 border-r border-gray-300">
                <span className="text-sm font-medium text-gray-700">Term</span>
              </div>
              <div className="px-4 py-3">
                <span className="text-sm font-medium text-gray-700">Definition</span>
              </div>
            </div>

            {/* 表格內容 */}
            <div className="divide-y divide-gray-300">
              {vocabularyItems.map((item, index) => (
                <div key={item.id} className="grid grid-cols-2 gap-0 hover:bg-gray-50">
                  <div className="border-r border-gray-300 p-0">
                    <input
                      type="text"
                      value={item.english}
                      onChange={(e) => updateItem(item.id, 'english', e.target.value)}
                      className="w-full px-4 py-3 border-0 focus:outline-none focus:ring-0 bg-transparent text-gray-900 placeholder-gray-400"
                      placeholder={`Term ${index + 1}`}
                    />
                  </div>
                  <div className="p-0 relative">
                    <input
                      type="text"
                      value={item.chinese}
                      onChange={(e) => updateItem(item.id, 'chinese', e.target.value)}
                      className="w-full px-4 py-3 border-0 focus:outline-none focus:ring-0 bg-transparent text-gray-900 placeholder-gray-400 pr-10"
                      placeholder={`Definition ${index + 1}`}
                    />
                    {vocabularyItems.length > gameConfig.minItems && (
                      <button
                        onClick={() => removeItem(item.id)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400 hover:text-red-500 transition-colors"
                        title="Delete"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 新增按鈕 - Wordwall 風格 */}
          <div className="mt-4">
            <button
              onClick={addNewItem}
              disabled={vocabularyItems.length >= gameConfig.maxItems}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              + Add item
            </button>
          </div>



        </div>

        {/* Wordwall 完全複製風格完成區域 */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/create')}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium"
            >
              ← Back
            </button>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                {vocabularyItems.filter(item => item.english.trim() && item.chinese.trim()).length} items
              </span>
              <button
                onClick={saveActivity}
                disabled={!validateItems() || isLoading}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creating...' : 'Create activity'}
              </button>
            </div>
          </div>


      </div>
    </div>
  );
}
