/**
 * 記憶增強引擎 - Vite + Phaser 3 版本
 * 基於記憶科學原理的學習效果優化系統
 */

export interface MemoryType {
  id: string;
  name: string;
  description: string;
  cognitiveLoad: 'low' | 'medium' | 'high';
  memorySystem: 'working' | 'short-term' | 'long-term' | 'procedural' | 'episodic';
  neuralBasis: string[];
  enhancementStrategies: string[];
}

export interface MemoryConfiguration {
  primaryMemoryType: string;
  secondaryMemoryTypes: string[];
  difficultyLevel: number; // 1-5
  timeConstraints: {
    enabled: boolean;
    duration: number; // seconds
    pressureLevel: 'low' | 'medium' | 'high';
  };
  repetitionSettings: {
    spacedRepetition: boolean;
    intervalMultiplier: number;
    maxRepetitions: number;
  };
  feedbackMechanisms: {
    immediate: boolean;
    delayed: boolean;
    explanatory: boolean;
    emotional: boolean;
  };
}

export interface MemoryMetrics {
  retentionRate: number; // 0-100
  recallSpeed: number; // milliseconds
  errorRate: number; // 0-100
  cognitiveLoad: number; // 1-10
  engagementLevel: number; // 1-10
  learningEfficiency: number; // 0-100
}

export interface LearningEvent {
  wordId: string;
  word: string;
  timestamp: number;
  responseTime: number;
  isCorrect: boolean;
  attemptNumber: number;
  contextData: any;
}

/**
 * 記憶增強引擎
 */
export class MemoryEnhancementEngine {
  private memoryTypes: Map<string, MemoryType> = new Map();
  private currentConfiguration: MemoryConfiguration;
  private learningHistory: LearningEvent[] = [];
  private memoryMetrics: MemoryMetrics;

  constructor() {
    this.initializeMemoryTypes();
    this.currentConfiguration = this.getDefaultConfiguration();
    this.memoryMetrics = this.getInitialMetrics();
    
    console.log('🧠 記憶增強引擎初始化完成');
  }

  /**
   * 初始化記憶類型
   */
  private initializeMemoryTypes(): void {
    const memoryTypes: MemoryType[] = [
      {
        id: 'spatial-visual',
        name: '空間視覺記憶',
        description: '基於空間位置和視覺特徵的記憶',
        cognitiveLoad: 'medium',
        memorySystem: 'working',
        neuralBasis: ['視覺皮層', '頂葉皮層'],
        enhancementStrategies: ['空間配置', '顏色編碼', '視覺提示']
      },
      {
        id: 'collision-reaction',
        name: '碰撞反應記憶',
        description: '基於動作反應的程序性記憶',
        cognitiveLoad: 'high',
        memorySystem: 'procedural',
        neuralBasis: ['小腦', '基底神經節'],
        enhancementStrategies: ['重複練習', '即時反饋', '肌肉記憶']
      },
      {
        id: 'vocabulary-association',
        name: '詞彙關聯記憶',
        description: '基於語義關聯的長期記憶',
        cognitiveLoad: 'medium',
        memorySystem: 'long-term',
        neuralBasis: ['海馬體', '顳葉皮層'],
        enhancementStrategies: ['語義連結', '情境學習', '間隔重複']
      }
    ];

    memoryTypes.forEach(type => {
      this.memoryTypes.set(type.id, type);
    });
  }

  /**
   * 獲取默認配置
   */
  private getDefaultConfiguration(): MemoryConfiguration {
    return {
      primaryMemoryType: 'collision-reaction',
      secondaryMemoryTypes: ['spatial-visual', 'vocabulary-association'],
      difficultyLevel: 3,
      timeConstraints: {
        enabled: true,
        duration: 5,
        pressureLevel: 'medium'
      },
      repetitionSettings: {
        spacedRepetition: true,
        intervalMultiplier: 2,
        maxRepetitions: 5
      },
      feedbackMechanisms: {
        immediate: true,
        delayed: false,
        explanatory: true,
        emotional: true
      }
    };
  }

