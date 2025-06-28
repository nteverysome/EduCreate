/**
 * 學習分析儀表板組件
 * 提供全面的學習數據分析和可視化
 */

import React, { useState, useEffect } from 'react';
import { 
  LearningAnalytics, 
  AnalyticsReport, 
  LearningProgress,
  VisualizationData 
} from '../../lib/analytics/LearningAnalytics';

interface AnalyticsDashboardProps {
  userId?: string;
  userIds?: string[];
  activityId?: string;
  reportType: 'individual' | 'group' | 'activity' | 'organization';
  timeRange?: { start: Date; end: Date };
}

export default function AnalyticsDashboard({
  userId,
  userIds,
  activityId,
  reportType,
  timeRange = {
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30天前
    end: new Date()
  }
}: AnalyticsDashboardProps) {
  const [report, setReport] = useState<AnalyticsReport | null>(null);
  const [progress, setProgress] = useState<LearningProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [selectedVisualization, setSelectedVisualization] = useState<string>('');

  // 載入分析數據
  useEffect(() => {
    loadAnalyticsData();
  }, [userId, userIds, activityId, reportType, timeRange]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    
    try {
      let analyticsReport: AnalyticsReport;
      
      switch (reportType) {
        case 'individual':
          if (userId) {
            analyticsReport = await LearningAnalytics.generateIndividualReport(userId, timeRange);
            const userProgress = LearningAnalytics.getUserProgress(userId);
            setProgress(userProgress);
          } else {
            throw new Error('個人報告需要提供 userId');
          }
          break;
          
        case 'group':
          if (userIds && userIds.length > 0) {
            analyticsReport = await LearningAnalytics.generateGroupReport(userIds, timeRange);
          } else {
            throw new Error('群組報告需要提供 userIds');
          }
          break;
          
        case 'activity':
          if (activityId) {
            analyticsReport = await LearningAnalytics.generateActivityReport(activityId, timeRange);
          } else {
            throw new Error('活動報告需要提供 activityId');
          }
          break;
          
        default:
          throw new Error(`不支持的報告類型: ${reportType}`);
      }
      
      setReport(analyticsReport);
      
      if (analyticsReport.visualizations.length > 0) {
        setSelectedVisualization(analyticsReport.visualizations[0].id);
      }
      
    } catch (error) {
      console.error('載入分析數據失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', name: '概覽', icon: '📊' },
    { id: 'engagement', name: '參與度', icon: '👥' },
    { id: 'performance', name: '表現', icon: '🎯' },
    { id: 'learning', name: '學習進度', icon: '📈' },
    { id: 'insights', name: '洞察', icon: '💡' },
    { id: 'recommendations', name: '建議', icon: '🎯' }
  ];

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <div className="text-gray-400 text-4xl mb-2">📊</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">無法載入分析數據</h3>
        <p className="text-gray-600">請檢查參數設置並重試</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* 頭部 */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{report.title}</h2>
            <p className="text-blue-100 mt-1">{report.description}</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-blue-100">生成時間</div>
            <div className="font-medium">{report.generatedAt.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* 標籤導航 */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-8 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* 內容區域 */}
      <div className="p-6">
        {/* 概覽標籤 */}
        {activeTab === 'overview' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <MetricCard
                title="總會話數"
                value={report.metrics.engagement.totalSessions}
                icon="📚"
                color="blue"
              />
              <MetricCard
                title="平均分數"
                value={`${Math.round(report.metrics.performance.averageScore)}%`}
                icon="🎯"
                color="green"
              />
              <MetricCard
                title="完成率"
                value={`${Math.round(report.metrics.engagement.completionRate * 100)}%`}
                icon="✅"
                color="purple"
              />
              <MetricCard
                title="學習時間"
                value={`${Math.round(report.metrics.engagement.totalTimeSpent / 3600)}h`}
                icon="⏱️"
                color="orange"
              />
            </div>

            {/* 可視化圖表 */}
            {report.visualizations.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">數據可視化</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {report.visualizations.slice(0, 2).map((viz) => (
                    <VisualizationCard key={viz.id} visualization={viz} />
                  ))}
                </div>
              </div>
            )}

            {/* 快速洞察 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">關鍵洞察</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {report.insights.slice(0, 4).map((insight) => (
                  <InsightCard key={insight.id} insight={insight} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 參與度標籤 */}
        {activeTab === 'engagement' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">參與度分析</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">活躍用戶</h4>
                <div className="text-2xl font-bold text-blue-600">
                  {report.metrics.engagement.activeUsers}
                </div>
                <div className="text-sm text-blue-700 mt-1">
                  平均會話時長: {Math.round(report.metrics.engagement.averageSessionDuration / 60)}分鐘
                </div>
              </div>
              
              <div className="bg-green-50 p-6 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">回歸率</h4>
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(report.metrics.engagement.returnRate * 100)}%
                </div>
                <div className="text-sm text-green-700 mt-1">
                  用戶重複使用率
                </div>
              </div>
              
              <div className="bg-purple-50 p-6 rounded-lg">
                <h4 className="font-medium text-purple-800 mb-2">設備分佈</h4>
                <div className="space-y-1 text-sm">
                  {Object.entries(report.metrics.engagement.deviceDistribution).map(([device, count]) => (
                    <div key={device} className="flex justify-between">
                      <span className="text-purple-700">{device}:</span>
                      <span className="font-medium text-purple-600">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 表現標籤 */}
        {activeTab === 'performance' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">學習表現分析</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="font-medium text-gray-900 mb-4">分數分佈</h4>
                <div className="space-y-3">
                  {Object.entries(report.metrics.performance.scoreDistribution).map(([range, count]) => (
                    <div key={range} className="flex items-center">
                      <div className="w-16 text-sm text-gray-600">{range}%</div>
                      <div className="flex-1 bg-gray-200 rounded-full h-2 mx-3">
                        <div 
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${(count / Math.max(...Object.values(report.metrics.performance.scoreDistribution))) * 100}%` }}
                        ></div>
                      </div>
                      <div className="w-8 text-sm font-medium text-gray-900">{count}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="font-medium text-gray-900 mb-4">表現指標</h4>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">平均分數</span>
                    <span className="font-medium">{Math.round(report.metrics.performance.averageScore)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">改進率</span>
                    <span className="font-medium text-green-600">+{Math.round(report.metrics.performance.improvementRate * 100)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">掌握率</span>
                    <span className="font-medium">{Math.round(report.metrics.performance.masteryRate * 100)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">平均嘗試次數</span>
                    <span className="font-medium">{report.metrics.performance.attemptsPerActivity.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 學習進度標籤 */}
        {activeTab === 'learning' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">學習進度追蹤</h3>
            {reportType === 'individual' && progress.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {progress.map((prog, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="font-medium text-gray-900 mb-3">{prog.subject}</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">技能水平</span>
                          <span className="font-medium">{Math.round(prog.skillLevel)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${prog.skillLevel}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        <div>掌握程度: <span className="font-medium text-gray-900">{prog.masteryLevel}</span></div>
                        <div>完成活動: <span className="font-medium text-gray-900">{prog.completedActivities}</span></div>
                        <div>連續天數: <span className="font-medium text-gray-900">{prog.streakDays}</span></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* 技能進展圖表 */}
            <div className="mt-8">
              <h4 className="font-medium text-gray-900 mb-4">技能進展</h4>
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="space-y-4">
                  {Object.entries(report.metrics.learning.skillProgression).map(([skill, level]) => (
                    <div key={skill}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700">{skill}</span>
                        <span className="font-medium">{Math.round(level)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${level}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 洞察標籤 */}
        {activeTab === 'insights' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">深度洞察</h3>
            <div className="space-y-4">
              {report.insights.map((insight) => (
                <div key={insight.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3 ${
                        insight.type === 'strength' ? 'bg-green-500' :
                        insight.type === 'weakness' ? 'bg-red-500' :
                        insight.type === 'opportunity' ? 'bg-blue-500' :
                        insight.type === 'trend' ? 'bg-purple-500' : 'bg-yellow-500'
                      }`}></div>
                      <h4 className="font-medium text-gray-900">{insight.title}</h4>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        insight.impact === 'high' ? 'bg-red-100 text-red-700' :
                        insight.impact === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {insight.impact === 'high' ? '高影響' : insight.impact === 'medium' ? '中影響' : '低影響'}
                      </span>
                      <span className="text-xs text-gray-500">
                        信心度: {Math.round(insight.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-700">{insight.description}</p>
                  {insight.actionable && (
                    <div className="mt-3 text-sm text-blue-600">
                      💡 此洞察可採取行動
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 建議標籤 */}
        {activeTab === 'recommendations' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">改進建議</h3>
            <div className="space-y-4">
              {report.recommendations.map((recommendation, index) => (
                <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">
                      {index + 1}
                    </div>
                    <p className="text-blue-800">{recommendation}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// 指標卡片組件
function MetricCard({ title, value, icon, color }: {
  title: string;
  value: string | number;
  icon: string;
  color: string;
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600'
  };

  return (
    <div className={`${colorClasses[color as keyof typeof colorClasses]} p-6 rounded-lg`}>
      <div className="flex items-center">
        <div className="text-2xl mr-3">{icon}</div>
        <div>
          <div className="text-2xl font-bold">{value}</div>
          <div className="text-sm opacity-75">{title}</div>
        </div>
      </div>
    </div>
  );
}

// 可視化卡片組件
function VisualizationCard({ visualization }: { visualization: VisualizationData }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h4 className="font-medium text-gray-900 mb-4">{visualization.title}</h4>
      <div className="h-64 bg-gray-50 rounded flex items-center justify-center">
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-2">📊</div>
          <div className="text-sm">圖表: {visualization.type}</div>
          <div className="text-xs mt-1">數據點: {JSON.stringify(visualization.data).length}</div>
        </div>
      </div>
    </div>
  );
}

// 洞察卡片組件
function InsightCard({ insight }: { insight: any }) {
  const typeIcons = {
    strength: '💪',
    weakness: '⚠️',
    opportunity: '🎯',
    trend: '📈',
    anomaly: '🔍'
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-start">
        <div className="text-2xl mr-3">{typeIcons[insight.type as keyof typeof typeIcons]}</div>
        <div className="flex-1">
          <h5 className="font-medium text-gray-900 mb-1">{insight.title}</h5>
          <p className="text-sm text-gray-600">{insight.description}</p>
          <div className="mt-2 text-xs text-gray-500">
            信心度: {Math.round(insight.confidence * 100)}%
          </div>
        </div>
      </div>
    </div>
  );
}
