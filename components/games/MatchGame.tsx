/**
 * MatchGame - Match配對遊戲組件
 * 基於記憶科學原理的配對遊戲，支持多種配對模式和智能適配
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  MatchGameManager,
  MatchGameConfig,
  MatchGameState,
  MatchGameResult,
  MatchPair,
  MatchItem,
  MatchMode,
  DifficultyLevel,
  GEPTLevel
} from '../../lib/games/MatchGameManager';
import { HintContent, HintLevel } from '@/lib/games/IntelligentHintSystem';
import { ErrorAnalysisResult } from '@/lib/games/ErrorPatternAnalyzer';
import { MemoryAnalysisResult, MemoryItem, MemoryItemStatus } from '@/lib/games/MemoryCurveTracker';
import { ReviewSession, LearningPlan } from '@/lib/games/SpacedRepetitionAlgorithm';
import { LearnerProfile, ContentAdaptationResult } from '@/lib/gept/GEPTAdaptationEngine';
import { KeyboardNavigationManager, NavigationRegion } from '@/lib/accessibility/KeyboardNavigationManager';
import { ScreenReaderManager } from '@/lib/accessibility/ScreenReaderManager';
import { WCAGComplianceChecker, WCAGLevel } from '@/lib/accessibility/WCAGComplianceChecker';
import AccessibilitySettingsPanel, { AccessibilitySettings } from '@/components/accessibility/AccessibilitySettingsPanel';
import { VocabularyAnalysis, VocabularyReplacement } from '@/lib/gept/VocabularyDifficultyManager';
import { LevelTransitionRecommendation, CrossLevelLearningPlan } from '@/lib/gept/CrossLevelLearningManager';
export interface MatchGameProps {
  config: MatchGameConfig;
  pairs: MatchPair[];
  onGameComplete?: (result: MatchGameResult) => void;
  onGameStateChange?: (state: MatchGameState) => void;
  className?: string;
  'data-testid'?: string;
}
export default function MatchGame({
  config,
  pairs,
  onGameComplete,
  onGameStateChange,
  className = '',
  'data-testid': testId = 'match-game'
}: MatchGameProps) {
  const [gameManager] = useState(() => new MatchGameManager());
  const [gameState, setGameState] = useState<MatchGameState | null>(null);
  const [gameResult, setGameResult] = useState<MatchGameResult | null>(null);
  const [showHint, setShowHint] = useState<string | null>(null);
  const [animatingItems, setAnimatingItems] = useState<Set<string>>(new Set());
  const [gameStarted, setGameStarted] = useState(false);
  const [successAnimation, setSuccessAnimation] = useState<string | null>(null);
  const [errorAnimation, setErrorAnimation] = useState<string | null>(null);
  const [pulseItems, setPulseItems] = useState<Set<string>>(new Set());
  // 錯誤分析和提示系統狀態
  const [currentHint, setCurrentHint] = useState<HintContent | null>(null);
  const [showHintPanel, setShowHintPanel] = useState(false);
  const [errorAnalysis, setErrorAnalysis] = useState<ErrorAnalysisResult | null>(null);
  const [showErrorAnalysis, setShowErrorAnalysis] = useState(false);
  const [personalizedRecommendations, setPersonalizedRecommendations] = useState<string[]>([]);
  // 記憶曲線追蹤系統狀態
  const [memoryAnalysis, setMemoryAnalysis] = useState<MemoryAnalysisResult | null>(null);
  const [showMemoryAnalysis, setShowMemoryAnalysis] = useState(false);
  const [learningPlan, setLearningPlan] = useState<LearningPlan | null>(null);
  const [memoryItems, setMemoryItems] = useState<MemoryItem[]>([]);
  const [currentReviewSession, setCurrentReviewSession] = useState<ReviewSession | null>(null);
  // GEPT分級適配系統狀態
  const [learnerProfile, setLearnerProfile] = useState<LearnerProfile | null>(null);
  const [vocabularyAnalysis, setVocabularyAnalysis] = useState<VocabularyAnalysis | null>(null);
  const [levelTransitionRecommendation, setLevelTransitionRecommendation] = useState<LevelTransitionRecommendation | null>(null);
  const [showGEPTAnalysis, setShowGEPTAnalysis] = useState(false);
  const [vocabularyReplacements, setVocabularyReplacements] = useState<VocabularyReplacement[]>([]);
  const [crossLevelPlan, setCrossLevelPlan] = useState<CrossLevelLearningPlan | null>(null);
  // 無障礙支援系統狀態
  const [accessibilityEnabled, setAccessibilityEnabled] = useState(true);
  const [currentFocusIndex, setCurrentFocusIndex] = useState(0);
  const [focusRegion, setFocusRegion] = useState<'left' | 'right'>('left');
  const [keyboardMode, setKeyboardMode] = useState(false);
  const [screenReaderMode, setScreenReaderMode] = useState(false);
  const [showAccessibilitySettings, setShowAccessibilitySettings] = useState(false);
  const [accessibilitySettings, setAccessibilitySettings] = useState<AccessibilitySettings>({
    fontSize: 'medium',
    contrast: 'normal',
    colorScheme: 'default',
    animationSpeed: 'normal',
    reduceMotion: false,
    soundEnabled: true,
    soundVolume: 0.7,
    voiceAnnouncements: true,
    keyboardNavigation: true,
    focusIndicator: 'enhanced',
    skipLinks: true,
    screenReaderOptimized: true,
    verboseDescriptions: false,
    announceChanges: true,
    textSpacing: 1,
    lineHeight: 1.5,
    letterSpacing: 0,
    gameSpeed: 'normal',
    autoAdvance: false,
    confirmActions: true,
    wcagLevel: WCAGLevel.AA
  });
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const keyboardManagerRef = useRef<KeyboardNavigationManager | null>(null);
  const screenReaderManagerRef = useRef<ScreenReaderManager | null>(null);
  const hintTimeoutRef = useRef<NodeJS.Timeout>();
  // 初始化無障礙系統
  useEffect(() => {
    if (!accessibilityEnabled) return;

    // 初始化鍵盤導航管理器
    keyboardManagerRef.current = new KeyboardNavigationManager({
      trapFocus: true,
      restoreFocus: true,
      skipLinks: true,
      announceChanges: true,
      highlightFocus: true
    });

    // 初始化螢幕閱讀器管理器
    screenReaderManagerRef.current = new ScreenReaderManager();

    // 註冊遊戲區域
    if (gameContainerRef.current) {
      const gameRegion: NavigationRegion = {
        id: 'match-game-region',
        name: '配對遊戲區域',
        element: gameContainerRef.current,
        focusableElements: [],
        currentIndex: 0,
        isActive: true
      };
      keyboardManagerRef.current.registerRegion(gameRegion);
    }

    // 設置鍵盤快捷鍵事件監聽器
    const keyboardManager = keyboardManagerRef.current;
    keyboardManager.on('shortcut:hint', handleKeyboardHint);
    keyboardManager.on('shortcut:pause', handleKeyboardPause);
    keyboardManager.on('shortcut:restart', handleKeyboardRestart);
    keyboardManager.on('shortcut:activate', handleKeyboardActivate);
    keyboardManager.on('shortcut:move_up', () => handleArrowNavigation('up'));
    keyboardManager.on('shortcut:move_down', () => handleArrowNavigation('down'));
    keyboardManager.on('shortcut:move_left', () => handleArrowNavigation('left'));
    keyboardManager.on('shortcut:move_right', () => handleArrowNavigation('right'));

    // 檢測鍵盤使用
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab' || e.key.startsWith('Arrow')) {
        setKeyboardMode(true);
      }
    };

    // 檢測螢幕閱讀器
    const detectScreenReader = () => {
      const hasScreenReader = window.navigator.userAgent.includes('NVDA') ||
                             window.navigator.userAgent.includes('JAWS') ||
                             window.speechSynthesis ||
                             document.querySelector('[aria-live]');
      setScreenReaderMode(!!hasScreenReader);
    };

    document.addEventListener('keydown', handleKeyDown);
    detectScreenReader();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      keyboardManagerRef.current?.destroy();
      screenReaderManagerRef.current?.destroy();
    };
  }, [accessibilityEnabled]);

  // 初始化遊戲
  useEffect(() => {
    const handleGameStateChange = (state: MatchGameState) => {
      console.log('遊戲狀態更新:', state);
      setGameState(state);
      onGameStateChange?.(state);

      // 無障礙公告遊戲狀態變化
      if (screenReaderManagerRef.current && accessibilityEnabled) {
        const announcement = `遊戲狀態更新：已完成 ${state.matchedPairs.length} 個配對，剩餘 ${state.pairs.length - state.matchedPairs.length} 個`;
        screenReaderManagerRef.current.announce(announcement);
      }
    };
    const handleGameComplete = (result: MatchGameResult) => {
      setGameResult(result);
      onGameComplete?.(result);
    };
    const handleMatch = (pair: MatchPair, isCorrect: boolean) => {
      // 添加動畫效果
      const itemIds = [pair.leftItem.id, pair.rightItem.id];
      setAnimatingItems(new Set(itemIds));

      if (isCorrect) {
        // 成功配對動畫
        setSuccessAnimation(pair.id);
        // 添加脈衝效果
        setPulseItems(new Set(itemIds));

        // 播放成功音效
        if (config.enableSound) {
          playSuccessSound();
        }

        setTimeout(() => {
          setSuccessAnimation(null);
          setPulseItems(new Set());
        }, 1500);
      } else {
        // 錯誤配對動畫
        setErrorAnimation(`${pair.leftItem.id}-${pair.rightItem.id}`);

        // 播放錯誤音效
        if (config.enableSound) {
          playErrorSound();
        }

        setTimeout(() => {
          setErrorAnimation(null);
        }, 800);
      }

      setTimeout(() => {
        setAnimatingItems(new Set());
      }, 1000);
    };
    gameManager.addGameStateListener(handleGameStateChange);
    gameManager.addGameCompleteListener(handleGameComplete);
    gameManager.addMatchListener(handleMatch);
    return () => {
      gameManager.removeGameStateListener(handleGameStateChange);
      gameManager.removeGameCompleteListener(handleGameComplete);
      gameManager.removeMatchListener(handleMatch);
      gameManager.destroy();
    };
  }, [gameManager, onGameStateChange, onGameComplete]);
  // 開始遊戲
  const startGame = useCallback(() => {
    try {
      console.log('開始遊戲，配置:', config);
      console.log('配對數據:', pairs);
      const gameId = gameManager.startGame(config, pairs);
      setGameStarted(true);
      setGameResult(null);
      setShowHint(null);
      console.log('遊戲開始成功，遊戲ID:', gameId);
      // 手動檢查遊戲狀態
      setTimeout(() => {
        const currentState = gameManager.getCurrentState();
        console.log('當前遊戲狀態:', currentState);
      }, 100);
    } catch (error) {
      console.error('開始遊戲失敗:', error);
    }
  }, [gameManager, config, pairs]);

  // 音效播放函數
  const playSuccessSound = useCallback(() => {
    if (typeof window === 'undefined') return;

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // 成功音效：上升音調
      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
      oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
      oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.warn('播放成功音效失敗:', error);
    }
  }, []);

  const playErrorSound = useCallback(() => {
    if (typeof window === 'undefined') return;

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // 錯誤音效：下降音調
      oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(200, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(150, audioContext.currentTime + 0.2);

      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.warn('播放錯誤音效失敗:', error);
    }
  }, []);

  const playClickSound = useCallback(() => {
    if (typeof window === 'undefined') return;

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // 點擊音效：短促的音調
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);

      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
      console.warn('播放點擊音效失敗:', error);
    }
  }, []);

  // 自動開始遊戲（當組件掛載時）
  useEffect(() => {
    if (!gameStarted && !gameResult) {
      console.log('自動開始遊戲...');
      startGame();
    }
  }, [startGame, gameStarted, gameResult]);
  // 選擇項目
  const handleItemClick = useCallback((itemId: string) => {
    if (!gameState || gameState.isCompleted || gameState.isPaused) return;

    // 播放點擊音效
    if (config.enableSound) {
      playClickSound();
    }

    // 添加點擊動畫效果
    const newPulseItems = new Set(pulseItems);
    newPulseItems.add(itemId);
    setPulseItems(newPulseItems);

    setTimeout(() => {
      const updatedPulseItems = new Set(pulseItems);
      updatedPulseItems.delete(itemId);
      setPulseItems(updatedPulseItems);
    }, 300);

    gameManager.selectItem(itemId);
  }, [gameManager, gameState, config.enableSound, playClickSound, pulseItems]);
  // 使用智能提示（增強版）
  const handleUseHint = useCallback(() => {
    const hint = gameManager.useHint();
    if (hint) {
      setCurrentHint(hint);
      setShowHintPanel(true);

      // 應用視覺提示效果
      if (hint.visualCues?.highlightItems) {
        const highlightSet = new Set(hint.visualCues.highlightItems);
        setPulseItems(highlightSet);

        // 3秒後清除高亮效果
        setTimeout(() => {
          setPulseItems(new Set());
        }, 3000);
      }

      // 自動隱藏提示面板（根據提示級別調整時間）
      const hideDelay = hint.level === HintLevel.DIRECT ? 5000 : 3000;
      if (hintTimeoutRef.current) {
        clearTimeout(hintTimeoutRef.current);
      }
      hintTimeoutRef.current = setTimeout(() => {
        setShowHintPanel(false);
      }, hideDelay);
    }
  }, [gameManager]);

  // 獲取錯誤分析
  const handleShowErrorAnalysis = useCallback(() => {
    const analysis = gameManager.generateErrorAnalysisReport();
    const recommendations = gameManager.getPersonalizedRecommendations();

    setErrorAnalysis(analysis);
    setPersonalizedRecommendations(recommendations);
    setShowErrorAnalysis(true);
  }, [gameManager]);

  // 關閉錯誤分析面板
  const handleCloseErrorAnalysis = useCallback(() => {
    setShowErrorAnalysis(false);
  }, []);

  // 關閉提示面板
  const handleCloseHint = useCallback(() => {
    setShowHintPanel(false);
    if (hintTimeoutRef.current) {
      clearTimeout(hintTimeoutRef.current);
    }
  }, []);

  // 顯示記憶分析
  const handleShowMemoryAnalysis = useCallback(() => {
    const userId = gameState?.gameId || 'anonymous';
    const memoryReport = gameManager.generateMemoryReport(userId);

    setMemoryAnalysis(memoryReport.memoryAnalysis);
    setLearningPlan(memoryReport.learningPlan);
    setMemoryItems(memoryReport.memoryStatistics.totalItems > 0 ?
      gameManager.getMemoryStatistics(userId).items || [] : []);
    setShowMemoryAnalysis(true);
  }, [gameManager, gameState]);

  // 關閉記憶分析面板
  const handleCloseMemoryAnalysis = useCallback(() => {
    setShowMemoryAnalysis(false);
  }, []);

  // 開始復習會話
  const handleStartReviewSession = useCallback(() => {
    const userId = gameState?.gameId || 'anonymous';
    const session = gameManager.startReviewSession(userId);

    if (session) {
      setCurrentReviewSession(session);
      console.log('復習會話已開始:', session);
    }
  }, [gameManager, gameState]);

  // 顯示GEPT分析
  const handleShowGEPTAnalysis = useCallback(() => {
    const userId = gameState?.gameId || 'anonymous';
    const geptReport = gameManager.generateGEPTReport(userId);

    setLearnerProfile(geptReport.geptStatistics.learnerProfile);
    setVocabularyAnalysis(geptReport.geptStatistics.vocabularyAnalysis);
    setLevelTransitionRecommendation(geptReport.geptStatistics.levelTransition);
    setVocabularyReplacements(geptReport.vocabularyReplacements || []);
    setCrossLevelPlan(geptReport.geptStatistics.crossLevelPlan);
    setShowGEPTAnalysis(true);
  }, [gameManager, gameState]);

  // 關閉GEPT分析面板
  const handleCloseGEPTAnalysis = useCallback(() => {
    setShowGEPTAnalysis(false);
  }, []);

  // 調整GEPT等級
  const handleAdjustGEPTLevel = useCallback((level: 'elementary' | 'intermediate' | 'high-intermediate') => {
    gameManager.adjustGameDifficultyByGEPT(level);
    // 重新獲取遊戲狀態
    const newState = gameManager.getGameState();
    if (newState) {
      setGameState(newState);
    }
  }, [gameManager]);

  // 應用詞彙替換
  const handleApplyVocabularyReplacement = useCallback((original: string, replacement: string) => {
    const success = gameManager.applyVocabularyReplacement(original, replacement);
    if (success) {
      // 重新獲取遊戲狀態
      const newState = gameManager.getGameState();
      if (newState) {
        setGameState(newState);
      }
      console.log(`詞彙替換成功: ${original} -> ${replacement}`);

      // 無障礙公告詞彙替換
      if (screenReaderManagerRef.current && accessibilityEnabled) {
        screenReaderManagerRef.current.announce(`詞彙已替換：${original} 改為 ${replacement}`);
      }
    }
  }, [gameManager, accessibilityEnabled]);

  // 鍵盤導航處理函數
  const handleKeyboardHint = useCallback(() => {
    if (gameState && !gameState.isComplete) {
      handleHint();
    }
  }, [gameState]);

  const handleKeyboardPause = useCallback(() => {
    if (gameState) {
      handlePauseResume();
    }
  }, [gameState]);

  const handleKeyboardRestart = useCallback(() => {
    if (gameState) {
      handleEndGame();
    }
  }, [gameState]);

  const handleKeyboardActivate = useCallback(() => {
    if (!gameState || gameState.isComplete) return;

    const leftItems = gameState.pairs.filter(pair => !gameState.matchedPairs.some(mp => mp.leftItem.id === pair.leftItem.id));
    const rightItems = gameState.pairs.filter(pair => !gameState.matchedPairs.some(mp => mp.rightItem.id === pair.rightItem.id));

    if (focusRegion === 'left' && leftItems[currentFocusIndex]) {
      handleItemClick(leftItems[currentFocusIndex].leftItem.id);
    } else if (focusRegion === 'right' && rightItems[currentFocusIndex]) {
      handleItemClick(rightItems[currentFocusIndex].rightItem.id);
    }
  }, [gameState, focusRegion, currentFocusIndex]);

  const handleArrowNavigation = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (!gameState || gameState.isComplete) return;

    const leftItems = gameState.pairs.filter(pair => !gameState.matchedPairs.some(mp => mp.leftItem.id === pair.leftItem.id));
    const rightItems = gameState.pairs.filter(pair => !gameState.matchedPairs.some(mp => mp.rightItem.id === pair.rightItem.id));

    switch (direction) {
      case 'left':
        if (focusRegion === 'right') {
          setFocusRegion('left');
          setCurrentFocusIndex(Math.min(currentFocusIndex, leftItems.length - 1));
        }
        break;
      case 'right':
        if (focusRegion === 'left') {
          setFocusRegion('right');
          setCurrentFocusIndex(Math.min(currentFocusIndex, rightItems.length - 1));
        }
        break;
      case 'up':
        if (focusRegion === 'left') {
          setCurrentFocusIndex(Math.max(0, currentFocusIndex - 1));
        } else {
          setCurrentFocusIndex(Math.max(0, currentFocusIndex - 1));
        }
        break;
      case 'down':
        if (focusRegion === 'left') {
          setCurrentFocusIndex(Math.min(leftItems.length - 1, currentFocusIndex + 1));
        } else {
          setCurrentFocusIndex(Math.min(rightItems.length - 1, currentFocusIndex + 1));
        }
        break;
    }

    // 公告當前焦點項目
    if (screenReaderManagerRef.current && accessibilityEnabled) {
      const currentItems = focusRegion === 'left' ? leftItems : rightItems;
      const currentItem = currentItems[currentFocusIndex];
      if (currentItem) {
        const itemContent = focusRegion === 'left' ? currentItem.leftItem.content : currentItem.rightItem.content;
        screenReaderManagerRef.current.announce(`當前項目：${itemContent}`);
      }
    }
  }, [gameState, focusRegion, currentFocusIndex, accessibilityEnabled]);
  // 暫停/恢復遊戲
  const handlePauseResume = useCallback(() => {
    if (!gameState) return;
    if (gameState.isPaused) {
      gameManager.resumeGame();
    } else {
      gameManager.pauseGame();
    }
  }, [gameManager, gameState]);
  // 結束遊戲
  const handleEndGame = useCallback(() => {
    gameManager.endGame();
  }, [gameManager]);
  // 重新開始遊戲
  const handleRestartGame = useCallback(() => {
    startGame();
  }, [startGame]);
  // 獲取項目樣式
  const getItemStyle = (item: MatchItem): string => {
    const baseStyle = 'p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 min-h-[80px] flex items-center justify-center text-center relative overflow-hidden';
    if (!gameState) return `${baseStyle} border-gray-300 bg-white hover:bg-gray-50`;

    const isSelected = gameState.selectedItems.includes(item.id);
    const isMatched = gameState.pairs.some(pair =>
      gameState.matchedPairs.includes(pair.id) &&
      (pair.leftItem.id === item.id || pair.rightItem.id === item.id)
    );
    const isAnimating = animatingItems.has(item.id);
    const isPulsing = pulseItems.has(item.id);
    const hasSuccessAnimation = successAnimation && gameState.pairs.some(pair =>
      pair.id === successAnimation && (pair.leftItem.id === item.id || pair.rightItem.id === item.id)
    );
    const hasErrorAnimation = errorAnimation && errorAnimation.includes(item.id);

    let styleClasses = baseStyle;

    if (isMatched) {
      styleClasses += ' border-green-500 bg-green-100 text-green-800 cursor-default';
      if (hasSuccessAnimation) {
        styleClasses += ' animate-bounce';
      }
    } else if (isSelected) {
      styleClasses += ' border-blue-500 bg-blue-100 text-blue-800 scale-105 shadow-lg';
    } else if (hasErrorAnimation) {
      styleClasses += ' border-red-500 bg-red-100 text-red-800 animate-pulse';
    } else if (isAnimating) {
      styleClasses += ' border-yellow-500 bg-yellow-100 animate-pulse';
    } else if (isPulsing) {
      styleClasses += ' border-purple-400 bg-purple-50 scale-105';
    } else {
      styleClasses += ' border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-400 hover:scale-102 hover:shadow-md';
    }

    return styleClasses;
  };

  // 獲取提示級別樣式
  const getHintLevelStyle = (level: HintLevel): string => {
    switch (level) {
      case HintLevel.SUBTLE: return 'bg-green-100 text-green-800';
      case HintLevel.MODERATE: return 'bg-yellow-100 text-yellow-800';
      case HintLevel.STRONG: return 'bg-orange-100 text-orange-800';
      case HintLevel.DIRECT: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // 獲取提示級別文字
  const getHintLevelText = (level: HintLevel): string => {
    switch (level) {
      case HintLevel.SUBTLE: return '輕微';
      case HintLevel.MODERATE: return '中等';
      case HintLevel.STRONG: return '強提示';
      case HintLevel.DIRECT: return '直接';
      default: return '未知';
    }
  };

  // 獲取提示類型文字
  const getHintTypeText = (type: string): string => {
    const typeMap: Record<string, string> = {
      'visual': '視覺提示',
      'textual': '文字提示',
      'audio': '音頻提示',
      'contextual': '上下文提示',
      'elimination': '排除提示',
      'association': '聯想提示'
    };
    return typeMap[type] || '通用提示';
  };

  // 獲取錯誤類型描述
  const getErrorTypeDescription = (errorType: string): string => {
    const typeMap: Record<string, string> = {
      'semantic': '語義理解錯誤',
      'visual': '視覺混淆錯誤',
      'memory': '記憶失誤',
      'time_pressure': '時間壓力錯誤',
      'phonetic': '語音錯誤',
      'cultural': '文化差異錯誤',
      'difficulty': '難度不匹配錯誤'
    };
    return typeMap[errorType] || '未知錯誤類型';
  };

  // 獲取記憶狀態文字
  const getMemoryStatusText = (status: string): string => {
    const statusMap: Record<string, string> = {
      'new': '新學習',
      'learning': '學習中',
      'review': '復習中',
      'mature': '已掌握',
      'forgotten': '已遺忘'
    };
    return statusMap[status] || '未知狀態';
  };

  // 獲取記憶強度文字
  const getMemoryStrengthText = (strength: string): string => {
    const strengthMap: Record<string, string> = {
      'very_weak': '非常弱',
      'weak': '弱',
      'moderate': '中等',
      'strong': '強',
      'very_strong': '非常強'
    };
    return strengthMap[strength] || '未知強度';
  };

  // 獲取趨勢樣式
  const getTrendStyle = (trend: string): string => {
    switch (trend) {
      case 'improving':
      case 'increasing':
        return 'bg-green-100 text-green-800';
      case 'declining':
      case 'decreasing':
        return 'bg-red-100 text-red-800';
      case 'stable':
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // 獲取趨勢文字
  const getTrendText = (trend: string): string => {
    const trendMap: Record<string, string> = {
      'improving': '改善中',
      'declining': '下降中',
      'stable': '穩定',
      'increasing': '上升中',
      'decreasing': '下降中'
    };
    return trendMap[trend] || '未知趨勢';
  };

  // 獲取GEPT等級文字
  const getGEPTLevelText = (level: string): string => {
    const levelMap: Record<string, string> = {
      'elementary': '初級',
      'intermediate': '中級',
      'high-intermediate': '中高級'
    };
    return levelMap[level] || '未知等級';
  };
  // 渲染項目內容
  const renderItemContent = (item: MatchItem) => {
    switch (item.type) {
      case 'text':
        return (
          <span className="text-lg font-medium">
            {item.content}
          </span>
        );
      case 'image':
        return (
          <div className="flex flex-col items-center space-y-2">
            <img 
              src={item.content} 
              alt={item.displayText || '圖片'}
              className="max-w-full max-h-12 object-contain"
            />
            {item.displayText && (
              <span className="text-sm text-gray-600">{item.displayText}</span>
            )}
          </div>
        );
      case 'audio':
        return (
          <div className="flex flex-col items-center space-y-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                const audio = new Audio(item.content);
                audio.play();
              }}
              className="text-2xl hover:text-blue-600 transition-colors"
              title="播放音頻"
            >
              🔊
            </button>
            {item.displayText && (
              <span className="text-sm text-gray-600">{item.displayText}</span>
            )}
          </div>
        );
      default:
        return <span>{item.content}</span>;
    }
  };
  // 格式化時間
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  // 如果遊戲還沒開始，顯示開始界面
  if (!gameStarted) {
    return (
      <div className={`match-game-start bg-white rounded-lg shadow-sm p-8 ${className}`} data-testid={testId}>
        <div className="text-center">
          <div className="text-6xl mb-4">🎯</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Match配對遊戲</h2>
          <p className="text-gray-600 mb-6">
            找出相關的配對項目，挑戰你的記憶力和反應速度！
          </p>
          {/* 遊戲配置顯示 */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-gray-900 mb-3">遊戲設置</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">模式:</span>
                <span className="ml-2 font-medium">
                  {config.mode === 'text-text' ? '文字配對' :
                   config.mode === 'text-image' ? '文字圖片' :
                   config.mode === 'image-image' ? '圖片配對' :
                   config.mode === 'audio-text' ? '音頻文字' : '混合模式'}
                </span>
              </div>
              <div>
                <span className="text-gray-600">難度:</span>
                <span className="ml-2 font-medium">
                  {config.difficulty === 'easy' ? '簡單' :
                   config.difficulty === 'medium' ? '中等' :
                   config.difficulty === 'hard' ? '困難' : '專家'}
                </span>
              </div>
              <div>
                <span className="text-gray-600">配對數:</span>
                <span className="ml-2 font-medium">{config.pairCount}</span>
              </div>
              <div>
                <span className="text-gray-600">時間限制:</span>
                <span className="ml-2 font-medium">
                  {config.timeLimit ? `${config.timeLimit}秒` : '無限制'}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={startGame}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors text-lg font-medium"
            data-testid="start-game-btn"
          >
            🚀 開始遊戲
          </button>
        </div>
      </div>
    );
  }
  // 如果遊戲完成，顯示結果
  if (gameResult) {
    return (
      <div className={`match-game-result bg-white rounded-lg shadow-sm p-8 ${className}`} data-testid="game-result">
        <div className="text-center">
          <div className="text-6xl mb-4">
            {gameResult.accuracy >= 80 ? '🏆' : gameResult.accuracy >= 60 ? '🎉' : '💪'}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">遊戲完成！</h2>
          {/* 結果統計 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{gameResult.score}</div>
              <div className="text-sm text-blue-800">總分</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{gameResult.accuracy.toFixed(1)}%</div>
              <div className="text-sm text-green-800">準確率</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{gameResult.completionTime.toFixed(1)}s</div>
              <div className="text-sm text-purple-800">完成時間</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{gameResult.correctMatches}</div>
              <div className="text-sm text-orange-800">正確配對</div>
            </div>
          </div>
          {/* 學習建議 */}
          {gameResult.recommendations.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold text-yellow-900 mb-2">學習建議</h3>
              <ul className="space-y-1">
                {gameResult.recommendations.map((rec, index) => (
                  <li key={index} className="text-sm text-yellow-800">• {rec}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="flex justify-center space-x-4">
            <button
              onClick={handleRestartGame}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              data-testid="restart-game-btn"
            >
              🔄 再玩一次
            </button>
          </div>
        </div>
      </div>
    );
  }
  // 遊戲進行中界面
  return (
    <div className={`match-game bg-white rounded-lg shadow-sm ${className}`} data-testid={testId} ref={gameContainerRef}>
      {/* 遊戲頭部 */}
      <div className="game-header bg-gray-50 p-4 border-b">
        <div className="flex items-center justify-between">
          {/* 左側：分數和進度 */}
          <div className="flex items-center space-x-6">
            <div className="score">
              <span className="text-sm text-gray-600">分數:</span>
              <span className="ml-2 text-lg font-bold text-blue-600" data-testid="current-score">
                {gameState?.score || 0}
              </span>
            </div>
            <div className="progress">
              <span className="text-sm text-gray-600">進度:</span>
              <span className="ml-2 text-lg font-bold text-green-600" data-testid="game-progress">
                {gameState?.matchedPairs.length || 0}/{gameState?.pairs.length || 0}
              </span>
            </div>
            {gameState && gameState.currentStreak > 1 && (
              <div className="streak">
                <span className="text-sm text-gray-600">連續:</span>
                <span className="ml-2 text-lg font-bold text-purple-600" data-testid="current-streak">
                  {gameState.currentStreak}
                </span>
              </div>
            )}
          </div>
          {/* 右側：時間和控制 */}
          <div className="flex items-center space-x-4">
            {gameState && gameState.timeRemaining !== undefined && (
              <div className="timer">
                <span className="text-sm text-gray-600">時間:</span>
                <span className={`ml-2 text-lg font-bold ${
                  gameState.timeRemaining < 30 ? 'text-red-600' : 'text-gray-900'
                }`} data-testid="time-remaining">
                  {formatTime(gameState.timeRemaining)}
                </span>
              </div>
            )}
            <div className="controls flex space-x-2">
              {config.allowHints && (
                <button
                  onClick={handleUseHint}
                  className="px-3 py-1 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
                  data-testid="hint-btn"
                >
                  💡 提示
                </button>
              )}
              <button
                onClick={handlePauseResume}
                className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                data-testid="pause-resume-btn"
              >
                {gameState?.isPaused ? '▶️ 繼續' : '⏸️ 暫停'}
              </button>
              <button
                onClick={handleEndGame}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                data-testid="end-game-btn"
              >
                🏁 結束
              </button>
              <button
                onClick={() => setShowAccessibilitySettings(true)}
                className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                data-testid="accessibility-settings-btn"
                aria-label="開啟無障礙設定"
                title="無障礙設定 (Ctrl+H)"
              >
                ♿ 無障礙
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* 提示顯示 */}
      {showHint && (
        <div className="hint-display bg-yellow-50 border border-yellow-200 p-3 m-4 rounded-lg" data-testid="hint-display">
          <div className="flex items-start space-x-2">
            <span className="text-yellow-600 text-lg">💡</span>
            <span className="text-yellow-800">{showHint}</span>
          </div>
        </div>
      )}
      {/* 暫停覆蓋層 */}
      {gameState?.isPaused && (
        <div className="pause-overlay absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
          <div className="bg-white p-8 rounded-lg text-center">
            <div className="text-4xl mb-4">⏸️</div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">遊戲已暫停</h3>
            <button
              onClick={handlePauseResume}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              繼續遊戲
            </button>
          </div>
        </div>
      )}
      {/* 遊戲區域 */}
      <div className="game-area p-6">
        {gameState ? (
          // 根據配對數量選擇布局模式
          gameState.pairs.length === 7 ? (
            // Wordwall 風格單行水平布局 (7 個匹配數專用)
            <div className="wordwall-layout">
              {/* 題目卡片行 */}
              <div className="question-cards-row mb-8">
                <div className="flex justify-center items-start gap-3 flex-wrap">
                  {gameState.pairs.map((pair, index) => {
                    const isMatched = gameState.matchedPairs.some(mp => mp.leftItem.id === pair.leftItem.id);
                    const isSelected = gameState.selectedItems.includes(pair.leftItem.id);
                    const isFocused = accessibilityEnabled && keyboardMode && focusRegion === 'left' && currentFocusIndex === index;

                    return (
                      <div
                        key={pair.leftItem.id}
                        className={`question-card ${getItemStyle(pair.leftItem)} ${isFocused ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
                        style={{
                          width: '120px',
                          minHeight: '160px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '12px',
                          fontSize: '14px'
                        }}
                        onClick={() => handleItemClick(pair.leftItem.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleItemClick(pair.leftItem.id);
                          }
                        }}
                        role="button"
                        tabIndex={accessibilityEnabled ? (isFocused ? 0 : -1) : 0}
                        aria-label={`題目卡片：${pair.leftItem.content}${isMatched ? '，已配對' : ''}${isSelected ? '，已選擇' : ''}`}
                        aria-pressed={isSelected}
                        aria-disabled={isMatched}
                        data-testid={`question-card-${pair.leftItem.id}`}
                      >
                        {renderItemContent(pair.leftItem)}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 答案區域 */}
              <div className="answer-area">
                {/* 空白框行 */}
                <div className="drop-zones-row mb-4">
                  <div className="flex justify-center items-center gap-3 flex-wrap">
                    {gameState.pairs.map((pair, index) => {
                      const matchedPair = gameState.matchedPairs.find(mp => mp.leftItem.id === pair.leftItem.id);

                      return (
                        <div
                          key={`drop-zone-${pair.leftItem.id}`}
                          className="drop-zone"
                          style={{
                            width: '120px',
                            height: '80px',
                            border: '2px dashed #d1d5db',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: matchedPair ? '#d1fae5' : '#f9fafb',
                            fontSize: '12px',
                            color: '#6b7280'
                          }}
                          data-testid={`drop-zone-${index}`}
                        >
                          {matchedPair ? (
                            <span className="text-green-600 font-semibold">✓</span>
                          ) : (
                            <span>拖放答案</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 答案卡片行 */}
                <div className="answer-cards-row">
                  <div className="flex justify-center items-center gap-3 flex-wrap">
                    {gameState.pairs.map((pair, index) => {
                      const isMatched = gameState.matchedPairs.some(mp => mp.rightItem.id === pair.rightItem.id);
                      const isSelected = gameState.selectedItems.includes(pair.rightItem.id);
                      const isFocused = accessibilityEnabled && keyboardMode && focusRegion === 'right' && currentFocusIndex === index;

                      return (
                        <div
                          key={pair.rightItem.id}
                          className={`answer-card ${getItemStyle(pair.rightItem)} ${isFocused ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
                          style={{
                            width: '120px',
                            minHeight: '100px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '12px',
                            fontSize: '14px'
                          }}
                          onClick={() => handleItemClick(pair.rightItem.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleItemClick(pair.rightItem.id);
                            }
                          }}
                          role="button"
                          tabIndex={accessibilityEnabled ? (isFocused ? 0 : -1) : 0}
                          aria-label={`答案卡片：${pair.rightItem.content}${isMatched ? '，已配對' : ''}${isSelected ? '，已選擇' : ''}`}
                          aria-pressed={isSelected}
                          aria-disabled={isMatched}
                          data-testid={`answer-card-${pair.rightItem.id}`}
                        >
                          {renderItemContent(pair.rightItem)}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // 原有的左右分離布局 (其他匹配數使用)
            <div className="grid grid-cols-2 gap-6">
              {/* 左側項目 */}
              <div className="left-items space-y-3" data-testid="left-items" role="group" aria-labelledby="left-items-heading">
                <h3 id="left-items-heading" className="text-lg font-semibold text-gray-900 mb-4">選擇項目</h3>
                {gameState.pairs.map((pair, index) => {
                  const isMatched = gameState.matchedPairs.some(mp => mp.leftItem.id === pair.leftItem.id);
                  const isSelected = gameState.selectedItems.includes(pair.leftItem.id);
                  const isFocused = accessibilityEnabled && keyboardMode && focusRegion === 'left' && currentFocusIndex === index;

                  return (
                    <div
                      key={pair.leftItem.id}
                      className={`${getItemStyle(pair.leftItem)} ${isFocused ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
                      onClick={() => handleItemClick(pair.leftItem.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleItemClick(pair.leftItem.id);
                        }
                      }}
                      role="button"
                      tabIndex={accessibilityEnabled ? (isFocused ? 0 : -1) : 0}
                      aria-label={`選擇項目：${pair.leftItem.content}${isMatched ? '，已配對' : ''}${isSelected ? '，已選擇' : ''}`}
                      aria-pressed={isSelected}
                      aria-disabled={isMatched}
                      aria-describedby={`item-${pair.leftItem.id}-description`}
                      data-testid={`item-${pair.leftItem.id}`}
                    >
                      {renderItemContent(pair.leftItem)}
                      <div id={`item-${pair.leftItem.id}-description`} className="sr-only">
                        {isMatched ? '此項目已成功配對' : isSelected ? '此項目已選擇，請選擇配對項目' : '點擊選擇此項目'}
                      </div>
                    </div>
                  );
                })}
            </div>
            {/* 右側項目 */}
            <div className="right-items space-y-3" data-testid="right-items" role="group" aria-labelledby="right-items-heading">
              <h3 id="right-items-heading" className="text-lg font-semibold text-gray-900 mb-4">配對項目</h3>
              {gameState.pairs.map((pair, index) => {
                const isMatched = gameState.matchedPairs.some(mp => mp.rightItem.id === pair.rightItem.id);
                const isSelected = gameState.selectedItems.includes(pair.rightItem.id);
                const isFocused = accessibilityEnabled && keyboardMode && focusRegion === 'right' && currentFocusIndex === index;

              return (
                <div
                  key={pair.rightItem.id}
                  className={`${getItemStyle(pair.rightItem)} ${isFocused ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
                  onClick={() => handleItemClick(pair.rightItem.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleItemClick(pair.rightItem.id);
                    }
                  }}
                  role="button"
                  tabIndex={accessibilityEnabled ? (isFocused ? 0 : -1) : 0}
                  aria-label={`配對項目：${pair.rightItem.content}${isMatched ? '，已配對' : ''}${isSelected ? '，已選擇' : ''}`}
                  aria-pressed={isSelected}
                  aria-disabled={isMatched}
                  aria-describedby={`item-${pair.rightItem.id}-description`}
                  data-testid={`item-${pair.rightItem.id}`}
                >
                  {renderItemContent(pair.rightItem)}
                  <div id={`item-${pair.rightItem.id}-description`} className="sr-only">
                    {isMatched ? '此項目已成功配對' : isSelected ? '此項目已選擇，請選擇配對項目' : '點擊選擇此項目'}
                  </div>
                </div>
              );
            })}
          </div>
            </div>
          )
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">⏳</div>
            <p className="text-gray-600">遊戲正在加載中...</p>
          </div>
        )}
      </div>
      {/* 遊戲統計 */}
      {gameState && (
        <div className="game-stats bg-gray-50 p-4 border-t">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span data-testid="attempts-count">嘗試次數: {gameState.attempts}</span>
            <span data-testid="hints-used">使用提示: {gameState.hintsUsed}</span>
            <span data-testid="best-streak">最佳連續: {gameState.bestStreak}</span>
            {/* 錯誤分析按鈕 */}
            {gameState.errorHistory && gameState.errorHistory.length > 0 && (
              <button
                onClick={handleShowErrorAnalysis}
                className="px-3 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors mr-2"
                data-testid="error-analysis-btn"
              >
                📊 錯誤分析
              </button>
            )}
            {/* 記憶分析按鈕 */}
            <button
              onClick={handleShowMemoryAnalysis}
              className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors mr-2"
              data-testid="memory-analysis-btn"
            >
              🧠 記憶分析
            </button>
            {/* GEPT分析按鈕 */}
            <button
              onClick={handleShowGEPTAnalysis}
              className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              data-testid="gept-analysis-btn"
            >
              📚 GEPT分析
            </button>
          </div>
        </div>
      )}

      {/* 智能提示面板 */}
      {showHintPanel && currentHint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" data-testid="hint-panel">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                💡 智能提示
                <span className={`ml-2 px-2 py-1 text-xs rounded ${getHintLevelStyle(currentHint.level)}`}>
                  {getHintLevelText(currentHint.level)}
                </span>
              </h3>
              <button
                onClick={handleCloseHint}
                className="text-gray-400 hover:text-gray-600 text-xl"
                data-testid="close-hint-btn"
              >
                ×
              </button>
            </div>

            <div className="mb-4">
              <p className="text-gray-700 leading-relaxed">{currentHint.message}</p>
            </div>

            {currentHint.type && (
              <div className="text-xs text-gray-500 mb-2">
                提示類型: {getHintTypeText(currentHint.type)}
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={handleCloseHint}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                知道了
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 錯誤分析面板 */}
      {showErrorAnalysis && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" data-testid="error-analysis-panel">
          <div className="bg-white rounded-lg p-6 max-w-2xl mx-4 shadow-xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">📊 錯誤分析報告</h3>
              <button
                onClick={handleCloseErrorAnalysis}
                className="text-gray-400 hover:text-gray-600 text-xl"
                data-testid="close-error-analysis-btn"
              >
                ×
              </button>
            </div>

            {errorAnalysis ? (
              <div className="space-y-4">
                {/* 總體統計 */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">總體統計</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>總錯誤數: {errorAnalysis.totalErrors}</div>
                    <div>錯誤率: {(errorAnalysis.errorRate * 100).toFixed(1)}%</div>
                  </div>
                </div>

                {/* 主要錯誤類型 */}
                {errorAnalysis.dominantErrorTypes.length > 0 && (
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-red-900 mb-2">主要錯誤類型</h4>
                    <div className="space-y-1 text-sm text-red-800">
                      {errorAnalysis.dominantErrorTypes.map((errorType, index) => (
                        <div key={index}>• {getErrorTypeDescription(errorType)}</div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 學習洞察 */}
                {errorAnalysis.insights.length > 0 && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">學習洞察</h4>
                    <div className="space-y-1 text-sm text-blue-800">
                      {errorAnalysis.insights.map((insight, index) => (
                        <div key={index}>• {insight}</div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 個人化建議 */}
                {personalizedRecommendations.length > 0 && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-2">個人化建議</h4>
                    <div className="space-y-1 text-sm text-green-800">
                      {personalizedRecommendations.map((recommendation, index) => (
                        <div key={index}>• {recommendation}</div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 優勢領域 */}
                {errorAnalysis.strengths.length > 0 && (
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-yellow-900 mb-2">你的優勢</h4>
                    <div className="space-y-1 text-sm text-yellow-800">
                      {errorAnalysis.strengths.map((strength, index) => (
                        <div key={index}>• {strength}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                暫無錯誤數據可分析
              </div>
            )}

            <div className="flex justify-end mt-6">
              <button
                onClick={handleCloseErrorAnalysis}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
              >
                關閉
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 記憶分析面板 */}
      {showMemoryAnalysis && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" data-testid="memory-analysis-panel">
          <div className="bg-white rounded-lg p-6 max-w-4xl mx-4 shadow-xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">🧠 記憶曲線分析報告</h3>
              <button
                onClick={handleCloseMemoryAnalysis}
                className="text-gray-400 hover:text-gray-600 text-xl"
                data-testid="close-memory-analysis-btn"
              >
                ×
              </button>
            </div>

            {memoryAnalysis ? (
              <div className="space-y-6">
                {/* 總體統計 */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-3">📈 總體記憶統計</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{memoryAnalysis.totalItems}</div>
                      <div className="text-blue-800">總記憶項目</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {(memoryAnalysis.averageMemoryStrength * 100).toFixed(1)}%
                      </div>
                      <div className="text-blue-800">平均記憶強度</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {(memoryAnalysis.overallRetentionRate * 100).toFixed(1)}%
                      </div>
                      <div className="text-blue-800">整體保持率</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {memoryAnalysis.optimalReviewInterval.toFixed(1)}
                      </div>
                      <div className="text-blue-800">最佳復習間隔(天)</div>
                    </div>
                  </div>
                </div>

                {/* 記憶狀態分佈 */}
                {Object.keys(memoryAnalysis.itemsByStatus).length > 0 && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-3">📊 記憶狀態分佈</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      {Object.entries(memoryAnalysis.itemsByStatus).map(([status, count]) => (
                        <div key={status} className="text-center p-2 bg-white rounded">
                          <div className="text-lg font-bold text-green-600">{count}</div>
                          <div className="text-green-800">{getMemoryStatusText(status)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 記憶強度分佈 */}
                {Object.keys(memoryAnalysis.itemsByStrength).length > 0 && (
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-yellow-900 mb-3">💪 記憶強度分佈</h4>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                      {Object.entries(memoryAnalysis.itemsByStrength).map(([strength, count]) => (
                        <div key={strength} className="text-center p-2 bg-white rounded">
                          <div className="text-lg font-bold text-yellow-600">{count}</div>
                          <div className="text-yellow-800">{getMemoryStrengthText(strength)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 記憶趨勢 */}
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-indigo-900 mb-3">📈 記憶趨勢分析</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center">
                      <span className="text-indigo-700 mr-2">記憶趨勢:</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getTrendStyle(memoryAnalysis.memoryTrend)}`}>
                        {getTrendText(memoryAnalysis.memoryTrend)}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-indigo-700 mr-2">強度趨勢:</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getTrendStyle(memoryAnalysis.strengthTrend)}`}>
                        {getTrendText(memoryAnalysis.strengthTrend)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 預測保持率 */}
                <div className="bg-pink-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-pink-900 mb-3">🔮 記憶保持率預測</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-lg font-bold text-pink-600">
                        {(memoryAnalysis.predictedRetention.in1Day * 100).toFixed(1)}%
                      </div>
                      <div className="text-pink-800">1天後</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-pink-600">
                        {(memoryAnalysis.predictedRetention.in3Days * 100).toFixed(1)}%
                      </div>
                      <div className="text-pink-800">3天後</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-pink-600">
                        {(memoryAnalysis.predictedRetention.in7Days * 100).toFixed(1)}%
                      </div>
                      <div className="text-pink-800">7天後</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-pink-600">
                        {(memoryAnalysis.predictedRetention.in30Days * 100).toFixed(1)}%
                      </div>
                      <div className="text-pink-800">30天後</div>
                    </div>
                  </div>
                </div>

                {/* 復習建議 */}
                {memoryAnalysis.recommendations.length > 0 && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-3">💡 記憶改進建議</h4>
                    <div className="space-y-2 text-sm text-green-800">
                      {memoryAnalysis.recommendations.map((recommendation, index) => (
                        <div key={index} className="flex items-start">
                          <span className="text-green-600 mr-2">•</span>
                          <span>{recommendation}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 緊急復習項目 */}
                {memoryAnalysis.urgentReviews.length > 0 && (
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-red-900 mb-3">🚨 需要復習的項目 ({memoryAnalysis.urgentReviews.length})</h4>
                    <div className="space-y-2 text-sm">
                      {memoryAnalysis.urgentReviews.slice(0, 5).map((item, index) => (
                        <div key={index} className="flex items-center justify-between bg-white p-2 rounded">
                          <span className="text-red-800">{item.contentId}</span>
                          <span className="text-xs text-red-600">
                            強度: {(item.memoryStrength * 100).toFixed(0)}%
                          </span>
                        </div>
                      ))}
                      {memoryAnalysis.urgentReviews.length > 5 && (
                        <div className="text-xs text-red-600 text-center">
                          還有 {memoryAnalysis.urgentReviews.length - 5} 個項目...
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 學習計劃 */}
                {learningPlan && (
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-purple-900 mb-3">📅 今日學習計劃</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="text-center p-3 bg-white rounded">
                        <div className="text-lg font-bold text-purple-600">{learningPlan.dailyGoal.newItems}</div>
                        <div className="text-purple-800">新學習項目</div>
                      </div>
                      <div className="text-center p-3 bg-white rounded">
                        <div className="text-lg font-bold text-purple-600">{learningPlan.dailyGoal.reviewItems}</div>
                        <div className="text-purple-800">復習項目</div>
                      </div>
                      <div className="text-center p-3 bg-white rounded">
                        <div className="text-lg font-bold text-purple-600">{learningPlan.dailyGoal.studyTime}</div>
                        <div className="text-purple-800">學習時間(分鐘)</div>
                      </div>
                    </div>

                    {learningPlan.priorityItems.length > 0 && (
                      <div className="mt-4">
                        <h5 className="font-medium text-purple-900 mb-2">優先復習項目:</h5>
                        <div className="space-y-1 text-xs">
                          {learningPlan.priorityItems.slice(0, 3).map((item, index) => (
                            <div key={index} className="flex items-center justify-between bg-white p-2 rounded">
                              <span className="text-purple-800">{item.contentId}</span>
                              <span className="text-purple-600">{item.priority}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                暫無記憶數據可分析，請先進行一些學習活動
              </div>
            )}

            <div className="flex justify-end mt-6 space-x-3">
              {memoryAnalysis && memoryAnalysis.urgentReviews.length > 0 && (
                <button
                  onClick={handleStartReviewSession}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  開始復習會話
                </button>
              )}
              <button
                onClick={handleCloseMemoryAnalysis}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                關閉
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GEPT分級分析面板 */}
      {showGEPTAnalysis && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" data-testid="gept-analysis-panel">
          <div className="bg-white rounded-lg p-6 max-w-5xl mx-4 shadow-xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">📚 GEPT分級分析報告</h3>
              <button
                onClick={handleCloseGEPTAnalysis}
                className="text-gray-400 hover:text-gray-600 text-xl"
                data-testid="close-gept-analysis-btn"
              >
                ×
              </button>
            </div>

            {learnerProfile ? (
              <div className="space-y-6">
                {/* 學習者檔案 */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-3">👤 學習者檔案</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{learnerProfile.currentLevel}</div>
                      <div className="text-green-800">當前等級</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{learnerProfile.targetLevel}</div>
                      <div className="text-green-800">目標等級</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{learnerProfile.progressHistory.length}</div>
                      <div className="text-green-800">學習記錄</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{learnerProfile.learningPreferences.learningPace}</div>
                      <div className="text-green-800">學習節奏</div>
                    </div>
                  </div>

                  {learnerProfile.strengths.length > 0 && (
                    <div className="mt-4">
                      <h5 className="font-medium text-green-900 mb-2">💪 學習優勢:</h5>
                      <div className="flex flex-wrap gap-2">
                        {learnerProfile.strengths.map((strength, index) => (
                          <span key={index} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                            {strength}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {learnerProfile.weaknesses.length > 0 && (
                    <div className="mt-4">
                      <h5 className="font-medium text-green-900 mb-2">🎯 需要改善:</h5>
                      <div className="flex flex-wrap gap-2">
                        {learnerProfile.weaknesses.map((weakness, index) => (
                          <span key={index} className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">
                            {weakness}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 詞彙分析 */}
                {vocabularyAnalysis && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-3">📖 詞彙分析</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{vocabularyAnalysis.totalWords}</div>
                        <div className="text-blue-800">總詞彙數</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{vocabularyAnalysis.knownWords}</div>
                        <div className="text-blue-800">已掌握</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">{vocabularyAnalysis.unknownWords}</div>
                        <div className="text-blue-800">待學習</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">{vocabularyAnalysis.difficultWords.length}</div>
                        <div className="text-blue-800">困難詞彙</div>
                      </div>
                    </div>

                    {/* 等級分佈 */}
                    <div className="mt-4">
                      <h5 className="font-medium text-blue-900 mb-2">📊 等級分佈:</h5>
                      <div className="grid grid-cols-3 gap-3">
                        {Object.entries(vocabularyAnalysis.levelDistribution).map(([level, count]) => (
                          <div key={level} className="text-center p-2 bg-white rounded">
                            <div className="text-lg font-bold text-blue-600">{count}</div>
                            <div className="text-blue-800 text-xs">{getGEPTLevelText(level)}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 推薦重點 */}
                    {vocabularyAnalysis.recommendedFocus.length > 0 && (
                      <div className="mt-4">
                        <h5 className="font-medium text-blue-900 mb-2">🎯 推薦重點:</h5>
                        <div className="space-y-1 text-sm text-blue-800">
                          {vocabularyAnalysis.recommendedFocus.map((focus, index) => (
                            <div key={index} className="flex items-start">
                              <span className="text-blue-600 mr-2">•</span>
                              <span>{focus}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 等級轉換建議 */}
                {levelTransitionRecommendation && (
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-purple-900 mb-3">🚀 等級轉換建議</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="text-center p-3 bg-white rounded">
                        <div className="text-lg font-bold text-purple-600">
                          {levelTransitionRecommendation.currentLevel} → {levelTransitionRecommendation.recommendedLevel}
                        </div>
                        <div className="text-purple-800">建議轉換</div>
                      </div>
                      <div className="text-center p-3 bg-white rounded">
                        <div className="text-lg font-bold text-green-600">
                          {(levelTransitionRecommendation.readinessScore * 100).toFixed(1)}%
                        </div>
                        <div className="text-purple-800">準備度</div>
                      </div>
                      <div className="text-center p-3 bg-white rounded">
                        <div className="text-lg font-bold text-orange-600">
                          {levelTransitionRecommendation.estimatedTime}天
                        </div>
                        <div className="text-purple-800">預估時間</div>
                      </div>
                    </div>

                    {/* 等級要求 */}
                    {levelTransitionRecommendation.requirements.length > 0 && (
                      <div className="mt-4">
                        <h5 className="font-medium text-purple-900 mb-2">📋 等級要求:</h5>
                        <div className="space-y-2">
                          {levelTransitionRecommendation.requirements.map((req, index) => (
                            <div key={index} className="bg-white p-3 rounded">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-purple-800">{req.description}</span>
                                <span className={`px-2 py-1 rounded text-xs ${
                                  req.priority === 'high' ? 'bg-red-100 text-red-800' :
                                  req.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {req.priority}
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-purple-600 h-2 rounded-full"
                                  style={{ width: `${Math.min(100, req.progress * 100)}%` }}
                                ></div>
                              </div>
                              <div className="text-xs text-purple-600 mt-1">
                                {req.currentScore}/{req.requiredScore} ({(req.progress * 100).toFixed(1)}%)
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 建議原因 */}
                    {levelTransitionRecommendation.reasons.length > 0 && (
                      <div className="mt-4">
                        <h5 className="font-medium text-purple-900 mb-2">💡 建議原因:</h5>
                        <div className="space-y-1 text-sm text-purple-800">
                          {levelTransitionRecommendation.reasons.map((reason, index) => (
                            <div key={index} className="flex items-start">
                              <span className="text-purple-600 mr-2">•</span>
                              <span>{reason}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 詞彙替換建議 */}
                {vocabularyReplacements.length > 0 && (
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-yellow-900 mb-3">🔄 詞彙替換建議</h4>
                    <div className="space-y-3">
                      {vocabularyReplacements.slice(0, 5).map((replacement, index) => (
                        <div key={index} className="bg-white p-3 rounded">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-yellow-800">
                              原詞: {replacement.original.word} ({replacement.original.level})
                            </span>
                            <span className="text-xs text-yellow-600">
                              信心度: {(replacement.confidence * 100).toFixed(0)}%
                            </span>
                          </div>
                          <div className="space-y-2">
                            {replacement.suggestions.slice(0, 3).map((suggestion, suggestionIndex) => (
                              <div key={suggestionIndex} className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                                <div>
                                  <span className="font-medium text-yellow-800">{suggestion.word.word}</span>
                                  <span className="text-xs text-yellow-600 ml-2">({suggestion.word.level})</span>
                                  <div className="text-xs text-yellow-700">{suggestion.reason}</div>
                                </div>
                                <button
                                  onClick={() => handleApplyVocabularyReplacement(replacement.original.word, suggestion.word.word)}
                                  className="px-2 py-1 bg-yellow-600 text-white rounded text-xs hover:bg-yellow-700"
                                >
                                  應用
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* GEPT等級調整 */}
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-indigo-900 mb-3">⚙️ GEPT等級調整</h4>
                  <div className="flex flex-wrap gap-3">
                    {(['elementary', 'intermediate', 'high-intermediate'] as const).map((level) => (
                      <button
                        key={level}
                        onClick={() => handleAdjustGEPTLevel(level)}
                        className={`px-4 py-2 rounded transition-colors ${
                          learnerProfile.currentLevel === level
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white text-indigo-600 border border-indigo-600 hover:bg-indigo-50'
                        }`}
                      >
                        {getGEPTLevelText(level)}
                      </button>
                    ))}
                  </div>
                  <div className="mt-3 text-sm text-indigo-700">
                    當前等級: {getGEPTLevelText(learnerProfile.currentLevel)}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                暫無GEPT分析數據，請先進行一些學習活動
              </div>
            )}

            <div className="flex justify-end mt-6 space-x-3">
              <button
                onClick={handleCloseGEPTAnalysis}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                關閉
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 無障礙設定面板 */}
      <AccessibilitySettingsPanel
        isOpen={showAccessibilitySettings}
        onClose={() => setShowAccessibilitySettings(false)}
        settings={accessibilitySettings}
        onSettingsChange={setAccessibilitySettings}
        onRunCompliance={() => {
          // 運行合規檢查後的回調
          if (screenReaderManagerRef.current) {
            screenReaderManagerRef.current.announce('WCAG 合規檢查已完成');
          }
        }}
      />
    </div>
  );
}
