/**
 * 檔案夾統計分析管理器實現部分
 * 包含主要的計算和分析邏輯
 */

import { ActivityItem, FolderItem, FolderStatistics, AnalyticsFilter } from './FolderAnalyticsManager';

export class FolderAnalyticsManagerImpl {
  /**
   * 應用過濾器到活動列表
   */
  applyFilter(activities: ActivityItem[], filter?: AnalyticsFilter): ActivityItem[] {
    if (!filter) return activities;

    return activities.filter(activity => {
      // 日期範圍過濾
      if (filter.dateRange) {
        const activityDate = activity.updatedAt;
        if (activityDate < filter.dateRange.start || activityDate > filter.dateRange.end) {
          return false;
        }
      }

      // GEPT 等級過濾
      if (filter.geptLevels && filter.geptLevels.length > 0) {
        if (!activity.geptLevel || !filter.geptLevels.includes(activity.geptLevel)) {
          return false;
        }
      }

      // 活動類型過濾
      if (filter.activityTypes && filter.activityTypes.length > 0) {
        if (!filter.activityTypes.includes(activity.type)) {
          return false;
        }
      }

      // 標籤過濾
      if (filter.tags && filter.tags.length > 0) {
        if (!filter.tags.some(tag => activity.tags.includes(tag))) {
          return false;
        }
      }

      // 大小範圍過濾
      if (filter.minSize !== undefined && activity.size < filter.minSize) {
        return false;
      }
      if (filter.maxSize !== undefined && activity.size > filter.maxSize) {
        return false;
      }

      return true;
    });
  }

