/**
 * 視覺樣式選擇器組件
 * 提供豐富的樣式選擇界面，支持預覽、分類、搜索等功能
 */

import React, { useState, useEffect } from 'react';
import { VisualStyleManager, VisualStyle } from '../../lib/content/VisualStyleManager';

interface VisualStyleSelectorProps {
  currentStyleId?: string;
  onStyleChange: (styleId: string) => void;
  onClose?: () => void;
  showCategories?: boolean;
  showSearch?: boolean;
  showPreview?: boolean;
}

export default function VisualStyleSelector({
  currentStyleId = 'classic',
  onStyleChange,
  onClose,
  showCategories = true,
  showSearch = true,
  showPreview = true
}: VisualStyleSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredStyles, setFilteredStyles] = useState<VisualStyle[]>([]);
  const [previewStyle, setPreviewStyle] = useState<VisualStyle | null>(null);

  const categories = [
    { id: 'all', name: '全部', icon: '🎨' },
    { id: 'classic', name: '經典', icon: '📘' },
    { id: 'modern', name: '現代', icon: '🚀' },
    { id: 'playful', name: '趣味', icon: '🎈' },
    { id: 'professional', name: '專業', icon: '💼' },
    { id: 'themed', name: '主題', icon: '🌟' },
    { id: 'seasonal', name: '季節', icon: '🍂' }
  ];

  // 初始化樣式
  useEffect(() => {
    VisualStyleManager.initialize();
    updateFilteredStyles();
  }, [selectedCategory, searchQuery]);

  // 更新過濾後的樣式
  const updateFilteredStyles = () => {
    let styles = VisualStyleManager.getAllStyles();

    // 按類別過濾
    if (selectedCategory !== 'all') {
      styles = VisualStyleManager.getStylesByCategory(selectedCategory as any);
    }

    // 按搜索查詢過濾
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      styles = styles.filter(style => 
        style.name.toLowerCase().includes(query) ||
        style.description.toLowerCase().includes(query) ||
        style.tags.some(tag => tag.includes(query))
      );
    }

    setFilteredStyles(styles);
  };

  // 處理樣式選擇
  const handleStyleSelect = (styleId: string) => {
    onStyleChange(styleId);
    if (onClose) {
      onClose();
    }
  };

  // 處理樣式預覽
  const handleStylePreview = (style: VisualStyle) => {
    setPreviewStyle(style);
  };

  // 獲取樣式預覽卡片的樣式
  const getStyleCardStyle = (style: VisualStyle) => {
    return {
      backgroundColor: style.colors.background,
      borderColor: style.colors.border,
      color: style.colors.text,
      fontFamily: style.typography.fontFamily
    };
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* 頭部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">選擇視覺樣式</h2>
            <p className="text-gray-600 mt-1">為您的活動選擇完美的視覺風格</p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* 側邊欄 */}
          <div className="w-64 border-r border-gray-200 p-4 overflow-y-auto">
            {/* 搜索框 */}
            {showSearch && (
              <div className="mb-6">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="搜索樣式..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            )}

            {/* 類別選擇 */}
            {showCategories && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">類別</h3>
                <div className="space-y-1">
                  {categories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <span className="mr-3">{category.icon}</span>
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 快速過濾 */}
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">快速過濾</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setFilteredStyles(VisualStyleManager.getPopularStyles())}
                  className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  🔥 熱門樣式
                </button>
                <button
                  onClick={() => setFilteredStyles(VisualStyleManager.getFreeStyles())}
                  className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  🆓 免費樣式
                </button>
              </div>
            </div>
          </div>

          {/* 主要內容區域 */}
          <div className="flex-1 flex">
            {/* 樣式網格 */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredStyles.map(style => (
                  <div
                    key={style.id}
                    className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-lg ${
                      currentStyleId === style.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    style={getStyleCardStyle(style)}
                    onClick={() => handleStyleSelect(style.id)}
                    onMouseEnter={() => handleStylePreview(style)}
                  >
                    {/* 樣式預覽 */}
                    <div className="h-24 rounded-md mb-3 relative overflow-hidden"
                         style={{ backgroundColor: style.colors.surface }}>
                      <div className="absolute inset-2 rounded"
                           style={{ backgroundColor: style.colors.primary, opacity: 0.1 }}></div>
                      <div className="absolute top-2 left-2 w-8 h-2 rounded"
                           style={{ backgroundColor: style.colors.primary }}></div>
                      <div className="absolute top-6 left-2 w-12 h-2 rounded"
                           style={{ backgroundColor: style.colors.secondary }}></div>
                      <div className="absolute bottom-2 right-2 w-6 h-6 rounded-full"
                           style={{ backgroundColor: style.colors.accent }}></div>
                    </div>

                    {/* 樣式信息 */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium text-sm" style={{ color: style.colors.text }}>
                          {style.name}
                        </h3>
                        <div className="flex items-center space-x-1">
                          {style.isPopular && <span className="text-xs">🔥</span>}
                          {style.isPremium && <span className="text-xs">💎</span>}
                        </div>
                      </div>
                      <p className="text-xs opacity-75" style={{ color: style.colors.textSecondary }}>
                        {style.description}
                      </p>
                      
                      {/* 標籤 */}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {style.tags.slice(0, 3).map(tag => (
                          <span
                            key={tag}
                            className="px-2 py-1 text-xs rounded-full"
                            style={{ 
                              backgroundColor: style.colors.accent + '20',
                              color: style.colors.accent
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* 選中指示器 */}
                    {currentStyleId === style.id && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* 空狀態 */}
              {filteredStyles.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">🎨</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">沒有找到樣式</h3>
                  <p className="text-gray-600">嘗試調整搜索條件或選擇其他類別</p>
                </div>
              )}
            </div>

            {/* 預覽面板 */}
            {showPreview && previewStyle && (
              <div className="w-80 border-l border-gray-200 p-6 overflow-y-auto">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">樣式預覽</h3>
                
                {/* 樣式信息 */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900">{previewStyle.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{previewStyle.description}</p>
                  <div className="flex items-center mt-2 space-x-2">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      {previewStyle.category}
                    </span>
                    {previewStyle.isPopular && (
                      <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded">
                        熱門
                      </span>
                    )}
                    {previewStyle.isPremium && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                        高級
                      </span>
                    )}
                  </div>
                </div>

                {/* 顏色調色板 */}
                <div className="mb-6">
                  <h5 className="text-sm font-medium text-gray-900 mb-3">顏色調色板</h5>
                  <div className="grid grid-cols-4 gap-2">
                    {Object.entries(previewStyle.colors).map(([name, color]) => (
                      <div key={name} className="text-center">
                        <div
                          className="w-full h-8 rounded border border-gray-200 mb-1"
                          style={{ backgroundColor: color }}
                        ></div>
                        <span className="text-xs text-gray-600 capitalize">
                          {name.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 字體預覽 */}
                <div className="mb-6">
                  <h5 className="text-sm font-medium text-gray-900 mb-3">字體樣式</h5>
                  <div className="space-y-2">
                    <div style={{ fontFamily: previewStyle.typography.fontFamily }}>
                      <div className="text-lg font-bold">標題文字</div>
                      <div className="text-base">正文內容</div>
                      <div className="text-sm text-gray-600">輔助文字</div>
                    </div>
                  </div>
                </div>

                {/* 標籤 */}
                <div>
                  <h5 className="text-sm font-medium text-gray-900 mb-3">標籤</h5>
                  <div className="flex flex-wrap gap-1">
                    {previewStyle.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 應用按鈕 */}
                <button
                  onClick={() => handleStyleSelect(previewStyle.id)}
                  className="w-full mt-6 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  應用此樣式
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
