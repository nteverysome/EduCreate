/**
 * 表格式詞彙輸入組件 - 模仿 Wordwall 的詞彙輸入界面
 * 支援英文單字和中文翻譯的表格式輸入，與遊戲系統無縫整合
 */
'use client';

import React, { useState, useEffect } from 'react';
import { VocabularyIntegrationService, GEPTLevel, VocabularyItem } from '@/lib/vocabulary/VocabularyIntegrationService';

// 詞彙項目接口已在 VocabularyIntegrationService 中定義

// 組件屬性接口
export interface VocabularyTableEditorProps {
  initialTitle?: string;
  initialVocabulary?: VocabularyItem[];
  onVocabularyChange?: (vocabulary: VocabularyItem[]) => void;
  onComplete?: (data: { title: string; vocabulary: VocabularyItem[] }) => void;
  className?: string;
}

export default function VocabularyTableEditor({
  initialTitle = '無標題43',
  initialVocabulary,
  onVocabularyChange,
  onComplete,
  className = ''
}: VocabularyTableEditorProps) {
  // 狀態管理
  const [activityTitle, setActivityTitle] = useState(initialTitle);
  const [vocabulary, setVocabulary] = useState<VocabularyItem[]>(() => {
    if (initialVocabulary && initialVocabulary.length > 0) {
      return initialVocabulary;
    }
    // 預設5個空項目
    return Array.from({ length: 5 }, (_, index) => ({
      id: `item_${Date.now()}_${index}`,
      english: '',
      chinese: '',
      level: 'elementary' as GEPTLevel
    }));
  });
  const [vocabularyService] = useState(() => VocabularyIntegrationService.getInstance());

  // 添加新項目
  const addNewItem = () => {
    const newItem: VocabularyItem = {
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      english: '',
      chinese: '',
      level: 'elementary'
    };
    setVocabulary(prev => [...prev, newItem]);
  };

  // 更新項目
  const updateItem = (id: string, field: keyof VocabularyItem, value: string) => {
    setVocabulary(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  // 刪除項目
  const removeItem = (id: string) => {
    if (vocabulary.length > 1) {
      setVocabulary(prev => prev.filter(item => item.id !== id));
    }
  };

  // 交換列
  const swapColumns = () => {
    setVocabulary(prev => prev.map(item => ({
      ...item,
      english: item.chinese,
      chinese: item.english
    })));
  };

  // 圖片上傳處理
  const handleImageUpload = (id: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        updateItem(id, 'image', imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  // 完成並保存
  const handleComplete = async () => {
    const validItems = vocabulary.filter(item =>
      item.english.trim() && item.chinese.trim()
    );

    if (validItems.length === 0) {
      alert('請至少輸入一個詞彙對');
      return;
    }

    try {
      // 使用詞彙整合服務創建活動（現在是異步的）
      const activity = await vocabularyService.createVocabularyActivity(
        activityTitle,
        validItems,
        `包含 ${validItems.length} 個詞彙的學習活動`
      );

      console.log('✅ 詞彙活動創建成功:', activity);

      // 獲取遊戲格式的詞彙數據
      const gameVocabulary = vocabularyService.getGameVocabulary(activity.id);
      console.log('🎮 遊戲詞彙數據:', gameVocabulary);

      // 回調完成事件，包含活動ID和遊戲數據
      onComplete?.({
        title: activityTitle,
        vocabulary: validItems,
        activityId: activity.id,
        gameVocabulary: gameVocabulary
      });

      // 顯示成功消息
      alert(`🚀 詞彙輸入完成！\n活動：${activityTitle}\n詞彙數量：${validItems.length} 個\n已同步到 Railway 雲端數據庫`);

    } catch (error) {
      console.error('❌ 保存詞彙活動失敗:', error);
      alert('保存失敗，請重試');
    }
  };

  // 監聽詞彙變化
  useEffect(() => {
    onVocabularyChange?.(vocabulary);
  }, [vocabulary, onVocabularyChange]);

  return (
    <div className={`max-w-5xl mx-auto p-6 bg-white rounded-lg shadow-lg ${className}`}>
      {/* 活動標題輸入 */}
      <div className="mb-6">
        <input
          type="text"
          value={activityTitle}
          onChange={(e) => setActivityTitle(e.target.value)}
          className="w-full text-2xl font-bold border-b-2 border-gray-200 focus:border-blue-500 outline-none py-3 px-2 bg-transparent"
          placeholder="輸入活動標題..."
        />
      </div>

      {/* 操作按鈕區 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={addNewItem}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            title="新增項目"
          >
            ➕ 新增項目
          </button>
          <span className="text-sm text-gray-500">
            最多 {vocabulary.filter(item => item.english.trim() && item.chinese.trim()).length} 個詞彙對
          </span>
        </div>
        
        <button
          onClick={swapColumns}
          className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          title="交換列"
        >
          🔄 交換列
        </button>
      </div>

      {/* 表格標題行 */}
      <div className="grid grid-cols-12 gap-4 mb-4 px-3 py-2 bg-gray-50 rounded-lg font-semibold text-gray-700 text-sm">
        <div className="col-span-1 text-center">#</div>
        <div className="col-span-2 text-center">圖片</div>
        <div className="col-span-4">詞彙字</div>
        <div className="col-span-4">答案</div>
        <div className="col-span-1 text-center">操作</div>
      </div>

      {/* 詞彙輸入表格 */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {vocabulary.map((item, index) => (
          <div 
            key={item.id} 
            className="grid grid-cols-12 gap-4 items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {/* 序號 */}
            <div className="col-span-1 text-center text-gray-500 font-medium">
              {index + 1}.
            </div>

            {/* 圖片上傳區域 */}
            <div className="col-span-2 flex justify-center">
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(item.id, e)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  title="上傳圖片"
                />
                <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-400 transition-colors">
                  {item.image ? (
                    <img 
                      src={item.image} 
                      alt={item.english || '圖片'} 
                      className="w-full h-full object-cover rounded"
                    />
                  ) : (
                    <span className="text-gray-400 text-2xl">📷</span>
                  )}
                </div>
              </div>
            </div>

            {/* 詞彙字輸入 (英文) */}
            <div className="col-span-4">
              <input
                type="text"
                value={item.english}
                onChange={(e) => updateItem(item.id, 'english', e.target.value)}
                placeholder="輸入英文單字..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            {/* 答案輸入 (中文) */}
            <div className="col-span-4">
              <input
                type="text"
                value={item.chinese}
                onChange={(e) => updateItem(item.id, 'chinese', e.target.value)}
                placeholder="輸入中文翻譯..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            {/* 操作按鈕 */}
            <div className="col-span-1 flex justify-center">
              <button
                onClick={() => removeItem(item.id)}
                disabled={vocabulary.length <= 1}
                className={`p-2 rounded-lg transition-colors ${
                  vocabulary.length <= 1 
                    ? 'text-gray-300 cursor-not-allowed' 
                    : 'text-red-500 hover:text-red-700 hover:bg-red-50'
                }`}
                title="刪除項目"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 完成按鈕和統計 */}
      <div className="mt-8 flex items-center justify-between">
        <div className="text-sm text-gray-500">
          已輸入 <span className="font-semibold text-blue-600">
            {vocabulary.filter(item => item.english.trim() && item.chinese.trim()).length}
          </span> 個詞彙對
        </div>
        
        <button
          onClick={handleComplete}
          className="px-8 py-3 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
        >
          完成
        </button>
      </div>
    </div>
  );
}
