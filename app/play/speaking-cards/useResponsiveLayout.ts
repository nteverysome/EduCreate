/**
 * useResponsiveLayout Hook
 * 為 Speaking Cards 提供響應式佈局功能
 */

import { useState, useEffect, useCallback } from 'react';
import { SpeakingCardsResponsiveLayout, ResponsiveLayoutConfig } from './responsive-layout';

export function useResponsiveLayout() {
  const [layout, setLayout] = useState<SpeakingCardsResponsiveLayout | null>(null);
  const [config, setConfig] = useState<ResponsiveLayoutConfig | null>(null);
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  });

  // 處理窗口大小變化
  const handleResize = useCallback(() => {
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight
    });
  }, []);

  // 初始化和監聽窗口大小變化
  useEffect(() => {
    // 初始化
    handleResize();

    // 添加事件監聽
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [handleResize]);

  // 當窗口大小變化時，更新佈局
  useEffect(() => {
    const newLayout = new SpeakingCardsResponsiveLayout(windowSize.width, windowSize.height);
    setLayout(newLayout);
    setConfig(newLayout.getFullConfig());

    console.log('📱 響應式佈局已更新:', {
      breakpoint: newLayout.getBreakpoint(),
      width: windowSize.width,
      height: windowSize.height,
      isIPad: newLayout.getFullConfig().isIPad,
      cardSize: newLayout.getCardSize()
    });
  }, [windowSize]);

  return {
    layout,
    config,
    windowSize,
    // 便利方法
    breakpoint: layout?.getBreakpoint(),
    cardSize: layout?.getCardSize(),
    buttonSize: layout?.getButtonSize(),
    margins: layout?.getMargins(),
    gaps: layout?.getGaps(),
    fontSize: layout?.getFontSizes(),
    cardStyle: layout?.getCardStyle(),
    buttonStyle: layout?.getButtonStyle(),
    isMobile: layout?.isMobile(),
    isTablet: layout?.isTablet(),
    isDesktop: layout?.isDesktop(),
    isWide: layout?.isWide(),
    isPortrait: layout?.isPortraitMode(),
    isLandscape: layout?.isLandscapeMode(),
    isIPad: config?.isIPad,
    iPadModel: config?.iPadModel
  };
}

