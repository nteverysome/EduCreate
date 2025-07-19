/**
 * 鍵盤導航管理器
 * 提供完整的鍵盤導航支援，符合 WCAG 2.1 AA 標準
 */

// 鍵盤快捷鍵定義
export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
  action: string;
  description: string;
  category: 'navigation' | 'game' | 'accessibility' | 'general';
}

// 焦點管理選項
export interface FocusManagementOptions {
  trapFocus?: boolean;
  restoreFocus?: boolean;
  skipLinks?: boolean;
  announceChanges?: boolean;
  highlightFocus?: boolean;
}

// 導航區域
export interface NavigationRegion {
  id: string;
  name: string;
  element: HTMLElement;
  focusableElements: HTMLElement[];
  currentIndex: number;
  isActive: boolean;
}

// 鍵盤導航事件
export interface KeyboardNavigationEvent {
  type: 'focus_change' | 'shortcut_triggered' | 'region_change' | 'trap_activated';
  target: HTMLElement;
  region?: string;
  shortcut?: KeyboardShortcut;
  timestamp: number;
}

export class KeyboardNavigationManager {
  private shortcuts: Map<string, KeyboardShortcut> = new Map();
  private regions: Map<string, NavigationRegion> = new Map();
  private currentRegion: string | null = null;
  private focusHistory: HTMLElement[] = [];
  private isEnabled: boolean = true;
  private options: FocusManagementOptions = {};
  private listeners: Map<string, Function[]> = new Map();

  constructor(options: FocusManagementOptions = {}) {
    this.options = {
      trapFocus: false,
      restoreFocus: true,
      skipLinks: true,
      announceChanges: true,
      highlightFocus: true,
      ...options
    };

    this.initializeDefaultShortcuts();
    this.setupEventListeners();
    this.createSkipLinks();
  }

  /**
   * 初始化默認快捷鍵
   */
  private initializeDefaultShortcuts(): void {
    const defaultShortcuts: KeyboardShortcut[] = [
      // 導航快捷鍵
      {
        key: 'Tab',
        action: 'next_element',
        description: '移動到下一個可聚焦元素',
        category: 'navigation'
      },
      {
        key: 'Tab',
        shiftKey: true,
        action: 'previous_element',
        description: '移動到上一個可聚焦元素',
        category: 'navigation'
      },
      {
        key: 'Home',
        action: 'first_element',
        description: '移動到第一個元素',
        category: 'navigation'
      },
      {
        key: 'End',
        action: 'last_element',
        description: '移動到最後一個元素',
        category: 'navigation'
      },
      {
        key: 'ArrowUp',
        action: 'move_up',
        description: '向上移動',
        category: 'navigation'
      },
      {
        key: 'ArrowDown',
        action: 'move_down',
        description: '向下移動',
        category: 'navigation'
      },
      {
        key: 'ArrowLeft',
        action: 'move_left',
        description: '向左移動',
        category: 'navigation'
      },
      {
        key: 'ArrowRight',
        action: 'move_right',
        description: '向右移動',
        category: 'navigation'
      },
      // 遊戲快捷鍵
      {
        key: 'Enter',
        action: 'activate',
        description: '激活當前元素',
        category: 'game'
      },
      {
        key: ' ',
        action: 'select',
        description: '選擇當前項目',
        category: 'game'
      },
      {
        key: 'Escape',
        action: 'cancel',
        description: '取消或返回',
        category: 'game'
      },
      {
        key: 'h',
        action: 'hint',
        description: '獲取提示',
        category: 'game'
      },
      {
        key: 'p',
        action: 'pause',
        description: '暫停/恢復遊戲',
        category: 'game'
      },
      {
        key: 'r',
        action: 'restart',
        description: '重新開始遊戲',
        category: 'game'
      },
      // 無障礙快捷鍵
      {
        key: 'F1',
        action: 'help',
        description: '顯示幫助信息',
        category: 'accessibility'
      },
      {
        key: 'h',
        ctrlKey: true,
        action: 'accessibility_settings',
        description: '打開無障礙設定',
        category: 'accessibility'
      },
      {
        key: '=',
        ctrlKey: true,
        action: 'increase_font_size',
        description: '增大字體',
        category: 'accessibility'
      },
      {
        key: '-',
        ctrlKey: true,
        action: 'decrease_font_size',
        description: '減小字體',
        category: 'accessibility'
      },
      {
        key: '0',
        ctrlKey: true,
        action: 'reset_font_size',
        description: '重置字體大小',
        category: 'accessibility'
      }
    ];

    defaultShortcuts.forEach(shortcut => {
      this.registerShortcut(shortcut);
    });
  }

  /**
   * 設置事件監聽器
   */
  private setupEventListeners(): void {
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    document.addEventListener('focusin', this.handleFocusIn.bind(this));
    document.addEventListener('focusout', this.handleFocusOut.bind(this));
  }

