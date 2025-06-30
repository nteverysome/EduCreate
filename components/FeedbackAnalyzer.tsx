import React, { useState, useEffect } from 'react';

// Feedback Analysis Types
interface UserFeedback {
  id: string;
  userId: string;
  userName: string;
  userRole: 'teacher' | 'student' | 'parent' | 'trainer';
  category: 'usability' | 'functionality' | 'performance' | 'content' | 'suggestion';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  rating: number;
  tags: string[];
  status: 'new' | 'reviewing' | 'planned' | 'in-progress' | 'resolved' | 'rejected';
  createdAt: string;
  resolvedAt?: string;
  response?: string;
}

interface FeedbackAnalytics {
  totalFeedback: number;
  averageRating: number;
  categoryDistribution: Record<string, number>;
  priorityDistribution: Record<string, number>;
  statusDistribution: Record<string, number>;
  userRoleDistribution: Record<string, number>;
  trendData: Array<{ date: string; count: number; rating: number }>;
  topIssues: Array<{ issue: string; count: number; impact: string }>;
  improvementAreas: Array<{ area: string; score: number; suggestions: string[] }>;
}

export default function FeedbackAnalyzer() {
  const [feedbackList, setFeedbackList] = useState<UserFeedback[]>([]);
  const [analytics, setAnalytics] = useState<FeedbackAnalytics | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [showDetails, setShowDetails] = useState<string | null>(null);

  // Mock feedback data
  useEffect(() => {
    const mockFeedback: UserFeedback[] = [
      {
        id: 'fb-1',
        userId: 'user-1',
        userName: '張老師',
        userRole: 'teacher',
        category: 'usability',
        priority: 'high',
        title: 'AI內容生成速度較慢',
        description: '使用AI生成測驗內容時，等待時間較長，希望能夠優化響應速度。',
        rating: 3,
        tags: ['AI', '性能', '用戶體驗'],
        status: 'in-progress',
        createdAt: '2024-01-15T10:30:00Z'
      },
      {
        id: 'fb-2',
        userId: 'user-2',
        userName: '李同學',
        userRole: 'student',
        category: 'functionality',
        priority: 'medium',
        title: '希望增加更多遊戲模板',
        description: '現有的遊戲類型很好，但希望能有更多選擇，特別是數學相關的遊戲。',
        rating: 4,
        tags: ['遊戲模板', '數學', '功能需求'],
        status: 'planned',
        createdAt: '2024-01-16T14:20:00Z'
      },
      {
        id: 'fb-3',
        userId: 'user-3',
        userName: '王家長',
        userRole: 'parent',
        category: 'usability',
        priority: 'medium',
        title: '移動端界面需要優化',
        description: '在手機上使用時，部分按鈕較小，操作不夠便利。',
        rating: 3,
        tags: ['移動端', '界面設計', '可用性'],
        status: 'resolved',
        createdAt: '2024-01-17T09:15:00Z',
        resolvedAt: '2024-01-20T16:30:00Z',
        response: '已優化移動端界面，增大按鈕尺寸並改善觸摸體驗。'
      },
      {
        id: 'fb-4',
        userId: 'user-4',
        userName: '陳培訓師',
        userRole: 'trainer',
        category: 'content',
        priority: 'high',
        title: '記憶增強功能很有用',
        description: '記憶增強系統的個性化推薦很準確，學員的學習效果明顯提升。',
        rating: 5,
        tags: ['記憶增強', '個性化', '學習效果'],
        status: 'resolved',
        createdAt: '2024-01-18T11:45:00Z'
      },
      {
        id: 'fb-5',
        userId: 'user-5',
        userName: '劉老師',
        userRole: 'teacher',
        category: 'performance',
        priority: 'critical',
        title: '系統偶爾會卡頓',
        description: '在創建複雜遊戲時，系統響應變慢，有時會出現卡頓現象。',
        rating: 2,
        tags: ['性能', '穩定性', '用戶體驗'],
        status: 'reviewing',
        createdAt: '2024-01-19T13:20:00Z'
      }
    ];

    setFeedbackList(mockFeedback);
    generateAnalytics(mockFeedback);
  }, []);

  const generateAnalytics = (feedback: UserFeedback[]) => {
    const totalFeedback = feedback.length;
    const averageRating = feedback.reduce((sum, fb) => sum + fb.rating, 0) / totalFeedback;

    const categoryDistribution = feedback.reduce((acc, fb) => {
      acc[fb.category] = (acc[fb.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const priorityDistribution = feedback.reduce((acc, fb) => {
      acc[fb.priority] = (acc[fb.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const statusDistribution = feedback.reduce((acc, fb) => {
      acc[fb.status] = (acc[fb.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const userRoleDistribution = feedback.reduce((acc, fb) => {
      acc[fb.userRole] = (acc[fb.userRole] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Generate trend data (mock)
    const trendData = [
      { date: '2024-01-15', count: 5, rating: 3.8 },
      { date: '2024-01-16', count: 8, rating: 4.1 },
      { date: '2024-01-17', count: 12, rating: 3.9 },
      { date: '2024-01-18', count: 15, rating: 4.2 },
      { date: '2024-01-19', count: 18, rating: 4.0 }
    ];

    const topIssues = [
      { issue: 'AI生成速度優化', count: 8, impact: '影響用戶體驗' },
      { issue: '移動端界面改進', count: 6, impact: '影響移動用戶' },
      { issue: '系統性能優化', count: 4, impact: '影響系統穩定性' },
      { issue: '遊戲模板擴展', count: 3, impact: '影響功能豐富度' }
    ];

    const improvementAreas = [
      {
        area: '用戶界面',
        score: 3.5,
        suggestions: ['優化移動端設計', '改善按鈕大小', '提升視覺一致性']
      },
      {
        area: '系統性能',
        score: 3.2,
        suggestions: ['優化AI響應速度', '減少系統卡頓', '提升加載速度']
      },
      {
        area: '功能完整性',
        score: 4.1,
        suggestions: ['增加更多遊戲模板', '擴展分析功能', '添加協作工具']
      },
      {
        area: '內容質量',
        score: 4.3,
        suggestions: ['提升AI生成質量', '增加內容多樣性', '改進個性化推薦']
      }
    ];

    setAnalytics({
      totalFeedback,
      averageRating,
      categoryDistribution,
      priorityDistribution,
      statusDistribution,
      userRoleDistribution,
      trendData,
      topIssues,
      improvementAreas
    });
  };

  const filteredFeedback = feedbackList.filter(fb => {
    const categoryMatch = selectedCategory === 'all' || fb.category === selectedCategory;
    const priorityMatch = selectedPriority === 'all' || fb.priority === selectedPriority;
    return categoryMatch && priorityMatch;
  });

  const updateFeedbackStatus = (feedbackId: string, newStatus: UserFeedback['status']) => {
    setFeedbackList(prev => prev.map(fb => 
      fb.id === feedbackId 
        ? { ...fb, status: newStatus, resolvedAt: newStatus === 'resolved' ? new Date().toISOString() : undefined }
        : fb
    ));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'text-blue-600 bg-blue-100';
      case 'reviewing': return 'text-purple-600 bg-purple-100';
      case 'planned': return 'text-indigo-600 bg-indigo-100';
      case 'in-progress': return 'text-orange-600 bg-orange-100';
      case 'resolved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (!analytics) return <div>Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">📊 用戶反饋分析</h1>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-blue-50 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">總反饋數</p>
                <p className="text-3xl font-bold text-blue-900">{analytics.totalFeedback}</p>
              </div>
              <div className="text-blue-500 text-2xl">💬</div>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">平均評分</p>
                <p className="text-3xl font-bold text-green-900">{analytics.averageRating.toFixed(1)}</p>
              </div>
              <div className="text-green-500 text-2xl">⭐</div>
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">已解決</p>
                <p className="text-3xl font-bold text-purple-900">{analytics.statusDistribution.resolved || 0}</p>
              </div>
              <div className="text-purple-500 text-2xl">✅</div>
            </div>
          </div>

          <div className="bg-orange-50 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-medium">處理中</p>
                <p className="text-3xl font-bold text-orange-900">
                  {(analytics.statusDistribution['in-progress'] || 0) + (analytics.statusDistribution.reviewing || 0)}
                </p>
              </div>
              <div className="text-orange-500 text-2xl">🔄</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">分類</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="all">全部</option>
              <option value="usability">可用性</option>
              <option value="functionality">功能性</option>
              <option value="performance">性能</option>
              <option value="content">內容</option>
              <option value="suggestion">建議</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">優先級</label>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="all">全部</option>
              <option value="critical">緊急</option>
              <option value="high">高</option>
              <option value="medium">中</option>
              <option value="low">低</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Feedback List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">反饋列表</h2>
            
            <div className="space-y-4">
              {filteredFeedback.map((feedback) => (
                <div key={feedback.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{feedback.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{feedback.description}</p>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(feedback.priority)}`}>
                        {feedback.priority}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(feedback.status)}`}>
                        {feedback.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <span>{feedback.userName} ({feedback.userRole})</span>
                      <span>評分: {feedback.rating}/5</span>
                      <span>{new Date(feedback.createdAt).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="flex space-x-2">
                      {feedback.status !== 'resolved' && (
                        <select
                          value={feedback.status}
                          onChange={(e) => updateFeedbackStatus(feedback.id, e.target.value as any)}
                          className="text-xs border border-gray-300 rounded px-2 py-1"
                        >
                          <option value="new">新建</option>
                          <option value="reviewing">審核中</option>
                          <option value="planned">已計劃</option>
                          <option value="in-progress">處理中</option>
                          <option value="resolved">已解決</option>
                          <option value="rejected">已拒絕</option>
                        </select>
                      )}
                      
                      <button
                        onClick={() => setShowDetails(showDetails === feedback.id ? null : feedback.id)}
                        className="text-blue-600 hover:text-blue-800 text-xs"
                      >
                        {showDetails === feedback.id ? '收起' : '詳情'}
                      </button>
                    </div>
                  </div>

                  {showDetails === feedback.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="space-y-2 text-sm">
                        <div><strong>標籤:</strong> {feedback.tags.join(', ')}</div>
                        <div><strong>分類:</strong> {feedback.category}</div>
                        {feedback.response && (
                          <div className="bg-green-50 p-3 rounded">
                            <strong>回應:</strong> {feedback.response}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Analytics Sidebar */}
        <div className="space-y-6">
          {/* Top Issues */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">主要問題</h3>
            <div className="space-y-3">
              {analytics.topIssues.map((issue, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{issue.issue}</p>
                    <p className="text-xs text-gray-500">{issue.impact}</p>
                  </div>
                  <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                    {issue.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Improvement Areas */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">改進領域</h3>
            <div className="space-y-4">
              {analytics.improvementAreas.map((area, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-900">{area.area}</span>
                    <span className="text-sm text-gray-600">{area.score}/5</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(area.score / 5) * 100}%` }}
                    />
                  </div>
                  <ul className="mt-2 text-xs text-gray-600">
                    {area.suggestions.slice(0, 2).map((suggestion, idx) => (
                      <li key={idx}>• {suggestion}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Category Distribution */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">分類分布</h3>
            <div className="space-y-2">
              {Object.entries(analytics.categoryDistribution).map(([category, count]) => (
                <div key={category} className="flex justify-between items-center">
                  <span className="text-sm text-gray-700 capitalize">{category}</span>
                  <span className="text-sm font-medium text-gray-900">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
