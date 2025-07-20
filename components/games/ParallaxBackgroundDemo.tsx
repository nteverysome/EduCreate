import React, { useState } from 'react';
import { ParallaxBackground } from './ParallaxBackground';

interface ParallaxBackgroundDemoProps {
  className?: string;
}

export const ParallaxBackgroundDemo: React.FC<ParallaxBackgroundDemoProps> = ({
  className = ''
}) => {
  const [currentTheme, setCurrentTheme] = useState<'forest' | 'desert' | 'sky' | 'moon'>('forest');
  const [speed, setSpeed] = useState(0.5);
  const [disabled, setDisabled] = useState(false);

  const themes = [
    { id: 'forest', name: '森林', description: '適合自然科學詞彙學習' },
    { id: 'desert', name: '沙漠', description: '適合探險主題詞彙' },
    { id: 'sky', name: '天空', description: '適合基礎英語學習' },
    { id: 'moon', name: '月亮', description: '適合夜間模式學習' }
  ] as const;

  return (
    <div className={`relative min-h-screen ${className}`}>
      {/* 視差背景 */}
      <ParallaxBackground 
        theme={currentTheme}
        speed={speed}
        disabled={disabled}
      />
      
      {/* 控制面板 */}
      <div className="relative z-10 p-6 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg m-4">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          🎮 EduCreate 視差背景系統
        </h2>
        
        {/* 主題選擇 */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-700">選擇主題</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {themes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => setCurrentTheme(theme.id)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  currentTheme === theme.id
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'
                }`}
                aria-label={`切換到${theme.name}主題`}
              >
                <div className="font-medium">{theme.name}</div>
                <div className="text-xs mt-1 opacity-75">{theme.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 速度控制 */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-700">視差速度</h3>
          <div className="flex items-center space-x-4">
            <label className="text-sm text-gray-600">慢</label>
            <input
              type="range"
              min="0.1"
              max="2"
              step="0.1"
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              aria-label="調整視差滾動速度"
            />
            <label className="text-sm text-gray-600">快</label>
            <span className="text-sm font-medium text-gray-800 min-w-[3rem]">
              {speed.toFixed(1)}x
            </span>
          </div>
        </div>

        {/* 無障礙選項 */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-700">無障礙設計</h3>
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={disabled}
              onChange={(e) => setDisabled(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              aria-describedby="disable-animation-desc"
            />
            <span className="text-gray-700">禁用視差動畫</span>
          </label>
          <p id="disable-animation-desc" className="text-xs text-gray-500 mt-1 ml-7">
            為動作敏感用戶提供靜態背景選項
          </p>
        </div>

        {/* 當前狀態顯示 */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-700 mb-2">當前設定</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <div>主題: <span className="font-medium" data-testid="current-theme">{themes.find(t => t.id === currentTheme)?.name}</span></div>
            <div>速度: <span className="font-medium" data-testid="current-speed">{speed.toFixed(1)}x</span></div>
            <div>動畫: <span className="font-medium" data-testid="current-animation">{disabled ? '已禁用' : '已啟用'}</span></div>
          </div>
        </div>

        {/* 使用說明 */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">💡 EduCreate 整合應用</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• <strong>森林主題</strong>: 自然科學詞彙、生物學習</li>
            <li>• <strong>沙漠主題</strong>: 探險詞彙、地理學習</li>
            <li>• <strong>天空主題</strong>: 基礎英語、簡潔學習環境</li>
            <li>• <strong>月亮主題</strong>: 夜間模式、天文學習</li>
          </ul>
        </div>
      </div>

      {/* 示例內容區域 */}
      <div className="relative z-10 p-6 m-4 bg-white/80 backdrop-blur-sm rounded-lg">
        <h3 className="text-xl font-bold mb-4 text-gray-800">
          📚 學習內容示例區域
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="p-4 bg-white rounded-lg shadow-sm border">
              <h4 className="font-medium text-gray-700 mb-2">
                詞彙卡片 {i + 1}
              </h4>
              <p className="text-gray-600 text-sm">
                這裡是學習內容，背景會根據主題自動調整，
                提供沉浸式的學習體驗。
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
