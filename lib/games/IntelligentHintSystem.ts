/**
 * 智能提示系統
 * 基於錯誤模式分析和學習狀態提供個人化的智能提示
 */

import { MatchItem, MatchPair, GEPTLevel } from './MatchGameManager';
import { ErrorPatternAnalyzer, ErrorType, ErrorRecord } from './ErrorPatternAnalyzer';

// 提示級別
export enum HintLevel {
  SUBTLE = 'subtle',       // 輕微提示：僅提供方向性指導
  MODERATE = 'moderate',   // 中等提示：提供部分信息
  STRONG = 'strong',       // 強提示：提供明確指導
  DIRECT = 'direct'        // 直接提示：直接給出答案
}

// 提示類型
export enum HintType {
  VISUAL = 'visual',       // 視覺提示：高亮、顏色、動畫
  TEXTUAL = 'textual',     // 文字提示：文字說明
  AUDIO = 'audio',         // 音頻提示：語音提示
  CONTEXTUAL = 'contextual', // 上下文提示：相關信息
  ELIMINATION = 'elimination', // 排除提示：排除錯誤選項
  ASSOCIATION = 'association'  // 聯想提示：記憶聯想
}

// 提示內容
export interface HintContent {
  id: string;
  level: HintLevel;
  type: HintType;
  message: string;
  visualCues?: {
    highlightItems?: string[]; // 需要高亮的項目ID
    colorScheme?: string;      // 顏色方案
    animation?: string;        // 動畫效果
  };
  audioCues?: {
    soundEffect?: string;      // 音效
    voiceText?: string;        // 語音文字
  };
  effectiveness?: number;      // 提示效果評分 (0-1)
  usageCount?: number;         // 使用次數
  successRate?: number;        // 成功率
}

// 提示請求
export interface HintRequest {
  currentItems: MatchItem[];
  availablePairs: MatchPair[];
  selectedItems: string[];
  gameContext: {
    mode: string;
    difficulty: string;
    geptLevel?: GEPTLevel;
    timeRemaining: number;
    currentStreak: number;
    totalAttempts: number;
    hintsUsed: number;
  };
  userProfile: {
    errorHistory: ErrorRecord[];
    dominantErrorTypes: ErrorType[];
    learningPreferences: string[];
    skillLevel: number; // 0-1
  };
}

// 提示策略
export interface HintStrategy {
  name: string;
  description: string;
  conditions: (request: HintRequest) => boolean;
  generateHint: (request: HintRequest) => HintContent;
  priority: number; // 策略優先級
}

export class IntelligentHintSystem {
  private errorAnalyzer: ErrorPatternAnalyzer;
  private hintHistory: HintContent[] = [];
  private strategies: HintStrategy[] = [];

  constructor(errorAnalyzer: ErrorPatternAnalyzer) {
    this.errorAnalyzer = errorAnalyzer;
    this.initializeStrategies();
  }

  /**
   * 初始化提示策略
   */
  private initializeStrategies(): void {
    this.strategies = [
      // 錯誤模式導向策略
      {
        name: 'error-pattern-guided',
        description: '基於用戶錯誤模式提供針對性提示',
        priority: 10,
        conditions: (request) => request.userProfile.errorHistory.length > 3,
        generateHint: (request) => this.generateErrorPatternHint(request)
      },

      // 時間壓力策略
      {
        name: 'time-pressure-relief',
        description: '在時間壓力下提供快速有效的提示',
        priority: 9,
        conditions: (request) => request.gameContext.timeRemaining < 30,
        generateHint: (request) => this.generateTimePressureHint(request)
      },

      // 連續錯誤策略
      {
        name: 'streak-breaker',
        description: '打破連續錯誤的循環',
        priority: 8,
        conditions: (request) => request.gameContext.currentStreak === 0 && request.gameContext.totalAttempts > 2,
        generateHint: (request) => this.generateStreakBreakerHint(request)
      },

      // 難度適應策略
      {
        name: 'difficulty-adaptive',
        description: '根據難度級別調整提示強度',
        priority: 7,
        conditions: (request) => true,
        generateHint: (request) => this.generateDifficultyAdaptiveHint(request)
      },

      // GEPT 級別策略
      {
        name: 'gept-level-specific',
        description: '基於 GEPT 級別提供適當的提示',
        priority: 6,
        conditions: (request) => !!request.gameContext.geptLevel,
        generateHint: (request) => this.generateGEPTSpecificHint(request)
      },

      // 學習偏好策略
      {
        name: 'learning-preference',
        description: '基於學習偏好提供個人化提示',
        priority: 5,
        conditions: (request) => request.userProfile.learningPreferences.length > 0,
        generateHint: (request) => this.generateLearningPreferenceHint(request)
      },

      // 默認策略
      {
        name: 'default',
        description: '通用提示策略',
        priority: 1,
        conditions: () => true,
        generateHint: (request) => this.generateDefaultHint(request)
      }
    ];

    // 按優先級排序
    this.strategies.sort((a, b) => b.priority - a.priority);
  }

