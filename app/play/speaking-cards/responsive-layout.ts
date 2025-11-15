/**
 * Speaking Cards 響應式佈局引擎
 * 基於 Match-up Game 的業界標準
 * 
 * 負責計算：
 * - 卡片尺寸
 * - 按鈕尺寸
 * - 字體大小
 * - 邊距和間距
 */

import {
  RESPONSIVE_BREAKPOINTS,
  DESIGN_TOKENS,
  RESPONSIVE_LAYOUT_CONFIG,
  getBreakpoint,
  getToken,
  getLayoutConfig,
  getIPadConfig
} from './responsive-config';

export interface ResponsiveLayoutConfig {
  breakpoint: string;
  cardSize: { width: number; height: number };
  buttonSize: { padding: string; fontSize: number };
  margins: { side: number; top: number; bottom: number };
  gaps: { horizontal: number; vertical: number };
  fontSize: { title: number; subtitle: number; body: number };
  isIPad: boolean;
  iPadModel?: string;
}

/**
 * 響應式佈局引擎
 */
export class SpeakingCardsResponsiveLayout {
  private width: number;
  private height: number;
  private breakpoint: string;
  private isPortrait: boolean;
  private isIPad: boolean;
  private iPadModel?: string;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.breakpoint = getBreakpoint(width);
    this.isPortrait = height > width;
    
