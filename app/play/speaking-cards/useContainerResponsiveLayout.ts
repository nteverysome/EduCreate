'use client';

import { useRef, useState, useEffect } from 'react';

interface ContainerSize {
  width: number;
  height: number;
}

interface CardDimensions {
  width: number;
  height: number;
}

/**
 * 容器感知的響應式佈局 Hook
 * 根據實際容器大小動態計算卡片尺寸
 * 解決 iPhone 等小屏幕設備上卡片尺寸不適應的問題
 */
export function useContainerResponsiveLayout() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState<ContainerSize>({ width: 0, height: 0 });
  const [cardDimensions, setCardDimensions] = useState<CardDimensions>({ width: 200, height: 280 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 創建 ResizeObserver 監聽容器大小變化
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        
        // 更新容器大小
        setContainerSize({ width, height });

        // 根據容器寬度計算卡片尺寸
        const calculatedCardDimensions = calculateCardDimensions(width, height);
        setCardDimensions(calculatedCardDimensions);

        console.log(`📱 容器大小: ${width.toFixed(0)}×${height.toFixed(0)}px, 卡片大小: ${calculatedCardDimensions.width}×${calculatedCardDimensions.height}px`);
      }
    });

    // 開始監聽
    resizeObserver.observe(container);

    // 初始計算
    const rect = container.getBoundingClientRect();
    const calculatedCardDimensions = calculateCardDimensions(rect.width, rect.height);
    setContainerSize({ width: rect.width, height: rect.height });
    setCardDimensions(calculatedCardDimensions);

    // 清理
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  /**
   * 根據容器大小計算卡片尺寸
   * 考慮 padding、margin 和安全區域
   */
  function calculateCardDimensions(containerWidth: number, containerHeight: number): CardDimensions {
    if (containerWidth === 0) {
      return { width: 200, height: 280 };
    }

    // 考慮 padding 和 margin（總共約 32px）
    const horizontalPadding = 32;
    const availableWidth = containerWidth - horizontalPadding;

    // 卡片寬度 = 可用寬度 * 0.85（留出一些空間）
    const cardWidth = Math.max(160, Math.min(availableWidth * 0.85, 320));

    // 卡片高度 = 卡片寬度 * 1.4（保持寬高比）
    const cardHeight = cardWidth * 1.4;

    return {
      width: Math.round(cardWidth),
      height: Math.round(cardHeight)
    };
  }

  return {
    containerRef,
    containerSize,
    cardDimensions,
    cardWidth: cardDimensions.width,
    cardHeight: cardDimensions.height
  };
}