  /**
   * 生成智能提示
   */
  generateHint(request: HintRequest): HintContent {
    // 找到第一個符合條件的策略
    const strategy = this.strategies.find(s => s.conditions(request));
    
    if (!strategy) {
      throw new Error('No suitable hint strategy found');
    }

    const hint = strategy.generateHint(request);
    
    // 記錄提示歷史
    this.hintHistory.push(hint);
    
    // 限制歷史記錄長度
    if (this.hintHistory.length > 100) {
      this.hintHistory = this.hintHistory.slice(-50);
    }

    return hint;
  }

  /**
   * 基於錯誤模式生成提示
   */
  private generateErrorPatternHint(request: HintRequest): HintContent {
    const dominantErrorType = request.userProfile.dominantErrorTypes[0];
    
    switch (dominantErrorType) {
      case ErrorType.VISUAL_CONFUSION:
        return {
          id: `hint_visual_${Date.now()}`,
          level: HintLevel.MODERATE,
          type: HintType.VISUAL,
          message: '仔細觀察項目的細節差異，注意相似但不同的部分',
          visualCues: {
            highlightItems: request.selectedItems,
            colorScheme: 'attention',
            animation: 'pulse'
          }
        };

      case ErrorType.TIME_PRESSURE:
        return {
          id: `hint_time_${Date.now()}`,
          level: HintLevel.STRONG,
          type: HintType.TEXTUAL,
          message: '深呼吸，放慢速度。正確性比速度更重要',
          visualCues: {
            colorScheme: 'calm',
            animation: 'breathe'
          }
        };

      case ErrorType.SEMANTIC_ERROR:
        return {
          id: `hint_semantic_${Date.now()}`,
          level: HintLevel.MODERATE,
          type: HintType.CONTEXTUAL,
          message: '思考這些詞彙的真正含義和用法場景',
          visualCues: {
            highlightItems: this.findSemanticallySimilarItems(request),
            colorScheme: 'semantic'
          }
        };

      case ErrorType.MEMORY_LAPSE:
        return {
          id: `hint_memory_${Date.now()}`,
          level: HintLevel.MODERATE,
          type: HintType.ASSOCIATION,
          message: '嘗試建立聯想記憶，想想這些詞彙的共同點',
          visualCues: {
            animation: 'connect'
          }
        };

      default:
        return this.generateDefaultHint(request);
    }
  }

  /**
   * 生成時間壓力提示
   */
  private generateTimePressureHint(request: HintRequest): HintContent {
    const timeRemaining = request.gameContext.timeRemaining;
    
    if (timeRemaining < 10) {
      // 緊急情況：直接提示
      return {
        id: `hint_urgent_${Date.now()}`,
        level: HintLevel.DIRECT,
        type: HintType.ELIMINATION,
        message: '時間緊迫！專注於最有把握的配對',
        visualCues: {
          highlightItems: this.findMostLikelyPairs(request),
          colorScheme: 'urgent',
          animation: 'flash'
        },
        audioCues: {
          soundEffect: 'urgent-beep'
        }
      };
    } else {
      // 一般時間壓力：策略提示
      return {
        id: `hint_time_strategy_${Date.now()}`,
        level: HintLevel.STRONG,
        type: HintType.TEXTUAL,
        message: '還有時間，先選擇最確定的配對',
        visualCues: {
          colorScheme: 'warning',
          animation: 'steady-pulse'
        }
      };
    }
  }

