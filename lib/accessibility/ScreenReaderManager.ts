/**
 * 螢幕閱讀器管理器
 * 提供完整的螢幕閱讀器支援，符合 WCAG 2.1 AA 標準
 */

// ARIA 角色定義
export type AriaRole = 
  | 'button' | 'link' | 'menuitem' | 'option' | 'tab' | 'tabpanel'
  | 'dialog' | 'alertdialog' | 'alert' | 'status' | 'log' | 'marquee'
  | 'timer' | 'progressbar' | 'slider' | 'spinbutton' | 'textbox'
  | 'combobox' | 'listbox' | 'grid' | 'gridcell' | 'row' | 'columnheader'
  | 'rowheader' | 'tree' | 'treeitem' | 'group' | 'region' | 'main'
  | 'navigation' | 'banner' | 'contentinfo' | 'complementary' | 'search';

// ARIA 屬性
export interface AriaAttributes {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-selected'?: boolean;
  'aria-checked'?: boolean | 'mixed';
  'aria-disabled'?: boolean;
  'aria-hidden'?: boolean;
  'aria-live'?: 'off' | 'polite' | 'assertive';
  'aria-atomic'?: boolean;
  'aria-relevant'?: string;
  'aria-busy'?: boolean;
  'aria-current'?: boolean | 'page' | 'step' | 'location' | 'date' | 'time';
  'aria-level'?: number;
  'aria-setsize'?: number;
  'aria-posinset'?: number;
  'aria-controls'?: string;
  'aria-owns'?: string;
  'aria-flowto'?: string;
  'aria-activedescendant'?: string;
  'aria-valuemin'?: number;
  'aria-valuemax'?: number;
  'aria-valuenow'?: number;
  'aria-valuetext'?: string;
}

// 公告類型
export enum AnnouncementType {
  POLITE = 'polite',
  ASSERTIVE = 'assertive',
  STATUS = 'status',
  ALERT = 'alert'
}

// 公告選項
export interface AnnouncementOptions {
  type: AnnouncementType;
  delay?: number;
  atomic?: boolean;
  relevant?: string;
  clearPrevious?: boolean;
}

// 元素描述
export interface ElementDescription {
  element: HTMLElement;
  role: AriaRole;
  label: string;
  description?: string;
  state?: string;
  properties?: string[];
}

// 螢幕閱讀器事件
export interface ScreenReaderEvent {
  type: 'announcement' | 'focus_change' | 'state_change' | 'content_change';
  element?: HTMLElement;
  message: string;
  announcementType?: AnnouncementType;
  timestamp: number;
}

export class ScreenReaderManager {
  private liveRegions: Map<AnnouncementType, HTMLElement> = new Map();
  private announcementQueue: Array<{ message: string; options: AnnouncementOptions }> = [];
  private isProcessingQueue: boolean = false;
  private listeners: Map<string, Function[]> = new Map();
  private elementDescriptions: Map<HTMLElement, ElementDescription> = new Map();

  constructor() {
    this.createLiveRegions();
    this.setupMutationObserver();
  }

  /**
   * 創建 ARIA live regions
   */
  private createLiveRegions(): void {
    const liveRegionTypes = [
      { type: AnnouncementType.POLITE, id: 'sr-live-polite' },
      { type: AnnouncementType.ASSERTIVE, id: 'sr-live-assertive' },
      { type: AnnouncementType.STATUS, id: 'sr-live-status' },
      { type: AnnouncementType.ALERT, id: 'sr-live-alert' }
    ];

    liveRegionTypes.forEach(({ type, id }) => {
      let region = document.getElementById(id) as HTMLElement;
      
      if (!region) {
        region = document.createElement('div');
        region.id = id;
        region.className = 'sr-only';
        region.setAttribute('aria-live', type === AnnouncementType.ALERT ? 'assertive' : type);
        region.setAttribute('aria-atomic', 'true');
        region.setAttribute('aria-relevant', 'additions text');
        document.body.appendChild(region);
      }
      
      this.liveRegions.set(type, region);
    });
  }

