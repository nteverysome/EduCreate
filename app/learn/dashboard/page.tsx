'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// 註冊 Chart.js 組件
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
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

interface DashboardData {
  totalDays: number;
  totalTime: number;
  totalWords: number;
  masteredWords: number;
  learningWords: number;
  newWords: number;
  averageAccuracy: number;
  dailyStats: {
    date: string;
    studyTime: number;
    wordsLearned: number;
    accuracy: number;
  }[];
  memoryStrengthDistribution: {
    range: string;
    count: number;
  }[];
  recentWords: {
    english: string;
    chinese: string;
    memoryStrength: number;
    lastReviewed: string;
    nextReview: string;
  }[];
  // 遺忘曲線數據
  forgettingWords: WordProgress[];
  masteredWordsList: WordProgress[];
  learningWordsList: WordProgress[];
  newWordsList: WordProgress[];
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [geptLevel, setGeptLevel] = useState<'KIDS' | 'ELEMENTARY' | 'INTERMEDIATE' | 'HIGH_INTERMEDIATE'>('ELEMENTARY');

  useEffect(() => {
    if (session?.user?.id) {
      fetchDashboardData();
    }
  }, [session, geptLevel]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/srs/dashboard?geptLevel=${geptLevel}`);
      if (!response.ok) throw new Error('Failed to fetch dashboard data');
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">請先登入</h1>
          <Link href="/api/auth/signin" className="text-blue-600 hover:underline">
            前往登入
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">載入學習數據...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">無法載入數據</h1>
          <button onClick={fetchDashboardData} className="text-blue-600 hover:underline">
            重試
          </button>
        </div>
      </div>
    );
  }

  // 學習時間趨勢圖數據
  const studyTimeChartData = {
    labels: data.dailyStats.map(s => new Date(s.date).toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: '學習時間（分鐘）',
        data: data.dailyStats.map(s => Math.round(s.studyTime / 60)),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  // 正確率趨勢圖數據
  const accuracyChartData = {
    labels: data.dailyStats.map(s => new Date(s.date).toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: '正確率（%）',
        data: data.dailyStats.map(s => s.accuracy),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  // 記憶強度分布圖數據
  const memoryDistributionChartData = {
    labels: data.memoryStrengthDistribution.map(d => d.range),
    datasets: [
      {
        label: '單字數量',
        data: data.memoryStrengthDistribution.map(d => d.count),
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',   // 0-20%: 紅色
          'rgba(251, 146, 60, 0.8)',  // 20-40%: 橙色
          'rgba(250, 204, 21, 0.8)',  // 40-60%: 黃色
          'rgba(132, 204, 22, 0.8)',  // 60-80%: 淺綠色
          'rgba(34, 197, 94, 0.8)'    // 80-100%: 深綠色
        ]
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* 頁面標題 */}
        <div className="mb-8">
          <Link href="/games/switcher" className="text-blue-600 hover:underline mb-4 inline-block">
            ← 返回遊戲
          </Link>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">📊 學習數據儀表板</h1>
          <p className="text-gray-600">追蹤你的學習進度和記憶強度變化</p>
        </div>

        {/* GEPT 等級選擇 */}
        <div className="mb-6 flex gap-2">
          {(['KIDS', 'ELEMENTARY', 'INTERMEDIATE', 'HIGH_INTERMEDIATE'] as const).map((level) => (
            <button
              key={level}
              onClick={() => setGeptLevel(level)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                geptLevel === level
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {level === 'KIDS' ? '幼兒' : level === 'ELEMENTARY' ? '初級' : level === 'INTERMEDIATE' ? '中級' : '高級'}
            </button>
          ))}
        </div>

        {/* 統計卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-gray-600 text-sm mb-2">學習天數</div>
            <div className="text-3xl font-bold text-blue-600">{data.totalDays}</div>
            <div className="text-gray-500 text-xs mt-1">天</div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-gray-600 text-sm mb-2">總學習時間</div>
            <div className="text-3xl font-bold text-green-600">{Math.round(data.totalTime / 60)}</div>
            <div className="text-gray-500 text-xs mt-1">分鐘</div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-gray-600 text-sm mb-2">已掌握單字</div>
            <div className="text-3xl font-bold text-purple-600">{data.masteredWords}</div>
            <div className="text-gray-500 text-xs mt-1">/ {data.totalWords} 個</div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-gray-600 text-sm mb-2">平均正確率</div>
            <div className="text-3xl font-bold text-orange-600">{data.averageAccuracy.toFixed(1)}%</div>
            <div className="text-gray-500 text-xs mt-1">正確率</div>
          </div>
        </div>

        {/* 圖表區域 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* 學習時間趨勢 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">📈 學習時間趨勢</h2>
            <Line data={studyTimeChartData} options={{ responsive: true, maintainAspectRatio: true }} />
          </div>

          {/* 正確率趨勢 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">🎯 正確率趨勢</h2>
            <Line data={accuracyChartData} options={{ responsive: true, maintainAspectRatio: true }} />
          </div>
        </div>

        {/* 記憶強度分布 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">🧠 記憶強度分布</h2>
          <Bar data={memoryDistributionChartData} options={{ responsive: true, maintainAspectRatio: true }} />
        </div>

        {/* 單字分類列表（遺忘曲線） */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* 正在遺忘的單字 */}
          {data.forgettingWords && data.forgettingWords.length > 0 && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-red-600">⚠️ 正在遺忘 ({data.forgettingWords.length})</h2>
              </div>
              <p className="text-sm text-red-600 mb-4">這些單字需要立即複習以防止遺忘</p>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {data.forgettingWords.slice(0, 10).map((word) => (
                  <div key={word.id} className="bg-white rounded-lg p-3 border border-red-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-gray-900">{word.word}</div>
                        <div className="text-sm text-gray-600">{word.translation}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-red-600">{word.memoryStrength}%</div>
                        <div className="text-xs text-gray-500">複習 {word.reviewCount} 次</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 學習中的單字 */}
          {data.learningWordsList && data.learningWordsList.length > 0 && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-blue-600">📖 學習中 ({data.learningWordsList.length})</h2>
              </div>
              <p className="text-sm text-blue-600 mb-4">這些單字正在學習中，繼續加油！</p>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {data.learningWordsList.slice(0, 10).map((word) => (
                  <div key={word.id} className="bg-white rounded-lg p-3 border border-blue-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-gray-900">{word.word}</div>
                        <div className="text-sm text-gray-600">{word.translation}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-blue-600">{word.memoryStrength}%</div>
                        <div className="text-xs text-gray-500">複習 {word.reviewCount} 次</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 已掌握的單字 */}
          {data.masteredWordsList && data.masteredWordsList.length > 0 && (
            <div className="bg-green-50 border-2 border-green-200 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-green-600">✅ 已掌握 ({data.masteredWordsList.length})</h2>
              </div>
              <p className="text-sm text-green-600 mb-4">恭喜！這些單字你已經掌握了</p>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {data.masteredWordsList.slice(0, 10).map((word) => (
                  <div key={word.id} className="bg-white rounded-lg p-3 border border-green-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-gray-900">{word.word}</div>
                        <div className="text-sm text-gray-600">{word.translation}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-green-600">{word.memoryStrength}%</div>
                        <div className="text-xs text-gray-500">複習 {word.reviewCount} 次</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 新單字 */}
          {data.newWordsList && data.newWordsList.length > 0 && (
            <div className="bg-gray-50 border-2 border-gray-200 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-600">🆕 新單字 ({data.newWordsList.length})</h2>
              </div>
              <p className="text-sm text-gray-600 mb-4">這些是你還沒開始學習的單字</p>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {data.newWordsList.slice(0, 10).map((word) => (
                  <div key={word.id} className="bg-white rounded-lg p-3 border border-gray-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-gray-900">{word.word}</div>
                        <div className="text-sm text-gray-600">{word.translation}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-600">{word.memoryStrength}%</div>
                        <div className="text-xs text-gray-500">複習 {word.reviewCount} 次</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 最近學習的單字 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">📚 最近學習的單字</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">英文</th>
                  <th className="text-left py-3 px-4">中文</th>
                  <th className="text-left py-3 px-4">記憶強度</th>
                  <th className="text-left py-3 px-4">上次複習</th>
                  <th className="text-left py-3 px-4">下次複習</th>
                </tr>
              </thead>
              <tbody>
                {data.recentWords.map((word, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{word.english}</td>
                    <td className="py-3 px-4">{word.chinese}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              word.memoryStrength >= 80 ? 'bg-green-500' :
                              word.memoryStrength >= 60 ? 'bg-yellow-500' :
                              word.memoryStrength >= 40 ? 'bg-orange-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${word.memoryStrength}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{word.memoryStrength}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(word.lastReviewed).toLocaleDateString('zh-TW')}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(word.nextReview).toLocaleDateString('zh-TW')}
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

