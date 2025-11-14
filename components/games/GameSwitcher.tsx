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
  hidden?: boolean; // 可選屬性，用於隱藏遊戲卡片
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
  customVocabulary?: any[];
  activityId?: string | null;
  shareToken?: string | null;
  isShared?: boolean;
  assignmentId?: string | null; // 學生遊戲模式
  studentName?: string | null; // 學生姓名
  isAnonymous?: boolean; // 匿名模式
  gameOptions?: any; // 遊戲選項
  visualStyle?: string; // 視覺風格
  matchUpOptions?: any; // Match-up 遊戲專屬選項
}

// 基礎遊戲配置數據 (不包含動態 URL)
const BASE_GAMES_CONFIG: Omit<GameConfig, 'url'>[] = [
  {
    id: 'airplane-vite',
    name: 'airplane',
    displayName: '飛機遊戲 (Vite版)',
    description: '完整版飛機碰撞遊戲，記憶科學驅動的英語詞彙學習',
    type: 'iframe',
    memoryType: '動態反應記憶',
    geptLevels: ['elementary', 'intermediate', 'advanced'],
    status: 'completed',
    icon: '⚡',
    estimatedLoadTime: 600,
    hidden: false  // 顯示在切換遊戲選單中
  },

  {
    id: 'shimozurdo-game',
    name: 'shimozurdo',
    displayName: 'Shimozurdo 雲朵遊戲',
    description: '雲朵碰撞遊戲，支援全螢幕和響應式設計，記憶科學驅動的英語學習',
    type: 'iframe',
    memoryType: '動態反應記憶',
    geptLevels: ['elementary', 'intermediate', 'advanced'],
    status: 'completed',
    icon: '☁️',
    estimatedLoadTime: 800,
    hidden: false  // 顯示在切換遊戲選單中
  },

  {
    id: 'starshake-game',
    name: 'starshake',
    displayName: 'Starshake 太空冒險',
    description: '一個充滿樂趣的太空冒險動作遊戲',
    type: 'iframe',
    memoryType: '動態反應記憶',
    geptLevels: ['elementary', 'intermediate', 'advanced'],
    status: 'completed',
    icon: '🌟',
    estimatedLoadTime: 1000,
    hidden: false  // 顯示在切換遊戲選單中
  },
  {
    id: 'runner-game',
    name: 'runner',
    displayName: 'Runner 跑酷遊戲',
    description: '一個刺激的跑酷遊戲，通過跳躍和收集金幣來挑戰高分',
    type: 'iframe',
    memoryType: '動態反應記憶',
    geptLevels: ['elementary', 'intermediate', 'advanced'],
    status: 'completed',
    icon: '🏃',
    estimatedLoadTime: 1000,
    hidden: false  // 顯示在切換遊戲選單中
  },
  {
    id: 'pushpull-game',
    name: 'pushpull',
    displayName: 'PushPull 推拉方塊',
    description: '一個策略性的推拉方塊遊戲，通過移動彩色方塊到指定位置來解決謎題',
    type: 'iframe',
    memoryType: '重構邏輯記憶',
    geptLevels: ['elementary', 'intermediate', 'advanced'],
    status: 'completed',
    icon: '🧩',
    estimatedLoadTime: 1200,
    hidden: false  // 顯示在切換遊戲選單中
  },
  {
    id: 'wallhammer-game',
    name: 'wallhammer',
    displayName: 'WallHammer 破牆遊戲',
    description: '一個經典的破牆冒險遊戲，通過錘子破壞磚牆收集金幣和道具',
    type: 'iframe',
    memoryType: '動態反應記憶',
    geptLevels: ['elementary', 'intermediate', 'advanced'],
    status: 'completed',
    icon: '🔨',
    estimatedLoadTime: 1300,
    hidden: false  // 顯示在切換遊戲選單中
  },
  {
    id: 'zenbaki-game',
    name: 'zenbaki',
    displayName: 'Zenbaki 數字遊戲',
    description: '一個基於數字的策略遊戲，通過數字計算和邏輯推理來解決謎題',
    type: 'iframe',
    memoryType: '基礎記憶',
    geptLevels: ['elementary', 'intermediate', 'advanced'],
    status: 'completed',
    icon: '🔢',
    estimatedLoadTime: 1100,
    hidden: false  // 顯示在切換遊戲選單中
  },
  {
    id: 'match-up-game',
    name: 'match-up',
    displayName: 'Match up 配對遊戲',
    description: '拖動左側卡片到右側對應的答案框進行配對',
    type: 'iframe',
    memoryType: '關聯配對記憶',
    geptLevels: ['elementary', 'intermediate', 'advanced'],
    status: 'completed',
    icon: '🎯',
    estimatedLoadTime: 500,
    hidden: false  // 顯示在切換遊戲選單中
  },
  {
    id: 'mars-game',
    name: 'mars',
    displayName: 'Mars 火星探險',
    description: '一個火星探險遊戲，通過探索火星地形和收集資源來完成任務',
    type: 'iframe',
    memoryType: '空間視覺記憶',
    geptLevels: ['elementary', 'intermediate', 'advanced'],
    status: 'completed',
    icon: '🔴',
    estimatedLoadTime: 1200,
    hidden: false  // 顯示在切換遊戲選單中
  },
  {
    id: 'fate-game',
    name: 'fate',
    displayName: 'Fate 命運之戰',
    description: '一個3D太空戰鬥遊戲，通過駕駛太空船戰鬥和探索來完成任務',
    type: 'iframe',
    memoryType: '動態反應記憶',
    geptLevels: ['elementary', 'intermediate', 'advanced'],
    status: 'completed',
    icon: '⚡',
    estimatedLoadTime: 1400,
    hidden: false  // 顯示在切換遊戲選單中
  },
  {
    id: 'dungeon-game',
    name: 'dungeon',
    displayName: 'Dungeon 地牢探險',
    description: '探索神秘地牢，收集寶藏，戰勝怪物。2D 冒險遊戲，訓練空間記憶和策略思維',
    type: 'iframe',
    memoryType: '空間視覺記憶',
    geptLevels: ['elementary', 'intermediate', 'advanced'],
    status: 'completed',
    icon: '🏰',
    estimatedLoadTime: 800,
    hidden: false  // 顯示在切換遊戲選單中
  },
  {
    id: 'blastemup-game',
    name: 'blastemup',
    displayName: 'Blastemup 太空射擊',
    description: '駕駛太空船在宇宙中戰鬥，射擊敵人和小行星。經典的太空射擊遊戲，訓練反應速度和手眼協調',
    type: 'iframe',
    memoryType: '動態反應記憶',
    geptLevels: ['elementary', 'intermediate', 'advanced'],
    status: 'completed',
    icon: '💥',
    estimatedLoadTime: 900,
    hidden: false  // 顯示在切換遊戲選單中
  },
  {
    id: 'math-attack-game',
    name: 'math-attack',
    displayName: 'Math Attack 數學攻擊',
    description: '快速解決數學問題，提升計算能力。結合時間壓力的數學遊戲，訓練數字記憶和運算速度',
    type: 'iframe',
    memoryType: '基礎記憶',
    geptLevels: ['elementary', 'intermediate', 'advanced'],
    status: 'completed',
    icon: '🔢',
    estimatedLoadTime: 1200,
    hidden: false  // 顯示在切換遊戲選單中
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
    estimatedLoadTime: 700,
    hidden: true  // 隱藏遊戲卡片顯示
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
    estimatedLoadTime: 500,
    hidden: true  // 隱藏遊戲卡片顯示
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
    estimatedLoadTime: 600,
    hidden: true  // 隱藏遊戲卡片顯示
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
    estimatedLoadTime: 400,
    hidden: true  // 隱藏遊戲卡片顯示
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
    case 'dungeon-game':
      return '/games/dungeon-game/dist/';
    case 'blastemup-game':
      return '/games/blastemup-game/dist/';
    case 'math-attack-game':
      return '/games/math-attack-game/';
    case 'match-up-game':
      return '/games/match-up-game/';
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
  defaultGame = 'airplane-vite',
  geptLevel = 'elementary',
  onGameChange,
  onGameStateUpdate,
  className = '',
  hideGeptSelector = false,
  currentGeptLevel: propGeptLevel = 'elementary',
  customVocabulary = [],
  activityId = null,
  shareToken = null,
  isShared = false,
  assignmentId = null,
  studentName = null,
  isAnonymous = false,
  gameOptions = null,
  visualStyle = null,
  matchUpOptions = null
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

  // 全螢幕狀態管理
  const [isGameFullscreen, setIsGameFullscreen] = useState<boolean>(false);
  const [isProcessingFullscreen, setIsProcessingFullscreen] = useState<boolean>(false);

  // Refs
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const loadingTimeoutRef = useRef<NodeJS.Timeout>();
  const progressIntervalRef = useRef<NodeJS.Timeout>();

  const containerRef = useRef<HTMLDivElement>(null);

  // 🔥 v102.4: 當 customVocabulary 改變時，添加 customVocabulary=true 參數到 URL
  // 這樣 iframe 會重新加載，遊戲會重新初始化，卡片會動態調整為新詞彙
  // 但 gameKey 不改變，所以 GameSwitcher 組件不會卸載/重新掛載
  const [vocabUpdateTrigger, setVocabUpdateTrigger] = useState(0);

  useEffect(() => {
    if (customVocabulary.length > 0) {
      console.log('🔄 [v102.4] customVocabulary 已改變，觸發 iframe 重新加載:', customVocabulary.length, '個詞彙');
      // 改變 vocabUpdateTrigger 以觸發 iframe src 改變
      setVocabUpdateTrigger(prev => prev + 1);
      // 同時存儲到 localStorage 作為備份
      localStorage.setItem('gameCustomVocabulary', JSON.stringify(customVocabulary));
    }
  }, [customVocabulary]);

  // 生成包含自定義詞彙的遊戲 URL
  const getGameUrlWithVocabulary = (game: GameConfig): string => {
    let url = game.url;

    // 如果有活動 ID，添加到 URL 參數中（不管 customVocabulary 是否載入成功）
    if (activityId) {
      const separator = url.includes('?') ? '&' : '?';
      url += `${separator}activityId=${activityId}`;

      // 🔥 v102.4: 添加 customVocabulary=true 參數到 URL
      // 這樣當 customVocabulary 改變時，iframe src 會改變，iframe 會重新加載
      if (customVocabulary.length > 0) {
        url += `&customVocabulary=true&vocabUpdateTrigger=${vocabUpdateTrigger}`;
      }

      // 優先檢查是否為學生遊戲模式（有 assignmentId）
      if (assignmentId) {
        url += `&assignmentId=${assignmentId}`;
        if (studentName) {
          url += `&studentName=${encodeURIComponent(studentName)}`;
        }
        if (isAnonymous) {
          url += `&anonymous=true`;
        }
        console.log('🎓 學生遊戲模式 URL:', url);
      }
      // 其次檢查是否為社區分享模式
      else if (isShared && shareToken) {
        url += `&shareToken=${shareToken}&isShared=true`;
        console.log('🌍 社區分享模式 URL:', url);
      }
      // 正常模式
      else {
        console.log('🎯 正常模式 URL:', url);
      }

      // 添加遊戲選項到 URL
      if (gameOptions) {
        url += `&gameOptions=${encodeURIComponent(JSON.stringify(gameOptions))}`;
        console.log('🎮 遊戲選項已添加到 URL');
      }

      // 添加視覺風格到 URL
      if (visualStyle) {
        url += `&visualStyle=${visualStyle}`;
        console.log('🎨 視覺風格已添加到 URL:', visualStyle);
      }

      // 添加 Match-up 選項到 URL
      if (matchUpOptions && game.id === 'match-up-game') {
        url += `&itemsPerPage=${matchUpOptions.itemsPerPage}`;
        url += `&autoProceed=${matchUpOptions.autoProceed}`;
        url += `&timerType=${matchUpOptions.timer.type}`;
        if (matchUpOptions.timer.type === 'countDown') {
          url += `&timerMinutes=${matchUpOptions.timer.minutes || 5}`;
          url += `&timerSeconds=${matchUpOptions.timer.seconds || 0}`;
        }
        url += `&layout=${matchUpOptions.layout}`;
        url += `&random=${matchUpOptions.random}`;
        url += `&showAnswers=${matchUpOptions.showAnswers}`;

        // ✅ v44.0：添加聲音選項到 URL
        if (matchUpOptions.audio) {
          url += `&audioEnabled=${matchUpOptions.audio.enabled}`;
          url += `&audioVolume=${matchUpOptions.audio.volume}`;
          if (matchUpOptions.audio.autoPlay) {
            url += `&audioAutoPlay=true`;
          }
        }

        console.log('🎮 Match-up 選項已添加到 URL:', matchUpOptions);
      }
    }

    return url;
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

      // 清理新增的事件監聽器
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // 進入CSS全螢幕函數
  const enterCSSFullscreen = useCallback(() => {
    console.log('🚀 執行進入CSS全螢幕');

    const gameContainer = document.querySelector('[data-testid="game-container"]') as HTMLElement;
    const iframe = iframeRef.current;

    if (gameContainer && iframe) {
      // 隱藏導航欄
      const navigation = document.querySelector('nav') as HTMLElement;
      if (navigation) {
        navigation.style.display = 'none';
        console.log('🙈 隱藏導航欄');
      }

      // 隱藏頁腳
      const footer = document.querySelector('footer') as HTMLElement;
      if (footer) {
        footer.style.display = 'none';
        console.log('🙈 隱藏頁腳');
      }

      // 隱藏上面的控制按鈕區域
      const gameHeader = document.querySelector('[data-testid="game-header"]') as HTMLElement;
      const geptSelector = document.querySelector('[data-testid="gept-selector"]') as HTMLElement;
      const gameSwitcherDropdown = document.querySelector('.game-switcher-dropdown') as HTMLElement;

      if (gameHeader) {
        gameHeader.style.display = 'none';
        console.log('🙈 隱藏遊戲標頭');
      }
      if (geptSelector) {
        geptSelector.style.display = 'none';
        console.log('🙈 隱藏GEPT選擇器');
      }
      if (gameSwitcherDropdown) {
        gameSwitcherDropdown.style.display = 'none';
        console.log('🙈 隱藏切換遊戲下拉選單');
      }

      // 隱藏其他元素
      const siblings = Array.from(gameContainer.parentElement?.children || []);
      siblings.forEach((sibling) => {
        if (sibling !== gameContainer) {
          (sibling as HTMLElement).style.display = 'none';
        }
      });

      // 設置容器全螢幕
      gameContainer.style.position = 'fixed';
      gameContainer.style.top = '0';
      gameContainer.style.left = '0';
      gameContainer.style.width = '100vw';
      gameContainer.style.height = '100dvh'; // 🔥 修復：使用 100dvh 而不是 100vh
      gameContainer.style.zIndex = '9999';
      gameContainer.style.backgroundColor = '#000';

      // 設置 iframe 全螢幕 - 完全填滿螢幕
      iframe.style.position = 'absolute';
      iframe.style.top = '0'; // 完全填滿，不留上方空間
      iframe.style.left = '0';
      iframe.style.width = '100vw';
      iframe.style.height = '100dvh'; // 🔥 修復：使用 100dvh 而不是 100vh
      iframe.style.border = 'none';
      iframe.style.borderRadius = '0';
      iframe.style.transform = ''; // 移除transform，使用top定位

      // 隱藏地址欄
      window.scrollTo(0, 1);
      setTimeout(() => window.scrollTo(0, 1), 100);

      setIsGameFullscreen(true);
      console.log('✅ 進入CSS全螢幕完成 - 遊戲完全填滿螢幕');
    } else {
      console.log('❌ 找不到必要的 DOM 元素');
    }
  }, []);

  // 退出CSS全螢幕函數
  const exitCSSFullscreen = useCallback(() => {
    console.log('🔄 執行退出CSS全螢幕');

    const gameContainer = document.querySelector('[data-testid="game-container"]') as HTMLElement;
    const iframe = iframeRef.current;

    if (gameContainer && iframe) {
      // 恢復導航欄
      const navigation = document.querySelector('nav') as HTMLElement;
      if (navigation) {
        navigation.style.display = '';
        console.log('👁️ 恢復導航欄顯示');
      }

      // 恢復頁腳
      const footer = document.querySelector('footer') as HTMLElement;
      if (footer) {
        footer.style.display = '';
        console.log('👁️ 恢復頁腳顯示');
      }

      // 恢復上面的控制按鈕區域
      const gameHeader = document.querySelector('[data-testid="game-header"]') as HTMLElement;
      const geptSelector = document.querySelector('[data-testid="gept-selector"]') as HTMLElement;
      const gameSwitcherDropdown = document.querySelector('.game-switcher-dropdown') as HTMLElement;

      if (gameHeader) {
        gameHeader.style.display = '';
        console.log('👁️ 恢復遊戲標頭顯示');
      }
      if (geptSelector) {
        geptSelector.style.display = '';
        console.log('👁️ 恢復GEPT選擇器顯示');
      }
      if (gameSwitcherDropdown) {
        gameSwitcherDropdown.style.display = '';
        console.log('👁️ 恢復切換遊戲下拉選單顯示');
      }

      // 恢復其他元素
      const siblings = Array.from(gameContainer.parentElement?.children || []);
      siblings.forEach((sibling) => {
        (sibling as HTMLElement).style.display = '';
      });

      // 恢復容器樣式
      gameContainer.style.position = '';
      gameContainer.style.top = '';
      gameContainer.style.left = '';
      gameContainer.style.width = '';
      gameContainer.style.height = '';
      gameContainer.style.zIndex = '';
      gameContainer.style.backgroundColor = '';

      // 恢復 iframe 樣式
      iframe.style.position = '';
      iframe.style.top = '';
      iframe.style.left = '';
      iframe.style.width = '';
      iframe.style.height = '';
      iframe.style.border = '';
      iframe.style.borderRadius = '';
      iframe.style.transform = ''; // 清除 transform

      setIsGameFullscreen(false);
      console.log('✅ 退出CSS全螢幕完成 - 所有控制按鈕已恢復');
    } else {
      console.log('❌ 找不到必要的 DOM 元素');
    }
  }, []);

  // 🎯 雙重全螢幕同步監聽器 - DUAL_FULLSCREEN_LISTENER
  useEffect(() => {
    const handleDualFullscreenMessage = async (event: MessageEvent) => {
      if (event.data.type === 'DUAL_FULLSCREEN_REQUEST') {
        console.log('📥 收到遊戲內全螢幕切換請求:', event.data);

        // 防重複處理
        if (isProcessingFullscreen) {
          console.log('⚠️ 正在處理全螢幕請求，忽略重複請求');
          return;
        }

        setIsProcessingFullscreen(true);

        try {
          // 簡單切換：根據當前狀態決定動作
          setTimeout(() => {
            if (isGameFullscreen) {
              console.log('🔄 當前全螢幕，執行退出');
              exitCSSFullscreen();
            } else {
              console.log('📱 當前非全螢幕，執行進入');
              enterCSSFullscreen();
            }

            // 響應遊戲
            if (event.source) {
              (event.source as Window).postMessage({
                type: 'DUAL_FULLSCREEN_RESPONSE',
                action: isGameFullscreen ? 'CSS_FULLSCREEN_DISABLED' : 'CSS_FULLSCREEN_ENABLED',
                timestamp: Date.now()
              }, '*' as any);
            }

            // 1秒後解除處理鎖
            setTimeout(() => {
              setIsProcessingFullscreen(false);
            }, 1000);
          }, 100);

        } catch (error) {
          console.log('❌ 處理全螢幕請求失敗:', error);

          // 響應錯誤
          if (event.source) {
            (event.source as Window).postMessage({
              type: 'DUAL_FULLSCREEN_RESPONSE',
              action: 'CSS_FULLSCREEN_ERROR',
              error: error instanceof Error ? error.message : 'Unknown error',
              timestamp: Date.now()
            }, '*' as any);
          }

          setIsProcessingFullscreen(false);
        }
      }
    };
    
    // 添加消息監聽器
    window.addEventListener('message', handleDualFullscreenMessage);
    
    // 清理函數
    return () => {
      window.removeEventListener('message', handleDualFullscreenMessage);
    };
  }, [isGameFullscreen, isProcessingFullscreen]);
  // 雙重全螢幕同步監聽器結束


  // 動態設置容器尺寸以適應手機橫向模式
  useEffect(() => {
    const handleContainerResize = () => {
      const container = document.querySelector('.game-iframe-container') as HTMLElement;
      if (container) {
        const isLandscapeMobile = window.innerWidth === 812 && window.innerHeight === 375;

        if (isLandscapeMobile) {
          // 🔧 優化手機橫向模式：保持遊戲可玩性和觸控準確性
          const gameAspectRatio = 1274 / 739; // 遊戲的原始寬高比
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

  // 獲取可用遊戲（已完成且未隱藏的遊戲）
  const availableGames = gamesConfig.filter(game => game.status === 'completed' && !game.hidden);

  // 獲取開發中遊戲（未隱藏的）
  const developmentGames = gamesConfig.filter(game => game.status === 'development' && !game.hidden);

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

    // 🔥 [v218.0] 暴露遊戲對象到全局作用域，方便直接訪問
    if (iframeRef.current && iframeRef.current.contentWindow) {
      const iframeWindow = iframeRef.current.contentWindow;

      // 創建全局遊戲訪問對象
      window.EduCreateGameAccess = {
        // 獲取 iframe 中的遊戲對象
        getGame: () => iframeWindow.matchUpGame,

        // 獲取 GameScene
        getGameScene: () => {
          const game = iframeWindow.matchUpGame;
          if (!game) return null;
          return game.scene.scenes.find((s: any) => s.constructor.name === 'GameScene');
        },

        // 直接調用 Show All Answers
        showAllAnswers: () => {
          const gameScene = window.EduCreateGameAccess.getGameScene();
          if (gameScene) {
            gameScene.showAllCorrectAnswers();
            console.log('✅ [v218.0] Show All Answers 已調用');
            return true;
          } else {
            console.error('❌ [v218.0] GameScene 不存在');
            return false;
          }
        },

        // 獲取當前頁面信息
        getCurrentPageInfo: () => {
          const gameScene = window.EduCreateGameAccess.getGameScene();
          if (!gameScene) return null;
          return {
            currentPage: gameScene.currentPage + 1,
            totalPages: gameScene.totalPages,
            leftCardsPairIds: gameScene.leftCards.map((c: any) => c.getData('pairId')),
            rightEmptyBoxesPairIds: gameScene.rightEmptyBoxes.map((b: any) => b.getData('pairId')),
            isShowingAllAnswers: gameScene.isShowingAllAnswers
          };
        },

        // 導航到下一頁
        goToNextPage: () => {
          const gameScene = window.EduCreateGameAccess.getGameScene();
          if (gameScene) {
            gameScene.goToNextPage();
            console.log('✅ [v218.0] 已導航到下一頁');
            return true;
          }
          return false;
        },

        // 導航到上一頁
        goToPreviousPage: () => {
          const gameScene = window.EduCreateGameAccess.getGameScene();
          if (gameScene) {
            gameScene.goToPreviousPage();
            console.log('✅ [v218.0] 已導航到上一頁');
            return true;
          }
          return false;
        }
      };

      console.log('🔥 [v218.0] 遊戲訪問對象已暴露到 window.EduCreateGameAccess');
      console.log('🔥 [v218.0] 可用方法: getGame(), getGameScene(), showAllAnswers(), getCurrentPageInfo(), goToNextPage(), goToPreviousPage()');
    }
  }, [currentGame]);

  // iframe 消息處理
  const handleIframeMessage = useCallback((event: MessageEvent) => {
    if (!currentGame) return;

    try {
      const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;

      console.log('🎮 GameSwitcher 收到消息:', data);

      if (data.type === 'GAME_STATE_UPDATE') {
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
    <div className={`game-switcher-container ${className} w-full flex flex-col items-start`} data-testid="game-switcher">
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

      {/* 遊戲 iframe 容器 - 響應式設計，動態調整高度，向上置頂 */}
      <div
        ref={containerRef}
        className="game-iframe-container relative bg-white overflow-hidden w-full self-start"
        style={{
          // 移除 aspectRatio，避免與 height: 100vh 衝突
          width: '100%',
          // 🔥 [v69.0] 桌面端改為 100vh 以充分利用容器寬度
          // 全螢幕模式：100vh，非全螢幕模式：100vh（改為全高度）
          height: isMobile ? (isGameFullscreen ? '100vh' : '90vh') : '100vh',
          maxHeight: isMobile ? (isGameFullscreen ? '100vh' : '90vh') : 'none',
          // 強制覆蓋CSS限制
          maxWidth: 'none !important' as any,
        }}
        data-testid="game-container"
      >

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
          src={getGameUrlWithVocabulary(currentGame)}
          className="w-full h-full border-0"
          title={currentGame.displayName}
          onLoad={handleIframeLoad}
          allow="fullscreen; autoplay; microphone; camera"
          allowFullScreen
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-pointer-lock allow-orientation-lock allow-presentation allow-top-navigation-by-user-activation"
        />


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
