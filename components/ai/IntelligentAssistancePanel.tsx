/**
 * AI智能輔助面板組件
 * 提供內容推薦、難度調整、個人化學習和無障礙輔助的統一界面
 */

import React, { useState, useEffect } from 'react';
import { RecommendationType } from '../../lib/ai/IntelligentRecommendationEngine';
import { DifficultyStrategy } from '../../lib/ai/AdaptiveDifficultyAI';
import { AccessibilityNeed } from '../../lib/ai/AIAccessibilityHelper';

interface IntelligentAssistancePanelProps {
  userId: string;
  currentContent?: any;
  onRecommendationSelect?: (recommendation: any) => void;
  onDifficultyAdjust?: (adjustment: any) => void;
  onContentAdapt?: (adaptation: any) => void;
}

export default function IntelligentAssistancePanel({
  userId,
  currentContent,
  onRecommendationSelect,
  onDifficultyAdjust,
  onContentAdapt
}: IntelligentAssistancePanelProps) {
  const [activeTab, setActiveTab] = useState<'recommendations' | 'difficulty' | 'learning' | 'accessibility'>('recommendations');
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [difficultyAnalysis, setDifficultyAnalysis] = useState<any>(null);
  const [learningPath, setLearningPath] = useState<any>(null);
  const [accessibilityProfile, setAccessibilityProfile] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // 載入推薦內容
  const loadRecommendations = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/ai/intelligent-assistance?action=recommendations&maxRecommendations=10`);
      
      if (!response.ok) {
        throw new Error('載入推薦失敗');
      }

      const data = await response.json();
      setRecommendations(data.data.recommendations || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : '載入推薦時發生錯誤');
    } finally {
      setIsLoading(false);
    }
  };

  // 載入難度分析
  const loadDifficultyAnalysis = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/ai/intelligent-assistance?action=difficulty-analysis`);
      
      if (!response.ok) {
        throw new Error('載入難度分析失敗');
      }

      const data = await response.json();
      setDifficultyAnalysis(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '載入難度分析時發生錯誤');
    } finally {
      setIsLoading(false);
    }
  };

  // 載入無障礙配置
  const loadAccessibilityProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/ai/intelligent-assistance?action=accessibility-profile`);
      
      if (!response.ok) {
        throw new Error('載入無障礙配置失敗');
      }

      const data = await response.json();
      setAccessibilityProfile(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '載入無障礙配置時發生錯誤');
    } finally {
      setIsLoading(false);
    }
  };

  // 生成新推薦
  const generateNewRecommendations = async (types?: RecommendationType[]) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/ai/intelligent-assistance?action=generate-recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          types: types || [RecommendationType.CONTENT, RecommendationType.GAME_TYPE],
          maxRecommendations: 10
        }),
      });

      if (!response.ok) {
        throw new Error('生成推薦失敗');
      }

      const data = await response.json();
      setRecommendations(data.data.recommendations || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成推薦時發生錯誤');
    } finally {
      setIsLoading(false);
    }
  };

  // 分析難度調整
  const analyzeDifficulty = async (learnerState: any) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/ai/intelligent-assistance?action=analyze-difficulty', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          learnerState,
          strategy: DifficultyStrategy.ADAPTIVE
        }),
      });

      if (!response.ok) {
        throw new Error('難度分析失敗');
      }

      const data = await response.json();
      const adjustment = data.data;
      setDifficultyAnalysis(prev => ({ ...prev, latestAdjustment: adjustment }));
      
      if (onDifficultyAdjust) {
        onDifficultyAdjust(adjustment);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '難度分析時發生錯誤');
    } finally {
      setIsLoading(false);
    }
  };

  // 適配內容
  const adaptContent = async (content: any) => {
    if (!accessibilityProfile) {
      setError('請先載入無障礙配置');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/ai/intelligent-assistance?action=adapt-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          accessibilityProfile
        }),
      });

      if (!response.ok) {
        throw new Error('內容適配失敗');
      }

      const data = await response.json();
      const adaptation = data.data;
      
      if (onContentAdapt) {
        onContentAdapt(adaptation);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '內容適配時發生錯誤');
    } finally {
      setIsLoading(false);
    }
  };

  // 初始載入
  useEffect(() => {
    if (activeTab === 'recommendations') {
      loadRecommendations();
    } else if (activeTab === 'difficulty') {
      loadDifficultyAnalysis();
    } else if (activeTab === 'accessibility') {
      loadAccessibilityProfile();
    }
  }, [activeTab]);

  // 渲染推薦標籤頁
  const renderRecommendationsTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">智能推薦</h3>
        <button
          onClick={() => generateNewRecommendations()}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? '生成中...' : '重新生成'}
        </button>
      </div>

      {recommendations.length > 0 ? (
        <div className="space-y-3">
          {recommendations.map((rec, index) => (
            <div
              key={index}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
              onClick={() => onRecommendationSelect?.(rec)}
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-gray-900">{rec.title}</h4>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {(rec.confidence * 100).toFixed(0)}% 信心度
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  預估時間: {rec.estimatedTime} 分鐘
                </span>
                <span className={`text-xs px-2 py-1 rounded ${
                  rec.priority >= 8 ? 'bg-red-100 text-red-800' :
                  rec.priority >= 6 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  優先級: {rec.priority}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          暫無推薦內容
        </div>
      )}
    </div>
  );

  // 渲染難度調整標籤頁
  const renderDifficultyTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">難度調整</h3>
        <button
          onClick={() => {
            // 模擬學習者狀態
            const mockLearnerState = {
              userId,
              sessionId: 'current',
              currentDifficulty: 0.6,
              cognitiveLoad: {
                responseTime: 3000,
                errorRate: 0.2,
                hesitationCount: 2,
                retryCount: 1,
                attentionLevel: 0.8,
                fatigueLevel: 0.3,
                frustrationLevel: 0.2
              },
              performance: {
                accuracy: 0.75,
                speed: 0.8,
                consistency: 0.7,
                improvement: 0.1,
                retention: 0.6,
                engagement: 0.8,
                confidence: 0.7
              },
              learningGoals: ['vocabulary', 'grammar'],
              timeConstraints: {
                sessionLength: 30,
                remainingTime: 15
              },
              personalFactors: {
                energyLevel: 0.7,
                motivationLevel: 0.8,
                stressLevel: 0.3,
                priorKnowledge: 0.6
              }
            };
            analyzeDifficulty(mockLearnerState);
          }}
          disabled={isLoading}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          {isLoading ? '分析中...' : '分析難度'}
        </button>
      </div>

      {difficultyAnalysis ? (
        <div className="space-y-4">
          {difficultyAnalysis.latestAdjustment && (
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">最新調整建議</h4>
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <span className="text-sm text-gray-600">當前難度:</span>
                  <div className="text-lg font-semibold">
                    {(difficultyAnalysis.latestAdjustment.currentDifficulty * 100).toFixed(0)}%
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-600">建議難度:</span>
                  <div className="text-lg font-semibold">
                    {(difficultyAnalysis.latestAdjustment.recommendedDifficulty * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-2">
                {difficultyAnalysis.latestAdjustment.adjustmentReason}
              </p>
              <div className="flex items-center justify-between">
                <span className={`text-xs px-2 py-1 rounded ${
                  difficultyAnalysis.latestAdjustment.adjustmentType === 'increase' ? 'bg-red-100 text-red-800' :
                  difficultyAnalysis.latestAdjustment.adjustmentType === 'decrease' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {difficultyAnalysis.latestAdjustment.adjustmentType === 'increase' ? '增加難度' :
                   difficultyAnalysis.latestAdjustment.adjustmentType === 'decrease' ? '降低難度' : '維持難度'}
                </span>
                <span className="text-xs text-gray-500">
                  信心度: {(difficultyAnalysis.latestAdjustment.confidence * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          )}

          {difficultyAnalysis.history && difficultyAnalysis.history.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">調整歷史</h4>
              <div className="space-y-2">
                {difficultyAnalysis.history.slice(0, 5).map((adjustment: any, index: number) => (
                  <div key={index} className="p-3 bg-gray-50 rounded">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">
                        {(adjustment.currentDifficulty * 100).toFixed(0)}% → {(adjustment.recommendedDifficulty * 100).toFixed(0)}%
                      </span>
                      <span className="text-xs text-gray-500">
                        {adjustment.adjustmentType}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          點擊"分析難度"開始智能難度分析
        </div>
      )}
    </div>
  );

  // 渲染無障礙標籤頁
  const renderAccessibilityTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">無障礙輔助</h3>
        <button
          onClick={() => currentContent && adaptContent(currentContent)}
          disabled={isLoading || !currentContent}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
        >
          {isLoading ? '適配中...' : '適配內容'}
        </button>
      </div>

      {accessibilityProfile ? (
        <div className="space-y-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">無障礙需求</h4>
            {accessibilityProfile.needs.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {accessibilityProfile.needs.map((need: AccessibilityNeed, index: number) => (
                  <span key={index} className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                    {need}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-600">未檢測到特殊無障礙需求</p>
            )}
          </div>

          <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">偏好設定</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">字體大小:</span>
                <span className="ml-2 font-medium">{accessibilityProfile.preferences.fontSize}</span>
              </div>
              <div>
                <span className="text-gray-600">對比度:</span>
                <span className="ml-2 font-medium">{accessibilityProfile.preferences.contrast}</span>
              </div>
              <div>
                <span className="text-gray-600">色彩方案:</span>
                <span className="ml-2 font-medium">{accessibilityProfile.preferences.colorScheme}</span>
              </div>
              <div>
                <span className="text-gray-600">動畫速度:</span>
                <span className="ml-2 font-medium">{accessibilityProfile.preferences.animationSpeed}</span>
              </div>
            </div>
          </div>

          {accessibilityProfile.assistiveTechnologies.length > 0 && (
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">建議輔助技術</h4>
              <div className="flex flex-wrap gap-2">
                {accessibilityProfile.assistiveTechnologies.map((tech: string, index: number) => (
                  <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          載入無障礙配置中...
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* 標籤頁導航 */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'recommendations', label: '智能推薦', icon: '🎯' },
            { id: 'difficulty', label: '難度調整', icon: '📊' },
            { id: 'learning', label: '學習路徑', icon: '🛤️' },
            { id: 'accessibility', label: '無障礙', icon: '♿' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* 內容區域 */}
      <div className="p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">錯誤</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-600">處理中...</span>
          </div>
        )}

        {!isLoading && (
          <>
            {activeTab === 'recommendations' && renderRecommendationsTab()}
            {activeTab === 'difficulty' && renderDifficultyTab()}
            {activeTab === 'learning' && (
              <div className="text-center py-8 text-gray-500">
                學習路徑功能開發中...
              </div>
            )}
            {activeTab === 'accessibility' && renderAccessibilityTab()}
          </>
        )}
      </div>
    </div>
  );
}
