'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronDownIcon, PlayIcon, BookOpenIcon } from '@heroicons/react/24/outline';

// 遊戲配置類型定義
interface GameConfig {
  id: string;
  name: string;
  displayName: string;
  description: string;
  url: string;
  type: 'main' | 'iframe' | 'vite' | 'component';
  memoryType: string;
  geptLevels: ('elementary' | 'intermediate' | 'advanced')[];
  status: 'completed' | 'development' | 'planned';
  icon: string;
  estimatedLoadTime: number; // ms
}

// 遊戲狀態類型
interface GameState {
  score: number;
  level: string;
  progress: number;
  timeSpent: number;
}

// 組件 Props
interface GameSwitcherProps {
  defaultGame?: string;
  geptLevel?: 'elementary' | 'intermediate' | 'advanced';
  onGameChange?: (gameId: string) => void;
  onGameStateUpdate?: (gameId: string, state: GameState) => void;
  className?: string;
  hideGeptSelector?: boolean;
  currentGeptLevel?: string;
}

// 基礎遊戲配置數據 (不包含動態 URL)
const BASE_GAMES_CONFIG: Omit<GameConfig, 'url'>[] = [
  {
    id: 'airplane-vite',
    name: 'airplane',
    displayName: '飛機遊戲 (Vite版)',
    description: 'Phaser 3 + Vite 完整版飛機碰撞遊戲，記憶科學驅動的英語詞彙學習',
    type: 'iframe',
    memoryType: '動態反應記憶',
    geptLevels: ['elementary', 'intermediate', 'advanced'],
    status: 'completed',
    icon: '⚡',
    estimatedLoadTime: 600
  },
  {
    id: 'airplane-main',
    name: 'airplane',
    displayName: '飛機碰撞遊戲',
    description: '通過飛機碰撞雲朵學習英語詞彙，基於主動回憶和視覺記憶原理',
    type: 'main',
    memoryType: '動態反應記憶',
    geptLevels: ['elementary', 'intermediate', 'advanced'],
    status: 'completed',
    icon: '✈️',
    estimatedLoadTime: 800
  },
  {
    id: 'airplane-iframe',
    name: 'airplane',
    displayName: '飛機遊戲 (iframe版)',
    description: 'Phaser 3 + Vite 完整版飛機碰撞遊戲，記憶科學驅動的英語詞彙學習',
    type: 'iframe',
    memoryType: '動態反應記憶',
    geptLevels: ['elementary', 'intermediate', 'advanced'],
    status: 'completed',
    icon: '🎮',
    estimatedLoadTime: 1000
  },
  {
    id: 'shimozurdo-game',
    name: 'shimozurdo',
    displayName: 'Shimozurdo 雲朵遊戲',
    description: 'Phaser 3 雲朵碰撞遊戲，支援全螢幕和響應式設計，記憶科學驅動的英語學習',
    type: 'iframe',
    memoryType: '動態反應記憶',
    geptLevels: ['elementary', 'intermediate', 'advanced'],
    status: 'completed',
    icon: '☁️',
    estimatedLoadTime: 800
  },
  {
    id: 'shimozurdo-responsive',
    name: 'shimozurdo',
    displayName: 'shimozurdo 響應式遊戲',
    description: 'Phaser 3 響應式遊戲，支援全螢幕和方向切換，記憶科學驅動學習',
    type: 'iframe',
    memoryType: '空間視覺記憶',
    geptLevels: ['elementary', 'intermediate', 'advanced'],
    status: 'completed',
    icon: '🎯',
    estimatedLoadTime: 800
  },
  {
    id: 'starshake-game',
    name: 'starshake',
    displayName: 'Starshake 太空冒險',
    description: '一個充滿樂趣的太空冒險遊戲，基於 Phaser 3 引擎開發的動作遊戲',
    type: 'iframe',
    memoryType: '動態反應記憶',
    geptLevels: ['elementary', 'intermediate', 'advanced'],
    status: 'completed',
    icon: '🌟',
    estimatedLoadTime: 1000
  },
  {
    id: 'runner-game',
    name: 'runner',
    displayName: 'Runner 跑酷遊戲',
    description: '一個刺激的跑酷遊戲，通過跳躍和收集金幣來挑戰高分，基於 Phaser 3 引擎開發',
    type: 'iframe',
    memoryType: '動態反應記憶',
    geptLevels: ['elementary', 'intermediate', 'advanced'],
    status: 'completed',
    icon: '🏃',
    estimatedLoadTime: 1000
  },
  {
    id: 'pushpull-game',
    name: 'pushpull',
    displayName: 'PushPull 推拉方塊',
    description: '一個策略性的推拉方塊遊戲，通過移動彩色方塊到指定位置來解決謎題，基於 Phaser 3 引擎開發',
    type: 'iframe',
    memoryType: '重構邏輯記憶',
    geptLevels: ['elementary', 'intermediate', 'advanced'],
    status: 'completed',
    icon: '🧩',
    estimatedLoadTime: 1200
  },
  {
    id: 'wallhammer-game',
    name: 'wallhammer',
    displayName: 'WallHammer 破牆遊戲',
    description: '一個經典的破牆冒險遊戲，通過錘子破壞磚牆收集金幣和道具，基於 Phaser 3 引擎開發',
    type: 'iframe',
    memoryType: '動態反應記憶',
    geptLevels: ['elementary', 'intermediate', 'advanced'],
    status: 'completed',
    icon: '🔨',
    estimatedLoadTime: 1300
  },
  {
    id: 'zenbaki-game',
    name: 'zenbaki',
    displayName: 'Zenbaki 數字遊戲',
    description: '一個基於數字的策略遊戲，通過數字計算和邏輯推理來解決謎題，基於 Phaser 3 引擎開發',
    type: 'iframe',
    memoryType: '基礎記憶',
    geptLevels: ['elementary', 'intermediate', 'advanced'],
    status: 'completed',
    icon: '🔢',
    estimatedLoadTime: 1100
  },
  {
    id: 'mars-game',
    name: 'mars',
    displayName: 'Mars 火星探險',
    description: '一個火星探險遊戲，通過探索火星地形和收集資源來完成任務，基於 Phaser 3 引擎開發',
    type: 'iframe',
    memoryType: '空間視覺記憶',
    geptLevels: ['elementary', 'intermediate', 'advanced'],
    status: 'completed',
    icon: '🔴',
    estimatedLoadTime: 1200
  },
  {
    id: 'fate-game',
    name: 'fate',
    displayName: 'Fate 命運之戰',
    description: '一個3D太空戰鬥遊戲，通過駕駛太空船戰鬥和探索來完成任務，基於 Phaser 3 引擎開發',
    type: 'iframe',
    memoryType: '動態反應記憶',
    geptLevels: ['elementary', 'intermediate', 'advanced'],
    status: 'completed',
    icon: '⚡',
    estimatedLoadTime: 1400
  },
  // 未來遊戲預留位置
  {
    id: 'matching-pairs',
    name: 'matching',
    displayName: '配對遊戲',
    description: '通過配對卡片強化視覺記憶和關聯學習',
    type: 'main',
    memoryType: '空間視覺記憶',
    geptLevels: ['elementary', 'intermediate', 'advanced'],
    status: 'development',
    icon: '🃏',
    estimatedLoadTime: 700
  },
  {
    id: 'quiz-game',
    name: 'quiz',
    displayName: '問答遊戲',
    description: '基於主動回憶的快速問答學習',
    type: 'main',
    memoryType: '基礎記憶',
    geptLevels: ['elementary', 'intermediate', 'advanced'],
    status: 'development',
    icon: '❓',
    estimatedLoadTime: 500
  },
  {
    id: 'sequence-game',
    name: 'sequence',
    displayName: '序列遊戲',
    description: '通過序列記憶強化學習效果',
    type: 'main',
    memoryType: '重構邏輯記憶',
    geptLevels: ['elementary', 'intermediate', 'advanced'],
    status: 'planned',
    icon: '🔢',
    estimatedLoadTime: 600
  },
  {
    id: 'flashcard-game',
    name: 'flashcard',
    displayName: '閃卡遊戲',
    description: '經典閃卡學習，支援間隔重複算法',
    type: 'main',
    memoryType: '基礎記憶',
    geptLevels: ['elementary', 'intermediate', 'advanced'],
    status: 'planned',
    icon: '📚',
    estimatedLoadTime: 400
  }
];

