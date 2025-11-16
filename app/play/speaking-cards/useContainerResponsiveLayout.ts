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
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  // 追蹤 ref 元素狀態
  const [refElement, setRefElement] = useState<HTMLDivElement | null>(null);

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
   * 計算佈局指標（業界標準算法 - 優化橫向模式）
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

    let cardWidth: number;
    let cardHeight: number;

    // 5. 業界標準：橫向模式優先考慮高度限制
    if (orientation === 'landscape') {
      // 橫向模式：高度是瓶頸，從高度開始計算
      // 使用 65% 的可用高度（留 35% 空間給標題、按鈕等）
      const maxCardHeight = availableHeight * 0.65;
      cardHeight = maxCardHeight;
      cardWidth = cardHeight / DESIGN_TOKENS.cardSize.aspectRatio;

      // 確保寬度不超過可用寬度
      if (cardWidth > availableWidth) {
        cardWidth = availableWidth;
        cardHeight = cardWidth * DESIGN_TOKENS.cardSize.aspectRatio;
      }

      // 應用最小/最大限制
      cardWidth = Math.max(DESIGN_TOKENS.cardSize.minWidth, cardWidth);
      cardWidth = Math.min(DESIGN_TOKENS.cardSize.maxWidth, cardWidth);
      cardHeight = cardWidth * DESIGN_TOKENS.cardSize.aspectRatio;

      // 最終檢查：確保不超過可用高度
      if (cardHeight > availableHeight) {
        cardHeight = availableHeight;
        cardWidth = cardHeight / DESIGN_TOKENS.cardSize.aspectRatio;
      }
    } else {
      // 直向模式：寬度是主要考量
      // 6. 計算卡片寬度
      cardWidth = availableWidth * widthRatio;

      // 7. 應用最小/最大限制
      cardWidth = Math.max(DESIGN_TOKENS.cardSize.minWidth, cardWidth);
      cardWidth = Math.min(DESIGN_TOKENS.cardSize.maxWidth, cardWidth);

      // 8. 計算卡片高度（保持寬高比）
      cardHeight = cardWidth * DESIGN_TOKENS.cardSize.aspectRatio;

      // 9. 確保卡片不超過可用高度
      if (cardHeight > availableHeight) {
        cardHeight = availableHeight;
        cardWidth = cardHeight / DESIGN_TOKENS.cardSize.aspectRatio;

        // 再次檢查寬度是否超過可用寬度
        if (cardWidth > availableWidth) {
          cardWidth = availableWidth;
          cardHeight = cardWidth * DESIGN_TOKENS.cardSize.aspectRatio;
        }
      }
    }

    // 10. 最終確保卡片尺寸在容器內（雙重保險）
    const finalCardWidth = Math.min(cardWidth, availableWidth);
    const finalCardHeight = Math.min(cardHeight, availableHeight);

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
      cardWidth: Math.round(finalCardWidth),
      cardHeight: Math.round(finalCardHeight),
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

        // 詳細日誌（包含容器適配檢查）
        const cardFitsWidth = metrics.cardWidth <= metrics.availableWidth;
        const cardFitsHeight = metrics.cardHeight <= metrics.availableHeight;
        const cardFitsContainer = cardFitsWidth && cardFitsHeight;

        console.log('📐 [容器響應式系統] 佈局更新', {
          容器尺寸: `${width.toFixed(0)}×${height.toFixed(0)}px`,
          斷點: `${metrics.breakpoint.name} (${metrics.breakpoint.description})`,
          方向: metrics.orientation === 'portrait' ? '直向' : '橫向',
          寬高比: metrics.aspectRatio.toFixed(2),
          可用空間: `${metrics.availableWidth.toFixed(0)}×${metrics.availableHeight.toFixed(0)}px`,
          Padding: `${metrics.padding}px`,
          Gap: `${metrics.gap}px`,
          卡片尺寸: `${metrics.cardWidth}×${metrics.cardHeight}px`,
          字體大小: `標題:${metrics.fontSize.title}px, 正文:${metrics.fontSize.body}px, 小字:${metrics.fontSize.small}px`,
          容器適配: cardFitsContainer ? '✅ 完全適配' : `⚠️ 超出容器 (寬度:${cardFitsWidth ? '✅' : '❌'}, 高度:${cardFitsHeight ? '✅' : '❌'})`
        });
      }
    }, 100); // 100ms 防抖
  }, [calculateLayoutMetrics]);

  // 初始化函數：當容器 ref 設置時調用
  const initializeObserver = useCallback((container: HTMLDivElement) => {
    console.log('🎯 [容器響應式系統] 初始化 Observer');

    // 清理舊的 observer
    if (resizeObserverRef.current) {
      resizeObserverRef.current.disconnect();
    }

    // 業界標準：使用視口尺寸而不是容器尺寸
    // 這樣可以避免容器高度依賴內容的循環依賴問題
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // 創建新的 ResizeObserver（監聽視口變化）
    const resizeObserver = new ResizeObserver(() => {
      handleResize([{
        target: container,
        contentRect: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      } as any]);
    });
    resizeObserverRef.current = resizeObserver;

    // 開始監聽
    resizeObserver.observe(container);

    // 初始計算（使用視口尺寸）
    const metrics = calculateLayoutMetrics(viewportWidth, viewportHeight);
    setContainerSize({ width: viewportWidth, height: viewportHeight });
    setLayoutMetrics(metrics);

    console.log('🚀 [容器響應式系統] 初始化完成', {
      視口尺寸: `${viewportWidth.toFixed(0)}×${viewportHeight.toFixed(0)}px`,
      斷點: `${metrics.breakpoint.name} (${metrics.breakpoint.description})`,
      方向: metrics.orientation === 'portrait' ? '直向' : '橫向',
      卡片尺寸: `${metrics.cardWidth}×${metrics.cardHeight}px`
    });
  }, [handleResize, calculateLayoutMetrics]);

  // 監聽 ref 元素的變化（修復 ref 時機問題）
  useEffect(() => {
    if (containerRef.current && containerRef.current !== refElement) {
      console.log('✅ [容器響應式系統] containerRef 已設置');
      setRefElement(containerRef.current);
    }
  });

  // 當 refElement 設置後，初始化 observer
  useEffect(() => {
    if (!refElement) {
      return;
    }

    console.log('✅ [容器響應式系統] refElement 存在，初始化 observer');

    // 初始化 observer
    initializeObserver(refElement);

    // 清理
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        console.log('🧹 [容器響應式系統] 已清理');
      }
    };
  }, [refElement, initializeObserver]);

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

