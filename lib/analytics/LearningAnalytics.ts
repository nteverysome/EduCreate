/**
 * 學習分析系統 - 第三階段
 * 提供全面的學習數據分析、報告生成和可視化功能
 */

export interface LearningSession {
  id: string;
  userId: string;
  activityId: string;
  gameType: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // 秒
  completed: boolean;
  score: number;
  maxScore: number;
  attempts: number;
  interactions: UserInteraction[];
  metadata: SessionMetadata;
}

export interface UserInteraction {
  id: string;
  sessionId: string;
  type: 'click' | 'input' | 'submit' | 'hint' | 'pause' | 'resume';
  elementId?: string;
  timestamp: Date;
  data: any;
  responseTime?: number;
}

export interface SessionMetadata {
  device: string;
  browser: string;
  screenSize: { width: number; height: number };
  location?: { country: string; city: string };
  referrer?: string;
}

export interface LearningProgress {
  userId: string;
  subject: string;
  topic: string;
  skillLevel: number; // 0-100
  masteryLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  completedActivities: number;
  totalTimeSpent: number;
  averageScore: number;
  improvementRate: number;
  lastActiveDate: Date;
  streakDays: number;
  achievements: Achievement[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'completion' | 'score' | 'streak' | 'improvement' | 'collaboration';
  earnedDate: Date;
  points: number;
}

export interface AnalyticsReport {
  id: string;
  type: 'individual' | 'group' | 'activity' | 'organization';
  title: string;
  description: string;
  timeRange: { start: Date; end: Date };
  subjects: string[];
  metrics: ReportMetrics;
  insights: AnalyticsInsight[];
  recommendations: string[];
  visualizations: VisualizationData[];
  generatedAt: Date;
  generatedBy: string;
}

export interface ReportMetrics {
  engagement: EngagementMetrics;
  performance: PerformanceMetrics;
  learning: LearningMetrics;
  behavioral: BehavioralMetrics;
}

export interface EngagementMetrics {
  totalSessions: number;
  totalTimeSpent: number;
  averageSessionDuration: number;
  completionRate: number;
  returnRate: number;
  activeUsers: number;
  peakUsageHours: number[];
  deviceDistribution: { [device: string]: number };
}

export interface PerformanceMetrics {
  averageScore: number;
  scoreDistribution: { [range: string]: number };
  improvementRate: number;
  masteryRate: number;
  errorPatterns: { [error: string]: number };
  timeToCompletion: number;
  attemptsPerActivity: number;
}

export interface LearningMetrics {
  skillProgression: { [skill: string]: number };
  topicMastery: { [topic: string]: number };
  learningVelocity: number;
  retentionRate: number;
  transferRate: number;
  conceptualUnderstanding: number;
}

export interface BehavioralMetrics {
  interactionPatterns: { [pattern: string]: number };
  helpSeekingBehavior: number;
  persistenceLevel: number;
  collaborationLevel: number;
  selfRegulation: number;
  motivationLevel: number;
}

export interface AnalyticsInsight {
  id: string;
  type: 'strength' | 'weakness' | 'opportunity' | 'trend' | 'anomaly';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  actionable: boolean;
  relatedMetrics: string[];
}

export interface VisualizationData {
  id: string;
  type: 'line' | 'bar' | 'pie' | 'scatter' | 'heatmap' | 'radar';
  title: string;
  data: any;
  config: any;
  insights?: string[];
}

export class LearningAnalytics {
  private static sessions: Map<string, LearningSession[]> = new Map();
  private static progress: Map<string, LearningProgress[]> = new Map();
  private static reports: Map<string, AnalyticsReport> = new Map();

  // 記錄學習會話
  static recordSession(session: LearningSession): void {
    const userSessions = this.sessions.get(session.userId) || [];
    userSessions.push(session);
    this.sessions.set(session.userId, userSessions);

    // 更新學習進度
    this.updateLearningProgress(session);
  }

  // 記錄用戶交互
  static recordInteraction(interaction: UserInteraction): void {
    const userSessions = this.sessions.get(interaction.sessionId.split('_')[0]) || [];
    const session = userSessions.find(s => s.id === interaction.sessionId);
    
    if (session) {
      session.interactions.push(interaction);
    }
  }

