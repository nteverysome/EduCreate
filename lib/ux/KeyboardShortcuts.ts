/**
 * 鍵盤快捷鍵管理器
 * 提供全局快捷鍵支持，提升用戶操作效率
 */

export interface ShortcutAction {
  id: string;
  name: string;
  description: string;
  keys: string[];
  category: 'navigation' | 'editing' | 'game' | 'general';
  handler: () => void;
  enabled: boolean;
  context?: string; // 限制在特定上下文中生效
}

export interface ShortcutCategory {
  id: string;
  name: string;
  icon: string;
  shortcuts: ShortcutAction[];
}

export class KeyboardShortcuts {
  private static shortcuts: Map<string, ShortcutAction> = new Map();
  private static listeners: Map<string, (e: KeyboardEvent) => void> = new Map();
  private static isEnabled = true;
  private static currentContext = '';

  // 初始化快捷鍵
  static initialize() {
    this.registerDefaultShortcuts();
    this.attachGlobalListener();
  }

  // 註冊快捷鍵
  static register(shortcut: ShortcutAction): void {
    const key = this.generateKey(shortcut.keys);
    this.shortcuts.set(key, shortcut);
  }

  // 註冊多個快捷鍵
  static registerMultiple(shortcuts: ShortcutAction[]): void {
    shortcuts.forEach(shortcut => this.register(shortcut));
  }

  // 移除快捷鍵
  static unregister(keys: string[]): void {
    const key = this.generateKey(keys);
    this.shortcuts.delete(key);
  }

  // 設置當前上下文
  static setContext(context: string): void {
    this.currentContext = context;
  }

  // 啟用/禁用快捷鍵
  static setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  // 獲取所有快捷鍵（按類別分組）
  static getShortcutsByCategory(): ShortcutCategory[] {
    const categories: Record<string, ShortcutAction[]> = {
      navigation: [],
      editing: [],
      game: [],
      general: []
    };

    this.shortcuts.forEach(shortcut => {
      if (categories[shortcut.category]) {
        categories[shortcut.category].push(shortcut);
      }
    });

    return [
      {
        id: 'navigation',
        name: '導航',
        icon: '🧭',
        shortcuts: categories.navigation
      },
      {
        id: 'editing',
        name: '編輯',
        icon: '✏️',
        shortcuts: categories.editing
      },
      {
        id: 'game',
        name: '遊戲',
        icon: '🎮',
        shortcuts: categories.game
      },
      {
        id: 'general',
        name: '通用',
        icon: '⚙️',
        shortcuts: categories.general
      }
    ];
  }

  // 檢查快捷鍵是否可用
  static isShortcutAvailable(keys: string[]): boolean {
    const key = this.generateKey(keys);
    return !this.shortcuts.has(key);
  }

  // 格式化快捷鍵顯示
  static formatKeys(keys: string[]): string {
    return keys
      .map(key => {
        switch (key.toLowerCase()) {
          case 'ctrl':
          case 'control':
            return navigator.platform.includes('Mac') ? '⌘' : 'Ctrl';
          case 'alt':
            return navigator.platform.includes('Mac') ? '⌥' : 'Alt';
          case 'shift':
            return '⇧';
          case 'enter':
            return '↵';
          case 'escape':
            return 'Esc';
          case 'backspace':
            return '⌫';
          case 'delete':
            return '⌦';
          case 'tab':
            return '⇥';
          case 'space':
            return '␣';
          case 'arrowup':
            return '↑';
          case 'arrowdown':
            return '↓';
          case 'arrowleft':
            return '←';
          case 'arrowright':
            return '→';
          default:
            return key.toUpperCase();
        }
      })
      .join(' + ');
  }