  /**
   * 創建跳過連結
   */
  private createSkipLinks(): void {
    if (!this.options.skipLinks) return;

    const skipLinksContainer = document.createElement('div');
    skipLinksContainer.className = 'skip-links';
    skipLinksContainer.setAttribute('aria-label', '跳過連結');

    const skipLinks = [
      { href: '#main-content', text: '跳到主要內容' },
      { href: '#navigation', text: '跳到導航' },
      { href: '#game-area', text: '跳到遊戲區域' },
      { href: '#accessibility-settings', text: '跳到無障礙設定' }
    ];

    skipLinks.forEach(link => {
      const skipLink = document.createElement('a');
      skipLink.href = link.href;
      skipLink.textContent = link.text;
      skipLink.className = 'skip-link';
      skipLink.addEventListener('click', this.handleSkipLinkClick.bind(this));
      skipLinksContainer.appendChild(skipLink);
    });

    document.body.insertBefore(skipLinksContainer, document.body.firstChild);
  }

  /**
   * 處理鍵盤按下事件
   */
  private handleKeyDown(event: KeyboardEvent): void {
    if (!this.isEnabled) return;

    const shortcutKey = this.getShortcutKey(event);
    const shortcut = this.shortcuts.get(shortcutKey);

    if (shortcut) {
      event.preventDefault();
      this.executeShortcut(shortcut, event.target as HTMLElement);
    } else {
      // 處理方向鍵導航
      this.handleArrowKeyNavigation(event);
    }
  }

