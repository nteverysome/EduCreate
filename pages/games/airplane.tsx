import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import VocabularyGame from '@/components/games/VocabularyGame';

interface GameStats {
  score: number;
  questionsAnswered: number;
  correctAnswers: number;
  wrongAnswers: number;
  accuracy: number;
  timeSpent: number;
}

export default function AirplaneGamePage() {
  const router = useRouter();
  const [gameStats, setGameStats] = useState<GameStats>({
    score: 0,
    questionsAnswered: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    accuracy: 0,
    timeSpent: 0
  });

  const [startTime, setStartTime] = useState<number>(Date.now());
  const [pageLoaded, setPageLoaded] = useState(false);

  useEffect(() => {
    setStartTime(Date.now());
    setPageLoaded(true);
  }, []);

  const handleBackToHome = () => {
    router.push('/');
  };

  const handleStatsUpdate = (stats: GameStats) => {
    setGameStats(stats);
  };
  
  if (!pageLoaded) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">✈️</div>
          <div className="text-xl font-semibold text-blue-800">載入飛機遊戲中...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>飛機學習遊戲 - EduCreate 教育沙盒</title>
        <meta name="description" content="使用飛機遊戲學習 GEPT 詞彙，結合記憶科學的教育遊戲" />
        <meta name="keywords" content="教育遊戲,GEPT,詞彙學習,記憶科學,Godot" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          {/* 頁面標題 */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link href="/">
                <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                  ← 返回首頁
                </button>
              </Link>

              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  🛩️ 飛機學習遊戲
                </h1>
                <p className="text-gray-600 mt-1">
                  GEPT 詞彙學習 • 記憶科學驅動 • Godot + MCP 技術
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">Godot Engine</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">MCP 整合</span>
              <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm">記憶科學</span>
            </div>
          </div>
          
          {/* 遊戲統計 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🏆</span>
                <div>
                  <div className="text-2xl font-bold">{gameStats.score}</div>
                  <div className="text-sm text-gray-600">分數</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎯</span>
                <div>
                  <div className="text-2xl font-bold">{gameStats.questionsAnswered}</div>
                  <div className="text-sm text-gray-600">已答題數</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📊</span>
                <div>
                  <div className="text-2xl font-bold">{gameStats.accuracy.toFixed(1)}%</div>
                  <div className="text-sm text-gray-600">準確率</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center gap-2">
                <span className="text-2xl">⏰</span>
                <div>
                  <div className="text-2xl font-bold">{Math.floor(gameStats.timeSpent / 60)}</div>
                  <div className="text-sm text-gray-600">遊戲時間(分)</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* 真實的詞彙遊戲 */}
          <VocabularyGame onStatsUpdate={handleStatsUpdate} />
          
          {/* 學習提示 */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              🧠 記憶科學提示
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-green-700 mb-2">✅ 學習策略</h4>
                <ul className="text-sm space-y-1 text-gray-700">
                  <li>• 專注於理解單字的含義，而不只是記憶</li>
                  <li>• 答錯時仔細看正確答案，加深印象</li>
                  <li>• 定期複習，利用間隔重複效應</li>
                  <li>• 將新單字與已知概念建立連結</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-blue-700 mb-2">🎯 GEPT 分級</h4>
                <ul className="text-sm space-y-1 text-gray-700">
                  <li>• Level 1: 基礎詞彙 (日常生活用語)</li>
                  <li>• Level 2: 進階詞彙 (學術和專業用語)</li>
                  <li>• 系統會根據你的表現調整難度</li>
                  <li>• 錯誤的單字會更頻繁出現</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
