/**
 * 無障礙設定面板
 * 提供完整的無障礙設定選項和個人化配置
 */
import React, { useState, useEffect } from 'react';
import { WCAGComplianceChecker, WCAGLevel, ComplianceReport } from '@/lib/accessibility/WCAGComplianceChecker';

export interface AccessibilitySettings {
  // 視覺設定
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  contrast: 'normal' | 'high' | 'extra-high';
  colorScheme: 'default' | 'dark' | 'light' | 'high-contrast';
  
  // 動畫和效果
  animationSpeed: 'normal' | 'slow' | 'none';
  reduceMotion: boolean;
  
  // 音效設定
  soundEnabled: boolean;
  soundVolume: number;
  voiceAnnouncements: boolean;
  
  // 鍵盤和導航
  keyboardNavigation: boolean;
  focusIndicator: 'default' | 'enhanced' | 'custom';
  skipLinks: boolean;
  
  // 螢幕閱讀器
  screenReaderOptimized: boolean;
  verboseDescriptions: boolean;
  announceChanges: boolean;
  
  // 文字和間距
  textSpacing: number;
  lineHeight: number;
  letterSpacing: number;
  
  // 遊戲特定設定
  gameSpeed: 'slow' | 'normal' | 'fast';
  autoAdvance: boolean;
  confirmActions: boolean;
  
  // WCAG 合規等級
  wcagLevel: WCAGLevel;
}

interface AccessibilitySettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AccessibilitySettings;
  onSettingsChange: (settings: AccessibilitySettings) => void;
  onRunCompliance?: () => void;
}

const defaultSettings: AccessibilitySettings = {
  fontSize: 'medium',
  contrast: 'normal',
  colorScheme: 'default',
  animationSpeed: 'normal',
  reduceMotion: false,
  soundEnabled: true,
  soundVolume: 0.7,
  voiceAnnouncements: true,
  keyboardNavigation: true,
  focusIndicator: 'enhanced',
  skipLinks: true,
  screenReaderOptimized: true,
  verboseDescriptions: false,
  announceChanges: true,
  textSpacing: 1,
  lineHeight: 1.5,
  letterSpacing: 0,
  gameSpeed: 'normal',
  autoAdvance: false,
  confirmActions: true,
  wcagLevel: WCAGLevel.AA
};

