/**
 * 詞彙整合服務
 * 統一管理詞彙數據在不同系統間的整合和同步
 */

// 直接定義 GEPTLevel 類型，避免循環依賴
export type GEPTLevel = 'elementary' | 'intermediate' | 'high-intermediate';

// 前向聲明 VocabularyItem 接口
export interface VocabularyItem {
  id: string;
  english: string;
  chinese: string;
  level: GEPTLevel;
  image?: string;
  category?: string;
}

// 統一的詞彙接口
export interface UnifiedVocabularyWord {
  id: string;
  english: string;
  chinese: string;
  level: GEPTLevel;
  frequency: number;
  difficulty?: number;
  partOfSpeech?: string;
  pronunciation?: string;
  category?: string;
  image?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// 遊戲系統詞彙格式
export interface GameVocabularyWord {
  id: string;
  english: string;
  chinese: string;
  level: GEPTLevel;
  frequency: number;
  difficulty?: number;
}

// 詞彙活動數據
export interface VocabularyActivity {
  id: string;
  title: string;
  description?: string;
  vocabulary: UnifiedVocabularyWord[];
  geptLevel: GEPTLevel;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 詞彙整合服務類
 */
export class VocabularyIntegrationService {
  private static instance: VocabularyIntegrationService;
  private vocabularyDatabase: Map<string, UnifiedVocabularyWord> = new Map();
  private activities: Map<string, VocabularyActivity> = new Map();

  private constructor() {
    this.initializeService();
  }

  /**
   * 獲取單例實例
   */
  public static getInstance(): VocabularyIntegrationService {
    if (!VocabularyIntegrationService.instance) {
      VocabularyIntegrationService.instance = new VocabularyIntegrationService();
    }
    return VocabularyIntegrationService.instance;
  }

  /**
   * 初始化服務
   */
  private initializeService(): void {
    console.log('🔧 詞彙整合服務初始化中...');
    this.loadStoredVocabulary();
    console.log('✅ 詞彙整合服務初始化完成');
  }

  /**
   * 從本地存儲載入詞彙
   */
  private loadStoredVocabulary(): void {
    try {
      const stored = localStorage.getItem('vocabulary_integration_data');
      if (stored) {
        const data = JSON.parse(stored);
        if (data.vocabulary) {
          data.vocabulary.forEach((word: UnifiedVocabularyWord) => {
            this.vocabularyDatabase.set(word.id, word);
          });
        }
        if (data.activities) {
          data.activities.forEach((activity: VocabularyActivity) => {
            this.activities.set(activity.id, activity);
          });
        }
        console.log(`📚 載入 ${this.vocabularyDatabase.size} 個詞彙和 ${this.activities.size} 個活動`);
      }
    } catch (error) {
      console.warn('⚠️ 載入本地詞彙數據失敗:', error);
    }
  }

