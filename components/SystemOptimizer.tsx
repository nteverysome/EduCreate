import React, { useState, useEffect } from 'react';

// System Optimization Types
interface OptimizationTask {
  id: string;
  title: string;
  description: string;
  category: 'performance' | 'usability' | 'functionality' | 'accessibility' | 'security';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in-progress' | 'testing' | 'completed' | 'failed';
  impact: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  estimatedTime: string;
  assignee: string;
  createdAt: string;
  completedAt?: string;
  userFeedbackIds: string[];
  metrics: {
    before: Record<string, number>;
    after?: Record<string, number>;
  };
}

interface SystemMetrics {
  performance: {
    pageLoadTime: number;
    apiResponseTime: number;
    memoryUsage: number;
    errorRate: number;
  };
  usability: {
    taskCompletionRate: number;
    userSatisfaction: number;
    navigationEfficiency: number;
    errorRecoveryRate: number;
  };
  functionality: {
    featureAdoption: number;
    bugReports: number;
    featureRequests: number;
    systemUptime: number;
  };
  accessibility: {
    wcagCompliance: number;
    screenReaderCompatibility: number;
    keyboardNavigation: number;
    colorContrastRatio: number;
  };
}

export default function SystemOptimizer() {
  const [optimizationTasks, setOptimizationTasks] = useState<OptimizationTask[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showCreateTask, setShowCreateTask] = useState(false);

  // Initialize optimization tasks based on user feedback
  useEffect(() => {
    const tasks: OptimizationTask[] = [
      {
        id: 'opt-1',
        title: '優化AI內容生成響應速度',
        description: '根據用戶反饋，AI生成內容的響應時間需要從平均8秒優化到3秒以內',
        category: 'performance',
        priority: 'high',
        status: 'in-progress',
        impact: 'high',
        effort: 'medium',
        estimatedTime: '3天',
        assignee: 'AI團隊',
        createdAt: '2024-01-20T09:00:00Z',
        userFeedbackIds: ['fb-1'],
        metrics: {
          before: { responseTime: 8.2, userSatisfaction: 3.2 },
          after: { responseTime: 2.8, userSatisfaction: 4.1 }
        }
      },
      {
        id: 'opt-2',
        title: '改善移動端界面設計',
        description: '增大移動端按鈕尺寸，改善觸摸體驗，優化小屏幕設備的可用性',
        category: 'usability',
        priority: 'medium',
        status: 'completed',
        impact: 'medium',
        effort: 'low',
        estimatedTime: '2天',
        assignee: 'UI/UX團隊',
        createdAt: '2024-01-18T14:00:00Z',
        completedAt: '2024-01-20T16:30:00Z',
        userFeedbackIds: ['fb-3'],
        metrics: {
          before: { buttonSize: 32, touchAccuracy: 78, userSatisfaction: 3.0 },
          after: { buttonSize: 44, touchAccuracy: 92, userSatisfaction: 4.2 }
        }
      },
      {
        id: 'opt-3',
        title: '系統性能優化',
        description: '解決系統卡頓問題，優化內存使用，提升整體系統穩定性',
        category: 'performance',
        priority: 'critical',
        status: 'testing',
        impact: 'high',
        effort: 'high',
        estimatedTime: '5天',
        assignee: '後端團隊',
        createdAt: '2024-01-19T11:00:00Z',
        userFeedbackIds: ['fb-5'],
        metrics: {
          before: { memoryUsage: 85, cpuUsage: 78, errorRate: 2.1 },
          after: { memoryUsage: 62, cpuUsage: 45, errorRate: 0.8 }
        }
      },
      {
        id: 'opt-4',
        title: '增加數學遊戲模板',
        description: '根據用戶需求，開發更多數學相關的遊戲模板，包括計算、幾何等',
        category: 'functionality',
        priority: 'medium',
        status: 'pending',
        impact: 'medium',
        effort: 'high',
        estimatedTime: '7天',
        assignee: '遊戲開發團隊',
        createdAt: '2024-01-21T10:00:00Z',
        userFeedbackIds: ['fb-2'],
        metrics: {
          before: { mathTemplates: 3, userRequests: 12 }
        }
      },
      {
        id: 'opt-5',
        title: '無障礙功能增強',
        description: '提升屏幕閱讀器兼容性，改善鍵盤導航，增加高對比度模式',
        category: 'accessibility',
        priority: 'medium',
        status: 'in-progress',
        impact: 'medium',
        effort: 'medium',
        estimatedTime: '4天',
        assignee: '前端團隊',
        createdAt: '2024-01-22T09:30:00Z',
        userFeedbackIds: [],
        metrics: {
          before: { wcagCompliance: 72, screenReaderScore: 68 },
          after: { wcagCompliance: 89, screenReaderScore: 85 }
        }
      }
    ];

    setOptimizationTasks(tasks);

    // Mock system metrics
    const metrics: SystemMetrics = {
      performance: {
        pageLoadTime: 2.1,
        apiResponseTime: 450,
        memoryUsage: 62,
        errorRate: 0.8
      },
      usability: {
        taskCompletionRate: 87,
        userSatisfaction: 4.1,
        navigationEfficiency: 82,
        errorRecoveryRate: 91
      },
      functionality: {
        featureAdoption: 76,
        bugReports: 12,
        featureRequests: 28,
        systemUptime: 99.2
      },
      accessibility: {
        wcagCompliance: 89,
        screenReaderCompatibility: 85,
        keyboardNavigation: 92,
        colorContrastRatio: 4.8
      }
    };

    setSystemMetrics(metrics);
  }, []);

  const filteredTasks = optimizationTasks.filter(task => {
    const categoryMatch = selectedCategory === 'all' || task.category === selectedCategory;
    const statusMatch = selectedStatus === 'all' || task.status === selectedStatus;
    return categoryMatch && statusMatch;
  });

  const updateTaskStatus = (taskId: string, newStatus: OptimizationTask['status']) => {
    setOptimizationTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { 
            ...task, 
            status: newStatus, 
            completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined 
          }
        : task
    ));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-100 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-100 border-green-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-gray-600 bg-gray-100';
      case 'in-progress': return 'text-blue-600 bg-blue-100';
      case 'testing': return 'text-purple-600 bg-purple-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'performance': return '⚡';
      case 'usability': return '👤';
      case 'functionality': return '🔧';
      case 'accessibility': return '♿';
      case 'security': return '🔒';
      default: return '📋';
    }
  };

  const getMetricScore = (value: number, category: string) => {
    // Different scoring logic for different metrics
    if (category === 'errorRate') {
      return value < 1 ? 'excellent' : value < 3 ? 'good' : value < 5 ? 'fair' : 'poor';
    } else {
      return value >= 90 ? 'excellent' : value >= 75 ? 'good' : value >= 60 ? 'fair' : 'poor';
    }
  };

  const getScoreColor = (score: string) => {
    switch (score) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'fair': return 'text-yellow-600 bg-yellow-100';
      case 'poor': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (!systemMetrics) return <div>Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">🔧 系統優化管理</h1>
        
        {/* System Health Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">系統性能</p>
                <p className="text-2xl font-bold">{systemMetrics.performance.pageLoadTime}s</p>
                <p className="text-sm text-blue-100">頁面加載時間</p>
              </div>
              <div className="text-3xl opacity-80">⚡</div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">用戶體驗</p>
                <p className="text-2xl font-bold">{systemMetrics.usability.userSatisfaction}/5</p>
                <p className="text-sm text-green-100">用戶滿意度</p>
              </div>
              <div className="text-3xl opacity-80">👤</div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">系統穩定性</p>
                <p className="text-2xl font-bold">{systemMetrics.functionality.systemUptime}%</p>
                <p className="text-sm text-purple-100">系統正常運行時間</p>
              </div>
              <div className="text-3xl opacity-80">🔧</div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100">無障礙性</p>
                <p className="text-2xl font-bold">{systemMetrics.accessibility.wcagCompliance}%</p>
                <p className="text-sm text-orange-100">WCAG 合規性</p>
              </div>
              <div className="text-3xl opacity-80">♿</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">分類</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="all">全部</option>
                <option value="performance">性能</option>
                <option value="usability">可用性</option>
                <option value="functionality">功能性</option>
                <option value="accessibility">無障礙</option>
                <option value="security">安全性</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">狀態</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="all">全部</option>
                <option value="pending">待處理</option>
                <option value="in-progress">進行中</option>
                <option value="testing">測試中</option>
                <option value="completed">已完成</option>
                <option value="failed">失敗</option>
              </select>
            </div>
          </div>

          <button
            onClick={() => setShowCreateTask(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            + 新增優化任務
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Optimization Tasks */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">優化任務列表</h2>
            
            <div className="space-y-4">
              {filteredTasks.map((task) => (
                <div key={task.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-start space-x-3">
                      <div className="text-2xl">{getCategoryIcon(task.category)}</div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{task.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <span className={`px-2 py-1 rounded-full text-xs border ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                    <div>
                      <span className="font-medium">影響:</span> {task.impact}
                    </div>
                    <div>
                      <span className="font-medium">工作量:</span> {task.effort}
                    </div>
                    <div>
                      <span className="font-medium">預估時間:</span> {task.estimatedTime}
                    </div>
                    <div>
                      <span className="font-medium">負責人:</span> {task.assignee}
                    </div>
                  </div>

                  {/* Metrics Comparison */}
                  {task.metrics.after && (
                    <div className="bg-gray-50 rounded p-3 mb-3">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">優化效果</h4>
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        {Object.entries(task.metrics.before).map(([key, beforeValue]) => {
                          const afterValue = task.metrics.after?.[key];
                          const improvement = afterValue ? ((afterValue - beforeValue) / beforeValue * 100).toFixed(1) : null;
                          return (
                            <div key={key} className="flex justify-between">
                              <span className="text-gray-600">{key}:</span>
                              <span>
                                {beforeValue} → {afterValue}
                                {improvement && (
                                  <span className={`ml-1 ${parseFloat(improvement) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    ({improvement}%)
                                  </span>
                                )}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <div className="text-xs text-gray-500">
                      創建於: {new Date(task.createdAt).toLocaleDateString()}
                      {task.completedAt && (
                        <span className="ml-2">
                          完成於: {new Date(task.completedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    
                    {task.status !== 'completed' && task.status !== 'failed' && (
                      <select
                        value={task.status}
                        onChange={(e) => updateTaskStatus(task.id, e.target.value as any)}
                        className="text-xs border border-gray-300 rounded px-2 py-1"
                      >
                        <option value="pending">待處理</option>
                        <option value="in-progress">進行中</option>
                        <option value="testing">測試中</option>
                        <option value="completed">已完成</option>
                        <option value="failed">失敗</option>
                      </select>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Metrics Dashboard */}
        <div className="space-y-6">
          {/* Performance Metrics */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">⚡ 性能指標</h3>
            <div className="space-y-3">
              {Object.entries(systemMetrics.performance).map(([key, value]) => {
                const score = getMetricScore(value, key);
                return (
                  <div key={key} className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">{key}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">{value}{key.includes('Time') ? 's' : key.includes('Rate') ? '%' : ''}</span>
                      <span className={`px-2 py-1 rounded text-xs ${getScoreColor(score)}`}>
                        {score}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Usability Metrics */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">👤 可用性指標</h3>
            <div className="space-y-3">
              {Object.entries(systemMetrics.usability).map(([key, value]) => {
                const score = getMetricScore(value, key);
                return (
                  <div key={key} className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">{key}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">{value}{key.includes('Rate') || key.includes('Efficiency') ? '%' : key.includes('Satisfaction') ? '/5' : ''}</span>
                      <span className={`px-2 py-1 rounded text-xs ${getScoreColor(score)}`}>
                        {score}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🚀 快速操作</h3>
            <div className="space-y-3">
              <button className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                <div className="font-medium text-blue-900">運行性能測試</div>
                <div className="text-sm text-blue-600">檢查系統當前性能指標</div>
              </button>
              
              <button className="w-full text-left p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                <div className="font-medium text-green-900">生成優化報告</div>
                <div className="text-sm text-green-600">導出詳細的系統優化報告</div>
              </button>
              
              <button className="w-full text-left p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                <div className="font-medium text-purple-900">無障礙檢查</div>
                <div className="text-sm text-purple-600">運行完整的無障礙合規性檢查</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
