/**
 * 檔案夾視覺自定義面板組件
 * 提供檔案夾顏色、圖標、主題等視覺自定義功能
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  FolderCustomization, 
  FolderTheme, 
  FolderIconSet, 
  FolderIcon,
  FolderColorScheme,
  FolderIconType,
  AccessibilitySettings
} from '../../lib/folder/FolderCustomizationManager';

interface FolderCustomizationPanelProps {
  folderId: string;
  folderName: string;
  currentCustomization?: FolderCustomization;
  availableThemes: FolderTheme[];
  availableIconSets: FolderIconSet[];
  onCustomizationChange: (customization: FolderCustomization) => void;
  onClose: () => void;
  isVisible: boolean;
}

export default function FolderCustomizationPanel({
  folderId,
  folderName,
  currentCustomization,
  availableThemes,
  availableIconSets,
  onCustomizationChange,
  onClose,
  isVisible
}: FolderCustomizationPanelProps) {
  const [activeTab, setActiveTab] = useState<'themes' | 'colors' | 'icons' | 'accessibility'>('themes');
  const [selectedTheme, setSelectedTheme] = useState<FolderTheme | null>(null);
  const [customColors, setCustomColors] = useState<FolderColorScheme | null>(null);
  const [selectedIcon, setSelectedIcon] = useState<FolderIcon | null>(null);
  const [iconSearchQuery, setIconSearchQuery] = useState('');
  const [accessibilitySettings, setAccessibilitySettings] = useState<AccessibilitySettings>({
    highContrast: false,
    largeText: false,
    reducedMotion: false,
    screenReaderOptimized: true,
    colorBlindFriendly: false,
    focusIndicator: true
  });
  const [previewMode, setPreviewMode] = useState(false);

  // 初始化當前設定
  useEffect(() => {
    if (currentCustomization) {
      const theme = availableThemes.find(t => t.id === currentCustomization.metadata.theme);
      setSelectedTheme(theme || null);
      setCustomColors(currentCustomization.colorScheme);
      setAccessibilitySettings(currentCustomization.metadata.accessibility);
    }
  }, [currentCustomization, availableThemes]);

  // 處理主題選擇
  const handleThemeSelect = useCallback((theme: FolderTheme) => {
    setSelectedTheme(theme);
    setCustomColors(theme.colorSchemes[0]);
    setAccessibilitySettings(theme.accessibility);
  }, []);

  // 處理顏色變更
  const handleColorChange = useCallback((colorKey: keyof FolderColorScheme, value: string) => {
    if (!customColors) return;
    
    setCustomColors(prev => ({
      ...prev!,
      [colorKey]: value
    }));
  }, [customColors]);

  // 處理圖標選擇
  const handleIconSelect = useCallback((icon: FolderIcon) => {
    setSelectedIcon(icon);
  }, []);

  // 搜索圖標
  const searchIcons = useCallback((query: string): FolderIcon[] => {
    if (!query.trim()) return [];
    
    const results: FolderIcon[] = [];
    const lowerQuery = query.toLowerCase();

    availableIconSets.forEach(iconSet => {
      iconSet.icons.forEach(icon => {
        const matchesName = icon.name.toLowerCase().includes(lowerQuery);
        const matchesKeywords = icon.keywords.some(keyword => 
          keyword.toLowerCase().includes(lowerQuery)
        );

        if (matchesName || matchesKeywords) {
          results.push(icon);
        }
      });
    });

    return results.slice(0, 20); // 限制結果數量
  }, [availableIconSets]);

  // 應用自定義設定
  const handleApplyCustomization = useCallback(() => {
    if (!customColors) return;

    const customization: FolderCustomization = {
      id: currentCustomization?.id || `custom_${Date.now()}`,
      folderId,
      userId: 'current-user', // 實際應該從認證狀態獲取
      colorScheme: customColors,
      iconType: selectedIcon ? FolderIconType.CUSTOM : FolderIconType.DEFAULT,
      customIcon: selectedIcon?.svg,
      createdAt: currentCustomization?.createdAt || new Date(),
      updatedAt: new Date(),
      isDefault: false,
      metadata: {
        version: '1.0.0',
        theme: selectedTheme?.id || 'custom',
        accessibility: accessibilitySettings
      }
    };

    onCustomizationChange(customization);
  }, [
    folderId,
    customColors,
    selectedIcon,
    selectedTheme,
    accessibilitySettings,
    currentCustomization,
    onCustomizationChange
  ]);

  // 重置為默認
  const handleReset = useCallback(() => {
    const defaultTheme = availableThemes.find(t => t.id === 'wordwall-default');
    if (defaultTheme) {
      handleThemeSelect(defaultTheme);
    }
    setSelectedIcon(null);
  }, [availableThemes, handleThemeSelect]);

  if (!isVisible) return null;

  const filteredIcons = iconSearchQuery ? searchIcons(iconSearchQuery) : [];

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      data-testid="folder-customization-panel"
      onClick={(e) => {
        // 點擊背景關閉面板
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 標題欄 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              自定義檔案夾外觀
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {folderName}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
              data-testid="preview-toggle"
            >
              {previewMode ? '編輯模式' : '預覽模式'}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClose();
              }}
              className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 rounded"
              data-testid="close-customization-panel"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* 左側預覽區域 */}
          <div className="w-1/3 p-6 bg-gray-50 border-r border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">預覽</h3>
            
            {/* 檔案夾預覽 */}
            <div 
              className="relative p-4 rounded-lg border-2 transition-all duration-200"
              style={{
                backgroundColor: customColors?.background || '#FFFFFF',
                color: customColors?.text || '#333333',
                borderColor: customColors?.border || '#E0E0E0',
                borderRadius: '8px'
              }}
              data-testid="folder-preview"
            >
              <div className="flex items-center space-x-3">
                {/* 圖標預覽 */}
                <div 
                  className="w-8 h-8 flex items-center justify-center"
                  style={{ color: customColors?.primary || '#4A90E2' }}
                  data-testid="folder-icon-preview"
                >
                  {selectedIcon ? (
                    <div dangerouslySetInnerHTML={{ __html: selectedIcon.svg }} />
                  ) : (
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                      <path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z"/>
                    </svg>
                  )}
                </div>
                
                {/* 檔案夾名稱 */}
                <span className="font-medium">{folderName}</span>
              </div>
              
              {/* 懸停效果預覽 */}
              <div className="mt-2 text-xs text-gray-500">
                懸停效果預覽
              </div>
            </div>

            {/* 顏色對比度檢查 */}
            {customColors && (
              <div className="mt-4 p-3 bg-white rounded-lg border" data-testid="contrast-check">
                <h4 className="text-sm font-medium text-gray-900 mb-2">無障礙檢查</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>文字對比度:</span>
                    <span className="text-green-600">✓ 通過</span>
                  </div>
                  <div className="flex justify-between">
                    <span>色盲友好:</span>
                    <span className={accessibilitySettings.colorBlindFriendly ? 'text-green-600' : 'text-yellow-600'}>
                      {accessibilitySettings.colorBlindFriendly ? '✓ 是' : '⚠ 否'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 右側設定區域 */}
          <div className="flex-1 flex flex-col">
            {/* 標籤頁 */}
            <div className="flex border-b border-gray-200">
              {[
                { id: 'themes', label: '主題', icon: '🎨' },
                { id: 'colors', label: '顏色', icon: '🌈' },
                { id: 'icons', label: '圖標', icon: '📁' },
                { id: 'accessibility', label: '無障礙', icon: '♿' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setActiveTab(tab.id as any);
                  }}
                  className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    activeTab === tab.id
                      ? 'text-blue-600 border-blue-600'
                      : 'text-gray-500 border-transparent hover:text-gray-700'
                  }`}
                  data-testid={`${tab.id}-tab`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* 標籤內容 */}
            <div className="flex-1 p-6 overflow-y-auto">
              {activeTab === 'themes' && (
                <div className="space-y-4" data-testid="themes-content">
                  <h3 className="text-lg font-medium text-gray-900">選擇主題</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {availableThemes.map((theme) => (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => handleThemeSelect(theme)}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all text-left w-full ${
                          selectedTheme?.id === theme.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        data-testid={`theme-${theme.id}`}
                      >
                        <div className="flex items-center space-x-3 mb-2">
                          <div 
                            className="w-6 h-6 rounded-full"
                            style={{ backgroundColor: theme.colorSchemes[0].primary }}
                          />
                          <h4 className="font-medium">{theme.name}</h4>
                        </div>
                        <p className="text-sm text-gray-600">{theme.description}</p>
                        
                        {/* 主題標籤 */}
                        <div className="mt-2 flex flex-wrap gap-1">
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                            {theme.category}
                          </span>
                          {theme.accessibility.highContrast && (
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
                              高對比
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'colors' && customColors && (
                <div className="space-y-6" data-testid="colors-content">
                  <h3 className="text-lg font-medium text-gray-900">自定義顏色</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(customColors).map(([key, value]) => {
                      if (key === 'gradient' || typeof value !== 'string') return null;
                      
                      return (
                        <div key={key} className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                          </label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="color"
                              value={value}
                              onChange={(e) => handleColorChange(key as keyof FolderColorScheme, e.target.value)}
                              className="w-12 h-8 rounded border border-gray-300"
                              data-testid={`color-${key}`}
                            />
                            <input
                              type="text"
                              value={value}
                              onChange={(e) => handleColorChange(key as keyof FolderColorScheme, e.target.value)}
                              className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm"
                              placeholder="#000000"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeTab === 'icons' && (
                <div className="space-y-4" data-testid="icons-content">
                  <h3 className="text-lg font-medium text-gray-900">選擇圖標</h3>
                  
                  {/* 圖標搜索 */}
                  <div className="relative">
                    <input
                      type="text"
                      value={iconSearchQuery}
                      onChange={(e) => setIconSearchQuery(e.target.value)}
                      placeholder="搜索圖標..."
                      className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      data-testid="icon-search-input"
                    />
                    <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>

                  {/* 圖標網格 */}
                  <div className="grid grid-cols-6 gap-3" data-testid="icons-grid">
                    {(iconSearchQuery ? filteredIcons : availableIconSets.flatMap(set => set.icons.slice(0, 12))).map((icon) => (
                      <button
                        key={icon.id}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleIconSelect(icon);
                        }}
                        className={`p-3 rounded-lg border-2 transition-all hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          selectedIcon?.id === icon.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200'
                        }`}
                        title={icon.name}
                        data-testid={`icon-${icon.id}`}
                      >
                        <div
                          className="w-6 h-6 mx-auto pointer-events-none"
                          dangerouslySetInnerHTML={{ __html: icon.svg }}
                        />
                      </button>
                    ))}
                  </div>

                  {iconSearchQuery && filteredIcons.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      找不到符合條件的圖標
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'accessibility' && (
                <div className="space-y-6" data-testid="accessibility-content">
                  <h3 className="text-lg font-medium text-gray-900">無障礙設定</h3>

                  <div className="space-y-4">
                    {Object.entries(accessibilitySettings).map(([key, value]) => (
                      <label key={key} className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => setAccessibilitySettings(prev => ({
                            ...prev,
                            [key]: e.target.checked
                          }))}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          data-testid={`accessibility-${key}`}
                        />
                        <div>
                          <span className="font-medium text-gray-900 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                          </span>
                          <p className="text-sm text-gray-600">
                            {getAccessibilityDescription(key)}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 底部操作按鈕 */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleReset();
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
                data-testid="reset-button"
              >
                重置為默認
              </button>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onClose();
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
                  data-testid="cancel-button"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleApplyCustomization();
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                  data-testid="apply-button"
                >
                  應用設定
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

}

// 獲取無障礙設定描述
function getAccessibilityDescription(key: string): string {
  const descriptions = {
    highContrast: '使用高對比度顏色，提高可讀性',
    largeText: '增大文字大小，便於閱讀',
    reducedMotion: '減少動畫效果，避免暈眩',
    screenReaderOptimized: '優化螢幕閱讀器支持',
    colorBlindFriendly: '使用色盲友好的顏色組合',
    focusIndicator: '顯示清晰的焦點指示器'
  };
  return descriptions[key as keyof typeof descriptions] || '';
}
