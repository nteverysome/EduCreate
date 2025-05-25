import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import UserMenu from '../components/UserMenu';

export default function Home() {
  const { data: session } = useSession();
  const [hoveredCard, setHoveredCard] = useState(null);

  // 遊戲模板數據
  const gameTemplates = [
    {
      id: 1,
      title: '配對遊戲',
      description: '創建配對練習，幫助學生建立概念聯繫',
      image: '/templates/vocab-matching.svg',
      color: 'bg-blue-500',
      hoverColor: 'bg-blue-600'
    },
    {
      id: 2,
      title: '填空題',
      description: '設計填空練習，強化關鍵詞彙和語法理解',
      image: '/templates/grammar-quiz.svg',
      color: 'bg-green-500',
      hoverColor: 'bg-green-600'
    },
    {
      id: 3,
      title: '選擇題',
      description: '創建多選題測驗，快速評估學生理解程度',
      image: '/templates/language-flashcards.svg',
      color: 'bg-purple-500',
      hoverColor: 'bg-purple-600'
    },
    {
      id: 4,
      title: '單字卡片',
      description: '製作互動式詞彙學習卡片，提高記憶效果',
      image: '/templates/placeholder.svg',
      color: 'bg-pink-500',
      hoverColor: 'bg-pink-600'
    },
    {
      id: 5,
      title: '隨機輪盤',
      description: '創建隨機選擇輪盤，增加課堂趣味性',
      image: '/templates/placeholder.svg',
      color: 'bg-yellow-500',
      hoverColor: 'bg-yellow-600'
    },
    {
      id: 6,
      title: '文字排序',
      description: '設計文字排序活動，提升邏輯思維能力',
      image: '/templates/placeholder.svg',
      color: 'bg-red-500',
      hoverColor: 'bg-red-600'
    },
    {
      id: 7,
      title: '迷宮遊戲',
      description: '創建知識迷宮，讓學習過程更加有趣',
      image: '/templates/placeholder.svg',
      color: 'bg-indigo-500',
      hoverColor: 'bg-indigo-600'
    },
    {
      id: 8,
      title: '記憶配對',
      description: '設計記憶配對遊戲，訓練專注力和記憶力',
      image: '/templates/placeholder.svg',
      color: 'bg-teal-500',
      hoverColor: 'bg-teal-600'
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
        <title>EduCreate - 互動教育資源創建平台</title>
        <meta name="description" content="創建互動式教育資源，提升教學效果" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* 導航欄 */}
      <nav className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <span className="text-2xl font-bold text-blue-600">EduCreate</span>
              </Link>
            </div>

            {/* 導航菜單 */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/templates" className="text-gray-600 hover:text-blue-600 transition">
                模板庫
              </Link>
              <Link href="/pricing" className="text-gray-600 hover:text-blue-600 transition">
                價格方案
              </Link>
              <Link href="/help-center" className="text-gray-600 hover:text-blue-600 transition">
                幫助中心
              </Link>
              <Link href="/about" className="text-gray-600 hover:text-blue-600 transition">
                關於我們
              </Link>
            </div>

            {/* 用戶菜單 */}
            <div className="flex items-center">
              {session ? (
                <div className="flex items-center space-x-4">
                  <Link href="/create" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                    創建活動
                  </Link>
                  <UserMenu />
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link href="/login" className="text-gray-600 hover:text-blue-600 transition">
                    登入
                  </Link>
                  <Link href="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                    免費註冊
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* 主要內容 */}
      <main className="flex-grow">
        {/* 英雄區塊 */}
        <section className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">創建互動式教學活動</h1>
              <p className="text-xl mb-8 max-w-3xl mx-auto">在幾分鐘內製作專業的互動教學資源，提升學生參與度和學習效果</p>
              <div className="flex justify-center space-x-4">
                <Link href="/templates" className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition">
                  瀏覽模板
                </Link>
                <Link href="/register" className="bg-yellow-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-yellow-600 transition">
                  立即開始
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 遊戲模板區塊 */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">互動遊戲模板</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {gameTemplates.map((template) => (
                <div 
                  key={template.id}
                  className="relative overflow-hidden rounded-lg shadow-md transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl"
                  onMouseEnter={() => setHoveredCard(template.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div className={`h-48 ${template.color} flex items-center justify-center transition-colors duration-300 ${hoveredCard === template.id ? template.hoverColor : ''}`}>
                    {template.image && (
                      <div className="w-24 h-24 text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="p-4 bg-white">
                    <h3 className="text-lg font-semibold mb-1">{template.title}</h3>
                    {hoveredCard === template.id && (
                      <p className="text-sm text-gray-600">{template.description}</p>
                    )}
                    <div className="mt-4">
                      <Link href={`/editor/create?template=${template.id}`} className="w-full inline-block text-center bg-gray-800 text-white py-2 px-4 rounded hover:bg-gray-700 transition">
                        使用此模板
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 功能亮點區塊 */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">為何選擇 EduCreate</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">快速創建</h3>
                <p className="text-gray-600">使用直觀的拖放界面，在幾分鐘內創建專業的互動教學活動</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">高度自定義</h3>
                <p className="text-gray-600">根據您的教學需求自定義模板，調整顏色、字體和布局</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">學生參與</h3>
                <p className="text-gray-600">提高學生參與度，通過互動遊戲和活動使學習更加有趣</p>
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