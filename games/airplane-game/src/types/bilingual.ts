/**
 * 雙語系統類型定義
 * 基於 Task 1.5.1 需求分析和 Task 1.5.2 設計
 */

import { GEPTLevel, GEPTWord } from '../managers/GEPTManager';

// ============================================================================
// 核心雙語接口
// ============================================================================

/**
 * 擴展的雙語詞彙接口
 */
export interface BilingualVocabulary extends GEPTWord {
  pronunciation?: string;
  example?: {
    english: string;
    chinese: string;
  };
  category?: string;
  synonyms?: string[];
  antonyms?: string[];
  relatedWords?: string[];
}

/**
 * 雙語詞彙數據庫結構
 */
export interface BilingualDatabase {
  metadata: {
    version: string;
    lastUpdated: string;
    description: string;
    totalWords: number;
    levels: GEPTLevel[];
  };
  vocabulary: {
    [K in GEPTLevel]: BilingualVocabulary[];
  };
  categories: {
    [category: string]: string[];
  };
  statistics: {
    [K in GEPTLevel]: number;
  } & {
    totalCategories: number;
    averageFrequency: { [K in GEPTLevel]: number };
    averageDifficulty: { [K in GEPTLevel]: number };
  };
}

// ============================================================================
// 顯示配置接口
// ============================================================================

/**
 * 雙語顯示配置
 */
export interface BilingualDisplayConfig {
  position: 'top-center' | 'bottom-center' | 'floating';
  style: BilingualTextStyle;
  animation: BilingualAnimationConfig;
  layout: BilingualLayoutConfig;
}

/**
 * 雙語文字樣式
 */
export interface BilingualTextStyle {
  fontSize: number;
  fontFamily: string;
  color: string;
  backgroundColor: string;
  padding: { x: number; y: number };
  borderRadius: number;
  border: string;
  shadow?: {
    offsetX: number;
    offsetY: number;
    color: string;
    blur: number;
  };
}

/**
 * 雙語動畫配置
 */
export interface BilingualAnimationConfig {
  fadeIn: { duration: number; ease: string };
  fadeOut: { duration: number; ease: string };
  bounce?: { amplitude: number; duration: number };
  slide?: { direction: 'up' | 'down' | 'left' | 'right'; distance: number };
  scale?: { from: number; to: number; duration: number };
}

/**
 * 雙語佈局配置
 */
export interface BilingualLayoutConfig {
  chineseFirst: boolean;
  showBoth: boolean;
  verticalSpacing: number;
  horizontalSpacing: number;
  alignment: 'left' | 'center' | 'right';
}

// ============================================================================
// 狀態管理接口
// ============================================================================

/**
 * 雙語提示狀態
 */
export interface BilingualPromptState {
  isVisible: boolean;
  currentWord: BilingualVocabulary | null;
  displayMode: BilingualDisplayMode;
  lastUpdateTime: number;
  animationState: 'idle' | 'showing' | 'hiding' | 'updating';
}

/**
 * 雙語顯示模式
 */
export type BilingualDisplayMode = 
  | 'chinese-only'
  | 'english-only' 
  | 'both-vertical'
  | 'both-horizontal'
  | 'alternating';

/**
 * 雙語管理器狀態
 */
export interface BilingualManagerState {
  isInitialized: boolean;
  currentLevel: GEPTLevel;
  loadedWords: number;
  cacheSize: number;
  displayConfig: BilingualDisplayConfig;
  promptState: BilingualPromptState;
  accessibilitySettings: AccessibilitySettings;
}

// ============================================================================
// 無障礙設計接口
// ============================================================================

/**
 * 無障礙設置
 */
export interface AccessibilitySettings {
  fontSize: FontSize;
  contrast: ContrastMode;
  enableVoice: boolean;
  enableKeyboardNav: boolean;
  screenReaderMode: boolean;
  reducedMotion: boolean;
  highContrast: boolean;
  largeText: boolean;
}

/**
 * 字體大小選項
 */
export type FontSize = 'small' | 'medium' | 'large' | 'extra-large';

/**
 * 對比度模式
 */
export type ContrastMode = 'normal' | 'high' | 'reverse';

/**
 * 無障礙事件
 */
export interface AccessibilityEvent {
  type: 'font-size-change' | 'contrast-change' | 'voice-toggle' | 'keyboard-nav';
  oldValue: any;
  newValue: any;
  timestamp: number;
}

// ============================================================================
// 事件系統接口
// ============================================================================

/**
 * 雙語系統事件類型
 */
export type BilingualEventType = 
  | 'word-show'
  | 'word-hide'
  | 'word-update'
  | 'config-change'
  | 'accessibility-change'
  | 'cache-update'
  | 'error';

