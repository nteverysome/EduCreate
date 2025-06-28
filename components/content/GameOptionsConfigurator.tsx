/**
 * 遊戲選項配置器組件
 * 提供詳細的遊戲選項配置界面
 */

import React, { useState, useEffect } from 'react';
import { GameType } from '../../lib/content/UniversalContentManager';
import { 
  GameOptionsManager, 
  GameOptions, 
  GameOptionDefinition 
} from '../../lib/content/GameOptionsManager';

interface GameOptionsConfiguratorProps {
  gameType: GameType;
  currentOptions?: Partial<GameOptions>;
  onOptionsChange: (options: GameOptions) => void;
  onClose?: () => void;
  showPreview?: boolean;
}

export default function GameOptionsConfigurator({
  gameType,
  currentOptions = {},
  onOptionsChange,
  onClose,
  showPreview = true
}: GameOptionsConfiguratorProps) {
  const [options, setOptions] = useState<GameOptions>(() => {
    const defaultOptions = GameOptionsManager.getDefaultOptions(gameType);
    return GameOptionsManager.mergeOptions(defaultOptions, currentOptions);
  });
  
  const [activeCategory, setActiveCategory] = useState<string>('timer');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [previewMode, setPreviewMode] = useState(false);

  const categories = [
    { id: 'timer', name: '計時器', icon: '⏱️' },
    { id: 'scoring', name: '計分', icon: '🏆' },
    { id: 'lives', name: '生命值', icon: '❤️' },
    { id: 'difficulty', name: '難度', icon: '📊' },
    { id: 'audio', name: '音效', icon: '🔊' },
    { id: 'visual', name: '視覺', icon: '✨' },
    { id: 'accessibility', name: '無障礙', icon: '♿' },
    { id: 'gameplay', name: '遊戲玩法', icon: '🎮' },
    { id: 'specific', name: '特殊選項', icon: '⚙️' }
  ];

  // 初始化選項管理器
  useEffect(() => {
    GameOptionsManager.initialize();
  }, []);

  // 驗證選項
  useEffect(() => {
    const validation = GameOptionsManager.validateOptions(gameType, options);
    setValidationErrors(validation.errors);
  }, [gameType, options]);

  // 更新選項值
  const updateOption = (optionId: string, value: any) => {
    const newOptions = { ...options };
    setNestedValue(newOptions, optionId, value);
    setOptions(newOptions);
    onOptionsChange(newOptions);
  };

  // 重置為默認值
  const resetToDefaults = () => {
    const defaultOptions = GameOptionsManager.getDefaultOptions(gameType);
    setOptions(defaultOptions);
    onOptionsChange(defaultOptions);
  };

  // 獲取嵌套值
  const getNestedValue = (obj: any, path: string): any => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  // 設置嵌套值
  const setNestedValue = (obj: any, path: string, value: any): void => {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    const target = keys.reduce((current, key) => {
      if (!current[key]) current[key] = {};
      return current[key];
    }, obj);
    target[lastKey] = value;
  };

  // 檢查依賴關係
  const isDependencyMet = (definition: GameOptionDefinition): boolean => {
    if (!definition.dependencies) return true;
    
    return definition.dependencies.every(dep => {
      const depValue = getNestedValue(options, dep.optionId);
      return depValue === dep.value;
    });
  };

  // 渲染選項控件
  const renderOptionControl = (definition: GameOptionDefinition) => {
    const value = getNestedValue(options, definition.id);
    const isDisabled = !isDependencyMet(definition);

    switch (definition.type) {
      case 'boolean':
        return (
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => updateOption(definition.id, e.target.checked)}
              disabled={isDisabled}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
            />
            <span className="ml-2 text-sm text-gray-700">{definition.name}</span>
          </label>
        );

      case 'number':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {definition.name}
            </label>
            <input
              type="number"
              value={value || definition.defaultValue}
              onChange={(e) => updateOption(definition.id, Number(e.target.value))}
              min={definition.min}
              max={definition.max}
              step={definition.step}
              disabled={isDisabled}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
            />
            {definition.unit && (
              <span className="text-xs text-gray-500 mt-1">{definition.unit}</span>
            )}
          </div>
        );

      case 'range':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {definition.name}
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="range"
                value={value || definition.defaultValue}
                onChange={(e) => updateOption(definition.id, Number(e.target.value))}
                min={definition.min}
                max={definition.max}
                step={definition.step}
                disabled={isDisabled}
                className="flex-1 disabled:opacity-50"
              />
              <span className="text-sm text-gray-600 min-w-[3rem]">
                {value || definition.defaultValue}{definition.unit}
              </span>
            </div>
          </div>
        );

      case 'select':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {definition.name}
            </label>
            <select
              value={value || definition.defaultValue}
              onChange={(e) => updateOption(definition.id, e.target.value)}
              disabled={isDisabled}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
            >
              {definition.options?.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        );

      case 'multiselect':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {definition.name}
            </label>
            <div className="space-y-2">
              {definition.options?.map(option => (
                <label key={option.value} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={(value || []).includes(option.value)}
                    onChange={(e) => {
                      const currentValues = value || [];
                      const newValues = e.target.checked
                        ? [...currentValues, option.value]
                        : currentValues.filter((v: any) => v !== option.value);
                      updateOption(definition.id, newValues);
                    }}
                    disabled={isDisabled}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 'color':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {definition.name}
            </label>
            <input
              type="color"
              value={value || definition.defaultValue}
              onChange={(e) => updateOption(definition.id, e.target.value)}
              disabled={isDisabled}
              className="w-full h-10 border border-gray-300 rounded-md disabled:opacity-50"
            />
          </div>
        );

      default:
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {definition.name}
            </label>
            <input
              type="text"
              value={value || definition.defaultValue}
              onChange={(e) => updateOption(definition.id, e.target.value)}
              disabled={isDisabled}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
            />
          </div>
        );
    }
  };

  // 獲取當前類別的選項
  const getCurrentCategoryOptions = () => {
    return GameOptionsManager.getOptionsByCategory(gameType, activeCategory as any);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
        {/* 頭部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">遊戲選項配置</h2>
            <p className="text-gray-600 mt-1">自定義 {gameType} 遊戲的各項設置</p>
          </div>
          <div className="flex items-center space-x-3">
            {showPreview && (
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  previewMode
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {previewMode ? '退出預覽' : '預覽效果'}
              </button>
            )}
            <button
              onClick={resetToDefaults}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              重置默認
            </button>
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
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* 側邊欄 - 類別選擇 */}
          <div className="w-64 border-r border-gray-200 p-4 overflow-y-auto">
            <h3 className="text-sm font-medium text-gray-900 mb-3">選項類別</h3>
            <div className="space-y-1">
              {categories.map(category => {
                const categoryOptions = GameOptionsManager.getOptionsByCategory(gameType, category.id as any);
                if (categoryOptions.length === 0) return null;

                return (
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
                      {categoryOptions.length}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* 驗證錯誤 */}
            {validationErrors.length > 0 && (
              <div className="mt-6 p-3 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="text-sm font-medium text-red-800 mb-2">配置錯誤</h4>
                <ul className="text-xs text-red-700 space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* 主要內容區域 */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="max-w-2xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {categories.find(c => c.id === activeCategory)?.name} 設置
              </h3>

              <div className="space-y-6">
                {getCurrentCategoryOptions().map(definition => (
                  <div
                    key={definition.id}
                    className={`p-4 border rounded-lg ${
                      isDependencyMet(definition)
                        ? 'border-gray-200 bg-white'
                        : 'border-gray-100 bg-gray-50'
                    }`}
                  >
                    <div className="mb-3">
                      {renderOptionControl(definition)}
                      {definition.description && (
                        <p className="text-xs text-gray-500 mt-1">{definition.description}</p>
                      )}
                    </div>

                    {/* 預覽按鈕 */}
                    {definition.preview && (
                      <button
                        onClick={() => {/* 實現預覽邏輯 */}}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        預覽效果
                      </button>
                    )}
                  </div>
                ))}

                {getCurrentCategoryOptions().length === 0 && (
                  <div className="text-center py-8">
                    <div className="text-gray-400 text-4xl mb-2">⚙️</div>
                    <p className="text-gray-600">此類別暫無可配置選項</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 底部操作欄 */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            {validationErrors.length === 0 ? (
              <span className="text-green-600">✓ 配置有效</span>
            ) : (
              <span className="text-red-600">⚠ {validationErrors.length} 個錯誤</span>
            )}
          </div>
          <div className="flex space-x-3">
            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
            )}
            <button
              onClick={() => onOptionsChange(options)}
              disabled={validationErrors.length > 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              應用設置
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