  // 更新學習進度
  private static updateLearningProgress(session: LearningSession): void {
    const userProgress = this.progress.get(session.userId) || [];
    
    // 這裡應該根據活動的主題和技能來更新進度
    // 簡化實現
    const existingProgress = userProgress.find(p => p.topic === 'general');
    
    if (existingProgress) {
      existingProgress.completedActivities++;
      existingProgress.totalTimeSpent += session.duration;
      existingProgress.averageScore = (existingProgress.averageScore + (session.score / session.maxScore * 100)) / 2;
      existingProgress.lastActiveDate = new Date();
    } else {
      const newProgress: LearningProgress = {
        userId: session.userId,
        subject: 'general',
        topic: 'general',
        skillLevel: session.score / session.maxScore * 100,
        masteryLevel: 'beginner',
        completedActivities: 1,
        totalTimeSpent: session.duration,
        averageScore: session.score / session.maxScore * 100,
        improvementRate: 0,
        lastActiveDate: new Date(),
        streakDays: 1,
        achievements: []
      };
      
      userProgress.push(newProgress);
    }
    
    this.progress.set(session.userId, userProgress);
  }

  // 生成個人報告
  static async generateIndividualReport(
    userId: string,
    timeRange: { start: Date; end: Date },
    subjects?: string[]
  ): Promise<AnalyticsReport> {
    const userSessions = this.getUserSessions(userId, timeRange);
    const userProgress = this.progress.get(userId) || [];

    const metrics = this.calculateMetrics(userSessions, userProgress);
    const insights = this.generateInsights(metrics, 'individual');
    const recommendations = this.generateRecommendations(insights, userProgress);
    const visualizations = this.createVisualizations(metrics, 'individual');

    const report: AnalyticsReport = {
      id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'individual',
      title: `個人學習報告 - ${userId}`,
      description: `${timeRange.start.toLocaleDateString()} 至 ${timeRange.end.toLocaleDateString()} 的學習分析`,
      timeRange,
      subjects: subjects || ['all'],
      metrics,
      insights,
      recommendations,
      visualizations,
      generatedAt: new Date(),
      generatedBy: 'system'
    };

    this.reports.set(report.id, report);
    return report;
  }

  // 生成群組報告
  static async generateGroupReport(
    userIds: string[],
    timeRange: { start: Date; end: Date },
    subjects?: string[]
  ): Promise<AnalyticsReport> {
    const allSessions: LearningSession[] = [];
    const allProgress: LearningProgress[] = [];

    userIds.forEach(userId => {
      const userSessions = this.getUserSessions(userId, timeRange);
      const userProgress = this.progress.get(userId) || [];
      allSessions.push(...userSessions);
      allProgress.push(...userProgress);
    });

    const metrics = this.calculateMetrics(allSessions, allProgress);
    const insights = this.generateInsights(metrics, 'group');
    const recommendations = this.generateRecommendations(insights, allProgress);
    const visualizations = this.createVisualizations(metrics, 'group');

    const report: AnalyticsReport = {
      id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'group',
      title: `群組學習報告 (${userIds.length} 位學習者)`,
      description: `${timeRange.start.toLocaleDateString()} 至 ${timeRange.end.toLocaleDateString()} 的群組分析`,
      timeRange,
      subjects: subjects || ['all'],
      metrics,
      insights,
      recommendations,
      visualizations,
      generatedAt: new Date(),
      generatedBy: 'system'
    };

    this.reports.set(report.id, report);
    return report;
  }

  // 生成活動報告
  static async generateActivityReport(
    activityId: string,
    timeRange: { start: Date; end: Date }
  ): Promise<AnalyticsReport> {
    const activitySessions = this.getActivitySessions(activityId, timeRange);
    const metrics = this.calculateActivityMetrics(activitySessions);
    const insights = this.generateInsights(metrics, 'activity');
    const recommendations = this.generateActivityRecommendations(insights, activitySessions);
    const visualizations = this.createVisualizations(metrics, 'activity');

    const report: AnalyticsReport = {
      id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'activity',
      title: `活動分析報告 - ${activityId}`,
      description: `${timeRange.start.toLocaleDateString()} 至 ${timeRange.end.toLocaleDateString()} 的活動表現`,
      timeRange,
      subjects: ['activity'],
      metrics,
      insights,
      recommendations,
      visualizations,
      generatedAt: new Date(),
      generatedBy: 'system'
    };

    this.reports.set(report.id, report);
    return report;
  }

  // 獲取用戶會話
  private static getUserSessions(userId: string, timeRange: { start: Date; end: Date }): LearningSession[] {
    const userSessions = this.sessions.get(userId) || [];
    return userSessions.filter(session => 
      session.startTime >= timeRange.start && session.startTime <= timeRange.end
    );
  }

