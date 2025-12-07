'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import LoginPrompt from '@/components/Auth/LoginPrompt';
import UnifiedNavigation from '@/components/navigation/UnifiedNavigation';
import { loadAndNormalizeVocabularyData, getSourceDisplayName } from '@/lib/vocabulary/loadVocabularyData';
import SortableVocabularyItem from '@/components/vocabulary-item-with-image/SortableVocabularyItem';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';


// 使用統一的詞彙項目接口
import type { VocabularyItem } from '@/lib/vocabulary/loadVocabularyData';

// 實際遊戲配置（來自 /games/switcher）
const gameTemplateConfig = {
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
  'match-up-game': {
    name: 'Match up 配對遊戲',
    description: '拖動左側卡片到右側對應的答案框進行配對',
    icon: '🎯',
    category: '關聯配對記憶',
    minItems: 1,
    maxItems: 30,
    inputType: 'vocabulary'
  },
  'flying-fruit-game': {
    name: 'Flying Fruit 飛行水果',
    description: '水果從畫面中拋出，點擊正確答案的水果。訓練快速反應和詞彙記憶',
    icon: '🍎',
    category: '動態反應記憶',
    minItems: 1,
    maxItems: 30,
    inputType: 'vocabulary'
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
  const [actualGameTemplateId, setActualGameTemplateId] = useState<string | null>(null); // 🔥 新增：保存活動的實際 gameTemplateId
  const [isAssignmentMode, setIsAssignmentMode] = useState(false);
  const [assignmentId, setAssignmentId] = useState<string | null>(null);
  const [studentName, setStudentName] = useState<string | null>(null);

  // 拖移排序 sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
          gameTemplateId?: string; // 🔥 新增：讀取活動的 gameTemplateId
          content?: {
            gameTemplateId?: string; // 🔥 新增：也可能存儲在 content 中
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
        setActivityTitle(activity.title || '無標題活動');

        // 🔥 保存活動的實際 gameTemplateId（優先級：activity.gameTemplateId > activity.content.gameTemplateId > templateId）
        const realGameTemplateId = activity.gameTemplateId || activity.content?.gameTemplateId || templateId;
        setActualGameTemplateId(realGameTemplateId);
        console.log('🎮 活動的實際 gameTemplateId:', realGameTemplateId, '(URL templateId:', templateId, ')');

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

  // 複製項目 - Wordwall 風格
  const duplicateItem = (id: string) => {
    setVocabularyItems((items) => {
      // 找到要複製的項目
      const index = items.findIndex((item) => item.id === id);
      if (index === -1) return items;

      // 複製項目 (包含所有屬性: english, chinese, image, sound, formatting)
      const itemToDuplicate = items[index];
      const newItem = {
        ...itemToDuplicate,
        id: `${Date.now()}-${Math.random()}`, // 生成唯一 ID
      };

      // 在當前項目下方插入新項目
      const newItems = [...items];
      newItems.splice(index + 1, 0, newItem);

      return newItems;
    });
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

  // 處理拖移排序
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setVocabularyItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
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
      console.log('🔍 保存活動 - 圖片字段檢查:', JSON.stringify(filteredVocabulary.map(item => ({
        id: item.id,
        english: item.english,
        chinese: item.chinese,
        imageId: item.imageId,
        imageUrl: item.imageUrl,
        imageSize: item.imageSize,
        chineseImageId: item.chineseImageId,
        chineseImageUrl: item.chineseImageUrl,
        chineseImageSize: item.chineseImageSize
      })), null, 2));

      if (isEditMode && editingActivityId) {
        // 🔥 編輯模式：使用活動的實際 gameTemplateId 而不是 URL 的 templateId
        const gameIdToUse = actualGameTemplateId || templateId;
        console.log('💾 保存活動 - 使用 gameTemplateId:', gameIdToUse, '(actualGameTemplateId:', actualGameTemplateId, ', URL templateId:', templateId, ')');

        // 編輯模式：更新現有活動
        const response = await fetch(`/api/activities/${editingActivityId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: activityTitle,
            gameTemplateId: gameIdToUse, // 🔥 使用實際的 gameTemplateId
            vocabularyItems: filteredVocabulary,
            type: 'vocabulary_game',
            templateType: gameConfig.inputType,
          }),
        });

        if (response.ok) {
          // 🔥 [v61.0] 正確處理 API 返回的嵌套結構
          const data = await response.json() as any;

          // ✅ 提取 activity 對象（API 返回 { success: true, activity: {...} }）
          const activity = data.activity || data;

          // ✅ [v61.0] 驗證 activity.id 存在
          if (!activity?.id) {
            console.error('❌ [v61.0] API 返回的活動 ID 為空:', data);
            alert('保存失敗：無法獲取活動 ID，請重試');
            return;
          }

          console.log('✅ [v61.0] 活動更新成功，準備重定向:', {
            activityId: activity.id,
            gameId: gameIdToUse
          });

          alert('活動更新成功！');
          // 🔥 跳轉到遊戲頁面，使用實際的 gameTemplateId 和正確的 activityId
          router.push(`/games/switcher?game=${gameIdToUse}&activityId=${activity.id}`);
        } else {
          const errorData = await response.json() as any;
          console.error('❌ [v61.0] 更新失敗:', errorData);
          alert('更新失敗：' + (errorData.error || '請重試'));
        }
      } else {
        // 創建模式：創建新活動
        const requestBody = {
          title: activityTitle,
          gameTemplateId: templateId,
          vocabularyItems: filteredVocabulary,
          type: 'vocabulary_game',
          templateType: gameConfig.inputType,
        };

        console.log('🔍 發送到 API 的請求體:', JSON.stringify(requestBody, null, 2));

        const response = await fetch('/api/activities', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        if (response.ok) {
          // 🔥 [v61.0] 正確處理 API 返回的嵌套結構
          const data = await response.json() as any;
          const activity = data.activity || data;

          // 🔥 [v55.0] 驗證 activity.id 是否存在
          if (!activity?.id) {
            console.error('❌ [v61.0] API 返回的活動 ID 為空:', data);
            alert('保存失敗：無法獲取活動 ID，請重試');
            return;
          }

          console.log('✅ [v61.0] 活動創建成功:', {
            id: activity.id,
            title: activity.title || '無標題',
            totalWords: activity.totalWords || 0
          });

          // 跳轉到遊戲頁面，並傳遞活動 ID
          router.push(`/games/switcher?game=${templateId}&activityId=${activity.id}`);
        } else {
          const errorData = await response.json() as { error?: string };
          console.error('❌ 保存失敗:', {
            status: response.status,
            statusText: response.statusText,
            error: errorData.error
          });

          // 🔥 [v55.0] 根據錯誤類型提供更詳細的提示
          if (response.status === 401) {
            alert('保存失敗：請先登入才能保存活動');
          } else if (response.status === 400) {
            alert('保存失敗：' + (errorData.error || '缺少必要字段'));
          } else {
            alert('保存失敗，請重試');
          }
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          {/* 遊戲信息 */}
          <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-lg flex items-center justify-center text-xl sm:text-2xl flex-shrink-0">
              {gameConfig.icon}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">{gameConfig.name}</h2>
              <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">{gameConfig.description}</p>
            </div>
          </div>

          {/* 進度指示器 */}
          <div className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-gray-500">
            <span className="text-blue-600">選擇範本</span>
            <span>→</span>
            <span className="text-blue-600 font-medium">輸入內容</span>
            <span>→</span>
            <span>播放</span>
          </div>
        </div>
      </div>

      {/* 主要內容區域 */}
      <div className="max-w-7xl mx-auto py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8">
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
          <div className="mb-4 sm:mb-6">
            <button
              onClick={() => setShowInstructions(!showInstructions)}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 text-sm sm:text-base"
            >
              <span>📋</span>
              <span>操作說明</span>
            </button>
            {showInstructions && (
              <div className="mt-2 p-3 sm:p-4 bg-blue-50 rounded-lg text-xs sm:text-sm text-gray-700 space-y-1">
                <p>1. 在左欄輸入英文單字，在右欄輸入對應的中文翻譯</p>
                <p>2. 可以添加音標來幫助發音學習</p>
                <p>3. 至少需要 {gameConfig.minItems} 個單字，最多 {gameConfig.maxItems} 個</p>
                <p>4. 點擊「交換列」可以交換英文和中文的位置</p>
              </div>
            )}
          </div>

          {/* 欄位標題和交換按鈕 */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 text-sm sm:text-base">英文單字</h3>
              <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">這些將在遊戲中顯示</p>
            </div>
            <button
              onClick={swapColumns}
              className="px-3 py-1.5 sm:py-1 text-xs sm:text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors whitespace-nowrap self-start sm:self-auto"
            >
              ⇄ 交換列
            </button>
            <div className="flex-1 min-w-0 sm:ml-4">
              <h3 className="font-medium text-gray-900 text-sm sm:text-base">中文翻譯</h3>
              <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">對應的中文意思</p>
            </div>
          </div>

          {/* 詞彙項目列表 - 使用拖移排序 */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={vocabularyItems}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {vocabularyItems.map((item, index) => (
                  <SortableVocabularyItem
                    key={item.id}
                    item={item}
                    index={index}
                    onChange={(updatedItem) => updateItemFull(item.id, updatedItem)}
                    onRemove={() => removeItem(item.id)}
                    onDuplicate={() => duplicateItem(item.id)}
                    minItems={gameConfig.minItems}
                    totalItems={vocabularyItems.length}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {/* 新增項目按鈕 */}
          <div className="mt-6">
            <button
              onClick={addNewItem}
              disabled={vocabularyItems.length >= gameConfig.maxItems}
              className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base w-full sm:w-auto justify-center sm:justify-start"
            >
              <span className="text-lg">+</span>
              <span>新增項目</span>
              <span className="text-xs sm:text-sm text-gray-500">
                最小{gameConfig.minItems} 最大{gameConfig.maxItems}
              </span>
            </button>
          </div>
        </div>

        {/* 完成按鈕 */}
        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
          <button
            onClick={() => router.push('/create')}
            className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm sm:text-base"
          >
            返回
          </button>
          <button
            onClick={saveActivity}
            disabled={!validateItems() || isLoading}
            className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
          >
            {isLoading ? (isEditMode ? '更新中...' : '保存中...') : (isEditMode ? '更新並開始遊戲' : '完成並開始遊戲')}
          </button>
        </div>
      </div>
    </div>
  );
}
