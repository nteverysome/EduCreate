/**
 * WordWall 風格主題選擇器組件
 * 模仿 WordWall 的視覺主題選擇界面
 */

'use client';

import React, { useState } from 'react';
import { WordWallThemeManager } from '@/lib/wordwall/ThemeManager';
import { VisualTheme } from '@/lib/wordwall/TemplateManager';

interface ThemeSelectorProps {
  selectedTheme: VisualTheme;
  onThemeChange: (theme: VisualTheme) => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  selectedTheme,
  onThemeChange
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  
  const allThemes = WordWallThemeManager.getAllThemes();
  
  const filteredThemes = selectedCategory === 'ALL' 
    ? allThemes 
    : WordWallThemeManager.getThemesByCategory(selectedCategory);

  const categories = [
    { value: 'ALL', label: '全部主題' },
    { value: 'CLASSIC', label: '經典' },
    { value: 'THEMED', label: '主題' },
    { value: 'SEASONAL', label: '季節' },
    { value: 'EDUCATIONAL', label: '教育' },
    { value: 'MODERN', label: '現代' }
  ];

  const handleThemeSelect = (theme: VisualTheme) => {
    onThemeChange(theme);
    // 立即應用主題
    WordWallThemeManager.applyTheme(theme);
  };

  return (
    <div className="theme-selector bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6">視覺樣式</h3>
      
      {/* 分類過濾器 */}
      <div className="mb-6">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {categories.map(category => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
      </div>

      {/* 主題網格 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredThemes.map((theme) => (
          <div
            key={theme.id}
            onClick={() => handleThemeSelect(theme)}
            className={`
              theme-option cursor-pointer border-2 rounded-lg p-3 transition-all duration-200 hover:shadow-md
              ${selectedTheme.id === theme.id 
                ? 'border-blue-500 ring-2 ring-blue-200' 
                : 'border-gray-200 hover:border-gray-300'
              }
            `}
          >
            {/* 主題預覽 */}
            <div 
              className="theme-preview h-16 rounded-md mb-2 relative overflow-hidden"
              style={{
                backgroundColor: theme.backgroundColor,
                backgroundImage: theme.backgroundImage || 'none',
                border: `1px solid ${theme.borderColor || theme.primaryColor}`
              }}
            >
              {/* 預覽內容 */}
              <div className="absolute inset-0 p-2 flex flex-col justify-between">
                <div 
                  className="w-full h-2 rounded"
                  style={{ backgroundColor: theme.primaryColor }}
                />
                <div className="flex justify-between items-end">
                  <div 
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: theme.secondaryColor }}
                  />
                  <div 
                    className="w-6 h-3 rounded"
                    style={{ backgroundColor: theme.accentColor || theme.primaryColor }}
                  />
                </div>
              </div>
            </div>

            {/* 主題名稱 */}
            <div className="text-center">
              <h4 className="text-sm font-medium text-gray-900 truncate">
                {theme.displayName}
              </h4>
              <p className="text-xs text-gray-500 capitalize">
                {theme.category.toLowerCase()}
              </p>
            </div>

            {/* 選中指示器 */}
            {selectedTheme.id === theme.id && (
              <div className="absolute top-1 right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 主題詳情 */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">
          當前主題：{selectedTheme.displayName}
        </h4>
        {selectedTheme.description && (
          <p className="text-sm text-gray-600 mb-3">
            {selectedTheme.description}
          </p>
        )}
        
        {/* 顏色預覽 */}
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            <div 
              className="w-4 h-4 rounded border"
              style={{ backgroundColor: selectedTheme.primaryColor }}
            />
            <span className="text-xs text-gray-600">主色</span>
          </div>
          <div className="flex items-center space-x-2">
            <div 
              className="w-4 h-4 rounded border"
              style={{ backgroundColor: selectedTheme.secondaryColor }}
            />
            <span className="text-xs text-gray-600">次色</span>
          </div>
          <div className="flex items-center space-x-2">
            <div 
              className="w-4 h-4 rounded border"
              style={{ backgroundColor: selectedTheme.backgroundColor }}
            />
            <span className="text-xs text-gray-600">背景</span>
          </div>
          {selectedTheme.accentColor && (
            <div className="flex items-center space-x-2">
              <div 
                className="w-4 h-4 rounded border"
                style={{ backgroundColor: selectedTheme.accentColor }}
              />
              <span className="text-xs text-gray-600">強調</span>
            </div>
          )}
        </div>
      </div>

      {/* 重置按鈕 */}
      <div className="mt-4 text-center">
        <button
          onClick={() => handleThemeSelect(WordWallThemeManager.getDefaultTheme())}
          className="text-sm text-blue-600 hover:text-blue-800 underline"
        >
          重置為默認主題
        </button>
      </div>
    </div>
  );
};
