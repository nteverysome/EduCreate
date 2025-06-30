import React, { useState, useEffect } from 'react';

interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  time: number;
  accuracy: number;
  gameType: string;
  createdAt: Date;
}

interface LeaderboardProps {
  gameId?: string;
  gameType?: string;
  limit?: number;
}

export default function Leaderboard({ gameId, gameType, limit = 10 }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

  useEffect(() => {
    loadLeaderboard();
  }, [gameId, gameType, filter]);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      // 從 localStorage 獲取排行榜數據（演示用）
      const savedScores = localStorage.getItem('leaderboard_scores');
      let scores: LeaderboardEntry[] = savedScores ? JSON.parse(savedScores) : [];

      // 如果沒有數據，創建一些演示數據
      if (scores.length === 0) {
        scores = generateDemoData();
        localStorage.setItem('leaderboard_scores', JSON.stringify(scores));
      }

      // 根據篩選條件過濾數據
      const filteredScores = filterScores(scores);
      
      // 排序並限制數量
      const sortedScores = filteredScores
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

      setEntries(sortedScores);
    } catch (error) {
      console.error('載入排行榜失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateDemoData = (): LeaderboardEntry[] => {
    const names = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry'];
    const gameTypes = ['quiz', 'match', 'flashcard', 'wheel'];
    
    return Array.from({ length: 20 }, (_, i) => ({
      id: `demo-${i}`,
      name: names[Math.floor(Math.random() * names.length)],
      score: Math.floor(Math.random() * 1000) + 500,
      time: Math.floor(Math.random() * 300) + 30,
      accuracy: Math.floor(Math.random() * 30) + 70,
      gameType: gameTypes[Math.floor(Math.random() * gameTypes.length)],
      createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
    }));
  };

  const filterScores = (scores: LeaderboardEntry[]): LeaderboardEntry[] => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const week = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const month = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    return scores.filter(entry => {
      const entryDate = new Date(entry.createdAt);
      
      // 遊戲類型篩選
      if (gameType && entry.gameType !== gameType) return false;
      
      // 時間篩選
      switch (filter) {
        case 'today':
          return entryDate >= today;
        case 'week':
          return entryDate >= week;
        case 'month':
          return entryDate >= month;
        default:
          return true;
      }
    });
  };

  const addScore = (newEntry: Omit<LeaderboardEntry, 'id' | 'createdAt'>) => {
    const entry: LeaderboardEntry = {
      ...newEntry,
      id: `score-${Date.now()}`,
      createdAt: new Date()
    };

    const savedScores = localStorage.getItem('leaderboard_scores');
    const scores: LeaderboardEntry[] = savedScores ? JSON.parse(savedScores) : [];
    scores.push(entry);
    
    localStorage.setItem('leaderboard_scores', JSON.stringify(scores));
    loadLeaderboard();
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const getGameTypeIcon = (gameType: string) => {
    switch (gameType) {
      case 'quiz': return '❓';
      case 'match': return '🔗';
      case 'flashcard': return '🃏';
      case 'wheel': return '🎡';
      default: return '🎮';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          🏆 排行榜
        </h2>
        
        <div className="flex space-x-2">
          {(['all', 'today', 'week', 'month'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setFilter(period)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filter === period
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {period === 'all' ? '全部' : 
               period === 'today' ? '今日' :
               period === 'week' ? '本週' : '本月'}
            </button>
          ))}
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">🎯</div>
          <p>還沒有成績記錄</p>
          <p className="text-sm">開始遊戲來創建第一個記錄吧！</p>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry, index) => (
            <div
              key={entry.id}
              className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                index < 3 
                  ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200' 
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className="text-2xl font-bold">
                  {getRankIcon(index + 1)}
                </div>
                
                <div>
                  <div className="font-semibold text-gray-900">{entry.name}</div>
                  <div className="text-sm text-gray-500 flex items-center space-x-2">
                    <span>{getGameTypeIcon(entry.gameType)} {entry.gameType}</span>
                    <span>•</span>
                    <span>{new Date(entry.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-lg font-bold text-blue-600">{entry.score} 分</div>
                <div className="text-sm text-gray-500">
                  {entry.accuracy}% • {entry.time}s
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-500 text-center">
          顯示前 {Math.min(entries.length, limit)} 名 • 共 {entries.length} 個記錄
        </div>
      </div>
    </div>
  );
}

// 導出 addScore 函數供其他組件使用
export const addLeaderboardScore = (entry: Omit<LeaderboardEntry, 'id' | 'createdAt'>) => {
  const newEntry: LeaderboardEntry = {
    ...entry,
    id: `score-${Date.now()}`,
    createdAt: new Date()
  };

  const savedScores = localStorage.getItem('leaderboard_scores');
  const scores: LeaderboardEntry[] = savedScores ? JSON.parse(savedScores) : [];
  scores.push(newEntry);
  
  localStorage.setItem('leaderboard_scores', JSON.stringify(scores));
  
  // 觸發自定義事件通知排行榜更新
  window.dispatchEvent(new CustomEvent('leaderboard-updated'));
};
