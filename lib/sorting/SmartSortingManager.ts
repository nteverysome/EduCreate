/**
 * 智能排序管理器
 * 實現多維度智能排序：名稱、日期、大小、類型、使用頻率、學習效果排序
 * 基於Wordwall排序系統和記憶科學原理設計
 */

export interface SortableItem {
  id: string;
  name: string;
  type: 'folder' | 'activity';
  createdAt: Date;
  updatedAt: Date;
  lastAccessedAt?: Date;
  size: number;
  fileType?: string;
  tags: string[];
  geptLevel?: 'elementary' | 'intermediate' | 'high-intermediate';
  
  // 使用頻率數據
  accessCount: number;
  recentAccessCount: number; // 最近30天
  averageSessionTime: number; // 平均使用時間（分鐘）
  
  // 學習效果數據
  learningScore?: number; // 0-100
  completionRate?: number; // 0-1
  retentionRate?: number; // 記憶保持率 0-1
  difficultyLevel?: number; // 1-10
  
  // 協作數據
  shareCount: number;
  collaboratorCount: number;
  
  // 元數據
  metadata: {
    wordCount?: number;
    imageCount?: number;
    audioCount?: number;
    videoCount?: number;
    questionCount?: number;
  };
}

export enum SortCriteria {
  NAME = 'name',
  CREATED_DATE = 'createdAt',
  UPDATED_DATE = 'updatedAt',
  LAST_ACCESSED = 'lastAccessedAt',
  SIZE = 'size',
  TYPE = 'type',
  ACCESS_COUNT = 'accessCount',
  RECENT_ACCESS = 'recentAccessCount',
  SESSION_TIME = 'averageSessionTime',
  LEARNING_SCORE = 'learningScore',
  COMPLETION_RATE = 'completionRate',
  RETENTION_RATE = 'retentionRate',
  DIFFICULTY = 'difficultyLevel',
  SHARE_COUNT = 'shareCount',
  COLLABORATORS = 'collaboratorCount',
  GEPT_LEVEL = 'geptLevel',
  SMART_RELEVANCE = 'smartRelevance' // AI智能相關性
}

export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc'
}

export interface SortConfig {
  primary: {
    criteria: SortCriteria;
    direction: SortDirection;
  };
  secondary?: {
    criteria: SortCriteria;
    direction: SortDirection;
  };
  tertiary?: {
    criteria: SortCriteria;
    direction: SortDirection;
  };
}

export interface SmartSortingOptions {
  userPreferences?: {
    preferredTypes?: string[];
    preferredGeptLevels?: string[];
    recentActivityWeight?: number; // 0-1
    learningProgressWeight?: number; // 0-1
  };
  contextualFactors?: {
    currentTime?: Date;
    userLearningGoals?: string[];
    sessionContext?: 'study' | 'review' | 'create' | 'browse';
  };
  filterCriteria?: {
    types?: string[];
    geptLevels?: string[];
    tags?: string[];
    dateRange?: {
      start: Date;
      end: Date;
    };
    sizeRange?: {
      min: number;
      max: number;
    };
  };
}

export interface SortingPreset {
  id: string;
  name: string;
  description: string;
  config: SortConfig;
  category: 'default' | 'learning' | 'productivity' | 'collaboration' | 'custom';
  isBuiltIn: boolean;
  usageCount: number;
}

export class SmartSortingManager {
  private sortingPresets = new Map<string, SortingPreset>();
  private userSortingHistory: SortConfig[] = [];
  private defaultPresets: SortingPreset[];

  constructor() {
    this.initializeDefaultPresets();
  }

