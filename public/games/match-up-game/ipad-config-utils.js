/**
 * Match-Up 遊戲 iPad 配置工具函數
 * 基於 responsive-config.js 的 iPad 配置
 * 
 * 支持設備：
 * - iPad mini (768×1024)
 * - iPad Air (810×1080, 820×1180)
 * - iPad Pro 11" (834×1194)
 * - iPad Pro 12.9" (1024×1366)
 */

/**
 * iPad 配置工具類
 */
class MatchUpIPadConfigUtils {
  /**
   * 檢測是否為 iPad 設備
   */
  static isIPadDevice() {
    if (typeof navigator === 'undefined') return false;
    
    return /iPad/.test(navigator.userAgent) ||
           (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }

  /**
   * 檢測是否為 iPad Pro
   */
  static isIPadPro() {
    if (typeof navigator === 'undefined') return false;
    
    return /iPad Pro/.test(navigator.userAgent) ||
           (navigator.maxTouchPoints > 4 && /iPad/.test(navigator.userAgent));
  }

  /**
   * 檢測是否為 iPad Air
   */
  static isIPadAir() {
    if (typeof navigator === 'undefined') return false;
    
    return /iPad Air/.test(navigator.userAgent);
  }

  /**
   * 分類 iPad 大小
   * @param {number} width - 容器寬度
   * @returns {string} iPad 大小分類
   */
  static classifyIPadSize(width) {
    if (width <= 768) return 'small';           // iPad mini
    else if (width <= 820) return 'medium';     // iPad Air
    else if (width <= 834) return 'medium_large'; // iPad Air (larger)
    else if (width <= 1024) return 'large';     // iPad Pro 11"
    else return 'xlarge';                       // iPad Pro 12.9"
  }

  /**
   * 檢測設備方向
   * @param {number} width - 容器寬度
   * @param {number} height - 容器高度
   * @returns {string} 方向 ('portrait' 或 'landscape')
   */
  static detectOrientation(width, height) {
    return width > height ? 'landscape' : 'portrait';
  }

  /**
   * 分類 iPad 配置鍵
   * @param {number} width - 容器寬度
   * @param {number} height - 容器高度
   * @returns {string} iPad 配置鍵
   */
  static classifyIPadConfigKey(width, height) {
    const size = this.classifyIPadSize(width);
    const orientation = this.detectOrientation(width, height);
    return `${size}_${orientation}`;
  }

  /**
   * 獲取 iPad 配置
   * @param {number} width - 容器寬度
   * @param {number} height - 容器高度
   * @returns {object|null} iPad 配置對象或 null
   */
  static getIPadConfig(width, height) {
    // 檢查是否為 iPad 設備
    if (!this.isIPadDevice()) {
      return null;
    }

    // 獲取配置鍵
    const configKey = this.classifyIPadConfigKey(width, height);

    // 返回配置（需要從 responsive-config.js 導入 DESIGN_TOKENS）
    if (typeof DESIGN_TOKENS !== 'undefined' && DESIGN_TOKENS.ipad) {
      return DESIGN_TOKENS.ipad[configKey] || null;
    }

    return null;
  }

  /**
   * 獲取 iPad 配置的所有信息
   * @param {number} width - 容器寬度
   * @param {number} height - 容器高度
   * @returns {object} 包含配置和元數據的對象
   */
  static getIPadConfigInfo(width, height) {
    const config = this.getIPadConfig(width, height);
    
    return {
      isIPad: this.isIPadDevice(),
      isIPadPro: this.isIPadPro(),
      isIPadAir: this.isIPadAir(),
      size: this.classifyIPadSize(width),
      orientation: this.detectOrientation(width, height),
      configKey: this.classifyIPadConfigKey(width, height),
      config: config,
      width: width,
      height: height,
      aspectRatio: (width / height).toFixed(2)
    };
  }

  /**
   * 應用 iPad 配置到遊戲參數
   * @param {object} gameParams - 遊戲參數對象
   * @param {number} width - 容器寬度
   * @param {number} height - 容器高度
   * @returns {object} 更新後的遊戲參數
   */
  static applyIPadConfig(gameParams, width, height) {
    const ipadConfig = this.getIPadConfig(width, height);

    if (!ipadConfig) {
      return gameParams;
    }

    // 應用 iPad 配置
    return {
      ...gameParams,
      sideMargin: ipadConfig.sideMargin,
      topButtonArea: ipadConfig.topButtonArea,
      bottomButtonArea: ipadConfig.bottomButtonArea,
      horizontalSpacing: ipadConfig.horizontalSpacing,
      verticalSpacing: ipadConfig.verticalSpacing,
      chineseFontSize: ipadConfig.chineseFontSize,
      optimalCols: ipadConfig.optimalCols,
      _ipadConfigApplied: true,
      _ipadConfigKey: this.classifyIPadConfigKey(width, height)
    };
  }

  /**
   * 記錄 iPad 配置信息（用於調試）
   * @param {number} width - 容器寬度
   * @param {number} height - 容器高度
   */
  static logIPadConfigInfo(width, height) {
    const info = this.getIPadConfigInfo(width, height);

    console.log('📱 iPad 配置信息:');
    console.log(`  設備: ${info.isIPadPro ? 'iPad Pro' : info.isIPadAir ? 'iPad Air' : 'iPad'}`);
    console.log(`  大小: ${info.size}`);
    console.log(`  方向: ${info.orientation}`);
    console.log(`  尺寸: ${info.width}×${info.height} (${info.aspectRatio})`);
    console.log(`  配置鍵: ${info.configKey}`);

    if (info.config) {
      console.log('  配置值:');
      console.log(`    - 邊距: ${info.config.sideMargin}px`);
      console.log(`    - 上方按鈕區域: ${info.config.topButtonArea}px`);
      console.log(`    - 下方按鈕區域: ${info.config.bottomButtonArea}px`);
      console.log(`    - 水平間距: ${info.config.horizontalSpacing}px`);
      console.log(`    - 垂直間距: ${info.config.verticalSpacing}px`);
      console.log(`    - 字體大小: ${info.config.chineseFontSize}px`);
      console.log(`    - 最優列數: ${info.config.optimalCols}`);
    } else {
      console.log('  ⚠️ 未找到配置');
    }
  }
}

// 導出工具類
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MatchUpIPadConfigUtils;
}

