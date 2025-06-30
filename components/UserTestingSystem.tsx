import React, { useState, useEffect } from 'react';

// User Testing Data Types
interface TestUser {
  id: string;
  name: string;
  email: string;
  role: 'teacher' | 'student' | 'parent' | 'trainer';
  experience: 'beginner' | 'intermediate' | 'advanced';
  device: 'desktop' | 'tablet' | 'mobile';
  joinedAt: string;
  status: 'invited' | 'active' | 'completed' | 'dropped';
}

interface TestTask {
  id: string;
  title: string;
  description: string;
  type: 'navigation' | 'creation' | 'gameplay' | 'sharing' | 'analysis';
  estimatedTime: number;
  instructions: string[];
  successCriteria: string[];
}

interface TestSession {
  id: string;
  userId: string;
  startTime: string;
  endTime?: string;
  completedTasks: string[];
  feedback: TestFeedback[];
  metrics: SessionMetrics;
  status: 'in-progress' | 'completed' | 'abandoned';
}

interface TestFeedback {
  taskId: string;
  rating: number;
  difficulty: number;
  comments: string;
  suggestions: string;
  timestamp: string;
}

interface SessionMetrics {
  totalTime: number;
  tasksCompleted: number;
  errorsEncountered: number;
  helpRequests: number;
  satisfactionScore: number;
}