  /**
   * 初始化默認排序預設
   */
  private initializeDefaultPresets(): void {
    this.defaultPresets = [
      {
        id: 'name-asc',
        name: '名稱 A-Z',
        description: '按名稱字母順序排序',
        config: {
          primary: { criteria: SortCriteria.NAME, direction: SortDirection.ASC }
        },
        category: 'default',
        isBuiltIn: true,
        usageCount: 0
      },
      {
        id: 'name-desc',
        name: '名稱 Z-A',
        description: '按名稱字母倒序排序',
        config: {
          primary: { criteria: SortCriteria.NAME, direction: SortDirection.DESC }
        },
        category: 'default',
        isBuiltIn: true,
        usageCount: 0
      },
      {
        id: 'recent-first',
        name: '最近修改',
        description: '最近修改的項目優先',
        config: {
          primary: { criteria: SortCriteria.UPDATED_DATE, direction: SortDirection.DESC },
          secondary: { criteria: SortCriteria.LAST_ACCESSED, direction: SortDirection.DESC }
        },
        category: 'default',
        isBuiltIn: true,
        usageCount: 0
      },
      {
        id: 'most-used',
        name: '最常使用',
        description: '使用頻率最高的項目優先',
        config: {
          primary: { criteria: SortCriteria.ACCESS_COUNT, direction: SortDirection.DESC },
          secondary: { criteria: SortCriteria.RECENT_ACCESS, direction: SortDirection.DESC }
        },
        category: 'productivity',
        isBuiltIn: true,
        usageCount: 0
      },
      {
        id: 'learning-progress',
        name: '學習進度',
        description: '按學習效果和完成度排序',
        config: {
          primary: { criteria: SortCriteria.LEARNING_SCORE, direction: SortDirection.DESC },
          secondary: { criteria: SortCriteria.COMPLETION_RATE, direction: SortDirection.ASC },
          tertiary: { criteria: SortCriteria.RETENTION_RATE, direction: SortDirection.ASC }
        },
        category: 'learning',
        isBuiltIn: true,
        usageCount: 0
      },
      {
        id: 'difficulty-easy-first',
        name: '簡單優先',
        description: '從簡單到困難排序',
        config: {
          primary: { criteria: SortCriteria.DIFFICULTY, direction: SortDirection.ASC },
          secondary: { criteria: SortCriteria.GEPT_LEVEL, direction: SortDirection.ASC }
        },
        category: 'learning',
        isBuiltIn: true,
        usageCount: 0
      },
      {
        id: 'collaborative',
        name: '協作熱度',
        description: '按分享和協作活躍度排序',
        config: {
          primary: { criteria: SortCriteria.COLLABORATORS, direction: SortDirection.DESC },
          secondary: { criteria: SortCriteria.SHARE_COUNT, direction: SortDirection.DESC }
        },
        category: 'collaboration',
        isBuiltIn: true,
        usageCount: 0
      },
      {
        id: 'smart-relevance',
        name: 'AI智能推薦',
        description: '基於AI分析的個人化排序',
        config: {
          primary: { criteria: SortCriteria.SMART_RELEVANCE, direction: SortDirection.DESC }
        },
        category: 'default',
        isBuiltIn: true,
        usageCount: 0
      }
    ];

    // 將默認預設添加到管理器中
    this.defaultPresets.forEach(preset => {
      this.sortingPresets.set(preset.id, preset);
    });
  }

  /**
   * 執行智能排序
   */
  sortItems(
    items: SortableItem[],
    config: SortConfig,
    options?: SmartSortingOptions
  ): SortableItem[] {
    // 記錄排序歷史
    this.userSortingHistory.push(config);
    if (this.userSortingHistory.length > 50) {
      this.userSortingHistory.shift();
    }

    // 應用過濾器
    let filteredItems = this.applyFilters(items, options?.filterCriteria);

    // 如果是智能相關性排序，先計算相關性分數
    if (config.primary.criteria === SortCriteria.SMART_RELEVANCE) {
      filteredItems = this.calculateSmartRelevance(filteredItems, options);
    }

    // 執行多級排序
    return this.performMultiLevelSort(filteredItems, config);
  }