  /**
   * 應用過濾器到檔案夾列表
   */
  applyFolderFilter(folders: FolderItem[], filter?: AnalyticsFilter): FolderItem[] {
    if (!filter) return folders;

    return folders.filter(folder => {
      // 日期範圍過濾
      if (filter.dateRange) {
        const folderDate = folder.updatedAt;
        if (folderDate < filter.dateRange.start || folderDate > filter.dateRange.end) {
          return false;
        }
      }

      // 標籤過濾
      if (filter.tags && filter.tags.length > 0) {
        if (!filter.tags.some(tag => folder.tags.includes(tag))) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * 計算統計數據
   */
  async calculateStatistics(
    activities: ActivityItem[],
    subfolders: FolderItem[],
    filter?: AnalyticsFilter
  ): Promise<FolderStatistics> {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // 基本統計
    const totalActivities = activities.length;
    const totalSubfolders = subfolders.length;
    const totalSize = activities.reduce((sum, activity) => sum + activity.size, 0);
    const averageActivitySize = totalActivities > 0 ? totalSize / totalActivities : 0;

    // 時間統計
    const dates = activities.map(a => a.updatedAt).sort((a, b) => a.getTime() - b.getTime());
    const createdDates = activities.map(a => a.createdAt).sort((a, b) => a.getTime() - b.getTime());
    const accessDates = activities
      .map(a => a.lastAccessedAt)
      .filter(Boolean)
      .sort((a, b) => a!.getTime() - b!.getTime());

    // 類型分布
    const activityTypeDistribution: { [type: string]: number } = {};
    activities.forEach(activity => {
      activityTypeDistribution[activity.type] = (activityTypeDistribution[activity.type] || 0) + 1;
    });

    // GEPT 等級分布
    const geptLevelDistribution = {
      elementary: 0,
      intermediate: 0,
      'high-intermediate': 0,
      unspecified: 0
    };
    activities.forEach(activity => {
      if (activity.geptLevel) {
        geptLevelDistribution[activity.geptLevel]++;
      } else {
        geptLevelDistribution.unspecified++;
      }
    });

    // 學習數據統計
    const learningActivities = activities.filter(a => a.learningData);
    const learningStatistics = {
      averageCompletionRate: this.calculateAverage(learningActivities, a => a.learningData!.completionRate),
      averageScore: this.calculateAverage(learningActivities, a => a.learningData!.averageScore),
      totalAttempts: learningActivities.reduce((sum, a) => sum + a.learningData!.totalAttempts, 0),
      totalTimeSpent: learningActivities.reduce((sum, a) => sum + a.learningData!.timeSpent, 0),
      averageRetentionRate: this.calculateAverage(learningActivities, a => a.learningData!.retentionRate),
      averageDifficultyLevel: this.calculateAverage(learningActivities, a => a.learningData!.difficultyLevel),
      activeLearners: new Set(learningActivities.map(a => a.id)).size,
      recentActivity: learningActivities.filter(a => 
        a.learningData!.lastStudiedAt && a.learningData!.lastStudiedAt >= sevenDaysAgo
      ).length
    };

    // 使用統計
    const usageActivities = activities.filter(a => a.usageStats);
    const totalViews = usageActivities.reduce((sum, a) => sum + a.usageStats!.viewCount, 0);
    const totalEdits = usageActivities.reduce((sum, a) => sum + a.usageStats!.editCount, 0);
    const mostViewedActivity = usageActivities.reduce((max, current) => 
      (current.usageStats!.viewCount > (max?.usageStats?.viewCount || 0)) ? current : max, 
      undefined as ActivityItem | undefined
    );

    const usageStatistics = {
      totalViews,
      totalEdits,
      totalShares: usageActivities.reduce((sum, a) => sum + a.usageStats!.shareCount, 0),
      totalDownloads: usageActivities.reduce((sum, a) => sum + a.usageStats!.downloadCount, 0),
      totalFavorites: usageActivities.reduce((sum, a) => sum + a.usageStats!.favoriteCount, 0),
      totalComments: usageActivities.reduce((sum, a) => sum + a.usageStats!.commentCount, 0),
      averageViewsPerActivity: usageActivities.length > 0 ? totalViews / usageActivities.length : 0,
      mostViewedActivity,
      mostEditedActivity: usageActivities.reduce((max, current) => 
        (current.usageStats!.editCount > (max?.usageStats?.editCount || 0)) ? current : max, 
        undefined as ActivityItem | undefined
      )
    };

    // 協作統計
    const collaborationActivities = activities.filter(a => a.collaborationData);
    const collaborationStatistics = {
      totalCollaborators: new Set(
        collaborationActivities.flatMap(a => a.collaborationData!.collaboratorCount)
      ).size,
      sharedActivities: collaborationActivities.filter(a => a.collaborationData!.isShared).length,
      publicActivities: collaborationActivities.filter(a => a.collaborationData!.shareType === 'public').length,
      privateActivities: collaborationActivities.filter(a => a.collaborationData!.shareType === 'private').length,
      classActivities: collaborationActivities.filter(a => a.collaborationData!.shareType === 'class').length,
      recentCollaborations: collaborationActivities.filter(a => 
        a.collaborationData!.lastCollaboratedAt && a.collaborationData!.lastCollaboratedAt >= sevenDaysAgo
      ).length,
      mostCollaborativeActivity: collaborationActivities.reduce((max, current) => 
        (current.collaborationData!.collaboratorCount > (max?.collaborationData?.collaboratorCount || 0)) ? current : max, 
        undefined as ActivityItem | undefined
      )
    };

    // 標籤統計
    const allTags = activities.flatMap(a => a.tags);
    const tagCounts = allTags.reduce((counts, tag) => {
      counts[tag] = (counts[tag] || 0) + 1;
      return counts;
    }, {} as { [tag: string]: number });

    const mostUsedTags = Object.entries(tagCounts)
      .map(([tag, count]) => ({
        tag,
        count,
        percentage: (count / allTags.length) * 100
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const tagStatistics = {
      totalTags: Object.keys(tagCounts).length,
      mostUsedTags,
      tagDistribution: tagCounts
    };

    // 趨勢數據（簡化版本）
    const trendData = {
      activityCreationTrend: this.generateTrendData(activities, 'createdAt'),
      usageTrend: this.generateUsageTrend(activities),
      learningProgressTrend: this.generateLearningTrend(learningActivities)
    };

    // 健康度指標
    const healthMetrics = this.calculateHealthMetrics(activities, learningStatistics, usageStatistics);

    return {
      totalActivities,
      totalSubfolders,
      totalSize,
      averageActivitySize,
      createdAt: createdDates[0] || now,
      lastModified: dates[dates.length - 1] || now,
      lastAccessed: accessDates[accessDates.length - 1],
      oldestActivity: createdDates[0],
      newestActivity: createdDates[createdDates.length - 1],
      activityTypeDistribution,
      geptLevelDistribution,
      learningStatistics,
      usageStatistics,
      collaborationStatistics,
      tagStatistics,
      trendData,
      healthMetrics
    };
  }

  /**
   * 計算平均值
   */
  calculateAverage(items: ActivityItem[], getValue: (item: ActivityItem) => number): number {
    if (items.length === 0) return 0;
    const sum = items.reduce((total, item) => total + getValue(item), 0);
    return sum / items.length;
  }

  /**
   * 生成趨勢數據
   */
  generateTrendData(activities: ActivityItem[], dateField: keyof ActivityItem): Array<{ date: string; count: number }> {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    const dateCounts = activities.reduce((counts, activity) => {
      const date = (activity[dateField] as Date).toISOString().split('T')[0];
      counts[date] = (counts[date] || 0) + 1;
      return counts;
    }, {} as { [date: string]: number });

    return last30Days.map(date => ({
      date,
      count: dateCounts[date] || 0
    }));
  }

  /**
   * 生成使用趨勢數據
   */
  generateUsageTrend(activities: ActivityItem[]): Array<{ date: string; views: number; edits: number }> {
    // 簡化實現，實際應該基於時間序列數據
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => ({
      date,
      views: Math.floor(Math.random() * 100), // 模擬數據
      edits: Math.floor(Math.random() * 20)
    }));
  }

  /**
   * 生成學習進度趨勢數據
   */
  generateLearningTrend(activities: ActivityItem[]): Array<{ date: string; averageScore: number; completionRate: number }> {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => ({
      date,
      averageScore: this.calculateAverage(activities, a => a.learningData?.averageScore || 0),
      completionRate: this.calculateAverage(activities, a => a.learningData?.completionRate || 0)
    }));
  }

  /**
   * 計算健康度指標
   */
  calculateHealthMetrics(
    activities: ActivityItem[],
    learningStats: any,
    usageStats: any
  ): FolderStatistics['healthMetrics'] {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // 活動新鮮度（基於最近更新）
    const recentlyUpdated = activities.filter(a => a.updatedAt >= thirtyDaysAgo).length;
    const activityFreshness = activities.length > 0 ? (recentlyUpdated / activities.length) * 100 : 0;

    // 學習參與度
    const learningEngagement = Math.min(100, (learningStats.recentActivity / Math.max(1, activities.length)) * 100);

    // 協作健康度
    const collaborationHealth = Math.min(100, (usageStats.totalShares / Math.max(1, activities.length)) * 50);

    // 內容品質
    const contentQuality = (learningStats.averageScore + learningStats.averageCompletionRate * 100) / 2;

    // 綜合健康度
    const overallHealth = (activityFreshness + learningEngagement + collaborationHealth + contentQuality) / 4;

    return {
      activityFreshness,
      learningEngagement,
      collaborationHealth,
      contentQuality,
      overallHealth
    };
  }
}
