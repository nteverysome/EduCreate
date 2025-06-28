/**
 * 遊戲選項管理器 - 第二階段增強版
 * 為每種遊戲類型提供詳細的可配置選項
 */

import { GameType } from './UniversalContentManager';

export interface TimerOption {
  type: 'none' | 'countUp' | 'countDown' | 'perQuestion';
  duration?: number; // 秒數
  showWarning?: boolean; // 是否顯示時間警告
  warningTime?: number; // 警告時間（秒）
  autoSubmit?: boolean; // 時間到自動提交
}

export interface ScoringOption {
  type: 'points' | 'percentage' | 'stars' | 'custom';
  pointsPerCorrect?: number;
  pointsPerIncorrect?: number;
  bonusForSpeed?: boolean;
  penaltyForWrong?: boolean;
  showScore?: 'always' | 'end' | 'never';
}

export interface LivesOption {
  enabled: boolean;
  count?: number;
  showHearts?: boolean;
  gameOverOnZero?: boolean;
  regenerate?: boolean;
  regenerateTime?: number; // 秒數
}

export interface DifficultyOption {
  level: 'easy' | 'medium' | 'hard' | 'adaptive';
  adaptiveSettings?: {
    startLevel: 'easy' | 'medium' | 'hard';
    adjustmentSpeed: 'slow' | 'normal' | 'fast';
    minLevel: 'easy' | 'medium';
    maxLevel: 'medium' | 'hard';
  };
}

export interface AudioOption {
  backgroundMusic?: {
    enabled: boolean;
    volume: number; // 0-100
    track?: string;
  };
  soundEffects?: {
    enabled: boolean;
    volume: number; // 0-100
    correctSound?: string;
    incorrectSound?: string;
    clickSound?: string;
    completionSound?: string;
  };
  voiceOver?: {
    enabled: boolean;
    language: string;
    speed: number; // 0.5-2.0
    autoRead?: boolean;
  };
}

export interface VisualOption {
  animations?: {
    enabled: boolean;
    speed: 'slow' | 'normal' | 'fast';
    effects: string[];
  };
  particles?: {
    enabled: boolean;
    type: 'confetti' | 'stars' | 'bubbles' | 'fireworks';
    intensity: 'low' | 'medium' | 'high';
  };
  transitions?: {
    type: 'fade' | 'slide' | 'zoom' | 'flip';
    duration: number; // 毫秒
  };
}

export interface AccessibilityOption {
  highContrast?: boolean;
  largeText?: boolean;
  keyboardNavigation?: boolean;
  screenReader?: boolean;
  colorBlindFriendly?: boolean;
  reducedMotion?: boolean;
}

export interface GameplayOption {
  shuffleQuestions?: boolean;
  shuffleAnswers?: boolean;
  allowSkip?: boolean;
  showProgress?: boolean;
  showHints?: boolean;
  maxAttempts?: number;
  instantFeedback?: boolean;
  reviewMode?: boolean;
}

export interface GameOptions {
  timer: TimerOption;
  scoring: ScoringOption;
  lives: LivesOption;
  difficulty: DifficultyOption;
  audio: AudioOption;
  visual: VisualOption;
  accessibility: AccessibilityOption;
  gameplay: GameplayOption;
  
  // 遊戲特定選項
  gameSpecific?: Record<string, any>;
}

export interface GameOptionDefinition {
  id: string;
  name: string;
  description: string;
  type: 'boolean' | 'number' | 'string' | 'select' | 'range' | 'color' | 'multiselect';
  category: 'timer' | 'scoring' | 'lives' | 'difficulty' | 'audio' | 'visual' | 'accessibility' | 'gameplay' | 'specific';
  defaultValue: any;
  options?: { value: any; label: string; description?: string }[];
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  dependencies?: { optionId: string; value: any }[];
  validation?: (value: any) => boolean | string;
  preview?: boolean; // 是否支持實時預覽
}

export class GameOptionsManager {
  private static gameOptionDefinitions: Record<GameType, GameOptionDefinition[]> = {};

  // 初始化所有遊戲選項定義
  static initialize() {
    this.gameOptionDefinitions = {
      'quiz': this.getQuizOptions(),
      'matching': this.getMatchingOptions(),
      'flashcards': this.getFlashcardsOptions(),
      'spin-wheel': this.getSpinWheelOptions(),
      'whack-a-mole': this.getWhackAMoleOptions(),
      'memory-cards': this.getMemoryCardsOptions()
    };
  }

