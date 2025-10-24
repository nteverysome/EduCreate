'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { 
  AcademicCapIcon, 
  ChartBarIcon, 
  ClockIcon,
  FireIcon,
  TrophyIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

interface SRSLearningPanelProps {
  geptLevel: 'ELEMENTARY' | 'INTERMEDIATE' | 'HIGH_INTERMEDIATE';
  onStartLearning: () => void;
}

interface SRSStatistics {
  totalWords: number; // TTS 記錄總數
  uniqueWords: number; // 唯一單字數 (該等級新增)
  cumulativeWords: number; // 累積單字數
  newWords: number;
  reviewWords: number;
  masteredWords: number;
  todayReviews: number;
  streak: number;
  averageMemoryStrength: number;
}

const SRSLearningPanel: React.FC<SRSLearningPanelProps> = ({ geptLevel, onStartLearning }) => {
  const { data: session } = useSession();
  const [statistics, setStatistics] = useState<SRSStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 載入 SRS 統計數據
  useEffect(() => {
    if (!session?.user) {
      setLoading(false);
      return;
    }

    const loadStatistics = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/srs/statistics?geptLevel=${geptLevel}`);
        
        if (response.ok) {
          const data = await response.json();
          setStatistics(data);
          console.log('✅ SRS 統計數據已載入:', data);
        } else {
          console.error('❌ 載入 SRS 統計失敗:', response.status);
          setError('無法載入學習統計');
        }
      } catch (err) {
        console.error('❌ 載入 SRS 統計時出錯:', err);
        setError('載入統計時發生錯誤');
      } finally {
        setLoading(false);
      }
    };

    loadStatistics();
  }, [session, geptLevel]);

  // 未登入狀態
  if (!session?.user) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-sm border border-blue-200 p-6">
        <div className="text-center">
          <AcademicCapIcon className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">🧠 間隔重複學習系統 (SRS)</h3>
          <p className="text-gray-600 mb-4">
            使用科學的記憶算法,讓您更有效地記住單字
          </p>
          <Link
            href="/auth/signin"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            登入開始學習
            <ArrowRightIcon className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </div>
    );
  }

  // 載入中狀態
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="grid grid-cols-3 gap-4">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // 錯誤狀態
  if (error) {
    return (
      <div className="bg-red-50 rounded-lg shadow-sm border border-red-200 p-6">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            重新載入
          </button>
        </div>
      </div>
    );
  }

  // 正常顯示
  const stats = statistics || {
    totalWords: 0,
    newWords: 0,
    reviewWords: 0,
    masteredWords: 0,
    todayReviews: 0,
    streak: 0,
    averageMemoryStrength: 0
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-sm border border-blue-200 p-6">
      {/* 標題區域 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 flex items-center">
            <AcademicCapIcon className="w-6 h-6 text-blue-600 mr-2" />
            間隔重複學習 (SRS)
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {geptLevel === 'ELEMENTARY' ? '初級' : geptLevel === 'INTERMEDIATE' ? '中級' : '中高級'} 單字學習
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <FireIcon className="w-6 h-6 text-orange-500" />
          <span className="text-2xl font-bold text-orange-600">{stats.streak}</span>
          <span className="text-sm text-gray-600">天連續</span>
        </div>
      </div>

      {/* 單字數量統計 */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-4 border border-blue-200">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-600 mb-1">本級新增單字</div>
            <div className="text-3xl font-bold text-blue-600">{stats.uniqueWords}</div>
            <div className="text-xs text-gray-500 mt-1">該等級獨有的單字</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">累積總單字</div>
            <div className="text-3xl font-bold text-indigo-600">{stats.cumulativeWords}</div>
            <div className="text-xs text-gray-500 mt-1">包含之前等級的單字</div>
          </div>
        </div>
      </div>

      {/* 學習進度統計 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* 新單字 */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">待學習</div>
          <div className="text-2xl font-bold text-blue-600">{stats.newWords}</div>
        </div>

        {/* 複習單字 */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">待複習</div>
          <div className="text-2xl font-bold text-orange-600">{stats.reviewWords}</div>
        </div>

        {/* 已掌握 */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">已掌握</div>
          <div className="text-2xl font-bold text-green-600">{stats.masteredWords}</div>
        </div>

        {/* 今日複習 */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">今日複習</div>
          <div className="text-2xl font-bold text-purple-600">{stats.todayReviews}</div>
        </div>
      </div>

      {/* 進度條 */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600">整體記憶強度</span>
          <span className="text-gray-900 font-medium">{Math.round(stats.averageMemoryStrength)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-300"
            style={{ width: `${stats.averageMemoryStrength}%` }}
          />
        </div>
      </div>

      {/* 行動按鈕 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 開始學習按鈕 */}
        <button
          onClick={onStartLearning}
          disabled={stats.newWords === 0 && stats.reviewWords === 0}
          className={`flex items-center justify-center px-6 py-4 rounded-lg font-medium transition-all ${
            stats.newWords === 0 && stats.reviewWords === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:scale-105'
          }`}
        >
          <AcademicCapIcon className="w-5 h-5 mr-2" />
          {stats.reviewWords > 0 ? `開始複習 (${stats.reviewWords})` : `學習新單字 (${stats.newWords})`}
        </button>

        {/* 學習數據儀表板按鈕 */}
        <Link
          href="/learn/dashboard"
          className="flex items-center justify-center px-6 py-4 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg font-medium hover:from-green-700 hover:to-teal-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
        >
          <ChartBarIcon className="w-5 h-5 mr-2" />
          📊 學習數據儀表板
        </Link>

        {/* 查看統計按鈕 */}
        <Link
          href={`/learn/statistics?geptLevel=${geptLevel}`}
          className="flex items-center justify-center px-6 py-4 bg-white text-gray-700 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 transition-colors"
        >
          <ChartBarIcon className="w-5 h-5 mr-2" />
          查看詳細統計
        </Link>

        {/* 遺忘曲線按鈕 */}
        <Link
          href={`/learn/forgetting-curve?geptLevel=${geptLevel}`}
          className="flex items-center justify-center px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
        >
          <ChartBarIcon className="w-5 h-5 mr-2" />
          📈 遺忘曲線分析
        </Link>
      </div>

      {/* 提示信息 */}
      {stats.newWords === 0 && stats.reviewWords === 0 && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <TrophyIcon className="w-5 h-5 text-green-600 mr-2" />
            <p className="text-sm text-green-800">
              🎉 太棒了!您已經完成今天的學習任務!
            </p>
          </div>
        </div>
      )}

      {stats.reviewWords > 10 && (
        <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-center">
            <ClockIcon className="w-5 h-5 text-orange-600 mr-2" />
            <p className="text-sm text-orange-800">
              ⚠️ 您有 {stats.reviewWords} 個單字需要複習,建議盡快完成以保持記憶!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SRSLearningPanel;

