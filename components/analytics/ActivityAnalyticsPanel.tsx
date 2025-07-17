/**
 * 活動統計和分析面板組件
 * 展示使用頻率、學習效果、時間分布的完整分析功能
 * 基於記憶科學原理和 GEPT 分級系統設計
 */

'use client';

import React, { useState, useEffect } from 'react';

interface ActivityAnalyticsPanelProps {
  userId: string;
  timeRange?: 'week' | 'month' | 'quarter' | 'year';
  showDetailedMetrics?: boolean;
  enableRealTimeUpdates?: boolean;
}

interface UsageFrequencyData {
  activityId: string;
  activityName: string;
  usageCount: number;
  lastUsed: Date;
  averageSessionTime: number;
  geptLevel: 'elementary' | 'intermediate' | 'high-intermediate';
}

interface LearningEffectData {
  activityId: string;
  activityName: string;
  completionRate: number;
  averageScore: number;
  retentionRate: number;
  difficultyLevel: number;
  improvementTrend: 'improving' | 'stable' | 'declining';
}

interface TimeDistributionData {
  hour: number;
  usageCount: number;
  averagePerformance: number;
  dayOfWeek: string;
  totalTimeSpent: number;
}

export const ActivityAnalyticsPanel: React.FC<ActivityAnalyticsPanelProps> = ({
  userId,
  timeRange = 'month',
  showDetailedMetrics = true,
  enableRealTimeUpdates = false
}) => {
  const [activeTab, setActiveTab] = useState<'usage' | 'learning' | 'time'>('usage');
  const [isLoading, setIsLoading] = useState(true);
  const [usageData, setUsageData] = useState<UsageFrequencyData[]>([]);
  const [learningData, setLearningData] = useState<LearningEffectData[]>([]);
  const [timeData, setTimeData] = useState<TimeDistributionData[]>([]);

  useEffect(() => {
    loadAnalyticsData();
  }, [userId, timeRange]);

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    
    // 模擬數據載入
    setTimeout(() => {
      // 使用頻率數據
      setUsageData([
        {
          activityId: '1',
          activityName: '英語單字配對遊戲',
          usageCount: 45,
          lastUsed: new Date('2025-07-15'),
          averageSessionTime: 12.5,
          geptLevel: 'elementary'
        },
        {
          activityId: '2',
          activityName: '數學填空練習',
          usageCount: 32,
          lastUsed: new Date('2025-07-14'),
          averageSessionTime: 8.3,
          geptLevel: 'intermediate'
        },
        {
          activityId: '3',
          activityName: '科學選擇題測驗',
          usageCount: 28,
          lastUsed: new Date('2025-07-13'),
          averageSessionTime: 15.7,
          geptLevel: 'high-intermediate'
        }
      ]);

      // 學習效果數據
      setLearningData([
        {
          activityId: '1',
          activityName: '英語單字配對遊戲',
          completionRate: 0.85,
          averageScore: 78.5,
          retentionRate: 0.72,
          difficultyLevel: 6.2,
          improvementTrend: 'improving'
        },
        {
          activityId: '2',
          activityName: '數學填空練習',
          completionRate: 0.92,
          averageScore: 82.1,
          retentionRate: 0.68,
          difficultyLevel: 7.1,
          improvementTrend: 'stable'
        },
        {
          activityId: '3',
          activityName: '科學選擇題測驗',
          completionRate: 0.76,
          averageScore: 74.3,
          retentionRate: 0.81,
          difficultyLevel: 8.3,
          improvementTrend: 'improving'
        }
      ]);

      // 時間分布數據
      setTimeData([
        { hour: 9, usageCount: 12, averagePerformance: 78.5, dayOfWeek: '週一', totalTimeSpent: 145 },
        { hour: 14, usageCount: 18, averagePerformance: 82.1, dayOfWeek: '週二', totalTimeSpent: 210 },
        { hour: 16, usageCount: 25, averagePerformance: 79.3, dayOfWeek: '週三', totalTimeSpent: 320 },
        { hour: 19, usageCount: 22, averagePerformance: 75.8, dayOfWeek: '週四', totalTimeSpent: 285 },
        { hour: 10, usageCount: 15, averagePerformance: 81.2, dayOfWeek: '週五', totalTimeSpent: 180 }
      ]);

      setIsLoading(false);
    }, 1500);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return '📈';
      case 'declining': return '📉';
      default: return '➡️';
    }
  };

  const getGeptLevelColor = (level: string) => {
    switch (level) {
      case 'elementary': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'high-intermediate': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">載入分析數據中...</p>
      </div>
    );
  }

  return (
    <div className="p-6" data-testid="activity-analytics-panel">
      {/* 標籤切換 */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('usage')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'usage'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          data-testid="usage-frequency-tab"
        >
          📊 使用頻率統計
        </button>
        <button
          onClick={() => setActiveTab('learning')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'learning'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          data-testid="learning-effect-tab"
        >
          🎯 學習效果分析
        </button>
        <button
          onClick={() => setActiveTab('time')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'time'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          data-testid="time-distribution-tab"
        >
          ⏰ 時間分布分析
        </button>
      </div>

      {/* 使用頻率統計 */}
      {activeTab === 'usage' && (
        <div data-testid="usage-frequency-content">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">使用頻率統計</h3>
          <div className="space-y-4">
            {usageData.map((item) => (
              <div key={item.activityId} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{item.activityName}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGeptLevelColor(item.geptLevel)}`}>
                    {item.geptLevel}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">使用次數：</span>
                    <span className="text-blue-600 font-semibold">{item.usageCount}</span>
                  </div>
                  <div>
                    <span className="font-medium">平均時長：</span>
                    <span className="text-green-600 font-semibold">{item.averageSessionTime} 分鐘</span>
                  </div>
                  <div>
                    <span className="font-medium">最後使用：</span>
                    <span className="text-gray-700">{item.lastUsed.toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 學習效果分析 */}
      {activeTab === 'learning' && (
        <div data-testid="learning-effect-content">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">學習效果分析</h3>
          <div className="space-y-4">
            {learningData.map((item) => (
              <div key={item.activityId} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{item.activityName}</h4>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getTrendIcon(item.improvementTrend)}</span>
                    <span className="text-sm text-gray-600">{item.improvementTrend}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">完成率：</span>
                    <span className="text-blue-600 font-semibold">{(item.completionRate * 100).toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="font-medium">平均分數：</span>
                    <span className="text-green-600 font-semibold">{item.averageScore.toFixed(1)}</span>
                  </div>
                  <div>
                    <span className="font-medium">記憶保持率：</span>
                    <span className="text-purple-600 font-semibold">{(item.retentionRate * 100).toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="font-medium">難度等級：</span>
                    <span className="text-orange-600 font-semibold">{item.difficultyLevel.toFixed(1)}/10</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 時間分布分析 */}
      {activeTab === 'time' && (
        <div data-testid="time-distribution-content">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">時間分布分析</h3>
          <div className="space-y-4">
            {timeData.map((item, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{item.dayOfWeek} {item.hour}:00</h4>
                  <span className="text-sm text-gray-600">總時長: {item.totalTimeSpent} 分鐘</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">使用次數：</span>
                    <span className="text-blue-600 font-semibold">{item.usageCount}</span>
                  </div>
                  <div>
                    <span className="font-medium">平均表現：</span>
                    <span className="text-green-600 font-semibold">{item.averagePerformance.toFixed(1)}%</span>
                  </div>
                </div>
                {/* 簡單的進度條視覺化 */}
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(item.usageCount / 30) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 總結和建議 */}
      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">學習洞察和建議</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p>• 您在下午 2-4 點的學習效果最佳，建議安排重要的學習活動在這個時段</p>
          <p>• 英語單字配對遊戲的使用頻率最高，記憶保持率良好，可以繼續保持</p>
          <p>• 科學選擇題測驗的難度較高，建議增加複習頻率以提高記憶保持率</p>
          <p>• 基於您的 GEPT 等級分布，建議逐步增加中高級內容的比例</p>
        </div>
      </div>
    </div>
  );
};
