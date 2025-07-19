/**
 * GEPT分級適配引擎
 * 實現智能的GEPT等級內容適配、詞彙難度調整和跨等級學習支援
 */

import { GEPTManager, GEPTLevel, GEPTWord, ValidationResult } from './GEPTManager';

// 適配策略
export enum AdaptationStrategy {
  CONSERVATIVE = 'conservative',   // 保守策略：確保內容不超出等級
  BALANCED = 'balanced',          // 平衡策略：適度挑戰
  PROGRESSIVE = 'progressive',    // 進階策略：逐步提升難度
  ADAPTIVE = 'adaptive'           // 自適應策略：基於學習表現調整
}

// 內容適配結果
export interface ContentAdaptationResult {
  originalContent: string;
  adaptedContent: string;
  targetLevel: GEPTLevel;
  strategy: AdaptationStrategy;
  adaptations: ContentAdaptation[];
  statistics: AdaptationStatistics;
  recommendations: string[];
}

// 內容適配項目
export interface ContentAdaptation {
  type: 'vocabulary' | 'grammar' | 'structure' | 'complexity';
  original: string;
  adapted: string;
  reason: string;
  confidence: number; // 0-1
}

// 適配統計
export interface AdaptationStatistics {
  totalWords: number;
  adaptedWords: number;
  adaptationRate: number;
  difficultyReduction: number;
  complexityScore: number;
  readabilityImprovement: number;
}

// 學習者檔案
export interface LearnerProfile {
  userId: string;
  currentLevel: GEPTLevel;
  targetLevel: GEPTLevel;
  strengths: string[];
  weaknesses: string[];
  learningPreferences: LearningPreferences;
  progressHistory: LearningProgress[];
}

// 學習偏好
export interface LearningPreferences {
  preferredDifficulty: 'easy' | 'medium' | 'hard';
  learningPace: 'slow' | 'normal' | 'fast';
  focusAreas: ('vocabulary' | 'grammar' | 'reading' | 'listening')[];
  adaptationSensitivity: number; // 0-1, 對適配的敏感度
}

// 學習進度
export interface LearningProgress {
  timestamp: number;
  level: GEPTLevel;
  activity: string;
  score: number;
  accuracy: number;
  timeSpent: number;
  wordsLearned: string[];
  difficultWords: string[];
}

// 跨等級學習建議
export interface CrossLevelRecommendation {
  type: 'level_up' | 'level_down' | 'maintain' | 'mixed_practice';
  currentLevel: GEPTLevel;
  recommendedLevel: GEPTLevel;
  confidence: number;
  reasons: string[];
  suggestedActivities: string[];
  estimatedTimeToTransition: number; // 天數
}

export class GEPTAdaptationEngine {
  private geptManager: GEPTManager;
  private learnerProfiles: Map<string, LearnerProfile> = new Map();

  constructor(geptManager: GEPTManager) {
    this.geptManager = geptManager;
  }

  /**
   * 適配內容到指定GEPT等級
   */
  adaptContent(
    content: string,
    targetLevel: GEPTLevel,
    strategy: AdaptationStrategy = AdaptationStrategy.BALANCED,
    learnerProfile?: LearnerProfile
  ): ContentAdaptationResult {
    const adaptations: ContentAdaptation[] = [];
    let adaptedContent = content;

    // 1. 詞彙適配
    const vocabularyAdaptations = this.adaptVocabulary(adaptedContent, targetLevel, strategy);
    adaptedContent = this.applyVocabularyAdaptations(adaptedContent, vocabularyAdaptations);
    adaptations.push(...vocabularyAdaptations);

    // 2. 語法結構適配
    const grammarAdaptations = this.adaptGrammar(adaptedContent, targetLevel, strategy);
    adaptedContent = this.applyGrammarAdaptations(adaptedContent, grammarAdaptations);
    adaptations.push(...grammarAdaptations);

    // 3. 句子複雜度適配
    const structureAdaptations = this.adaptStructure(adaptedContent, targetLevel, strategy);
    adaptedContent = this.applyStructureAdaptations(adaptedContent, structureAdaptations);
    adaptations.push(...structureAdaptations);

    // 4. 整體複雜度調整
    const complexityAdaptations = this.adaptComplexity(adaptedContent, targetLevel, strategy);
    adaptedContent = this.applyComplexityAdaptations(adaptedContent, complexityAdaptations);
    adaptations.push(...complexityAdaptations);

    // 5. 計算統計數據
    const statistics = this.calculateAdaptationStatistics(content, adaptedContent, adaptations);

    // 6. 生成建議
    const recommendations = this.generateRecommendations(
      content,
      adaptedContent,
      targetLevel,
      strategy,
      learnerProfile
    );

    return {
      originalContent: content,
      adaptedContent,
      targetLevel,
      strategy,
      adaptations,
      statistics,
      recommendations
    };
  }

