/**
 * Speaking Cards 響應式設計配置系統
 * 基於 Match-up Game 的業界標準
 * 
 * 包含：
 * - 預定義斷點系統
 * - 設計令牌系統
 * - iPad 特殊優化
 */

// ============================================
// 第 1 層：預定義斷點系統
// ============================================

export const RESPONSIVE_BREAKPOINTS = {
  mobile: {
    min: 0,
    max: 767,
    name: 'mobile',
    description: '手機設備'
  },
  tablet: {
    min: 768,
    max: 1023,
    name: 'tablet',
    description: '平板設備'
  },
  desktop: {
    min: 1024,
    max: 1279,
    name: 'desktop',
    description: '桌面設備'
  },
  wide: {
    min: 1280,
    max: Infinity,
    name: 'wide',
    description: '寬屏設備'
  }
};

// ============================================
// 第 2 層：設計令牌系統
// ============================================

export const DESIGN_TOKENS = {
  // 基礎間距令牌
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24
  },

  // 字體大小令牌
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24
  },

  // 邊距令牌（根據斷點）
  margins: {
    mobile: { side: 12, top: 16, bottom: 16 },
    tablet: { side: 16, top: 20, bottom: 20 },
    desktop: { side: 20, top: 24, bottom: 24 },
    wide: { side: 24, top: 28, bottom: 28 }
  },

  // 間距令牌（根據斷點）
  gaps: {
    mobile: { horizontal: 8, vertical: 12 },
    tablet: { horizontal: 12, vertical: 16 },
    desktop: { horizontal: 16, vertical: 20 },
    wide: { horizontal: 20, vertical: 24 }
  },

  // 卡片尺寸令牌（根據斷點）
  cardSize: {
    mobile: { width: 200, height: 280 },
    tablet: { width: 240, height: 320 },
    desktop: { width: 280, height: 360 },
    wide: { width: 320, height: 400 }
  },

  // 按鈕尺寸令牌（根據斷點）
  buttonSize: {
    mobile: { padding: '8px 12px', fontSize: 14 },
    tablet: { padding: '10px 16px', fontSize: 16 },
    desktop: { padding: '12px 20px', fontSize: 18 },
    wide: { padding: '14px 24px', fontSize: 20 }
  },

  // iPad 特殊配置
  ipad: {
    'ipad-mini': {
      cardWidth: 220,
      cardHeight: 300,
      fontSize: 16,
      buttonPadding: '10px 14px'
    },
    'ipad-air': {
      cardWidth: 260,
      cardHeight: 340,
      fontSize: 18,
      buttonPadding: '12px 18px'
    },
    'ipad-pro-11': {
      cardWidth: 300,
      cardHeight: 380,
      fontSize: 20,
      buttonPadding: '14px 22px'
    },
    'ipad-pro-12.9': {
      cardWidth: 340,
      cardHeight: 420,
      fontSize: 22,
      buttonPadding: '16px 26px'
    }
  }
};

// ============================================
// 第 3 層：響應式佈局配置
// ============================================

export const RESPONSIVE_LAYOUT_CONFIG = {
  // 卡片區域配置
  cardArea: {
    mobile: {
      maxWidth: '100%',
      padding: '16px',
      gap: '8px'
    },
    tablet: {
      maxWidth: '100%',
      padding: '20px',
      gap: '12px'
    },
    desktop: {
      maxWidth: '1200px',
      padding: '24px',
      gap: '16px'
    },
    wide: {
      maxWidth: '1400px',
      padding: '28px',
      gap: '20px'
    }
  },

  // 按鈕區域配置
  buttonArea: {
    mobile: {
      flexDirection: 'column',
      gap: '8px',
      padding: '12px'
    },
    tablet: {
      flexDirection: 'row',
      gap: '12px',
      padding: '16px'
    },
    desktop: {
      flexDirection: 'row',
      gap: '16px',
      padding: '20px'
    },
    wide: {
      flexDirection: 'row',
      gap: '20px',
      padding: '24px'
    }
  },

  // 標題配置
  title: {
    mobile: { fontSize: 24, marginBottom: 12 },
    tablet: { fontSize: 28, marginBottom: 16 },
    desktop: { fontSize: 32, marginBottom: 20 },
    wide: { fontSize: 36, marginBottom: 24 }
  },

  // 副標題配置
  subtitle: {
    mobile: { fontSize: 14, marginBottom: 8 },
    tablet: { fontSize: 16, marginBottom: 12 },
    desktop: { fontSize: 18, marginBottom: 16 },
    wide: { fontSize: 20, marginBottom: 20 }
  }
};

// ============================================
// 工具函數
// ============================================

/**
 * 根據寬度獲取當前斷點
 */
export function getBreakpoint(width: number): string {
  for (const [key, bp] of Object.entries(RESPONSIVE_BREAKPOINTS)) {
    if (width >= bp.min && width <= bp.max) {
      return key;
    }
  }
  return 'mobile';
}

/**
 * 獲取設計令牌值
 */
export function getToken(category: string, breakpoint: string): any {
  return (DESIGN_TOKENS as any)[category]?.[breakpoint];
}

/**
 * 獲取佈局配置
 */
export function getLayoutConfig(category: string, breakpoint: string): any {
  return (RESPONSIVE_LAYOUT_CONFIG as any)[category]?.[breakpoint];
}

/**
 * 檢測是否為 iPad
 */
export function detectIPadModel(width: number, height: number): string | null {
  const diagonal = Math.sqrt(width * width + height * height) / 96; // 轉換為英寸

  if (diagonal < 8) return 'ipad-mini';
  if (diagonal < 10.5) return 'ipad-air';
  if (diagonal < 12) return 'ipad-pro-11';
  if (diagonal >= 12) return 'ipad-pro-12.9';

  return null;
}

/**
 * 獲取 iPad 特殊配置
 */
export function getIPadConfig(width: number, height: number): any {
  const model = detectIPadModel(width, height);
  if (model) {
    return (DESIGN_TOKENS.ipad as any)[model];
  }
  return null;
}