// User Testing System Component
export default function UserTestingSystem() {
  const [activePhase, setActivePhase] = useState<'alpha' | 'beta' | 'production'>('alpha');
  const [testUsers, setTestUsers] = useState<TestUser[]>([]);
  const [testSessions, setTestSessions] = useState<TestSession[]>([]);
  const [selectedUser, setSelectedUser] = useState<TestUser | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Test Tasks Configuration
  const testTasks: TestTask[] = [
    {
      id: 'task-1',
      title: '註冊和設置個人資料',
      description: '完成用戶註冊流程並設置個人學習偏好',
      type: 'navigation',
      estimatedTime: 5,
      instructions: [
        '點擊註冊按鈕',
        '填寫基本信息',
        '選擇學習偏好',
        '完成郵箱驗證'
      ],
      successCriteria: [
        '成功創建帳戶',
        '個人資料完整',
        '偏好設置正確'
      ]
    },
    {
      id: 'task-2',
      title: '創建第一個測驗遊戲',
      description: '使用系統創建一個包含5個問題的測驗',
      type: 'creation',
      estimatedTime: 10,
      instructions: [
        '選擇Quiz模板',
        '輸入遊戲標題',
        '添加5個問題和答案',
        '設置遊戲選項',
        '保存並預覽'
      ],
      successCriteria: [
        '遊戲創建成功',
        '所有問題格式正確',
        '可以正常預覽'
      ]
    },
    {
      id: 'task-3',
      title: '體驗AI內容生成',
      description: '使用AI功能自動生成測驗內容',
      type: 'creation',
      estimatedTime: 8,
      instructions: [
        '點擊AI生成按鈕',
        '輸入主題關鍵詞',
        '選擇難度等級',
        '生成並編輯內容',
        '保存生成的遊戲'
      ],
      successCriteria: [
        'AI成功生成內容',
        '內容質量滿意',
        '可以進行編輯'
      ]
    },
    {
      id: 'task-4',
      title: '遊玩不同類型的遊戲',
      description: '體驗至少3種不同的遊戲模板',
      type: 'gameplay',
      estimatedTime: 15,
      instructions: [
        '選擇Quiz遊戲並完成',
        '嘗試Match遊戲',
        '體驗Flashcard功能',
        '查看遊戲結果',
        '比較不同遊戲體驗'
      ],
      successCriteria: [
        '完成3種遊戲',
        '理解遊戲機制',
        '獲得結果反饋'
      ]
    },
    {
      id: 'task-5',
      title: '分享和協作功能',
      description: '分享遊戲並邀請他人參與',
      type: 'sharing',
      estimatedTime: 7,
      instructions: [
        '選擇要分享的遊戲',
        '生成分享鏈接',
        '設置分享權限',
        '通過不同方式分享',
        '查看分享統計'
      ],
      successCriteria: [
        '成功生成分享鏈接',
        '權限設置正確',
        '他人可以訪問'
      ]
    },
    {
      id: 'task-6',
      title: '查看學習分析報告',
      description: '探索數據分析和學習進度功能',
      type: 'analysis',
      estimatedTime: 10,
      instructions: [
        '進入分析頁面',
        '查看個人學習數據',
        '理解圖表含義',
        '導出學習報告',
        '設置學習目標'
      ],
      successCriteria: [
        '能夠理解數據',
        '成功導出報告',
        '設置合理目標'
      ]
    }
  ];

  // Mock data for demonstration
  useEffect(() => {
    const mockUsers: TestUser[] = [
      {
        id: 'user-1',
        name: '張老師',
        email: 'teacher.zhang@example.com',
        role: 'teacher',
        experience: 'intermediate',
        device: 'desktop',
        joinedAt: '2024-01-15T10:00:00Z',
        status: 'active'
      },
      {
        id: 'user-2',
        name: '李同學',
        email: 'student.li@example.com',
        role: 'student',
        experience: 'beginner',
        device: 'mobile',
        joinedAt: '2024-01-16T14:30:00Z',
        status: 'completed'
      },
      {
        id: 'user-3',
        name: '王家長',
        email: 'parent.wang@example.com',
        role: 'parent',
        experience: 'beginner',
        device: 'tablet',
        joinedAt: '2024-01-17T09:15:00Z',
        status: 'active'
      }
    ];
    setTestUsers(mockUsers);
  }, []);

  const inviteUser = (userData: Partial<TestUser>) => {
    const newUser: TestUser = {
      id: `user-${Date.now()}`,
      name: userData.name || '',
      email: userData.email || '',
      role: userData.role || 'student',
      experience: userData.experience || 'beginner',
      device: userData.device || 'desktop',
      joinedAt: new Date().toISOString(),
      status: 'invited'
    };
    
    setTestUsers(prev => [...prev, newUser]);
    
    // Simulate sending invitation email
    console.log(`Invitation sent to ${newUser.email}`);
    
    setShowInviteModal(false);
  };

  const startTestSession = (userId: string) => {
    const newSession: TestSession = {
      id: `session-${Date.now()}`,
      userId,
      startTime: new Date().toISOString(),
      completedTasks: [],
      feedback: [],
      metrics: {
        totalTime: 0,
        tasksCompleted: 0,
        errorsEncountered: 0,
        helpRequests: 0,
        satisfactionScore: 0
      },
      status: 'in-progress'
    };
    
    setTestSessions(prev => [...prev, newSession]);
  };

  const getPhaseStats = () => {
    const activeUsers = testUsers.filter(u => u.status === 'active').length;
    const completedUsers = testUsers.filter(u => u.status === 'completed').length;
    const totalSessions = testSessions.length;
    const avgSatisfaction = testSessions.reduce((sum, s) => sum + s.metrics.satisfactionScore, 0) / totalSessions || 0;

    return {
      activeUsers,
      completedUsers,
      totalSessions,
      avgSatisfaction: avgSatisfaction.toFixed(1)
    };
  };

  const stats = getPhaseStats();

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">🧪 用戶測試系統</h1>
        
        {/* Phase Selector */}
        <div className="flex space-x-4 mb-6">
          {(['alpha', 'beta', 'production'] as const).map((phase) => (
            <button
              key={phase}
              onClick={() => setActivePhase(phase)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activePhase === phase
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {phase === 'alpha' ? 'Alpha 測試' : 
               phase === 'beta' ? 'Beta 測試' : '生產測試'}
            </button>
          ))}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-blue-50 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">活躍用戶</p>
                <p className="text-3xl font-bold text-blue-900">{stats.activeUsers}</p>
              </div>
              <div className="text-blue-500 text-2xl">👥</div>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">完成測試</p>
                <p className="text-3xl font-bold text-green-900">{stats.completedUsers}</p>
              </div>
              <div className="text-green-500 text-2xl">✅</div>
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">測試會話</p>
                <p className="text-3xl font-bold text-purple-900">{stats.totalSessions}</p>
              </div>
              <div className="text-purple-500 text-2xl">📊</div>
            </div>
          </div>

          <div className="bg-orange-50 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-medium">平均滿意度</p>
                <p className="text-3xl font-bold text-orange-900">{stats.avgSatisfaction}</p>
              </div>
              <div className="text-orange-500 text-2xl">⭐</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Test Users */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">測試用戶</h2>
              <button
                onClick={() => setShowInviteModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                + 邀請用戶
              </button>
            </div>

            <div className="space-y-4">
              {testUsers.map((user) => (
                <div
                  key={user.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedUser?.id === user.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedUser(user)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">{user.name}</h3>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <div className="flex space-x-4 mt-2 text-xs text-gray-500">
                        <span>角色: {user.role}</span>
                        <span>經驗: {user.experience}</span>
                        <span>設備: {user.device}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        user.status === 'active' ? 'bg-green-100 text-green-800' :
                        user.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        user.status === 'invited' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {user.status}
                      </span>
                      {user.status === 'invited' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startTestSession(user.id);
                          }}
                          className="mt-2 text-blue-600 text-sm hover:text-blue-800"
                        >
                          開始測試
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Test Tasks */}
        <div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">測試任務</h2>
            
            <div className="space-y-4">
              {testTasks.map((task, index) => (
                <div key={task.id} className="border rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 text-sm">{task.title}</h3>
                      <p className="text-xs text-gray-600 mt-1">{task.description}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-gray-500">
                          預估: {task.estimatedTime}分鐘
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          task.type === 'navigation' ? 'bg-blue-100 text-blue-800' :
                          task.type === 'creation' ? 'bg-green-100 text-green-800' :
                          task.type === 'gameplay' ? 'bg-purple-100 text-purple-800' :
                          task.type === 'sharing' ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {task.type}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">邀請測試用戶</h3>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              inviteUser({
                name: formData.get('name') as string,
                email: formData.get('email') as string,
                role: formData.get('role') as any,
                experience: formData.get('experience') as any,
                device: formData.get('device') as any
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">姓名</label>
                  <input
                    name="name"
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">郵箱</label>
                  <input
                    name="email"
                    type="email"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">角色</label>
                  <select
                    name="role"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="teacher">教師</option>
                    <option value="student">學生</option>
                    <option value="parent">家長</option>
                    <option value="trainer">培訓師</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">經驗水平</label>
                  <select
                    name="experience"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="beginner">初學者</option>
                    <option value="intermediate">中級</option>
                    <option value="advanced">高級</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">主要設備</label>
                  <select
                    name="device"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="desktop">桌面電腦</option>
                    <option value="tablet">平板電腦</option>
                    <option value="mobile">手機</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  發送邀請
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