  // 獲取特定遊戲的選項定義
  static getGameOptionDefinitions(gameType: GameType): GameOptionDefinition[] {
    if (Object.keys(this.gameOptionDefinitions).length === 0) {
      this.initialize();
    }
    return this.gameOptionDefinitions[gameType] || [];
  }

  // 獲取默認選項
  static getDefaultOptions(gameType: GameType): GameOptions {
    const definitions = this.getGameOptionDefinitions(gameType);
    const defaultOptions: any = {
      timer: { type: 'none' },
      scoring: { type: 'points', pointsPerCorrect: 10, showScore: 'always' },
      lives: { enabled: false },
      difficulty: { level: 'medium' },
      audio: {
        backgroundMusic: { enabled: false, volume: 50 },
        soundEffects: { enabled: true, volume: 70 },
        voiceOver: { enabled: false, language: 'zh-TW', speed: 1.0 }
      },
      visual: {
        animations: { enabled: true, speed: 'normal', effects: [] },
        particles: { enabled: true, type: 'confetti', intensity: 'medium' },
        transitions: { type: 'fade', duration: 300 }
      },
      accessibility: {
        highContrast: false,
        largeText: false,
        keyboardNavigation: true,
        screenReader: false,
        colorBlindFriendly: false,
        reducedMotion: false
      },
      gameplay: {
        shuffleQuestions: false,
        shuffleAnswers: true,
        allowSkip: false,
        showProgress: true,
        showHints: false,
        maxAttempts: 1,
        instantFeedback: true,
        reviewMode: false
      },
      gameSpecific: {}
    };

    // 應用定義中的默認值
    definitions.forEach(def => {
      this.setNestedValue(defaultOptions, def.id, def.defaultValue);
    });

    return defaultOptions;
  }