  /**
   * 處理方向鍵導航
   */
  private handleArrowKeyNavigation(event: KeyboardEvent): void {
    const currentRegion = this.getCurrentRegion();
    if (!currentRegion) return;

    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        this.moveFocusInRegion(currentRegion, 'up');
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.moveFocusInRegion(currentRegion, 'down');
        break;
      case 'ArrowLeft':
        event.preventDefault();
        this.moveFocusInRegion(currentRegion, 'left');
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.moveFocusInRegion(currentRegion, 'right');
        break;
    }
  }

  /**
   * 在區域內移動焦點
   */
  private moveFocusInRegion(region: NavigationRegion, direction: 'up' | 'down' | 'left' | 'right'): void {
    const elements = region.focusableElements;
    if (elements.length === 0) return;

    let newIndex = region.currentIndex;

    switch (direction) {
      case 'up':
      case 'left':
        newIndex = newIndex > 0 ? newIndex - 1 : elements.length - 1;
        break;
      case 'down':
      case 'right':
        newIndex = newIndex < elements.length - 1 ? newIndex + 1 : 0;
        break;
    }

    region.currentIndex = newIndex;
    this.focusElement(elements[newIndex]);
  }

  /**
   * 聚焦元素
   */
  private focusElement(element: HTMLElement): void {
    element.focus();
    
    if (this.options.highlightFocus) {
      this.highlightFocusedElement(element);
    }

    if (this.options.announceChanges) {
      this.announceFocusChange(element);
    }

    this.addToFocusHistory(element);
    this.emitEvent({
      type: 'focus_change',
      target: element,
      timestamp: Date.now()
    });
  }

  /**
   * 高亮聚焦元素
   */
  private highlightFocusedElement(element: HTMLElement): void {
    // 移除之前的高亮
    document.querySelectorAll('.keyboard-focus-highlight').forEach(el => {
      el.classList.remove('keyboard-focus-highlight');
    });

    // 添加高亮樣式
    element.classList.add('keyboard-focus-highlight');
  }

  /**
   * 公告焦點變化
   */
  private announceFocusChange(element: HTMLElement): void {
    const label = this.getElementLabel(element);
    const role = element.getAttribute('role') || element.tagName.toLowerCase();
    const announcement = `${label}, ${role}`;
    
    this.announceToScreenReader(announcement);
  }

  /**
   * 獲取元素標籤
   */
  private getElementLabel(element: HTMLElement): string {
    return element.getAttribute('aria-label') ||
           element.getAttribute('aria-labelledby') ||
           element.textContent ||
           element.getAttribute('title') ||
           element.getAttribute('alt') ||
           '未命名元素';
  }

  /**
   * 向螢幕閱讀器公告
   */
  private announceToScreenReader(message: string): void {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    setTimeout(() => {
      if (document.body.contains(announcement)) {
        document.body.removeChild(announcement);
      }
    }, 1000);
  }

  /**
   * 註冊快捷鍵
   */
  public registerShortcut(shortcut: KeyboardShortcut): void {
    const key = this.getShortcutKeyFromShortcut(shortcut);
    this.shortcuts.set(key, shortcut);
  }

  /**
   * 註冊導航區域
   */
  public registerRegion(region: NavigationRegion): void {
    this.regions.set(region.id, region);
    this.updateRegionFocusableElements(region.id);
  }

  /**
   * 更新區域可聚焦元素
   */
  public updateRegionFocusableElements(regionId: string): void {
    const region = this.regions.get(regionId);
    if (!region) return;

    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[role="button"]:not([disabled])',
      '[role="link"]',
      '[role="menuitem"]',
      '[role="option"]'
    ].join(', ');

    region.focusableElements = Array.from(
      region.element.querySelectorAll(focusableSelectors)
    ) as HTMLElement[];
  }

  /**
   * 激活區域
   */
  public activateRegion(regionId: string): void {
    const region = this.regions.get(regionId);
    if (!region) return;

    // 停用其他區域
    this.regions.forEach(r => r.isActive = false);
    
    // 激活目標區域
    region.isActive = true;
    this.currentRegion = regionId;
    
    // 聚焦第一個元素
    if (region.focusableElements.length > 0) {
      region.currentIndex = 0;
      this.focusElement(region.focusableElements[0]);
    }

    this.emitEvent({
      type: 'region_change',
      target: region.element,
      region: regionId,
      timestamp: Date.now()
    });
  }

  /**
   * 執行快捷鍵
   */
  private executeShortcut(shortcut: KeyboardShortcut, target: HTMLElement): void {
    this.emitEvent({
      type: 'shortcut_triggered',
      target,
      shortcut,
      timestamp: Date.now()
    });

    // 觸發快捷鍵動作事件
    this.emit(`shortcut:${shortcut.action}`, { shortcut, target });
  }

  /**
   * 處理焦點進入
   */
  private handleFocusIn(event: FocusEvent): void {
    const target = event.target as HTMLElement;
    this.addToFocusHistory(target);
    
    // 檢查是否在已註冊的區域內
    for (const [regionId, region] of this.regions) {
      if (region.element.contains(target)) {
        this.currentRegion = regionId;
        const index = region.focusableElements.indexOf(target);
        if (index !== -1) {
          region.currentIndex = index;
        }
        break;
      }
    }
  }

  /**
   * 處理焦點離開
   */
  private handleFocusOut(event: FocusEvent): void {
    // 焦點離開處理邏輯
  }

  /**
   * 處理跳過連結點擊
   */
  private handleSkipLinkClick(event: Event): void {
    event.preventDefault();
    const link = event.target as HTMLAnchorElement;
    const targetId = link.getAttribute('href')?.substring(1);
    
    if (targetId) {
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.focus();
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }

  /**
   * 輔助方法
   */
  private getShortcutKey(event: KeyboardEvent): string {
    const parts = [];
    if (event.ctrlKey) parts.push('Ctrl');
    if (event.altKey) parts.push('Alt');
    if (event.shiftKey) parts.push('Shift');
    if (event.metaKey) parts.push('Meta');
    parts.push(event.key);
    return parts.join('+');
  }

  private getShortcutKeyFromShortcut(shortcut: KeyboardShortcut): string {
    const parts = [];
    if (shortcut.ctrlKey) parts.push('Ctrl');
    if (shortcut.altKey) parts.push('Alt');
    if (shortcut.shiftKey) parts.push('Shift');
    if (shortcut.metaKey) parts.push('Meta');
    parts.push(shortcut.key);
    return parts.join('+');
  }

  private getCurrentRegion(): NavigationRegion | null {
    return this.currentRegion ? this.regions.get(this.currentRegion) || null : null;
  }

  private addToFocusHistory(element: HTMLElement): void {
    this.focusHistory.push(element);
    if (this.focusHistory.length > 10) {
      this.focusHistory.shift();
    }
  }

  private emitEvent(event: KeyboardNavigationEvent): void {
    this.emit('navigation_event', event);
  }

  /**
   * 事件發射器
   */
  public on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  public emit(event: string, data?: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  /**
   * 公共方法
   */
  public enable(): void {
    this.isEnabled = true;
  }

  public disable(): void {
    this.isEnabled = false;
  }

  public getShortcuts(): KeyboardShortcut[] {
    return Array.from(this.shortcuts.values());
  }

  public getRegions(): NavigationRegion[] {
    return Array.from(this.regions.values());
  }

  public restoreFocus(): void {
    if (this.options.restoreFocus && this.focusHistory.length > 0) {
      const lastFocused = this.focusHistory[this.focusHistory.length - 1];
      if (document.contains(lastFocused)) {
        lastFocused.focus();
      }
    }
  }

  public destroy(): void {
    document.removeEventListener('keydown', this.handleKeyDown.bind(this));
    document.removeEventListener('focusin', this.handleFocusIn.bind(this));
    document.removeEventListener('focusout', this.handleFocusOut.bind(this));
    
    // 清理跳過連結
    const skipLinks = document.querySelector('.skip-links');
    if (skipLinks) {
      skipLinks.remove();
    }
    
    this.shortcuts.clear();
    this.regions.clear();
    this.listeners.clear();
  }
}
