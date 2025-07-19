/**
 * 錯誤模式分析器
 * 分析用戶在 Match 配對遊戲中的錯誤模式，提供智能洞察和建議
 */

import { MatchItem, MatchPair, GEPTLevel } from './MatchGameManager';

// 錯誤類型定義
export enum ErrorType {
  SEMANTIC_ERROR = 'semantic',      // 語義錯誤：意思理解錯誤
  VISUAL_CONFUSION = 'visual',      // 視覺混淆：外觀相似導致錯誤
  MEMORY_LAPSE = 'memory',          // 記憶失誤：忘記或記錯
  TIME_PRESSURE = 'time_pressure',  // 時間壓力：匆忙導致錯誤
  PHONETIC_ERROR = 'phonetic',      // 語音錯誤：發音相似導致錯誤
  CULTURAL_GAP = 'cultural',        // 文化差異：文化背景導致錯誤
  DIFFICULTY_MISMATCH = 'difficulty' // 難度不匹配：超出能力範圍
}

// 錯誤記錄
export interface ErrorRecord {
  id: string;
  timestamp: number;
  leftItem: MatchItem;
  rightItem: MatchItem;
  correctPair?: MatchPair;
  errorType: ErrorType;
  responseTime: number;
  confidence: number; // 0-1，錯誤分類的信心度
  context: {
    gameMode: string;
    difficulty: string;
    geptLevel?: GEPTLevel;
    timeRemaining: number;
    currentStreak: number;
    totalAttempts: number;
  };
}

// 錯誤模式統計
export interface ErrorPattern {
  errorType: ErrorType;
  frequency: number;
  averageResponseTime: number;
  contexts: string[]; // 常見錯誤情境
  severity: 'low' | 'medium' | 'high';
  trend: 'improving' | 'stable' | 'worsening';
  recommendations: string[];
}

// 錯誤分析結果
export interface ErrorAnalysisResult {
  totalErrors: number;
  errorRate: number;
  dominantErrorTypes: ErrorType[];
  patterns: ErrorPattern[];
  insights: string[];
  recommendations: string[];
  learningGaps: string[];
  strengths: string[];
}

export class ErrorPatternAnalyzer {
  private errorHistory: ErrorRecord[] = [];
  private patterns: Map<ErrorType, ErrorPattern> = new Map();

  /**
   * 記錄錯誤
   */
  recordError(
    leftItem: MatchItem,
    rightItem: MatchItem,
    correctPair: MatchPair | undefined,
    context: ErrorRecord['context'],
    responseTime: number
  ): ErrorRecord {
    const errorType = this.classifyError(leftItem, rightItem, correctPair, context);
    const confidence = this.calculateConfidence(errorType, leftItem, rightItem, context);

    const errorRecord: ErrorRecord = {
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      leftItem,
      rightItem,
      correctPair,
      errorType,
      responseTime,
      confidence,
      context
    };

    this.errorHistory.push(errorRecord);
    this.updatePatterns(errorRecord);

    return errorRecord;
  }

  /**
   * 分類錯誤類型
   */
  private classifyError(
    leftItem: MatchItem,
    rightItem: MatchItem,
    correctPair: MatchPair | undefined,
    context: ErrorRecord['context']
  ): ErrorType {
    // 時間壓力錯誤檢測
    if (context.timeRemaining < 30 && context.timeRemaining > 0) {
      return ErrorType.TIME_PRESSURE;
    }

    // 難度不匹配檢測
    if (context.difficulty === 'expert' && context.totalAttempts < 5) {
      return ErrorType.DIFFICULTY_MISMATCH;
    }

    // 視覺混淆檢測（基於內容相似性）
    if (this.isVisuallySimilar(leftItem, rightItem)) {
      return ErrorType.VISUAL_CONFUSION;
    }

    // 語音錯誤檢測（基於發音相似性）
    if (this.isPhoneticallySimilar(leftItem, rightItem)) {
      return ErrorType.PHONETIC_ERROR;
    }

    // 語義錯誤檢測（基於語義相關性）
    if (this.isSemanticallyRelated(leftItem, rightItem)) {
      return ErrorType.SEMANTIC_ERROR;
    }

    // 記憶失誤（默認分類）
    return ErrorType.MEMORY_LAPSE;
  }