export default function AccessibilitySettingsPanel({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
  onRunCompliance
}: AccessibilitySettingsPanelProps) {
  const [activeTab, setActiveTab] = useState<'visual' | 'audio' | 'navigation' | 'game' | 'compliance'>('visual');
  const [complianceReport, setComplianceReport] = useState<ComplianceReport | null>(null);
  const [isRunningCompliance, setIsRunningCompliance] = useState(false);

  // 更新設定
  const updateSetting = <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    onSettingsChange(newSettings);
  };

  // 重置設定
  const resetSettings = () => {
    onSettingsChange(defaultSettings);
  };

  // 運行 WCAG 合規檢查
  const runComplianceCheck = async () => {
    setIsRunningCompliance(true);
    try {
      const report = await WCAGComplianceChecker.checkCompliance(document.body, settings.wcagLevel);
      setComplianceReport(report);
      onRunCompliance?.();
    } catch (error) {
      console.error('WCAG 合規檢查失敗:', error);
    } finally {
      setIsRunningCompliance(false);
    }
  };

  // 應用設定到 CSS 變數
  useEffect(() => {
    if (!isOpen) return;

    const root = document.documentElement;
    
    // 字體大小
    const fontSizeMap = {
      'small': '14px',
      'medium': '16px',
      'large': '18px',
      'extra-large': '20px'
    };
    root.style.setProperty('--accessibility-font-size', fontSizeMap[settings.fontSize]);
    
    // 行高和間距
    root.style.setProperty('--accessibility-line-height', settings.lineHeight.toString());
    root.style.setProperty('--accessibility-letter-spacing', `${settings.letterSpacing}px`);
    
    // 色彩方案
    if (settings.colorScheme === 'dark') {
      root.classList.add('dark-mode');
    } else {
      root.classList.remove('dark-mode');
    }
    
    if (settings.colorScheme === 'high-contrast') {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    
    // 動畫設定
    if (settings.reduceMotion || settings.animationSpeed === 'none') {
      root.style.setProperty('--accessibility-animation-duration', '0s');
    } else {
      const speedMap = {
        'slow': '0.8s',
        'normal': '0.3s',
        'fast': '0.1s'
      };
      root.style.setProperty('--accessibility-animation-duration', speedMap[settings.animationSpeed]);
    }
  }, [settings, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" role="dialog" aria-labelledby="accessibility-settings-title" aria-modal="true">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* 標題列 */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 id="accessibility-settings-title" className="text-2xl font-bold text-gray-900">
            ♿ 無障礙設定
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
            aria-label="關閉無障礙設定"
          >
            ×
          </button>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* 側邊欄標籤 */}
          <div className="w-48 bg-gray-50 border-r">
            <nav className="p-4 space-y-2" role="tablist" aria-label="設定分類">
              {[
                { id: 'visual', label: '👁️ 視覺設定', icon: '👁️' },
                { id: 'audio', label: '🔊 音效設定', icon: '🔊' },
                { id: 'navigation', label: '⌨️ 導航設定', icon: '⌨️' },
                { id: 'game', label: '🎮 遊戲設定', icon: '🎮' },
                { id: 'compliance', label: '✅ 合規檢查', icon: '✅' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  aria-controls={`${tab.id}-panel`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* 主要內容區域 */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              {/* 視覺設定 */}
              {activeTab === 'visual' && (
                <div role="tabpanel" id="visual-panel" aria-labelledby="visual-tab">
                  <h3 className="text-lg font-semibold mb-4">視覺設定</h3>
                  
                  <div className="space-y-6">
                    {/* 字體大小 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        字體大小
                      </label>
                      <select
                        value={settings.fontSize}
                        onChange={(e) => updateSetting('fontSize', e.target.value as any)}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                        aria-describedby="font-size-help"
                      >
                        <option value="small">小 (14px)</option>
                        <option value="medium">中 (16px)</option>
                        <option value="large">大 (18px)</option>
                        <option value="extra-large">特大 (20px)</option>
                      </select>
                      <p id="font-size-help" className="text-sm text-gray-500 mt-1">
                        調整文字大小以提高可讀性
                      </p>
                    </div>

                    {/* 對比度 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        對比度
                      </label>
                      <select
                        value={settings.contrast}
                        onChange={(e) => updateSetting('contrast', e.target.value as any)}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                      >
                        <option value="normal">標準</option>
                        <option value="high">高對比</option>
                        <option value="extra-high">超高對比</option>
                      </select>
                    </div>

                    {/* 色彩方案 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        色彩方案
                      </label>
                      <select
                        value={settings.colorScheme}
                        onChange={(e) => updateSetting('colorScheme', e.target.value as any)}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                      >
                        <option value="default">預設</option>
                        <option value="light">淺色</option>
                        <option value="dark">深色</option>
                        <option value="high-contrast">高對比</option>
                      </select>
                    </div>

                    {/* 文字間距 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        行高: {settings.lineHeight}
                      </label>
                      <input
                        type="range"
                        min="1.2"
                        max="2.0"
                        step="0.1"
                        value={settings.lineHeight}
                        onChange={(e) => updateSetting('lineHeight', parseFloat(e.target.value))}
                        className="w-full"
                      />
                    </div>

                    {/* 字母間距 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        字母間距: {settings.letterSpacing}px
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="3"
                        step="0.5"
                        value={settings.letterSpacing}
                        onChange={(e) => updateSetting('letterSpacing', parseFloat(e.target.value))}
                        className="w-full"
                      />
                    </div>

                    {/* 減少動畫 */}
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="reduce-motion"
                        checked={settings.reduceMotion}
                        onChange={(e) => updateSetting('reduceMotion', e.target.checked)}
                        className="mr-2"
                      />
                      <label htmlFor="reduce-motion" className="text-sm text-gray-700">
                        減少動畫效果
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* 音效設定 */}
              {activeTab === 'audio' && (
                <div role="tabpanel" id="audio-panel" aria-labelledby="audio-tab">
                  <h3 className="text-lg font-semibold mb-4">音效設定</h3>
                  
                  <div className="space-y-6">
                    {/* 啟用音效 */}
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="sound-enabled"
                        checked={settings.soundEnabled}
                        onChange={(e) => updateSetting('soundEnabled', e.target.checked)}
                        className="mr-2"
                      />
                      <label htmlFor="sound-enabled" className="text-sm text-gray-700">
                        啟用音效
                      </label>
                    </div>

                    {/* 音量 */}
                    {settings.soundEnabled && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          音量: {Math.round(settings.soundVolume * 100)}%
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={settings.soundVolume}
                          onChange={(e) => updateSetting('soundVolume', parseFloat(e.target.value))}
                          className="w-full"
                        />
                      </div>
                    )}

                    {/* 語音公告 */}
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="voice-announcements"
                        checked={settings.voiceAnnouncements}
                        onChange={(e) => updateSetting('voiceAnnouncements', e.target.checked)}
                        className="mr-2"
                      />
                      <label htmlFor="voice-announcements" className="text-sm text-gray-700">
                        啟用語音公告
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* 導航設定 */}
              {activeTab === 'navigation' && (
                <div role="tabpanel" id="navigation-panel" aria-labelledby="navigation-tab">
                  <h3 className="text-lg font-semibold mb-4">導航設定</h3>
                  
                  <div className="space-y-6">
                    {/* 鍵盤導航 */}
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="keyboard-navigation"
                        checked={settings.keyboardNavigation}
                        onChange={(e) => updateSetting('keyboardNavigation', e.target.checked)}
                        className="mr-2"
                      />
                      <label htmlFor="keyboard-navigation" className="text-sm text-gray-700">
                        啟用鍵盤導航
                      </label>
                    </div>

                    {/* 焦點指示器 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        焦點指示器
                      </label>
                      <select
                        value={settings.focusIndicator}
                        onChange={(e) => updateSetting('focusIndicator', e.target.value as any)}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                      >
                        <option value="default">預設</option>
                        <option value="enhanced">增強</option>
                        <option value="custom">自訂</option>
                      </select>
                    </div>

                    {/* 跳過連結 */}
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="skip-links"
                        checked={settings.skipLinks}
                        onChange={(e) => updateSetting('skipLinks', e.target.checked)}
                        className="mr-2"
                      />
                      <label htmlFor="skip-links" className="text-sm text-gray-700">
                        顯示跳過連結
                      </label>
                    </div>

                    {/* 螢幕閱讀器優化 */}
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="screen-reader-optimized"
                        checked={settings.screenReaderOptimized}
                        onChange={(e) => updateSetting('screenReaderOptimized', e.target.checked)}
                        className="mr-2"
                      />
                      <label htmlFor="screen-reader-optimized" className="text-sm text-gray-700">
                        螢幕閱讀器優化
                      </label>
                    </div>

                    {/* 詳細描述 */}
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="verbose-descriptions"
                        checked={settings.verboseDescriptions}
                        onChange={(e) => updateSetting('verboseDescriptions', e.target.checked)}
                        className="mr-2"
                      />
                      <label htmlFor="verbose-descriptions" className="text-sm text-gray-700">
                        詳細描述
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* 遊戲設定 */}
              {activeTab === 'game' && (
                <div role="tabpanel" id="game-panel" aria-labelledby="game-tab">
                  <h3 className="text-lg font-semibold mb-4">遊戲設定</h3>
                  
                  <div className="space-y-6">
                    {/* 遊戲速度 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        遊戲速度
                      </label>
                      <select
                        value={settings.gameSpeed}
                        onChange={(e) => updateSetting('gameSpeed', e.target.value as any)}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                      >
                        <option value="slow">慢速</option>
                        <option value="normal">標準</option>
                        <option value="fast">快速</option>
                      </select>
                    </div>

                    {/* 確認動作 */}
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="confirm-actions"
                        checked={settings.confirmActions}
                        onChange={(e) => updateSetting('confirmActions', e.target.checked)}
                        className="mr-2"
                      />
                      <label htmlFor="confirm-actions" className="text-sm text-gray-700">
                        重要動作需要確認
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* 合規檢查 */}
              {activeTab === 'compliance' && (
                <div role="tabpanel" id="compliance-panel" aria-labelledby="compliance-tab">
                  <h3 className="text-lg font-semibold mb-4">WCAG 合規檢查</h3>
                  
                  <div className="space-y-6">
                    {/* WCAG 等級 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        目標合規等級
                      </label>
                      <select
                        value={settings.wcagLevel}
                        onChange={(e) => updateSetting('wcagLevel', e.target.value as WCAGLevel)}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                      >
                        <option value={WCAGLevel.A}>WCAG 2.1 A</option>
                        <option value={WCAGLevel.AA}>WCAG 2.1 AA</option>
                        <option value={WCAGLevel.AAA}>WCAG 2.1 AAA</option>
                      </select>
                    </div>

                    {/* 運行檢查按鈕 */}
                    <button
                      onClick={runComplianceCheck}
                      disabled={isRunningCompliance}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isRunningCompliance ? '檢查中...' : '運行合規檢查'}
                    </button>

                    {/* 檢查結果 */}
                    {complianceReport && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">檢查結果</h4>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{complianceReport.score}</div>
                            <div className="text-sm text-gray-600">合規分數</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{complianceReport.passed}</div>
                            <div className="text-sm text-gray-600">通過項目</div>
                          </div>
                        </div>
                        <div className="text-sm">
                          <p>總檢查項目: {complianceReport.totalChecks}</p>
                          <p>失敗項目: {complianceReport.failed}</p>
                          <p>警告項目: {complianceReport.warnings}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 底部按鈕 */}
        <div className="flex justify-between items-center p-6 border-t bg-gray-50">
          <button
            onClick={resetSettings}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            重置為預設值
          </button>
          <div className="space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              取消
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              儲存設定
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