/**
 * 雙語系統事件
 */
export interface BilingualEvent {
  type: BilingualEventType;
  data: any;
  timestamp: number;
  source: 'BilingualManager' | 'ChineseUIManager' | 'AccessibilityManager';
}

/**
 * 事件監聽器
 */
export type BilingualEventListener = (event: BilingualEvent) => void;

// ============================================================================
// 性能監控接口
// ============================================================================

/**
 * 性能指標
 */
export interface BilingualPerformanceMetrics {
  renderTime: number;
  cacheHitRate: number;
  memoryUsage: number;
  animationFPS: number;
  wordLoadTime: number;
  uiUpdateTime: number;
}

/**
 * 性能監控配置
 */
export interface PerformanceMonitorConfig {
  enabled: boolean;
  sampleRate: number;
  maxSamples: number;
  alertThresholds: {
    renderTime: number;
    memoryUsage: number;
    animationFPS: number;
  };
}

// ============================================================================
// 快取系統接口
// ============================================================================

/**
 * 快取項目
 */
export interface CacheItem<T> {
  key: string;
  value: T;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
  ttl?: number;
}

/**
 * 快取配置
 */
export interface CacheConfig {
  maxSize: number;
  ttl: number;
  cleanupInterval: number;
  strategy: 'LRU' | 'LFU' | 'FIFO';
}

/**
 * 快取統計
 */
export interface CacheStatistics {
  size: number;
  hitRate: number;
  missRate: number;
  evictionCount: number;
  totalRequests: number;
  averageAccessTime: number;
}

// ============================================================================
// 驗證和錯誤處理接口
// ============================================================================

/**
 * 雙語驗證結果
 */
export interface BilingualValidationResult {
  isValid: boolean;
  errors: BilingualValidationError[];
  warnings: BilingualValidationWarning[];
  suggestions: string[];
  score: number;
}

/**
 * 雙語驗證錯誤
 */
export interface BilingualValidationError {
  type: 'translation-mismatch' | 'encoding-error' | 'format-error' | 'level-mismatch';
  message: string;
  field: string;
  severity: 'error' | 'warning' | 'info';
  suggestion?: string;
}

/**
 * 雙語驗證警告
 */
export interface BilingualValidationWarning {
  type: 'complexity' | 'frequency' | 'cultural-context';
  message: string;
  suggestion: string;
  impact: 'low' | 'medium' | 'high';
}

// ============================================================================
// 工具函數類型
// ============================================================================

/**
 * 詞彙搜索選項
 */
export interface VocabularySearchOptions {
  level?: GEPTLevel;
  category?: string;
  minFrequency?: number;
  maxDifficulty?: number;
  includeExamples?: boolean;
  sortBy?: 'frequency' | 'difficulty' | 'alphabetical';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
}

/**
 * 詞彙搜索結果
 */
export interface VocabularySearchResult {
  words: BilingualVocabulary[];
  totalCount: number;
  searchTime: number;
  filters: VocabularySearchOptions;
}

/**
 * 翻譯選項
 */
export interface TranslationOptions {
  includeContext?: boolean;
  includePronunciation?: boolean;
  includeExamples?: boolean;
  preferredStyle?: 'formal' | 'casual' | 'academic';
}

/**
 * 翻譯結果
 */
export interface TranslationResult {
  english: string;
  chinese: string;
  confidence: number;
  alternatives?: string[];
  context?: string;
  pronunciation?: string;
  examples?: Array<{ english: string; chinese: string }>;
}

// ============================================================================
// 導出所有類型
// ============================================================================

export type {
  // 核心接口
  BilingualVocabulary,
  BilingualDatabase,
  
  // 配置接口
  BilingualDisplayConfig,
  BilingualTextStyle,
  BilingualAnimationConfig,
  BilingualLayoutConfig,
  
  // 狀態接口
  BilingualPromptState,
  BilingualDisplayMode,
  BilingualManagerState,
  
  // 無障礙接口
  AccessibilitySettings,
  FontSize,
  ContrastMode,
  AccessibilityEvent,
  
  // 事件接口
  BilingualEventType,
  BilingualEvent,
  BilingualEventListener,
  
  // 性能接口
  BilingualPerformanceMetrics,
  PerformanceMonitorConfig,
  
  // 快取接口
  CacheItem,
  CacheConfig,
  CacheStatistics,
  
  // 驗證接口
  BilingualValidationResult,
  BilingualValidationError,
  BilingualValidationWarning,
  
  // 工具接口
  VocabularySearchOptions,
  VocabularySearchResult,
  TranslationOptions,
  TranslationResult
};
