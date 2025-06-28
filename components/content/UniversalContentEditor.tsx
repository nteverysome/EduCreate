/**
 * 統一內容編輯器 - 模仿 wordwall.net 的內容管理界面
 * 允許用戶輸入內容並一鍵切換到不同遊戲類型
 */

import React, { useState, useEffect } from 'react';
// 使用簡單的文字圖標替代 lucide-react
const Plus = () => <span>+</span>;
const Trash2 = () => <span>🗑️</span>;
const Upload = () => <span>📤</span>;
const Download = () => <span>📥</span>;
const Shuffle = () => <span>🔀</span>;
const Play = () => <span>▶️</span>;
const Lightbulb = () => <span>💡</span>;
import { UniversalContentManager, UniversalContent, UniversalContentItem, GameType } from '../../lib/content/UniversalContentManager';
import { GameAdapters } from '../../lib/content/GameAdapters';

interface UniversalContentEditorProps {
  initialContent?: UniversalContent;
  onContentChange?: (content: UniversalContent) => void;
  onGameSelect?: (gameType: GameType, adaptedContent: any) => void;
}

export default function UniversalContentEditor({
  initialContent,
  onContentChange,
  onGameSelect
}: UniversalContentEditorProps) {
  const [contentManager] = useState(() => new UniversalContentManager());
  const [content, setContent] = useState<UniversalContent>(() => 
    initialContent || {
      id: `content_${Date.now()}`,
      title: '新的學習內容',
      description: '',
      items: [],
      tags: [],
      language: 'zh-TW',
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: 'current-user'
    }
  );
  const [newItem, setNewItem] = useState({ term: '', definition: '', category: '' });
  const [importText, setImportText] = useState('');
  const [showImport, setShowImport] = useState(false);
  const [selectedGame, setSelectedGame] = useState<GameType | null>(null);

  useEffect(() => {
    contentManager.setContent(content);
    onContentChange?.(content);
  }, [content, contentManager, onContentChange]);

  const addItem = () => {
    if (newItem.term.trim() && newItem.definition.trim()) {
      const item: UniversalContentItem = {
        id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        term: newItem.term.trim(),
        definition: newItem.definition.trim(),
        category: newItem.category.trim() || undefined
      };
      
      setContent(prev => ({
        ...prev,
        items: [...prev.items, item],
        updatedAt: new Date()
      }));
      
      setNewItem({ term: '', definition: '', category: '' });
    }
  };

  const removeItem = (id: string) => {
    setContent(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id),
      updatedAt: new Date()
    }));
  };

  const updateItem = (id: string, field: keyof UniversalContentItem, value: string) => {
    setContent(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      ),
      updatedAt: new Date()
    }));
  };

  const handleImport = () => {
    if (importText.trim()) {
      const lines = importText.split('\n').filter(line => line.trim());
      const newItems: UniversalContentItem[] = [];
      
      lines.forEach(line => {
        const parts = line.split('\t').map(part => part.trim());
        if (parts.length >= 2) {
          newItems.push({
            id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            term: parts[0],
            definition: parts[1],
            category: parts[2] || undefined
          });
        }
      });
      
      if (newItems.length > 0) {
        setContent(prev => ({
          ...prev,
          items: [...prev.items, ...newItems],
          updatedAt: new Date()
        }));
        setImportText('');
        setShowImport(false);
      }
    }
  };

  const handleExport = () => {
    const exportData = contentManager.exportContent('txt');
    const blob = new Blob([exportData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${content.title}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const shuffleItems = () => {
    setContent(prev => ({
      ...prev,
      items: [...prev.items].sort(() => Math.random() - 0.5),
      updatedAt: new Date()
    }));
  };

  const playGame = (gameType: GameType) => {
    try {
      const adaptedContent = GameAdapters.adaptContent(content, gameType);
      onGameSelect?.(gameType, adaptedContent);
      setSelectedGame(gameType);
    } catch (error) {
      console.error('遊戲適配失敗:', error);
    }
  };

  const availableGames = contentManager.getAvailableGames();
  const recommendedGames = contentManager.getRecommendedGames();

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* 標題和基本信息 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-800">內容管理器</h1>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowImport(!showImport)}
              className="flex items-center px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              <Upload className="w-4 h-4 mr-2" />
              批量導入
            </button>
            <button
              onClick={handleExport}
              className="flex items-center px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              導出
            </button>
            <button
              onClick={shuffleItems}
              className="flex items-center px-3 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors"
            >
              <Shuffle className="w-4 h-4 mr-2" />
              隨機排序
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              活動標題
            </label>
            <input
              type="text"
              value={content.title}
              onChange={(e) => setContent(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="輸入活動標題..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              描述
            </label>
            <input
              type="text"
              value={content.description || ''}
              onChange={(e) => setContent(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="輸入活動描述..."
            />
          </div>
        </div>
      </div>

      {/* 批量導入區域 */}
      {showImport && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">批量導入內容</h3>
          <p className="text-sm text-gray-600 mb-4">
            每行一個項目，格式：詞彙[Tab]定義[Tab]分類（可選）
          </p>
          <textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="蘋果	一種紅色的水果	水果&#10;香蕉	一種黃色的水果	水果"
          />
          <div className="flex justify-end space-x-2 mt-4">
            <button
              onClick={() => setShowImport(false)}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              取消
            </button>
            <button
              onClick={handleImport}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              導入
            </button>
          </div>
        </div>
      )}

      {/* 內容編輯區域 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">
          內容項目 ({content.items.length})
        </h3>

        {/* 添加新項目 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <input
            type="text"
            value={newItem.term}
            onChange={(e) => setNewItem(prev => ({ ...prev, term: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="詞彙/問題"
          />
          <input
            type="text"
            value={newItem.definition}
            onChange={(e) => setNewItem(prev => ({ ...prev, definition: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="定義/答案"
          />
          <input
            type="text"
            value={newItem.category}
            onChange={(e) => setNewItem(prev => ({ ...prev, category: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="分類（可選）"
          />
          <button
            onClick={addItem}
            className="flex items-center justify-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            添加
          </button>
        </div>

        {/* 內容列表 */}
        <div className="space-y-2">
          {content.items.map((item, index) => (
            <div key={item.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-500 w-8">{index + 1}.</span>
              <input
                type="text"
                value={item.term}
                onChange={(e) => updateItem(item.id, 'term', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                value={item.definition}
                onChange={(e) => updateItem(item.id, 'definition', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                value={item.category || ''}
                onChange={(e) => updateItem(item.id, 'category', e.target.value)}
                className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="分類"
              />
              <button
                onClick={() => removeItem(item.id)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {content.items.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            還沒有內容項目，請添加一些詞彙和定義開始創建活動。
          </div>
        )}
      </div>

      {/* 遊戲選擇區域 */}
      {content.items.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <Lightbulb className="w-5 h-5 text-yellow-500 mr-2" />
            <h3 className="text-lg font-semibold">推薦遊戲</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {recommendedGames.map(game => (
              <div
                key={game.type}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => playGame(game.type)}
              >
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-3">{game.icon}</span>
                  <div>
                    <h4 className="font-semibold">{game.name}</h4>
                    <p className="text-sm text-gray-600">{game.estimatedTime}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 mb-3">{game.description}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {game.features.slice(0, 3).map(feature => (
                    <span
                      key={feature}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    playGame(game.type);
                  }}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                  <Play className="w-4 h-4 mr-2" />
                  開始遊戲
                </button>
              </div>
            ))}
          </div>

          <details className="mt-4">
            <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
              查看所有可用遊戲 ({availableGames.length})
            </summary>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
              {availableGames.map(game => (
                <button
                  key={game.type}
                  onClick={() => playGame(game.type)}
                  className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <span className="text-xl mr-3">{game.icon}</span>
                  <div>
                    <div className="font-medium text-sm">{game.name}</div>
                    <div className="text-xs text-gray-500">{game.difficulty}</div>
                  </div>
                </button>
              ))}
            </div>
          </details>
        </div>
      )}
    </div>
  );
}
