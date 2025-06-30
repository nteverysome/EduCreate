import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Leaderboard from '../components/Leaderboard';

export default function LeaderboardPage() {
  return (
    <>
      <Head>
        <title>排行榜 - EduCreate</title>
        <meta name="description" content="查看 EduCreate 遊戲排行榜和成績統計" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Navigation */}
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                  E
                </div>
                <span className="text-xl font-bold text-gray-900">EduCreate</span>
              </Link>
              
              <div className="flex items-center space-x-4">
                <Link href="/games-showcase" className="text-gray-600 hover:text-gray-900">
                  遊戲展示
                </Link>
                <Link href="/unified-content-manager.html" className="text-gray-600 hover:text-gray-900">
                  創建遊戲
                </Link>
                <Link href="/leaderboard" className="text-blue-600 font-semibold">
                  排行榜
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              🏆 遊戲排行榜
            </h1>
            <p className="text-xl text-gray-600">
              查看最佳成績和競爭排名
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 總排行榜 */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">🌟 總排行榜</h2>
              <Leaderboard limit={10} />
            </div>

            {/* 遊戲類型排行榜 */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">❓ 測驗遊戲</h2>
                <Leaderboard gameType="quiz" limit={5} />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">🔗 配對遊戲</h2>
                <Leaderboard gameType="match" limit={5} />
              </div>
            </div>
          </div>

          {/* 統計信息 */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">1,234</div>
              <div className="text-gray-600">總遊戲次數</div>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">567</div>
              <div className="text-gray-600">活躍玩家</div>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">89%</div>
              <div className="text-gray-600">平均準確率</div>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">23</div>
              <div className="text-gray-600">遊戲模板</div>
            </div>
          </div>

          {/* 成就系統預覽 */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">🏅 成就系統</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[
                { icon: '🥇', name: '第一名', desc: '獲得第一名' },
                { icon: '🔥', name: '連勝王', desc: '連續5次勝利' },
                { icon: '⚡', name: '閃電俠', desc: '30秒內完成' },
                { icon: '🎯', name: '神射手', desc: '100%準確率' },
                { icon: '📚', name: '學霸', desc: '完成10個測驗' },
                { icon: '🌟', name: '全能王', desc: '嘗試所有遊戲' }
              ].map((achievement, index) => (
                <div key={index} className="bg-white rounded-lg shadow-lg p-4 text-center hover:shadow-xl transition-shadow">
                  <div className="text-3xl mb-2">{achievement.icon}</div>
                  <div className="font-semibold text-gray-900 text-sm">{achievement.name}</div>
                  <div className="text-xs text-gray-500 mt-1">{achievement.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 行動呼籲 */}
          <div className="mt-12 text-center">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                準備挑戰排行榜了嗎？
              </h3>
              <p className="text-gray-600 mb-6">
                開始遊戲，展示你的技能，爭取最高分！
              </p>
              <div className="flex justify-center space-x-4">
                <Link href="/unified-content-manager.html" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold">
                  開始創建遊戲
                </Link>
                <Link href="/games-showcase" className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 font-semibold">
                  瀏覽遊戲模板
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
