import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  PlusIcon,
  AcademicCapIcon,
  ClipboardDocumentListIcon,
  TrophyIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CalendarDaysIcon,
  PlayIcon,
} from '@heroicons/react/24/outline';
import { Button, SearchInput } from '@/components/ui';
import { useAuth } from '@/store/authStore';

interface StudentClassroom {
  id: string;
  name: string;
  subject: string;
  teacher: {
    displayName: string;
  };
  classCode: string;
  joinedAt: string;
}

interface StudentAssignment {
  id: string;
  title: string;
  description?: string;
  classroom: {
    name: string;
    subject: string;
  };
  activity: {
    title: string;
    template: {
      name: string;
      type: string;
    };
  };
  dueDate?: string;
  maxAttempts: number;
  timeLimit?: number;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  attempts: number;
  bestScore?: number;
  lastAttemptAt?: string;
  accessCode: string;
}

interface StudentStats {
  totalClassrooms: number;
  totalAssignments: number;
  completedAssignments: number;
  averageScore: number;
  totalPlayTime: number;
}

/**
 * 學生儀表板頁面
 * 
 * 功能：
 * - 顯示學生的班級和作業
 * - 查看作業狀態和成績
 * - 快速開始作業
 * - 加入新班級
 */
const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [classrooms, setClassrooms] = useState<StudentClassroom[]>([]);
  const [assignments, setAssignments] = useState<StudentAssignment[]>([]);
  const [stats, setStats] = useState<StudentStats>({
    totalClassrooms: 0,
    totalAssignments: 0,
    completedAssignments: 0,
    averageScore: 0,
    totalPlayTime: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');

  // 模擬數據載入
  useEffect(() => {
    const loadStudentData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 模擬班級數據
        const mockClassrooms: StudentClassroom[] = [
          {
            id: '1',
            name: '高一數學A班',
            subject: '數學',
            teacher: { displayName: '王老師' },
            classCode: 'MATH1A',
            joinedAt: '2024-01-15',
          },
          {
            id: '2',
            name: '高一英語B班',
            subject: '英語',
            teacher: { displayName: '李老師' },
            classCode: 'ENG1B',
            joinedAt: '2024-01-20',
          },
        ];

        // 模擬作業數據
        const mockAssignments: StudentAssignment[] = [
          {
            id: '1',
            title: '三角函數基礎測驗',
            description: '測試三角函數的基本概念和計算',
            classroom: { name: '高一數學A班', subject: '數學' },
            activity: {
              title: '三角函數Quiz',
              template: { name: 'Quiz', type: 'QUIZ' },
            },
            dueDate: '2024-03-20',
            maxAttempts: 3,
            timeLimit: 1800,
            status: 'pending',
            attempts: 0,
            accessCode: 'TRIG001',
          },
          {
            id: '2',
            title: '英語詞彙配對練習',
            classroom: { name: '高一英語B班', subject: '英語' },
            activity: {
              title: '詞彙Match Up',
              template: { name: 'Match Up', type: 'MATCH_UP' },
            },
            dueDate: '2024-03-18',
            maxAttempts: 2,
            status: 'completed',
            attempts: 2,
            bestScore: 85,
            lastAttemptAt: '2024-03-15',
            accessCode: 'VOCAB01',
          },
          {
            id: '3',
            title: '歷史事件時間軸',
            classroom: { name: '高一歷史班', subject: '歷史' },
            activity: {
              title: '歷史排序',
              template: { name: 'Group Sort', type: 'GROUP_SORT' },
            },
            dueDate: '2024-03-16',
            maxAttempts: 1,
            status: 'overdue',
            attempts: 0,
            accessCode: 'HIST01',
          },
        ];

        // 模擬統計數據
        const completedCount = mockAssignments.filter(a => a.status === 'completed').length;
        const totalScore = mockAssignments
          .filter(a => a.bestScore)
          .reduce((sum, a) => sum + (a.bestScore || 0), 0);
        const avgScore = completedCount > 0 ? totalScore / completedCount : 0;

        const mockStats: StudentStats = {
          totalClassrooms: mockClassrooms.length,
          totalAssignments: mockAssignments.length,
          completedAssignments: completedCount,
          averageScore: Math.round(avgScore * 100) / 100,
          totalPlayTime: 3600, // 1 hour in seconds
        };

        setClassrooms(mockClassrooms);
        setAssignments(mockAssignments);
        setStats(mockStats);
        setLoading(false);
      } catch (error) {
        console.error('Failed to load student data:', error);
        setLoading(false);
      }
    };

    loadStudentData();
  }, []);

  const filteredAssignments = assignments.filter(assignment =>
    assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    assignment.classroom.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingAssignments = filteredAssignments.filter(a => a.status === 'pending');
  const overdueAssignments = filteredAssignments.filter(a => a.status === 'overdue');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'overdue':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      case 'in_progress':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      default:
        return <ClipboardDocumentListIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return '已完成';
      case 'overdue':
        return '已逾期';
      case 'in_progress':
        return '進行中';
      default:
        return '待完成';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'overdue':
        return 'text-red-600 bg-red-100';
      case 'in_progress':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const handleJoinClassroom = async () => {
    if (!joinCode.trim()) return;

    try {
      // 這裡應該調用 API 加入班級
      console.log('Joining classroom with code:', joinCode);
      setJoinCode('');
      setShowJoinModal(false);
      // 重新載入數據
    } catch (error) {
      console.error('Failed to join classroom:', error);
    }
  };

  const handleStartAssignment = (assignment: StudentAssignment) => {
    navigate(`/play/assignment/${assignment.accessCode}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner h-8 w-8 mx-auto mb-4"></div>
          <p className="text-gray-600">載入學習資料中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 頁面標題 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            歡迎回來，{user?.displayName}
          </h1>
          <p className="text-lg text-gray-600">
            查看您的作業和學習進度
          </p>
        </div>

        {/* 統計卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center">
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <AcademicCapIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">加入班級</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalClassrooms}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center">
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <ClipboardDocumentListIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">總作業數</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalAssignments}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center">
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">已完成</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedAssignments}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center">
              <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <TrophyIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">平均分數</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageScore}%</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* 緊急提醒 */}
        {overdueAssignments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6"
          >
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mr-3" />
              <div>
                <h3 className="text-lg font-medium text-red-900">
                  您有 {overdueAssignments.length} 個作業已逾期
                </h3>
                <p className="text-red-700">請盡快完成以免影響成績</p>
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 作業列表 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">我的作業</h2>
                <div className="flex items-center space-x-3">
                  <SearchInput
                    placeholder="搜索作業..."
                    onSearch={setSearchQuery}
                    className="w-64"
                  />
                </div>
              </div>

              <div className="space-y-4">
                {filteredAssignments.map((assignment, index) => (
                  <motion.div
                    key={assignment.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-medium text-gray-900">
                            {assignment.title}
                          </h3>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(assignment.status)}`}>
                            {getStatusText(assignment.status)}
                          </span>
                        </div>
                        
                        <div className="text-sm text-gray-600 mb-2">
                          {assignment.classroom.name} • {assignment.activity.template.name}
                        </div>
                        
                        {assignment.description && (
                          <p className="text-sm text-gray-600 mb-3">{assignment.description}</p>
                        )}
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          {assignment.dueDate && (
                            <span className="flex items-center">
                              <CalendarDaysIcon className="h-4 w-4 mr-1" />
                              截止：{new Date(assignment.dueDate).toLocaleDateString()}
                            </span>
                          )}
                          <span>
                            嘗試次數：{assignment.attempts} / {assignment.maxAttempts}
                          </span>
                          {assignment.bestScore && (
                            <span className="flex items-center">
                              <TrophyIcon className="h-4 w-4 mr-1" />
                              最佳分數：{assignment.bestScore}%
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        {getStatusIcon(assignment.status)}
                        {assignment.status !== 'completed' && assignment.attempts < assignment.maxAttempts && (
                          <Button
                            size="sm"
                            onClick={() => handleStartAssignment(assignment)}
                          >
                            <PlayIcon className="h-4 w-4 mr-2" />
                            {assignment.attempts > 0 ? '重新嘗試' : '開始作業'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {filteredAssignments.length === 0 && (
                <div className="text-center py-8">
                  <ClipboardDocumentListIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchQuery ? '沒有找到匹配的作業' : '還沒有作業'}
                  </h3>
                  <p className="text-gray-600">
                    {searchQuery ? '請嘗試其他搜索條件' : '等待老師分配作業或加入新班級'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 側邊欄 */}
          <div className="lg:col-span-1 space-y-6">
            {/* 我的班級 */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">我的班級</h2>
                <Button
                  size="sm"
                  onClick={() => setShowJoinModal(true)}
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  加入班級
                </Button>
              </div>

              <div className="space-y-3">
                {classrooms.map((classroom) => (
                  <div key={classroom.id} className="border border-gray-200 rounded-lg p-3">
                    <h3 className="font-medium text-gray-900">{classroom.name}</h3>
                    <p className="text-sm text-gray-600">{classroom.subject}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {classroom.teacher.displayName} • {classroom.classCode}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* 待完成作業 */}
            {pendingAssignments.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  待完成作業 ({pendingAssignments.length})
                </h2>
                <div className="space-y-3">
                  {pendingAssignments.slice(0, 3).map((assignment) => (
                    <div key={assignment.id} className="border border-gray-200 rounded-lg p-3">
                      <h3 className="font-medium text-gray-900 text-sm">{assignment.title}</h3>
                      <p className="text-xs text-gray-600">{assignment.classroom.name}</p>
                      {assignment.dueDate && (
                        <p className="text-xs text-gray-500 mt-1">
                          截止：{new Date(assignment.dueDate).toLocaleDateString()}
                        </p>
                      )}
                      <Button
                        size="sm"
                        fullWidth
                        className="mt-2"
                        onClick={() => handleStartAssignment(assignment)}
                      >
                        開始作業
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 加入班級模態框 */}
        {showJoinModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">加入班級</h2>
              <p className="text-gray-600 mb-4">請輸入老師提供的班級代碼</p>
              
              <div className="mb-4">
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="輸入班級代碼"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="flex space-x-3">
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() => {
                    setShowJoinModal(false);
                    setJoinCode('');
                  }}
                >
                  取消
                </Button>
                <Button
                  fullWidth
                  onClick={handleJoinClassroom}
                  disabled={!joinCode.trim()}
                >
                  加入班級
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