  // 註冊默認快捷鍵
  private static registerDefaultShortcuts(): void {
    const defaultShortcuts: ShortcutAction[] = [
      // 導航快捷鍵
      {
        id: 'go-home',
        name: '回到首頁',
        description: '快速返回首頁',
        keys: ['ctrl', 'h'],
        category: 'navigation',
        handler: () => window.location.href = '/',
        enabled: true
      },
      {
        id: 'go-activities',
        name: '我的活動',
        description: '打開活動管理頁面',
        keys: ['ctrl', 'a'],
        category: 'navigation',
        handler: () => window.location.href = '/activities',
        enabled: true
      },
      {
        id: 'search',
        name: '搜索',
        description: '打開搜索框',
        keys: ['ctrl', 'k'],
        category: 'navigation',
        handler: () => this.focusSearchBox(),
        enabled: true
      },
      {
        id: 'help',
        name: '幫助',
        description: '打開幫助文檔',
        keys: ['f1'],
        category: 'navigation',
        handler: () => window.open('/help', '_blank'),
        enabled: true
      },

      // 編輯快捷鍵
      {
        id: 'save',
        name: '保存',
        description: '保存當前內容',
        keys: ['ctrl', 's'],
        category: 'editing',
        handler: () => this.triggerSave(),
        enabled: true,
        context: 'editor'
      },
      {
        id: 'new-activity',
        name: '新建活動',
        description: '創建新的活動',
        keys: ['ctrl', 'n'],
        category: 'editing',
        handler: () => this.createNewActivity(),
        enabled: true
      },
      {
        id: 'duplicate',
        name: '複製活動',
        description: '複製當前活動',
        keys: ['ctrl', 'd'],
        category: 'editing',
        handler: () => this.duplicateActivity(),
        enabled: true,
        context: 'editor'
      },
      {
        id: 'preview',
        name: '預覽',
        description: '預覽活動效果',
        keys: ['ctrl', 'p'],
        category: 'editing',
        handler: () => this.previewActivity(),
        enabled: true,
        context: 'editor'
      },
      {
        id: 'add-item',
        name: '添加項目',
        description: '添加新的內容項目',
        keys: ['ctrl', 'enter'],
        category: 'editing',
        handler: () => this.addContentItem(),
        enabled: true,
        context: 'editor'
      },

      // 遊戲快捷鍵
      {
        id: 'start-game',
        name: '開始遊戲',
        description: '開始或重新開始遊戲',
        keys: ['space'],
        category: 'game',
        handler: () => this.startGame(),
        enabled: true,
        context: 'game'
      },
      {
        id: 'pause-game',
        name: '暫停遊戲',
        description: '暫停或繼續遊戲',
        keys: ['p'],
        category: 'game',
        handler: () => this.pauseGame(),
        enabled: true,
        context: 'game'
      },
      {
        id: 'next-question',
        name: '下一題',
        description: '跳到下一個問題',
        keys: ['arrowright'],
        category: 'game',
        handler: () => this.nextQuestion(),
        enabled: true,
        context: 'game'
      },
      {
        id: 'prev-question',
        name: '上一題',
        description: '回到上一個問題',
        keys: ['arrowleft'],
        category: 'game',
        handler: () => this.prevQuestion(),
        enabled: true,
        context: 'game'
      },
      {
        id: 'submit-answer',
        name: '提交答案',
        description: '提交當前答案',
        keys: ['enter'],
        category: 'game',
        handler: () => this.submitAnswer(),
        enabled: true,
        context: 'game'
      },

      // 通用快捷鍵
      {
        id: 'toggle-fullscreen',
        name: '全屏切換',
        description: '進入或退出全屏模式',
        keys: ['f11'],
        category: 'general',
        handler: () => this.toggleFullscreen(),
        enabled: true
      },
      {
        id: 'toggle-theme',
        name: '切換主題',
        description: '在明暗主題間切換',
        keys: ['ctrl', 'shift', 't'],
        category: 'general',
        handler: () => this.toggleTheme(),
        enabled: true
      },
      {
        id: 'show-shortcuts',
        name: '顯示快捷鍵',
        description: '顯示所有可用快捷鍵',
        keys: ['ctrl', 'shift', '?'],
        category: 'general',
        handler: () => this.showShortcutsDialog(),
        enabled: true
      },
      {
        id: 'close-dialog',
        name: '關閉對話框',
        description: '關閉當前打開的對話框',
        keys: ['escape'],
        category: 'general',
        handler: () => this.closeDialog(),
        enabled: true
      }
    ];

    this.registerMultiple(defaultShortcuts);
  }

