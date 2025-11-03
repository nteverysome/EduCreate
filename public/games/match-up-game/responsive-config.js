/**
 * 響應式設計配置系統
 * 集中定義所有設計值和斷點
 *
 * 基於業界標準：
 * - Bootstrap 斷點系統
 * - Tailwind CSS 設計令牌
 * - Material Design 原則
 */

// ============================================
// 第 1 層：預定義斷點系統
// ============================================

/**
 * 響應式斷點定義
 * 基於設備寬度分類
 */
const RESPONSIVE_BREAKPOINTS = {
    mobile: {
        min: 0,
        max: 767,
        name: 'mobile',
        cols: 1,
        description: '手機設備'
    },
    tablet: {
        min: 768,
        max: 1023,
        name: 'tablet',
        cols: 2,
        description: '平板設備'
    },
    desktop: {
        min: 1024,
        max: 1279,
        name: 'desktop',
        cols: 3,
        description: '桌面設備'
    },
    wide: {
        min: 1280,
        max: Infinity,
        name: 'wide',
        cols: 4,
        description: '寬屏設備'
    }
};

// ============================================
// 第 2 層：設計令牌系統
// ============================================

/**
 * 統一的設計令牌
 * 單一真實來源（Single Source of Truth）
 */
const DESIGN_TOKENS = {
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

    // iPad 特殊配置（v42.2）
    ipad: {
        small_portrait: {
            sideMargin: 15,
            topButtonArea: 35,
            bottomButtonArea: 35,
            horizontalSpacing: 12,
            verticalSpacing: 30,
            chineseFontSize: 22
        },
        medium_portrait: {
            sideMargin: 18,
            topButtonArea: 38,
            bottomButtonArea: 38,
            horizontalSpacing: 14,
            verticalSpacing: 32,
            chineseFontSize: 26
        },
        medium_large_portrait: {
            sideMargin: 20,
            topButtonArea: 40,
            bottomButtonArea: 40,
            horizontalSpacing: 15,
            verticalSpacing: 35,
            chineseFontSize: 28
        },
        large_portrait: {
            sideMargin: 22,
            topButtonArea: 42,
            bottomButtonArea: 42,
            horizontalSpacing: 16,
            verticalSpacing: 37,
            chineseFontSize: 30
        },
        xlarge_portrait: {
            sideMargin: 25,
            topButtonArea: 45,
            bottomButtonArea: 45,
            horizontalSpacing: 18,
            verticalSpacing: 40,
            chineseFontSize: 34
        },
        small_landscape: {
            sideMargin: 12,
            topButtonArea: 30,
            bottomButtonArea: 30,
            horizontalSpacing: 10,
            verticalSpacing: 25,
            chineseFontSize: 20
        },
        medium_landscape: {
            sideMargin: 15,
            topButtonArea: 32,
            bottomButtonArea: 32,
            horizontalSpacing: 12,
            verticalSpacing: 28,
            chineseFontSize: 24
        },
        medium_large_landscape: {
            sideMargin: 17,
            topButtonArea: 34,
            bottomButtonArea: 34,
            horizontalSpacing: 13,
            verticalSpacing: 30,
            chineseFontSize: 26
        },
        large_landscape: {
            sideMargin: 19,
            topButtonArea: 36,
            bottomButtonArea: 36,
            horizontalSpacing: 14,
            verticalSpacing: 32,
            chineseFontSize: 28
        },
        xlarge_landscape: {
            sideMargin: 20,
            topButtonArea: 38,
            bottomButtonArea: 38,
            horizontalSpacing: 16,
            verticalSpacing: 35,
            chineseFontSize: 32
        }
    }
};

// ============================================
// 第 3 層：輔助函數
// ============================================

/**
 * 根據寬度獲取當前斷點
 * @param {number} width - 容器寬度
 * @returns {string} 斷點名稱
 */
function getBreakpoint(width) {
    for (const [key, bp] of Object.entries(RESPONSIVE_BREAKPOINTS)) {
        if (width >= bp.min && width <= bp.max) {
            return key;
        }
    }
    return 'mobile';
}

/**
 * 獲取斷點信息
 * @param {string} breakpoint - 斷點名稱
 * @returns {object} 斷點信息
 */
function getBreakpointInfo(breakpoint) {
    return RESPONSIVE_BREAKPOINTS[breakpoint];
}

/**
 * 獲取設計令牌值
 * @param {string} category - 令牌類別
 * @param {string} key - 令牌鍵
 * @param {string} breakpoint - 斷點名稱（可選）
 * @returns {*} 令牌值
 */
function getToken(category, key, breakpoint = null) {
    const token = DESIGN_TOKENS[category];
    if (!token) return null;

    // 如果指定了斷點，返回該斷點的值
    if (breakpoint && token[breakpoint]) {
        return token[breakpoint][key];
    }

    // 否則返回通用值
    return token[key];
}

/**
 * 獲取所有令牌
 * @param {string} category - 令牌類別
 * @returns {object} 所有令牌
 */
function getAllTokens(category) {
    return DESIGN_TOKENS[category];
}

/**
 * 獲取 iPad 配置
 * @param {string} iPadSize - iPad 大小分類
 * @returns {object} iPad 配置
 */
function getIPadConfig(iPadSize) {
    return DESIGN_TOKENS.ipad[iPadSize];
}

/**
 * 根據寬度和高度分類 iPad 大小
 * @param {number} w - 寬度
 * @param {number} h - 高度
 * @returns {string} iPad 大小分類
 */
function classifyIPadSize(w, h) {
    const minDim = Math.min(w, h);

    let deviceSize;
    if (minDim <= 768) {
        deviceSize = 'small';           // iPad mini: 768
    } else if (minDim <= 810) {
        deviceSize = 'medium';          // iPad: 810
    } else if (minDim <= 820) {
        deviceSize = 'medium_large';    // iPad Air: 820
    } else if (minDim <= 834) {
        deviceSize = 'large';           // iPad Pro 11": 834
    } else {
        deviceSize = 'xlarge';          // iPad Pro 12.9": 1024
    }

    // 根據方向添加後綴
    const aspectRatio = w / h;
    const isPortrait = aspectRatio < 1;
    const orientation = isPortrait ? '_portrait' : '_landscape';

    return deviceSize + orientation;
}

// ============================================
// 第 4 層：配置驗證
// ============================================

/**
 * 驗證配置的完整性
 */
function validateConfig() {
    const errors = [];

    // 驗證斷點
    for (const [key, bp] of Object.entries(RESPONSIVE_BREAKPOINTS)) {
        if (!bp.min || bp.max === undefined) {
            errors.push(`斷點 ${key} 缺少 min 或 max`);
        }
    }

    // 驗證設計令牌
    if (!DESIGN_TOKENS.spacing || !DESIGN_TOKENS.fontSize) {
        errors.push('缺少基礎設計令牌');
    }

    if (!DESIGN_TOKENS.margins || !DESIGN_TOKENS.gaps) {
        errors.push('缺少響應式設計令牌');
    }

    if (errors.length > 0) {
        console.error('❌ 配置驗證失敗:', errors);
        return false;
    }

    console.log('✅ 配置驗證成功');
    return true;
}

// ============================================
// 初始化
// ============================================

// 在模塊加載時驗證配置
if (typeof window !== 'undefined') {
    validateConfig();
}

