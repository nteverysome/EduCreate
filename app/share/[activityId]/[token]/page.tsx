'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Play, RotateCcw, Clock, Target, Trophy, Star } from 'lucide-react';

interface Activity {
  id: string;
  title: string;
  description?: string;
  gameType: string;
  difficulty?: string;
  estimatedTime?: string;
  geptLevel?: string;
  totalWords: number;
  content: any;
  elements: any;
  vocabularyItems: any[];
  gameSettings: any;
}

interface GameScore {
  score: number;
  total: number;
  accuracy: number;
  timeSpent: number;
}

export default function AnonymousGamePage() {
  const params = useParams();
  const router = useRouter();
  const activityId = params.activityId as string;
  const token = params.token as string;

  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [finalScore, setFinalScore] = useState<GameScore | null>(null);

  // 載入活動數據並重定向到遊戲頁面
  useEffect(() => {
    loadActivityAndRedirect();
  }, [activityId, token]);

  const loadActivityAndRedirect = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/share/${activityId}/${token}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '載入遊戲失敗');
      }

      const data = await response.json();
      setActivity(data.activity);

      // 直接重定向到遊戲頁面
      const gameUrl = `/games/switcher?game=shimozurdo-game&activityId=${activityId}&shareToken=${token}&isShared=true`;
      router.push(gameUrl);

    } catch (error) {
      console.error('Error loading activity:', error);
      setError(error instanceof Error ? error.message : '載入遊戲失敗');
      setLoading(false);
    }
  };

  // 載入中狀態（重定向中）
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在載入遊戲...</p>
          <p className="text-sm text-gray-500 mt-2">即將跳轉到遊戲頁面</p>
        </div>
      </div>
    );
  }

  // 錯誤狀態
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">遊戲無法載入</h1>
          <p className="text-gray-600 mb-6">
            {error || '找不到這個遊戲，可能連結已過期或遊戲已停止分享。'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            重新載入
          </button>
        </div>
      </div>
    );
  }

  // 正常情況下不會到達這裡，因為會重定向
  return null;
}
