'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

interface Word {
  id: string;
  english: string;
  chinese: string;
  memoryStrength: number;
  nextReviewAt: string;
  isNew: boolean;
  needsReview: boolean;
}

interface SRSReviewDetailsProps {
  wordIds: string[];
  geptLevel: 'ELEMENTARY' | 'INTERMEDIATE' | 'HIGH_INTERMEDIATE';
}

const SRSReviewDetails: React.FC<SRSReviewDetailsProps> = ({ wordIds, geptLevel }) => {
  const { data: session } = useSession();
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string>('');

  // 載入單字詳細信息
  useEffect(() => {
    if (!session?.user || wordIds.length === 0) {
      setLoading(false);
      return;
    }

    const fetchWordDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/srs/word-details', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            wordIds,
            geptLevel,
          }),
        });

        if (!response.ok) {
          throw new Error('載入單字詳細信息失敗');
        }

        const data = await response.json();
        setWords(data.words || []);
      } catch (err) {
        console.error('❌ 載入單字詳細信息失敗:', err);
        setError(err instanceof Error ? err.message : '未知錯誤');
      } finally {
        setLoading(false);
      }
    };

    fetchWordDetails();
  }, [session, wordIds, geptLevel]);

  // 分類單字
  const categorizeWords = () => {
    const newWords = words.filter(w => w.isNew);
    const reviewWords = words.filter(w => w.needsReview && !w.isNew);
    const learningWords = words.filter(w => !w.isNew && !w.needsReview && w.memoryStrength < 80);
    const masteredWords = words.filter(w => w.memoryStrength >= 80);

    return { newWords, reviewWords, learningWords, masteredWords };
  };

  // 格式化相對時間
  const getRelativeTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffDays < 0) {
      return `逾期 ${Math.abs(diffDays)} 天`;
    } else if (diffDays === 0) {
      if (diffHours < 0) {
        return `逾期 ${Math.abs(diffHours)} 小時`;
      } else {
        return `${diffHours} 小時後`;
      }
    } else if (diffDays === 1) {
      return '明天';
    } else {
      return `${diffDays} 天後`;
    }
  };

  // 單字列表區塊組件
  const WordListSection = ({
    title,
    words,
    color,
    icon,
    description,
    sectionKey,
  }: {
    title: string;
    words: Word[];
    color: string;
    icon: string;
    description: string;
    sectionKey: string;
  }) => {
    const isExpanded = expandedSection === sectionKey;
    const colorClasses = {
      red: 'bg-red-50 border-red-200 text-red-800',
      blue: 'bg-blue-50 border-blue-200 text-blue-800',
      green: 'bg-green-50 border-green-200 text-green-800',
      gray: 'bg-gray-50 border-gray-200 text-gray-800',
    };

    return (
      <div className={`rounded-lg border-2 ${colorClasses[color as keyof typeof colorClasses]} overflow-hidden`}>
        <button
          onClick={() => setExpandedSection(isExpanded ? '' : sectionKey)}
          className="w-full px-4 py-3 flex items-center justify-between hover:opacity-80 transition-opacity"
        >
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{icon}</span>
            <div className="text-left">
              <h3 className="font-bold text-lg">{title} ({words.length})</h3>
              <p className="text-sm opacity-75">{description}</p>
            </div>
          </div>
          {isExpanded ? (
            <ChevronUpIcon className="w-5 h-5" />
          ) : (
            <ChevronDownIcon className="w-5 h-5" />
          )}
        </button>

        {isExpanded && words.length > 0 && (
          <div className="px-4 pb-4 space-y-2">
            {words.map((word) => (
              <div
                key={word.id}
                className="bg-white rounded-lg p-3 shadow-sm border border-gray-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{word.english}</div>
                    <div className="text-sm text-gray-600">{word.chinese}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      記憶強度: {word.memoryStrength}%
                    </div>
                    {!word.isNew && (
                      <div className="text-xs text-gray-500">
                        下次複習: {getRelativeTime(word.nextReviewAt)}
                      </div>
                    )}
                  </div>
                </div>
                {/* 記憶強度進度條 */}
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      word.memoryStrength >= 80
                        ? 'bg-green-500'
                        : word.memoryStrength >= 50
                        ? 'bg-blue-500'
                        : word.memoryStrength >= 20
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${word.memoryStrength}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {isExpanded && words.length === 0 && (
          <div className="px-4 pb-4 text-center text-sm opacity-75">
            暫無單字
          </div>
        )}
      </div>
    );
  };

  if (!session?.user) {
    return null;
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center text-gray-600">載入中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-lg shadow-sm border border-red-200 p-6">
        <div className="text-center text-red-600">{error}</div>
      </div>
    );
  }

  if (words.length === 0) {
    return null;
  }

  const { newWords, reviewWords, learningWords, masteredWords } = categorizeWords();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        📊 本次複習詳情 ({words.length} 個單字)
      </h2>

      <div className="space-y-4">
        {/* 需要複習的單字 */}
        {reviewWords.length > 0 && (
          <WordListSection
            title="需要複習"
            words={reviewWords}
            color="red"
            icon="🚨"
            description="這些單字需要立即複習"
            sectionKey="review"
          />
        )}

        {/* 新單字 */}
        {newWords.length > 0 && (
          <WordListSection
            title="新單字"
            words={newWords}
            color="gray"
            icon="🆕"
            description="這些是尚未開始學習的新單字,記憶強度 < 20%"
            sectionKey="new"
          />
        )}

        {/* 學習中的單字 */}
        {learningWords.length > 0 && (
          <WordListSection
            title="學習中"
            words={learningWords}
            color="blue"
            icon="📚"
            description="這些單字正在學習中,記憶強度在 20-80% 之間"
            sectionKey="learning"
          />
        )}

        {/* 已掌握的單字 */}
        {masteredWords.length > 0 && (
          <WordListSection
            title="已掌握"
            words={masteredWords}
            color="green"
            icon="✅"
            description="這些單字已經掌握,記憶強度 ≥ 80%"
            sectionKey="mastered"
          />
        )}
      </div>
    </div>
  );
};

export default SRSReviewDetails;

