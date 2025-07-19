/**
 * 快捷鍵幫助對話框組件
 * 顯示所有可用的鍵盤快捷鍵
 */

import React, { useState, useEffect } from 'react';
import { KeyboardShortcuts, ShortcutCategory } from '../../lib/ux/KeyboardShortcuts';

interface ShortcutsHelpDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const ShortcutsHelpDialog = ({ isOpen, onClose }: ShortcutsHelpDialogProps) => {
  const [categories, setCategories] = useState<ShortcutCategory[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('navigation');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      const shortcutCategories = KeyboardShortcuts.getShortcutsByCategory();
      setCategories(shortcutCategories);
    }
  }, [isOpen]);

  // 過濾快捷鍵
  const filteredCategories = categories.map(category => ({
    ...category,
    shortcuts: category.shortcuts.filter(shortcut =>
      shortcut.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shortcut.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      KeyboardShortcuts.formatKeys(shortcut.keys).toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.shortcuts.length > 0);

  // 處理鍵盤事件
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* 頭部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">⌨️ 鍵盤快捷鍵</h2>
            <p className="text-gray-600 mt-1">使用快捷鍵提升操作效率</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* 側邊欄 */}
          <div className="w-64 border-r border-gray-200 p-4 overflow-y-auto">
            {/* 搜索框 */}
            <div className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="搜索快捷鍵..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* 類別選擇 */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">類別</h3>
              <div className="space-y-1">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                      activeCategory === category.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span className="mr-3">{category.icon}</span>
                    {category.name}
                    <span className="ml-auto text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                      {category.shortcuts.length}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 提示 */}
            <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-medium text-blue-800 mb-1">💡 提示</h4>
              <p className="text-xs text-blue-700">
                按 <kbd className="px-1 py-0.5 bg-blue-200 rounded text-xs">Esc</kbd> 關閉此對話框
              </p>
            </div>
          </div>

          {/* 主要內容 */}
          <div className="flex-1 p-6 overflow-y-auto">
            {searchQuery ? (
              // 搜索結果
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  搜索結果 ({filteredCategories.reduce((sum, cat) => sum + cat.shortcuts.length, 0)})
                </h3>
                {filteredCategories.length > 0 ? (
                  <div className="space-y-6">
                    {filteredCategories.map(category => (
                      <div key={category.id}>
                        <h4 className="flex items-center text-md font-medium text-gray-800 mb-3">
                          <span className="mr-2">{category.icon}</span>
                          {category.name}
                        </h4>
                        <div className="space-y-2">
                          {category.shortcuts.map(shortcut => (
                            <ShortcutItem key={shortcut.id} shortcut={shortcut} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-4xl mb-2">🔍</div>
                    <p className="text-gray-600">沒有找到匹配的快捷鍵</p>
                  </div>
                )}
              </div>
            ) : (
              // 按類別顯示
              <div>
                {categories.map(category => (
                  <div
                    key={category.id}
                    className={activeCategory === category.id ? 'block' : 'hidden'}
                  >
                    <div className="flex items-center mb-6">
                      <span className="text-3xl mr-3">{category.icon}</span>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{category.name}</h3>
                        <p className="text-gray-600 text-sm">{category.shortcuts.length} 個快捷鍵</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {category.shortcuts.map(shortcut => (
                        <ShortcutItem key={shortcut.id} shortcut={shortcut} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 底部 */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            <span className="font-medium">
              {categories.reduce((sum, cat) => sum + cat.shortcuts.length, 0)}
            </span> 個快捷鍵可用
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center">
              <kbd className="px-2 py-1 bg-gray-200 rounded text-xs mr-1">⌘</kbd>
              <span>macOS</span>
            </div>
            <div className="flex items-center">
              <kbd className="px-2 py-1 bg-gray-200 rounded text-xs mr-1">Ctrl</kbd>
              <span>Windows/Linux</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 快捷鍵項目組件
function ShortcutItem({ shortcut }: { shortcut: any }) {
  return (
    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex-1">
        <div className="flex items-center">
          <h4 className="font-medium text-gray-900">{shortcut.name}</h4>
          {shortcut.context && (
            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
              {shortcut.context}
            </span>
          )}
          {!shortcut.enabled && (
            <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded">
              已禁用
            </span>
          )}
        </div>
        <p className="text-sm text-gray-600 mt-1">{shortcut.description}</p>
      </div>
      <div className="ml-4">
        <kbd className="inline-flex items-center px-3 py-1.5 bg-gray-100 border border-gray-300 rounded-lg text-sm font-mono">
          {KeyboardShortcuts.formatKeys(shortcut.keys)}
        </kbd>
      </div>
    </div>
  );
}
export default ShortcutsHelpDialog;
