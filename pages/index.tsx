import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function HomePage() {
  return (
    <>
      <Head>
        <title>EduCreate | 創建更好的課程，更快速</title>
        <meta name="description" content="輕鬆創建您的教學資源。製作課堂自定義活動。問答、配對、單字遊戲等等。" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
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
                <Link href="/login" className="text-gray-600 hover:text-gray-900">
                  登入
                </Link>
                <a href="/unified-content-manager.html" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                  開始創建
                </a>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main>
          {/* Hero Section */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center">
              <div className="mb-8">
                <div className="text-4xl font-bold text-blue-600 mb-2">93,172,361</div>
                <div className="text-gray-600">個資源已創建</div>
              </div>

              <h1 className="text-5xl font-bold text-gray-900 mb-6">
                創建更好的課程，
                <span className="text-blue-600">更快速</span>
              </h1>

              <p className="text-xl text-gray-600 mb-6 max-w-3xl mx-auto">
                使用 AI 增強工具和 30+ 遊戲模板，輕鬆創建引人入勝的教育遊戲和互動內容。
                問答、配對、單字遊戲、記憶增強等等。
              </p>

              <div className="flex flex-wrap justify-center gap-3 mb-8">
                <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
                  🤖 AI 內容生成
                </div>
                <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
                  🧠 記憶增強系統
                </div>
                <div className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium">
                  🎮 30+ 遊戲模板
                </div>
                <div className="bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-medium">
                  📊 學習分析
                </div>
              </div>

              <div className="flex items-center justify-center space-x-4">
                <a href="/unified-content-manager.html" className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700">
                  立即開始創建
                </a>
                <div className="flex items-center space-x-2 text-green-600">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>免費使用</span>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Types Section */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">選擇您的活動類型</h2>
              <p className="text-xl text-gray-600">從多種互動模板中選擇，快速創建引人入勝的學習活動</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Template Cards */}
              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">配對遊戲</h3>
                <p className="text-gray-600 mb-4">拖放配對練習</p>
                <a href="/unified-content-manager.html" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 inline-block">
                  開始創建
                </a>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="text-4xl mb-4">❓</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">問答遊戲</h3>
                <p className="text-gray-600 mb-4">互動式問答</p>
                <a href="/unified-content-manager.html" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 inline-block">
                  開始創建
                </a>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="text-4xl mb-4">📚</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">單字遊戲</h3>
                <p className="text-gray-600 mb-4">詞彙學習卡片</p>
                <a href="/unified-content-manager.html" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 inline-block">
                  開始創建
                </a>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="text-4xl mb-4">🎡</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">隨機輪盤</h3>
                <p className="text-gray-600 mb-4">幸運轉盤選擇</p>
                <a href="/unified-content-manager.html" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 inline-block">
                  開始創建
                </a>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="text-4xl mb-4">🌟</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">迷宮遊戲</h3>
                <p className="text-gray-600 mb-4">知識探索迷宮</p>
                <a href="/unified-content-manager.html" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 inline-block">
                  開始創建
                </a>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="text-4xl mb-4">🔢</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">排序遊戲</h3>
                <p className="text-gray-600 mb-4">邏輯排序練習</p>
                <a href="/unified-content-manager.html" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 inline-block">
                  開始創建
                </a>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="text-4xl mb-4">🧠</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">記憶遊戲</h3>
                <p className="text-gray-600 mb-4">翻牌記憶挑戰</p>
                <a href="/unified-content-manager.html" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 inline-block">
                  開始創建
                </a>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="text-4xl mb-4">✏️</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">填字遊戲</h3>
                <p className="text-gray-600 mb-4">互動填字練習</p>
                <a href="/unified-content-manager.html" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 inline-block">
                  開始創建
                </a>
              </div>
            </div>

            <div className="text-center mt-12">
              <Link href="/games-showcase" className="inline-flex items-center text-blue-600 hover:text-blue-500 font-semibold">
                查看所有模板
                <svg className="ml-2 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Features Section */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">輕鬆創建教學資源</h2>
              <p className="text-xl text-gray-600">專為教師設計的直觀工具，讓您專注於教學內容</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">幾分鐘內完成</h3>
                <p className="text-gray-600">選擇模板，輸入內容，立即生成。無需複雜的設計技能，專注於教學內容創作。</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">豐富的活動類型</h3>
                <p className="text-gray-600">問答、配對、填空、輪盤等多種互動模板，滿足不同學科和年級的教學需求。</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">提升課堂參與</h3>
                <p className="text-gray-600">互動式遊戲讓學習變得有趣，提高學生專注度和學習動機，創造活躍的課堂氛圍。</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">93,172,361</div>
                <div className="text-gray-600">已創建資源</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">500K+</div>
                <div className="text-gray-600">活躍教師</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">180+</div>
                <div className="text-gray-600">國家地區</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">24/7</div>
                <div className="text-gray-600">技術支援</div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-gray-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-lg font-bold mb-4">EduCreate</h3>
                <p className="text-gray-400">創建互動式教育資源，提升教學效果</p>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-4">產品</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><Link href="/games-showcase" className="hover:text-white">模板庫</Link></li>
                  <li><Link href="#" className="hover:text-white">價格方案</Link></li>
                  <li><Link href="#" className="hover:text-white">功能介紹</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-4">支持</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><Link href="#" className="hover:text-white">幫助中心</Link></li>
                  <li><Link href="#" className="hover:text-white">教學指南</Link></li>
                  <li><Link href="#" className="hover:text-white">聯繫我們</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-4">公司</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><Link href="#" className="hover:text-white">關於我們</Link></li>
                  <li><Link href="#" className="hover:text-white">隱私政策</Link></li>
                  <li><Link href="#" className="hover:text-white">使用條款</Link></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2025 EduCreate. 保留所有權利。</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}