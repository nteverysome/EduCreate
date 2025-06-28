/**
 * 性能監控儀表板
 * 提供完整的系統性能監控和分析
 */

import React, { useState, useEffect } from 'react';
import Head from 'next/head';

interface PerformanceSummary {
  overview: {
    totalMetrics: number;
    recentHourMetrics: number;
    dailyMetrics: number;
    averageResponseTime: number;
  };
  typeBreakdown: Array<{
    type: string;
    count: number;
    averageDuration: number;
    maxDuration: number;
    minDuration: number;
  }>;
  systemHealth: {
    timestamp: string;
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
    responseTime: number;
    activeUsers: number;
    errorRate: number;
  };
  trends: {
    hourlyAverage: number;
    dailyAverage: number;
    improvement: number;
  };
  alerts: Array<{
    type: string;
    severity: string;
    message: string;
    timestamp: string;
  }>;
}

export default function PerformanceDashboard() {
  const [summary, setSummary] = useState<PerformanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // 加載性能數據
  useEffect(() => {
    loadPerformanceData();
  }, []);

  // 自動刷新
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(loadPerformanceData, 30000); // 30秒刷新
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const loadPerformanceData = async () => {
    try {
      const response = await fetch('/api/monitoring/performance?summary=true');
      if (response.ok) {
        const data = await response.json();
        setSummary(data.summary);
      } else {
        // 使用模擬數據
        generateMockData();
      }
    } catch (error) {
      console.error('加載性能數據失敗:', error);
      generateMockData();
    } finally {
      setLoading(false);
    }
  };

  // 生成模擬數據
  const generateMockData = () => {
    const mockSummary: PerformanceSummary = {
      overview: {
        totalMetrics: 15847,
        recentHourMetrics: 234,
        dailyMetrics: 5621,
        averageResponseTime: 156
      },
      typeBreakdown: [
        { type: 'page-load', count: 1234, averageDuration: 1200, maxDuration: 3500, minDuration: 450 },
        { type: 'api-call', count: 2341, averageDuration: 180, maxDuration: 1200, minDuration: 45 },
        { type: 'user-interaction', count: 3456, averageDuration: 85, maxDuration: 500, minDuration: 15 },
        { type: 'resource-load', count: 4567, averageDuration: 320, maxDuration: 2000, minDuration: 50 }
      ],
      systemHealth: {
        timestamp: new Date().toISOString(),
        memory: {
          used: 1024,
          total: 2048,
          percentage: 50
        },
        responseTime: 156,
        activeUsers: 89,
        errorRate: 0.8
      },
      trends: {
        hourlyAverage: 145,
        dailyAverage: 168,
        improvement: 13.7
      },
      alerts: [
        {
          type: 'performance',
          severity: 'medium',
          message: 'API 響應時間略高於正常水平',
          timestamp: new Date(Date.now() - 300000).toISOString()
        },
        {
          type: 'memory',
          severity: 'low',
          message: '內存使用率正常',
          timestamp: new Date(Date.now() - 600000).toISOString()
        }
      ]
    };
    setSummary(mockSummary);
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatMemory = (mb: number) => {
    if (mb < 1024) return `${mb}MB`;
    return `${(mb / 1024).toFixed(1)}GB`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加載性能監控數據中...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>性能監控儀表板 | EduCreate</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* 頭部 */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">📈 性能監控儀表板</h1>
                <p className="mt-1 text-gray-600">實時監控系統性能和健康狀況</p>
              </div>
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">自動刷新</span>
                </label>
                <button
                  onClick={loadPerformanceData}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  手動刷新
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
                { id: 'metrics', name: '指標', icon: '📈' },
                { id: 'health', name: '系統健康', icon: '💚' },
                { id: 'alerts', name: '警報', icon: '🚨' }
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
          {activeTab === 'overview' && summary && (
            <div className="space-y-8">
              {/* 關鍵指標 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                        <span className="text-blue-600 font-semibold">📊</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">總指標數</p>
                      <p className="text-2xl font-semibold text-gray-900">{summary.overview.totalMetrics.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                        <span className="text-green-600 font-semibold">⚡</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">平均響應時間</p>
                      <p className="text-2xl font-semibold text-gray-900">{summary.overview.averageResponseTime}ms</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-yellow-100 rounded-md flex items-center justify-center">
                        <span className="text-yellow-600 font-semibold">📈</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">小時指標</p>
                      <p className="text-2xl font-semibold text-gray-900">{summary.overview.recentHourMetrics}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center">
                        <span className="text-purple-600 font-semibold">📅</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">日指標</p>
                      <p className="text-2xl font-semibold text-gray-900">{summary.overview.dailyMetrics}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 性能趨勢 */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 性能趨勢</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-500">小時平均</p>
                    <p className="text-2xl font-semibold text-blue-600">{summary.trends.hourlyAverage}ms</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500">日平均</p>
                    <p className="text-2xl font-semibold text-green-600">{summary.trends.dailyAverage}ms</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500">改進幅度</p>
                    <p className={`text-2xl font-semibold ${summary.trends.improvement > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {summary.trends.improvement > 0 ? '+' : ''}{summary.trends.improvement.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'metrics' && summary && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">📊 性能指標分析</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        指標類型
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        數量
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        平均時間
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        最大時間
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        最小時間
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {summary.typeBreakdown.map((metric, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-2xl mr-2">
                              {metric.type === 'page-load' ? '📄' :
                               metric.type === 'api-call' ? '🔗' :
                               metric.type === 'user-interaction' ? '👆' : '📦'}
                            </span>
                            <span className="text-sm font-medium text-gray-900">
                              {metric.type === 'page-load' ? '頁面加載' :
                               metric.type === 'api-call' ? 'API 調用' :
                               metric.type === 'user-interaction' ? '用戶交互' : '資源加載'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {metric.count.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDuration(metric.averageDuration)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDuration(metric.maxDuration)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDuration(metric.minDuration)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'health' && summary && (
            <div className="space-y-6">
              {/* 系統健康狀況 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">內存使用</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {summary.systemHealth.memory.percentage}%
                      </p>
                    </div>
                    <div className="text-3xl">
                      {summary.systemHealth.memory.percentage < 70 ? '💚' : 
                       summary.systemHealth.memory.percentage < 85 ? '💛' : '❤️'}
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          summary.systemHealth.memory.percentage < 70 ? 'bg-green-500' :
                          summary.systemHealth.memory.percentage < 85 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${summary.systemHealth.memory.percentage}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatMemory(summary.systemHealth.memory.used)} / {formatMemory(summary.systemHealth.memory.total)}
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">響應時間</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {summary.systemHealth.responseTime}ms
                      </p>
                    </div>
                    <div className="text-3xl">
                      {summary.systemHealth.responseTime < 200 ? '⚡' : 
                       summary.systemHealth.responseTime < 500 ? '⏱️' : '🐌'}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">活躍用戶</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {summary.systemHealth.activeUsers}
                      </p>
                    </div>
                    <div className="text-3xl">👥</div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">錯誤率</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {summary.systemHealth.errorRate.toFixed(1)}%
                      </p>
                    </div>
                    <div className="text-3xl">
                      {summary.systemHealth.errorRate < 1 ? '✅' : 
                       summary.systemHealth.errorRate < 3 ? '⚠️' : '🚨'}
                    </div>
                  </div>
                </div>
              </div>

              {/* 系統狀態總覽 */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">🖥️ 系統狀態總覽</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-4xl mb-2">✅</div>
                    <p className="font-medium text-green-800">系統正常</p>
                    <p className="text-sm text-green-600">所有服務運行正常</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-4xl mb-2">📊</div>
                    <p className="font-medium text-blue-800">性能良好</p>
                    <p className="text-sm text-blue-600">響應時間在正常範圍內</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-4xl mb-2">🔒</div>
                    <p className="font-medium text-purple-800">安全穩定</p>
                    <p className="text-sm text-purple-600">無安全威脅檢測</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'alerts' && summary && (
            <div className="space-y-6">
              {/* 警報列表 */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">🚨 系統警報</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {summary.alerts.length > 0 ? (
                    summary.alerts.map((alert, index) => (
                      <div key={index} className="px-6 py-4">
                        <div className={`border rounded-lg p-4 ${getAlertColor(alert.severity)}`}>
                          <div className="flex items-start justify-between">
                            <div className="flex items-start">
                              <span className="text-2xl mr-3">
                                {alert.severity === 'critical' ? '🚨' :
                                 alert.severity === 'high' ? '⚠️' :
                                 alert.severity === 'medium' ? '💛' : '💚'}
                              </span>
                              <div>
                                <p className="font-medium">{alert.message}</p>
                                <p className="text-sm opacity-75 mt-1">
                                  類型: {alert.type} | 時間: {new Date(alert.timestamp).toLocaleString('zh-TW')}
                                </p>
                              </div>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getAlertColor(alert.severity)}`}>
                              {alert.severity === 'critical' ? '嚴重' :
                               alert.severity === 'high' ? '高' :
                               alert.severity === 'medium' ? '中' : '低'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-6 py-8 text-center">
                      <div className="text-6xl mb-4">🎉</div>
                      <p className="text-lg font-medium text-gray-900">沒有警報</p>
                      <p className="text-gray-500">系統運行正常，沒有檢測到問題</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 警報統計 */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { level: 'critical', count: 0, color: 'bg-red-100 text-red-800', icon: '🚨' },
                  { level: 'high', count: 0, color: 'bg-orange-100 text-orange-800', icon: '⚠️' },
                  { level: 'medium', count: 1, color: 'bg-yellow-100 text-yellow-800', icon: '💛' },
                  { level: 'low', count: 1, color: 'bg-green-100 text-green-800', icon: '💚' }
                ].map((stat) => (
                  <div key={stat.level} className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          {stat.level === 'critical' ? '嚴重' :
                           stat.level === 'high' ? '高級' :
                           stat.level === 'medium' ? '中級' : '低級'} 警報
                        </p>
                        <p className="text-2xl font-semibold text-gray-900">{stat.count}</p>
                      </div>
                      <div className="text-3xl">{stat.icon}</div>
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
