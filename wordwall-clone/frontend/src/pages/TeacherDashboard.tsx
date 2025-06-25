import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  PlusIcon,
  AcademicCapIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  CalendarIcon,
  ClockIcon,
  TrophyIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { Button, SearchInput } from '@/components/ui';
import { useAuth } from '@/store/authStore';

interface Classroom {
  id: string;
  name: string;
  subject: string;
  grade?: string;
  classCode: string;
  studentsCount: number;
  assignmentsCount: number;
  createdAt: string;
}

interface Assignment {
  id: string;
  title: string;
  classroom: {
    name: string;
  };
  activity: {
    title: string;
    template: {
      name: string;
    };
  };
  dueDate?: string;
  submissionsCount: number;
  averageScore: number;
  createdAt: string;
}

interface DashboardStats {
  totalClassrooms: number;
  totalStudents: number;
  totalAssignments: number;
  averageScore: number;
}

/**
 * 教師儀表板頁面
 * 
 * 功能：
 * - 顯示教師的班級和作業概覽
 * - 快速創建班級和作業
 * - 查看統計數據
 * - 管理學生和結果
 */
const TeacherDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [recentAssignments, setRecentAssignments] = useState<Assignment[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalClassrooms: 0,
    totalStudents: 0,
    totalAssignments: 0,
    averageScore: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // 模擬數據載入
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // 模擬 API 調用
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 模擬班級數據
        const mockClassrooms: Classroom[] = [
          {
            id: '1',
            name: '高一數學A班',
            subject: '數學',
            grade: '高一',
            classCode: 'MATH1A',
            studentsCount: 28,
            assignmentsCount: 5,
            createdAt: '2024-01-15',
          },
          {
            id: '2',
            name: '高二物理B班',
            subject: '物理',
            grade: '高二',
            classCode: 'PHYS2B',
            studentsCount: 25,
            assignmentsCount: 3,
            createdAt: '2024-01-20',
          },
          {
            id: '3',
            name: '高三化學實驗班',
            subject: '化學',
            grade: '高三',
            classCode: 'CHEM3E',
            studentsCount: 22,
            assignmentsCount: 7,
            createdAt: '2024-02-01',
          },
        ];

        // 模擬作業數據
        const mockAssignments: Assignment[] = [
          {
            id: '1',
            title: '三角函數基礎測驗',
            classroom: { name: '高一數學A班' },
            activity: {
              title: '三角函數Quiz',
              template: { name: 'Quiz' },
            },
            dueDate: '2024-03-15',
            submissionsCount: 25,
            averageScore: 85.6,
            createdAt: '2024-03-01',
          },
          {
            id: '2',
            title: '力學概念配對',
            classroom: { name: '高二物理B班' },
            activity: {
              title: '力學Match Up',
              template: { name: 'Match Up' },
            },
            dueDate: '2024-03-20',
            submissionsCount: 18,
            averageScore: 78.3,
            createdAt: '2024-03-05',
          },
        ];

        // 模擬統計數據
        const mockStats: DashboardStats = {
          totalClassrooms: mockClassrooms.length,
          totalStudents: mockClassrooms.reduce((sum, c) => sum + c.studentsCount, 0),
          totalAssignments: mockClassrooms.reduce((sum, c) => sum + c.assignmentsCount, 0),
          averageScore: 82.4,
        };

        setClassrooms(mockClassrooms);
        setRecentAssignments(mockAssignments);
        setStats(mockStats);
        setLoading(false);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const filteredClassrooms = classrooms.filter(classroom =>
    classroom.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    classroom.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner h-8 w-8 mx-auto mb-4"></div>
          <p className="text-gray-600">載入儀表板中...</p>
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
            管理您的班級、作業和學生進度
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
                <p className="text-sm font-medium text-gray-600">班級數量</p>
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
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <UserGroupIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">學生總數</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
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
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <ClipboardDocumentListIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">作業總數</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalAssignments}</p>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 班級列表 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">我的班級</h2>
                <Link to="/classroom/create">
                  <Button size="sm">
                    <PlusIcon className="h-4 w-4 mr-2" />
                    創建班級
                  </Button>
                </Link>
              </div>

              <div className="mb-4">
                <SearchInput
                  placeholder="搜索班級..."
                  onSearch={setSearchQuery}
                />
              </div>

              <div className="space-y-4">
                {filteredClassrooms.map((classroom, index) => (
                  <motion.div
                    key={classroom.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => navigate(`/classroom/${classroom.id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900 mb-1">
                          {classroom.name}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>{classroom.subject}</span>
                          {classroom.grade && <span>{classroom.grade}</span>}
                          <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                            {classroom.classCode}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center">
                            <UserGroupIcon className="h-4 w-4 mr-1" />
                            {classroom.studentsCount} 學生
                          </span>
                          <span className="flex items-center">
                            <ClipboardDocumentListIcon className="h-4 w-4 mr-1" />
                            {classroom.assignmentsCount} 作業
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <EyeIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {filteredClassrooms.length === 0 && (
                <div className="text-center py-8">
                  <AcademicCapIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchQuery ? '沒有找到匹配的班級' : '還沒有班級'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {searchQuery ? '請嘗試其他搜索條件' : '創建您的第一個班級開始教學'}
                  </p>
                  {!searchQuery && (
                    <Link to="/classroom/create">
                      <Button>
                        <PlusIcon className="h-4 w-4 mr-2" />
                        創建班級
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 最近作業 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">最近作業</h2>
                <Link to="/assignments">
                  <Button variant="ghost" size="sm">
                    查看全部
                  </Button>
                </Link>
              </div>

              <div className="space-y-4">
                {recentAssignments.map((assignment, index) => (
                  <motion.div
                    key={assignment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => navigate(`/assignment/${assignment.id}/results`)}
                  >
                    <h3 className="font-medium text-gray-900 mb-2">
                      {assignment.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {assignment.classroom.name}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span className="flex items-center">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : '無截止日期'}
                      </span>
                      <span className="flex items-center">
                        <ChartBarIcon className="h-4 w-4 mr-1" />
                        {assignment.averageScore}%
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      {assignment.submissionsCount} 份提交
                    </div>
                  </motion.div>
                ))}
              </div>

              {recentAssignments.length === 0 && (
                <div className="text-center py-8">
                  <ClipboardDocumentListIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    還沒有作業
                  </h3>
                  <p className="text-gray-600">
                    創建您的第一個作業
                  </p>
                </div>
              )}
            </div>

            {/* 快速操作 */}
            <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">快速操作</h2>
              <div className="space-y-3">
                <Link to="/create" className="block">
                  <Button variant="secondary" fullWidth>
                    <PlusIcon className="h-4 w-4 mr-2" />
                    創建新活動
                  </Button>
                </Link>
                <Link to="/classroom/create" className="block">
                  <Button variant="secondary" fullWidth>
                    <AcademicCapIcon className="h-4 w-4 mr-2" />
                    創建新班級
                  </Button>
                </Link>
                <Link to="/analytics" className="block">
                  <Button variant="secondary" fullWidth>
                    <ChartBarIcon className="h-4 w-4 mr-2" />
                    查看分析報告
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
