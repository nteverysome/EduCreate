'use client';

import { useSession } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// 註冊 Chart.js 組件
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface WordProgress {
  id: string;
  word: string;
  translation: string;
  memoryStrength: number;
  nextReviewAt: string;
  lastReviewedAt: string;
  status: string;
  reviewCount: number;
  correctCount: number;
  incorrectCount: number;
}

interface ForgettingCurveData {
  words: WordProgress[];
  forgettingWords: WordProgress[]; // 正在遺忘 (記憶強度下降)
  masteredWords: WordProgress[]; // 已掌握 (>= 80%)
  learningWords: WordProgress[]; // 學習中 (20-80%)
  newWords: WordProgress[]; // 新單字 (< 20%)
  chartData: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      borderColor: string;
      backgroundColor: string;
      fill: boolean;
    }>;
  };
}

function ForgettingCurveContent() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const geptLevel = searchParams.get('geptLevel') || 'ELEMENTARY';

  const [data, setData] = useState<ForgettingCurveData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchForgettingCurveData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/srs/forgetting-curve?geptLevel=${geptLevel}`);

      if (!response.ok) {
        throw new Error('Failed to fetch forgetting curve data');
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      fetchForgettingCurveData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, geptLevel]);

  const getLevelName = (level: string) => {
    switch (level) {
      case 'ELEMENTARY': return '初級';
      case 'INTERMEDIATE': return '中級';
      case 'HIGH_INTERMEDIATE': return '高級';
      default: return level;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'mastered': return 'text-green-600 bg-green-50';
      case 'learning': return 'text-blue-600 bg-blue-50';
      case 'forgetting': return 'text-red-600 bg-red-50';
      case 'new': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'mastered': return '已掌握';
      case 'learning': return '學習中';
      case 'forgetting': return '正在遺忘';
      case 'new': return '新單字';
      default: return status;
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">載入遺忘曲線數據...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">❌ 載入失敗</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchForgettingCurveData}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
          >
            重試
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* 標題 */}
        <div className="mb-8">
          <Link
            href="/games/switcher"
            className="text-indigo-600 hover:text-indigo-800 flex items-center gap-2 mb-4"
          >
            ← 返回遊戲
          </Link>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            📈 遺忘曲線分析
          </h1>
          <p className="text-gray-600">
            {getLevelName(geptLevel)} 單字記憶狀態可視化
          </p>
        </div>

        {/* GEPT 等級切換 */}
        <div className="bg-white rounded-lg shadow-lg p-4 mb-8">
          <div className="flex gap-4">
            <button
              onClick={() => router.push('/learn/forgetting-curve?geptLevel=ELEMENTARY')}
              className={`px-6 py-2 rounded-lg font-medium ${
                geptLevel === 'ELEMENTARY'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              初級
            </button>
            <button
              onClick={() => router.push('/learn/forgetting-curve?geptLevel=INTERMEDIATE')}
              className={`px-6 py-2 rounded-lg font-medium ${
                geptLevel === 'INTERMEDIATE'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              中級
            </button>
            <button
              onClick={() => router.push('/learn/forgetting-curve?geptLevel=HIGH_INTERMEDIATE')}
              className={`px-6 py-2 rounded-lg font-medium ${
                geptLevel === 'HIGH_INTERMEDIATE'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              高級
            </button>
          </div>
        </div>

        {/* 統計概覽 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-green-50 rounded-lg shadow-lg p-6 border-2 border-green-200">
            <div className="text-sm text-green-700 mb-2">已掌握</div>
            <div className="text-3xl font-bold text-green-600">{data.masteredWords.length}</div>
            <div className="text-xs text-green-600 mt-1">記憶強度 ≥ 80%</div>
          </div>

          <div className="bg-blue-50 rounded-lg shadow-lg p-6 border-2 border-blue-200">
            <div className="text-sm text-blue-700 mb-2">學習中</div>
            <div className="text-3xl font-bold text-blue-600">{data.learningWords.length}</div>
            <div className="text-xs text-blue-600 mt-1">記憶強度 20-80%</div>
          </div>

          <div className="bg-red-50 rounded-lg shadow-lg p-6 border-2 border-red-200">
            <div className="text-sm text-red-700 mb-2">正在遺忘</div>
            <div className="text-3xl font-bold text-red-600">{data.forgettingWords.length}</div>
            <div className="text-xs text-red-600 mt-1">需要立即複習</div>
          </div>

          <div className="bg-gray-50 rounded-lg shadow-lg p-6 border-2 border-gray-200">
            <div className="text-sm text-gray-700 mb-2">新單字</div>
            <div className="text-3xl font-bold text-gray-600">{data.newWords.length}</div>
            <div className="text-xs text-gray-600 mt-1">記憶強度 &lt; 20%</div>
          </div>
        </div>

        {/* 遺忘曲線圖表 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">記憶強度分布</h2>
          <div className="h-96">
            <Line
              data={data.chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top' as const,
                  },
                  title: {
                    display: true,
                    text: '單字記憶強度隨時間變化',
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                      display: true,
                      text: '記憶強度 (%)',
                    },
                  },
                  x: {
                    title: {
                      display: true,
                      text: '時間',
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        {/* 單字列表 - 正在遺忘 */}
        {data.forgettingWords.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              🚨 正在遺忘的單字 ({data.forgettingWords.length})
            </h2>
            <p className="text-gray-600 mb-4">這些單字需要立即複習以防止遺忘</p>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">單字</th>
                    <th className="px-4 py-2 text-left">中文</th>
                    <th className="px-4 py-2 text-center">記憶強度</th>
                    <th className="px-4 py-2 text-center">複習次數</th>
                    <th className="px-4 py-2 text-center">正確率</th>
                    <th className="px-4 py-2 text-left">下次複習</th>
                  </tr>
                </thead>
                <tbody>
                  {data.forgettingWords.slice(0, 20).map((word) => (
                    <tr key={word.id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-2 font-medium">{word.word}</td>
                      <td className="px-4 py-2 text-gray-600">{word.translation}</td>
                      <td className="px-4 py-2 text-center">
                        <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-600">
                          {word.memoryStrength}%
                        </span>
                      </td>
                      <td className="px-4 py-2 text-center">{word.reviewCount}</td>
                      <td className="px-4 py-2 text-center">
                        {word.reviewCount > 0
                          ? `${Math.round((word.correctCount / word.reviewCount) * 100)}%`
                          : 'N/A'}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-600">
                        {new Date(word.nextReviewAt).toLocaleDateString('zh-TW')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ForgettingCurvePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">載入中...</p>
        </div>
      </div>
    }>
      <ForgettingCurveContent />
    </Suspense>
  );
}
