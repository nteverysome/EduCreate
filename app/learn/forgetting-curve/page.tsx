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

// 單字列表組件
function WordListSection({
  title,
  words,
  color,
  icon,
  description,
  isExpanded,
  onToggle,
  getRelativeTime,
  onStartReview,
}: {
  title: string;
  words: WordProgress[];
  color: 'red' | 'blue' | 'green' | 'gray';
  icon: string;
  description: string;
  isExpanded: boolean;
  onToggle: () => void;
  getRelativeTime: (date: string) => string;
  onStartReview: (wordIds: string[]) => void;
}) {
  const colorClasses = {
    red: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-600',
      button: 'bg-red-600 hover:bg-red-700',
      badge: 'bg-red-100 text-red-600',
    },
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-600',
      button: 'bg-blue-600 hover:bg-blue-700',
      badge: 'bg-blue-100 text-blue-600',
    },
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-600',
      button: 'bg-green-600 hover:bg-green-700',
      badge: 'bg-green-100 text-green-600',
    },
    gray: {
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      text: 'text-gray-600',
      button: 'bg-gray-600 hover:bg-gray-700',
      badge: 'bg-gray-100 text-gray-600',
    },
  };

  const colors = colorClasses[color];

  if (words.length === 0) {
    return null;
  }

  return (
    <div className={`${colors.bg} rounded-lg shadow-lg p-6 mb-6 border-2 ${colors.border}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className={`text-2xl font-bold ${colors.text}`}>
            {icon} {title} ({words.length})
          </h2>
        </div>
        <div className="flex gap-2">
          {words.length > 0 && (
            <button
              onClick={() => onStartReview(words.map(w => w.id))}
              className={`${colors.button} text-white px-4 py-2 rounded-lg font-medium transition-colors`}
            >
              立即複習
            </button>
          )}
          <button
            onClick={onToggle}
            className="text-gray-600 hover:text-gray-800 px-3 py-2 rounded-lg hover:bg-white transition-colors"
          >
            {isExpanded ? '收起 ▲' : '展開 ▼'}
          </button>
        </div>
      </div>

      <p className="text-gray-600 mb-4">{description}</p>

      {isExpanded && (
        <div className="overflow-x-auto bg-white rounded-lg">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">單字</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">中文</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-700">記憶強度</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-700">複習次數</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-700">正確率</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">下次複習</th>
              </tr>
            </thead>
            <tbody>
              {words.map((word, index) => (
                <tr key={word.id} className={`border-t hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <td className="px-4 py-3 font-medium text-gray-900">{word.word}</td>
                  <td className="px-4 py-3 text-gray-600">{word.translation}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${colors.badge}`}>
                        {word.memoryStrength}%
                      </span>
                      <div className="w-full bg-gray-200 rounded-full h-2 max-w-[100px]">
                        <div
                          className={`h-2 rounded-full ${colors.button}`}
                          style={{ width: `${word.memoryStrength}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-700">{word.reviewCount}</td>
                  <td className="px-4 py-3 text-center">
                    {word.reviewCount > 0 ? (
                      <span className="font-medium text-gray-700">
                        {Math.round((word.correctCount / word.reviewCount) * 100)}%
                      </span>
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex flex-col">
                      <span className={`font-medium ${colors.text}`}>
                        {getRelativeTime(word.nextReviewAt)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(word.nextReviewAt).toLocaleDateString('zh-TW')}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ForgettingCurveContent() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const geptLevel = searchParams.get('geptLevel') || 'ELEMENTARY';

  const [data, setData] = useState<ForgettingCurveData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string>('forgetting'); // 默認展開正在遺忘

  // 計算相對時間
  const getRelativeTime = (dateString: string) => {
    const now = new Date();
    const reviewDate = new Date(dateString);
    const diffMs = reviewDate.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return `${Math.abs(diffDays)}天前應該複習`;
    } else if (diffDays === 0) {
      return '今天應該複習';
    } else if (diffDays === 1) {
      return '明天複習';
    } else {
      return `${diffDays}天後複習`;
    }
  };

  // 開始複習
  const handleStartReview = (wordIds: string[]) => {
    console.log('開始複習單字:', wordIds);

    // 將選定的單字 ID 存儲到 localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('srs_selected_words', JSON.stringify(wordIds));
    }

    // 跳轉到遊戲,並傳遞 wordIds 參數
    const wordIdsParam = wordIds.join(',');
    router.push(`/games/switcher?useSRS=true&geptLevel=${geptLevel}&reviewMode=true&wordIds=${encodeURIComponent(wordIdsParam)}`);
  };

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

        {/* 單字詳細列表 */}
        <div className="space-y-6">
          {/* 正在遺忘的單字 */}
          <WordListSection
            title="正在遺忘的單字"
            words={data.forgettingWords}
            color="red"
            icon="🚨"
            description="這些單字需要立即複習以防止遺忘 (記憶強度 20-80% 且逾期 3+ 天)"
            isExpanded={expandedSection === 'forgetting'}
            onToggle={() => setExpandedSection(expandedSection === 'forgetting' ? '' : 'forgetting')}
            getRelativeTime={getRelativeTime}
            onStartReview={handleStartReview}
          />

          {/* 學習中的單字 */}
          <WordListSection
            title="學習中的單字"
            words={data.learningWords}
            color="blue"
            icon="📚"
            description="這些單字正在學習中,記憶強度在 20-80% 之間"
            isExpanded={expandedSection === 'learning'}
            onToggle={() => setExpandedSection(expandedSection === 'learning' ? '' : 'learning')}
            getRelativeTime={getRelativeTime}
            onStartReview={handleStartReview}
          />

          {/* 已掌握的單字 */}
          <WordListSection
            title="已掌握的單字"
            words={data.masteredWords}
            color="green"
            icon="✅"
            description="這些單字已經掌握,記憶強度 ≥ 80%"
            isExpanded={expandedSection === 'mastered'}
            onToggle={() => setExpandedSection(expandedSection === 'mastered' ? '' : 'mastered')}
            getRelativeTime={getRelativeTime}
            onStartReview={handleStartReview}
          />

          {/* 新單字 */}
          <WordListSection
            title="新單字"
            words={data.newWords}
            color="gray"
            icon="🆕"
            description="這些是尚未開始學習的新單字,記憶強度 < 20%"
            isExpanded={expandedSection === 'new'}
            onToggle={() => setExpandedSection(expandedSection === 'new' ? '' : 'new')}
            getRelativeTime={getRelativeTime}
            onStartReview={handleStartReview}
          />
        </div>
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
