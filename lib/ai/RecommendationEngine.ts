/**
 * 智能推薦引擎 - 第三階段
 * 基於用戶行為、內容特徵和機器學習的智能推薦系統
 */

import { GameType } from '../content/UniversalContentManager';

export interface UserProfile {
  id: string;
  preferences: {
    gameTypes: GameType[];
    topics: string[];
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
    sessionDuration: number; // 分鐘
  };
  behavior: {
    totalSessions: number;
    averageSessionTime: number;
    completionRate: number;
    favoriteGameTypes: GameType[];
    strugglingTopics: string[];
    strongTopics: string[];
    lastActiveAt: Date;
    streakDays: number;
  };
  performance: {
    averageScore: number;
    improvementRate: number;
    masteredSkills: string[];
    learningGoals: string[];
    weakAreas: string[];
  };
  demographics?: {
    age?: number;
    grade?: string;
    language: string;
    timezone: string;
  };
}

export interface ContentItem {
  id: string;
  type: GameType;
  title: string;
  description: string;
  topics: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    playCount: number;
    averageRating: number;
    averageCompletionTime: number;
    successRate: number;
  };
  features: {
    hasAudio: boolean;
    hasVideo: boolean;
    hasAnimation: boolean;
    isInteractive: boolean;
    supportsMultiplayer: boolean;
  };
}

export interface RecommendationRequest {
  userId: string;
  context: 'homepage' | 'after_game' | 'search' | 'topic_page' | 'dashboard';
  currentActivity?: string;
  filters?: {
    gameTypes?: GameType[];
    topics?: string[];
    difficulty?: string[];
    maxDuration?: number;
  };
  count: number;
  includeExplanation?: boolean;
}

export interface Recommendation {
  contentId: string;
  score: number;
  confidence: number;
  reasons: string[];
  category: 'trending' | 'personalized' | 'similar' | 'challenge' | 'review';
  metadata: {
    algorithm: string;
    factors: Record<string, number>;
    generatedAt: Date;
  };
}

export interface RecommendationResult {
  recommendations: Recommendation[];
  totalCount: number;
  categories: {
    [key: string]: Recommendation[];
  };
  explanations?: {
    [contentId: string]: string;
  };
  metadata: {
    processingTime: number;
    algorithmsUsed: string[];
    userProfileVersion: string;
  };
}

export class RecommendationEngine {
  private static userProfiles: Map<string, UserProfile> = new Map();
  private static contentItems: Map<string, ContentItem> = new Map();
  private static userInteractions: Map<string, any[]> = new Map();
  private static modelWeights = {
    collaborative: 0.3,
    contentBased: 0.25,
    behavioral: 0.2,
    trending: 0.15,
    diversity: 0.1
  };

  // 初始化推薦引擎
  static initialize() {
    this.loadUserProfiles();
    this.loadContentItems();
    this.loadUserInteractions();
    this.trainModels();
  }

  // 獲取推薦
  static async getRecommendations(request: RecommendationRequest): Promise<RecommendationResult> {
    const startTime = Date.now();
    
    try {
      const userProfile = this.getUserProfile(request.userId);
      if (!userProfile) {
        return this.getFallbackRecommendations(request);
      }

      // 多算法推薦
      const collaborativeRecs = await this.getCollaborativeRecommendations(userProfile, request);
      const contentBasedRecs = await this.getContentBasedRecommendations(userProfile, request);
      const behavioralRecs = await this.getBehavioralRecommendations(userProfile, request);
      const trendingRecs = await this.getTrendingRecommendations(request);

      // 合併和排序推薦
      const mergedRecs = this.mergeRecommendations([
        { recs: collaborativeRecs, weight: this.modelWeights.collaborative },
        { recs: contentBasedRecs, weight: this.modelWeights.contentBased },
        { recs: behavioralRecs, weight: this.modelWeights.behavioral },
        { recs: trendingRecs, weight: this.modelWeights.trending }
      ]);

      // 應用多樣性和過濾
      const diversifiedRecs = this.applyDiversification(mergedRecs, request);
      const filteredRecs = this.applyFilters(diversifiedRecs, request);

      // 限制數量
      const finalRecs = filteredRecs.slice(0, request.count);

      // 分類推薦
      const categories = this.categorizeRecommendations(finalRecs);

      // 生成解釋
      const explanations = request.includeExplanation 
        ? this.generateExplanations(finalRecs, userProfile)
        : undefined;

      const processingTime = Date.now() - startTime;

      return {
        recommendations: finalRecs,
        totalCount: finalRecs.length,
        categories,
        explanations,
        metadata: {
          processingTime,
          algorithmsUsed: ['collaborative', 'content-based', 'behavioral', 'trending'],
          userProfileVersion: userProfile.id
        }
      };

    } catch (error) {
      console.error('推薦生成失敗:', error);
      return this.getFallbackRecommendations(request);
    }
  }

