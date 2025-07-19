/**
 * WCAG 2.1 AA 合規檢查器
 * 自動檢查和驗證網頁無障礙合規性
 */

// WCAG 合規等級
export enum WCAGLevel {
  A = 'A',
  AA = 'AA',
  AAA = 'AAA'
}

// 檢查結果類型
export enum CheckResultType {
  PASS = 'pass',
  FAIL = 'fail',
  WARNING = 'warning',
  INFO = 'info'
}

// 檢查結果
export interface CheckResult {
  id: string;
  type: CheckResultType;
  level: WCAGLevel;
  principle: string;
  guideline: string;
  criterion: string;
  element?: HTMLElement;
  message: string;
  suggestion?: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  helpUrl?: string;
}

// 色彩對比度結果
export interface ColorContrastResult {
  foreground: string;
  background: string;
  ratio: number;
  level: WCAGLevel;
  passes: boolean;
  isLargeText: boolean;
}

// 合規報告
export interface ComplianceReport {
  timestamp: number;
  url: string;
  level: WCAGLevel;
  totalChecks: number;
  passed: number;
  failed: number;
  warnings: number;
  score: number; // 0-100
  results: CheckResult[];
  summary: {
    [key in CheckResultType]: number;
  };
}

export class WCAGComplianceChecker {
  private static readonly COLOR_CONTRAST_RATIOS = {
    [WCAGLevel.AA]: {
      normal: 4.5,
      large: 3.0
    },
    [WCAGLevel.AAA]: {
      normal: 7.0,
      large: 4.5
    }
  };

  private static readonly MINIMUM_SIZES = {
    clickTarget: 44, // 44x44 pixels
    fontSize: 12,
    lineHeight: 1.5
  };

  /**
   * 執行完整的 WCAG 合規檢查
   */
  public static async checkCompliance(
    element: HTMLElement = document.body,
    level: WCAGLevel = WCAGLevel.AA
  ): Promise<ComplianceReport> {
    const results: CheckResult[] = [];
    
    // 執行各項檢查
    results.push(...this.checkColorContrast(element, level));
    results.push(...this.checkKeyboardAccessibility(element));
    results.push(...this.checkAriaLabels(element));
    results.push(...this.checkHeadingStructure(element));
    results.push(...this.checkImages(element));
    results.push(...this.checkForms(element));
    results.push(...this.checkLinks(element));
    results.push(...this.checkFocusManagement(element));
    results.push(...this.checkInteractiveElements(element));
    results.push(...this.checkTextContent(element));

    // 計算統計
    const summary = this.calculateSummary(results);
    const score = this.calculateScore(results);

    return {
      timestamp: Date.now(),
      url: window.location.href,
      level,
      totalChecks: results.length,
      passed: summary.pass,
      failed: summary.fail,
      warnings: summary.warning,
      score,
      results,
      summary
    };
  }

  /**
   * 檢查色彩對比度
   */
  private static checkColorContrast(element: HTMLElement, level: WCAGLevel): CheckResult[] {
    const results: CheckResult[] = [];
    const textElements = element.querySelectorAll('*');

    textElements.forEach((el) => {
      const htmlEl = el as HTMLElement;
      const computedStyle = window.getComputedStyle(htmlEl);
      const textContent = htmlEl.textContent?.trim();

      if (!textContent) return;

      const foreground = computedStyle.color;
      const background = this.getBackgroundColor(htmlEl);
      
      if (foreground && background) {
        const contrastResult = this.calculateColorContrast(foreground, background, htmlEl);
        const requiredRatio = this.getRequiredContrastRatio(htmlEl, level);
        
        if (contrastResult.ratio < requiredRatio) {
          results.push({
            id: 'color-contrast',
            type: CheckResultType.FAIL,
            level,
            principle: '1. 可感知',
            guideline: '1.4 可辨別',
            criterion: '1.4.3 對比度（最低）',
            element: htmlEl,
            message: `色彩對比度不足：${contrastResult.ratio.toFixed(2)}:1，需要 ${requiredRatio}:1`,
            suggestion: '增加前景色和背景色之間的對比度',
            impact: 'high',
            helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html'
          });
        }
      }
    });

    return results;
  }

