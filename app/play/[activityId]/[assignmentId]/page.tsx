'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CheckIcon } from '@heroicons/react/24/outline';

interface Activity {
  id: string;
  title: string;
  description?: string;
  gameType: string;
  vocabularyData?: any;
}

interface Assignment {
  id: string;
  activityId: string;
  title: string;
  registrationType: 'name' | 'anonymous' | 'google-classroom';
  deadline?: string;
  status: 'active' | 'completed' | 'expired';
}

export default function AssignmentPlayPage() {
  const params = useParams();
  const router = useRouter();
  const { activityId, assignmentId } = params;

  const [activity, setActivity] = useState<Activity | null>(null);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [studentName, setStudentName] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAssignmentData();
  }, [activityId, assignmentId]);

  const loadAssignmentData = async () => {
    try {
      setLoading(true);
      
      // 載入活動數據
      const activityResponse = await fetch(`/api/activities/${activityId}`);
      if (!activityResponse.ok) {
        throw new Error('活動不存在');
      }
      const activityData = await activityResponse.json();
      
      // 模擬課業數據（實際應該從後端 API 載入）
      const mockAssignment: Assignment = {
        id: assignmentId as string,
        activityId: activityId as string,
        title: `"${activityData.title}"的結果`,
        registrationType: 'name',
        status: 'active'
      };

      setActivity({
        id: activityData.id,
        title: activityData.title || '無標題活動',
        description: activityData.description,
        gameType: '飛機碰撞遊戲',
        vocabularyData: activityData.vocabularyItems
      });
      
      setAssignment(mockAssignment);
      
    } catch (error) {
      console.error('載入課業數據失敗:', error);
      setError('載入課業數據失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  const handleStartGame = async () => {
    if (!studentName.trim()) {
      setError('請輸入您的姓名');
      return;
    }

    try {
      // 記錄學生參與（實際應該發送到後端）
      console.log('學生開始遊戲:', {
        assignmentId,
        activityId,
        studentName: studentName.trim(),
        timestamp: new Date().toISOString()
      });

      // 如果選擇記住我，保存到 localStorage
      if (rememberMe) {
        localStorage.setItem('studentName', studentName.trim());
      }

      // 跳轉到實際的遊戲頁面
      router.push(`/create/${getGameTemplateId(activity?.gameType)}?activityId=${activityId}&assignmentId=${assignmentId}&studentName=${encodeURIComponent(studentName.trim())}`);
      
    } catch (error) {
      console.error('開始遊戲失敗:', error);
      setError('開始遊戲失敗，請稍後再試');
    }
  };

  const getGameTemplateId = (gameType?: string): string => {
    // 根據遊戲類型返回對應的模板 ID
    switch (gameType) {
      case '飛機碰撞遊戲':
        return 'shimozurdo-game';
      case '詞彙遊戲':
        return 'vocabulary-game';
      default:
        return 'shimozurdo-game';
    }
  };

  // 從 localStorage 載入記住的姓名
  useEffect(() => {
    const savedName = localStorage.getItem('studentName');
    if (savedName) {
      setStudentName(savedName);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  if (error && !activity) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-red-800 mb-2">載入失敗</h1>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            重新載入
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl font-bold">E</span>
            </div>
            <div className="w-full h-px bg-gray-300 mb-6"></div>
          </div>

          {/* Activity Title */}
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-8">
            {activity?.title}
          </h1>

          {/* Registration Form */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                輸入您的姓名:
              </h2>
              <input
                type="text"
                placeholder="名字..."
                value={studentName}
                onChange={(e) => {
                  setStudentName(e.target.value);
                  setError('');
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                maxLength={50}
              />
            </div>

            <div className="mb-6">
              <label className="flex items-center cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 border-2 rounded ${rememberMe ? 'bg-blue-600 border-blue-600' : 'border-gray-300'} flex items-center justify-center`}>
                    {rememberMe && (
                      <CheckIcon className="w-3 h-3 text-white" />
                    )}
                  </div>
                </div>
                <span className="ml-3 text-gray-700">記住我？</span>
              </label>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-md">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <button
              onClick={handleStartGame}
              disabled={!studentName.trim()}
              className={`w-full py-3 px-4 rounded-md font-medium text-lg transition-colors ${
                studentName.trim()
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              開始
            </button>
          </div>

          {/* Assignment Info */}
          {assignment && (
            <div className="mt-6 text-center text-sm text-gray-600">
              <p>課業 ID: {assignment.id}</p>
              <p>狀態: {assignment.status === 'active' ? '進行中' : '已結束'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
