import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  TrophyIcon,
  ClockIcon,
  UserGroupIcon,
  AcademicCapIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui';

interface AnalyticsData {
  overview: {
    totalStudents: number;
    totalActivities: number;
    totalPlayTime: number;
    averageScore: number;
    completionRate: number;
    engagementRate: number;
  };
  trends: {
    period: string;
    students: number;
    activities: number;
    avgScore: number;
    playTime: number;
  }[];
  topActivities: {
    id: string;
    title: string;
    type: string;
    plays: number;
    avgScore: number;
    avgTime: number;
  }[];
  studentPerformance: {
    excellent: number; // 90-100%
    good: number;      // 70-89%
    average: number;   // 50-69%
    needsHelp: number; // <50%
  };
  activityTypes: {
    type: string;
    count: number;
    avgScore: number;
    popularity: number;
  }[];
}

/**
 * 數據分析頁面
 * 
 * 功能：
 * - 顯示教學數據統計
 * - 學生表現分析
 * - 活動使用情況
 * - 趨勢圖表
 */
const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  // 模擬數據載入
  useEffect(() => {
    const loadAnalyticsData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));

        const mockData: AnalyticsData = {
          overview: {
            totalStudents: 156,
            totalActivities: 24,
            totalPlayTime: 45600, // seconds
            averageScore: 78.5,
            completionRate: 85.2,
            engagementRate: 92.1,
          },
          trends: [
            { period: '第1週', students: 120, activities: 18, avgScore: 75.2, playTime: 8400 },
            { period: '第2週', students: 135, activities: 20, avgScore: 77.8, playTime: 9600 },
            { period: '第3週', students: 142, activities: 22, avgScore: 79.1, playTime: 11200 },
            { period: '第4週', students: 156, activities: 24, avgScore: 78.5, playTime: 12800 },
          ],
          topActivities: [
            {
              id: '1',
              title: '三角函數基礎測驗',
              type: 'Quiz',
              plays: 89,
              avgScore: 82.3,
              avgTime: 420,
            },
            {
              id: '2',
              title: '英語詞彙配對',
              type: 'Match Up',
              plays: 76,
              avgScore: 88.1,
              avgTime: 280,
            },
            {
              id: '3',
              title: '化學元素週期表',
              type: 'Quiz',
              plays: 65,
              avgScore: 75.6,
              avgTime: 380,
            },
          ],
          studentPerformance: {
            excellent: 28,
            good: 45,
            average: 32,
            needsHelp: 15,
          },
          activityTypes: [
            { type: 'Quiz', count: 12, avgScore: 78.2, popularity: 68 },
            { type: 'Match Up', count: 8, avgScore: 82.1, popularity: 45 },
            { type: 'Spin Wheel', count: 3, avgScore: 85.3, popularity: 23 },
            { type: 'Group Sort', count: 1, avgScore: 79.8, popularity: 8 },
          ],
        };

        setData(mockData);
        setLoading(false);
      } catch (error) {
        console.error('Failed to load analytics data:', error);
        setLoading(false);
      }
    };

    loadAnalyticsData();
  }, [timeRange]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600 bg-green-100';
    if (percentage >= 70) return 'text-blue-600 bg-blue-100';
    if (percentage >= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner h-8 w-8 mx-auto mb-4"></div>
          <p className="text-gray-600">載入分析數據中...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ChartBarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">無法載入數據</h2>
          <p className="text-gray-600">請稍後再試</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 頁面標題 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                數據分析
              </h1>
              <p className="text-lg text-gray-600">
                深入了解學生學習表現和活動使用情況
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="7d">最近 7 天</option>
                <option value="30d">最近 30 天</option>
                <option value="90d">最近 90 天</option>
                <option value="1y">最近 1 年</option>
              </select>
              <Button variant="secondary">
                <CalendarDaysIcon className="h-4 w-4 mr-2" />
                導出報告
              </Button>
            </div>
          </div>
        </div>

        {/* 概覽統計 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center">
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <UserGroupIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">總學生數</p>
                <p className="text-2xl font-bold text-gray-900">{data.overview.totalStudents}</p>
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
                <AcademicCapIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">總活動數</p>
                <p className="text-2xl font-bold text-gray-900">{data.overview.totalActivities}</p>
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
                <ClockIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">總學習時間</p>
                <p className="text-2xl font-bold text-gray-900">{formatTime(data.overview.totalPlayTime)}</p>
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
                <p className="text-2xl font-bold text-gray-900">{data.overview.averageScore}%</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center">
              <div className="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <ChartBarIcon className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">完成率</p>
                <p className="text-2xl font-bold text-gray-900">{data.overview.completionRate}%</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center">
              <div className="h-12 w-12 bg-pink-100 rounded-lg flex items-center justify-center">
                <ArrowTrendingUpIcon className="h-6 w-6 text-pink-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">參與度</p>
                <p className="text-2xl font-bold text-gray-900">{data.overview.engagementRate}%</p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* 趨勢圖表 */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">學習趨勢</h2>
            <div className="space-y-4">
              {data.trends.map((trend, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{trend.period}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                      <span>{trend.students} 學生</span>
                      <span>{trend.activities} 活動</span>
                      <span>{trend.avgScore}% 平均分</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900">
                      {formatTime(trend.playTime)}
                    </div>
                    <div className="text-sm text-gray-500">學習時間</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 學生表現分佈 */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">學生表現分佈</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <div className="h-4 w-4 bg-green-500 rounded-full mr-3"></div>
                  <span className="font-medium text-gray-900">優秀 (90-100%)</span>
                </div>
                <div className="text-lg font-semibold text-green-600">
                  {data.studentPerformance.excellent} 人
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <div className="h-4 w-4 bg-blue-500 rounded-full mr-3"></div>
                  <span className="font-medium text-gray-900">良好 (70-89%)</span>
                </div>
                <div className="text-lg font-semibold text-blue-600">
                  {data.studentPerformance.good} 人
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center">
                  <div className="h-4 w-4 bg-yellow-500 rounded-full mr-3"></div>
                  <span className="font-medium text-gray-900">一般 (50-69%)</span>
                </div>
                <div className="text-lg font-semibold text-yellow-600">
                  {data.studentPerformance.average} 人
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center">
                  <div className="h-4 w-4 bg-red-500 rounded-full mr-3"></div>
                  <span className="font-medium text-gray-900">需要幫助 (<50%)</span>
                </div>
                <div className="text-lg font-semibold text-red-600">
                  {data.studentPerformance.needsHelp} 人
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 熱門活動 */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">熱門活動</h2>
            <div className="space-y-4">
              {data.topActivities.map((activity, index) => (
                <div key={activity.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{activity.title}</h3>
                      <div className="flex items-center space-x-3 text-sm text-gray-600">
                        <span>{activity.type}</span>
                        <span>{activity.plays} 次播放</span>
                        <span>{formatTime(activity.avgTime)} 平均時間</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${getPerformanceColor(activity.avgScore)}`}>
                      {activity.avgScore}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 活動類型統計 */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">活動類型統計</h2>
            <div className="space-y-4">
              {data.activityTypes.map((type) => (
                <div key={type.type} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{type.type}</h3>
                    <span className="text-sm text-gray-600">{type.count} 個活動</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>平均分數: {type.avgScore}%</span>
                    <span>受歡迎度: {type.popularity}%</span>
                  </div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${type.popularity}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