  /**
   * 檢查鍵盤可訪問性
   */
  private static checkKeyboardAccessibility(element: HTMLElement): CheckResult[] {
    const results: CheckResult[] = [];
    const interactiveElements = element.querySelectorAll(
      'button, a, input, select, textarea, [role="button"], [role="link"], [onclick], [tabindex]'
    );

    interactiveElements.forEach((el) => {
      const htmlEl = el as HTMLElement;
      const tabIndex = htmlEl.getAttribute('tabindex');
      
      // 檢查是否可以通過鍵盤訪問
      if (tabIndex === '-1' && !this.hasKeyboardEventHandlers(htmlEl)) {
        results.push({
          id: 'keyboard-accessibility',
          type: CheckResultType.FAIL,
          level: WCAGLevel.A,
          principle: '2. 可操作',
          guideline: '2.1 鍵盤可訪問',
          criterion: '2.1.1 鍵盤',
          element: htmlEl,
          message: '互動元素無法通過鍵盤訪問',
          suggestion: '移除 tabindex="-1" 或添加鍵盤事件處理器',
          impact: 'high'
        });
      }

      // 檢查焦點指示器
      if (!this.hasFocusIndicator(htmlEl)) {
        results.push({
          id: 'focus-indicator',
          type: CheckResultType.WARNING,
          level: WCAGLevel.AA,
          principle: '2. 可操作',
          guideline: '2.4 可導航',
          criterion: '2.4.7 焦點可見',
          element: htmlEl,
          message: '缺少明顯的焦點指示器',
          suggestion: '添加 :focus 樣式或使用 outline',
          impact: 'medium'
        });
      }
    });

    return results;
  }

  /**
   * 檢查 ARIA 標籤
   */
  private static checkAriaLabels(element: HTMLElement): CheckResult[] {
    const results: CheckResult[] = [];
    const elementsNeedingLabels = element.querySelectorAll(
      'button, input, select, textarea, [role="button"], [role="link"], [role="menuitem"]'
    );

    elementsNeedingLabels.forEach((el) => {
      const htmlEl = el as HTMLElement;
      
      if (!this.hasAccessibleName(htmlEl)) {
        results.push({
          id: 'missing-accessible-name',
          type: CheckResultType.FAIL,
          level: WCAGLevel.A,
          principle: '4. 可理解',
          guideline: '4.1 兼容',
          criterion: '4.1.2 名稱、角色、值',
          element: htmlEl,
          message: '互動元素缺少可訪問名稱',
          suggestion: '添加 aria-label、aria-labelledby 或可見文字',
          impact: 'high'
        });
      }
    });

    return results;
  }

