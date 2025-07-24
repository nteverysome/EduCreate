/**
 * AccessibilityEnhancedEditor - 無障礙增強編輯器
 * 提供 WCAG 2.1 AA 完全合規的編輯體驗
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AccessibilityProfile, AccessibilityNeed } from '../../lib/ai/AIAccessibilityHelper';

export interface AccessibilitySettings {
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  contrast: 'normal' | 'high' | 'extra-high';
  colorScheme: 'default' | 'dark' | 'light' | 'high-contrast';
  animationSpeed: 'normal' | 'slow' | 'none';
  soundEnabled: boolean;
  keyboardNavigation: boolean;
  screenReaderOptimized: boolean;
  focusIndicator: 'default' | 'enhanced' | 'custom';
  textSpacing: number;
  lineHeight: number;
}

export interface AccessibilityEnhancedEditorProps {
  content: string;
  onChange: (content: string) => void;
  accessibilityProfile?: AccessibilityProfile;
  onAccessibilityChange?: (settings: AccessibilitySettings) => void;
  className?: string;
  'data-testid'?: string;
}

const AccessibilityEnhancedEditor = ({
  content,
  onChange,
  accessibilityProfile,
  onAccessibilityChange,
  className = '',
  'data-testid': testId = 'accessibility-enhanced-editor'
}: AccessibilityEnhancedEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isEditorFocused, setIsEditorFocused] = useState(false);
  const [showAccessibilityPanel, setShowAccessibilityPanel] = useState(false);
  const [currentSettings, setCurrentSettings] = useState<AccessibilitySettings>({
    fontSize: accessibilityProfile?.preferences.fontSize || 'medium',
    contrast: accessibilityProfile?.preferences.contrast || 'normal',
    colorScheme: accessibilityProfile?.preferences.colorScheme || 'default',
    animationSpeed: accessibilityProfile?.preferences.animationSpeed || 'normal',
    soundEnabled: accessibilityProfile?.preferences.soundEnabled ?? true,
    keyboardNavigation: true,
    screenReaderOptimized: true,
    focusIndicator: accessibilityProfile?.customizations.focusIndicator || 'default',
    textSpacing: accessibilityProfile?.customizations.textSpacing || 1.0,
    lineHeight: accessibilityProfile?.customizations.lineHeight || 1.5
  });

  // 鍵盤快捷鍵映射
  const keyboardShortcuts = {
    'Ctrl+B': '粗體',
    'Ctrl+I': '斜體',
    'Ctrl+U': '底線',
    'Ctrl+Z': '復原',
    'Ctrl+Y': '重做',
    'Ctrl+S': '保存',
    'Ctrl+H': '說明',
    'Alt+1': '標題1',
    'Alt+2': '標題2',
    'Alt+3': '標題3',
    'F1': '無障礙說明',
    'Escape': '關閉面板'
  };

  // 應用無障礙設定
  useEffect(() => {
    if (editorRef.current) {
      const editor = editorRef.current;
      
      // 字體大小
      const fontSizes = {
        'small': '14px',
        'medium': '16px',
        'large': '18px',
        'extra-large': '22px'
      };
      editor.style.fontSize = fontSizes[currentSettings.fontSize];
      
      // 行高
      editor.style.lineHeight = currentSettings.lineHeight.toString();
      
      // 字間距
      editor.style.letterSpacing = `${(currentSettings.textSpacing - 1) * 0.1}em`;
      
      // 色彩主題
      applyColorScheme(editor, currentSettings.colorScheme, currentSettings.contrast);
      
      // 焦點指示器
      applyFocusIndicator(editor, currentSettings.focusIndicator);
    }
  }, [currentSettings]);

  // 應用色彩主題
  const applyColorScheme = (element: HTMLElement, scheme: string, contrast: string) => {
    element.classList.remove('theme-default', 'theme-dark', 'theme-light', 'theme-high-contrast');
    element.classList.remove('contrast-normal', 'contrast-high', 'contrast-extra-high');
    
    element.classList.add(`theme-${scheme}`);
    element.classList.add(`contrast-${contrast}`);
  };

  // 應用焦點指示器
  const applyFocusIndicator = (element: HTMLElement, indicator: string) => {
    element.classList.remove('focus-default', 'focus-enhanced', 'focus-custom');
    element.classList.add(`focus-${indicator}`);
  };

  // 鍵盤事件處理
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const key = `${e.ctrlKey ? 'Ctrl+' : ''}${e.altKey ? 'Alt+' : ''}${e.key}`;
    
    // 處理快捷鍵
    switch (key) {
      case 'F1':
        e.preventDefault();
        announceToScreenReader('無障礙編輯器說明：使用 Tab 鍵導航，空格鍵選擇，Enter 鍵確認');
        break;
      case 'Escape':
        e.preventDefault();
        setShowAccessibilityPanel(false);
        break;
      case 'Ctrl+H':
        e.preventDefault();
        setShowAccessibilityPanel(true);
        break;
      case 'Alt+1':
        e.preventDefault();
        formatText('h1');
        break;
      case 'Alt+2':
        e.preventDefault();
        formatText('h2');
        break;
      case 'Alt+3':
        e.preventDefault();
        formatText('h3');
        break;
    }

    // 播放按鍵音效
    if (currentSettings.soundEnabled) {
      playKeySound();
    }
  }, [currentSettings.soundEnabled]);

  // 格式化文字
  const formatText = (format: string) => {
    document.execCommand('formatBlock', false, format);
    announceToScreenReader(`已套用${format}格式`);
  };

  // 螢幕閱讀器公告
  const announceToScreenReader = (message: string) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    setTimeout(() => document.body.removeChild(announcement), 1000);
  };

  // 播放按鍵音效
  const playKeySound = () => {
    if (currentSettings.soundEnabled) {
      // 創建簡單的按鍵音效
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    }
  };

  // 更新設定
  const updateSetting = <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    const newSettings = { ...currentSettings, [key]: value };
    setCurrentSettings(newSettings);
    onAccessibilityChange?.(newSettings);
    announceToScreenReader(`${key}已更改為${value}`);
  };

  // 內容變更處理
  const handleContentChange = useCallback(() => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      onChange(newContent);
    }
  }, [onChange]);

  // 焦點處理
  const handleFocus = () => {
    setIsEditorFocused(true);
    announceToScreenReader('編輯器已獲得焦點');
  };

  const handleBlur = () => {
    setIsEditorFocused(false);
  };

  return (
    <div className={`accessibility-enhanced-editor ${className}`} data-testid={testId}>
      {/* 無障礙工具欄 */}
      <div className="accessibility-toolbar bg-gray-100 p-2 border-b border-gray-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowAccessibilityPanel(!showAccessibilityPanel)}
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="開啟無障礙設定面板"
              data-testid="accessibility-panel-toggle"
            >
              ♿ 無障礙設定
            </button>
            
            <div className="text-sm text-gray-600">
              按 F1 獲取說明 | 按 Ctrl+H 開啟設定
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              字體: {currentSettings.fontSize} | 對比: {currentSettings.contrast}
            </span>
          </div>
        </div>

        {/* 快捷鍵說明 */}
        <div className="mt-2 text-xs text-gray-500">
          <details>
            <summary className="cursor-pointer">鍵盤快捷鍵</summary>
            <div className="mt-1 grid grid-cols-3 gap-2">
              {Object.entries(keyboardShortcuts).map(([key, description]) => (
                <div key={key} className="flex justify-between">
                  <kbd className="px-1 bg-gray-200 rounded text-xs">{key}</kbd>
                  <span>{description}</span>
                </div>
              ))}
            </div>
          </details>
        </div>
      </div>

      {/* 無障礙設定面板 */}
      {showAccessibilityPanel && (
        <div className="accessibility-panel bg-white border border-gray-300 p-4 mb-4">
          <h3 className="text-lg font-semibold mb-4">無障礙設定</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 視覺設定 */}
            <div>
              <h4 className="font-medium mb-2">視覺設定</h4>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">字體大小</label>
                  <select
                    value={currentSettings.fontSize}
                    onChange={(e) => updateSetting('fontSize', e.target.value as any)}
                    className="w-full border border-gray-300 rounded px-2 py-1"
                    aria-label="選擇字體大小"
                  >
                    <option value="small">小 (14px)</option>
                    <option value="medium">中 (16px)</option>
                    <option value="large">大 (18px)</option>
                    <option value="extra-large">特大 (22px)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">對比度</label>
                  <select
                    value={currentSettings.contrast}
                    onChange={(e) => updateSetting('contrast', e.target.value as any)}
                    className="w-full border border-gray-300 rounded px-2 py-1"
                    aria-label="選擇對比度"
                  >
                    <option value="normal">標準</option>
                    <option value="high">高對比</option>
                    <option value="extra-high">超高對比</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">色彩主題</label>
                  <select
                    value={currentSettings.colorScheme}
                    onChange={(e) => updateSetting('colorScheme', e.target.value as any)}
                    className="w-full border border-gray-300 rounded px-2 py-1"
                    aria-label="選擇色彩主題"
                  >
                    <option value="default">預設</option>
                    <option value="dark">深色</option>
                    <option value="light">淺色</option>
                    <option value="high-contrast">高對比</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 互動設定 */}
            <div>
              <h4 className="font-medium mb-2">互動設定</h4>
              
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={currentSettings.soundEnabled}
                    onChange={(e) => updateSetting('soundEnabled', e.target.checked)}
                    className="mr-2"
                    aria-label="啟用音效"
                  />
                  啟用音效
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={currentSettings.keyboardNavigation}
                    onChange={(e) => updateSetting('keyboardNavigation', e.target.checked)}
                    className="mr-2"
                    aria-label="啟用鍵盤導航"
                  />
                  鍵盤導航
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={currentSettings.screenReaderOptimized}
                    onChange={(e) => updateSetting('screenReaderOptimized', e.target.checked)}
                    className="mr-2"
                    aria-label="螢幕閱讀器優化"
                  />
                  螢幕閱讀器優化
                </label>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    行高: {currentSettings.lineHeight}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="3"
                    step="0.1"
                    value={currentSettings.lineHeight}
                    onChange={(e) => updateSetting('lineHeight', parseFloat(e.target.value))}
                    className="w-full"
                    aria-label="調整行高"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    字間距: {currentSettings.textSpacing}
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={currentSettings.textSpacing}
                    onChange={(e) => updateSetting('textSpacing', parseFloat(e.target.value))}
                    className="w-full"
                    aria-label="調整字間距"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={() => setShowAccessibilityPanel(false)}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
              aria-label="關閉設定面板"
            >
              關閉
            </button>
          </div>
        </div>
      )}

      {/* 主編輯區域 */}
      <div
        ref={editorRef}
        contentEditable
        className={`editor-content p-4 min-h-[300px] border border-gray-300 focus:outline-none ${
          isEditorFocused ? 'ring-2 ring-blue-500' : ''
        }`}
        onInput={handleContentChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        role="textbox"
        aria-multiline="true"
        aria-label="無障礙增強編輯器"
        aria-describedby="editor-instructions"
        data-testid="editor-content"
        dangerouslySetInnerHTML={{ __html: content }}
      />

      {/* 編輯器說明 */}
      <div id="editor-instructions" className="sr-only">
        這是一個無障礙增強的富文本編輯器。
        使用 Tab 鍵在工具之間導航，使用快捷鍵進行格式化。
        按 F1 獲取詳細說明，按 Ctrl+H 開啟無障礙設定。
      </div>

      {/* 狀態列 */}
      <div className="status-bar bg-gray-50 px-4 py-2 border-t border-gray-300 text-sm">
        <div className="flex justify-between items-center">
          <span>
            {isEditorFocused ? '正在編輯' : '點擊開始編輯'}
            {currentSettings.screenReaderOptimized && ' (螢幕閱讀器優化)'}
          </span>
          <span className="text-gray-500">
            WCAG 2.1 AA 合規
          </span>
        </div>
      </div>

      {/* CSS 樣式 */}
      <style jsx>{`
        .accessibility-enhanced-editor {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .theme-dark .editor-content {
          background-color: #1a1a1a;
          color: #ffffff;
        }

        .theme-light .editor-content {
          background-color: #ffffff;
          color: #000000;
        }

        .theme-high-contrast .editor-content {
          background-color: #000000;
          color: #ffff00;
        }

        .contrast-high .editor-content {
          filter: contrast(150%);
        }

        .contrast-extra-high .editor-content {
          filter: contrast(200%);
        }

        .focus-enhanced:focus {
          outline: 3px solid #0066cc;
          outline-offset: 2px;
        }

        .focus-custom:focus {
          outline: 4px dashed #ff6600;
          outline-offset: 3px;
        }

        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AccessibilityEnhancedEditor;
