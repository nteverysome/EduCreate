import { useEffect, useCallback } from 'react';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: () => void;
  description: string;
}

interface UseKeyboardShortcutsProps {
  shortcuts: KeyboardShortcut[];
  enabled?: boolean;
}

export const useKeyboardShortcuts = ({ shortcuts, enabled = true }: UseKeyboardShortcutsProps) => {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    // 忽略在輸入框中的按鍵
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
      return;
    }

    const matchingShortcut = shortcuts.find(shortcut => {
      return (
        shortcut.key.toLowerCase() === event.key.toLowerCase() &&
        !!shortcut.ctrlKey === event.ctrlKey &&
        !!shortcut.shiftKey === event.shiftKey &&
        !!shortcut.altKey === event.altKey
      );
    });

    if (matchingShortcut) {
      event.preventDefault();
      matchingShortcut.action();
    }
  }, [shortcuts, enabled]);

  useEffect(() => {
    if (enabled) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown, enabled]);

  return shortcuts;
};

// 預定義的快捷鍵組合
export const commonShortcuts = {
  // 導航快捷鍵
  goHome: { key: 'h', ctrlKey: true, description: 'Ctrl+H: 返回首頁' },
  goBack: { key: 'ArrowLeft', altKey: true, description: 'Alt+←: 返回上一頁' },
  goForward: { key: 'ArrowRight', altKey: true, description: 'Alt+→: 前往下一頁' },
  
  // 編輯快捷鍵
  save: { key: 's', ctrlKey: true, description: 'Ctrl+S: 保存' },
  undo: { key: 'z', ctrlKey: true, description: 'Ctrl+Z: 撤銷' },
  redo: { key: 'y', ctrlKey: true, description: 'Ctrl+Y: 重做' },
  copy: { key: 'c', ctrlKey: true, description: 'Ctrl+C: 複製' },
  paste: { key: 'v', ctrlKey: true, description: 'Ctrl+V: 貼上' },
  
  // 遊戲快捷鍵
  startGame: { key: 'Enter', description: 'Enter: 開始遊戲' },
  pauseGame: { key: ' ', description: 'Space: 暫停/繼續' },
  nextQuestion: { key: 'ArrowRight', description: '→: 下一題' },
  prevQuestion: { key: 'ArrowLeft', description: '←: 上一題' },
  
  // 選項快捷鍵
  selectA: { key: '1', description: '1: 選擇選項A' },
  selectB: { key: '2', description: '2: 選擇選項B' },
  selectC: { key: '3', description: '3: 選擇選項C' },
  selectD: { key: '4', description: '4: 選擇選項D' },
  
  // 功能快捷鍵
  search: { key: 'f', ctrlKey: true, description: 'Ctrl+F: 搜索' },
  help: { key: '?', description: '?: 顯示幫助' },
  settings: { key: ',', ctrlKey: true, description: 'Ctrl+,: 設置' },
  fullscreen: { key: 'F11', description: 'F11: 全屏模式' },
  
  // 開發者快捷鍵
  devTools: { key: 'F12', description: 'F12: 開發者工具' },
  refresh: { key: 'F5', description: 'F5: 刷新頁面' },
  forceRefresh: { key: 'F5', ctrlKey: true, description: 'Ctrl+F5: 強制刷新' }
};

// 快捷鍵幫助組件
export const KeyboardShortcutsHelp = ({ shortcuts }: { shortcuts: KeyboardShortcut[] }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md">
      <h3 className="text-lg font-bold text-gray-900 mb-4">⌨️ 快捷鍵</h3>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {shortcuts.map((shortcut, index) => (
          <div key={index} className="flex justify-between items-center text-sm">
            <span className="text-gray-600">{shortcut.description.split(':')[1]?.trim()}</span>
            <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">
              {shortcut.description.split(':')[0]}
            </kbd>
          </div>
        ))}
      </div>
    </div>
  );
};

// 快捷鍵提示組件
export const ShortcutHint = ({ shortcut, className = '' }: { shortcut: string; className?: string }) => {
  return (
    <span className={`text-xs text-gray-500 ml-2 ${className}`}>
      ({shortcut})
    </span>
  );
};