  // 驗證選項配置
  static validateOptions(gameType: GameType, options: Partial<GameOptions>): { isValid: boolean; errors: string[] } {
    const definitions = this.getGameOptionDefinitions(gameType);
    const errors: string[] = [];

    definitions.forEach(def => {
      const value = this.getNestedValue(options, def.id);
      
      if (value !== undefined && def.validation) {
        const result = def.validation(value);
        if (result !== true) {
          errors.push(typeof result === 'string' ? result : `${def.name} 的值無效`);
        }
      }

      // 檢查依賴關係
      if (def.dependencies) {
        const dependenciesMet = def.dependencies.every(dep => {
          const depValue = this.getNestedValue(options, dep.optionId);
          return depValue === dep.value;
        });
        
        if (!dependenciesMet && value !== undefined) {
          errors.push(`${def.name} 的依賴條件未滿足`);
        }
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // 獲取選項的分類
  static getOptionsByCategory(gameType: GameType, category: GameOptionDefinition['category']): GameOptionDefinition[] {
    return this.getGameOptionDefinitions(gameType).filter(def => def.category === category);
  }

  // 合併選項
  static mergeOptions(defaultOptions: GameOptions, userOptions: Partial<GameOptions>): GameOptions {
    return this.deepMerge(defaultOptions, userOptions);
  }

  // Quiz 遊戲選項
  private static getQuizOptions(): GameOptionDefinition[] {
    return [
      // 計時器選項
      {
        id: 'timer.type',
        name: '計時器類型',
        description: '選擇計時器的行為方式',
        type: 'select',
        category: 'timer',
        defaultValue: 'none',
        options: [
          { value: 'none', label: '無計時器' },
          { value: 'countUp', label: '正計時' },
          { value: 'countDown', label: '倒計時' },
          { value: 'perQuestion', label: '每題計時' }
        ]
      },
      {
        id: 'timer.duration',
        name: '計時時長',
        description: '設置計時器的時長（秒）',
        type: 'range',
        category: 'timer',
        defaultValue: 60,
        min: 10,
        max: 600,
        step: 10,
        unit: '秒',
        dependencies: [{ optionId: 'timer.type', value: 'countDown' }]
      },
      {
        id: 'timer.showWarning',
        name: '顯示時間警告',
        description: '在時間即將結束時顯示警告',
        type: 'boolean',
        category: 'timer',
        defaultValue: true,
        dependencies: [{ optionId: 'timer.type', value: 'countDown' }]
      },

      // 計分選項
      {
        id: 'scoring.type',
        name: '計分方式',
        description: '選擇如何計算和顯示分數',
        type: 'select',
        category: 'scoring',
        defaultValue: 'points',
        options: [
          { value: 'points', label: '積分制' },
          { value: 'percentage', label: '百分比' },
          { value: 'stars', label: '星級評分' },
          { value: 'custom', label: '自定義' }
        ]
      },
      {
        id: 'scoring.pointsPerCorrect',
        name: '正確答案分數',
        description: '每個正確答案獲得的分數',
        type: 'number',
        category: 'scoring',
        defaultValue: 10,
        min: 1,
        max: 100,
        dependencies: [{ optionId: 'scoring.type', value: 'points' }]
      },
      {
        id: 'scoring.bonusForSpeed',
        name: '速度獎勵',
        description: '根據答題速度給予額外分數',
        type: 'boolean',
        category: 'scoring',
        defaultValue: false
      },

      // 生命值選項
      {
        id: 'lives.enabled',
        name: '啟用生命值',
        description: '為遊戲添加生命值機制',
        type: 'boolean',
        category: 'lives',
        defaultValue: false
      },
      {
        id: 'lives.count',
        name: '生命值數量',
        description: '設置初始生命值數量',
        type: 'range',
        category: 'lives',
        defaultValue: 3,
        min: 1,
        max: 10,
        dependencies: [{ optionId: 'lives.enabled', value: true }]
      },

      // 遊戲玩法選項
      {
        id: 'gameplay.shuffleQuestions',
        name: '隨機問題順序',
        description: '每次遊戲時隨機排列問題順序',
        type: 'boolean',
        category: 'gameplay',
        defaultValue: false
      },
      {
        id: 'gameplay.shuffleAnswers',
        name: '隨機答案順序',
        description: '隨機排列每個問題的答案選項',
        type: 'boolean',
        category: 'gameplay',
        defaultValue: true
      },
      {
        id: 'gameplay.allowSkip',
        name: '允許跳過',
        description: '允許玩家跳過困難的問題',
        type: 'boolean',
        category: 'gameplay',
        defaultValue: false
      },
      {
        id: 'gameplay.showHints',
        name: '顯示提示',
        description: '為問題提供提示功能',
        type: 'boolean',
        category: 'gameplay',
        defaultValue: false
      },
      {
        id: 'gameplay.maxAttempts',
        name: '最大嘗試次數',
        description: '每個問題的最大嘗試次數',
        type: 'range',
        category: 'gameplay',
        defaultValue: 1,
        min: 1,
        max: 5
      },

      // 音效選項
      {
        id: 'audio.soundEffects.enabled',
        name: '啟用音效',
        description: '播放遊戲音效',
        type: 'boolean',
        category: 'audio',
        defaultValue: true
      },
      {
        id: 'audio.soundEffects.volume',
        name: '音效音量',
        description: '調整音效的音量大小',
        type: 'range',
        category: 'audio',
        defaultValue: 70,
        min: 0,
        max: 100,
        unit: '%',
        dependencies: [{ optionId: 'audio.soundEffects.enabled', value: true }]
      },

      // 視覺效果選項
      {
        id: 'visual.animations.enabled',
        name: '啟用動畫',
        description: '顯示過渡動畫和視覺效果',
        type: 'boolean',
        category: 'visual',
        defaultValue: true,
        preview: true
      },
      {
        id: 'visual.particles.enabled',
        name: '啟用粒子效果',
        description: '在正確答案時顯示粒子效果',
        type: 'boolean',
        category: 'visual',
        defaultValue: true,
        preview: true
      },
      {
        id: 'visual.particles.type',
        name: '粒子效果類型',
        description: '選擇粒子效果的樣式',
        type: 'select',
        category: 'visual',
        defaultValue: 'confetti',
        options: [
          { value: 'confetti', label: '彩紙' },
          { value: 'stars', label: '星星' },
          { value: 'bubbles', label: '氣泡' },
          { value: 'fireworks', label: '煙花' }
        ],
        dependencies: [{ optionId: 'visual.particles.enabled', value: true }],
        preview: true
      },

      // 無障礙選項
      {
        id: 'accessibility.highContrast',
        name: '高對比度',
        description: '使用高對比度顏色方案',
        type: 'boolean',
        category: 'accessibility',
        defaultValue: false
      },
      {
        id: 'accessibility.largeText',
        name: '大字體',
        description: '使用更大的字體尺寸',
        type: 'boolean',
        category: 'accessibility',
        defaultValue: false
      },
      {
        id: 'accessibility.keyboardNavigation',
        name: '鍵盤導航',
        description: '支持使用鍵盤進行遊戲',
        type: 'boolean',
        category: 'accessibility',
        defaultValue: true
      }
    ];
  }

  // 其他遊戲類型的選項定義...
  private static getMatchingOptions(): GameOptionDefinition[] {
    // 配對遊戲的特定選項
    return [
      ...this.getCommonOptions(),
      {
        id: 'gameSpecific.layout',
        name: '佈局方式',
        description: '選擇配對項目的排列方式',
        type: 'select',
        category: 'specific',
        defaultValue: 'grid',
        options: [
          { value: 'grid', label: '網格佈局' },
          { value: 'columns', label: '雙列佈局' },
          { value: 'scattered', label: '散佈佈局' }
        ]
      },
      {
        id: 'gameSpecific.dragAndDrop',
        name: '拖拽模式',
        description: '啟用拖拽配對功能',
        type: 'boolean',
        category: 'specific',
        defaultValue: true
      }
    ];
  }

  private static getFlashcardsOptions(): GameOptionDefinition[] {
    return [
      ...this.getCommonOptions(),
      {
        id: 'gameSpecific.autoFlip',
        name: '自動翻轉',
        description: '自動翻轉到答案面',
        type: 'boolean',
        category: 'specific',
        defaultValue: false
      },
      {
        id: 'gameSpecific.flipDelay',
        name: '翻轉延遲',
        description: '自動翻轉的延遲時間（秒）',
        type: 'range',
        category: 'specific',
        defaultValue: 3,
        min: 1,
        max: 10,
        dependencies: [{ optionId: 'gameSpecific.autoFlip', value: true }]
      }
    ];
  }

  private static getSpinWheelOptions(): GameOptionDefinition[] {
    return [
      ...this.getCommonOptions(),
      {
        id: 'gameSpecific.spinSpeed',
        name: '轉盤速度',
        description: '設置轉盤的旋轉速度',
        type: 'select',
        category: 'specific',
        defaultValue: 'normal',
        options: [
          { value: 'slow', label: '慢速' },
          { value: 'normal', label: '正常' },
          { value: 'fast', label: '快速' }
        ]
      }
    ];
  }

  private static getWhackAMoleOptions(): GameOptionDefinition[] {
    return [
      ...this.getCommonOptions(),
      {
        id: 'gameSpecific.moleSpeed',
        name: '地鼠速度',
        description: '地鼠出現和消失的速度',
        type: 'select',
        category: 'specific',
        defaultValue: 'normal',
        options: [
          { value: 'slow', label: '慢速' },
          { value: 'normal', label: '正常' },
          { value: 'fast', label: '快速' }
        ]
      }
    ];
  }

  private static getMemoryCardsOptions(): GameOptionDefinition[] {
    return [
      ...this.getCommonOptions(),
      {
        id: 'gameSpecific.cardFlipTime',
        name: '卡片翻轉時間',
        description: '卡片保持翻開的時間（秒）',
        type: 'range',
        category: 'specific',
        defaultValue: 2,
        min: 1,
        max: 5
      }
    ];
  }

  // 通用選項
  private static getCommonOptions(): GameOptionDefinition[] {
    return [
      {
        id: 'timer.type',
        name: '計時器類型',
        description: '選擇計時器的行為方式',
        type: 'select',
        category: 'timer',
        defaultValue: 'none',
        options: [
          { value: 'none', label: '無計時器' },
          { value: 'countUp', label: '正計時' },
          { value: 'countDown', label: '倒計時' }
        ]
      },
      {
        id: 'audio.soundEffects.enabled',
        name: '啟用音效',
        description: '播放遊戲音效',
        type: 'boolean',
        category: 'audio',
        defaultValue: true
      },
      {
        id: 'visual.animations.enabled',
        name: '啟用動畫',
        description: '顯示過渡動畫和視覺效果',
        type: 'boolean',
        category: 'visual',
        defaultValue: true
      }
    ];
  }

  // 工具方法
  private static getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private static setNestedValue(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    const target = keys.reduce((current, key) => {
      if (!current[key]) current[key] = {};
      return current[key];
    }, obj);
    target[lastKey] = value;
  }

  private static deepMerge(target: any, source: any): any {
    const result = { ...target };
    
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    
    return result;
  }
}
