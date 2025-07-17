/**
 * 智能推薦組件
 * 顯示個性化推薦內容和解釋
 */
import React, { useState, useEffect } from 'react';
import { 
  RecommendationEngine, 
  RecommendationRequest, 
  RecommendationResult,
  Recommendation 
} from '../../lib/ai/RecommendationEngine';
import { GameType } from '../../lib/content/UniversalContentManager';
interface SmartRecommendationsProps {
  userId: string;
  context: 'homepage' | 'after_game' | 'search' | 'topic_page' | 'dashboard';
  currentActivity?: string;
  onActivitySelect?: (activityId: string) => void;
  showExplanations?: boolean;
  maxItems?: number;
}
export default function SmartRecommendations({
  userId,
  context,
  currentActivity,
  onActivitySelect,
  showExplanations = true,
  maxItems = 12
}: SmartRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<RecommendationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [filters, setFilters] = useState<{
    gameTypes: GameType[];
    difficulty: string[];
    maxDuration?: number;
  }>({
    gameTypes: [],
    difficulty: []
  });
  // 載入推薦
  useEffect(() => {
    loadRecommendations();
  }, [userId, context, currentActivity, filters]);
  const loadRecommendations = async () => {
    setLoading(true);
    try {
      const request: RecommendationRequest = {
        userId,
        context,
        currentActivity,
        filters: filters.gameTypes.length > 0 || filters.difficulty.length > 0 ? filters : undefined,
        count: maxItems,
        includeExplanation: showExplanations
      };
      const result = await RecommendationEngine.getRecommendations(request);
      setRecommendations(result);
      // 設置默認活躍類別
      if (result.categories) {
        const categories = Object.keys(result.categories).filter(cat => result.categories[cat].length > 0);
        if (categories.length > 0) {
          setActiveCategory(categories[0]);
        }
      }
    } catch (error) {
      console.error('載入推薦失敗:', error);
    } finally {
      setLoading(false);
    }
  };
  // 處理活動選擇
  const handleActivitySelect = (recommendation: Recommendation) => {
    // 記錄用戶行為
    RecommendationEngine.updateUserBehavior(userId, {
      type: 'click',
      contentId: recommendation.contentId,
      context,
      recommendationScore: recommendation.score,
      category: recommendation.category
    });
    onActivitySelect?.(recommendation.contentId);
  };
  // 獲取當前顯示的推薦
  const getCurrentRecommendations = (): Recommendation[] => {
    if (!recommendations) return [];
    if (activeCategory === 'all') {
      return recommendations.recommendations;
    }
    return recommendations.categories[activeCategory] || [];
  };
  // 獲取類別標籤
  const getCategoryLabel = (category: string): string => {
    const labels: { [key: string]: string } = {
      all: '全部推薦',
      trending: '熱門內容',
      personalized: '為您推薦',
      similar: '相似內容',
      challenge: '挑戰內容',
      review: '複習內容'
    };
    return labels[category] || category;
  };
  // 獲取類別圖標
  const getCategoryIcon = (category: string): string => {
    const icons: { [key: string]: string } = {
      all: '🎯',
      trending: '🔥',
      personalized: '✨',
      similar: '🔗',
      challenge: '💪',
      review: '📚'
    };
    return icons[category] || '📋';
  };
  // 獲取信心度顏色
  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-100';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  if (!recommendations || recommendations.recommendations.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <div className="text-gray-400 text-4xl mb-2">🤖</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">暫無推薦內容</h3>
        <p className="text-gray-600">請先完成一些活動，我們將為您提供個性化推薦</p>
      </div>
    );
  }
  return (
    <div className="bg-white rounded-lg shadow">
      {/* 頭部 */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">🤖 智能推薦</h2>
            <p className="text-gray-600 text-sm mt-1">
              基於您的學習偏好和行為的個性化推薦
            </p>
          </div>
          <div className="text-sm text-gray-500">
            {recommendations.metadata.processingTime}ms
          </div>
        </div>
        {/* 類別標籤 */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              activeCategory === 'all'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            🎯 全部 ({recommendations.recommendations.length})
          </button>
          {Object.entries(recommendations.categories).map(([category, recs]) => {
            if (recs.length === 0) return null;
            return (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === category
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {getCategoryIcon(category)} {getCategoryLabel(category)} ({recs.length})
              </button>
            );
          })}
        </div>
      </div>
      {/* 推薦內容 */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {getCurrentRecommendations().map((recommendation) => (
            <RecommendationCard
              key={recommendation.contentId}
              recommendation={recommendation}
              explanation={recommendations.explanations?.[recommendation.contentId]}
              showExplanation={showExplanations}
              onClick={() => handleActivitySelect(recommendation)}
            />
          ))}
        </div>
        {getCurrentRecommendations().length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-400 text-3xl mb-2">📭</div>
            <p className="text-gray-600">此類別暫無推薦內容</p>
          </div>
        )}
      </div>
      {/* 統計信息 */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>
            使用算法: {recommendations.metadata.algorithmsUsed.join(', ')}
          </div>
          <div>
            共 {recommendations.totalCount} 個推薦
          </div>
        </div>
      </div>
    </div>
  );
}
// 推薦卡片組件
function RecommendationCard({
  recommendation,
  explanation,
  showExplanation,
  onClick
}: {
  recommendation: Recommendation;
  explanation?: string;
  showExplanation: boolean;
  onClick: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);
  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-100';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };
  const getCategoryIcon = (category: string): string => {
    const icons: { [key: string]: string } = {
      trending: '🔥',
      personalized: '✨',
      similar: '🔗',
      challenge: '💪',
      review: '📚'
    };
    return icons[category] || '📋';
  };
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
      <div onClick={onClick}>
        {/* 頭部信息 */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{getCategoryIcon(recommendation.category)}</span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${getConfidenceColor(recommendation.confidence)}`}>
              {Math.round(recommendation.confidence * 100)}%
            </span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowDetails(!showDetails);
            }}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
        {/* 內容信息 */}
        <div className="mb-3">
          <h4 className="font-medium text-gray-900 mb-1">
            內容 ID: {recommendation.contentId}
          </h4>
          <div className="text-sm text-gray-600">
            分數: {recommendation.score.toFixed(2)}
          </div>
        </div>
        {/* 推薦原因 */}
        <div className="mb-3">
          <div className="text-xs text-gray-500 mb-1">推薦原因:</div>
          <div className="flex flex-wrap gap-1">
            {recommendation.reasons.slice(0, 2).map((reason, index) => (
              <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                {reason}
              </span>
            ))}
            {recommendation.reasons.length > 2 && (
              <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded">
                +{recommendation.reasons.length - 2}
              </span>
            )}
          </div>
        </div>
        {/* 解釋 */}
        {showExplanation && explanation && (
          <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
            {explanation}
          </div>
        )}
      </div>
      {/* 詳細信息 */}
      {showDetails && (
        <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-600">
          <div className="space-y-1">
            <div>算法: {recommendation.metadata.algorithm}</div>
            <div>生成時間: {recommendation.metadata.generatedAt.toLocaleTimeString()}</div>
            <div>所有原因: {recommendation.reasons.join(', ')}</div>
            {Object.keys(recommendation.metadata.factors).length > 0 && (
              <div>
                因子: {JSON.stringify(recommendation.metadata.factors)}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
