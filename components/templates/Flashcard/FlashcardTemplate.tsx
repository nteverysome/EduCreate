import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { v4 as uuidv4 } from 'uuid';
interface FlashcardItem {
  id: string;
  front: string;
  back: string;
  tags?: string[];
}
interface FlashcardTemplateProps {
  initialData?: {
    cards: FlashcardItem[];
    title?: string;
    description?: string;
    instructions?: string;
  };
  onSave?: (data: any) => void;
  previewMode?: boolean;
}
export default function FlashcardTemplate({
  initialData,
  onSave,
  previewMode = false
}: FlashcardTemplateProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialData?.title || '單字卡片');
  const [description, setDescription] = useState(initialData?.description || '創建互動式單字卡片，幫助學生記憶詞彙');
  const [instructions, setInstructions] = useState(initialData?.instructions || '點擊卡片查看背面內容，使用箭頭按鈕瀏覽所有卡片');
  const [cards, setCards] = useState<FlashcardItem[]>(initialData?.cards || []);
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');
  const [newTags, setNewTags] = useState('');
  // 處理保存
  const handleSave = () => {
    if (onSave) {
      onSave({
        title,
        description,
        instructions,
        cards,
        type: 'flashcards'
      });
    }
  };
  // 處理取消
  const handleCancel = () => {
    router.back();
  };
  // 添加卡片
  const handleAddCard = () => {
    if (newFront.trim() && newBack.trim()) {
      const cardId = uuidv4();
      const tagsArray = newTags.trim() ? newTags.split(',').map(tag => tag.trim()) : [];
      setCards([...cards, { 
        id: cardId, 
        front: newFront.trim(), 
        back: newBack.trim(),
        tags: tagsArray
      }]);
      setNewFront('');
      setNewBack('');
      setNewTags('');
    }
  };
  // 刪除卡片
  const handleDeleteCard = (id: string) => {
    setCards(cards.filter(card => card.id !== id));
  };
  // 更新卡片正面
  const handleUpdateFront = (id: string, value: string) => {
    setCards(cards.map(card => 
      card.id === id ? { ...card, front: value } : card
    ));
  };
  // 更新卡片背面
  const handleUpdateBack = (id: string, value: string) => {
    setCards(cards.map(card => 
      card.id === id ? { ...card, back: value } : card
    ));
  };
  // 更新卡片標籤
  const handleUpdateTags = (id: string, value: string) => {
    const tagsArray = value.trim() ? value.split(',').map(tag => tag.trim()) : [];
    setCards(cards.map(card => 
      card.id === id ? { ...card, tags: tagsArray } : card
    ));
  };
  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl mx-auto">
      {!previewMode && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">配置單字卡片模板</h2>
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
      {!previewMode && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">卡片</h3>
          {cards.map((card) => (
            <div key={card.id} className="border border-gray-200 rounded-md p-4 mb-4">
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    正面
                  </label>
                  <input
                    type="text"
                    value={card.front}
                    onChange={(e) => handleUpdateFront(card.id, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="卡片正面內容"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    背面
                  </label>
                  <input
                    type="text"
                    value={card.back}
                    onChange={(e) => handleUpdateBack(card.id, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="卡片背面內容"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    標籤 (用逗號分隔)
                  </label>
                  <input
                    type="text"
                    value={card.tags?.join(', ') || ''}
                    onChange={(e) => handleUpdateTags(card.id, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="標籤1, 標籤2, 標籤3"
                  />
                </div>
                <button
                  onClick={() => handleDeleteCard(card.id)}
                  className="ml-4 mt-6 text-red-500 hover:text-red-700"
                  aria-label="刪除卡片"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
          <div className="border border-dashed border-gray-300 rounded-md p-4">
            <h4 className="text-md font-medium text-gray-900 mb-3">添加新卡片</h4>
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  正面
                </label>
                <input
                  type="text"
                  value={newFront}
                  onChange={(e) => setNewFront(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="卡片正面內容"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  背面
                </label>
                <input
                  type="text"
                  value={newBack}
                  onChange={(e) => setNewBack(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="卡片背面內容"
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  標籤 (用逗號分隔)
                </label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="標籤1, 標籤2, 標籤3"
                />
              </div>
              <button
                onClick={handleAddCard}
                className="ml-4 mt-6 text-blue-500 hover:text-blue-700"
                aria-label="添加卡片"
                disabled={!newFront.trim() || !newBack.trim()}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
      {previewMode && cards.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((card) => (
            <div key={card.id} className="border border-gray-200 rounded-md p-4 h-40 flex flex-col">
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="font-medium">{card.front}</div>
                  <div className="text-gray-500 mt-2">{card.back}</div>
                </div>
              </div>
              {card.tags && card.tags.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <div className="flex flex-wrap gap-1">
                    {card.tags.map((tag, index) => (
                      <span key={index} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
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
            disabled={cards.length === 0}
          >
            保存模板
          </button>
        </div>
      )}
    </div>
  );
}