  // 附加全局監聽器
  private static attachGlobalListener(): void {
    document.addEventListener('keydown', (e) => {
      if (!this.isEnabled) return;

      // 檢查是否在輸入框中
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        // 只允許特定快捷鍵在輸入框中工作
        const allowedInInput = ['ctrl+s', 'ctrl+z', 'ctrl+y', 'escape'];
        const currentKey = this.generateKeyFromEvent(e);
        if (!allowedInInput.includes(currentKey)) {
          return;
        }
      }

      const key = this.generateKeyFromEvent(e);
      const shortcut = this.shortcuts.get(key);

      if (shortcut && shortcut.enabled) {
        // 檢查上下文
        if (shortcut.context && shortcut.context !== this.currentContext) {
          return;
        }

        e.preventDefault();
        e.stopPropagation();
        shortcut.handler();
      }
    });
  }

  // 生成快捷鍵標識
  private static generateKey(keys: string[]): string {
    return keys.map(k => k.toLowerCase()).sort().join('+');
  }

  // 從事件生成快捷鍵標識
  private static generateKeyFromEvent(e: KeyboardEvent): string {
    const keys: string[] = [];
    
    if (e.ctrlKey || e.metaKey) keys.push('ctrl');
    if (e.altKey) keys.push('alt');
    if (e.shiftKey) keys.push('shift');
    
    const key = e.key.toLowerCase();
    if (key !== 'control' && key !== 'alt' && key !== 'shift' && key !== 'meta') {
      keys.push(key);
    }
    
    return this.generateKey(keys);
  }

  // 快捷鍵處理函數
  private static focusSearchBox(): void {
    const searchBox = document.querySelector('input[type="search"], input[placeholder*="搜索"], input[placeholder*="search"]') as HTMLInputElement;
    if (searchBox) {
      searchBox.focus();
      searchBox.select();
    }
  }

  private static triggerSave(): void {
    const saveButton = document.querySelector('[data-action="save"], button[title*="保存"]') as HTMLButtonElement;
    if (saveButton) {
      saveButton.click();
    } else {
      // 觸發自定義保存事件
      window.dispatchEvent(new CustomEvent('shortcut:save'));
    }
  }

  private static createNewActivity(): void {
    const newButton = document.querySelector('[data-action="new"], button[title*="新建"]') as HTMLButtonElement;
    if (newButton) {
      newButton.click();
    } else {
      window.dispatchEvent(new CustomEvent('shortcut:new'));
    }
  }

  private static duplicateActivity(): void {
    window.dispatchEvent(new CustomEvent('shortcut:duplicate'));
  }

  private static previewActivity(): void {
    window.dispatchEvent(new CustomEvent('shortcut:preview'));
  }

  private static addContentItem(): void {
    window.dispatchEvent(new CustomEvent('shortcut:add-item'));
  }

  private static startGame(): void {
    window.dispatchEvent(new CustomEvent('shortcut:start-game'));
  }

  private static pauseGame(): void {
    window.dispatchEvent(new CustomEvent('shortcut:pause-game'));
  }

  private static nextQuestion(): void {
    window.dispatchEvent(new CustomEvent('shortcut:next-question'));
  }

  private static prevQuestion(): void {
    window.dispatchEvent(new CustomEvent('shortcut:prev-question'));
  }

  private static submitAnswer(): void {
    window.dispatchEvent(new CustomEvent('shortcut:submit-answer'));
  }

  private static toggleFullscreen(): void {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  }

  private static toggleTheme(): void {
    window.dispatchEvent(new CustomEvent('shortcut:toggle-theme'));
  }

  private static showShortcutsDialog(): void {
    window.dispatchEvent(new CustomEvent('shortcut:show-help'));
  }

  private static closeDialog(): void {
    // 查找並關閉打開的對話框
    const closeButtons = document.querySelectorAll('[data-action="close"], button[title*="關閉"], .modal button[aria-label="Close"]');
    const lastCloseButton = closeButtons[closeButtons.length - 1] as HTMLButtonElement;
    if (lastCloseButton) {
      lastCloseButton.click();
    } else {
      window.dispatchEvent(new CustomEvent('shortcut:close-dialog'));
    }
  }

  // 清理
  static destroy(): void {
    this.shortcuts.clear();
    this.listeners.clear();
  }
}