// 動態生成完整的遊戲配置
const getGamesConfig = (): GameConfig[] => {
  const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';

  return BASE_GAMES_CONFIG.map(game => ({
    ...game,
    url: getGameUrl(game.id, isLocalhost)
  }));
};

// 獲取遊戲 URL 的輔助函數
const getGameUrl = (gameId: string, isLocalhost: boolean): string => {
  switch (gameId) {
    case 'airplane-vite':
      return isLocalhost ? 'http://localhost:3002/' : '/games/airplane-game/';
    case 'airplane-main':
      return isLocalhost ? 'http://localhost:3002/' : '/games/airplane-game/';
    case 'airplane-iframe':
      return isLocalhost ? 'http://localhost:3002/' : '/games/airplane-game/';
    case 'shimozurdo-game':
      return '/games/shimozurdo-game/';
    case 'shimozurdo-responsive':
      return '/games/shimozurdo-game/';
    case 'starshake-game':
      return '/games/starshake-game/dist/';
    case 'runner-game':
      return '/games/runner-game/dist/';
    case 'pushpull-game':
      return '/games/pushpull-game/dist/';
    case 'wallhammer-game':
      return '/games/wallhammer-game/dist/';
    case 'zenbaki-game':
      return '/games/zenbaki-game/dist/';
    case 'mars-game':
      return '/games/mars-game/dist/';
    case 'fate-game':
      return '/games/fate-game/dist/';
    case 'matching-pairs':
      return '/games/matching-pairs';
    case 'quiz-game':
      return '/games/quiz';
    case 'sequence-game':
      return '/games/sequence';
    case 'flashcard-game':
      return '/games/flashcard';
    default:
      return '/games/default';
  }
};

