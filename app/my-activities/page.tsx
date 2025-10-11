/**
 * MyActivities 主頁面 - Wordwall 風格界面
 * 支持用戶身份驗證和個人化活動管理
 */
'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import UnifiedNavigation from '@/components/navigation/UnifiedNavigation';
import WordwallStyleMyActivities from '@/components/activities/WordwallStyleMyActivities';
import LoginPrompt from '@/components/Auth/LoginPrompt';

export default function MyActivitiesPage() {
  const { data: session, status } = useSession();
  const [demoSession, setDemoSession] = useState<any>(null);

  // 檢查演示會話
  useEffect(() => {
    const demo = localStorage.getItem('demo-session');
    if (demo) {
      try {
        setDemoSession(JSON.parse(demo));
      } catch (error) {
        console.error('解析演示會話失敗:', error);
      }
    }
  }, []);

  const currentUser = session?.user || demoSession?.user;
  const isLoading = status === 'loading' && !demoSession;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UnifiedNavigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">載入中...</p>
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
          title="登入以查看您的活動"
          description="請登入以管理您的個人活動和詞彙集合"
          redirectTo="/my-activities"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UnifiedNavigation />
      {demoSession && (
        <div className="bg-green-100 border-l-4 border-green-500 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">
                您正在使用演示模式。這是一個功能完整的演示，您可以創建和管理詞彙活動。
              </p>
            </div>
          </div>
        </div>
      )}
      <WordwallStyleMyActivities userId={currentUser.id} />
    </div>
  );
}