  /**
   * 應用過濾器
   */
  private applyFilters(
    items: SortableItem[],
    filters?: SmartSortingOptions['filterCriteria']
  ): SortableItem[] {
    if (!filters) return items;

    return items.filter(item => {
      // 類型過濾
      if (filters.types && !filters.types.includes(item.type)) {
        return false;
      }

      // GEPT等級過濾
      if (filters.geptLevels && item.geptLevel && !filters.geptLevels.includes(item.geptLevel)) {
        return false;
      }

      // 標籤過濾
      if (filters.tags && !filters.tags.some(tag => item.tags.includes(tag))) {
        return false;
      }

      // 日期範圍過濾
      if (filters.dateRange) {
        const itemDate = item.updatedAt;
        if (itemDate < filters.dateRange.start || itemDate > filters.dateRange.end) {
          return false;
        }
      }

      // 大小範圍過濾
      if (filters.sizeRange) {
        if (item.size < filters.sizeRange.min || item.size > filters.sizeRange.max) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * 計算智能相關性分數
   */
  private calculateSmartRelevance(
    items: SortableItem[],
    options?: SmartSortingOptions
  ): SortableItem[] {
    const now = new Date();
    const preferences = options?.userPreferences;
    const context = options?.contextualFactors;

    return items.map(item => {
      let relevanceScore = 0;

      // 基礎分數（使用頻率）
      relevanceScore += (item.accessCount / 100) * 20;

      // 最近活躍度
      const daysSinceAccess = item.lastAccessedAt 
        ? (now.getTime() - item.lastAccessedAt.getTime()) / (1000 * 60 * 60 * 24)
        : 999;
      relevanceScore += Math.max(0, 20 - daysSinceAccess) * 2;

      // 學習效果權重
      if (item.learningScore) {
        relevanceScore += item.learningScore * 0.3;
      }

      // 用戶偏好權重
      if (preferences) {
        if (preferences.preferredTypes?.includes(item.type)) {
          relevanceScore += 15;
        }
        if (preferences.preferredGeptLevels?.includes(item.geptLevel || '')) {
          relevanceScore += 10;
        }
      }

      // 上下文相關性
      if (context?.sessionContext) {
        switch (context.sessionContext) {
          case 'study':
            if (item.type === 'activity' && item.learningScore && item.learningScore < 80) {
              relevanceScore += 20; // 優先推薦需要練習的活動
            }
            break;
          case 'review':
            if (item.retentionRate && item.retentionRate < 0.7) {
              relevanceScore += 25; // 優先推薦需要復習的內容
            }
            break;
          case 'create':
            if (item.type === 'folder' || item.shareCount > 0) {
              relevanceScore += 15; // 優先推薦可參考的內容
            }
            break;
        }
      }

      // 將分數存儲為臨時屬性
      (item as any).smartRelevanceScore = relevanceScore;
      return item;
    });
  }

  /**
   * 執行多級排序
   */
  private performMultiLevelSort(items: SortableItem[], config: SortConfig): SortableItem[] {
    return items.sort((a, b) => {
      // 主要排序
      let result = this.compareItems(a, b, config.primary.criteria, config.primary.direction);
      
      // 次要排序
      if (result === 0 && config.secondary) {
        result = this.compareItems(a, b, config.secondary.criteria, config.secondary.direction);
      }
      
      // 第三級排序
      if (result === 0 && config.tertiary) {
        result = this.compareItems(a, b, config.tertiary.criteria, config.tertiary.direction);
      }
      
      return result;
    });
  }

  /**
   * 比較兩個項目
   */
  private compareItems(
    a: SortableItem,
    b: SortableItem,
    criteria: SortCriteria,
    direction: SortDirection
  ): number {
    let result = 0;

    switch (criteria) {
      case SortCriteria.NAME:
        result = a.name.localeCompare(b.name, 'zh-TW', { numeric: true });
        break;
      
      case SortCriteria.CREATED_DATE:
        result = a.createdAt.getTime() - b.createdAt.getTime();
        break;
      
      case SortCriteria.UPDATED_DATE:
        result = a.updatedAt.getTime() - b.updatedAt.getTime();
        break;
      
      case SortCriteria.LAST_ACCESSED:
        const aAccess = a.lastAccessedAt?.getTime() || 0;
        const bAccess = b.lastAccessedAt?.getTime() || 0;
        result = aAccess - bAccess;
        break;
      
      case SortCriteria.SIZE:
        result = a.size - b.size;
        break;
      
      case SortCriteria.TYPE:
        result = a.type.localeCompare(b.type);
        break;
      
      case SortCriteria.ACCESS_COUNT:
        result = a.accessCount - b.accessCount;
        break;
      
      case SortCriteria.RECENT_ACCESS:
        result = a.recentAccessCount - b.recentAccessCount;
        break;
      
      case SortCriteria.SESSION_TIME:
        result = a.averageSessionTime - b.averageSessionTime;
        break;
      
      case SortCriteria.LEARNING_SCORE:
        const aScore = a.learningScore || 0;
        const bScore = b.learningScore || 0;
        result = aScore - bScore;
        break;
      
      case SortCriteria.COMPLETION_RATE:
        const aCompletion = a.completionRate || 0;
        const bCompletion = b.completionRate || 0;
        result = aCompletion - bCompletion;
        break;
      
      case SortCriteria.RETENTION_RATE:
        const aRetention = a.retentionRate || 0;
        const bRetention = b.retentionRate || 0;
        result = aRetention - bRetention;
        break;
      
      case SortCriteria.DIFFICULTY:
        const aDifficulty = a.difficultyLevel || 0;
        const bDifficulty = b.difficultyLevel || 0;
        result = aDifficulty - bDifficulty;
        break;
      
      case SortCriteria.SHARE_COUNT:
        result = a.shareCount - b.shareCount;
        break;
      
      case SortCriteria.COLLABORATORS:
        result = a.collaboratorCount - b.collaboratorCount;
        break;
      
      case SortCriteria.GEPT_LEVEL:
        const geptOrder = { 'elementary': 1, 'intermediate': 2, 'high-intermediate': 3 };
        const aGept = geptOrder[a.geptLevel || 'elementary'];
        const bGept = geptOrder[b.geptLevel || 'elementary'];
        result = aGept - bGept;
        break;
      
      case SortCriteria.SMART_RELEVANCE:
        const aRelevance = (a as any).smartRelevanceScore || 0;
        const bRelevance = (b as any).smartRelevanceScore || 0;
        result = aRelevance - bRelevance;
        break;
      
      default:
        result = 0;
    }

    return direction === SortDirection.DESC ? -result : result;
  }

  /**
   * 獲取排序預設
   */
  getSortingPresets(category?: string): SortingPreset[] {
    const presets = Array.from(this.sortingPresets.values());
    
    if (category) {
      return presets.filter(preset => preset.category === category);
    }
    
    return presets.sort((a, b) => b.usageCount - a.usageCount);
  }

  /**
   * 創建自定義排序預設
   */
  createCustomPreset(
    name: string,
    description: string,
    config: SortConfig
  ): SortingPreset {
    const preset: SortingPreset = {
      id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      config,
      category: 'custom',
      isBuiltIn: false,
      usageCount: 0
    };

    this.sortingPresets.set(preset.id, preset);
    return preset;
  }

  /**
   * 使用排序預設
   */
  useSortingPreset(presetId: string): SortConfig | null {
    const preset = this.sortingPresets.get(presetId);
    if (!preset) return null;

    // 增加使用次數
    preset.usageCount++;
    
    return preset.config;
  }

  /**
   * 獲取智能排序建議
   */
  getSmartSortingSuggestions(
    items: SortableItem[],
    options?: SmartSortingOptions
  ): SortingPreset[] {
    const suggestions: SortingPreset[] = [];
    const context = options?.contextualFactors?.sessionContext;

    // 基於上下文的建議
    switch (context) {
      case 'study':
        suggestions.push(
          this.sortingPresets.get('learning-progress')!,
          this.sortingPresets.get('difficulty-easy-first')!
        );
        break;
      
      case 'review':
        suggestions.push(
          this.sortingPresets.get('smart-relevance')!,
          this.sortingPresets.get('most-used')!
        );
        break;
      
      case 'create':
        suggestions.push(
          this.sortingPresets.get('collaborative')!,
          this.sortingPresets.get('recent-first')!
        );
        break;
      
      default:
        suggestions.push(
          this.sortingPresets.get('smart-relevance')!,
          this.sortingPresets.get('recent-first')!,
          this.sortingPresets.get('most-used')!
        );
    }

    // 基於歷史使用的建議
    const recentConfigs = this.userSortingHistory.slice(-10);
    const configUsage = new Map<string, number>();
    
    recentConfigs.forEach(config => {
      const key = `${config.primary.criteria}_${config.primary.direction}`;
      configUsage.set(key, (configUsage.get(key) || 0) + 1);
    });

    // 添加常用的排序方式
    const mostUsedConfig = Array.from(configUsage.entries())
      .sort((a, b) => b[1] - a[1])[0];
    
    if (mostUsedConfig) {
      const [criteria, direction] = mostUsedConfig[0].split('_');
      const matchingPreset = Array.from(this.sortingPresets.values())
        .find(preset => 
          preset.config.primary.criteria === criteria &&
          preset.config.primary.direction === direction
        );
      
      if (matchingPreset && !suggestions.includes(matchingPreset)) {
        suggestions.unshift(matchingPreset);
      }
    }

    return suggestions.slice(0, 5);
  }

  /**
   * 分析排序效果
   */
  analyzeSortingEffectiveness(
    originalItems: SortableItem[],
    sortedItems: SortableItem[],
    config: SortConfig
  ): {
    relevanceScore: number;
    diversityScore: number;
    userSatisfactionPrediction: number;
    recommendations: string[];
  } {
    const analysis = {
      relevanceScore: 0,
      diversityScore: 0,
      userSatisfactionPrediction: 0,
      recommendations: [] as string[]
    };

    // 計算相關性分數
    const topItems = sortedItems.slice(0, 10);
    const avgRecentAccess = topItems.reduce((sum, item) => sum + item.recentAccessCount, 0) / topItems.length;
    analysis.relevanceScore = Math.min(100, avgRecentAccess * 10);

    // 計算多樣性分數
    const typeDistribution = new Set(topItems.map(item => item.type)).size;
    const geptDistribution = new Set(topItems.map(item => item.geptLevel).filter(Boolean)).size;
    analysis.diversityScore = (typeDistribution + geptDistribution) * 20;

    // 預測用戶滿意度
    analysis.userSatisfactionPrediction = (analysis.relevanceScore + analysis.diversityScore) / 2;

    // 生成建議
    if (analysis.relevanceScore < 50) {
      analysis.recommendations.push('考慮使用智能推薦排序以提高相關性');
    }
    
    if (analysis.diversityScore < 40) {
      analysis.recommendations.push('建議使用多級排序以增加結果多樣性');
    }
    
    if (topItems.every(item => item.type === 'folder')) {
      analysis.recommendations.push('混合顯示檔案夾和活動以改善瀏覽體驗');
    }

    return analysis;
  }

  /**
   * 導出排序配置
   */
  exportSortingConfig(presetId: string): string | null {
    const preset = this.sortingPresets.get(presetId);
    if (!preset) return null;
    
    return JSON.stringify(preset, null, 2);
  }

  /**
   * 導入排序配置
   */
  importSortingConfig(configData: string): SortingPreset | null {
    try {
      const preset = JSON.parse(configData) as SortingPreset;
      
      // 驗證配置結構
      if (!preset.name || !preset.config || !preset.config.primary) {
        throw new Error('Invalid preset structure');
      }
      
      // 生成新的ID避免衝突
      preset.id = `imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      preset.isBuiltIn = false;
      preset.category = 'custom';
      preset.usageCount = 0;
      
      this.sortingPresets.set(preset.id, preset);
      return preset;
    } catch (error) {
      console.error('Failed to import sorting config:', error);
      return null;
    }
  }

  /**
   * 重置為默認排序預設
   */
  resetToDefaults(): void {
    // 清除所有自定義預設
    const customPresets = Array.from(this.sortingPresets.values())
      .filter(preset => !preset.isBuiltIn);
    
    customPresets.forEach(preset => {
      this.sortingPresets.delete(preset.id);
    });

    // 重置使用計數
    this.defaultPresets.forEach(preset => {
      preset.usageCount = 0;
      this.sortingPresets.set(preset.id, preset);
    });

    // 清除歷史記錄
    this.userSortingHistory = [];
  }
}

// 單例實例
export const smartSortingManager = new SmartSortingManager();
