/**
 * 檔案夾統計分析管理器
 * 實現檔案夾統計功能：活動數量、總大小、最後修改、學習數據分析
 * 基於記憶科學原理和 GEPT 分級系統設計
 */

export interface ActivityItem {
  id: string;
  name: string;
  type: 'activity' | 'folder';
  size: number;
  createdAt: Date;
  updatedAt: Date;
  lastAccessedAt?: Date;
  geptLevel?: 'elementary' | 'intermediate' | 'high-intermediate';
  tags: string[];

  // 學習數據
  learningData?: {
    completionRate: number; // 0-1
    averageScore: number; // 0-100
    totalAttempts: number;
    successfulAttempts: number;
    timeSpent: number; // 分鐘
    retentionRate: number; // 0-1
    difficultyLevel: number; // 1-10
    lastStudiedAt?: Date;
  };

  // 使用統計
  usageStats?: {
    viewCount: number;
    editCount: number;
    shareCount: number;
    downloadCount: number;
    favoriteCount: number;
    commentCount: number;
  };

  // 協作數據
  collaborationData?: {
    collaboratorCount: number;
    lastCollaboratedAt?: Date;
    isShared: boolean;
    shareType: 'public' | 'private' | 'class';
    permissions: string[];
  };
}

export interface FolderItem {
  id: string;
  name: string;
  parentId?: string;
  createdAt: Date;
  updatedAt: Date;
  color?: string;
  icon?: string;
  description?: string;
  tags: string[];

  // 權限設定
  permissions: {
    owner: string;
    viewers: string[];
    editors: string[];
    managers: string[];
  };

  // 分享設定
  shareSettings?: {
    isPublic: boolean;
    shareUrl?: string;
    password?: string;
    expiresAt?: Date;
  };
}

export interface FolderStatistics {
  // 基本統計
  totalActivities: number;
  totalSubfolders: number;
  totalSize: number; // bytes
  averageActivitySize: number;

  // 時間統計
  createdAt: Date;
  lastModified: Date;
  lastAccessed?: Date;
  oldestActivity?: Date;
  newestActivity?: Date;

  // 類型分布
  activityTypeDistribution: {
    [type: string]: number;
  };

  // GEPT 等級分布
  geptLevelDistribution: {
    elementary: number;
    intermediate: number;
    'high-intermediate': number;
    unspecified: number;
  };

  // 學習數據統計
  learningStatistics: {
    averageCompletionRate: number;
    averageScore: number;
    totalAttempts: number;
    totalTimeSpent: number; // 分鐘
    averageRetentionRate: number;
    averageDifficultyLevel: number;
    activeLearners: number;
    recentActivity: number; // 最近7天的活動數
  };

  // 使用統計
  usageStatistics: {
    totalViews: number;
    totalEdits: number;
    totalShares: number;
    totalDownloads: number;
    totalFavorites: number;
    totalComments: number;
    averageViewsPerActivity: number;
    mostViewedActivity?: ActivityItem;
    mostEditedActivity?: ActivityItem;
  };

  // 協作統計
  collaborationStatistics: {
    totalCollaborators: number;
    sharedActivities: number;
    publicActivities: number;
    privateActivities: number;
    classActivities: number;
    recentCollaborations: number; // 最近7天
    mostCollaborativeActivity?: ActivityItem;
  };

  // 標籤統計
  tagStatistics: {
    totalTags: number;
    mostUsedTags: Array<{
      tag: string;
      count: number;
      percentage: number;
    }>;
    tagDistribution: { [tag: string]: number };
  };

  // 趨勢數據
  trendData: {
    activityCreationTrend: Array<{
      date: string;
      count: number;
    }>;
    usageTrend: Array<{
      date: string;
      views: number;
      edits: number;
    }>;
    learningProgressTrend: Array<{
      date: string;
      averageScore: number;
      completionRate: number;
    }>;
  };

  // 健康度指標
  healthMetrics: {
    activityFreshness: number; // 0-100, 基於最近更新
    learningEngagement: number; // 0-100, 基於學習活動
    collaborationHealth: number; // 0-100, 基於協作活動
    contentQuality: number; // 0-100, 基於完成率和分數
    overallHealth: number; // 0-100, 綜合健康度
  };
}

export interface AnalyticsFilter {
  dateRange?: {
    start: Date;
    end: Date;
  };
  geptLevels?: string[];
  activityTypes?: string[];
  tags?: string[];
  collaborators?: string[];
  minSize?: number;
  maxSize?: number;
  includeSubfolders?: boolean;
  sortBy?: 'name' | 'date' | 'size' | 'usage' | 'score';
  sortDirection?: 'asc' | 'desc';
}

export interface ComparisonData {
  current: FolderStatistics;
  previous?: FolderStatistics;
  benchmark?: FolderStatistics;
  percentageChange: {
    totalActivities: number;
    totalSize: number;
    averageScore: number;
    completionRate: number;
    usageCount: number;
  };
  insights: string[];
  recommendations: string[];
}

export class FolderAnalyticsManager {
  private cache = new Map<string, { data: FolderStatistics; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5分鐘緩存

  /**
   * 獲取檔案夾統計數據
   */
  async getFolderStatistics(
    folderId: string,
    activities: ActivityItem[],
    subfolders: FolderItem[],
    filter?: AnalyticsFilter
  ): Promise<FolderStatistics> {
    const cacheKey = `${folderId}_${JSON.stringify(filter)}`;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    // 應用過濾器
    const filteredActivities = this.applyFilter(activities, filter);
    const filteredSubfolders = this.applyFolderFilter(subfolders, filter);

    const statistics = await this.calculateStatistics(
      filteredActivities,
      filteredSubfolders,
      filter
    );

    // 緩存結果
    this.cache.set(cacheKey, {
      data: statistics,
      timestamp: Date.now()
    });

    return statistics;
  }
}