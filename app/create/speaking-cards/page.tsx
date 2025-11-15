'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import LoginPrompt from '@/components/Auth/LoginPrompt';
import UnifiedNavigation from '@/components/navigation/UnifiedNavigation';
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
import SortableSpeakingCardItem from '@/components/speaking-card-item/SortableSpeakingCardItem';

// Speaking Card 數據接口
export interface SpeakingCardData {
  id: string;
  text?: string;
  imageUrl?: string;
  imageId?: string;
  audioUrl?: string;
  imageSize?: 'small' | 'medium' | 'large';
}

// 遊戲配置
const gameConfig = {
  name: 'Speaking Cards',
  description: '語音卡牌遊戲 - 通過翻卡學習，支援圖片、文字和語音',
  icon: '🎴',
  category: '語音聽覺記憶',
  minItems: 3,
  maxItems: 100,
};

export default function SpeakingCardsCreatePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activityTitle, setActivityTitle] = useState('');
  const [cardItems, setCardItems] = useState<SpeakingCardData[]>([
    { id: '1', text: '' },
    { id: '2', text: '' },
    { id: '3', text: '' },
  ]);
  const [showInstructions, setShowInstructions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);

  // 拖移排序設置
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 檢查是否為編輯模式
  useEffect(() => {
    if (!searchParams) return;
    const editId = searchParams.get('edit');
    if (editId) {
      setIsEditMode(true);
      setEditingActivityId(editId);
      loadActivityForEdit(editId);
    }
  }, [searchParams]);

  // 載入活動數據（編輯模式）
  const loadActivityForEdit = async (activityId: string) => {
    try {
      const response = await fetch(`/api/activities/${activityId}`);
      if (response.ok) {
        const activity = await response.json();
        setActivityTitle(activity.title);
        
        // 轉換詞彙數據為卡片數據
        if (activity.vocabularyItems && activity.vocabularyItems.length > 0) {
          const cards = activity.vocabularyItems.map((item: any, index: number) => ({
            id: item.id || `${index + 1}`,
            text: item.english || '',
            imageUrl: item.imageUrl,
            imageId: item.imageId,
            audioUrl: item.audioUrl,
            imageSize: item.imageSize || 'medium',
          }));
          setCardItems(cards);
        }
      }
    } catch (error) {
      console.error('載入活動失敗:', error);
    }
  };

  // 處理拖移結束
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setCardItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // 新增卡片
  const addNewCard = () => {
    if (cardItems.length < gameConfig.maxItems) {
      const newId = `${Date.now()}-${Math.random()}`;
      setCardItems([...cardItems, { id: newId, text: '' }]);
    }
  };

  // 刪除卡片
  const removeCard = (id: string) => {
    if (cardItems.length > gameConfig.minItems) {
      setCardItems(cardItems.filter(item => item.id !== id));
    }
  };

  // 複製卡片
  const duplicateCard = (id: string) => {
    setCardItems((items) => {
      const index = items.findIndex((item) => item.id === id);
      if (index === -1) return items;

      const itemToDuplicate = items[index];
      const newItem = {
        ...itemToDuplicate,
        id: `${Date.now()}-${Math.random()}`,
      };

      const newItems = [...items];
      newItems.splice(index + 1, 0, newItem);
      return newItems;
    });
  };

  // 更新卡片
  const updateCard = (id: string, updatedCard: SpeakingCardData) => {
    setCardItems(cardItems.map(item =>
      item.id === id ? updatedCard : item
    ));
  };

  // 驗證卡片數據
  const validateCards = () => {
    if (cardItems.length < gameConfig.minItems) return false;
    // 至少要有一個卡片有內容（文字、圖片或語音）
    return cardItems.some(card => card.text || card.imageUrl || card.audioUrl);
  };

  // 保存活動
  const saveActivity = async () => {
    if (!validateCards()) {
      alert(`請至少填寫 ${gameConfig.minItems} 張卡片，且至少一張卡片要有內容`);
      return;
    }

    if (!activityTitle.trim()) {
      alert('請輸入活動標題');
      return;
    }

    setIsLoading(true);

    try {
      // 轉換卡片數據為詞彙格式（為了兼容現有系統）
      const vocabularyItems = cardItems.map((card, index) => {
        // 提取 imageUrl 字符串（如果是對象數組，取第一個對象的 url）
        let imageUrlString = card.imageUrl;
        if (Array.isArray(card.imageUrl) && card.imageUrl.length > 0) {
          imageUrlString = card.imageUrl[0].url;
        }

        return {
          id: card.id,
          english: card.text || `Card ${index + 1}`, // 如果沒有文字，使用默認值
          chinese: '-', // Speaking Cards 不需要中文，使用 '-' 作為佔位符
          imageUrl: imageUrlString,
          imageId: card.imageId,
          audioUrl: card.audioUrl,
          imageSize: card.imageSize,
        };
      });

      const activityData = {
        title: activityTitle,
        gameTemplateId: 'speaking-cards', // API 期望的字段名
        vocabularyItems,
      };

      const url = isEditMode && editingActivityId
        ? `/api/activities/${editingActivityId}`
        : '/api/activities';

      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(activityData),
      });

      if (response.ok) {
        const savedActivity = await response.json();
        router.push(`/play/speaking-cards?activityId=${savedActivity.id}`);
      } else {
        const error = await response.json();
        alert(error.error || '保存失敗');
      }
    } catch (error) {
      console.error('保存活動失敗:', error);
      alert('保存失敗，請稍後再試');
    } finally {
      setIsLoading(false);
    }
  };

  // 未登入提示
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return <LoginPrompt />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UnifiedNavigation />

      {/* 頁面標題區域 */}
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

        {/* 卡片輸入區域 */}
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
                <p>1. 每張卡片可以包含文字、圖片或語音（或組合）</p>
                <p>2. 至少需要 {gameConfig.minItems} 張卡片，最多 {gameConfig.maxItems} 張</p>
                <p>3. 翻卡時如果有語音會自動播放</p>
                <p>4. 可以拖動卡片調整順序</p>
              </div>
            )}
          </div>

          {/* 卡片列表 - 使用拖移排序 */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={cardItems}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {cardItems.map((card, index) => (
                  <SortableSpeakingCardItem
                    key={card.id}
                    card={card}
                    index={index}
                    onChange={(updatedCard) => updateCard(card.id, updatedCard)}
                    onRemove={() => removeCard(card.id)}
                    onDuplicate={() => duplicateCard(card.id)}
                    minItems={gameConfig.minItems}
                    totalItems={cardItems.length}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {/* 新增卡片按鈕 */}
          <div className="mt-6">
            <button
              onClick={addNewCard}
              disabled={cardItems.length >= gameConfig.maxItems}
              className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base w-full sm:w-auto justify-center sm:justify-start"
            >
              <span className="text-lg">+</span>
              <span>新增卡片</span>
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
            disabled={!validateCards() || isLoading}
            className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
          >
            {isLoading ? (isEditMode ? '更新中...' : '保存中...') : (isEditMode ? '更新並開始遊戲' : '完成並開始遊戲')}
          </button>
        </div>
      </div>
    </div>
  );
}

