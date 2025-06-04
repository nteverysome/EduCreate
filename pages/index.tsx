import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import React, { useState, useEffect } from 'react';
import UserMenu from '../components/UserMenu';

export default function Home() {
  const { data: session } = useSession();
  const [hoveredCard, setHoveredCard] = useState(null);
  const [resourceCount, setResourceCount] = useState(93172361);
  const [isAnimating, setIsAnimating] = useState(false);

  // 模擬資源數量增長動畫
  useEffect(() => {
    const interval = setInterval(() => {
      setResourceCount(prev => prev + Math.floor(Math.random() * 10) + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // 遊戲模板數據 - 模仿 Wordwall 風格
  const gameTemplates = [
    {
      id: 1,
      title: '配對遊戲',
      description: '拖放配對練習',
      icon: '🎯',
      color: 'from-blue-400 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700'
    },
    {
      id: 2,
      title: '問答遊戲',
      description: '互動式問答',
      icon: '❓',
      color: 'from-green-400 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700'
    },
    {
      id: 3,
      title: '單字遊戲',
      description: '詞彙學習卡片',
      icon: '📚',
      color: 'from-purple-400 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700'
    },
    {
      id: 4,
      title: '隨機輪盤',
      description: '幸運轉盤選擇',
      icon: '🎡',
      color: 'from-pink-400 to-pink-600',
      bgColor: 'bg-pink-50',
      textColor: 'text-pink-700'
    },
    {
      id: 5,
      title: '迷宮遊戲',
      description: '知識探索迷宮',
      icon: '🌟',
      color: 'from-yellow-400 to-yellow-600',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-700'
    },
    {
      id: 6,
      title: '排序遊戲',
      description: '邏輯排序練習',
      icon: '🔢',
      color: 'from-red-400 to-red-600',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700'
    },
    {
      id: 7,
      title: '記憶遊戲',
      description: '翻牌記憶挑戰',
      icon: '🧠',
      color: 'from-indigo-400 to-indigo-600',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-700'
    },
    {
      id: 8,
      title: '填字遊戲',
      description: '互動填字練習',
      icon: '✏️',
      color: 'from-teal-400 to-teal-600',
      bgColor: 'bg-teal-50',
      textColor: 'text-teal-700'
    }
  ];

  // 社交媒體連結
  const socialLinks = [
    { name: 'Facebook', url: '#', icon: 'facebook' },
    { name: 'Twitter', url: '#', icon: 'twitter' },
    { name: 'Instagram', url: '#', icon: 'instagram' },
    { name: 'YouTube', url: '#', icon: 'youtube' }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Head>
        <title>EduCreate | 創建更好的課程，更快速</title>
        <meta name="description" content="輕鬆創建您的教學資源。製作課堂自定義活動。問答、配對、單字遊戲等等。" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* 導航欄 - Wordwall 風格 */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">E</span>
                </div>
                <span className="text-xl font-bold text-gray-800">EduCreate</span>
              </Link>
            </div>

            {/* 導航菜單 */}
            <div className="hidden md:flex items-center space-x-1">
              <Link href="/templates" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition">
                教師
              </Link>
              <Link href="/printables" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition">
                列印資源
              </Link>
              <Link href="/interactives" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition">
                互動遊戲
              </Link>
            </div>

            {/* 統計數據 */}
            <div className="hidden lg:flex items-center text-sm text-gray-600">
              <span className="font-medium">{resourceCount.toLocaleString()}</span>
              <span className="ml-1">個資源已創建</span>
            </div>

            {/* 用戶菜單 */}
            <div className="flex items-center space-x-3">
              {session ? (
                <div className="flex items-center space-x-3">
                  <Link href="/create" className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:from-blue-600 hover:to-purple-700 transition shadow-sm">
                    開始創建
                  </Link>
                  <UserMenu />
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link href="/login" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition">
                    登入
                  </Link>
                  <Link href="/register" className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:from-blue-600 hover:to-purple-700 transition shadow-sm">
                    註冊開始創建
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* 主要內容 */}
      <main className="flex-grow">
        {/* 英雄區塊 - Wordwall 風格 */}
        <section className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              {/* 統計數據徽章 */}
              <div className="inline-flex items-center bg-white rounded-full px-4 py-2 shadow-sm border border-gray-200 mb-8">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-700">
                    <span className="font-bold text-blue-600">{resourceCount.toLocaleString()}</span> 個資源已創建
                  </span>
                </div>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                創建更好的課程，
                <br />
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  更快速
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                輕鬆創建您的教學資源。
                <br />
                製作課堂自定義活動。
                <br />
                問答、配對、單字遊戲等等。
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
                <Link href="/register" className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                  註冊開始創建
                </Link>
                <div className="flex items-center space-x-2 text-gray-600">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium">免費使用</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 遊戲模板區塊 - Wordwall 風格 */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">選擇您的活動類型</h2>
              <p className="text-lg text-gray-600">從多種互動模板中選擇，快速創建引人入勝的學習活動</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {gameTemplates.map((template) => (
                <div 
                  key={template.id}
                  className="group relative overflow-hidden rounded-2xl transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl cursor-pointer"
                  onMouseEnter={() => setHoveredCard(template.id as any)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  {/* 背景漸變 */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${template.color} opacity-90 group-hover:opacity-100 transition-opacity duration-300`}></div>
                  
                  {/* 內容 */}
                  <div className="relative p-8 h-48 flex flex-col justify-center items-center text-center">
                    <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                      {template.icon}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{template.title}</h3>
                    <p className="text-white/90 text-sm">{template.description}</p>
                  </div>
                  
                  {/* 懸停效果 */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <Link href={`/editor/create?template=${template.id}`} className="bg-white text-gray-900 px-6 py-2 rounded-full font-semibold transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      開始創建
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            
            {/* 查看更多按鈕 */}
            <div className="text-center mt-12">
              <Link href="/templates" className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-full text-gray-700 font-medium hover:bg-gray-50 transition">
                查看所有模板
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* 功能亮點區塊 - Wordwall 風格 */}
        <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">輕鬆創建教學資源</h2>
              <p className="text-lg text-gray-600">專為教師設計的直觀工具，讓您專注於教學內容</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* 快速創建 */}
              <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">幾分鐘內完成</h3>
                <p className="text-gray-600 leading-relaxed">選擇模板，輸入內容，立即生成。無需複雜的設計技能，專注於教學內容創作。</p>
              </div>
              
              {/* 多樣化模板 */}
              <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">豐富的活動類型</h3>
                <p className="text-gray-600 leading-relaxed">問答、配對、填空、輪盤等多種互動模板，滿足不同學科和年級的教學需求。</p>
              </div>
              
              {/* 學生參與 */}
              <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">提升課堂參與</h3>
                <p className="text-gray-600 leading-relaxed">互動式遊戲讓學習變得有趣，提高學生專注度和學習動機，創造活躍的課堂氛圍。</p>
              </div>
            </div>
            
            {/* 統計數據 */}
            <div className="mt-16 bg-white rounded-2xl p-8 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
                <div>
                  <div className="text-3xl font-bold text-blue-600 mb-2">{resourceCount.toLocaleString()}</div>
                  <div className="text-gray-600">已創建資源</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-600 mb-2">500K+</div>
                  <div className="text-gray-600">活躍教師</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-purple-600 mb-2">180+</div>
                  <div className="text-gray-600">國家地區</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-pink-600 mb-2">24/7</div>
                  <div className="text-gray-600">技術支援</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 頁腳 */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">EduCreate</h3>
              <p className="text-gray-400">創建互動式教育資源，提升教學效果</p>
              <div className="flex space-x-4 mt-4">
                {socialLinks.map((link) => (
                  <a key={link.name} href={link.url} className="text-gray-400 hover:text-white transition">
                    <span className="sr-only">{link.name}</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">產品</h3>
              <ul className="space-y-2">
                <li><Link href="/templates" className="text-gray-400 hover:text-white transition">模板庫</Link></li>
                <li><Link href="/pricing" className="text-gray-400 hover:text-white transition">價格方案</Link></li>
                <li><Link href="/features" className="text-gray-400 hover:text-white transition">功能介紹</Link></li>
                <li><Link href="/updates" className="text-gray-400 hover:text-white transition">最新更新</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">支持</h3>
              <ul className="space-y-2">
                <li><Link href="/help-center" className="text-gray-400 hover:text-white transition">幫助中心</Link></li>
                <li><Link href="/tutorials" className="text-gray-400 hover:text-white transition">教學指南</Link></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-white transition">聯繫我們</Link></li>
                <li><Link href="/faq" className="text-gray-400 hover:text-white transition">常見問題</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">公司</h3>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-gray-400 hover:text-white transition">關於我們</Link></li>
                <li><Link href="/careers" className="text-gray-400 hover:text-white transition">加入我們</Link></li>
                <li><Link href="/privacy" className="text-gray-400 hover:text-white transition">隱私政策</Link></li>
                <li><Link href="/terms" className="text-gray-400 hover:text-white transition">使用條款</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} EduCreate. 保留所有權利。</p>
          </div>
        </div>
      </footer>
    </div>
  );
}