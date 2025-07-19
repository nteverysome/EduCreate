/**
 * 詞彙難度管理器
 * 實現智能詞彙難度調整、同義詞替換和個人化詞彙學習支援
 */

import { GEPTManager, GEPTLevel, GEPTWord } from './GEPTManager';

// 詞彙難度調整模式
export enum DifficultyAdjustmentMode {
  AUTOMATIC = 'automatic',     // 自動調整
  MANUAL = 'manual',          // 手動調整
  ADAPTIVE = 'adaptive',      // 自適應調整
  PROGRESSIVE = 'progressive' // 漸進式調整
}

// 詞彙替換建議
export interface VocabularyReplacement {
  original: GEPTWord;
  suggestions: ReplacementSuggestion[];
  context: string;
  confidence: number;
}

// 替換建議
export interface ReplacementSuggestion {
  word: GEPTWord;
  similarity: number;        // 語義相似度 0-1
  appropriateness: number;   // 上下文適合度 0-1
  difficulty: number;        // 難度分數 1-10
  reason: string;
}

// 詞彙學習狀態
export interface VocabularyLearningState {
  word: string;
  level: GEPTLevel;
  masteryLevel: number;      // 掌握程度 0-1
  exposureCount: number;     // 接觸次數
  correctCount: number;      // 正確次數
  lastSeen: number;          // 最後見到時間
  nextReview: number;        // 下次復習時間
  difficulty: number;        // 個人化難度
  learningPhase: 'introduction' | 'practice' | 'mastery' | 'maintenance';
}

// 詞彙學習分析
export interface VocabularyAnalysis {
  totalWords: number;
  knownWords: number;
  unknownWords: number;
  difficultWords: string[];
  easyWords: string[];
  levelDistribution: Record<GEPTLevel, number>;
  masteryDistribution: Record<string, number>;
  recommendedFocus: string[];
}

// 詞彙學習計劃
export interface VocabularyLearningPlan {
  userId: string;
  targetLevel: GEPTLevel;
  currentVocabulary: VocabularyLearningState[];
  newWordsToLearn: GEPTWord[];
  wordsToReview: VocabularyLearningState[];
  dailyGoal: {
    newWords: number;
    reviewWords: number;
    practiceTime: number; // 分鐘
  };
  estimatedCompletionTime: number; // 天數
}

export class VocabularyDifficultyManager {
  private geptManager: GEPTManager;
  private vocabularyStates: Map<string, Map<string, VocabularyLearningState>> = new Map();
  private synonymDatabase: Map<string, string[]> = new Map();

  constructor(geptManager: GEPTManager) {
    this.geptManager = geptManager;
    this.initializeSynonymDatabase();
  }

  /**
   * 初始化同義詞數據庫
   */
  private initializeSynonymDatabase(): void {
    // 基礎同義詞數據庫
    const synonyms = [
      ['good', 'nice', 'great', 'excellent', 'wonderful'],
      ['bad', 'poor', 'terrible', 'awful', 'horrible'],
      ['big', 'large', 'huge', 'enormous', 'massive'],
      ['small', 'little', 'tiny', 'minute', 'miniature'],
      ['happy', 'glad', 'joyful', 'cheerful', 'delighted'],
      ['sad', 'unhappy', 'sorrowful', 'melancholy', 'depressed'],
      ['fast', 'quick', 'rapid', 'swift', 'speedy'],
      ['slow', 'sluggish', 'gradual', 'leisurely', 'unhurried'],
      ['smart', 'intelligent', 'clever', 'brilliant', 'wise'],
      ['beautiful', 'pretty', 'lovely', 'gorgeous', 'stunning'],
      ['important', 'significant', 'crucial', 'vital', 'essential'],
      ['difficult', 'hard', 'challenging', 'tough', 'complex'],
      ['easy', 'simple', 'effortless', 'straightforward', 'basic'],
      ['interesting', 'fascinating', 'engaging', 'captivating', 'intriguing'],
      ['boring', 'dull', 'tedious', 'monotonous', 'uninteresting']
    ];

    synonyms.forEach(group => {
      group.forEach(word => {
        this.synonymDatabase.set(word.toLowerCase(), 
          group.filter(w => w !== word).map(w => w.toLowerCase())
        );
      });
    });
  }

  /**
   * 調整詞彙難度
   */
  adjustVocabularyDifficulty(
    content: string,
    targetLevel: GEPTLevel,
    mode: DifficultyAdjustmentMode = DifficultyAdjustmentMode.AUTOMATIC,
    userId?: string
  ): VocabularyReplacement[] {
    const words = this.extractWords(content);
    const replacements: VocabularyReplacement[] = [];

    for (const word of words) {
      const geptWord = this.geptManager.getWordInfo(word.toLowerCase());
      if (geptWord && this.shouldReplaceWord(geptWord, targetLevel, mode, userId)) {
        const replacement = this.generateVocabularyReplacement(
          geptWord,
          targetLevel,
          content,
          mode,
          userId
        );
        if (replacement) {
          replacements.push(replacement);
        }
      }
    }

    return replacements;
  }

