'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface SRSStatistics {
  totalWords: number;
  uniqueWords: number; // 唯一單字數
  cumulativeWords: number; // 累積單字數
  newWords: number;
  reviewWords: number;
  masteredWords: number;
  todayReviews: number;
  streak: number;
  averageMemoryStrength: number;
  overview: {
    totalWords: number;
    masteredWords: number;
    learningWords: number;
    reviewingWords: number;
    dueForReview: number;
  };
  recentSessions: Array<{
    id: string;
    geptLevel: string;
    startedAt: string;
    completedAt: string | null;
    duration: number | null;
    totalWords: number;
    correctAnswers: number;
    totalAnswers: number;
    accuracy: number | null;
  }>;
}

export default function StatisticsPage() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const geptLevel = searchParams.get('geptLevel') || 'ELEMENTARY';

  const [statistics, setStatistics] = useState<SRSStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      fetchStatistics();
    }
  }, [status, geptLevel]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/srs/statistics?geptLevel=${geptLevel}`);
      
      if (!response.ok) {
        throw new Error('獲取統計失敗');
      }

      const data = await response.json();
      setStatistics(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">錯誤</h2>
          <p className="text-gray-700">{error}</p>
          <button
            onClick={fetchStatistics}
            className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            重試
          </button>
        </div>
      </div>
    );
  }

  if (!statistics) {
    return null;
  }

  const getLevelName = (level: string) => {
    switch (level.toUpperCase()) {
      case 'ELEMENTARY':
        return '初級';
      case 'INTERMEDIATE':
        return '中級';
      case 'HIGH_INTERMEDIATE':
        return '中高級';
      default:
        return level;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* 標題 */}
        <div className="mb-8">
          <Link
            href="/games/switcher"
            className="text-indigo-600 hover:text-indigo-800 flex items-center gap-2 mb-4"
          >
            ← 返回遊戲
          </Link>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            📊 學習統計
          </h1>
          <p className="text-gray-600">
            {getLevelName(geptLevel)} 單字學習進度
          </p>
        </div>

        {/* 單字數量統計 */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">單字數量統計</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="text-sm text-gray-600 mb-2">本級新增單字</div>
              <div className="text-4xl font-bold text-blue-600 mb-2">{statistics.uniqueWords}</div>
              <div className="text-xs text-gray-500">該等級獨有的單字</div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="text-sm text-gray-600 mb-2">累積總單字</div>
              <div className="text-4xl font-bold text-indigo-600 mb-2">{statistics.cumulativeWords}</div>
              <div className="text-xs text-gray-500">包含之前等級的單字</div>
            </div>
          </div>
        </div>

        {/* 學習進度統計 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-sm text-gray-600 mb-2">待學習</div>
            <div className="text-3xl font-bold text-blue-600">{statistics.newWords}</div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-sm text-gray-600 mb-2">待複習</div>
            <div className="text-3xl font-bold text-orange-600">{statistics.reviewWords}</div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-sm text-gray-600 mb-2">已掌握</div>
            <div className="text-3xl font-bold text-green-600">{statistics.masteredWords}</div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-sm text-gray-600 mb-2">今日複習</div>
            <div className="text-3xl font-bold text-purple-600">{statistics.todayReviews}</div>
          </div>
        </div>

        {/* 學習進度 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">學習進度</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">記憶強度</span>
                <span className="font-bold text-indigo-600">
                  {Math.round(statistics.averageMemoryStrength)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-indigo-600 h-4 rounded-full transition-all duration-300"
                  style={{ width: `${statistics.averageMemoryStrength}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div>
                <div className="text-sm text-gray-600">總單字</div>
                <div className="text-xl font-bold">{statistics.overview.totalWords}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">學習中</div>
                <div className="text-xl font-bold text-blue-600">{statistics.overview.learningWords}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">複習中</div>
                <div className="text-xl font-bold text-orange-600">{statistics.overview.reviewingWords}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">連續天數</div>
                <div className="text-xl font-bold text-green-600">{statistics.streak} 天</div>
              </div>
            </div>
          </div>
        </div>

        {/* 最近學習記錄 */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">最近學習記錄</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">日期</th>
                  <th className="text-left py-3 px-4">等級</th>
                  <th className="text-right py-3 px-4">單字數</th>
                  <th className="text-right py-3 px-4">正確率</th>
                  <th className="text-right py-3 px-4">時長</th>
                </tr>
              </thead>
              <tbody>
                {statistics.recentSessions.slice(0, 10).map((session) => (
                  <tr key={session.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      {new Date(session.startedAt).toLocaleDateString('zh-TW')}
                    </td>
                    <td className="py-3 px-4">{getLevelName(session.geptLevel)}</td>
                    <td className="text-right py-3 px-4">{session.totalWords}</td>
                    <td className="text-right py-3 px-4">
                      {session.accuracy !== null ? `${Math.round(session.accuracy)}%` : '-'}
                    </td>
                    <td className="text-right py-3 px-4">
                      {session.duration !== null
                        ? `${Math.floor(session.duration / 60)}:${String(session.duration % 60).padStart(2, '0')}`
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