// 遊戲專用快捷鍵 Hook
export const useGameShortcuts = (gameActions: {
  onStart?: () => void;
  onPause?: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  onSelectOption?: (index: number) => void;
  onHelp?: () => void;
}) => {
  const shortcuts: KeyboardShortcut[] = [
    ...(gameActions.onStart ? [{ ...commonShortcuts.startGame, action: gameActions.onStart }] : []),
    ...(gameActions.onPause ? [{ ...commonShortcuts.pauseGame, action: gameActions.onPause }] : []),
    ...(gameActions.onNext ? [{ ...commonShortcuts.nextQuestion, action: gameActions.onNext }] : []),
    ...(gameActions.onPrev ? [{ ...commonShortcuts.prevQuestion, action: gameActions.onPrev }] : []),
    ...(gameActions.onSelectOption ? [
      { ...commonShortcuts.selectA, action: () => gameActions.onSelectOption!(0) },
      { ...commonShortcuts.selectB, action: () => gameActions.onSelectOption!(1) },
      { ...commonShortcuts.selectC, action: () => gameActions.onSelectOption!(2) },
      { ...commonShortcuts.selectD, action: () => gameActions.onSelectOption!(3) }
    ] : []),
    ...(gameActions.onHelp ? [{ ...commonShortcuts.help, action: gameActions.onHelp }] : [])
  ];

  return useKeyboardShortcuts({ shortcuts });
};

// 編輯器專用快捷鍵 Hook
export const useEditorShortcuts = (editorActions: {
  onSave?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onCopy?: () => void;
  onPaste?: () => void;
  onSearch?: () => void;
}) => {
  const shortcuts: KeyboardShortcut[] = [
    ...(editorActions.onSave ? [{ ...commonShortcuts.save, action: editorActions.onSave }] : []),
    ...(editorActions.onUndo ? [{ ...commonShortcuts.undo, action: editorActions.onUndo }] : []),
    ...(editorActions.onRedo ? [{ ...commonShortcuts.redo, action: editorActions.onRedo }] : []),
    ...(editorActions.onCopy ? [{ ...commonShortcuts.copy, action: editorActions.onCopy }] : []),
    ...(editorActions.onPaste ? [{ ...commonShortcuts.paste, action: editorActions.onPaste }] : []),
    ...(editorActions.onSearch ? [{ ...commonShortcuts.search, action: editorActions.onSearch }] : [])
  ];

  return useKeyboardShortcuts({ shortcuts });
};

// 導航專用快捷鍵 Hook
export const useNavigationShortcuts = (navigationActions: {
  onGoHome?: () => void;
  onGoBack?: () => void;
  onGoForward?: () => void;
  onHelp?: () => void;
}) => {
  const shortcuts: KeyboardShortcut[] = [
    ...(navigationActions.onGoHome ? [{ ...commonShortcuts.goHome, action: navigationActions.onGoHome }] : []),
    ...(navigationActions.onGoBack ? [{ ...commonShortcuts.goBack, action: navigationActions.onGoBack }] : []),
    ...(navigationActions.onGoForward ? [{ ...commonShortcuts.goForward, action: navigationActions.onGoForward }] : []),
    ...(navigationActions.onHelp ? [{ ...commonShortcuts.help, action: navigationActions.onHelp }] : [])
  ];

  return useKeyboardShortcuts({ shortcuts });
};

// 無障礙支持 Hook
export const useAccessibility = () => {
  useEffect(() => {
    // 檢測用戶是否使用鍵盤導航
    const handleFirstTab = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        document.body.classList.add('user-is-tabbing');
        window.removeEventListener('keydown', handleFirstTab);
      }
    };

    const handleMouseDownOnce = () => {
      document.body.classList.remove('user-is-tabbing');
      window.removeEventListener('mousedown', handleMouseDownOnce);
      window.addEventListener('keydown', handleFirstTab);
    };

    window.addEventListener('keydown', handleFirstTab);
    window.addEventListener('mousedown', handleMouseDownOnce);

    return () => {
      window.removeEventListener('keydown', handleFirstTab);
      window.removeEventListener('mousedown', handleMouseDownOnce);
    };
  }, []);

  // 焦點管理
  const focusElement = useCallback((selector: string) => {
    const element = document.querySelector(selector) as HTMLElement;
    if (element) {
      element.focus();
    }
  }, []);

  // 跳過導航鏈接
  const addSkipLink = useCallback(() => {
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = '跳到主要內容';
    skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 bg-blue-600 text-white p-2 z-50';
    document.body.insertBefore(skipLink, document.body.firstChild);
  }, []);

  return { focusElement, addSkipLink };
};
