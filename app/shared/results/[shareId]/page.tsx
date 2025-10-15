'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { EyeIcon } from '@heroicons/react/24/outline';
import { ResultDetailView } from '@/components/results/ResultDetailView';

interface GameParticipant {
  id: string;
  studentName: string;
  score: number;
  timeSpent: number;
  correctAnswers: number;
  totalQuestions: number;
  completedAt: string;
  gameData?: any;
}

interface StatisticsSummary {
  totalStudents: number;
  averageScore: number;
  highestScore: {
    score: number;
    studentName: string;
  };
  fastestTime: {
    timeSpent: number;
    studentName: string;
  };
}

interface QuestionStatistic {
  questionNumber: number;
  questionText: string;
  correctCount: number;
  incorrectCount: number;
  totalAttempts: number;
  correctPercentage: number;
}

interface SharedResultData {
  id: string;
  title: string;
  activityName: string;
  activityId: string;
  assignmentId: string;
  participantCount: number;
  createdAt: string;
  deadline?: string;
  status: 'active' | 'completed' | 'expired';
  gameType: string;
  shareLink?: string;
  shareToken?: string;
  participants: GameParticipant[];
  statistics?: StatisticsSummary;
  questionStatistics?: QuestionStatistic[];
  isSharedView?: boolean;
}

export default function SharedResultPage() {
  const params = useParams();
  const shareId = params.shareId as string;

  const [resultData, setResultData] = useState<SharedResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSharedResult = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/shared/results/${shareId}`);

        if (!response.ok) {
          if (response.status === 404) {
            setError('分享的結果不存在或已被刪除');
          } else if (response.status === 403) {
            setError('此結果未公開分享');
          } else {
            setError('載入結果時發生錯誤');
          }
          return;
        }

        const data = await response.json();
        console.log('📊 分享結果數據:', data);
        setResultData(data);
      } catch (error) {
        console.error('獲取分享結果失敗:', error);
        setError('網路連接錯誤，請稍後再試');
      } finally {
        setLoading(false);
      }
    };

    if (shareId) {
      fetchSharedResult();
    }
  }, [shareId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">載入結果中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <EyeIcon className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">無法載入結果</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <a
            href="https://edu-create.vercel.app"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            前往 EduCreate 首頁
          </a>
        </div>
      </div>
    );
  }

  if (!resultData) {
    return null;
  }

  // 使用 ResultDetailView 組件顯示完整的結果詳情
  return (
    <div className="min-h-screen bg-gray-50">
      <ResultDetailView result={resultData} />

      {/* 页脚 - 提示這是公開分享的結果 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="text-center pt-6 border-t border-gray-200">
          <div className="flex items-center justify-center text-sm text-gray-500 mb-2">
            <EyeIcon className="w-4 h-4 mr-1" />
            <span>這是公開分享的結果頁面</span>
          </div>
          <p className="text-sm text-gray-500 mb-2">
            此結果由 EduCreate 平台生成
          </p>
          <a
            href="https://edu-create.vercel.app"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            探索 EduCreate 平台 →
          </a>
        </div>
      </div>
    </div>
  );
}
