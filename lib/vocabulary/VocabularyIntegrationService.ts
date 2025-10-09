/**
 * 詞彙整合服務
 * 統一管理詞彙數據在不同系統間的整合和同步
 * 使用 Railway API 雲端存儲
 */

// 直接定義 GEPTLevel 類型，避免循環依賴
export type GEPTLevel = 'elementary' | 'intermediate' | 'high-intermediate';

// API 響應類型
interface APIResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

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
  private useRailwayAPI: boolean = true; // 只使用 Railway API
  private apiBaseUrl: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

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
    console.log('🚀 使用 Railway 雲端存儲模式');
    console.log('✅ 詞彙整合服務初始化完成');
  }





  /**
   * 保存詞彙活動到 Railway API
   */
  private async saveToRailwayAPI(activity: VocabularyActivity): Promise<boolean> {
    console.log('🔍 saveToRailwayAPI 被調用，useRailwayAPI:', this.useRailwayAPI);

    if (!this.useRailwayAPI) {
      console.log('❌ useRailwayAPI 為 false，跳過 Railway API 調用');
      return false;
    }

    try {
      console.log('🚀 保存詞彙活動到 Railway API...');

      const response = await fetch('/api/vocabulary/sets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: activity.title,
          description: activity.description,
          geptLevel: activity.geptLevel.toUpperCase(),
          isPublic: false,
          items: activity.vocabulary.map(word => ({
            english: word.english,
            chinese: word.chinese,
            partOfSpeech: word.partOfSpeech || null,
            difficultyLevel: word.difficulty || 1,
            notes: word.category || null,
            imageUrl: word.image || null
          }))
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Railway API 保存失敗:', errorData);
        return false;
      }

      const result: APIResponse<any> = await response.json();
      console.log('✅ Railway API 保存成功:', result.data?.id);
      return true;
    } catch (error) {
      console.error('❌ Railway API 調用失敗:', error);
      return false;
    }
  }

  /**
   * 從 Railway API 載入詞彙活動
   */
  private async loadFromRailwayAPI(): Promise<VocabularyActivity[]> {
    if (!this.useRailwayAPI) return [];

    try {
      console.log('📡 從 Railway API 載入詞彙活動...');

      const response = await fetch('/api/vocabulary/sets', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        console.error('❌ Railway API 載入失敗:', response.status);
        return [];
      }

      const result: APIResponse<any[]> = await response.json();

      if (!result.success || !result.data) {
        console.error('❌ Railway API 響應格式錯誤');
        return [];
      }

      const activities: VocabularyActivity[] = result.data.map(set => ({
        id: set.id,
        title: set.title,
        description: set.description || `包含 ${set.totalWords} 個詞彙的學習活動`,
        vocabulary: set.items.map((item: any) => ({
          id: item.id,
          english: item.english,
          chinese: item.chinese,
          level: set.geptLevel.toLowerCase() as GEPTLevel,
          frequency: 1,
          difficulty: item.difficultyLevel || 1,
          partOfSpeech: item.partOfSpeech || undefined,
          category: item.notes || undefined,
          image: item.imageUrl || undefined,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(set.updatedAt)
        })),
        geptLevel: set.geptLevel.toLowerCase() as GEPTLevel,
        createdAt: new Date(set.createdAt),
        updatedAt: new Date(set.updatedAt)
      }));

      console.log(`✅ 從 Railway API 載入 ${activities.length} 個詞彙活動`);
      return activities;
    } catch (error) {
      console.error('❌ Railway API 載入失敗:', error);
      return [];
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
  public async createVocabularyActivity(
    title: string,
    vocabularyItems: VocabularyItem[],
    description?: string
  ): Promise<VocabularyActivity> {
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

    // 保存到 Railway API
    console.log('🔍 準備調用 saveToRailwayAPI...');
    const railwaySaved = await this.saveToRailwayAPI(activity);
    console.log('🔍 saveToRailwayAPI 返回結果:', railwaySaved);

    if (railwaySaved) {
      console.log(`🚀 詞彙活動已保存到 Railway: ${activity.title} (${activity.vocabulary.length} 個詞彙)`);
    } else {
      console.log('❌ Railway API 保存失敗，準備拋出錯誤');
      throw new Error('保存到 Railway 失敗，請檢查網絡連接或稍後重試');
    }

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
    console.log('🗑️ 所有詞彙數據已清空（僅內存）');
  }
}
