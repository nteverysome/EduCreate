'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import LoginPrompt from '@/components/Auth/LoginPrompt';
import UnifiedNavigation from '@/components/navigation/UnifiedNavigation';
import { loadAndNormalizeVocabularyData, getSourceDisplayName } from '@/lib/vocabulary/loadVocabularyData';
import VocabularyItemWithImage from '@/components/vocabulary-item-with-image';

// 使用統一的詞彙項目接口
import type { VocabularyItem } from '@/lib/vocabulary/loadVocabularyData';

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
    name: 'Shimozurdo 雲朵遊戲',
    description: '通過雲朵碰撞學習英語詞彙，基於主動回憶和視覺記憶原理，動態反應記憶訓練',
    icon: '☁️',
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
  const templateId = (params?.templateId as string) || 'default';

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
  const [isAssignmentMode, setIsAssignmentMode] = useState(false);
  const [assignmentId, setAssignmentId] = useState<string | null>(null);
  const [studentName, setStudentName] = useState<string | null>(null);

  // 檢查是否為編輯模式或課業分配模式並載入活動數據
  useEffect(() => {
    if (!searchParams) return;

    const editId = searchParams.get('edit');
    const activityId = searchParams.get('activityId');
    const assignmentIdParam = searchParams.get('assignmentId');
    const studentNameParam = searchParams.get('studentName');

    if (editId) {
      // 編輯模式
      setIsEditMode(true);
      setEditingActivityId(editId);
      loadActivityForEdit(editId);
    } else if (activityId && assignmentIdParam) {
      // 課業分配模式 - assignmentId 存在即可，studentName 可以為空
      console.log('🎯 檢測到課業分配模式:', { activityId, assignmentIdParam, studentNameParam });
      setIsAssignmentMode(true);
      setAssignmentId(assignmentIdParam);
      setStudentName(studentNameParam || '');
      loadActivityForAssignment(activityId);
    }
  }, [searchParams]);

  // 載入要編輯的活動數據
  const loadActivityForEdit = async (activityId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/activities/${activityId}`);
      if (response.ok) {
        const activity = await response.json() as {
          title?: string;
          vocabularyItems?: Array<{
            english?: string;
            word?: string;
            chinese?: string;
            translation?: string;
            phonetic?: string;
            imageUrl?: string;
            audioUrl?: string;
          }>;
          content?: {
            vocabularyItems?: Array<{
              english?: string;
              word?: string;
              chinese?: string;
              translation?: string;
              phonetic?: string;
              imageUrl?: string;
              audioUrl?: string;
            }>;
          };
        };
        setActivityTitle(activity.title || '無標題活動');

        // 載入詞彙數據 - 支援新舊架構
        // 使用統一的詞彙載入工具函數
        const { vocabularyItems: loadedVocabulary, source, count } = loadAndNormalizeVocabularyData(activity);

        if (count > 0) {
          setVocabularyItems(loadedVocabulary);
          console.log(`✅ 從 ${getSourceDisplayName(source)} 載入詞彙數據:`, count, '個詞彙');
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

  // 載入課業分配的活動數據並自動開始遊戲
  const loadActivityForAssignment = async (activityId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/activities/${activityId}`);
      if (response.ok) {
        const activity: any = await response.json();
        setActivityTitle(activity.title);

        // 載入詞彙數據 - 支援新舊架構
        let vocabularyData = [];

        if (activity.vocabularyItems && Array.isArray(activity.vocabularyItems)) {
          // 新架構：從關聯表中獲取詞彙數據
          vocabularyData = activity.vocabularyItems;
          console.log('📝 從關聯表載入詞彙數據:', vocabularyData.length, '個詞彙');
        } else if (activity.elements && Array.isArray(activity.elements) && activity.elements.length > 0) {
          // 從 elements 字段載入詞彙數據
          vocabularyData = activity.elements;
          console.log('📝 從 elements 字段載入詞彙數據:', vocabularyData.length, '個詞彙');
        } else if (activity.content && activity.content.vocabularyItems) {
          // 舊架構：從 content 中獲取詞彙數據
          vocabularyData = activity.content.vocabularyItems;
          console.log('📝 從 content 載入詞彙數據:', vocabularyData.length, '個詞彙');
        }

        // 轉換為組件所需的格式
        const formattedVocabulary = vocabularyData.map((item: any, index: number) => ({
          id: (index + 1).toString(),
          english: item.english || '',
          chinese: item.chinese || ''
        }));

        // 確保至少有3個項目
        while (formattedVocabulary.length < 3) {
          formattedVocabulary.push({
            id: (formattedVocabulary.length + 1).toString(),
            english: '',
            chinese: ''
          });
        }

        setVocabularyItems(formattedVocabulary);
        console.log('📝 載入課業分配活動成功:', activity.title);

        // 自動開始遊戲
        setTimeout(() => {
          startAssignmentGame(activity.id);
        }, 1000);
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

  // 開始課業分配遊戲
  const startAssignmentGame = (activityId: string) => {
    // 直接從 URL 參數獲取最新值，避免狀態更新延遲問題
    const currentAssignmentId = searchParams?.get('assignmentId');
    const currentStudentName = searchParams?.get('studentName');

    console.log('🎮 開始課業分配遊戲:', {
      activityId,
      assignmentId: currentAssignmentId,
      studentName: currentStudentName,
      templateId
    });

    // 跳轉到遊戲頁面，並傳遞所有必要參數
    const gameUrl = `/games/${templateId}?activityId=${activityId}&assignmentId=${currentAssignmentId}&studentName=${encodeURIComponent(currentStudentName || '')}`;
    window.location.href = gameUrl;
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

  // 更新整個詞彙項目（用於圖片功能）
  const updateItemFull = (id: string, updatedItem: VocabularyItem) => {
    console.log('🔍 [page.tsx] updateItemFull 開始:', { id, updatedItem });

    const newVocabularyItems = vocabularyItems.map(item =>
      item.id === id ? updatedItem : item
    );

    console.log('🔍 [page.tsx] 更新後的 vocabularyItems:', newVocabularyItems);

    setVocabularyItems(newVocabularyItems);

    console.log('✅ [page.tsx] updateItemFull 完成');
  };

  const swapColumns = () => {
    setVocabularyItems(vocabularyItems.map(item => ({
      ...item,
      // 交換英文和中文文字
      english: item.chinese,
      chinese: item.english,
      // 交換英文和中文圖片
      imageId: item.chineseImageId,
      imageUrl: item.chineseImageUrl,
      chineseImageId: item.imageId,
      chineseImageUrl: item.imageUrl,
    })));
  };

  // 保存活動到數據庫
  const saveActivity = async () => {
    setIsLoading(true);
    try {
      // 修改過濾邏輯：只要有英文、中文或圖片任一項就算有效
      const filteredVocabulary = vocabularyItems.filter(item =>
        item.english.trim() || item.chinese.trim() || item.imageUrl || item.chineseImageUrl
      );

      console.log('🔍 保存活動 - 詞彙數據:', filteredVocabulary);
      console.log('🔍 保存活動 - 圖片字段檢查:', filteredVocabulary.map(item => ({
        id: item.id,
        imageId: item.imageId,
        imageUrl: item.imageUrl,
        imageSize: item.imageSize,
        chineseImageId: item.chineseImageId,
        chineseImageUrl: item.chineseImageUrl,
        chineseImageSize: item.chineseImageSize
      })));

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
          const activity = await response.json() as { id?: string };
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
          const activity = await response.json() as { id?: string };
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
    // 修改驗證邏輯：只要有英文、中文或圖片任一項就算有效
    const validItems = vocabularyItems.filter(item =>
      item.english.trim() !== '' || item.chinese.trim() !== '' || item.imageUrl || item.chineseImageUrl
    );
    return validItems.length >= gameConfig.minItems;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 統一用戶導航 */}
      <UnifiedNavigation />

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
              <VocabularyItemWithImage
                key={item.id}
                item={item}
                index={index}
                onChange={(updatedItem) => updateItemFull(item.id, updatedItem)}
                onRemove={() => removeItem(item.id)}
                minItems={gameConfig.minItems}
                totalItems={vocabularyItems.length}
              />
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
            {isLoading ? (isEditMode ? '更新中...' : '保存中...') : (isEditMode ? '更新並開始遊戲' : '完成並開始遊戲')}
          </button>
        </div>
      </div>
    </div>
  );
}