  // 獲取活動會話
  private static getActivitySessions(activityId: string, timeRange: { start: Date; end: Date }): LearningSession[] {
    const allSessions: LearningSession[] = [];
    
    this.sessions.forEach(userSessions => {
      const activitySessions = userSessions.filter(session =>
        session.activityId === activityId &&
        session.startTime >= timeRange.start &&
        session.startTime <= timeRange.end
      );
      allSessions.push(...activitySessions);
    });
    
    return allSessions;
  }

  // 計算指標
  private static calculateMetrics(sessions: LearningSession[], progress: LearningProgress[]): ReportMetrics {
    const engagement = this.calculateEngagementMetrics(sessions);
    const performance = this.calculatePerformanceMetrics(sessions);
    const learning = this.calculateLearningMetrics(progress);
    const behavioral = this.calculateBehavioralMetrics(sessions);

    return { engagement, performance, learning, behavioral };
  }

  // 計算參與度指標
  private static calculateEngagementMetrics(sessions: LearningSession[]): EngagementMetrics {
    const totalSessions = sessions.length;
    const totalTimeSpent = sessions.reduce((sum, s) => sum + s.duration, 0);
    const averageSessionDuration = totalSessions > 0 ? totalTimeSpent / totalSessions : 0;
    const completionRate = sessions.filter(s => s.completed).length / totalSessions;
    
    // 簡化的設備分佈計算
    const deviceDistribution: { [device: string]: number } = {};
    sessions.forEach(session => {
      const device = session.metadata.device || 'unknown';
      deviceDistribution[device] = (deviceDistribution[device] || 0) + 1;
    });

    return {
      totalSessions,
      totalTimeSpent,
      averageSessionDuration,
      completionRate,
      returnRate: 0.75, // 簡化值
      activeUsers: new Set(sessions.map(s => s.userId)).size,
      peakUsageHours: [14, 15, 16, 20, 21], // 簡化值
      deviceDistribution
    };
  }

  // 計算表現指標
  private static calculatePerformanceMetrics(sessions: LearningSession[]): PerformanceMetrics {
    const scores = sessions.map(s => s.score / s.maxScore * 100);
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    
    const scoreDistribution: { [range: string]: number } = {
      '0-20': 0, '21-40': 0, '41-60': 0, '61-80': 0, '81-100': 0
    };
    
    scores.forEach(score => {
      if (score <= 20) scoreDistribution['0-20']++;
      else if (score <= 40) scoreDistribution['21-40']++;
      else if (score <= 60) scoreDistribution['41-60']++;
      else if (score <= 80) scoreDistribution['61-80']++;
      else scoreDistribution['81-100']++;
    });

    return {
      averageScore,
      scoreDistribution,
      improvementRate: 0.15, // 簡化值
      masteryRate: 0.68, // 簡化值
      errorPatterns: {}, // 簡化
      timeToCompletion: sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length,
      attemptsPerActivity: sessions.reduce((sum, s) => sum + s.attempts, 0) / sessions.length
    };
  }

  // 計算學習指標
  private static calculateLearningMetrics(progress: LearningProgress[]): LearningMetrics {
    const skillProgression: { [skill: string]: number } = {};
    const topicMastery: { [topic: string]: number } = {};
    
    progress.forEach(p => {
      skillProgression[p.subject] = p.skillLevel;
      topicMastery[p.topic] = p.averageScore;
    });

    return {
      skillProgression,
      topicMastery,
      learningVelocity: 0.8, // 簡化值
      retentionRate: 0.85, // 簡化值
      transferRate: 0.72, // 簡化值
      conceptualUnderstanding: 0.78 // 簡化值
    };
  }

  // 計算行為指標
  private static calculateBehavioralMetrics(sessions: LearningSession[]): BehavioralMetrics {
    return {
      interactionPatterns: {}, // 簡化
      helpSeekingBehavior: 0.3, // 簡化值
      persistenceLevel: 0.75, // 簡化值
      collaborationLevel: 0.45, // 簡化值
      selfRegulation: 0.68, // 簡化值
      motivationLevel: 0.82 // 簡化值
    };
  }

  // 計算活動指標
  private static calculateActivityMetrics(sessions: LearningSession[]): ReportMetrics {
    // 重用現有的計算方法
    return this.calculateMetrics(sessions, []);
  }