  /**
   * 判斷是否需要替換詞彙
   */
  private shouldReplaceWord(
    word: GEPTWord,
    targetLevel: GEPTLevel,
    mode: DifficultyAdjustmentMode,
    userId?: string
  ): boolean {
    const levelOrder: GEPTLevel[] = ['elementary', 'intermediate', 'high-intermediate'];
    const targetIndex = levelOrder.indexOf(targetLevel);
    const wordIndex = levelOrder.indexOf(word.level);

    switch (mode) {
      case DifficultyAdjustmentMode.AUTOMATIC:
        return wordIndex > targetIndex;

      case DifficultyAdjustmentMode.ADAPTIVE:
        if (userId) {
          const userState = this.getVocabularyState(userId, word.word);
          if (userState) {
            // 基於用戶掌握程度決定
            return userState.masteryLevel < 0.7 && wordIndex > targetIndex;
          }
        }
        return wordIndex > targetIndex;

      case DifficultyAdjustmentMode.PROGRESSIVE:
        // 漸進式：允許略高於目標等級的詞彙
        return wordIndex > targetIndex + 1;

      case DifficultyAdjustmentMode.MANUAL:
        return false; // 手動模式不自動替換

      default:
        return wordIndex > targetIndex;
    }
  }

  /**
   * 生成詞彙替換建議
   */
  private generateVocabularyReplacement(
    originalWord: GEPTWord,
    targetLevel: GEPTLevel,
    context: string,
    mode: DifficultyAdjustmentMode,
    userId?: string
  ): VocabularyReplacement | null {
    const suggestions = this.findReplacementSuggestions(
      originalWord,
      targetLevel,
      context,
      userId
    );

    if (suggestions.length === 0) return null;

    return {
      original: originalWord,
      suggestions,
      context: this.extractWordContext(originalWord.word, context),
      confidence: this.calculateReplacementConfidence(originalWord, suggestions)
    };
  }

  /**
   * 尋找替換建議
   */
  private findReplacementSuggestions(
    originalWord: GEPTWord,
    targetLevel: GEPTLevel,
    context: string,
    userId?: string
  ): ReplacementSuggestion[] {
    const suggestions: ReplacementSuggestion[] = [];

    // 1. 從同義詞數據庫尋找
    const synonyms = this.synonymDatabase.get(originalWord.word.toLowerCase()) || [];
    for (const synonym of synonyms) {
      const synonymWord = this.geptManager.getWordInfo(synonym);
      if (synonymWord && this.isAppropriateLevel(synonymWord, targetLevel)) {
        suggestions.push({
          word: synonymWord,
          similarity: 0.9, // 同義詞相似度高
          appropriateness: this.calculateContextAppropriateness(synonymWord, context),
          difficulty: synonymWord.difficulty,
          reason: '同義詞替換'
        });
      }
    }

    // 2. 從GEPT詞庫中尋找相似詞彙
    const similarWords = this.geptManager.findSimilarWords(originalWord.word, targetLevel);
    for (const similarWord of similarWords) {
      if (!suggestions.find(s => s.word.word === similarWord.word)) {
        suggestions.push({
          word: similarWord,
          similarity: this.calculateSemanticSimilarity(originalWord, similarWord),
          appropriateness: this.calculateContextAppropriateness(similarWord, context),
          difficulty: similarWord.difficulty,
          reason: '相似詞彙替換'
        });
      }
    }

    // 3. 基於用戶學習狀態的個人化建議
    if (userId) {
      const personalizedSuggestions = this.getPersonalizedSuggestions(
        originalWord,
        targetLevel,
        userId
      );
      suggestions.push(...personalizedSuggestions);
    }

    // 排序建議（按適合度和相似度）
    return suggestions
      .sort((a, b) => (b.similarity + b.appropriateness) - (a.similarity + a.appropriateness))
      .slice(0, 5); // 最多5個建議
  }

  /**
   * 檢查詞彙等級是否適合
   */
  private isAppropriateLevel(word: GEPTWord, targetLevel: GEPTLevel): boolean {
    const levelOrder: GEPTLevel[] = ['elementary', 'intermediate', 'high-intermediate'];
    const targetIndex = levelOrder.indexOf(targetLevel);
    const wordIndex = levelOrder.indexOf(word.level);
    return wordIndex <= targetIndex;
  }

