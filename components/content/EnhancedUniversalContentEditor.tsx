/**
 * 增強的統一內容編輯器 - 第一階段實現
 * 包含自動保存、內容驗證、活動管理等核心功能
 */

import React, { useState, useEffect, useCallback } from 'react';
import { UniversalContent, UniversalContentItem, GameType } from '../../lib/content/UniversalContentManager';
import { GameAdapters } from '../../lib/content/GameAdapters';
import { TemplateManager } from '../../lib/content/TemplateManager';
import { useAutoSave, generateActivityId } from '../../lib/content/AutoSaveManager';
import { ContentValidator, ValidationResult } from '../../lib/content/ContentValidator';
import RichTextEditor from './RichTextEditor';

interface EnhancedUniversalContentEditorProps {
  initialContent?: UniversalContent;
  activityId?: string;
  onContentChange?: (content: UniversalContent) => void;
  onGameSelect?: (gameType: GameType, adaptedContent: any) => void;
  onSave?: (content: UniversalContent) => void;
}

export default function EnhancedUniversalContentEditor({
  initialContent,
  activityId: providedActivityId,
  onContentChange,
  onGameSelect,
  onSave
}: EnhancedUniversalContentEditorProps) {
  // 生成或使用提供的活動 ID
  const [activityId] = useState(() => providedActivityId || generateActivityId());
  
  // 內容狀態
  const [content, setContent] = useState<UniversalContent>(() => 
    initialContent || {
      id: activityId,
      title: '',
      description: '',
      items: [],
      tags: [],
      language: 'zh-TW',
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: 'current-user'
    }
  );

  // 編輯狀態
  const [newItem, setNewItem] = useState({ term: '', definition: '' });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [importText, setImportText] = useState('');
  const [showImport, setShowImport] = useState(false);

  // 驗證狀態
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [showValidation, setShowValidation] = useState(false);

  // 自動保存
  const { triggerAutoSave, forceSave, autoSaveState } = useAutoSave(activityId, {
    saveDelay: 2000,
    enableOfflineMode: true
  });

  // 內容變更處理
  const handleContentChange = useCallback((newContent: UniversalContent) => {
    setContent(newContent);
    onContentChange?.(newContent);
    
    // 觸發自動保存
    triggerAutoSave(newContent);
    
    // 實時驗證
    const validation = ContentValidator.validateContent(newContent);
    setValidationResult(validation);
  }, [onContentChange, triggerAutoSave]);

  // 標題變更
  const handleTitleChange = (title: string) => {
    const newContent = { ...content, title, updatedAt: new Date() };
    handleContentChange(newContent);
  };

  // 描述變更
  const handleDescriptionChange = (description: string) => {
    const newContent = { ...content, description, updatedAt: new Date() };
    handleContentChange(newContent);
  };

  // 添加新項目
  const handleAddItem = () => {
    if (!newItem.term.trim() || !newItem.definition.trim()) {
      alert('請填寫完整的問題和答案');
      return;
    }

    const item: UniversalContentItem = {
      id: `item_${Date.now()}`,
      term: newItem.term.trim(),
      definition: newItem.definition.trim()
    };

    const newContent = {
      ...content,
      items: [...content.items, item],
      updatedAt: new Date()
    };

    handleContentChange(newContent);
    setNewItem({ term: '', definition: '' });
  };

  // 編輯項目
  const handleEditItem = (index: number) => {
    setEditingIndex(index);
    const item = content.items[index];
    setNewItem({ term: item.term, definition: item.definition });
  };

  // 保存編輯
  const handleSaveEdit = () => {
    if (editingIndex === null) return;

    const newItems = [...content.items];
    newItems[editingIndex] = {
      ...newItems[editingIndex],
      term: newItem.term.trim(),
      definition: newItem.definition.trim()
    };

    const newContent = {
      ...content,
      items: newItems,
      updatedAt: new Date()
    };

    handleContentChange(newContent);
    setEditingIndex(null);
    setNewItem({ term: '', definition: '' });
  };

  // 取消編輯
  const handleCancelEdit = () => {
    setEditingIndex(null);
    setNewItem({ term: '', definition: '' });
  };

  // 刪除項目
  const handleDeleteItem = (index: number) => {
    const newItems = content.items.filter((_, i) => i !== index);
    const newContent = {
      ...content,
      items: newItems,
      updatedAt: new Date()
    };
    handleContentChange(newContent);
  };

  // 批量導入
  const handleImport = () => {
    if (!importText.trim()) return;

    const lines = importText.split('\n').filter(line => line.trim());
    const newItems: UniversalContentItem[] = [];

    lines.forEach((line, index) => {
      const parts = line.split('\t');
      if (parts.length >= 2) {
        newItems.push({
          id: `imported_${Date.now()}_${index}`,
          term: parts[0].trim(),
          definition: parts[1].trim()
        });
      }
    });

    if (newItems.length > 0) {
      const newContent = {
        ...content,
        items: [...content.items, ...newItems],
        updatedAt: new Date()
      };
      handleContentChange(newContent);
      setImportText('');
      setShowImport(false);
    }
  };

  // 遊戲選擇
  const handleGameSelect = (gameType: GameType) => {
    // 驗證遊戲兼容性
    const gameValidation = ContentValidator.validateGameCompatibility(content, gameType);
    if (gameValidation.some(error => error.severity === 'error')) {
      alert(`無法啟動 ${gameType} 遊戲：\n${gameValidation.map(e => e.message).join('\n')}`);
      return;
    }

    const adaptedContent = GameAdapters.adaptContent(content, gameType);
    onGameSelect?.(gameType, adaptedContent);
  };

  // 強制保存
  const handleSave = async () => {
    if (!validationResult?.canPublish) {
      setShowValidation(true);
      return;
    }

    try {
      await forceSave(content);
      onSave?.(content);
      alert('保存成功！');
    } catch (error) {
      alert('保存失敗，請重試');
    }
  };

  // 獲取推薦遊戲
  const recommendations = TemplateManager.getRecommendedTemplates(content.items.length);

  return (
    <div className="enhanced-content-editor max-w-6xl mx-auto p-6">
      {/* 自動保存指示器 */}
      <div id="autosave-indicator" className="mb-4" style={{ display: 'none' }}></div>
      <div id="autosave-error" className="mb-4 p-2 bg-yellow-100 border border-yellow-400 rounded" style={{ display: 'none' }}></div>

      {/* 頭部信息 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <input
              type="text"
              value={content.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="輸入活動標題..."
              className="text-2xl font-bold text-gray-900 bg-transparent border-none outline-none w-full"
            />
            <textarea
              value={content.description}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              placeholder="添加活動描述（可選）..."
              className="mt-2 text-gray-600 bg-transparent border-none outline-none w-full resize-none"
              rows={2}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            {autoSaveState && (
              <div className="text-sm text-gray-500">
                {autoSaveState.hasUnsavedChanges ? '正在保存...' : '已保存'}
              </div>
            )}
            <button
              onClick={handleSave}
              className={`px-4 py-2 rounded-lg font-medium ${
                validationResult?.canPublish 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              disabled={!validationResult?.canPublish}
            >
              完成
            </button>
          </div>
        </div>

        {/* 驗證狀態 */}
        {validationResult && (validationResult.errors.length > 0 || showValidation) && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="font-medium text-red-800 mb-2">請修復以下問題：</h4>
            <ul className="text-sm text-red-700 space-y-1">
              {validationResult.errors.map((error, index) => (
                <li key={index}>• {error.message}</li>
              ))}
            </ul>
            {validationResult.errors.length === 0 && (
              <p className="text-sm text-red-700">內容驗證通過，可以發布。</p>
            )}
          </div>
        )}
      </div>

      {/* 內容編輯區域 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左側：內容管理 */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                內容項目 ({content.items.length})
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowImport(!showImport)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  📥 批量導入
                </button>
              </div>
            </div>

            {/* 批量導入 */}
            {showImport && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">批量導入內容</h4>
                <p className="text-sm text-gray-600 mb-2">
                  每行一個項目，使用 Tab 鍵分隔問題和答案
                </p>
                <textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder="蘋果	一種紅色或綠色的圓形水果&#10;香蕉	一種黃色的彎曲水果"
                  className="w-full h-24 p-2 border border-gray-300 rounded text-sm"
                />
                <div className="flex items-center space-x-2 mt-2">
                  <button
                    onClick={handleImport}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                  >
                    導入
                  </button>
                  <button
                    onClick={() => setShowImport(false)}
                    className="text-gray-600 px-3 py-1 rounded text-sm hover:text-gray-800"
                  >
                    取消
                  </button>
                </div>
              </div>
            )}

            {/* 添加新項目 - 增強版富文本編輯 */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-4 text-gray-900">
                {editingIndex !== null ? '編輯項目' : '添加新項目'}
              </h4>

              <div className="space-y-4">
                {/* 詞彙/問題 - 富文本編輯器 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    詞彙/問題
                  </label>
                  <RichTextEditor
                    value={newItem.term}
                    onChange={(value) => setNewItem({ ...newItem, term: value })}
                    placeholder="輸入詞彙或問題，支持格式化文本..."
                    data-testid="term-rich-editor"
                  />
                </div>

                {/* 定義/答案 - 富文本編輯器 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    定義/答案
                  </label>
                  <RichTextEditor
                    value={newItem.definition}
                    onChange={(value) => setNewItem({ ...newItem, definition: value })}
                    placeholder="輸入定義或答案，支持格式化文本、表格、列表..."
                    data-testid="definition-rich-editor"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {editingIndex !== null ? (
                  <>
                    <button
                      onClick={handleSaveEdit}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                      保存修改
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                    >
                      取消
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleAddItem}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    + 添加項目
                  </button>
                )}
              </div>
            </div>

            {/* 內容項目列表 - 增強版富文本顯示 */}
            <div className="space-y-4">
              {content.items.map((item, index) => (
                <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      {/* 詞彙/問題顯示 */}
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                          詞彙/問題
                        </div>
                        <div
                          className="rich-content font-medium text-gray-900 prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: item.term }}
                          data-testid={`item-term-${index}`}
                        />
                      </div>

                      {/* 定義/答案顯示 */}
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                          定義/答案
                        </div>
                        <div
                          className="rich-content text-gray-700 prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: item.definition }}
                          data-testid={`item-definition-${index}`}
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleEditItem(index)}
                        className="text-blue-600 hover:text-blue-800 text-sm px-2 py-1 rounded hover:bg-blue-50"
                        data-testid={`edit-item-${index}`}
                      >
                        編輯
                      </button>
                      <button
                        onClick={() => handleDeleteItem(index)}
                        className="text-red-600 hover:text-red-800 text-sm px-2 py-1 rounded hover:bg-red-50"
                        data-testid={`delete-item-${index}`}
                      >
                        刪除
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {content.items.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📝</div>
                <p>還沒有添加任何內容項目</p>
                <p className="text-sm">開始添加問題和答案來創建您的活動</p>
              </div>
            )}
          </div>
        </div>

        {/* 右側：推薦遊戲 */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">推薦遊戲</h3>
            
            {recommendations.length > 0 ? (
              <div className="space-y-3">
                {recommendations.slice(0, 6).map((game) => (
                  <div key={game.type} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <span className="text-lg mr-2">{game.icon}</span>
                        <span className="font-medium">{game.name}</span>
                      </div>
                      <span className="text-xs text-gray-500">{game.estimatedTime}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{game.features.join('、')}</p>
                    <button
                      onClick={() => handleGameSelect(game.type)}
                      className="w-full bg-blue-600 text-white py-1 px-3 rounded text-sm hover:bg-blue-700"
                    >
                      開始遊戲
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">🎮</div>
                <p>添加內容後查看推薦遊戲</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
