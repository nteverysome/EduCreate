'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import UnifiedNavigation from '@/components/navigation/UnifiedNavigation';
import LoginPrompt from '@/components/auth/LoginPrompt';
import ResultDetailView from '@/components/results/ResultDetailView';

interface AssignmentResult {
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
  shareLink: string;
  participants: GameParticipant[];
}

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

export default function ResultDetailPage() {
  const params = useParams();
  const { data: session, status } = useSession();
  const [demoSession, setDemoSession] = useState<any>(null);
  const [result, setResult] = useState<AssignmentResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const resultId = params.resultId as string;

  // 檢查演示會話
  useEffect(() => {
    const savedDemoSession = localStorage.getItem('demoSession');
    if (savedDemoSession) {
      try {
        setDemoSession(JSON.parse(savedDemoSession));
      } catch (error) {
        console.error('解析演示會話失敗:', error);
      }
    }
  }, []);

  const currentUser = session?.user || demoSession?.user;

  // 載入結果數據
  useEffect(() => {
    if (!currentUser || !resultId) return;

    const loadResultDetail = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/results/${resultId}`);
        if (response.ok) {
          const data = await response.json();
          setResult(data);
        } else if (response.status === 404) {
          setError('結果不存在');
        } else {
          // 使用模擬數據作為後備
          const mockResult: AssignmentResult = {
            id: resultId,
            title: `"無標題活動"的結果1`,
            activityName: '無標題活動',
            activityId: 'cmgman4s00004jj04qwxdfwu1',
            assignmentId: '1760329085361',
            participantCount: 1,
            createdAt: '2025-10-13T14:08:00Z',
            status: 'active',
            gameType: '快閃記憶體卡',
            shareLink: 'https://edu-create.vercel.app/play/cmgman4s00004jj04qwxdfwu1/1760329085361',
            participants: [
              {
                id: 'participant1',
                studentName: '測試學生',
                score: 85,
                timeSpent: 120,
                correctAnswers: 8,
                totalQuestions: 10,
                completedAt: '2025-10-13T14:10:00Z'
              }
            ]
          };
          setResult(mockResult);
        }
      } catch (error) {
        console.error('載入結果詳情失敗:', error);
        setError('載入失敗，請稍後重試');
      } finally {
        setLoading(false);
      }
    };

    loadResultDetail();
  }, [currentUser, resultId]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50">
        <UnifiedNavigation />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">載入中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UnifiedNavigation />
        <LoginPrompt
          title="登入以查看結果詳情"
          description="請登入以查看詳細的課業分配結果和學生表現數據"
          redirectTo={`/my-results/${resultId}`}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UnifiedNavigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">載入結果詳情...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UnifiedNavigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-4xl">❌</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {error || '結果不存在'}
            </h3>
            <p className="text-gray-500 mb-6">
              請檢查連結是否正確，或返回結果列表
            </p>
            <a
              href="/my-results"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              返回我的結果
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UnifiedNavigation />
      <ResultDetailView result={result} />
    </div>
  );
}