  // 生成洞察
  private static generateInsights(metrics: ReportMetrics, reportType: string): AnalyticsInsight[] {
    const insights: AnalyticsInsight[] = [];

    // 參與度洞察
    if (metrics.engagement.completionRate > 0.8) {
      insights.push({
        id: 'high_completion',
        type: 'strength',
        title: '高完成率',
        description: `完成率達到 ${Math.round(metrics.engagement.completionRate * 100)}%，表現優秀`,
        confidence: 0.9,
        impact: 'high',
        actionable: false,
        relatedMetrics: ['completionRate']
      });
    }

    // 表現洞察
    if (metrics.performance.averageScore < 60) {
      insights.push({
        id: 'low_performance',
        type: 'weakness',
        title: '表現需要改進',
        description: `平均分數為 ${Math.round(metrics.performance.averageScore)}%，低於預期`,
        confidence: 0.85,
        impact: 'high',
        actionable: true,
        relatedMetrics: ['averageScore']
      });
    }

    // 學習洞察
    if (metrics.learning.learningVelocity > 0.7) {
      insights.push({
        id: 'good_velocity',
        type: 'strength',
        title: '學習速度良好',
        description: '學習進度穩定，知識吸收效率高',
        confidence: 0.8,
        impact: 'medium',
        actionable: false,
        relatedMetrics: ['learningVelocity']
      });
    }

    return insights;
  }

  // 生成建議
  private static generateRecommendations(insights: AnalyticsInsight[], progress: LearningProgress[]): string[] {
    const recommendations: string[] = [];

    insights.forEach(insight => {
      if (insight.actionable) {
        switch (insight.type) {
          case 'weakness':
            if (insight.id === 'low_performance') {
              recommendations.push('建議增加練習時間，專注於薄弱環節');
              recommendations.push('考慮調整學習策略，使用更多互動式內容');
            }
            break;
          case 'opportunity':
            recommendations.push('發現學習機會，建議探索相關進階主題');
            break;
        }
      }
    });

    if (recommendations.length === 0) {
      recommendations.push('繼續保持良好的學習習慣');
    }

    return recommendations;
  }

  // 生成活動建議
  private static generateActivityRecommendations(insights: AnalyticsInsight[], sessions: LearningSession[]): string[] {
    const recommendations: string[] = [];

    const avgScore = sessions.reduce((sum, s) => sum + s.score / s.maxScore, 0) / sessions.length;
    
    if (avgScore < 0.6) {
      recommendations.push('考慮降低活動難度或提供更多提示');
    }
    
    const avgDuration = sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length;
    if (avgDuration > 1800) { // 30分鐘
      recommendations.push('活動時間較長，考慮分解為較小的模塊');
    }

    return recommendations;
  }

  // 創建可視化數據
  private static createVisualizations(metrics: ReportMetrics, reportType: string): VisualizationData[] {
    const visualizations: VisualizationData[] = [];

    // 分數分佈圖
    visualizations.push({
      id: 'score_distribution',
      type: 'bar',
      title: '分數分佈',
      data: {
        labels: Object.keys(metrics.performance.scoreDistribution),
        datasets: [{
          label: '學習者數量',
          data: Object.values(metrics.performance.scoreDistribution),
          backgroundColor: 'rgba(54, 162, 235, 0.6)'
        }]
      },
      config: {
        responsive: true,
        plugins: {
          title: { display: true, text: '分數分佈圖' }
        }
      }
    });

    // 參與度趨勢圖
    visualizations.push({
      id: 'engagement_trend',
      type: 'line',
      title: '參與度趨勢',
      data: {
        labels: ['週一', '週二', '週三', '週四', '週五', '週六', '週日'],
        datasets: [{
          label: '活躍用戶',
          data: [65, 59, 80, 81, 56, 55, 40],
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        }]
      },
      config: {
        responsive: true,
        plugins: {
          title: { display: true, text: '每日參與度趨勢' }
        }
      }
    });

    return visualizations;
  }

  // 獲取報告
  static getReport(reportId: string): AnalyticsReport | null {
    return this.reports.get(reportId) || null;
  }

  // 獲取用戶進度
  static getUserProgress(userId: string): LearningProgress[] {
    return this.progress.get(userId) || [];
  }

  // 獲取學習統計
  static getLearningStats(): any {
    const totalSessions = Array.from(this.sessions.values()).reduce((sum, sessions) => sum + sessions.length, 0);
    const totalUsers = this.sessions.size;
    const totalProgress = Array.from(this.progress.values()).reduce((sum, progress) => sum + progress.length, 0);

    return {
      totalSessions,
      totalUsers,
      totalProgress,
      totalReports: this.reports.size
    };
  }
}
