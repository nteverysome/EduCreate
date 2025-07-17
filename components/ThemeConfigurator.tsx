import React, { useState, useEffect } from 'react';
import { useLocalStorage } from './PerformanceOptimizer';
interface Theme {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    accent: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  animations: boolean;
  category: string;
  preview: string;
}
interface GameConfig {
  theme: string;
  timeLimit: number;
  showHints: boolean;
  soundEffects: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  language: string;
  autoAdvance: boolean;
  showProgress: boolean;
}
export default function ThemeConfigurator() {
  const [selectedTheme, setSelectedTheme] = useLocalStorage<string>('selected_theme', 'default');
  const [gameConfig, setGameConfig] = useLocalStorage<GameConfig>('game_config', {
    theme: 'default',
    timeLimit: 60,
    showHints: true,
    soundEffects: true,
    difficulty: 'medium',
    language: 'zh-TW',
    autoAdvance: false,
    showProgress: true
  });
  const [activeTab, setActiveTab] = useState<'themes' | 'settings' | 'advanced'>('themes');
  const themes: Theme[] = [
    {
      id: 'default',
      name: '經典藍',
      description: '專業的藍色主題，適合正式教學環境',
      colors: {
        primary: '#3B82F6',
        secondary: '#1E40AF',
        background: '#F8FAFC',
        text: '#1F2937',
        accent: '#10B981'
      },
      fonts: {
        heading: 'Inter',
        body: 'Inter'
      },
      animations: true,
      category: '專業',
      preview: '🔵'
    },
    {
      id: 'nature',
      name: '自然綠',
      description: '清新的綠色主題，營造自然學習氛圍',
      colors: {
        primary: '#10B981',
        secondary: '#059669',
        background: '#F0FDF4',
        text: '#1F2937',
        accent: '#F59E0B'
      },
      fonts: {
        heading: 'Inter',
        body: 'Inter'
      },
      animations: true,
      category: '自然',
      preview: '🌿'
    },
    {
      id: 'sunset',
      name: '夕陽橙',
      description: '溫暖的橙色主題，增加學習熱情',
      colors: {
        primary: '#F97316',
        secondary: '#EA580C',
        background: '#FFF7ED',
        text: '#1F2937',
        accent: '#8B5CF6'
      },
      fonts: {
        heading: 'Inter',
        body: 'Inter'
      },
      animations: true,
      category: '溫暖',
      preview: '🌅'
    },
    {
      id: 'ocean',
      name: '海洋藍',
      description: '深邃的海洋主題，帶來寧靜專注感',
      colors: {
        primary: '#0EA5E9',
        secondary: '#0284C7',
        background: '#F0F9FF',
        text: '#1F2937',
        accent: '#06B6D4'
      },
      fonts: {
        heading: 'Inter',
        body: 'Inter'
      },
      animations: true,
      category: '清涼',
      preview: '🌊'
    },
    {
      id: 'forest',
      name: '森林綠',
      description: '深綠色主題，適合自然科學教學',
      colors: {
        primary: '#16A34A',
        secondary: '#15803D',
        background: '#F7FEF7',
        text: '#1F2937',
        accent: '#84CC16'
      },
      fonts: {
        heading: 'Inter',
        body: 'Inter'
      },
      animations: true,
      category: '自然',
      preview: '🌲'
    },
    {
      id: 'purple',
      name: '紫羅蘭',
      description: '優雅的紫色主題，激發創造力',
      colors: {
        primary: '#8B5CF6',
        secondary: '#7C3AED',
        background: '#FAFAF9',
        text: '#1F2937',
        accent: '#F59E0B'
      },
      fonts: {
        heading: 'Inter',
        body: 'Inter'
      },
      animations: true,
      category: '創意',
      preview: '💜'
    },
    {
      id: 'kids',
      name: '兒童彩虹',
      description: '繽紛的彩色主題，適合兒童教學',
      colors: {
        primary: '#EC4899',
        secondary: '#BE185D',
        background: '#FEF7FF',
        text: '#1F2937',
        accent: '#F59E0B'
      },
      fonts: {
        heading: 'Comic Sans MS',
        body: 'Comic Sans MS'
      },
      animations: true,
      category: '兒童',
      preview: '🌈'
    },
    {
      id: 'dark',
      name: '深色模式',
      description: '護眼的深色主題，適合長時間使用',
      colors: {
        primary: '#60A5FA',
        secondary: '#3B82F6',
        background: '#1F2937',
        text: '#F9FAFB',
        accent: '#34D399'
      },
      fonts: {
        heading: 'Inter',
        body: 'Inter'
      },
      animations: true,
      category: '護眼',
      preview: '🌙'
    }
  ];
  const categories = [...new Set(themes.map(theme => theme.category))];
  const updateGameConfig = (key: keyof GameConfig, value: any) => {
    setGameConfig(prev => ({ ...prev, [key]: value }));
  };
  const applyTheme = (themeId: string) => {
    setSelectedTheme(themeId);
    updateGameConfig('theme', themeId);
    const theme = themes.find(t => t.id === themeId);
    if (theme) {
      // 應用主題到 CSS 變量
      const root = document.documentElement;
      root.style.setProperty('--color-primary', theme.colors.primary);
      root.style.setProperty('--color-secondary', theme.colors.secondary);
      root.style.setProperty('--color-background', theme.colors.background);
      root.style.setProperty('--color-text', theme.colors.text);
      root.style.setProperty('--color-accent', theme.colors.accent);
    }
  };
  const exportConfig = () => {
    const config = {
      theme: selectedTheme,
      gameConfig,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `educreate-config-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const importConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const config = JSON.parse(e.target?.result as string);
          if (config.theme) setSelectedTheme(config.theme);
          if (config.gameConfig) setGameConfig(config.gameConfig);
        } catch (error) {
          alert('配置文件格式錯誤');
        }
      };
      reader.readAsText(file);
    }
  };
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <h1 className="text-2xl font-bold mb-2">🎨 主題與配置</h1>
          <p className="text-blue-100">自定義您的遊戲外觀和行為設置</p>
        </div>
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'themes', name: '主題選擇', icon: '🎨' },
              { id: 'settings', name: '遊戲設置', icon: '⚙️' },
              { id: 'advanced', name: '高級配置', icon: '🔧' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-2 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.icon} {tab.name}
              </button>
            ))}
          </nav>
        </div>
        {/* Content */}
        <div className="p-6">
          {activeTab === 'themes' && (
            <div>
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">選擇主題</h2>
                <p className="text-gray-600">選擇適合您教學環境的視覺主題</p>
              </div>
              {/* Theme Categories */}
              <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                  {categories.map(category => (
                    <span
                      key={category}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              </div>
              {/* Theme Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {themes.map((theme) => (
                  <div
                    key={theme.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedTheme === theme.id
                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => applyTheme(theme.id)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-2xl">{theme.preview}</div>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {theme.category}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">{theme.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{theme.description}</p>
                    <div className="flex space-x-1">
                      {Object.values(theme.colors).slice(0, 5).map((color, index) => (
                        <div
                          key={index}
                          className="w-4 h-4 rounded-full border border-gray-200"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">遊戲設置</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    時間限制 (秒)
                  </label>
                  <input
                    type="number"
                    value={gameConfig.timeLimit}
                    onChange={(e) => updateGameConfig('timeLimit', parseInt(e.target.value))}
                    min="10"
                    max="300"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    難度等級
                  </label>
                  <select
                    value={gameConfig.difficulty}
                    onChange={(e) => updateGameConfig('difficulty', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="easy">簡單</option>
                    <option value="medium">中等</option>
                    <option value="hard">困難</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    語言設置
                  </label>
                  <select
                    value={gameConfig.language}
                    onChange={(e) => updateGameConfig('language', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="zh-TW">繁體中文</option>
                    <option value="zh-CN">簡體中文</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">顯示提示</h3>
                    <p className="text-sm text-gray-500">在遊戲中提供額外的幫助提示</p>
                  </div>
                  <button
                    onClick={() => updateGameConfig('showHints', !gameConfig.showHints)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      gameConfig.showHints ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        gameConfig.showHints ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">音效</h3>
                    <p className="text-sm text-gray-500">啟用遊戲音效和背景音樂</p>
                  </div>
                  <button
                    onClick={() => updateGameConfig('soundEffects', !gameConfig.soundEffects)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      gameConfig.soundEffects ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        gameConfig.soundEffects ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">自動前進</h3>
                    <p className="text-sm text-gray-500">答對後自動進入下一題</p>
                  </div>
                  <button
                    onClick={() => updateGameConfig('autoAdvance', !gameConfig.autoAdvance)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      gameConfig.autoAdvance ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        gameConfig.autoAdvance ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">顯示進度</h3>
                    <p className="text-sm text-gray-500">顯示遊戲進度條和完成百分比</p>
                  </div>
                  <button
                    onClick={() => updateGameConfig('showProgress', !gameConfig.showProgress)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      gameConfig.showProgress ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        gameConfig.showProgress ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'advanced' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">高級配置</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">導出配置</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    將當前的主題和設置導出為配置文件
                  </p>
                  <button
                    onClick={exportConfig}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    📤 導出配置
                  </button>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">導入配置</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    從配置文件恢復主題和設置
                  </p>
                  <input
                    type="file"
                    accept=".json"
                    onChange={importConfig}
                    className="hidden"
                    id="config-import"
                  />
                  <label
                    htmlFor="config-import"
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 cursor-pointer inline-block"
                  >
                    📥 導入配置
                  </label>
                </div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-medium text-yellow-800 mb-2">⚠️ 注意事項</h3>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• 配置更改會立即生效</li>
                  <li>• 導入配置會覆蓋當前設置</li>
                  <li>• 建議在重要更改前先導出當前配置</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