  /**
   * 詞彙適配
   */
  private adaptVocabulary(
    content: string,
    targetLevel: GEPTLevel,
    strategy: AdaptationStrategy
  ): ContentAdaptation[] {
    const adaptations: ContentAdaptation[] = [];
    const words = this.extractWords(content);
    const levelOrder: GEPTLevel[] = ['elementary', 'intermediate', 'high-intermediate'];
    const targetIndex = levelOrder.indexOf(targetLevel);

    for (const word of words) {
      const geptWord = this.geptManager.getWordInfo(word.toLowerCase());
      if (geptWord) {
        const wordIndex = levelOrder.indexOf(geptWord.level);
        
        // 如果詞彙超出目標等級
        if (wordIndex > targetIndex) {
          const replacement = this.findVocabularyReplacement(
            geptWord,
            targetLevel,
            strategy
          );
          
          if (replacement) {
            adaptations.push({
              type: 'vocabulary',
              original: word,
              adapted: replacement.word,
              reason: `將${geptWord.level}等級詞彙替換為${replacement.level}等級`,
              confidence: this.calculateReplacementConfidence(geptWord, replacement)
            });
          }
        }
      }
    }

    return adaptations;
  }

  /**
   * 語法結構適配
   */
  private adaptGrammar(
    content: string,
    targetLevel: GEPTLevel,
    strategy: AdaptationStrategy
  ): ContentAdaptation[] {
    const adaptations: ContentAdaptation[] = [];
    const sentences = this.extractSentences(content);

    for (const sentence of sentences) {
      const complexity = this.analyzeGrammarComplexity(sentence);
      const maxComplexity = this.getMaxGrammarComplexity(targetLevel);

      if (complexity > maxComplexity) {
        const simplifiedSentence = this.simplifyGrammar(sentence, targetLevel, strategy);
        if (simplifiedSentence !== sentence) {
          adaptations.push({
            type: 'grammar',
            original: sentence,
            adapted: simplifiedSentence,
            reason: `簡化語法結構以符合${targetLevel}等級`,
            confidence: 0.8
          });
        }
      }
    }

    return adaptations;
  }

  /**
   * 句子結構適配
   */
  private adaptStructure(
    content: string,
    targetLevel: GEPTLevel,
    strategy: AdaptationStrategy
  ): ContentAdaptation[] {
    const adaptations: ContentAdaptation[] = [];
    const sentences = this.extractSentences(content);
    const maxLength = this.getMaxSentenceLength(targetLevel);

    for (const sentence of sentences) {
      const words = this.extractWords(sentence);
      if (words.length > maxLength) {
        const shortenedSentences = this.shortenSentence(sentence, maxLength, strategy);
        adaptations.push({
          type: 'structure',
          original: sentence,
          adapted: shortenedSentences.join(' '),
          reason: `將長句分解為符合${targetLevel}等級的短句`,
          confidence: 0.7
        });
      }
    }

    return adaptations;
  }

  /**
   * 複雜度適配
   */
  private adaptComplexity(
    content: string,
    targetLevel: GEPTLevel,
    strategy: AdaptationStrategy
  ): ContentAdaptation[] {
    const adaptations: ContentAdaptation[] = [];
    const complexity = this.geptManager.calculateComplexity(content);
    const maxComplexity = this.getMaxComplexity(targetLevel);

    if (complexity > maxComplexity) {
      // 這裡可以實現更複雜的內容重組邏輯
      adaptations.push({
        type: 'complexity',
        original: content,
        adapted: content, // 簡化版本
        reason: `降低整體複雜度以符合${targetLevel}等級`,
        confidence: 0.6
      });
    }

    return adaptations;
  }

  /**
   * 尋找詞彙替換
   */
  private findVocabularyReplacement(
    originalWord: GEPTWord,
    targetLevel: GEPTLevel,
    strategy: AdaptationStrategy
  ): GEPTWord | null {
    // 獲取同義詞或相似詞彙
    const candidates = this.geptManager.findSimilarWords(originalWord.word, targetLevel);
    
    if (candidates.length === 0) return null;

    // 根據策略選擇最佳替換
    switch (strategy) {
      case AdaptationStrategy.CONSERVATIVE:
        return candidates.find(word => word.difficulty <= originalWord.difficulty - 2) || candidates[0];
      
      case AdaptationStrategy.BALANCED:
        return candidates.find(word => Math.abs(word.difficulty - originalWord.difficulty) <= 1) || candidates[0];
      
      case AdaptationStrategy.PROGRESSIVE:
        return candidates.find(word => word.difficulty >= originalWord.difficulty - 1) || candidates[0];
      
      case AdaptationStrategy.ADAPTIVE:
        // 基於學習者表現選擇
        return candidates[0];
      
      default:
        return candidates[0];
    }
  }