const GameSwitcher: React.FC<GameSwitcherProps> = ({
  defaultGame = 'shimozurdo-game',
  geptLevel = 'elementary',
  onGameChange,
  onGameStateUpdate,
  className = '',
  hideGeptSelector = false,
  currentGeptLevel: propGeptLevel = 'elementary'
}) => {
  // 狀態管理
  const [currentGameId, setCurrentGameId] = useState<string>(defaultGame);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [gameStates, setGameStates] = useState<Record<string, GameState>>({});
  const [currentGeptLevel, setCurrentGeptLevel] = useState(geptLevel);
  const [mounted, setMounted] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Refs
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const loadingTimeoutRef = useRef<NodeJS.Timeout>();
  const progressIntervalRef = useRef<NodeJS.Timeout>();

  const containerRef = useRef<HTMLDivElement>(null);
  const [showTapOverlay, setShowTapOverlay] = useState<boolean>(false);

  // 父頁面全螢幕退出按鈕狀態
  const [showExitOverlay, setShowExitOverlay] = useState(false);
  const [isParentFullscreenActive, setIsParentFullscreenActive] = useState(false);

  // 確保父頁面全螢幕樣式存在（避免重複注入）
  const ensureParentFullscreenStyles = () => {
    let style = document.getElementById('parent-fullscreen-style');
    if (!style) {
      style = document.createElement('style');
      style.id = 'parent-fullscreen-style';
      style.textContent = `
        body.parent-fullscreen-game { margin:0 !important; padding:0 !important; overflow:hidden !important; background:black !important; }
        body.parent-fullscreen-game [data-testid="game-container"],
        body.parent-fullscreen-game .game-iframe-container { position: fixed !important; inset: 0 !important; width: 100vw !important; height: 100dvh !important; z-index: 999999 !important; background: black !important; }
        body.parent-fullscreen-game .game-iframe-container iframe { width:100% !important; height:100% !important; border:0 !important; }
      `;
      document.head.appendChild(style);
    }
  };

  // 🔒 確保鎖定全螢幕樣式存在
  const ensureLockedFullscreenStyles = () => {
    let style = document.getElementById('locked-fullscreen-style');
    if (!style) {
      style = document.createElement('style');
      style.id = 'locked-fullscreen-style';
      style.textContent = `
        body.locked-fullscreen {
          margin: 0 !important;
          padding: 0 !important;
          overflow: hidden !important;
          background: black !important;
          user-select: none !important;
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          touch-action: none !important;
          -webkit-touch-callout: none !important;
          -webkit-tap-highlight-color: transparent !important;
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          height: 100dvh !important;
          z-index: 2147483647 !important;
        }

        body.locked-fullscreen [data-testid="game-container"],
        body.locked-fullscreen .game-iframe-container {
          position: fixed !important;
          inset: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          height: 100dvh !important;
          z-index: 2147483647 !important;
          background: black !important;
          overflow: hidden !important;
        }

        body.locked-fullscreen .game-iframe-container iframe {
          width: 100% !important;
          height: 100% !important;
          border: 0 !important;
        }

        /* 隱藏滾動條 */
        body.locked-fullscreen::-webkit-scrollbar {
          display: none !important;
        }

        /* 移動設備特殊處理 */
        @media screen and (max-width: 768px) {
          body.locked-fullscreen {
            height: calc(100vh + env(keyboard-inset-height, 0px)) !important;
            padding-bottom: env(safe-area-inset-bottom, 0px) !important;
          }
        }

        /* iOS Safari 特殊處理 */
        @supports (-webkit-touch-callout: none) {
          body.locked-fullscreen {
            height: -webkit-fill-available !important;
          }
        }
      `;
      document.head.appendChild(style);
    }
  };

  // 🔒 鎖定全螢幕輔助函數
  const preventDefaultEvent = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  };

  const handleFullscreenLockKeys = (e: KeyboardEvent) => {
    // 禁用可能退出全螢幕的快捷鍵
    const blockedKeys = ['F11', 'F5', 'F12', 'Tab'];
    const blockedCombos = [
      { ctrl: true, key: 'r' }, // Ctrl+R 刷新
      { ctrl: true, key: 'w' }, // Ctrl+W 關閉
      { ctrl: true, key: 't' }, // Ctrl+T 新分頁
      { alt: true, key: 'F4' },  // Alt+F4 關閉
      { cmd: true, key: 'r' },   // Cmd+R 刷新 (Mac)
      { cmd: true, key: 'w' },   // Cmd+W 關閉 (Mac)
    ];

    if (blockedKeys.includes(e.key)) {
      console.log('🔒 阻止快捷鍵:', e.key);
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    for (const combo of blockedCombos) {
      if ((combo.ctrl && e.ctrlKey) || (combo.cmd && e.metaKey) || (combo.alt && e.altKey)) {
        if (e.key.toLowerCase() === combo.key.toLowerCase()) {
          console.log('🔒 阻止組合鍵:', combo);
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      }
    }
  };

  // 🔒 智能觸控事件處理（只在遊戲區域內禁用滾動）
  const handleSmartTouchMove = (e: TouchEvent) => {
    // 檢查是否在全螢幕狀態
    const isInFullscreen = !!(document.fullscreenElement ||
                             (document as any).webkitFullscreenElement ||
                             (document as any).mozFullScreenElement ||
                             (document as any).msFullscreenElement);

    // 檢查是否有鎖定全螢幕樣式
    const hasLockedClass = document.body.classList.contains('locked-fullscreen');

    // 只在真正的鎖定全螢幕狀態下才阻止滾動
    if (isInFullscreen && hasLockedClass) {
      console.log('🔒 鎖定全螢幕狀態，阻止觸控滾動');
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // 其他情況允許正常滾動
    return true;
  };

  const enableFullscreenLock = () => {
    console.log('🔒 啟用全螢幕鎖定功能');

    // 禁用右鍵選單
    document.addEventListener('contextmenu', preventDefaultEvent, { passive: false });

    // 禁用文字選取
    document.addEventListener('selectstart', preventDefaultEvent, { passive: false });

    // 禁用拖拽
    document.addEventListener('dragstart', preventDefaultEvent, { passive: false });

    // 禁用常見的退出全螢幕快捷鍵
    document.addEventListener('keydown', handleFullscreenLockKeys, { passive: false });

    // 🔒 智能滾動控制（只在真正全螢幕時禁用）
    document.addEventListener('touchmove', handleSmartTouchMove as any, { passive: false });
    document.addEventListener('wheel', preventDefaultEvent, { passive: false });
  };

  const disableFullscreenLock = () => {
    console.log('🔓 停用全螢幕鎖定功能');

    try {
      document.removeEventListener('contextmenu', preventDefaultEvent);
      document.removeEventListener('selectstart', preventDefaultEvent);
      document.removeEventListener('dragstart', preventDefaultEvent);
      document.removeEventListener('keydown', handleFullscreenLockKeys);
      document.removeEventListener('touchmove', handleSmartTouchMove as any);
      document.removeEventListener('wheel', preventDefaultEvent);
      console.log('✅ 所有鎖定事件監聽器已移除');
    } catch (error) {
      console.warn('⚠️ 移除事件監聽器時發生錯誤:', error);
    }
  };

  // 🔧 強制清理所有鎖定狀態（防護性清理）
  const forceCleanupLockState = () => {
    console.log('🧹 執行強制清理鎖定狀態');

    try {
      // 移除所有可能的事件監聽器
      disableFullscreenLock();

      // 移除所有鎖定相關的CSS類
      document.body.classList.remove('parent-fullscreen-game', 'locked-fullscreen');

      // 移除鎖定樣式表
      const lockedStyle = document.getElementById('locked-fullscreen-style');
      if (lockedStyle) {
        lockedStyle.remove();
        console.log('🧹 移除鎖定樣式表');
      }

      // 移除父頁面全螢幕樣式表
      const parentStyle = document.getElementById('parent-fullscreen-style');
      if (parentStyle) {
        parentStyle.remove();
        console.log('🧹 移除父頁面全螢幕樣式表');
      }

      // 恢復正常樣式
      document.documentElement.style.overflow = '';
      document.documentElement.style.height = '';
      document.body.style.overflow = '';
      document.body.style.height = '';
      document.body.style.touchAction = '';
      document.body.style.userSelect = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.width = '';
      document.body.style.zIndex = '';
      document.body.style.background = '';

      console.log('✅ 強制清理完成');
    } catch (error) {
      console.warn('⚠️ 強制清理時發生錯誤:', error);
    }
  };

  // 🧹 頁面載入時的初始清理
  const initialCleanup = () => {
    console.log('🧹 執行頁面載入初始清理');

    // 檢查是否有殘留的鎖定狀態
    const hasLockedClass = document.body.classList.contains('locked-fullscreen');
    const hasParentClass = document.body.classList.contains('parent-fullscreen-game');
    const hasLockedStyle = document.getElementById('locked-fullscreen-style');
    const hasParentStyle = document.getElementById('parent-fullscreen-style');

    if (hasLockedClass || hasParentClass || hasLockedStyle || hasParentStyle) {
      console.log('🧹 發現殘留的鎖定狀態，執行清理');
      forceCleanupLockState();
    } else {
      console.log('✅ 無殘留鎖定狀態');
    }
  };

  // 隱藏地址欄（移動設備）
  const hideAddressBar = () => {
    console.log('📱 嘗試隱藏地址欄');

    // 方法1：滾動隱藏地址欄
    setTimeout(() => {
      window.scrollTo(0, 1);
      setTimeout(() => {
        window.scrollTo(0, 0);
      }, 100);
    }, 100);

    // 方法2：改變視窗高度觸發地址欄隱藏
    setTimeout(() => {
      document.documentElement.style.height = `${window.screen.height}px`;
      document.body.style.height = `${window.screen.height}px`;
    }, 200);
  };

  // 檢查父頁面全螢幕狀態
  const checkParentFullscreenState = () => {
    const hasFullscreenElement = !!(document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement);
    const hasFullscreenClass = document.body.classList.contains('parent-fullscreen-game') ||
                               document.body.classList.contains('locked-fullscreen');
    return hasFullscreenElement || hasFullscreenClass;
  };

  // 顯示「全螢幕並開始」覆蓋層的邏輯
  useEffect(() => {
    if (mounted && isMobile) {
      // 檢查是否在全螢幕狀態
      const isInFullscreen = checkParentFullscreenState();
      // 只要離開全螢幕就顯示覆蓋層
      setShowTapOverlay(!isInFullscreen);
    } else {
      setShowTapOverlay(false);
    }
  }, [mounted, isMobile, showExitOverlay]); // 添加 showExitOverlay 依賴

  // 更新父頁面全螢幕狀態
  const updateParentFullscreenState = () => {
    const isActive = checkParentFullscreenState();
    setIsParentFullscreenActive(isActive);
    setShowExitOverlay(isActive);
  };

  // 退出父頁面全螢幕（原生 API + CSS 近全螢幕）
  const exitParentFullscreen = async () => {
    console.log('🚪 開始退出父頁面全螢幕');

    try {
      // 1. 退出原生瀏覽器全螢幕 API
      const d: any = document;
      if (document.fullscreenElement && document.exitFullscreen) {
        await document.exitFullscreen();
        console.log('✅ 退出原生全螢幕 (exitFullscreen)');
      } else if (d.webkitFullscreenElement && d.webkitExitFullscreen) {
        await d.webkitExitFullscreen();
        console.log('✅ 退出 WebKit 全螢幕');
      } else if (d.mozFullScreenElement && d.mozCancelFullScreen) {
        await d.mozCancelFullScreen();
        console.log('✅ 退出 Firefox 全螢幕');
      } else if (d.msFullscreenElement && d.msExitFullscreen) {
        await d.msExitFullscreen();
        console.log('✅ 退出 IE/Edge 全螢幕');
      } else {
        console.log('ℹ️ 沒有檢測到原生全螢幕狀態');
      }
    } catch (error) {
      console.warn('⚠️ 退出原生全螢幕失敗:', error);
    }

    // 🔓 第一步：停用全螢幕鎖定功能
    disableFullscreenLock();

    // 🔓 第二步：移除所有全螢幕樣式
    document.body.classList.remove('parent-fullscreen-game', 'locked-fullscreen');
    console.log('🧹 移除鎖定全螢幕樣式');

    // 🔓 第三步：移除全螢幕樣式表
    const parentStyle = document.getElementById('parent-fullscreen-style');
    if (parentStyle) {
      parentStyle.remove();
      console.log('🧹 移除父頁面全螢幕樣式表');
    }

    const lockedStyle = document.getElementById('locked-fullscreen-style');
    if (lockedStyle) {
      lockedStyle.remove();
      console.log('🧹 移除鎖定全螢幕樣式表');
    }

    // 🔓 第四步：恢復正常樣式
    if (isMobile) {
      document.documentElement.style.height = '';
      document.body.style.height = '';
    }

    // 🔓 第五步：更新狀態
    setShowExitOverlay(false);
    setIsParentFullscreenActive(false);

    // 🔓 第六步：在手機設備上顯示「全螢幕並開始」覆蓋層
    if (isMobile) {
      setShowTapOverlay(true);
      console.log('📱 顯示全螢幕並開始覆蓋層');
    }

    // 🔓 第七步：通知子頁面（遊戲）
    iframeRef.current?.contentWindow?.postMessage({
      source: 'parent-page',
      type: 'LOCKED_FULLSCREEN_EXITED'
    }, '*');

    console.log('✅ 鎖定全螢幕退出完成');
  };

  // 🔒 鎖定全螢幕開始函數
  const handleTapToStart = async () => {
    try {
      console.log('🔒 開始鎖定全螢幕流程');
      setShowTapOverlay(false);
      ensureLockedFullscreenStyles();

      const el = containerRef.current || document.documentElement;
      let success = false;

      // 🔒 第一步：嘗試原生全螢幕 API（隱藏所有瀏覽器UI）
      if ((el as any).requestFullscreen) {
        await (el as any).requestFullscreen({ navigationUI: 'hide' });
        success = true;
        console.log('✅ 鎖定全螢幕成功 (requestFullscreen with navigationUI: hide)');
      } else if ((el as any).webkitRequestFullscreen) {
        (el as any).webkitRequestFullscreen();
        success = true;
        console.log('✅ WebKit 鎖定全螢幕成功');
      } else if ((el as any).mozRequestFullScreen) {
        (el as any).mozRequestFullScreen();
        success = true;
        console.log('✅ Firefox 鎖定全螢幕成功');
      } else if ((el as any).msRequestFullscreen) {
        (el as any).msRequestFullscreen();
        success = true;
        console.log('✅ IE/Edge 鎖定全螢幕成功');
      } else {
        console.log('ℹ️ 瀏覽器不支援原生全螢幕 API，使用鎖定 CSS 全螢幕');
      }

      // 🔒 第二步：應用鎖定全螢幕樣式（強制隱藏所有UI元素）
      document.body.classList.add('parent-fullscreen-game', 'locked-fullscreen');
      console.log('✅ 應用鎖定全螢幕樣式');

      // 🔒 第三步：啟用全螢幕鎖定功能
      enableFullscreenLock();

      // 🔒 第四步：強制隱藏地址欄（移動設備）
      if (isMobile) {
        hideAddressBar();
      }

      // 顯示退出按鈕
      updateParentFullscreenState();

      // 通知 iframe（遊戲）當前狀態
      iframeRef.current?.contentWindow?.postMessage({
        source: 'parent-page',
        type: success ? 'LOCKED_FULLSCREEN_SUCCESS' : 'LOCKED_FULLSCREEN_FAILED'
      }, '*');

      console.log('📤 通知遊戲鎖定全螢幕狀態:', success ? 'SUCCESS' : 'FAILED');
    } catch (e) {
      console.warn('⚠️ 鎖定全螢幕失敗:', e);
      // 失敗：套用鎖定近全螢幕並通知開始
      ensureLockedFullscreenStyles();
      document.body.classList.add('parent-fullscreen-game', 'locked-fullscreen');
      enableFullscreenLock();
      if (isMobile) hideAddressBar();
      updateParentFullscreenState();
      iframeRef.current?.contentWindow?.postMessage({
        source: 'parent-page',
        type: 'LOCKED_FULLSCREEN_FAILED'
      }, '*');
    }
  };

  // 客戶端掛載狀態
  useEffect(() => {
    setMounted(true);

    // 🧹 頁面載入時執行初始清理
    initialCleanup();

    // 檢測螢幕尺寸
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    // ESC 鍵退出全螢幕監聽
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showExitOverlay) {
        console.log('⌨️ ESC 鍵觸發退出全螢幕');
        exitParentFullscreen();
      }
    };

    // 全螢幕狀態變化監聽
    const handleFullscreenChange = () => {
      console.log('🔄 全螢幕狀態變化');
      updateParentFullscreenState();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    // 🧹 頁面卸載時的清理
    const handleBeforeUnload = () => {
      console.log('🧹 頁面即將卸載，執行清理');
      forceCleanupLockState();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('🧹 頁面隱藏，執行預防性清理');
        // 如果頁面被隱藏且處於鎖定狀態，執行清理
        if (document.body.classList.contains('locked-fullscreen')) {
          forceCleanupLockState();
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      console.log('🧹 GameSwitcher 組件卸載，執行清理');

      // 清理鎖定狀態
      forceCleanupLockState();

      // 清理原有事件監聽器
      window.removeEventListener('resize', checkScreenSize);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);

      // 清理新增的事件監聽器
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [showExitOverlay]);

  // 動態設置容器尺寸以適應手機橫向模式
  useEffect(() => {
    const handleContainerResize = () => {
      const container = document.querySelector('.game-iframe-container') as HTMLElement;
      if (container) {
        const isLandscapeMobile = window.innerWidth === 812 && window.innerHeight === 375;

        if (isLandscapeMobile) {
          // 🔧 優化手機橫向模式：保持遊戲可玩性和觸控準確性
          const gameAspectRatio = 1274 / 739; // Phaser 遊戲的原始寬高比
          const screenAspectRatio = 812 / 375; // 手機橫向的寬高比

          // 計算最佳尺寸：保持遊戲寬高比，最大化利用螢幕空間
          let optimalWidth, optimalHeight;

          if (screenAspectRatio > gameAspectRatio) {
            // 螢幕更寬，以高度為基準
            optimalHeight = 375;
            optimalWidth = Math.round(375 * gameAspectRatio);
          } else {
            // 螢幕更高，以寬度為基準
            optimalWidth = 812;
            optimalHeight = Math.round(812 / gameAspectRatio);
          }

          // 設置優化後的容器樣式
          container.style.width = `${optimalWidth}px`;
          container.style.height = `${optimalHeight}px`;
          container.style.maxWidth = `${optimalWidth}px`;
          container.style.maxHeight = `${optimalHeight}px`;
          container.style.minWidth = `${optimalWidth}px`;
          container.style.minHeight = `${optimalHeight}px`;
          container.style.aspectRatio = `${1274}/${739}`; // 保持遊戲原始寬高比
          container.style.margin = '0 auto'; // 水平居中

          console.log('🎯 優化手機橫向模式容器樣式:', {
            screenSize: '812x375',
            gameAspectRatio: gameAspectRatio.toFixed(3),
            screenAspectRatio: screenAspectRatio.toFixed(3),
            optimalSize: `${optimalWidth}x${optimalHeight}`,
            actualSize: `${container.offsetWidth}x${container.offsetHeight}`,
            touchAreaImprovement: '保持遊戲寬高比，提升觸控準確性'
          });
        }
      }
    };

    // 初始檢查
    handleContainerResize();

    // 監聽視窗尺寸變化
    window.addEventListener('resize', handleContainerResize);

    // 延遲執行以確保 DOM 已載入
    const timer = setTimeout(handleContainerResize, 100);
    const timer2 = setTimeout(handleContainerResize, 500);

    return () => {
      window.removeEventListener('resize', handleContainerResize);
      clearTimeout(timer);
      clearTimeout(timer2);
    };
  }, []);

  // 獲取遊戲配置（只在客戶端執行）
  const gamesConfig = mounted ? getGamesConfig() : BASE_GAMES_CONFIG.map(game => ({ ...game, url: '' }));

  // 獲取當前遊戲配置
  const currentGame = gamesConfig.find(game => game.id === currentGameId);

  // 獲取可用遊戲（已完成的遊戲）
  const availableGames = gamesConfig.filter(game => game.status === 'completed');

  // 獲取開發中遊戲
  const developmentGames = gamesConfig.filter(game => game.status === 'development');

  // 載入進度模擬
  const simulateLoading = useCallback((estimatedTime: number) => {
    setIsLoading(true);
    setLoadingProgress(0);

    const progressStep = 100 / (estimatedTime / 50); // 每50ms更新一次

    progressIntervalRef.current = setInterval(() => {
      setLoadingProgress(prev => {
        const next = prev + progressStep + Math.random() * 5; // 添加隨機性
        return Math.min(next, 95); // 最多到95%，等待實際載入完成
      });
    }, 50);

    loadingTimeoutRef.current = setTimeout(() => {
      setLoadingProgress(100);
      setTimeout(() => {
        setIsLoading(false);
        setLoadingProgress(0);
      }, 200);
    }, estimatedTime);
  }, []);

  // 切換遊戲
  const switchGame = useCallback((gameId: string) => {
    console.log(`[GameSwitcher] 嘗試切換遊戲: ${gameId}, 當前: ${currentGameId}`);
    if (gameId === currentGameId || isLoading) {
      console.log(`[GameSwitcher] 切換被阻止: 相同遊戲或正在載入`);
      return;
    }

    const game = gamesConfig.find(g => g.id === gameId);
    if (!game || game.status !== 'completed') {
      console.log(`[GameSwitcher] 遊戲不可用: ${gameId}, 找到: ${!!game}, 狀態: ${game?.status}`);
      return;
    }

    console.log(`[GameSwitcher] 開始切換到: ${game.displayName} (${game.url})`);

    // 清理之前的計時器
    if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

    // 開始載入新遊戲
    simulateLoading(game.estimatedLoadTime);

    setCurrentGameId(gameId);
    setIsDropdownOpen(false);

    console.log(`[GameSwitcher] 狀態已更新: currentGameId -> ${gameId}`);

    // 通知父組件
    onGameChange?.(gameId);

    console.log(`🎮 切換到遊戲: ${game.displayName} (${game.type})`);
  }, [currentGameId, isLoading, simulateLoading, onGameChange]);

  // iframe 載入完成處理
  const handleIframeLoad = useCallback(() => {
    if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

    setLoadingProgress(100);
    setTimeout(() => {
      setIsLoading(false);
      setLoadingProgress(0);
    }, 100);

    console.log(`✅ 遊戲載入完成: ${currentGame?.displayName}`);
  }, [currentGame]);

  // iframe 消息處理
  const isParentFSActive = () => !!(document.fullscreenElement || (document as any).webkitFullscreenElement || document.body.classList.contains('parent-fullscreen-game'));

  const enterParentNearFullscreen = () => {
    console.log('🔄 進入父頁面近全螢幕模式');
    ensureParentFullscreenStyles();
    document.body.classList.add('parent-fullscreen-game');

    // 顯示退出按鈕
    updateParentFullscreenState();

    // 通知子頁面（近全螢幕）
    iframeRef.current?.contentWindow?.postMessage({
      source: 'parent-page',
      type: 'FULLSCREEN_FAILED'
    }, '*');

    console.log('✅ 父頁面近全螢幕模式已啟動');
  };

  const handleIframeMessage = useCallback((event: MessageEvent) => {
    if (!currentGame) return;

    try {
      const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;

      console.log('🎮 GameSwitcher 收到消息:', data);

      if (data.type === 'REQUEST_FULLSCREEN') {
        console.log('🔄 處理 REQUEST_FULLSCREEN');
        enterParentNearFullscreen();
      } else if (data.type === 'REQUEST_EXIT_FULLSCREEN') {
        console.log('🔄 處理 REQUEST_EXIT_FULLSCREEN');
        exitParentFullscreen();
      } else if (data.type === 'REQUEST_TOGGLE_FULLSCREEN') {
        console.log('🔄 處理 REQUEST_TOGGLE_FULLSCREEN');
        if (isParentFSActive()) {
          exitParentFullscreen();
        } else {
          enterParentNearFullscreen();
        }
      } else if (data.type === 'QUERY_FULLSCREEN_STATE') {
        const active = isParentFSActive();
        iframeRef.current?.contentWindow?.postMessage({ source: 'parent-page', type: 'FULLSCREEN_STATE', active }, '*');
      } else if (data.type === 'GAME_STATE_UPDATE') {
        const newState: GameState = {
          score: data.score || 0,
          level: data.level || currentGeptLevel,
          progress: data.progress || 0,
          timeSpent: data.timeSpent || 0
        };

        setGameStates(prev => ({
          ...prev,
          [currentGameId]: newState
        }));

        onGameStateUpdate?.(currentGameId, newState);
      } else if (data.type === 'GAME_COMPLETE') {
        // 🔧 修復白色閃爍：正確處理遊戲完成消息，防止意外重載
        console.log('🏁 遊戲完成，分數:', data.score, '生命值:', data.health);

        const finalState: GameState = {
          score: data.score || 0,
          level: currentGeptLevel,
          progress: 100, // 遊戲完成，進度100%
          timeSpent: 0 // 可以從遊戲數據中獲取
        };

        setGameStates(prev => ({
          ...prev,
          [currentGameId]: finalState
        }));

        onGameStateUpdate?.(currentGameId, finalState);

        // 不重載 iframe，保持遊戲狀態
        console.log('✅ 遊戲完成處理完畢，不重載 iframe');
      } else if (data.type === 'GAME_SCORE_UPDATE') {
        // 處理分數更新消息
        console.log('🏆 分數更新:', data.score, '生命值:', data.health);

        const updatedState: GameState = {
          score: data.score || 0,
          level: currentGeptLevel,
          progress: 0, // 遊戲進行中
          timeSpent: 0
        };

        setGameStates(prev => ({
          ...prev,
          [currentGameId]: updatedState
        }));

        onGameStateUpdate?.(currentGameId, updatedState);
      } else if (data.type === 'GAME_STATE_CHANGE') {
        // 處理遊戲狀態變化消息
        console.log('📊 遊戲狀態變化:', data.state);
      }
    } catch (error) {
      console.warn('處理 iframe 消息時出錯:', error);
    }
  }, [currentGame, currentGameId, currentGeptLevel, onGameStateUpdate]);

  // 設置消息監聽
  useEffect(() => {
    window.addEventListener('message', handleIframeMessage);
    return () => window.removeEventListener('message', handleIframeMessage);
  }, [handleIframeMessage]);

  // 清理計時器
  useEffect(() => {
    return () => {
      if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, []);

  // 獲取狀態指示器顏色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'development': return 'text-yellow-600';
      case 'planned': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  // 獲取狀態文字
  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return '已完成';
      case 'development': return '開發中';
      case 'planned': return '計劃中';
      default: return '未知';
    }
  };

  if (!currentGame) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="text-gray-500 text-lg">找不到指定的遊戲</div>
          <div className="text-gray-400 text-sm mt-2">遊戲 ID: {currentGameId}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`game-switcher-container ${className} w-full`} data-testid="game-switcher">
      {/* 緊湊標頭設計 - 手機優化，使用 JavaScript 控制顯示 */}
      {isMobile && (
        <div className="game-header bg-white rounded-lg shadow-sm border border-gray-200 mb-1" data-testid="game-header">
          <div className="flex justify-between items-center p-1 flex-wrap gap-1">
            {/* 左側資訊 - 緊湊設計 */}
            <div className="left-info flex items-center gap-1 flex-1 min-w-0">
              <span className="text-base flex-shrink-0">{currentGame.icon}</span>
              <strong className="font-medium text-gray-900 text-xs truncate">{currentGame.displayName}</strong>
              <span className="status px-1 py-0.5 text-xs bg-green-100 text-green-800 rounded flex-shrink-0">✅ 已完成</span>
            </div>

            {/* 右側控制 - 緊湊設計 */}
            <div className="right-controls flex items-center gap-1 flex-shrink-0">
              <span className="gept text-xs text-blue-700 bg-blue-50 px-1 py-0.5 rounded">
                GEPT：{propGeptLevel === 'elementary' ? '初級' : propGeptLevel === 'intermediate' ? '中級' : '高級'}
              </span>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="switch-button px-2 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
                disabled={isLoading}
                style={{ minHeight: '28px' }}
              >
                切換遊戲
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 原始設計 - 桌面版，使用 JavaScript 控制顯示 */}
      {!isMobile && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-1">
          <div className="p-2 md:p-3">
            <div className="flex flex-col space-y-3 md:space-y-2">
              {/* 遊戲詳細信息 - 響應式佈局 */}
              <div className="flex items-center space-x-2 md:space-x-4 w-full">
                <div className="flex items-center space-x-2 md:space-x-3 flex-1 min-w-0">
                  <div className="text-xl md:text-2xl flex-shrink-0">{currentGame.icon}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm md:text-base truncate">{currentGame.displayName}</h3>
                    <div className="flex items-center space-x-1 md:space-x-2 flex-wrap">
                      <p className="text-xs md:text-sm text-gray-600 truncate">{currentGame.memoryType}</p>
                      <div className={`px-1 md:px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(currentGame.status)}`}>
                        {getStatusText(currentGame.status)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 載入時間顯示 - 桌面版顯示 */}
                <div className="hidden lg:block text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded flex-shrink-0">
                  載入: ~{currentGame.estimatedLoadTime}ms
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GEPT 等級選擇器 - 響應式設計 (條件渲染) - 只在桌面版顯示 */}
      {!hideGeptSelector && !isMobile && (
        <div className="gept-selector flex items-center space-x-2 w-full bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-1" data-testid="gept-selector">
          <BookOpenIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />
          <span className="text-xs md:text-sm font-medium text-gray-700 flex-shrink-0">GEPT:</span>
          <div className="gept-buttons flex space-x-1 flex-1">
            {['elementary', 'intermediate', 'advanced'].map((level) => (
              <button
                key={level}
                onClick={() => setCurrentGeptLevel(level as any)}
                className={`px-2 py-2 rounded-full text-xs font-medium transition-colors flex-1 sm:flex-none sm:px-3 ${
                  currentGeptLevel === level
                    ? 'bg-blue-100 text-blue-800 border border-blue-300'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300'
                }`}
                style={{ minHeight: '44px' }}
              >
                {level === 'elementary' ? '初級' : level === 'intermediate' ? '中級' : '高級'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 手機版下拉選單 */}
      {isMobile && isDropdownOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setIsDropdownOpen(false)}>
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-lg max-h-96 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">選擇遊戲</h3>
                <button
                  onClick={() => setIsDropdownOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                  style={{ minHeight: '44px', minWidth: '44px' }}
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-700 px-2 py-1">
                  可用遊戲 ({availableGames.length})
                </div>
                {availableGames.map((game) => (
                  <button
                    key={game.id}
                    onClick={() => switchGame(game.id)}
                    className={`w-full text-left px-3 py-4 rounded-lg transition-colors ${
                      game.id === currentGameId ? 'bg-blue-50 border-2 border-blue-500' : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                    }`}
                    style={{ minHeight: '60px' }}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl flex-shrink-0">{game.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900">{game.displayName}</div>
                        <div className="text-sm text-gray-500 mt-1">{game.memoryType}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          載入時間: ~{game.estimatedLoadTime}ms
                        </div>
                      </div>
                      {game.id === currentGameId && (
                        <div className="text-blue-600 flex-shrink-0">✓</div>
                      )}
                    </div>
                  </button>
                ))}

                {developmentGames.length > 0 && (
                  <>
                    <div className="text-sm font-medium text-gray-700 px-2 py-1 mt-4 border-t pt-4">開發中遊戲</div>
                    {developmentGames.map((game) => (
                      <div
                        key={game.id}
                        className="w-full text-left px-3 py-4 rounded-lg opacity-60 cursor-not-allowed bg-gray-50"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl flex-shrink-0">{game.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900">{game.displayName}</div>
                            <div className="text-sm text-gray-500 mt-1">{game.memoryType}</div>
                            <div className="text-xs text-yellow-600 mt-1">🚧 開發中...</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 切換遊戲下拉選單 - 響應式設計 - 只在桌面版顯示 */}
      {!isMobile && (
        <div className="game-switcher-dropdown relative w-full bg-white rounded-lg shadow-sm border border-gray-200 mb-1">
          <div className="p-3">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center justify-between space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full text-sm font-medium"
              disabled={isLoading}
              style={{ minHeight: '44px' }}
            >
              <div className="flex items-center space-x-2">
                <PlayIcon className="w-4 h-4" />
                <span>切換遊戲</span>
              </div>
              <ChevronDownIcon className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* 下拉選單 - 直接在按鈕容器內 */}
          {isDropdownOpen && (
            <>
              {/* 手機版遮罩 */}
              <div
                className="fixed inset-0 bg-black bg-opacity-50 sm:hidden z-40"
                onClick={() => setIsDropdownOpen(false)}
              />

              <div className="dropdown-menu absolute top-full left-0 right-0 sm:left-auto sm:right-0 mt-2 w-full sm:w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
            <div className="p-2">
              <div className="text-sm font-medium text-gray-700 px-3 py-2 border-b border-gray-100">
                可用遊戲 ({availableGames.length})
              </div>
              {availableGames.map((game) => (
                <button
                  key={game.id}
                  onClick={() => switchGame(game.id)}
                  className={`dropdown-item w-full text-left px-3 py-3 rounded-md hover:bg-gray-50 transition-colors ${
                    game.id === currentGameId ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                  }`}
                  style={{ minHeight: '44px' }}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg flex-shrink-0">{game.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">{game.displayName}</div>
                      <div className="text-xs text-gray-500 truncate">{game.description}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        載入時間: ~{game.estimatedLoadTime}ms | {game.type}
                      </div>
                    </div>
                  </div>
                </button>
              ))}

              {developmentGames.length > 0 && (
                <>
                  <div className="text-sm font-medium text-gray-700 px-3 py-2 mt-4 border-t">開發中遊戲</div>
                  {developmentGames.map((game) => (
                    <div
                      key={game.id}
                      className="w-full text-left px-3 py-3 rounded-md opacity-60 cursor-not-allowed"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-lg flex-shrink-0">{game.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">{game.displayName}</div>
                          <div className="text-xs text-gray-500 truncate">{game.description}</div>
                          <div className="text-xs text-yellow-600 mt-1">🚧 開發中...</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </>
      )}
        </div>
      )}

      {/* 載入進度條 - 在所有模式顯示 */}
      {isLoading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-1">
          <div className="px-4 py-4">
            <div className="flex items-center space-x-3">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${loadingProgress}%` }}
                />
              </div>
              <div className="text-sm text-gray-600">{Math.round(loadingProgress)}%</div>
            </div>
            <div className="text-xs text-gray-500 mt-1">正在載入 {currentGame.displayName}...</div>
          </div>
        </div>
      )}

      {/* 遊戲 iframe 容器 - 響應式設計，增加高度顯示更多內容 */}
      <div
        ref={containerRef}
        className="game-iframe-container relative bg-white overflow-hidden mx-auto w-full"
        style={{
          aspectRatio: isMobile ? '812/375' : '1274/739',
          minHeight: isMobile ? '400px' : '500px', // 增加最小高度
          maxHeight: isMobile ? '500px' : '800px', // 增加最大高度
          width: '100%',
          height: isMobile ? '450px' : '600px', // 增加實際高度
          // 強制覆蓋CSS限制
          maxWidth: 'none !important' as any,
        }}
        data-testid="game-container"
      >
        {/* 手機一鍵全螢幕開始覆蓋層（確保父頁面手勢上下文）*/}
        {isMobile && showTapOverlay && (
          <button
            type="button"
            onClick={handleTapToStart}
            className="absolute inset-0 z-20 bg-black/50 text-white flex flex-col items-center justify-center gap-2"
            aria-label="全螢幕開始遊戲"
          >
            <span className="text-lg font-semibold">鎖定全螢幕並開始</span>
            <span className="text-xs opacity-80">隱藏網址列和所有瀏覽器UI，防止意外退出</span>
          </button>
        )}
        {isLoading && (
          <div className="loading-overlay absolute inset-0 bg-white bg-opacity-95 flex items-center justify-center z-10">
            <div className="loading-content text-center">
              <div className="spinner animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <div className="loading-text mt-4 text-gray-600">載入中...</div>
              <div className="text-sm text-gray-500 mt-1">{currentGame?.displayName || '遊戲'}</div>
            </div>
          </div>
        )}

        <iframe
          ref={iframeRef}
          src={currentGame.url}
          className="w-full h-full border-0"
          title={currentGame.displayName}
          onLoad={handleIframeLoad}
          allow="fullscreen; autoplay; microphone; camera"
          allowFullScreen
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
        />

        {/* 父頁面全螢幕退出按鈕（原生 API + CSS 近全螢幕） */}
        {showExitOverlay && (
          <div className="absolute top-0 left-0 right-0 z-[1000000] bg-gradient-to-b from-black/60 to-transparent p-4">
            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={exitParentFullscreen}
                className="bg-transparent hover:bg-black/20 text-white p-3 rounded-lg transition-colors duration-200 flex items-center justify-center relative overflow-hidden"
                aria-label="退出父頁面全螢幕"
              >
                <div
                  className="w-12 h-12 filter invert"
                  style={{
                    backgroundImage: 'url(/games/shimozurdo-game/assets/images/fullscreen.png)',
                    backgroundSize: '96px 48px', // 精靈圖總尺寸：2幀 x 48px寬 = 96px，高度48px
                    backgroundPosition: '-48px 0px', // 顯示第二幀（退出全螢幕圖標）
                    backgroundRepeat: 'no-repeat',
                    transform: 'scale(0.5)', // 縮放到原來的一半，讓48x48px變成24x24px顯示
                    transformOrigin: 'center'
                  }}
                  title="退出全螢幕"
                />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 遊戲狀態顯示 - 響應式設計 */}
      {gameStates[currentGameId] && (
        <div className="game-status-panel mt-4 bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">遊戲狀態</h4>
          <div className="game-status-grid grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="game-status-item">
              <div className="label text-gray-500">分數</div>
              <div className="value font-semibold">{gameStates[currentGameId].score}</div>
            </div>
            <div className="game-status-item">
              <div className="label text-gray-500">等級</div>
              <div className="value font-semibold">{gameStates[currentGameId].level}</div>
            </div>
            <div className="game-status-item">
              <div className="label text-gray-500">進度</div>
              <div className="value font-semibold">{gameStates[currentGameId].progress}%</div>
            </div>
            <div className="game-status-item">
              <div className="label text-gray-500">遊戲時間</div>
              <div className="value font-semibold">{Math.round(gameStates[currentGameId].timeSpent / 1000)}s</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameSwitcher;
