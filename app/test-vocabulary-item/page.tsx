'use client';

import React, { useState } from 'react';
import VocabularyItemWithImage, { VocabularyItemData } from '@/components/vocabulary-item-with-image';

/**
 * 測試頁面 - VocabularyItemWithImage 組件
 * 
 * 測試內容：
 * 1. 圖標按鈕顯示
 * 2. 圖片選擇流程
 * 3. 圖片編輯流程
 * 4. 文字疊加生成
 * 5. 圖片預覽
 */
export default function TestVocabularyItemPage() {
  const [vocabularyItems, setVocabularyItems] = useState<VocabularyItemData[]>([
    { id: '1', english: '', chinese: '' },
    { id: '2', english: '', chinese: '' },
    { id: '3', english: '', chinese: '' },
  ]);

  const updateItem = (id: string, updatedItem: VocabularyItemData) => {
    setVocabularyItems(items =>
      items.map(item => (item.id === id ? updatedItem : item))
    );
  };

  const removeItem = (id: string) => {
    setVocabularyItems(items => items.filter(item => item.id !== id));
  };

  const addItem = () => {
    const newId = String(vocabularyItems.length + 1);
    setVocabularyItems([
      ...vocabularyItems,
      { id: newId, english: '', chinese: '' },
    ]);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* 標題 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            VocabularyItemWithImage 組件測試
          </h1>
          <p className="text-gray-600">
            測試 Wordwall 風格的詞彙項目組件
          </p>
        </div>

        {/* 測試說明 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">測試步驟</h2>
          <ol className="list-decimal list-inside space-y-1 text-blue-800">
            <li>點擊 🖼️ 圖標按鈕打開圖片選擇器</li>
            <li>選擇一張圖片（Unsplash 搜索或上傳）</li>
            <li>輸入英文和中文文字</li>
            <li>觀察圖片自動生成（文字疊加）</li>
            <li>點擊圖片預覽上的「編輯」按鈕測試編輯功能</li>
            <li>點擊「刪除」按鈕測試刪除功能</li>
          </ol>
        </div>

        {/* 詞彙項目列表 */}
        <div className="space-y-4 mb-6">
          {vocabularyItems.map((item, index) => (
            <VocabularyItemWithImage
              key={item.id}
              item={item}
              index={index}
              onChange={(updatedItem) => updateItem(item.id, updatedItem)}
              onRemove={() => removeItem(item.id)}
              minItems={1}
              totalItems={vocabularyItems.length}
            />
          ))}
        </div>

        {/* 添加按鈕 */}
        <button
          onClick={addItem}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
        >
          + 添加詞彙項目
        </button>

        {/* 數據預覽 */}
        <div className="mt-8 bg-white border border-gray-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">數據預覽</h2>
          <pre className="bg-gray-50 p-4 rounded text-sm overflow-auto max-h-96">
            {JSON.stringify(vocabularyItems, null, 2)}
          </pre>
        </div>

        {/* 測試結果 */}
        <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-green-900 mb-2">驗收標準</h2>
          <div className="space-y-2 text-green-800">
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="test1" className="rounded" />
              <label htmlFor="test1">✅ 圖標按鈕正確顯示</label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="test2" className="rounded" />
              <label htmlFor="test2">✅ 點擊圖標打開 ImagePicker</label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="test3" className="rounded" />
              <label htmlFor="test3">✅ 圖片選擇後正確顯示預覽</label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="test4" className="rounded" />
              <label htmlFor="test4">✅ 輸入文字後自動生成圖片</label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="test5" className="rounded" />
              <label htmlFor="test5">✅ 點擊編輯打開 ImageEditor</label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="test6" className="rounded" />
              <label htmlFor="test6">✅ 點擊刪除正確移除圖片</label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="test7" className="rounded" />
              <label htmlFor="test7">✅ Loading 狀態正確顯示</label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="test8" className="rounded" />
              <label htmlFor="test8">✅ 響應式設計正常</label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