  /**
   * 設置變化觀察器
   */
  private setupMutationObserver(): void {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              this.processNewElement(node as HTMLElement);
            }
          });
        } else if (mutation.type === 'attributes') {
          this.processAttributeChange(mutation.target as HTMLElement, mutation.attributeName!);
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['aria-expanded', 'aria-selected', 'aria-checked', 'aria-disabled']
    });
  }

  /**
   * 處理新元素
   */
  private processNewElement(element: HTMLElement): void {
    // 自動添加 ARIA 標籤
    this.enhanceElementAccessibility(element);
    
    // 遞歸處理子元素
    element.querySelectorAll('*').forEach((child) => {
      this.enhanceElementAccessibility(child as HTMLElement);
    });
  }

  /**
   * 處理屬性變化
   */
  private processAttributeChange(element: HTMLElement, attributeName: string): void {
    if (attributeName.startsWith('aria-')) {
      const description = this.generateElementDescription(element);
      this.announceStateChange(element, description);
    }
  }

  /**
   * 增強元素無障礙性
   */
  public enhanceElementAccessibility(element: HTMLElement): void {
    const tagName = element.tagName.toLowerCase();
    const role = element.getAttribute('role');
    
    // 自動添加角色
    if (!role) {
      const autoRole = this.getAutoRole(element);
      if (autoRole) {
        element.setAttribute('role', autoRole);
      }
    }

    // 自動添加標籤
    if (!this.hasAccessibleName(element)) {
      const autoLabel = this.generateAutoLabel(element);
      if (autoLabel) {
        element.setAttribute('aria-label', autoLabel);
      }
    }

    // 添加鍵盤支援
    if (this.isInteractiveElement(element) && !element.hasAttribute('tabindex')) {
      element.setAttribute('tabindex', '0');
    }

    // 生成元素描述
    const description = this.generateElementDescription(element);
    this.elementDescriptions.set(element, description);
  }

  /**
   * 獲取自動角色
   */
  private getAutoRole(element: HTMLElement): AriaRole | null {
    const tagName = element.tagName.toLowerCase();
    const type = element.getAttribute('type');
    
    switch (tagName) {
      case 'button':
        return 'button';
      case 'a':
        return element.hasAttribute('href') ? 'link' : null;
      case 'input':
        switch (type) {
          case 'button':
          case 'submit':
          case 'reset':
            return 'button';
          case 'checkbox':
          case 'radio':
            return null; // 使用原生語義
          default:
            return 'textbox';
        }
      case 'select':
        return 'combobox';
      case 'textarea':
        return 'textbox';
      case 'main':
        return 'main';
      case 'nav':
        return 'navigation';
      case 'header':
        return 'banner';
      case 'footer':
        return 'contentinfo';
      case 'aside':
        return 'complementary';
      default:
        // 基於類名或數據屬性推斷
        if (element.classList.contains('game-item') || element.dataset.gameItem) {
          return 'button';
        }
        if (element.classList.contains('dialog') || element.dataset.dialog) {
          return 'dialog';
        }
        return null;
    }
  }

  /**
   * 檢查是否有可訪問名稱
   */
  private hasAccessibleName(element: HTMLElement): boolean {
    return !!(
      element.getAttribute('aria-label') ||
      element.getAttribute('aria-labelledby') ||
      element.textContent?.trim() ||
      element.getAttribute('title') ||
      element.getAttribute('alt')
    );
  }

  /**
   * 生成自動標籤
   */
  private generateAutoLabel(element: HTMLElement): string | null {
    const tagName = element.tagName.toLowerCase();
    const type = element.getAttribute('type');
    const className = element.className;
    
    // 基於內容生成標籤
    const textContent = element.textContent?.trim();
    if (textContent && textContent.length < 100) {
      return textContent;
    }

    // 基於屬性生成標籤
    const title = element.getAttribute('title');
    if (title) return title;

    const alt = element.getAttribute('alt');
    if (alt) return alt;

    // 基於類名生成標籤
    if (className.includes('game-item')) {
      return '遊戲項目';
    }
    if (className.includes('hint-button')) {
      return '提示按鈕';
    }
    if (className.includes('pause-button')) {
      return '暫停按鈕';
    }

    // 基於標籤名生成標籤
    switch (tagName) {
      case 'button':
        return '按鈕';
      case 'input':
        switch (type) {
          case 'submit':
            return '提交按鈕';
          case 'reset':
            return '重置按鈕';
          case 'search':
            return '搜索框';
          default:
            return '輸入框';
        }
      case 'select':
        return '下拉選單';
      case 'textarea':
        return '文本區域';
      default:
        return null;
    }
  }

  /**
   * 檢查是否為互動元素
   */
  private isInteractiveElement(element: HTMLElement): boolean {
    const tagName = element.tagName.toLowerCase();
    const role = element.getAttribute('role');
    
    const interactiveTags = ['button', 'a', 'input', 'select', 'textarea'];
    const interactiveRoles = ['button', 'link', 'menuitem', 'option', 'tab'];
    
    return interactiveTags.includes(tagName) || 
           (role && interactiveRoles.includes(role)) ||
           element.hasAttribute('onclick') ||
           element.classList.contains('clickable') ||
           element.dataset.clickable !== undefined;
  }

  /**
   * 生成元素描述
   */
  private generateElementDescription(element: HTMLElement): ElementDescription {
    const role = (element.getAttribute('role') || this.getAutoRole(element) || 'generic') as AriaRole;
    const label = this.getElementLabel(element);
    const description = element.getAttribute('aria-describedby') ? 
      this.getDescriptionFromId(element.getAttribute('aria-describedby')!) : undefined;
    
    const state = this.getElementState(element);
    const properties = this.getElementProperties(element);

    return {
      element,
      role,
      label,
      description,
      state,
      properties
    };
  }

  /**
   * 獲取元素標籤
   */
  private getElementLabel(element: HTMLElement): string {
    return element.getAttribute('aria-label') ||
           this.getTextFromId(element.getAttribute('aria-labelledby')) ||
           element.textContent?.trim() ||
           element.getAttribute('title') ||
           element.getAttribute('alt') ||
           this.generateAutoLabel(element) ||
           '未命名元素';
  }

  /**
   * 獲取元素狀態
   */
  private getElementState(element: HTMLElement): string {
    const states = [];
    
    if (element.getAttribute('aria-expanded') === 'true') {
      states.push('已展開');
    } else if (element.getAttribute('aria-expanded') === 'false') {
      states.push('已收合');
    }
    
    if (element.getAttribute('aria-selected') === 'true') {
      states.push('已選擇');
    }
    
    if (element.getAttribute('aria-checked') === 'true') {
      states.push('已勾選');
    } else if (element.getAttribute('aria-checked') === 'false') {
      states.push('未勾選');
    }
    
    if (element.getAttribute('aria-disabled') === 'true' || element.hasAttribute('disabled')) {
      states.push('已停用');
    }
    
    if (element.getAttribute('aria-current')) {
      states.push('當前項目');
    }

    return states.join(', ');
  }

  /**
   * 獲取元素屬性
   */
  private getElementProperties(element: HTMLElement): string[] {
    const properties = [];
    
    const level = element.getAttribute('aria-level');
    if (level) {
      properties.push(`層級 ${level}`);
    }
    
    const setsize = element.getAttribute('aria-setsize');
    const posinset = element.getAttribute('aria-posinset');
    if (setsize && posinset) {
      properties.push(`第 ${posinset} 項，共 ${setsize} 項`);
    }
    
    const valuemin = element.getAttribute('aria-valuemin');
    const valuemax = element.getAttribute('aria-valuemax');
    const valuenow = element.getAttribute('aria-valuenow');
    if (valuemin && valuemax && valuenow) {
      properties.push(`值 ${valuenow}，範圍 ${valuemin} 到 ${valuemax}`);
    }

    return properties;
  }

  /**
   * 從 ID 獲取文字
   */
  private getTextFromId(id: string | null): string {
    if (!id) return '';
    
    const element = document.getElementById(id);
    return element ? element.textContent?.trim() || '' : '';
  }

  /**
   * 從 ID 獲取描述
   */
  private getDescriptionFromId(id: string): string {
    return this.getTextFromId(id);
  }

  /**
   * 公告訊息
   */
  public announce(message: string, options: Partial<AnnouncementOptions> = {}): void {
    const fullOptions: AnnouncementOptions = {
      type: AnnouncementType.POLITE,
      delay: 0,
      atomic: true,
      clearPrevious: false,
      ...options
    };

    this.announcementQueue.push({ message, options: fullOptions });
    
    if (!this.isProcessingQueue) {
      this.processAnnouncementQueue();
    }
  }

  /**
   * 處理公告佇列
   */
  private async processAnnouncementQueue(): Promise<void> {
    this.isProcessingQueue = true;
    
    while (this.announcementQueue.length > 0) {
      const { message, options } = this.announcementQueue.shift()!;
      
      if (options.delay && options.delay > 0) {
        await new Promise(resolve => setTimeout(resolve, options.delay));
      }
      
      this.performAnnouncement(message, options);
      
      // 短暫延遲以確保螢幕閱讀器能處理
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    this.isProcessingQueue = false;
  }

  /**
   * 執行公告
   */
  private performAnnouncement(message: string, options: AnnouncementOptions): void {
    const liveRegion = this.liveRegions.get(options.type);
    if (!liveRegion) return;

    if (options.clearPrevious) {
      liveRegion.textContent = '';
    }

    // 短暫延遲後設置內容，確保螢幕閱讀器能檢測到變化
    setTimeout(() => {
      liveRegion.textContent = message;
    }, 10);

    this.emitEvent({
      type: 'announcement',
      message,
      announcementType: options.type,
      timestamp: Date.now()
    });
  }

  /**
   * 公告狀態變化
   */
  public announceStateChange(element: HTMLElement, description: ElementDescription): void {
    const message = `${description.label}${description.state ? ', ' + description.state : ''}`;
    this.announce(message, { type: AnnouncementType.POLITE });
  }

  /**
   * 公告焦點變化
   */
  public announceFocusChange(element: HTMLElement): void {
    const description = this.elementDescriptions.get(element) || this.generateElementDescription(element);
    const message = `${description.label}, ${description.role}${description.state ? ', ' + description.state : ''}`;
    
    this.announce(message, { type: AnnouncementType.POLITE });
    
    this.emitEvent({
      type: 'focus_change',
      element,
      message,
      timestamp: Date.now()
    });
  }

  /**
   * 設置 ARIA 屬性
   */
  public setAriaAttributes(element: HTMLElement, attributes: AriaAttributes): void {
    Object.entries(attributes).forEach(([key, value]) => {
      if (value !== undefined) {
        element.setAttribute(key, String(value));
      } else {
        element.removeAttribute(key);
      }
    });

    // 更新元素描述
    const description = this.generateElementDescription(element);
    this.elementDescriptions.set(element, description);
  }

  /**
   * 創建可訪問的對話框
   */
  public createAccessibleDialog(element: HTMLElement, title: string): void {
    this.setAriaAttributes(element, {
      'aria-modal': true,
      'aria-labelledby': `${element.id}-title`,
      'aria-describedby': `${element.id}-description`
    });

    element.setAttribute('role', 'dialog');
    
    // 創建標題元素
    const titleElement = document.createElement('h2');
    titleElement.id = `${element.id}-title`;
    titleElement.textContent = title;
    titleElement.className = 'dialog-title';
    
    element.insertBefore(titleElement, element.firstChild);
    
    this.announce(`對話框已開啟: ${title}`, { type: AnnouncementType.ASSERTIVE });
  }

  /**
   * 事件發射器
   */
  private emitEvent(event: ScreenReaderEvent): void {
    this.emit('screen_reader_event', event);
  }

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
   * 清理資源
   */
  public destroy(): void {
    // 移除 live regions
    this.liveRegions.forEach(region => {
      if (document.body.contains(region)) {
        document.body.removeChild(region);
      }
    });
    
    this.liveRegions.clear();
    this.elementDescriptions.clear();
    this.listeners.clear();
    this.announcementQueue.length = 0;
  }
}