  /**
   * 應用詞彙適配
   */
  private applyVocabularyAdaptations(content: string, adaptations: ContentAdaptation[]): string {
    let adaptedContent = content;
    
    for (const adaptation of adaptations.filter(a => a.type === 'vocabulary')) {
      // 使用正則表達式進行詞彙替換，保持大小寫
      const regex = new RegExp(`\\b${this.escapeRegex(adaptation.original)}\\b`, 'gi');
      adaptedContent = adaptedContent.replace(regex, (match) => {
        // 保持原始大小寫格式
        if (match === match.toUpperCase()) {
          return adaptation.adapted.toUpperCase();
        } else if (match[0] === match[0].toUpperCase()) {
          return adaptation.adapted.charAt(0).toUpperCase() + adaptation.adapted.slice(1);
        } else {
          return adaptation.adapted.toLowerCase();
        }
      });
    }
    
    return adaptedContent;
  }

  /**
   * 應用語法適配
   */
  private applyGrammarAdaptations(content: string, adaptations: ContentAdaptation[]): string {
    let adaptedContent = content;
    
    for (const adaptation of adaptations.filter(a => a.type === 'grammar')) {
      adaptedContent = adaptedContent.replace(adaptation.original, adaptation.adapted);
    }
    
    return adaptedContent;
  }

  /**
   * 應用結構適配
   */
  private applyStructureAdaptations(content: string, adaptations: ContentAdaptation[]): string {
    let adaptedContent = content;
    
    for (const adaptation of adaptations.filter(a => a.type === 'structure')) {
      adaptedContent = adaptedContent.replace(adaptation.original, adaptation.adapted);
    }
    
    return adaptedContent;
  }

  /**
   * 應用複雜度適配
   */
  private applyComplexityAdaptations(content: string, adaptations: ContentAdaptation[]): string {
    let adaptedContent = content;
    
    for (const adaptation of adaptations.filter(a => a.type === 'complexity')) {
      adaptedContent = adaptation.adapted;
    }
    
    return adaptedContent;
  }

  /**
   * 計算適配統計
   */
  private calculateAdaptationStatistics(
    originalContent: string,
    adaptedContent: string,
    adaptations: ContentAdaptation[]
  ): AdaptationStatistics {
    const originalWords = this.extractWords(originalContent);
    const adaptedWords = adaptations.filter(a => a.type === 'vocabulary').length;
    const adaptationRate = originalWords.length > 0 ? adaptedWords / originalWords.length : 0;

    const originalComplexity = this.geptManager.calculateComplexity(originalContent);
    const adaptedComplexity = this.geptManager.calculateComplexity(adaptedContent);
    const difficultyReduction = originalComplexity - adaptedComplexity;

    return {
      totalWords: originalWords.length,
      adaptedWords,
      adaptationRate,
      difficultyReduction,
      complexityScore: adaptedComplexity,
      readabilityImprovement: difficultyReduction > 0 ? difficultyReduction / originalComplexity : 0
    };
  }

  /**
   * 生成建議
   */
  private generateRecommendations(
    originalContent: string,
    adaptedContent: string,
    targetLevel: GEPTLevel,
    strategy: AdaptationStrategy,
    learnerProfile?: LearnerProfile
  ): string[] {
    const recommendations: string[] = [];

    const statistics = this.calculateAdaptationStatistics(originalContent, adaptedContent, []);
    
    if (statistics.adaptationRate > 0.3) {
      recommendations.push('內容進行了大量適配，建議檢查是否保持了原意');
    }

    if (statistics.difficultyReduction > 2) {
      recommendations.push('難度降低較多，可能需要補充練習材料');
    }

    if (learnerProfile) {
      if (learnerProfile.currentLevel !== targetLevel) {
        recommendations.push(`建議逐步從${learnerProfile.currentLevel}過渡到${targetLevel}`);
      }
    }

    return recommendations;
  }

  /**
   * 輔助方法
   */
  private extractWords(text: string): string[] {
    return text.match(/\b\w+\b/g) || [];
  }

  private extractSentences(text: string): string[] {
    return text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  }