  /**
   * 獲取初始指標
   */
  private getInitialMetrics(): MemoryMetrics {
    return {
      retentionRate: 0,
      recallSpeed: 0,
      errorRate: 0,
      cognitiveLoad: 5,
      engagementLevel: 8,
      learningEfficiency: 0
    };
  }

  /**
   * 記錄學習事件
   */
  recordLearningEvent(event: LearningEvent): void {
    this.learningHistory.push(event);
    this.updateMetrics();
    
    console.log(`📝 記錄學習事件: ${event.word} - ${event.isCorrect ? '正確' : '錯誤'}`);
  }

  /**
   * 更新記憶指標
   */
  private updateMetrics(): void {
    if (this.learningHistory.length === 0) return;

    const recentEvents = this.learningHistory.slice(-20); // 最近20個事件
    
    // 計算保持率
    const correctEvents = recentEvents.filter(e => e.isCorrect);
    this.memoryMetrics.retentionRate = (correctEvents.length / recentEvents.length) * 100;

    // 計算平均反應時間
    const totalResponseTime = recentEvents.reduce((sum, e) => sum + e.responseTime, 0);
    this.memoryMetrics.recallSpeed = totalResponseTime / recentEvents.length;

    // 計算錯誤率
    this.memoryMetrics.errorRate = 100 - this.memoryMetrics.retentionRate;

    // 計算學習效率
    this.memoryMetrics.learningEfficiency = this.calculateLearningEfficiency();

    console.log('📊 記憶指標已更新:', this.memoryMetrics);
  }

  /**
   * 計算學習效率
   */
  private calculateLearningEfficiency(): number {
    if (this.learningHistory.length < 5) return 0;

    const recentEvents = this.learningHistory.slice(-10);
    const firstHalf = recentEvents.slice(0, 5);
    const secondHalf = recentEvents.slice(5);

    const firstHalfAccuracy = firstHalf.filter(e => e.isCorrect).length / firstHalf.length;
    const secondHalfAccuracy = secondHalf.filter(e => e.isCorrect).length / secondHalf.length;

    const improvement = secondHalfAccuracy - firstHalfAccuracy;
    return Math.max(0, Math.min(100, (improvement + 1) * 50));
  }

  /**
   * 獲取個人化建議
   */
  getPersonalizedRecommendations(): string[] {
    const recommendations: string[] = [];
    const metrics = this.memoryMetrics;

    if (metrics.retentionRate < 60) {
      recommendations.push('建議增加重複練習頻率');
      recommendations.push('考慮降低難度等級');
    }

    if (metrics.recallSpeed > 3000) {
      recommendations.push('建議進行反應速度訓練');
      recommendations.push('可以嘗試更多視覺提示');
    }

    if (metrics.errorRate > 40) {
      recommendations.push('建議加強基礎詞彙練習');
      recommendations.push('考慮使用更多記憶輔助工具');
    }

    if (metrics.learningEfficiency < 30) {
      recommendations.push('建議調整學習策略');
      recommendations.push('可以嘗試不同的記憶技巧');
    }

    return recommendations;
  }

  /**
   * 獲取當前指標
   */
  getCurrentMetrics(): MemoryMetrics {
    return { ...this.memoryMetrics };
  }

  /**
   * 獲取學習歷史
   */
  getLearningHistory(): LearningEvent[] {
    return [...this.learningHistory];
  }

  /**
   * 更新配置
   */
  updateConfiguration(newConfig: Partial<MemoryConfiguration>): void {
    this.currentConfiguration = { ...this.currentConfiguration, ...newConfig };
    console.log('⚙️ 記憶增強配置已更新');
  }

  /**
   * 獲取當前配置
   */
  getCurrentConfiguration(): MemoryConfiguration {
    return { ...this.currentConfiguration };
  }

  /**
   * 重置數據
   */
  reset(): void {
    this.learningHistory = [];
    this.memoryMetrics = this.getInitialMetrics();
    console.log('🔄 記憶增強引擎已重置');
  }

  /**
   * 獲取記憶類型信息
   */
  getMemoryType(id: string): MemoryType | undefined {
    return this.memoryTypes.get(id);
  }

  /**
   * 獲取所有記憶類型
   */
  getAllMemoryTypes(): MemoryType[] {
    return Array.from(this.memoryTypes.values());
  }
}