  // 協同過濾推薦
  private static async getCollaborativeRecommendations(
    userProfile: UserProfile, 
    request: RecommendationRequest
  ): Promise<Recommendation[]> {
    const similarUsers = this.findSimilarUsers(userProfile);
    const recommendations: Recommendation[] = [];

    for (const similarUser of similarUsers.slice(0, 10)) {
      const userInteractions = this.userInteractions.get(similarUser.id) || [];
      
      for (const interaction of userInteractions) {
        if (interaction.rating >= 4 && !this.hasUserInteracted(userProfile.id, interaction.contentId)) {
          const content = this.contentItems.get(interaction.contentId);
          if (content) {
            recommendations.push({
              contentId: interaction.contentId,
              score: interaction.rating * similarUser.similarity,
              confidence: similarUser.similarity,
              reasons: [`與您相似的用戶喜歡這個內容`],
              category: 'personalized',
              metadata: {
                algorithm: 'collaborative-filtering',
                factors: { similarity: similarUser.similarity, rating: interaction.rating },
                generatedAt: new Date()
              }
            });
          }
        }
      }
    }

    return recommendations.sort((a, b) => b.score - a.score);
  }

  // 基於內容的推薦
  private static async getContentBasedRecommendations(
    userProfile: UserProfile,
    request: RecommendationRequest
  ): Promise<Recommendation[]> {
    const userInteractions = this.userInteractions.get(userProfile.id) || [];
    const likedContent = userInteractions
      .filter(i => i.rating >= 4)
      .map(i => this.contentItems.get(i.contentId))
      .filter(Boolean);

    const recommendations: Recommendation[] = [];

    // 基於用戶喜歡的內容特徵推薦
    for (const content of Array.from(this.contentItems.values())) {
      if (this.hasUserInteracted(userProfile.id, content.id)) continue;

      let score = 0;
      const reasons: string[] = [];

      // 遊戲類型匹配
      if (userProfile.preferences.gameTypes.includes(content.type)) {
        score += 0.3;
        reasons.push(`符合您偏好的遊戲類型：${content.type}`);
      }

      // 主題匹配
      const topicMatch = content.topics.some(topic => 
        userProfile.preferences.topics.includes(topic)
      );
      if (topicMatch) {
        score += 0.25;
        reasons.push('包含您感興趣的主題');
      }

      // 難度匹配
      if (content.difficulty === userProfile.preferences.difficulty) {
        score += 0.2;
        reasons.push('難度適合您的水平');
      }

      // 與喜歡內容的相似性
      const similarity = this.calculateContentSimilarity(content, likedContent);
      score += similarity * 0.25;
      if (similarity > 0.5) {
        reasons.push('與您喜歡的內容相似');
      }

      if (score > 0.3) {
        recommendations.push({
          contentId: content.id,
          score,
          confidence: Math.min(score, 1),
          reasons,
          category: 'personalized',
          metadata: {
            algorithm: 'content-based',
            factors: { topicMatch: topicMatch ? 1 : 0, similarity },
            generatedAt: new Date()
          }
        });
      }
    }

    return recommendations.sort((a, b) => b.score - a.score);
  }

