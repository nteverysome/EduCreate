/**
 * 統一遊戲響應式布局系統
 * 為所有遊戲提供一致的響應式設計邏輯
 * 
 * 支持的遊戲：
 * - MemoryCardGame (React)
 * - Match-Up (Phaser)
 * - 其他 25 種遊戲
 */

export interface ResponsiveBreakpoint {
  name: string;
  min: number;
  max: number;
  cols: number;
  cardMinWidth: number;
  cardMaxWidth: number;
  fontSize: number;
  spacing: number;
  margins: {
    side: number;
    top: number;
    bottom: number;
  };
}

export interface ResponsiveLayout {
  breakpoint: string;
  cols: number;
  cardSize: number;
  fontSize: number;
  spacing: number;
  margins: {
    side: number;
    top: number;
    bottom: number;
  };
}

/**
 * 統一的響應式斷點系統
 * 基於 MemoryCardGame 的設計，適用於所有遊戲
 */
export const UNIFIED_BREAKPOINTS: Record<string, ResponsiveBreakpoint> = {
  mobile: {
    name: 'mobile',
    min: 0,
    max: 480,
    cols: 2,
    cardMinWidth: 50,
    cardMaxWidth: 70,
    fontSize: 14,
    spacing: 8,
    margins: { side: 12, top: 16, bottom: 16 }
  },
  mobileLandscape: {
    name: 'mobileLandscape',
    min: 480,
    max: 640,
    cols: 3,
    cardMinWidth: 70,
    cardMaxWidth: 90,
    fontSize: 16,
    spacing: 10,
    margins: { side: 12, top: 16, bottom: 16 }
  },
  tablet: {
    name: 'tablet',
    min: 640,
    max: 768,
    cols: 4,
    cardMinWidth: 90,
    cardMaxWidth: 120,
    fontSize: 18,
    spacing: 12,
    margins: { side: 16, top: 20, bottom: 20 }
  },
  tabletLandscape: {
    name: 'tabletLandscape',
    min: 768,
    max: 1024,
    cols: 5,
    cardMinWidth: 110,
    cardMaxWidth: 140,
    fontSize: 20,
    spacing: 14,
    margins: { side: 16, top: 20, bottom: 20 }
  },
  desktop: {
    name: 'desktop',
    min: 1024,
    max: Infinity,
    cols: 6,
    cardMinWidth: 130,
    cardMaxWidth: 180,
    fontSize: 24,
    spacing: 16,
    margins: { side: 20, top: 24, bottom: 24 }
  }
};

/**
 * 根據寬度獲取斷點
 */
export function getBreakpointByWidth(width: number): ResponsiveBreakpoint {
  for (const [, bp] of Object.entries(UNIFIED_BREAKPOINTS)) {
    if (width >= bp.min && width <= bp.max) {
      return bp;
    }
  }
  return UNIFIED_BREAKPOINTS.mobile;
}

/**
 * 計算最優列數
 */
export function calculateOptimalColumns(
  width: number,
  cardCount: number
): number {
  const breakpoint = getBreakpointByWidth(width);
  let cols = breakpoint.cols;

  // 根據卡片數量調整
  if (cardCount <= 4) {
    cols = Math.min(cols, 2);
  } else if (cardCount <= 8) {
    cols = Math.min(cols, 3);
  } else if (cardCount <= 12) {
    cols = Math.min(cols, 4);
  }

  return Math.min(cols, cardCount);
}

/**
 * 計算最優卡片大小
 */
export function calculateOptimalCardSize(
  width: number,
  cols: number,
  spacing: number = 12
): number {
  const sideMargin = 16;
  const availableWidth = width - sideMargin * 2;
  const totalSpacing = spacing * (cols - 1);
  const cardWidth = (availableWidth - totalSpacing) / cols;

  return Math.max(50, Math.min(200, cardWidth));
}

/**
 * 計算最優字體大小
 */
export function calculateOptimalFontSize(width: number): number {
  if (width < 480) return 14;
  if (width >= 1024) return 24;

  const ratio = (width - 480) / (1024 - 480);
  return 14 + (24 - 14) * ratio;
}

/**
 * 計算完整的響應式布局
 */
export function calculateResponsiveLayout(
  width: number,
  cardCount: number
): ResponsiveLayout {
  const breakpoint = getBreakpointByWidth(width);
  const cols = calculateOptimalColumns(width, cardCount);
  const cardSize = calculateOptimalCardSize(width, cols, breakpoint.spacing);
  const fontSize = calculateOptimalFontSize(width);

  return {
    breakpoint: breakpoint.name,
    cols,
    cardSize,
    fontSize,
    spacing: breakpoint.spacing,
    margins: breakpoint.margins
  };
}

/**
 * 為 Phaser 遊戲提供的適配器
 */
export class PhaserResponsiveLayout {
  private width: number;
  private height: number;
  private cardCount: number;

  constructor(width: number, height: number, cardCount: number = 8) {
    this.width = width;
    this.height = height;
    this.cardCount = cardCount;
  }

  getLayout(): ResponsiveLayout {
    return calculateResponsiveLayout(this.width, this.cardCount);
  }

  getBreakpoint(): ResponsiveBreakpoint {
    return getBreakpointByWidth(this.width);
  }

  getColumns(): number {
    return calculateOptimalColumns(this.width, this.cardCount);
  }

  getCardSize(): number {
    const cols = this.getColumns();
    return calculateOptimalCardSize(this.width, cols);
  }

  getFontSize(): number {
    return calculateOptimalFontSize(this.width);
  }

  getMargins() {
    return this.getBreakpoint().margins;
  }

  getSpacing(): number {
    return this.getBreakpoint().spacing;
  }

  // 調試方法
  logLayout(): void {
    const layout = this.getLayout();
    console.log('📐 [統一布局] 響應式配置:', {
      width: this.width,
      height: this.height,
      breakpoint: layout.breakpoint,
      cols: layout.cols,
      cardSize: layout.cardSize,
      fontSize: layout.fontSize,
      spacing: layout.spacing,
      margins: layout.margins
    });
  }
}

/**
 * 為 React 組件提供的 Hook
 */
export function useUnifiedResponsiveLayout(
  width: number,
  cardCount: number = 8
): ResponsiveLayout {
  return calculateResponsiveLayout(width, cardCount);
}

/**
 * 導出所有工具函數
 */
export const UnifiedLayoutUtils = {
  getBreakpointByWidth,
  calculateOptimalColumns,
  calculateOptimalCardSize,
  calculateOptimalFontSize,
  calculateResponsiveLayout,
  PhaserResponsiveLayout,
  UNIFIED_BREAKPOINTS
};

