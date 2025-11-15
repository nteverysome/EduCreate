'use client';

import { useRef, useState, useEffect, useCallback } from 'react';

// ============================================
// 類型定義
// ============================================

interface ContainerSize {
  width: number;
  height: number;
}

interface CardDimensions {
  width: number;
  height: number;
}

interface ContainerBreakpoint {
  name: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  min: number;
  max: number;
  description: string;
}

interface LayoutMetrics {
  containerWidth: number;
  containerHeight: number;
  breakpoint: ContainerBreakpoint;
  orientation: 'portrait' | 'landscape';
  aspectRatio: number;
  availableWidth: number;
  availableHeight: number;
  padding: number;
  gap: number;
  cardWidth: number;
  cardHeight: number;
  fontSize: {
    title: number;
    body: number;
    small: number;
  };
}

// ============================================
// 容器斷點系統（業界標準）
// ============================================

const CONTAINER_BREAKPOINTS: ContainerBreakpoint[] = [
  { name: 'xs', min: 0, max: 374, description: '超小容器（小手機）' },
  { name: 'sm', min: 375, max: 639, description: '小容器（手機）' },
  { name: 'md', min: 640, max: 767, description: '中容器（大手機/小平板）' },
  { name: 'lg', min: 768, max: 1023, description: '大容器（平板）' },
  { name: 'xl', min: 1024, max: 1279, description: '超大容器（桌面）' },
  { name: 'xxl', min: 1280, max: Infinity, description: '超超大容器（寬屏）' }
];

// ============================================
// 設計令牌系統
// ============================================

const DESIGN_TOKENS = {
  // 卡片尺寸範圍
  cardSize: {
    minWidth: 140,
    maxWidth: 400,
    aspectRatio: 1.4, // 高度 = 寬度 × 1.4
  },

  // 容器 padding（根據斷點）
  padding: {
    xs: 12,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
    xxl: 40
  },

  // 卡片間距（根據斷點）
  gap: {
    xs: 12,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
    xxl: 40
  },

  // 字體大小（根據斷點）
  fontSize: {
    xs: { title: 18, body: 14, small: 12 },
    sm: { title: 20, body: 16, small: 13 },
    md: { title: 22, body: 18, small: 14 },
    lg: { title: 24, body: 20, small: 15 },
    xl: { title: 28, body: 22, small: 16 },
    xxl: { title: 32, body: 24, small: 18 }
  },

  // 卡片寬度佔比（根據斷點和方向）
  cardWidthRatio: {
    portrait: {
      xs: 0.85,  // 超小屏幕：85% 寬度
      sm: 0.80,  // 小屏幕：80% 寬度
      md: 0.75,  // 中屏幕：75% 寬度
      lg: 0.70,  // 大屏幕：70% 寬度
      xl: 0.65,  // 超大屏幕：65% 寬度
      xxl: 0.60  // 超超大屏幕：60% 寬度
    },
    landscape: {
      xs: 0.70,
      sm: 0.65,
      md: 0.60,
      lg: 0.55,
      xl: 0.50,
      xxl: 0.45
    }
  }
};

// ============================================
// 業界標準容器感知響應式佈局 Hook
// ============================================

/**
 * 業界標準的容器感知響應式佈局 Hook
 *
 * 特性：
 * - 多斷點系統（6 個容器斷點）
 * - 方向感知（橫向/直向）
 * - 動態 padding 和 gap
 * - 智能卡片尺寸計算
 * - 性能優化（防抖）
 * - 詳細日誌
 *
 * @returns {Object} 容器引用、佈局指標和卡片尺寸
 */
