import React, { useState } from 'react';
import { useRouter } from 'next/router';
import WordWallBuilder from './WordWallBuilder';
interface WordWallTemplateProps {
  initialData?: {
    words: Array<{ id: string; word: string; definition: string }>;
    title?: string;
    description?: string;
    instructions?: string;
  };
  onSave?: (data: any) => void;
  previewMode?: boolean;
}
export default function WordWallTemplate({
  initialData,
  onSave,
  previewMode = false
}: WordWallTemplateProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialData?.title || '單詞牆');
  const [description, setDescription] = useState(initialData?.description || '創建一個互動式單詞牆，幫助學生學習詞彙');
  const [instructions, setInstructions] = useState(initialData?.instructions || '點擊單詞查看定義，拖動單詞可以重新排序');
  const [words, setWords] = useState(initialData?.words || []);
  // 處理保存
  const handleSave = () => {
    if (onSave) {
      onSave({
        title,
        description,
        instructions,
        words,
        type: 'wordwall'
      });
    }
  };
  // 處理取消
  const handleCancel = () => {
    router.back();
  };
  // 處理單詞更新
  const handleWordsUpdate = (updatedWords: Array<{ id: string; word: string; definition: string }>) => {
    setWords(updatedWords);
  };
  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl mx-auto">
      {!previewMode && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">配置單詞牆模板</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                標題
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                描述
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 mb-1">
                使用說明
              </label>
              <textarea
                id="instructions"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      )}
      {previewMode && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
          {description && <p className="text-gray-600 mb-4">{description}</p>}
          {instructions && (
            <div className="bg-blue-50 p-4 rounded-md mb-6">
              <p className="text-blue-700">{instructions}</p>
            </div>
          )}
        </div>
      )}
      <WordWallBuilder 
        initialWords={words} 
        onWordsChange={handleWordsUpdate} 
        readOnly={previewMode} 
      />
      {!previewMode && (
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={handleCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 rounded-md text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            保存模板
          </button>
        </div>
      )}
    </div>
  );
}