  /**
   * 檢查標題結構
   */
  private static checkHeadingStructure(element: HTMLElement): CheckResult[] {
    const results: CheckResult[] = [];
    const headings = Array.from(element.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    
    if (headings.length === 0) {
      results.push({
        id: 'no-headings',
        type: CheckResultType.WARNING,
        level: WCAGLevel.AA,
        principle: '1. 可感知',
        guideline: '1.3 適應性',
        criterion: '1.3.1 信息和關係',
        message: '頁面沒有標題結構',
        suggestion: '添加適當的標題層級',
        impact: 'medium'
      });
      return results;
    }

    // 檢查是否有 h1
    const h1Elements = headings.filter(h => h.tagName === 'H1');
    if (h1Elements.length === 0) {
      results.push({
        id: 'missing-h1',
        type: CheckResultType.FAIL,
        level: WCAGLevel.AA,
        principle: '1. 可感知',
        guideline: '1.3 適應性',
        criterion: '1.3.1 信息和關係',
        message: '頁面缺少 H1 標題',
        suggestion: '添加一個 H1 標題作為頁面主標題',
        impact: 'high'
      });
    } else if (h1Elements.length > 1) {
      results.push({
        id: 'multiple-h1',
        type: CheckResultType.WARNING,
        level: WCAGLevel.AA,
        principle: '1. 可感知',
        guideline: '1.3 適應性',
        criterion: '1.3.1 信息和關係',
        message: '頁面有多個 H1 標題',
        suggestion: '考慮使用單一 H1 標題',
        impact: 'low'
      });
    }

    // 檢查標題層級跳躍
    for (let i = 1; i < headings.length; i++) {
      const currentLevel = parseInt(headings[i].tagName.charAt(1));
      const previousLevel = parseInt(headings[i - 1].tagName.charAt(1));
      
      if (currentLevel - previousLevel > 1) {
        results.push({
          id: 'heading-level-skip',
          type: CheckResultType.WARNING,
          level: WCAGLevel.AA,
          principle: '1. 可感知',
          guideline: '1.3 適應性',
          criterion: '1.3.1 信息和關係',
          element: headings[i] as HTMLElement,
          message: `標題層級跳躍：從 H${previousLevel} 跳到 H${currentLevel}`,
          suggestion: '使用連續的標題層級',
          impact: 'medium'
        });
      }
    }

    return results;
  }

  /**
   * 檢查圖片
   */
  private static checkImages(element: HTMLElement): CheckResult[] {
    const results: CheckResult[] = [];
    const images = element.querySelectorAll('img');

    images.forEach((img) => {
      const alt = img.getAttribute('alt');
      const role = img.getAttribute('role');
      
      if (alt === null && role !== 'presentation') {
        results.push({
          id: 'missing-alt-text',
          type: CheckResultType.FAIL,
          level: WCAGLevel.A,
          principle: '1. 可感知',
          guideline: '1.1 文字替代',
          criterion: '1.1.1 非文字內容',
          element: img,
          message: '圖片缺少 alt 屬性',
          suggestion: '添加描述性的 alt 文字或 alt="" 用於裝飾性圖片',
          impact: 'high'
        });
      }
    });

    return results;
  }

  /**
   * 檢查表單
   */
  private static checkForms(element: HTMLElement): CheckResult[] {
    const results: CheckResult[] = [];
    const formControls = element.querySelectorAll('input, select, textarea');

    formControls.forEach((control) => {
      const htmlControl = control as HTMLElement;
      const type = htmlControl.getAttribute('type');
      
      // 跳過隱藏和提交按鈕
      if (type === 'hidden' || type === 'submit' || type === 'button') return;

      if (!this.hasFormLabel(htmlControl)) {
        results.push({
          id: 'missing-form-label',
          type: CheckResultType.FAIL,
          level: WCAGLevel.A,
          principle: '1. 可感知',
          guideline: '1.3 適應性',
          criterion: '1.3.1 信息和關係',
          element: htmlControl,
          message: '表單控件缺少標籤',
          suggestion: '添加 <label> 元素或 aria-label 屬性',
          impact: 'high'
        });
      }
    });

    return results;
  }

  /**
   * 檢查連結
   */
  private static checkLinks(element: HTMLElement): CheckResult[] {
    const results: CheckResult[] = [];
    const links = element.querySelectorAll('a[href]');

    links.forEach((link) => {
      const htmlLink = link as HTMLElement;
      const text = htmlLink.textContent?.trim();
      const ariaLabel = htmlLink.getAttribute('aria-label');
      
      if (!text && !ariaLabel) {
        results.push({
          id: 'empty-link',
          type: CheckResultType.FAIL,
          level: WCAGLevel.A,
          principle: '2. 可操作',
          guideline: '2.4 可導航',
          criterion: '2.4.4 連結目的（在上下文中）',
          element: htmlLink,
          message: '連結沒有可訪問的文字',
          suggestion: '添加描述性的連結文字或 aria-label',
          impact: 'high'
        });
      }
    });

    return results;
  }

  /**
   * 檢查焦點管理
   */
  private static checkFocusManagement(element: HTMLElement): CheckResult[] {
    const results: CheckResult[] = [];
    
    // 檢查是否有焦點陷阱
    const modals = element.querySelectorAll('[role="dialog"], [role="alertdialog"]');
    modals.forEach((modal) => {
      const htmlModal = modal as HTMLElement;
      if (!this.hasFocusTrap(htmlModal)) {
        results.push({
          id: 'missing-focus-trap',
          type: CheckResultType.WARNING,
          level: WCAGLevel.AA,
          principle: '2. 可操作',
          guideline: '2.4 可導航',
          criterion: '2.4.3 焦點順序',
          element: htmlModal,
          message: '模態對話框缺少焦點陷阱',
          suggestion: '實現焦點陷阱以防止焦點離開對話框',
          impact: 'medium'
        });
      }
    });

    return results;
  }

  /**
   * 檢查互動元素
   */
  private static checkInteractiveElements(element: HTMLElement): CheckResult[] {
    const results: CheckResult[] = [];
    const clickableElements = element.querySelectorAll('[onclick], .clickable, [data-clickable]');

    clickableElements.forEach((el) => {
      const htmlEl = el as HTMLElement;
      const rect = htmlEl.getBoundingClientRect();
      
      // 檢查點擊目標大小
      if (rect.width < this.MINIMUM_SIZES.clickTarget || rect.height < this.MINIMUM_SIZES.clickTarget) {
        results.push({
          id: 'small-click-target',
          type: CheckResultType.WARNING,
          level: WCAGLevel.AAA,
          principle: '2. 可操作',
          guideline: '2.5 輸入模式',
          criterion: '2.5.5 目標大小',
          element: htmlEl,
          message: `點擊目標太小：${rect.width}x${rect.height}px，建議至少 44x44px`,
          suggestion: '增加元素的填充或大小',
          impact: 'medium'
        });
      }
    });

    return results;
  }

  /**
   * 檢查文字內容
   */
  private static checkTextContent(element: HTMLElement): CheckResult[] {
    const results: CheckResult[] = [];
    const textElements = element.querySelectorAll('p, div, span, li');

    textElements.forEach((el) => {
      const htmlEl = el as HTMLElement;
      const computedStyle = window.getComputedStyle(htmlEl);
      const fontSize = parseFloat(computedStyle.fontSize);
      const lineHeight = parseFloat(computedStyle.lineHeight);
      
      // 檢查字體大小
      if (fontSize < this.MINIMUM_SIZES.fontSize) {
        results.push({
          id: 'small-font-size',
          type: CheckResultType.WARNING,
          level: WCAGLevel.AA,
          principle: '1. 可感知',
          guideline: '1.4 可辨別',
          criterion: '1.4.4 調整文字大小',
          element: htmlEl,
          message: `字體太小：${fontSize}px，建議至少 ${this.MINIMUM_SIZES.fontSize}px`,
          suggestion: '增加字體大小',
          impact: 'medium'
        });
      }
      
      // 檢查行高
      if (lineHeight / fontSize < this.MINIMUM_SIZES.lineHeight) {
        results.push({
          id: 'insufficient-line-height',
          type: CheckResultType.WARNING,
          level: WCAGLevel.AA,
          principle: '1. 可感知',
          guideline: '1.4 可辨別',
          criterion: '1.4.12 文字間距',
          element: htmlEl,
          message: `行高不足：${(lineHeight / fontSize).toFixed(2)}，建議至少 ${this.MINIMUM_SIZES.lineHeight}`,
          suggestion: '增加行高',
          impact: 'low'
        });
      }
    });

    return results;
  }

  /**
   * 輔助方法
   */
  private static calculateColorContrast(foreground: string, background: string, element: HTMLElement): ColorContrastResult {
    // 簡化的對比度計算 - 實際應用中需要更精確的計算
    const fgLuminance = this.getLuminance(foreground);
    const bgLuminance = this.getLuminance(background);
    const ratio = (Math.max(fgLuminance, bgLuminance) + 0.05) / (Math.min(fgLuminance, bgLuminance) + 0.05);
    
    const isLargeText = this.isLargeText(element);
    const level = this.getContrastLevel(ratio, isLargeText);
    
    return {
      foreground,
      background,
      ratio,
      level,
      passes: ratio >= this.getRequiredContrastRatio(element, WCAGLevel.AA),
      isLargeText
    };
  }

  private static getLuminance(color: string): number {
    // 簡化的亮度計算
    const rgb = this.parseColor(color);
    if (!rgb) return 0;
    
    const [r, g, b] = rgb.map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  private static parseColor(color: string): number[] | null {
    // 簡化的顏色解析
    const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    return match ? [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])] : null;
  }