  /**
   * 計算上下文適合度
   */
  private calculateContextAppropriateness(word: GEPTWord, context: string): number {
    // 簡化的上下文分析
    const contextWords = this.extractWords(context.toLowerCase());
    const wordContext = word.example.toLowerCase();
    
    let commonWords = 0;
    for (const contextWord of contextWords) {
      if (wordContext.includes(contextWord)) {
        commonWords++;
      }
    }
    
    return Math.min(1, commonWords / Math.max(1, contextWords.length));
  }

  /**
   * 計算語義相似度
   */
  private calculateSemanticSimilarity(word1: GEPTWord, word2: GEPTWord): number {
    // 簡化的語義相似度計算
    if (word1.partOfSpeech !== word2.partOfSpeech) return 0.3;
    
    const def1Words = this.extractWords(word1.definition.toLowerCase());
    const def2Words = this.extractWords(word2.definition.toLowerCase());
    
    let commonWords = 0;
    for (const word of def1Words) {
      if (def2Words.includes(word)) {
        commonWords++;
      }
    }
    
    const similarity = commonWords / Math.max(def1Words.length, def2Words.length);
    return Math.min(1, similarity + 0.3); // 基礎相似度
  }

  /**
   * 獲取個人化建議
   */
  private getPersonalizedSuggestions(
    originalWord: GEPTWord,
    targetLevel: GEPTLevel,
    userId: string
  ): ReplacementSuggestion[] {
    const suggestions: ReplacementSuggestion[] = [];
    const userVocabulary = this.vocabularyStates.get(userId);
    
    if (!userVocabulary) return suggestions;

    // 尋找用戶已掌握的相似詞彙
    for (const [word, state] of userVocabulary) {
      if (state.masteryLevel > 0.8) {
        const geptWord = this.geptManager.getWordInfo(word);
        if (geptWord && this.isAppropriateLevel(geptWord, targetLevel)) {
          const similarity = this.calculateSemanticSimilarity(originalWord, geptWord);
          if (similarity > 0.5) {
            suggestions.push({
              word: geptWord,
              similarity,
              appropriateness: 0.9, // 用戶已掌握的詞彙適合度高
              difficulty: geptWord.difficulty,
              reason: '基於您已掌握的詞彙'
            });
          }
        }
      }
    }

    return suggestions;
  }

  /**
   * 記錄詞彙學習
   */
  recordVocabularyLearning(
    userId: string,
    word: string,
    isCorrect: boolean,
    responseTime: number
  ): void {
    let userVocabulary = this.vocabularyStates.get(userId);
    if (!userVocabulary) {
      userVocabulary = new Map();
      this.vocabularyStates.set(userId, userVocabulary);
    }

    let state = userVocabulary.get(word.toLowerCase());
    if (!state) {
      const geptWord = this.geptManager.getWordInfo(word.toLowerCase());
      if (!geptWord) return;

      state = {
        word: word.toLowerCase(),
        level: geptWord.level,
        masteryLevel: 0,
        exposureCount: 0,
        correctCount: 0,
        lastSeen: Date.now(),
        nextReview: Date.now() + 24 * 60 * 60 * 1000, // 明天
        difficulty: geptWord.difficulty,
        learningPhase: 'introduction'
      };
    }

    // 更新學習狀態
    state.exposureCount++;
    state.lastSeen = Date.now();
    
    if (isCorrect) {
      state.correctCount++;
    }

    // 更新掌握程度
    state.masteryLevel = state.correctCount / state.exposureCount;

    // 更新學習階段
    this.updateLearningPhase(state);

    // 計算下次復習時間
    state.nextReview = this.calculateNextReviewTime(state, isCorrect, responseTime);

    userVocabulary.set(word.toLowerCase(), state);
  }

  /**
   * 更新學習階段
   */
  private updateLearningPhase(state: VocabularyLearningState): void {
    if (state.masteryLevel >= 0.9 && state.exposureCount >= 5) {
      state.learningPhase = 'maintenance';
    } else if (state.masteryLevel >= 0.7 && state.exposureCount >= 3) {
      state.learningPhase = 'mastery';
    } else if (state.exposureCount >= 2) {
      state.learningPhase = 'practice';
    } else {
      state.learningPhase = 'introduction';
    }
  }

  /**
   * 計算下次復習時間
   */
  private calculateNextReviewTime(
    state: VocabularyLearningState,
    isCorrect: boolean,
    responseTime: number
  ): number {
    const now = Date.now();
    let interval = 24 * 60 * 60 * 1000; // 基礎間隔：1天

    if (isCorrect) {
      // 正確：增加間隔
      switch (state.learningPhase) {
        case 'introduction':
          interval = 1 * 24 * 60 * 60 * 1000; // 1天
          break;
        case 'practice':
          interval = 3 * 24 * 60 * 60 * 1000; // 3天
          break;
        case 'mastery':
          interval = 7 * 24 * 60 * 60 * 1000; // 7天
          break;
        case 'maintenance':
          interval = 30 * 24 * 60 * 60 * 1000; // 30天
          break;
      }

      // 基於掌握程度調整
      interval *= (0.5 + state.masteryLevel);
    } else {
      // 錯誤：縮短間隔
      interval = Math.max(
        2 * 60 * 60 * 1000, // 最少2小時
        interval * 0.3
      );
    }

    return now + interval;
  }