  private escapeRegex(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private analyzeGrammarComplexity(sentence: string): number {
    // 簡化的語法複雜度分析
    const indicators = [
      /\bthat\b/gi,      // 從句
      /\bwhich\b/gi,     // 關係從句
      /\bwho\b/gi,       // 關係從句
      /\bwhen\b/gi,      // 時間從句
      /\bwhere\b/gi,     // 地點從句
      /\bif\b/gi,        // 條件句
      /\balthough\b/gi,  // 讓步句
      /\bbecause\b/gi,   // 原因句
    ];

    let complexity = 1;
    indicators.forEach(pattern => {
      const matches = sentence.match(pattern);
      if (matches) complexity += matches.length;
    });

    return complexity;
  }

  private getMaxGrammarComplexity(level: GEPTLevel): number {
    switch (level) {
      case 'elementary': return 2;
      case 'intermediate': return 4;
      case 'high-intermediate': return 6;
      default: return 3;
    }
  }

  private getMaxSentenceLength(level: GEPTLevel): number {
    switch (level) {
      case 'elementary': return 12;
      case 'intermediate': return 18;
      case 'high-intermediate': return 25;
      default: return 15;
    }
  }

  private getMaxComplexity(level: GEPTLevel): number {
    switch (level) {
      case 'elementary': return 4;
      case 'intermediate': return 6;
      case 'high-intermediate': return 8;
      default: return 5;
    }
  }

  private simplifyGrammar(sentence: string, targetLevel: GEPTLevel, strategy: AdaptationStrategy): string {
    // 簡化的語法簡化邏輯
    let simplified = sentence;
    
    // 移除複雜的從句結構
    if (targetLevel === 'elementary') {
      simplified = simplified.replace(/,\s*which\s+[^,]+,/gi, '');
      simplified = simplified.replace(/\bthat\s+[^,]+,/gi, '');
    }
    
    return simplified.trim();
  }

  private shortenSentence(sentence: string, maxLength: number, strategy: AdaptationStrategy): string[] {
    const words = this.extractWords(sentence);
    if (words.length <= maxLength) return [sentence];

    // 簡單的句子分割邏輯
    const midPoint = Math.floor(words.length / 2);
    const firstHalf = words.slice(0, midPoint).join(' ') + '.';
    const secondHalf = words.slice(midPoint).join(' ') + '.';

    return [firstHalf, secondHalf];
  }

  private calculateReplacementConfidence(original: GEPTWord, replacement: GEPTWord): number {
    // 基於詞彙相似度和等級差異計算信心度
    const levelDiff = Math.abs(original.difficulty - replacement.difficulty);
    const frequencyDiff = Math.abs(original.frequency - replacement.frequency);
    
    return Math.max(0.3, 1 - (levelDiff + frequencyDiff) / 20);
  }

  /**
   * 創建學習者檔案
   */
  createLearnerProfile(
    userId: string,
    currentLevel: GEPTLevel,
    preferences: LearningPreferences
  ): LearnerProfile {
    const profile: LearnerProfile = {
      userId,
      currentLevel,
      targetLevel: currentLevel,
      strengths: [],
      weaknesses: [],
      learningPreferences: preferences,
      progressHistory: []
    };

    this.learnerProfiles.set(userId, profile);
    return profile;
  }

  /**
   * 更新學習進度
   */
  updateLearningProgress(userId: string, progress: LearningProgress): void {
    const profile = this.learnerProfiles.get(userId);
    if (profile) {
      profile.progressHistory.push(progress);
      
      // 限制歷史記錄數量
      if (profile.progressHistory.length > 100) {
        profile.progressHistory = profile.progressHistory.slice(-100);
      }
      
      // 更新強項和弱項
      this.updateStrengthsAndWeaknesses(profile);
    }
  }

  /**
   * 更新強項和弱項
   */
  private updateStrengthsAndWeaknesses(profile: LearnerProfile): void {
    const recentProgress = profile.progressHistory.slice(-10);
    if (recentProgress.length === 0) return;

    const avgAccuracy = recentProgress.reduce((sum, p) => sum + p.accuracy, 0) / recentProgress.length;
    
    if (avgAccuracy > 0.8) {
      if (!profile.strengths.includes('高準確率')) {
        profile.strengths.push('高準確率');
      }
    }

    if (avgAccuracy < 0.6) {
      if (!profile.weaknesses.includes('準確率需改善')) {
        profile.weaknesses.push('準確率需改善');
      }
    }
  }

  /**
   * 獲取學習者檔案
   */
  getLearnerProfile(userId: string): LearnerProfile | null {
    return this.learnerProfiles.get(userId) || null;
  }

  /**
   * 清除用戶數據
   */
  clearUserData(userId: string): void {
    this.learnerProfiles.delete(userId);
  }
}
