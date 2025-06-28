/**
 * 學習分析儀表板
 * 提供完整的學習數據可視化和分析
 */

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useLearningAnalytics } from '../hooks/useLearningAnalytics';

interface LearningInsight {
  userId: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  progressTrend: 'improving' | 'stable' | 'declining';
  engagementLevel: 'high' | 'medium' | 'low';
  lastUpdated: string;
}

interface DashboardData {
  overview: {
    totalSessions: number;
    totalTimeSpent: number;
    averageScore: number;
    completionRate: number;
  };
  recentActivity: any[];
  insights: LearningInsight | null;
  progress: {
    weeklyProgress: any[];
    skillProgress: any[];
  };
}

export default function AnalyticsDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [selectedUserId, setSelectedUserId] = useState('demo-user-1');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // 安全地使用 useLearningAnalytics Hook
  const [learningAnalytics, setLearningAnalytics] = useState<any>(null);

  useEffect(() => {
    // 只在客戶端初始化 Hook
    if (typeof window !== 'undefined') {
      try {
        const { useLearningAnalytics } = require('../hooks/useLearningAnalytics');
        const analytics = useLearningAnalytics({
          userId: selectedUserId,
          activityId: 'dashboard',
          autoTrack: false
        });
        setLearningAnalytics(analytics);
      } catch (error) {
        console.warn('Learning analytics hook not available:', error);
      }
    }
  }, [selectedUserId]);

  // 加載儀表板數據
  useEffect(() => {
    loadDashboardData();
  }, [selectedUserId, learningAnalytics]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      if (learningAnalytics && learningAnalytics.getLearningDashboard) {
        const dashboard = await learningAnalytics.getLearningDashboard();
        setDashboardData(dashboard);
      } else {
        // 如果 Hook 不可用，使用模擬數據
        generateMockData();
      }
    } catch (error) {
      console.error('加載儀表板數據失敗:', error);
      // 回退到模擬數據
      generateMockData();
    } finally {
      setLoading(false);
    }
  };

  // 生成模擬數據（用於演示）
  const generateMockData = () => {
    const mockData: DashboardData = {
      overview: {
        totalSessions: 45,
        totalTimeSpent: 2340, // 分鐘
        averageScore: 85.6,
        completionRate: 78.3
      },
      recentActivity: [
        { id: 1, type: 'quiz', name: '數學基礎測驗', score: 92, time: '2小時前' },
        { id: 2, type: 'flashcards', name: '英語單詞練習', score: 88, time: '4小時前' },
        { id: 3, type: 'matching', name: '科學概念配對', score: 95, time: '1天前' }
      ],
      insights: {
        userId: selectedUserId,
        strengths: ['數學運算能力強', '學習持續性好', '問題解決能力優秀'],
        weaknesses: ['英語詞彙需加強', '注意力集中時間較短'],
        recommendations: ['增加英語詞彙練習', '嘗試短時間高強度學習', '定期復習已學內容'],
        progressTrend: 'improving',
        engagementLevel: 'high',
        lastUpdated: new Date().toISOString()
      },
      progress: {
        weeklyProgress: [
          { date: '2024-01-01', sessions: 3, timeSpent: 120, averageScore: 82 },
          { date: '2024-01-02', sessions: 5, timeSpent: 180, averageScore: 85 },
          { date: '2024-01-03', sessions: 4, timeSpent: 150, averageScore: 88 },
          { date: '2024-01-04', sessions: 6, timeSpent: 200, averageScore: 90 },
          { date: '2024-01-05', sessions: 3, timeSpent: 100, averageScore: 87 },
          { date: '2024-01-06', sessions: 7, timeSpent: 220, averageScore: 92 },
          { date: '2024-01-07', sessions: 5, timeSpent: 160, averageScore: 89 }
        ],
        skillProgress: [
          { name: '數學', level: 85, progress: 92, recentImprovement: 8 },
          { name: '語言', level: 72, progress: 78, recentImprovement: 5 },
          { name: '科學', level: 90, progress: 95, recentImprovement: 12 },
          { name: '邏輯思維', level: 88, progress: 85, recentImprovement: -2 },
          { name: '記憶力', level: 76, progress: 82, recentImprovement: 6 }
        ]
      }
    };
    setDashboardData(mockData);
    setLoading(false);
  };

  // 如果沒有數據，使用模擬數據
  useEffect(() => {
    if (!dashboardData && !loading) {
      generateMockData();
    }
  }, [dashboardData, loading]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return '📈';
      case 'declining': return '📉';
      default: return '➡️';
    }
  };

  const getEngagementColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加載學習分析數據中...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>學習分析儀表板 | EduCreate</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* 頭部 */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">📊 學習分析儀表板</h1>
                <p className="mt-1 text-gray-600">深入了解學習進度和表現</p>
              </div>
              <div className="flex items-center space-x-4">
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 bg-white"
                >
                  <option value="demo-user-1">演示用戶 1</option>
                  <option value="demo-user-2">演示用戶 2</option>
                  <option value="demo-user-3">演示用戶 3</option>
                </select>
                <button
                  onClick={loadDashboardData}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  刷新數據
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 標籤導航 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', name: '總覽', icon: '📊' },
                { id: 'progress', name: '進度', icon: '📈' },
                { id: 'insights', name: '洞察', icon: '🧠' },
                { id: 'activity', name: '活動', icon: '🎯' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap
                    ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  {tab.icon} {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* 主要內容 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'overview' && dashboardData && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* 統計卡片 */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">📚</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">總學習次數</p>
                    <p className="text-2xl font-semibold text-gray-900">{dashboardData.overview.totalSessions}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                      <span className="text-green-600 font-semibold">⏱️</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">總學習時間</p>
                    <p className="text-2xl font-semibold text-gray-900">{Math.round(dashboardData.overview.totalTimeSpent / 60)}h</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-100 rounded-md flex items-center justify-center">
                      <span className="text-yellow-600 font-semibold">⭐</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">平均分數</p>
                    <p className="text-2xl font-semibold text-gray-900">{dashboardData.overview.averageScore.toFixed(1)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center">
                      <span className="text-purple-600 font-semibold">🎯</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">完成率</p>
                    <p className="text-2xl font-semibold text-gray-900">{dashboardData.overview.completionRate.toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'progress' && dashboardData && (
            <div className="space-y-8">
              {/* 週進度圖表 */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 週學習進度</h3>
                <div className="grid grid-cols-7 gap-4">
                  {dashboardData.progress.weeklyProgress.map((day, index) => (
                    <div key={index} className="text-center">
                      <div className="text-xs text-gray-500 mb-2">
                        {new Date(day.date).toLocaleDateString('zh-TW', { weekday: 'short' })}
                      </div>
                      <div className="bg-blue-100 rounded-lg p-3">
                        <div className="text-lg font-semibold text-blue-600">{day.sessions}</div>
                        <div className="text-xs text-gray-600">次學習</div>
                        <div className="text-xs text-gray-600">{day.timeSpent}分鐘</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 技能進度 */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 技能進度</h3>
                <div className="space-y-4">
                  {dashboardData.progress.skillProgress.map((skill, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-gray-700">{skill.name}</span>
                          <span className="text-sm text-gray-500">{skill.level}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${skill.progress}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="ml-4 text-right">
                        <span className={`text-xs px-2 py-1 rounded ${
                          skill.recentImprovement > 0 ? 'bg-green-100 text-green-600' : 
                          skill.recentImprovement < 0 ? 'bg-red-100 text-red-600' : 
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {skill.recentImprovement > 0 ? '+' : ''}{skill.recentImprovement}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'insights' && dashboardData?.insights && (
            <div className="space-y-6">
              {/* 學習趨勢 */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 學習趨勢分析</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center mb-2">
                      <span className="text-2xl mr-2">{getTrendIcon(dashboardData.insights.progressTrend)}</span>
                      <span className="font-medium">進步趨勢</span>
                    </div>
                    <p className="text-gray-600">
                      {dashboardData.insights.progressTrend === 'improving' ? '學習表現持續改善' :
                       dashboardData.insights.progressTrend === 'declining' ? '需要關注學習狀況' :
                       '學習表現保持穩定'}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center mb-2">
                      <span className="text-2xl mr-2">🔥</span>
                      <span className="font-medium">參與度</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getEngagementColor(dashboardData.insights.engagementLevel)}`}>
                      {dashboardData.insights.engagementLevel === 'high' ? '高度參與' :
                       dashboardData.insights.engagementLevel === 'medium' ? '中等參與' :
                       '需要提升參與度'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 優勢和弱點 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-green-600 mb-4">💪 學習優勢</h3>
                  <ul className="space-y-2">
                    {dashboardData.insights.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        <span className="text-gray-700">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-orange-600 mb-4">🎯 改進方向</h3>
                  <ul className="space-y-2">
                    {dashboardData.insights.weaknesses.map((weakness, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-orange-500 mr-2">!</span>
                        <span className="text-gray-700">{weakness}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* 學習建議 */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-blue-600 mb-4">💡 個性化建議</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dashboardData.insights.recommendations.map((recommendation, index) => (
                    <div key={index} className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-start">
                        <span className="text-blue-500 mr-2">💡</span>
                        <span className="text-gray-700">{recommendation}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'activity' && dashboardData && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">🎯 最近學習活動</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {dashboardData.recentActivity.map((activity, index) => (
                  <div key={index} className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                        <span className="text-blue-600 font-semibold">
                          {activity.type === 'quiz' ? '📝' : 
                           activity.type === 'flashcards' ? '🃏' : 
                           activity.type === 'matching' ? '🔗' : '🎮'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{activity.name}</p>
                        <p className="text-sm text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{activity.score}分</p>
                      <p className="text-sm text-gray-500">
                        {activity.score >= 90 ? '優秀' : 
                         activity.score >= 80 ? '良好' : 
                         activity.score >= 70 ? '及格' : '需改進'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