  /**
   * 計算錯誤分類信心度
   */
  private calculateConfidence(
    errorType: ErrorType,
    leftItem: MatchItem,
    rightItem: MatchItem,
    context: ErrorRecord['context']
  ): number {
    let confidence = 0.5; // 基礎信心度

    switch (errorType) {
      case ErrorType.TIME_PRESSURE:
        confidence = context.timeRemaining < 10 ? 0.9 : 0.7;
        break;
      case ErrorType.VISUAL_CONFUSION:
        confidence = this.calculateVisualSimilarity(leftItem, rightItem);
        break;
      case ErrorType.PHONETIC_ERROR:
        confidence = this.calculatePhoneticSimilarity(leftItem, rightItem);
        break;
      case ErrorType.SEMANTIC_ERROR:
        confidence = this.calculateSemanticSimilarity(leftItem, rightItem);
        break;
      case ErrorType.DIFFICULTY_MISMATCH:
        confidence = context.difficulty === 'expert' ? 0.8 : 0.6;
        break;
      default:
        confidence = 0.5;
    }

    return Math.min(Math.max(confidence, 0.1), 1.0);
  }

  /**
   * 檢測視覺相似性
   */
  private isVisuallySimilar(item1: MatchItem, item2: MatchItem): boolean {
    if (item1.type !== item2.type) return false;
    
    if (item1.type === 'text' && item2.type === 'text') {
      const text1 = item1.content.toLowerCase();
      const text2 = item2.content.toLowerCase();
      
      // 檢查長度相似性
      if (Math.abs(text1.length - text2.length) <= 2) {
        // 檢查字符相似性
        const similarity = this.calculateLevenshteinSimilarity(text1, text2);
        return similarity > 0.6;
      }
    }

    return false;
  }

  /**
   * 檢測語音相似性
   */
  private isPhoneticallySimilar(item1: MatchItem, item2: MatchItem): boolean {
    if (item1.type !== 'text' || item2.type !== 'text') return false;

    const text1 = item1.content.toLowerCase();
    const text2 = item2.content.toLowerCase();

    // 簡單的語音相似性檢測（可以擴展為更複雜的算法）
    const phoneticPatterns = [
      ['b', 'p'], ['d', 't'], ['g', 'k'],
      ['v', 'f'], ['z', 's'], ['th', 's'],
      ['l', 'r'], ['m', 'n']
    ];

    for (const [sound1, sound2] of phoneticPatterns) {
      if (text1.includes(sound1) && text2.includes(sound2) ||
          text1.includes(sound2) && text2.includes(sound1)) {
        return true;
      }
    }

    return false;
  }

  /**
   * 檢測語義相關性
   */
  private isSemanticallyRelated(item1: MatchItem, item2: MatchItem): boolean {
    if (item1.type !== 'text' || item2.type !== 'text') return false;

    const text1 = item1.content.toLowerCase();
    const text2 = item2.content.toLowerCase();

    // 語義相關詞彙組
    const semanticGroups = [
      ['cat', 'dog', 'animal', 'pet'],
      ['red', 'blue', 'green', 'color', 'colour'],
      ['big', 'large', 'huge', 'small', 'tiny'],
      ['happy', 'sad', 'angry', 'emotion', 'feeling'],
      ['car', 'bus', 'train', 'transport', 'vehicle'],
      ['apple', 'banana', 'fruit', 'food', 'eat'],
      ['school', 'teacher', 'student', 'education', 'learn']
    ];

    for (const group of semanticGroups) {
      const inGroup1 = group.some(word => text1.includes(word));
      const inGroup2 = group.some(word => text2.includes(word));
      if (inGroup1 && inGroup2) {
        return true;
      }
    }

    return false;
  }

  /**
   * 計算 Levenshtein 相似性
   */
  private calculateLevenshteinSimilarity(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }

    const distance = matrix[str2.length][str1.length];
    const maxLength = Math.max(str1.length, str2.length);
    return maxLength === 0 ? 1 : 1 - (distance / maxLength);
  }

  /**
   * 計算視覺相似性分數
   */
  private calculateVisualSimilarity(item1: MatchItem, item2: MatchItem): number {
    if (item1.type !== item2.type) return 0;
    
    if (item1.type === 'text' && item2.type === 'text') {
      return this.calculateLevenshteinSimilarity(item1.content, item2.content);
    }

    return 0.5; // 默認值
  }

  /**
   * 計算語音相似性分數
   */
  private calculatePhoneticSimilarity(item1: MatchItem, item2: MatchItem): number {
    // 簡化的語音相似性計算
    return this.isPhoneticallySimilar(item1, item2) ? 0.8 : 0.3;
  }

  /**
   * 計算語義相似性分數
   */
  private calculateSemanticSimilarity(item1: MatchItem, item2: MatchItem): number {
    // 簡化的語義相似性計算
    return this.isSemanticallyRelated(item1, item2) ? 0.7 : 0.3;
  }

  /**
   * 更新錯誤模式統計
   */
  private updatePatterns(errorRecord: ErrorRecord): void {
    const { errorType } = errorRecord;
    
    if (!this.patterns.has(errorType)) {
      this.patterns.set(errorType, {
        errorType,
        frequency: 0,
        averageResponseTime: 0,
        contexts: [],
        severity: 'low',
        trend: 'stable',
        recommendations: []
      });
    }

    const pattern = this.patterns.get(errorType)!;
    pattern.frequency++;
    
    // 更新平均響應時間
    pattern.averageResponseTime = (
      (pattern.averageResponseTime * (pattern.frequency - 1) + errorRecord.responseTime) / 
      pattern.frequency
    );

    // 更新上下文
    const contextStr = `${errorRecord.context.gameMode}-${errorRecord.context.difficulty}`;
    if (!pattern.contexts.includes(contextStr)) {
      pattern.contexts.push(contextStr);
    }

    // 更新嚴重程度
    pattern.severity = this.calculateSeverity(pattern);

    // 更新趨勢
    pattern.trend = this.calculateTrend(errorType);

    // 更新建議
    pattern.recommendations = this.generatePatternRecommendations(pattern);
  }

  /**
   * 計算錯誤嚴重程度
   */
  private calculateSeverity(pattern: ErrorPattern): 'low' | 'medium' | 'high' {
    if (pattern.frequency >= 10) return 'high';
    if (pattern.frequency >= 5) return 'medium';
    return 'low';
  }

  /**
   * 計算錯誤趨勢
   */
  private calculateTrend(errorType: ErrorType): 'improving' | 'stable' | 'worsening' {
    const recentErrors = this.errorHistory
      .filter(e => e.errorType === errorType)
      .slice(-10); // 最近10次錯誤

    if (recentErrors.length < 5) return 'stable';

    const firstHalf = recentErrors.slice(0, Math.floor(recentErrors.length / 2));
    const secondHalf = recentErrors.slice(Math.floor(recentErrors.length / 2));

    const firstHalfAvgTime = firstHalf.reduce((sum, e) => sum + e.responseTime, 0) / firstHalf.length;
    const secondHalfAvgTime = secondHalf.reduce((sum, e) => sum + e.responseTime, 0) / secondHalf.length;

    if (secondHalfAvgTime < firstHalfAvgTime * 0.9) return 'improving';
    if (secondHalfAvgTime > firstHalfAvgTime * 1.1) return 'worsening';
    return 'stable';
  }

  /**
   * 生成模式特定建議
   */
  private generatePatternRecommendations(pattern: ErrorPattern): string[] {
    const recommendations: string[] = [];

    switch (pattern.errorType) {
      case ErrorType.VISUAL_CONFUSION:
        recommendations.push('建議仔細觀察項目的細節差異');
        recommendations.push('可以嘗試放慢速度，避免匆忙選擇');
        break;
      case ErrorType.TIME_PRESSURE:
        recommendations.push('建議在時間充裕時多加練習');
        recommendations.push('學習時間管理技巧，合理分配答題時間');
        break;
      case ErrorType.SEMANTIC_ERROR:
        recommendations.push('建議加強詞彙理解和語義辨析');
        recommendations.push('多閱讀相關材料，提高語言理解能力');
        break;
      case ErrorType.MEMORY_LAPSE:
        recommendations.push('建議使用記憶技巧，如聯想記憶法');
        recommendations.push('增加重複練習，鞏固記憶');
        break;
      case ErrorType.PHONETIC_ERROR:
        recommendations.push('建議加強語音辨識練習');
        recommendations.push('多聽多說，提高語音敏感度');
        break;
      case ErrorType.CULTURAL_GAP:
        recommendations.push('建議了解相關文化背景知識');
        recommendations.push('多接觸目標語言的文化內容');
        break;
      case ErrorType.DIFFICULTY_MISMATCH:
        recommendations.push('建議調整難度設置，循序漸進');
        recommendations.push('先鞏固基礎，再挑戰高難度');
        break;
    }

    return recommendations;
  }

  /**
   * 分析錯誤模式
   */
  analyzePatterns(): ErrorAnalysisResult {
    const totalErrors = this.errorHistory.length;
    const totalAttempts = this.errorHistory.reduce((sum, e) => sum + e.context.totalAttempts, 0) / totalErrors || 1;
    const errorRate = totalErrors / totalAttempts;

    // 找出主要錯誤類型
    const errorTypeCounts = new Map<ErrorType, number>();
    this.errorHistory.forEach(error => {
      errorTypeCounts.set(error.errorType, (errorTypeCounts.get(error.errorType) || 0) + 1);
    });

    const dominantErrorTypes = Array.from(errorTypeCounts.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([type]) => type);

    // 生成洞察
    const insights = this.generateInsights();

    // 生成建議
    const recommendations = this.generateRecommendations();

    // 識別學習差距
    const learningGaps = this.identifyLearningGaps();

    // 識別優勢
    const strengths = this.identifyStrengths();

    return {
      totalErrors,
      errorRate,
      dominantErrorTypes,
      patterns: Array.from(this.patterns.values()),
      insights,
      recommendations,
      learningGaps,
      strengths
    };
  }

  /**
   * 生成洞察
   */
  private generateInsights(): string[] {
    const insights: string[] = [];
    const patterns = Array.from(this.patterns.values());

    // 分析最常見的錯誤類型
    const mostCommon = patterns.sort((a, b) => b.frequency - a.frequency)[0];
    if (mostCommon) {
      insights.push(`最常見的錯誤類型是${this.getErrorTypeDescription(mostCommon.errorType)}，佔總錯誤的${((mostCommon.frequency / this.errorHistory.length) * 100).toFixed(1)}%`);
    }

    // 分析時間相關錯誤
    const timeErrors = patterns.find(p => p.errorType === ErrorType.TIME_PRESSURE);
    if (timeErrors && timeErrors.frequency > 3) {
      insights.push('在時間壓力下容易出錯，建議加強時間管理練習');
    }

    // 分析改進趨勢
    const improvingPatterns = patterns.filter(p => p.trend === 'improving');
    if (improvingPatterns.length > 0) {
      insights.push(`在${improvingPatterns.map(p => this.getErrorTypeDescription(p.errorType)).join('、')}方面有改進趨勢`);
    }

    return insights;
  }

  /**
   * 生成總體建議
   */
  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    const patterns = Array.from(this.patterns.values());

    // 基於主要錯誤類型的建議
    const highSeverityPatterns = patterns.filter(p => p.severity === 'high');
    highSeverityPatterns.forEach(pattern => {
      recommendations.push(...pattern.recommendations);
    });

    // 通用建議
    if (this.errorHistory.length > 10) {
      recommendations.push('建議定期回顧錯誤，總結學習經驗');
    }

    // 去重
    return [...new Set(recommendations)];
  }

  /**
   * 識別學習差距
   */
  private identifyLearningGaps(): string[] {
    const gaps: string[] = [];
    const patterns = Array.from(this.patterns.values());

    patterns.forEach(pattern => {
      if (pattern.severity === 'high' && pattern.trend === 'worsening') {
        gaps.push(`${this.getErrorTypeDescription(pattern.errorType)}能力需要加強`);
      }
    });

    return gaps;
  }

  /**
   * 識別優勢
   */
  private identifyStrengths(): string[] {
    const strengths: string[] = [];
    const allErrorTypes = Object.values(ErrorType);
    const presentErrorTypes = new Set(this.errorHistory.map(e => e.errorType));

    // 找出很少出現的錯誤類型
    allErrorTypes.forEach(errorType => {
      const pattern = this.patterns.get(errorType);
      if (!pattern || pattern.frequency <= 2) {
        strengths.push(`在${this.getErrorTypeDescription(errorType)}方面表現良好`);
      }
    });

    return strengths;
  }

  /**
   * 獲取錯誤類型描述
   */
  private getErrorTypeDescription(errorType: ErrorType): string {
    const descriptions = {
      [ErrorType.SEMANTIC_ERROR]: '語義理解',
      [ErrorType.VISUAL_CONFUSION]: '視覺辨識',
      [ErrorType.MEMORY_LAPSE]: '記憶保持',
      [ErrorType.TIME_PRESSURE]: '時間管理',
      [ErrorType.PHONETIC_ERROR]: '語音辨識',
      [ErrorType.CULTURAL_GAP]: '文化理解',
      [ErrorType.DIFFICULTY_MISMATCH]: '難度適應'
    };
    return descriptions[errorType] || '未知類型';
  }

  /**
   * 獲取錯誤歷史
   */
  getErrorHistory(): ErrorRecord[] {
    return [...this.errorHistory];
  }

  /**
   * 清除錯誤歷史
   */
  clearHistory(): void {
    this.errorHistory = [];
    this.patterns.clear();
  }

  /**
   * 獲取特定類型的錯誤
   */
  getErrorsByType(errorType: ErrorType): ErrorRecord[] {
    return this.errorHistory.filter(error => error.errorType === errorType);
  }

  /**
   * 獲取最近的錯誤
   */
  getRecentErrors(count: number = 10): ErrorRecord[] {
    return this.errorHistory.slice(-count);
  }
}
