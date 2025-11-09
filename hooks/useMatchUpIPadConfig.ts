/**
 * Match-Up 遊戲 iPad 配置 Hook
 * 基於 responsive-config.js 的 iPad 配置
 * 
 * 使用方式：
 * const ipadConfig = useMatchUpIPadConfig(width, height);
 * if (ipadConfig) {
 *   // 應用 iPad 配置
 * }
 */

import { useMemo } from 'react';

export interface MatchUpIPadConfig {
  sideMargin: number;
  topButtonArea: number;
  bottomButtonArea: number;
  horizontalSpacing: number;
  verticalSpacing: number;
  chineseFontSize: number;
  optimalCols: number;
}

export interface MatchUpIPadConfigInfo {
  isIPad: boolean;
  isIPadPro: boolean;
  isIPadAir: boolean;
  size: 'small' | 'medium' | 'medium_large' | 'large' | 'xlarge';
  orientation: 'portrait' | 'landscape';
  configKey: string;
  config: MatchUpIPadConfig | null;
  width: number;
  height: number;
  aspectRatio: string;
}

/**
 * 檢測是否為 iPad 設備
 */
function detectIPadDevice(): boolean {
  if (typeof navigator === 'undefined') return false;

  return /iPad/.test(navigator.userAgent) ||
         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

/**
 * 檢測是否為 iPad Pro
 */
function detectIPadPro(): boolean {
  if (typeof navigator === 'undefined') return false;

  return /iPad Pro/.test(navigator.userAgent) ||
         (navigator.maxTouchPoints > 4 && /iPad/.test(navigator.userAgent));
}

/**
 * 檢測是否為 iPad Air
 */
function detectIPadAir(): boolean {
  if (typeof navigator === 'undefined') return false;

  return /iPad Air/.test(navigator.userAgent);
}

/**
 * 分類 iPad 大小
 */
function classifyIPadSize(width: number): 'small' | 'medium' | 'medium_large' | 'large' | 'xlarge' {
  if (width <= 768) return 'small';           // iPad mini
  else if (width <= 820) return 'medium';     // iPad Air
  else if (width <= 834) return 'medium_large'; // iPad Air (larger)
  else if (width <= 1024) return 'large';     // iPad Pro 11"
  else return 'xlarge';                       // iPad Pro 12.9"
}

/**
 * 檢測設備方向
 */
function detectOrientation(width: number, height: number): 'portrait' | 'landscape' {
  return width > height ? 'landscape' : 'portrait';
}

/**
 * 分類 iPad 配置鍵
 */
function classifyIPadConfigKey(width: number, height: number): string {
  const size = classifyIPadSize(width);
  const orientation = detectOrientation(width, height);
  return `${size}_${orientation}`;
}

/**
 * iPad 配置數據（從 responsive-config.js 複製）
 */
const IPAD_CONFIGS: Record<string, MatchUpIPadConfig> = {
  small_portrait: {
    sideMargin: 15,
    topButtonArea: 36,
    bottomButtonArea: 42,
    horizontalSpacing: 13,
    verticalSpacing: 32,
    chineseFontSize: 24,
    optimalCols: 4
  },
  medium_portrait: {
    sideMargin: 18,
    topButtonArea: 40,
    bottomButtonArea: 46,
    horizontalSpacing: 16,
    verticalSpacing: 35,
    chineseFontSize: 28,
    optimalCols: 5
  },
  medium_large_portrait: {
    sideMargin: 20,
    topButtonArea: 42,
    bottomButtonArea: 48,
    horizontalSpacing: 17,
    verticalSpacing: 37,
    chineseFontSize: 30,
    optimalCols: 5
  },
  large_portrait: {
    sideMargin: 22,
    topButtonArea: 44,
    bottomButtonArea: 50,
    horizontalSpacing: 18,
    verticalSpacing: 39,
    chineseFontSize: 32,
    optimalCols: 5
  },
  xlarge_portrait: {
    sideMargin: 25,
    topButtonArea: 48,
    bottomButtonArea: 54,
    horizontalSpacing: 20,
    verticalSpacing: 42,
    chineseFontSize: 36,
    optimalCols: 6
  },
  small_landscape: {
    sideMargin: 12,
    topButtonArea: 32,
    bottomButtonArea: 38,
    horizontalSpacing: 11,
    verticalSpacing: 27,
    chineseFontSize: 22,
    optimalCols: 5
  },
  medium_landscape: {
    sideMargin: 15,
    topButtonArea: 34,
    bottomButtonArea: 40,
    horizontalSpacing: 13,
    verticalSpacing: 30,
    chineseFontSize: 26,
    optimalCols: 6
  },
  medium_large_landscape: {
    sideMargin: 17,
    topButtonArea: 36,
    bottomButtonArea: 42,
    horizontalSpacing: 14,
    verticalSpacing: 32,
    chineseFontSize: 28,
    optimalCols: 6
  },
  large_landscape: {
    sideMargin: 19,
    topButtonArea: 38,
    bottomButtonArea: 44,
    horizontalSpacing: 15,
    verticalSpacing: 34,
    chineseFontSize: 30,
    optimalCols: 7
  },
  xlarge_landscape: {
    sideMargin: 20,
    topButtonArea: 40,
    bottomButtonArea: 46,
    horizontalSpacing: 17,
    verticalSpacing: 37,
    chineseFontSize: 34,
    optimalCols: 7
  }
};

/**
 * useMatchUpIPadConfig Hook
 * 根據容器寬度和高度返回 Match-Up 遊戲的 iPad 配置
 */
export function useMatchUpIPadConfig(
  width: number,
  height: number
): MatchUpIPadConfig | null {
  return useMemo(() => {
    // 檢查是否為 iPad 設備
    if (!detectIPadDevice()) {
      return null;
    }

    // 獲取配置鍵
    const configKey = classifyIPadConfigKey(width, height);

    // 返回配置
    return IPAD_CONFIGS[configKey] || null;
  }, [width, height]);
}

/**
 * useMatchUpIPadConfigInfo Hook
 * 返回詳細的 iPad 配置信息
 */
export function useMatchUpIPadConfigInfo(
  width: number,
  height: number
): MatchUpIPadConfigInfo {
  return useMemo(() => {
    const config = useMatchUpIPadConfig(width, height);
    const configKey = classifyIPadConfigKey(width, height);

    return {
      isIPad: detectIPadDevice(),
      isIPadPro: detectIPadPro(),
      isIPadAir: detectIPadAir(),
      size: classifyIPadSize(width),
      orientation: detectOrientation(width, height),
      configKey,
      config,
      width,
      height,
      aspectRatio: (width / height).toFixed(2)
    };
  }, [width, height]);
}

/**
 * 導出工具函數供非 React 代碼使用
 */
export const MatchUpIPadConfigUtils = {
  detectIPadDevice,
  detectIPadPro,
  detectIPadAir,
  classifyIPadSize,
  detectOrientation,
  classifyIPadConfigKey,
  getIPadConfig: (width: number, height: number) => {
    if (!detectIPadDevice()) return null;
    const configKey = classifyIPadConfigKey(width, height);
    return IPAD_CONFIGS[configKey] || null;
  }
};