export function useContainerResponsiveLayout() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState<ContainerSize>({ width: 0, height: 0 });
  const [layoutMetrics, setLayoutMetrics] = useState<LayoutMetrics | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * 獲取容器斷點
   */
  const getContainerBreakpoint = useCallback((width: number): ContainerBreakpoint => {
    for (const breakpoint of CONTAINER_BREAKPOINTS) {
      if (width >= breakpoint.min && width <= breakpoint.max) {
        return breakpoint;
      }
    }
    return CONTAINER_BREAKPOINTS[0]; // 默認返回 xs
  }, []);

  /**
   * 計算佈局指標（業界標準算法）
   */
  const calculateLayoutMetrics = useCallback((containerWidth: number, containerHeight: number): LayoutMetrics => {
    // 1. 確定斷點
    const breakpoint = getContainerBreakpoint(containerWidth);

    // 2. 確定方向
    const orientation: 'portrait' | 'landscape' = containerHeight > containerWidth ? 'portrait' : 'landscape';
    const aspectRatio = containerWidth / containerHeight;

    // 3. 獲取設計令牌
    const padding = DESIGN_TOKENS.padding[breakpoint.name];
    const gap = DESIGN_TOKENS.gap[breakpoint.name];
    const fontSize = DESIGN_TOKENS.fontSize[breakpoint.name];
    const widthRatio = DESIGN_TOKENS.cardWidthRatio[orientation][breakpoint.name];

    // 4. 計算可用空間
    const availableWidth = containerWidth - (padding * 2);
    const availableHeight = containerHeight - (padding * 2);

    // 5. 計算卡片寬度
    let cardWidth = availableWidth * widthRatio;

    // 6. 應用最小/最大限制
    cardWidth = Math.max(DESIGN_TOKENS.cardSize.minWidth, cardWidth);
    cardWidth = Math.min(DESIGN_TOKENS.cardSize.maxWidth, cardWidth);

    // 7. 計算卡片高度（保持寬高比）
    const cardHeight = cardWidth * DESIGN_TOKENS.cardSize.aspectRatio;

    // 8. 確保卡片不超過可用高度
    if (cardHeight > availableHeight) {
      const adjustedCardHeight = availableHeight;
      cardWidth = adjustedCardHeight / DESIGN_TOKENS.cardSize.aspectRatio;
    }

    return {
      containerWidth,
      containerHeight,
      breakpoint,
      orientation,
      aspectRatio,
      availableWidth,
      availableHeight,
      padding,
      gap,
      cardWidth: Math.round(cardWidth),
      cardHeight: Math.round(cardWidth * DESIGN_TOKENS.cardSize.aspectRatio),
      fontSize
    };
  }, [getContainerBreakpoint]);

  /**
   * 處理容器大小變化（帶防抖）
   */
  const handleResize = useCallback((entries: ResizeObserverEntry[]) => {
    // 清除之前的定時器
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // 設置新的定時器（防抖 100ms）
    debounceTimerRef.current = setTimeout(() => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;

        // 更新容器大小
        setContainerSize({ width, height });

        // 計算佈局指標
        const metrics = calculateLayoutMetrics(width, height);
        setLayoutMetrics(metrics);

        // 詳細日誌
        console.log('📐 [容器響應式系統] 佈局更新', {
          容器尺寸: `${width.toFixed(0)}×${height.toFixed(0)}px`,
          斷點: `${metrics.breakpoint.name} (${metrics.breakpoint.description})`,
          方向: metrics.orientation === 'portrait' ? '直向' : '橫向',
          寬高比: metrics.aspectRatio.toFixed(2),
          可用空間: `${metrics.availableWidth.toFixed(0)}×${metrics.availableHeight.toFixed(0)}px`,
          Padding: `${metrics.padding}px`,
          Gap: `${metrics.gap}px`,
          卡片尺寸: `${metrics.cardWidth}×${metrics.cardHeight}px`,
          字體大小: `標題:${metrics.fontSize.title}px, 正文:${metrics.fontSize.body}px, 小字:${metrics.fontSize.small}px`
        });
      }
    }, 100); // 100ms 防抖
  }, [calculateLayoutMetrics]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 創建 ResizeObserver
    const resizeObserver = new ResizeObserver(handleResize);

    // 開始監聽
    resizeObserver.observe(container);

    // 初始計算
    const rect = container.getBoundingClientRect();
    const metrics = calculateLayoutMetrics(rect.width, rect.height);
    setContainerSize({ width: rect.width, height: rect.height });
    setLayoutMetrics(metrics);

    console.log('🚀 [容器響應式系統] 初始化完成', {
      容器尺寸: `${rect.width.toFixed(0)}×${rect.height.toFixed(0)}px`,
      斷點: `${metrics.breakpoint.name} (${metrics.breakpoint.description})`
    });

    // 清理
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      resizeObserver.disconnect();
      console.log('🧹 [容器響應式系統] 已清理');
    };
  }, [handleResize, calculateLayoutMetrics]);

  // 返回值
  return {
    // 容器引用
    containerRef,

    // 容器大小
    containerSize,

    // 完整的佈局指標
    layoutMetrics,

    // 便捷訪問（向後兼容）
    cardWidth: layoutMetrics?.cardWidth || 200,
    cardHeight: layoutMetrics?.cardHeight || 280,

    // 額外的佈局信息
    breakpoint: layoutMetrics?.breakpoint.name || 'sm',
    orientation: layoutMetrics?.orientation || 'portrait',
    padding: layoutMetrics?.padding || 16,
    gap: layoutMetrics?.gap || 16,
    fontSize: layoutMetrics?.fontSize || { title: 20, body: 16, small: 13 }
  };
}