  /**
   * 保存詞彙到本地存儲
   */
  private saveToStorage(): void {
    try {
      const data = {
        vocabulary: Array.from(this.vocabularyDatabase.values()),
        activities: Array.from(this.activities.values()),
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem('vocabulary_integration_data', JSON.stringify(data));
      console.log('💾 詞彙數據已保存到本地存儲');
    } catch (error) {
      console.error('❌ 保存詞彙數據失敗:', error);
    }
  }

  /**
   * 將表格輸入的詞彙轉換為統一格式
   */
  public convertTableVocabulary(vocabularyItems: VocabularyItem[]): UnifiedVocabularyWord[] {
    return vocabularyItems.map(item => ({
      id: item.id,
      english: item.english.trim(),
      chinese: item.chinese.trim(),
      level: item.level,
      frequency: this.calculateFrequency(item.level),
      difficulty: this.calculateDifficulty(item.level),
      partOfSpeech: 'noun', // 預設詞性
      category: item.category || 'general',
      image: item.image,
      createdAt: new Date(),
      updatedAt: new Date()
    }));
  }

  /**
   * 創建詞彙活動
   */
  public createVocabularyActivity(
    title: string, 
    vocabularyItems: VocabularyItem[], 
    description?: string
  ): VocabularyActivity {
    const activity: VocabularyActivity = {
      id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: title.trim(),
      description: description?.trim(),
      vocabulary: this.convertTableVocabulary(vocabularyItems),
      geptLevel: this.determineActivityLevel(vocabularyItems),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // 保存活動
    this.activities.set(activity.id, activity);

    // 將詞彙添加到數據庫
    activity.vocabulary.forEach(word => {
      this.vocabularyDatabase.set(word.id, word);
    });

    // 保存到本地存儲
    this.saveToStorage();

    console.log(`🎯 創建詞彙活動: ${activity.title} (${activity.vocabulary.length} 個詞彙)`);
    return activity;
  }

  /**
   * 轉換為遊戲系統格式
   */
  public convertToGameFormat(vocabulary: UnifiedVocabularyWord[]): GameVocabularyWord[] {
    return vocabulary.map(word => ({
      id: word.id,
      english: word.english,
      chinese: word.chinese,
      level: word.level,
      frequency: word.frequency,
      difficulty: word.difficulty
    }));
  }

  /**
   * 獲取適用於遊戲的詞彙數據
   */
  public getGameVocabulary(activityId: string): GameVocabularyWord[] {
    const activity = this.activities.get(activityId);
    if (!activity) {
      console.warn(`⚠️ 找不到活動: ${activityId}`);
      return [];
    }

    return this.convertToGameFormat(activity.vocabulary);
  }

  /**
   * 獲取所有活動
   */
  public getAllActivities(): VocabularyActivity[] {
    return Array.from(this.activities.values()).sort(
      (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
    );
  }

  /**
   * 根據等級獲取詞彙
   */
  public getVocabularyByLevel(level: GEPTLevel): UnifiedVocabularyWord[] {
    return Array.from(this.vocabularyDatabase.values())
      .filter(word => word.level === level)
      .sort((a, b) => b.frequency - a.frequency);
  }

  /**
   * 搜索詞彙
   */
  public searchVocabulary(query: string): UnifiedVocabularyWord[] {
    const queryLower = query.toLowerCase();
    return Array.from(this.vocabularyDatabase.values())
      .filter(word => 
        word.english.toLowerCase().includes(queryLower) ||
        word.chinese.includes(query)
      )
      .sort((a, b) => b.frequency - a.frequency);
  }

  /**
   * 計算詞彙使用頻率
   */
  private calculateFrequency(level: GEPTLevel): number {
    switch (level) {
      case 'elementary': return 80;
      case 'intermediate': return 60;
      case 'high-intermediate': return 40;
      default: return 50;
    }
  }

  /**
   * 計算詞彙難度
   */
  private calculateDifficulty(level: GEPTLevel): number {
    switch (level) {
      case 'elementary': return 3;
      case 'intermediate': return 6;
      case 'high-intermediate': return 8;
      default: return 5;
    }
  }

  /**
   * 確定活動的 GEPT 等級
   */
  private determineActivityLevel(vocabularyItems: VocabularyItem[]): GEPTLevel {
    const levelCounts = vocabularyItems.reduce((acc, item) => {
      acc[item.level] = (acc[item.level] || 0) + 1;
      return acc;
    }, {} as Record<GEPTLevel, number>);

    // 返回出現最多的等級
    let maxCount = 0;
    let dominantLevel: GEPTLevel = 'elementary';
    
    Object.entries(levelCounts).forEach(([level, count]) => {
      if (count > maxCount) {
        maxCount = count;
        dominantLevel = level as GEPTLevel;
      }
    });

    return dominantLevel;
  }

  /**
   * 獲取統計信息
   */
  public getStatistics() {
    const totalWords = this.vocabularyDatabase.size;
    const totalActivities = this.activities.size;
    
    const levelDistribution = Array.from(this.vocabularyDatabase.values())
      .reduce((acc, word) => {
        acc[word.level] = (acc[word.level] || 0) + 1;
        return acc;
      }, {} as Record<GEPTLevel, number>);

    return {
      totalWords,
      totalActivities,
      levelDistribution,
      lastUpdated: new Date()
    };
  }

  /**
   * 清空所有數據
   */
  public clearAllData(): void {
    this.vocabularyDatabase.clear();
    this.activities.clear();
    localStorage.removeItem('vocabulary_integration_data');
    console.log('🗑️ 所有詞彙數據已清空');
  }
}