    // 檢測 iPad
    const iPadConfig = getIPadConfig(width, height);
    this.isIPad = iPadConfig !== null;
    if (this.isIPad) {
      this.iPadModel = this.detectIPadModel();
    }
  }

  /**
   * 檢測 iPad 型號
   */
  private detectIPadModel(): string {
    const diagonal = Math.sqrt(this.width * this.width + this.height * this.height) / 96;
    
    if (diagonal < 8) return 'ipad-mini';
    if (diagonal < 10.5) return 'ipad-air';
    if (diagonal < 12) return 'ipad-pro-11';
    return 'ipad-pro-12.9';
  }

  /**
   * 獲取當前斷點
   */
  getBreakpoint(): string {
    return this.breakpoint;
  }

  /**
   * 獲取卡片尺寸
   */
  getCardSize(): { width: number; height: number } {
    if (this.isIPad && this.iPadModel) {
      const iPadConfig = getIPadConfig(this.width, this.height);
      if (iPadConfig) {
        return {
          width: iPadConfig.cardWidth,
          height: iPadConfig.cardHeight
        };
      }
    }

    const cardSize = getToken('cardSize', this.breakpoint);
    return cardSize || { width: 256, height: 384 };
  }

  /**
   * 獲取按鈕尺寸
   */
  getButtonSize(): { padding: string; fontSize: number } {
    if (this.isIPad && this.iPadModel) {
      const iPadConfig = getIPadConfig(this.width, this.height);
      if (iPadConfig) {
        return {
          padding: iPadConfig.buttonPadding,
          fontSize: iPadConfig.fontSize
        };
      }
    }

    const buttonSize = getToken('buttonSize', this.breakpoint);
    return buttonSize || { padding: '12px 24px', fontSize: 16 };
  }

  /**
   * 獲取邊距
   */
  getMargins(): { side: number; top: number; bottom: number } {
    const margins = getToken('margins', this.breakpoint);
    return margins || { side: 16, top: 20, bottom: 20 };
  }

  /**
   * 獲取間距
   */
  getGaps(): { horizontal: number; vertical: number } {
    const gaps = getToken('gaps', this.breakpoint);
    return gaps || { horizontal: 12, vertical: 16 };
  }

  /**
   * 獲取字體大小
   */
  getFontSizes(): { title: number; subtitle: number; body: number } {
    const titleConfig = getLayoutConfig('title', this.breakpoint);
    const subtitleConfig = getLayoutConfig('subtitle', this.breakpoint);
    const fontSizeToken = getToken('fontSize', this.breakpoint);
    const bodySize = fontSizeToken?.md || 16;

    return {
      title: titleConfig?.fontSize || 32,
      subtitle: subtitleConfig?.fontSize || 16,
      body: bodySize
    };
  }

  /**
   * 獲取卡片區域配置
   */
  getCardAreaConfig(): any {
    return getLayoutConfig('cardArea', this.breakpoint) || {
      maxWidth: '100%',
      padding: '16px',
      gap: '8px'
    };
  }

  /**
   * 獲取按鈕區域配置
   */
  getButtonAreaConfig(): any {
    return getLayoutConfig('buttonArea', this.breakpoint) || {
      flexDirection: 'row',
      gap: '12px',
      padding: '16px'
    };
  }

  /**
   * 獲取完整的響應式配置
   */
  getFullConfig(): ResponsiveLayoutConfig {
    return {
      breakpoint: this.breakpoint,
      cardSize: this.getCardSize(),
      buttonSize: this.getButtonSize(),
      margins: this.getMargins(),
      gaps: this.getGaps(),
      fontSize: this.getFontSizes(),
      isIPad: this.isIPad,
      iPadModel: this.iPadModel
    };
  }

  /**
   * 獲取卡片容器的 CSS 類名
   */
  getCardContainerClassName(): string {
    const margins = this.getMargins();
    const gaps = this.getGaps();

    return `
      flex flex-col lg:flex-row gap-${gaps.horizontal} items-center justify-center
      px-${margins.side} py-${margins.top}
    `.trim();
  }

  /**
   * 獲取按鈕容器的 CSS 類名
   */
  getButtonContainerClassName(): string {
    const config = this.getButtonAreaConfig();
    const flexDir = config.flexDirection === 'column' ? 'flex-col' : 'flex-row';

    return `flex ${flexDir} gap-${config.gap} p-${config.padding}`.trim();
  }

  /**
   * 獲取標題的 CSS 類名
   */
  getTitleClassName(): string {
    const fontSize = this.getFontSizes().title;
    return `text-${fontSize}px font-bold text-gray-900 mb-${fontSize / 2}`.trim();
  }

  /**
   * 獲取副標題的 CSS 類名
   */
  getSubtitleClassName(): string {
    const fontSize = this.getFontSizes().subtitle;
    return `text-${fontSize}px text-gray-600 mb-${fontSize / 2}`.trim();
  }

  /**
   * 獲取卡片的內聯樣式
   */
  getCardStyle(): React.CSSProperties {
    const cardSize = this.getCardSize();
    return {
      width: `${cardSize.width}px`,
      height: `${cardSize.height}px`
    };
  }

  /**
   * 獲取按鈕的內聯樣式
   */
  getButtonStyle(): React.CSSProperties {
    const buttonSize = this.getButtonSize();
    const [paddingY, paddingX] = buttonSize.padding.split(' ').map(p => parseInt(p));

    return {
      padding: buttonSize.padding,
      fontSize: `${buttonSize.fontSize}px`
    };
  }

  /**
   * 是否為移動設備
   */
  isMobile(): boolean {
    return this.breakpoint === 'mobile';
  }

  /**
   * 是否為平板設備
   */
  isTablet(): boolean {
    return this.breakpoint === 'tablet';
  }

  /**
   * 是否為桌面設備
   */
  isDesktop(): boolean {
    return this.breakpoint === 'desktop';
  }

  /**
   * 是否為寬屏設備
   */
  isWide(): boolean {
    return this.breakpoint === 'wide';
  }

  /**
   * 是否為直屏
   */
  isPortraitMode(): boolean {
    return this.isPortrait;
  }

  /**
   * 是否為橫屏
   */
  isLandscapeMode(): boolean {
    return !this.isPortrait;
  }
}

/**
 * 創建響應式佈局實例
 */
export function createResponsiveLayout(width: number, height: number): SpeakingCardsResponsiveLayout {
  return new SpeakingCardsResponsiveLayout(width, height);
}