  private static getBackgroundColor(element: HTMLElement): string {
    let current = element;
    while (current && current !== document.body) {
      const bg = window.getComputedStyle(current).backgroundColor;
      if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
        return bg;
      }
      current = current.parentElement!;
    }
    return 'rgb(255, 255, 255)'; // 默認白色背景
  }

  private static isLargeText(element: HTMLElement): boolean {
    const computedStyle = window.getComputedStyle(element);
    const fontSize = parseFloat(computedStyle.fontSize);
    const fontWeight = computedStyle.fontWeight;
    
    return fontSize >= 18 || (fontSize >= 14 && (fontWeight === 'bold' || parseInt(fontWeight) >= 700));
  }

  private static getRequiredContrastRatio(element: HTMLElement, level: WCAGLevel): number {
    const isLarge = this.isLargeText(element);
    return this.COLOR_CONTRAST_RATIOS[level][isLarge ? 'large' : 'normal'];
  }

  private static getContrastLevel(ratio: number, isLargeText: boolean): WCAGLevel {
    const aaRatio = this.COLOR_CONTRAST_RATIOS[WCAGLevel.AA][isLargeText ? 'large' : 'normal'];
    const aaaRatio = this.COLOR_CONTRAST_RATIOS[WCAGLevel.AAA][isLargeText ? 'large' : 'normal'];
    
    if (ratio >= aaaRatio) return WCAGLevel.AAA;
    if (ratio >= aaRatio) return WCAGLevel.AA;
    return WCAGLevel.A;
  }

  private static hasKeyboardEventHandlers(element: HTMLElement): boolean {
    return !!(element.onkeydown || element.onkeyup || element.onkeypress);
  }

  private static hasFocusIndicator(element: HTMLElement): boolean {
    // 簡化檢查 - 實際應用中需要檢查 CSS 樣式
    const computedStyle = window.getComputedStyle(element, ':focus');
    return computedStyle.outline !== 'none' || computedStyle.boxShadow !== 'none';
  }

  private static hasAccessibleName(element: HTMLElement): boolean {
    return !!(
      element.getAttribute('aria-label') ||
      element.getAttribute('aria-labelledby') ||
      element.textContent?.trim() ||
      element.getAttribute('title')
    );
  }

  private static hasFormLabel(element: HTMLElement): boolean {
    const id = element.id;
    if (id && document.querySelector(`label[for="${id}"]`)) return true;
    
    return this.hasAccessibleName(element);
  }

  private static hasFocusTrap(element: HTMLElement): boolean {
    // 簡化檢查 - 實際應用中需要檢查焦點管理邏輯
    return element.hasAttribute('data-focus-trap') || 
           element.classList.contains('focus-trap');
  }

  private static calculateSummary(results: CheckResult[]): { [key in CheckResultType]: number } {
    return results.reduce((summary, result) => {
      summary[result.type]++;
      return summary;
    }, {
      pass: 0,
      fail: 0,
      warning: 0,
      info: 0
    } as { [key in CheckResultType]: number });
  }

  private static calculateScore(results: CheckResult[]): number {
    const totalChecks = results.length;
    if (totalChecks === 0) return 100;
    
    const weightedScore = results.reduce((score, result) => {
      switch (result.type) {
        case CheckResultType.PASS:
          return score + 1;
        case CheckResultType.WARNING:
          return score + 0.5;
        case CheckResultType.INFO:
          return score + 0.8;
        case CheckResultType.FAIL:
          return score + 0;
        default:
          return score;
      }
    }, 0);
    
    return Math.round((weightedScore / totalChecks) * 100);
  }
}