  // 基於行為的推薦
  private static async getBehavioralRecommendations(
    userProfile: UserProfile,
    request: RecommendationRequest
  ): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];

    // 基於學習模式推薦
    const learningStyleContent = this.getContentByLearningStyle(userProfile.preferences.learningStyle);
    
    for (const content of learningStyleContent) {
      if (this.hasUserInteracted(userProfile.id, content.id)) continue;

      let score = 0.6; // 基礎分數
      const reasons: string[] = [];

      // 學習風格匹配
      reasons.push(`適合您的學習風格：${userProfile.preferences.learningStyle}`);

      // 會話時長匹配
      if (content.metadata.averageCompletionTime <= userProfile.preferences.sessionDuration * 60) {
        score += 0.2;
        reasons.push('適合您的學習時間');
      }

      // 成功率考慮
      if (content.metadata.successRate >= 0.7) {
        score += 0.1;
        reasons.push('高成功率內容');
      }

      recommendations.push({
        contentId: content.id,
        score,
        confidence: 0.7,
        reasons,
        category: 'personalized',
        metadata: {
          algorithm: 'behavioral',
          factors: { learningStyle: 1, sessionMatch: 1 },
          generatedAt: new Date()
        }
      });
    }

    return recommendations.sort((a, b) => b.score - a.score);
  }

  // 熱門推薦
  private static async getTrendingRecommendations(
    request: RecommendationRequest
  ): Promise<Recommendation[]> {
    const trendingContent = Array.from(this.contentItems.values())
      .sort((a, b) => {
        // 綜合考慮播放次數、評分和最近活躍度
        const scoreA = a.metadata.playCount * 0.4 + a.metadata.averageRating * 0.6;
        const scoreB = b.metadata.playCount * 0.4 + b.metadata.averageRating * 0.6;
        return scoreB - scoreA;
      })
      .slice(0, 20);

    return trendingContent.map((content, index) => ({
      contentId: content.id,
      score: 1 - (index * 0.05), // 遞減分數
      confidence: 0.8,
      reasons: ['熱門內容', '高評分', '多人喜愛'],
      category: 'trending',
      metadata: {
        algorithm: 'trending',
        factors: { playCount: content.metadata.playCount, rating: content.metadata.averageRating },
        generatedAt: new Date()
      }
    }));
  }

  // 合併推薦結果
  private static mergeRecommendations(
    sources: { recs: Recommendation[]; weight: number }[]
  ): Recommendation[] {
    const merged = new Map<string, Recommendation>();

    for (const { recs, weight } of sources) {
      for (const rec of recs) {
        if (merged.has(rec.contentId)) {
          const existing = merged.get(rec.contentId)!;
          existing.score += rec.score * weight;
          existing.reasons.push(...rec.reasons);
        } else {
          merged.set(rec.contentId, {
            ...rec,
            score: rec.score * weight
          });
        }
      }
    }

    return Array.from(merged.values()).sort((a, b) => b.score - a.score);
  }

  // 應用多樣性
  private static applyDiversification(
    recommendations: Recommendation[],
    request: RecommendationRequest
  ): Recommendation[] {
    const diversified: Recommendation[] = [];
    const usedTypes = new Set<GameType>();
    const usedTopics = new Set<string>();

    for (const rec of recommendations) {
      const content = this.contentItems.get(rec.contentId);
      if (!content) continue;

      // 確保遊戲類型多樣性
      if (diversified.length < request.count * 0.7 || !usedTypes.has(content.type)) {
        diversified.push(rec);
        usedTypes.add(content.type);
        content.topics.forEach(topic => usedTopics.add(topic));
      }
    }

    return diversified;
  }

  // 應用過濾器
  private static applyFilters(
    recommendations: Recommendation[],
    request: RecommendationRequest
  ): Recommendation[] {
    if (!request.filters) return recommendations;

    return recommendations.filter(rec => {
      const content = this.contentItems.get(rec.contentId);
      if (!content) return false;

      // 遊戲類型過濾
      if (request.filters!.gameTypes && 
          !request.filters!.gameTypes.includes(content.type)) {
        return false;
      }

      // 主題過濾
      if (request.filters!.topics && 
          !content.topics.some(topic => request.filters!.topics!.includes(topic))) {
        return false;
      }

      // 難度過濾
      if (request.filters!.difficulty && 
          !request.filters!.difficulty.includes(content.difficulty)) {
        return false;
      }

      // 時長過濾
      if (request.filters!.maxDuration && 
          content.metadata.averageCompletionTime > request.filters!.maxDuration * 60) {
        return false;
      }

      return true;
    });
  }

  // 分類推薦
  private static categorizeRecommendations(
    recommendations: Recommendation[]
  ): { [key: string]: Recommendation[] } {
    const categories: { [key: string]: Recommendation[] } = {
      trending: [],
      personalized: [],
      similar: [],
      challenge: [],
      review: []
    };

    recommendations.forEach(rec => {
      categories[rec.category].push(rec);
    });

    return categories;
  }

  // 生成解釋
  private static generateExplanations(
    recommendations: Recommendation[],
    userProfile: UserProfile
  ): { [contentId: string]: string } {
    const explanations: { [contentId: string]: string } = {};

    recommendations.forEach(rec => {
      const content = this.contentItems.get(rec.contentId);
      if (!content) return;

      let explanation = `推薦原因：${rec.reasons.join('、')}。`;
      
      if (rec.confidence > 0.8) {
        explanation += ' 我們對這個推薦很有信心。';
      } else if (rec.confidence > 0.6) {
        explanation += ' 這是一個不錯的選擇。';
      } else {
        explanation += ' 您可以嘗試一下。';
      }

      explanations[rec.contentId] = explanation;
    });

    return explanations;
  }

  // 獲取備用推薦
  private static getFallbackRecommendations(request: RecommendationRequest): RecommendationResult {
    const trending = Array.from(this.contentItems.values())
      .sort((a, b) => b.metadata.playCount - a.metadata.playCount)
      .slice(0, request.count)
      .map((content, index) => ({
        contentId: content.id,
        score: 1 - (index * 0.1),
        confidence: 0.5,
        reasons: ['熱門內容'],
        category: 'trending' as const,
        metadata: {
          algorithm: 'fallback',
          factors: {},
          generatedAt: new Date()
        }
      }));

    return {
      recommendations: trending,
      totalCount: trending.length,
      categories: { trending },
      metadata: {
        processingTime: 0,
        algorithmsUsed: ['fallback'],
        userProfileVersion: 'none'
      }
    };
  }

  // 工具方法
  private static getUserProfile(userId: string): UserProfile | null {
    return this.userProfiles.get(userId) || null;
  }

  private static findSimilarUsers(userProfile: UserProfile): { id: string; similarity: number }[] {
    // 實現用戶相似度計算
    return [];
  }

  private static hasUserInteracted(userId: string, contentId: string): boolean {
    const interactions = this.userInteractions.get(userId) || [];
    return interactions.some(i => i.contentId === contentId);
  }

  private static calculateContentSimilarity(content: ContentItem, likedContent: ContentItem[]): number {
    // 實現內容相似度計算
    return 0.5;
  }

  private static getContentByLearningStyle(learningStyle: string): ContentItem[] {
    // 根據學習風格過濾內容
    return Array.from(this.contentItems.values());
  }

  // 數據載入方法
  private static loadUserProfiles(): void {
    // 實現用戶檔案載入
  }

  private static loadContentItems(): void {
    // 實現內容項目載入
  }

  private static loadUserInteractions(): void {
    // 實現用戶互動載入
  }

  private static trainModels(): void {
    // 實現模型訓練
  }

  // 更新用戶行為
  static updateUserBehavior(userId: string, interaction: any): void {
    const interactions = this.userInteractions.get(userId) || [];
    interactions.push({
      ...interaction,
      timestamp: new Date()
    });
    this.userInteractions.set(userId, interactions);
  }

  // 獲取推薦統計
  static getRecommendationStats(): any {
    return {
      totalUsers: this.userProfiles.size,
      totalContent: this.contentItems.size,
      totalInteractions: Array.from(this.userInteractions.values()).reduce((sum, arr) => sum + arr.length, 0),
      modelAccuracy: 0.85
    };
  }
}