  /**
   * 分析用戶詞彙狀況
   */
  analyzeUserVocabulary(userId: string): VocabularyAnalysis {
    const userVocabulary = this.vocabularyStates.get(userId);
    if (!userVocabulary) {
      return this.getEmptyVocabularyAnalysis();
    }

    const states = Array.from(userVocabulary.values());
    const knownWords = states.filter(s => s.masteryLevel >= 0.7).length;
    const difficultWords = states
      .filter(s => s.masteryLevel < 0.5)
      .map(s => s.word)
      .slice(0, 10);
    const easyWords = states
      .filter(s => s.masteryLevel >= 0.9)
      .map(s => s.word)
      .slice(0, 10);

    const levelDistribution: Record<GEPTLevel, number> = {
      'elementary': 0,
      'intermediate': 0,
      'high-intermediate': 0
    };

    const masteryDistribution: Record<string, number> = {
      'introduction': 0,
      'practice': 0,
      'mastery': 0,
      'maintenance': 0
    };

    states.forEach(state => {
      levelDistribution[state.level]++;
      masteryDistribution[state.learningPhase]++;
    });

    return {
      totalWords: states.length,
      knownWords,
      unknownWords: states.length - knownWords,
      difficultWords,
      easyWords,
      levelDistribution,
      masteryDistribution,
      recommendedFocus: this.generateRecommendedFocus(states)
    };
  }

  /**
   * 生成推薦重點
   */
  private generateRecommendedFocus(states: VocabularyLearningState[]): string[] {
    const recommendations: string[] = [];

    const difficultWords = states.filter(s => s.masteryLevel < 0.5);
    if (difficultWords.length > 0) {
      recommendations.push(`重點復習 ${difficultWords.length} 個困難詞彙`);
    }

    const reviewWords = states.filter(s => s.nextReview <= Date.now());
    if (reviewWords.length > 0) {
      recommendations.push(`今日需復習 ${reviewWords.length} 個詞彙`);
    }

    const elementaryWords = states.filter(s => s.level === 'elementary' && s.masteryLevel < 0.8);
    if (elementaryWords.length > 0) {
      recommendations.push('加強初級詞彙基礎');
    }

    return recommendations;
  }

  /**
   * 獲取詞彙學習狀態
   */
  getVocabularyState(userId: string, word: string): VocabularyLearningState | null {
    const userVocabulary = this.vocabularyStates.get(userId);
    return userVocabulary?.get(word.toLowerCase()) || null;
  }

  /**
   * 獲取需要復習的詞彙
   */
  getWordsForReview(userId: string): VocabularyLearningState[] {
    const userVocabulary = this.vocabularyStates.get(userId);
    if (!userVocabulary) return [];

    const now = Date.now();
    return Array.from(userVocabulary.values())
      .filter(state => state.nextReview <= now)
      .sort((a, b) => a.nextReview - b.nextReview);
  }

  /**
   * 輔助方法
   */
  private extractWords(text: string): string[] {
    return text.match(/\b\w+\b/g) || [];
  }

  private extractWordContext(word: string, text: string, contextSize: number = 5): string {
    const words = this.extractWords(text);
    const wordIndex = words.findIndex(w => w.toLowerCase() === word.toLowerCase());
    
    if (wordIndex === -1) return text;

    const start = Math.max(0, wordIndex - contextSize);
    const end = Math.min(words.length, wordIndex + contextSize + 1);
    
    return words.slice(start, end).join(' ');
  }

  private calculateReplacementConfidence(
    original: GEPTWord,
    suggestions: ReplacementSuggestion[]
  ): number {
    if (suggestions.length === 0) return 0;

    const bestSuggestion = suggestions[0];
    return (bestSuggestion.similarity + bestSuggestion.appropriateness) / 2;
  }

  private getEmptyVocabularyAnalysis(): VocabularyAnalysis {
    return {
      totalWords: 0,
      knownWords: 0,
      unknownWords: 0,
      difficultWords: [],
      easyWords: [],
      levelDistribution: {
        'elementary': 0,
        'intermediate': 0,
        'high-intermediate': 0
      },
      masteryDistribution: {
        'introduction': 0,
        'practice': 0,
        'mastery': 0,
        'maintenance': 0
      },
      recommendedFocus: ['開始學習詞彙以建立分析數據']
    };
  }

  /**
   * 清除用戶數據
   */
  clearUserData(userId: string): void {
    this.vocabularyStates.delete(userId);
  }
}
