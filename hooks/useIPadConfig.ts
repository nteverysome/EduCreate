/**
 * iPad 統一配置 Hook
 * 基於 EduCreate 現有的 iPad 配置系統
 * 支持 iPad mini, iPad Air, iPad Pro 11", iPad Pro 12.9"
 */

import { useMemo } from 'react';

export interface IPadConfig {
  containerSize: 'small' | 'medium' | 'large' | 'xlarge';
  margins: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  spacing: {
    horizontal: number;
    vertical: number;
  };
  card: {
    minWidth: number;
    minHeight: number;
    maxWidth: number;
    maxHeight: number;
  };
  font: {
    chinese: number;
    english: number;
  };
  cols: number;
  rows?: number;
}

/**
 * 分類 iPad 容器大小
 * 基於 iPad_UNIFIED_CONFIG_IMPLEMENTATION.js
 */
function classifyIPadContainerSize(width: number, height: number): 'small' | 'medium' | 'large' | 'xlarge' {
  if (width <= 768) {
    return 'small';      // iPad mini: 768×1024
  } else if (width <= 820) {
    return 'medium';     // iPad/Air: 810×1080, 820×1180
  } else if (width <= 834) {
    return 'large';      // iPad Pro 11": 834×1194
  } else {
    return 'xlarge';     // iPad Pro 12.9": 1024×1366
  }
}

/**
 * 獲取 iPad 配置
 * 基於容器大小
 */
function getIPadConfigBySize(containerSize: 'small' | 'medium' | 'large' | 'xlarge'): IPadConfig {
  const configs: Record<string, IPadConfig> = {
    small: {
      containerSize: 'small',
      margins: { top: 35, bottom: 35, left: 15, right: 15 },
      spacing: { horizontal: 12, vertical: 30 },
      card: { minWidth: 80, minHeight: 80, maxWidth: 100, maxHeight: 100 },
      font: { chinese: 22, english: 16 },
      cols: 4,
    },
    medium: {
      containerSize: 'medium',
      margins: { top: 40, bottom: 46, left: 18, right: 18 },
      spacing: { horizontal: 16, vertical: 35 },
      card: { minWidth: 100, minHeight: 100, maxWidth: 120, maxHeight: 120 },
      font: { chinese: 28, english: 20 },
      cols: 5,
    },
    large: {
      containerSize: 'large',
      margins: { top: 45, bottom: 50, left: 24, right: 24 },
      spacing: { horizontal: 16, vertical: 40 },
      card: { minWidth: 110, minHeight: 110, maxWidth: 140, maxHeight: 140 },
      font: { chinese: 30, english: 22 },
      cols: 6,
    },
    xlarge: {
      containerSize: 'xlarge',
      margins: { top: 50, bottom: 50, left: 32, right: 32 },
      spacing: { horizontal: 16, vertical: 40 },
      card: { minWidth: 130, minHeight: 130, maxWidth: 150, maxHeight: 150 },
      font: { chinese: 32, english: 24 },
      cols: 6,
    },
  };

  return configs[containerSize];
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
  
  // iPad Pro 通常有更高的 DPI 和特定的 User Agent
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
 * useIPadConfig Hook
 * 根據容器寬度和高度返回 iPad 配置
 */
export function useIPadConfig(width: number, height: number): IPadConfig | null {
  return useMemo(() => {
    // 檢查是否為 iPad 設備
    if (!detectIPadDevice()) {
      return null;
    }

    // 分類容器大小
    const containerSize = classifyIPadContainerSize(width, height);

    // 獲取配置
    return getIPadConfigBySize(containerSize);
  }, [width, height]);
}

/**
 * 設備檢測 Hook
 */
export function useDeviceDetection() {
  return useMemo(() => ({
    isIPad: detectIPadDevice(),
    isIPadPro: detectIPadPro(),
    isIPadAir: detectIPadAir(),
  }), []);
}

/**
 * 導出工具函數供非 React 代碼使用
 */
export const IPadConfigUtils = {
  classifyIPadContainerSize,
  getIPadConfigBySize,
  detectIPadDevice,
  detectIPadPro,
  detectIPadAir,
};

