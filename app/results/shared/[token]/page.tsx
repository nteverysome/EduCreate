'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ResultDetailView } from '@/components/results/ResultDetailView';

interface SharedResultData {
  id: string;
  title: string;
  activityName: string;
  activityId: string;
  assignmentId: string;
  participantCount: number;
  createdAt: string;
  status: string;
  gameType: string;
  participants: any[];
  statistics: any;
  questionStatistics: any[];
  isSharedView: boolean;
}

export default function SharedResultPage() {
  const params = useParams();
  const token = params.token as string;
  const [result, setResult] = useState<SharedResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSharedResult = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/results/shared/${token}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || '獲取結果失敗');
        }

        const data = await response.json();
        setResult(data);
      } catch (err) {
        console.error('獲取可共用結果失敗:', err);
        setError(err instanceof Error ? err.message : '獲取結果失敗');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchSharedResult();
    }
  }, [token]);

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
          <div className="mb-4">
            <svg className="w-16 h-16 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">無法載入結果</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="text-sm text-gray-500">
            <p>可能的原因：</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>連結已過期或無效</li>
              <li>結果已被刪除或歸檔</li>
              <li>網絡連接問題</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">找不到結果</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 頂部提示條 */}
      <div className="bg-blue-50 border-b border-blue-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm text-blue-800">
              這是一個可共用的結果頁面。任何擁有此連結的人都可以查看這些結果。
            </span>
          </div>
        </div>
      </div>

      {/* 主要內容 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ResultDetailView result={result} />
      </div>

      {/* 底部信息 */}
      <div className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-500">
            <p>由 <span className="font-semibold text-blue-600">EduCreate</span> 提供支持</p>
            <p className="mt-1">記憶科學驅動的智能教育遊戲平台</p>
          </div>
        </div>
      </div>
    </div>
  );
}