  /**
   * 生成連續錯誤打破提示
   */
  private generateStreakBreakerHint(request: HintRequest): HintContent {
    return {
      id: `hint_streak_breaker_${Date.now()}`,
      level: HintLevel.STRONG,
      type: HintType.CONTEXTUAL,
      message: '暫停一下，重新審視所有選項。有時候第一印象可能是錯的',
      visualCues: {
        highlightItems: request.currentItems.map(item => item.id),
        colorScheme: 'reset',
        animation: 'fade-in'
      },
      audioCues: {
        soundEffect: 'gentle-chime'
      }
    };
  }

  /**
   * 生成難度適應提示
   */
  private generateDifficultyAdaptiveHint(request: HintRequest): HintContent {
    const difficulty = request.gameContext.difficulty;
    
    switch (difficulty) {
      case 'easy':
        return {
          id: `hint_easy_${Date.now()}`,
          level: HintLevel.SUBTLE,
          type: HintType.VISUAL,
          message: '相信你的直覺，這個級別的配對通常很直觀',
          visualCues: {
            colorScheme: 'encouraging',
            animation: 'gentle-glow'
          }
        };

      case 'medium':
        return {
          id: `hint_medium_${Date.now()}`,
          level: HintLevel.MODERATE,
          type: HintType.TEXTUAL,
          message: '仔細思考詞彙之間的關係，可能不是最明顯的配對',
          visualCues: {
            colorScheme: 'thoughtful'
          }
        };

      case 'hard':
        return {
          id: `hint_hard_${Date.now()}`,
          level: HintLevel.STRONG,
          type: HintType.CONTEXTUAL,
          message: '這個級別需要深入理解。考慮詞彙的多重含義和用法',
          visualCues: {
            colorScheme: 'analytical',
            animation: 'slow-pulse'
          }
        };

      case 'expert':
        return {
          id: `hint_expert_${Date.now()}`,
          level: HintLevel.MODERATE,
          type: HintType.ELIMINATION,
          message: '專家級別：排除明顯錯誤的選項，專注於細微差別',
          visualCues: {
            colorScheme: 'expert',
            animation: 'precise-highlight'
          }
        };

      default:
        return this.generateDefaultHint(request);
    }
  }

  /**
   * 生成 GEPT 特定提示
   */
  private generateGEPTSpecificHint(request: HintRequest): HintContent {
    const geptLevel = request.gameContext.geptLevel;
    
    switch (geptLevel) {
      case 'elementary':
        return {
          id: `hint_gept_elem_${Date.now()}`,
          level: HintLevel.MODERATE,
          type: HintType.TEXTUAL,
          message: '初級詞彙通常有直接的對應關係，想想日常生活中的用法',
          visualCues: {
            colorScheme: 'elementary'
          }
        };

      case 'intermediate':
        return {
          id: `hint_gept_inter_${Date.now()}`,
          level: HintLevel.MODERATE,
          type: HintType.CONTEXTUAL,
          message: '中級詞彙可能有多種含義，考慮最常見的用法',
          visualCues: {
            colorScheme: 'intermediate'
          }
        };

      case 'high-intermediate':
        return {
          id: `hint_gept_high_${Date.now()}`,
          level: HintLevel.STRONG,
          type: HintType.ASSOCIATION,
          message: '中高級詞彙注重語境和搭配，想想詞彙的正式或非正式用法',
          visualCues: {
            colorScheme: 'advanced'
          }
        };

      default:
        return this.generateDefaultHint(request);
    }
  }

  /**
   * 生成學習偏好提示
   */
  private generateLearningPreferenceHint(request: HintRequest): HintContent {
    const preferences = request.userProfile.learningPreferences;
    
    if (preferences.includes('visual')) {
      return {
        id: `hint_visual_pref_${Date.now()}`,
        level: HintLevel.MODERATE,
        type: HintType.VISUAL,
        message: '觀察項目的視覺特徵和排列模式',
        visualCues: {
          highlightItems: request.currentItems.map(item => item.id),
          colorScheme: 'visual-learner',
          animation: 'pattern-highlight'
        }
      };
    }
    
    if (preferences.includes('auditory')) {
      return {
        id: `hint_audio_pref_${Date.now()}`,
        level: HintLevel.MODERATE,
        type: HintType.AUDIO,
        message: '在心中默念這些詞彙，聽聽它們的聲音',
        audioCues: {
          soundEffect: 'soft-chime',
          voiceText: '仔細聽詞彙的發音'
        }
      };
    }
    
    return this.generateDefaultHint(request);
  }

  /**
   * 生成默認提示
   */
  private generateDefaultHint(request: HintRequest): HintContent {
    const hintsUsed = request.gameContext.hintsUsed;
    
    // 根據已使用的提示次數調整提示級別
    let level: HintLevel;
    if (hintsUsed === 0) {
      level = HintLevel.SUBTLE;
    } else if (hintsUsed === 1) {
      level = HintLevel.MODERATE;
    } else if (hintsUsed === 2) {
      level = HintLevel.STRONG;
    } else {
      level = HintLevel.DIRECT;
    }

    const messages = {
      [HintLevel.SUBTLE]: '仔細觀察，答案就在眼前',
      [HintLevel.MODERATE]: '思考這些項目之間的關聯性',
      [HintLevel.STRONG]: '專注於你最有把握的配對',
      [HintLevel.DIRECT]: '選擇最明顯相關的項目進行配對'
    };

    return {
      id: `hint_default_${Date.now()}`,
      level,
      type: HintType.TEXTUAL,
      message: messages[level],
      visualCues: {
        colorScheme: 'neutral'
      }
    };
  }

  /**
   * 找到語義相似的項目
   */
  private findSemanticallySimilarItems(request: HintRequest): string[] {
    // 簡化實現：返回當前選中的項目
    return request.selectedItems;
  }

  /**
   * 找到最可能的配對
   */
  private findMostLikelyPairs(request: HintRequest): string[] {
    // 簡化實現：返回前兩個項目
    return request.currentItems.slice(0, 2).map(item => item.id);
  }

  /**
   * 評估提示效果
   */
  evaluateHintEffectiveness(hintId: string, wasSuccessful: boolean): void {
    const hint = this.hintHistory.find(h => h.id === hintId);
    if (hint) {
      hint.usageCount = (hint.usageCount || 0) + 1;
      const previousSuccesses = (hint.successRate || 0) * ((hint.usageCount || 1) - 1);
      hint.successRate = (previousSuccesses + (wasSuccessful ? 1 : 0)) / (hint.usageCount || 1);
      hint.effectiveness = hint.successRate;
    }
  }

  /**
   * 獲取提示統計
   */
  getHintStatistics(): any {
    const totalHints = this.hintHistory.length;
    const hintsByLevel = this.hintHistory.reduce((acc, hint) => {
      acc[hint.level] = (acc[hint.level] || 0) + 1;
      return acc;
    }, {} as Record<HintLevel, number>);

    const hintsByType = this.hintHistory.reduce((acc, hint) => {
      acc[hint.type] = (acc[hint.type] || 0) + 1;
      return acc;
    }, {} as Record<HintType, number>);

    const averageEffectiveness = this.hintHistory
      .filter(h => h.effectiveness !== undefined)
      .reduce((sum, h) => sum + (h.effectiveness || 0), 0) / 
      this.hintHistory.filter(h => h.effectiveness !== undefined).length || 0;

    return {
      totalHints,
      hintsByLevel,
      hintsByType,
      averageEffectiveness,
      recentHints: this.hintHistory.slice(-10)
    };
  }

  /**
   * 清除提示歷史
   */
  clearHintHistory(): void {
    this.hintHistory = [];
  }

  /**
   * 獲取提示歷史
   */
  getHintHistory(): HintContent[] {
    return [...this.hintHistory];
  }
}
