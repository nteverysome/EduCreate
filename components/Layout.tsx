/**
 * 主要布局組件
 * 包含導航欄和記憶增強系統入口
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession, signOut } from 'next-auth/react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const router = useRouter();
  const sessionResult = useSession();
  const session = sessionResult?.data;
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigation = [
    { name: '首頁', href: '/', icon: '🏠' },
    { name: '創建活動', href: '/create', icon: '✨' },
    { name: '我的活動', href: '/dashboard', icon: '📚' },
    { name: 'AI 功能', href: '/ai-features', icon: '🤖' },
    { name: '記憶增強', href: '/memory-enhancement', icon: '🧠' },
    { name: '模板庫', href: '/templates', icon: '🎯' },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return router.pathname === '/';
    }
    return router.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 導航欄 */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo 和主導航 */}
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/" className="text-2xl font-bold text-blue-600">
                  EduCreate
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* 用戶菜單 */}
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              {session ? (
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-700">
                    歡迎，{session.user?.name || session.user?.email}
                  </div>
                  <Link
                    href="/profile"
                    className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    個人資料
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium"
                  >
                    登出
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    href="/login"
                    className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    登入
                  </Link>
                  <Link
                    href="/register"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-medium"
                  >
                    註冊
                  </Link>
                </div>
              )}
            </div>

            {/* 移動端菜單按鈕 */}
            <div className="sm:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                <span className="sr-only">打開主菜單</span>
                {isMenuOpen ? (
                  <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 移動端菜單 */}
        {isMenuOpen && (
          <div className="sm:hidden">
            <div className="pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                    isActive(item.href)
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
            </div>
            <div className="pt-4 pb-3 border-t border-gray-200">
              {session ? (
                <div className="space-y-1">
                  <div className="px-4 text-base font-medium text-gray-800">
                    {session.user?.name || session.user?.email}
                  </div>
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    個人資料
                  </Link>
                  <button
                    onClick={() => {
                      signOut();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  >
                    登出
                  </button>
                </div>
              ) : (
                <div className="space-y-1">
                  <Link
                    href="/login"
                    className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    登入
                  </Link>
                  <Link
                    href="/register"
                    className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    註冊
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* 記憶增強系統快速入口 */}
      {router.pathname !== '/memory-enhancement' && (
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-lg mr-2">🧠</span>
                  <span className="text-sm font-medium">
                    基於 25 個 WordWall 模板分析的記憶增強系統已上線！
                  </span>
                </div>
                <Link
                  href="/memory-enhancement"
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  立即體驗 →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 主要內容 */}
      <main className="flex-1">
        {children}
      </main>

      {/* 頁腳 */}
      <footer className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">EduCreate</h3>
                <p className="text-gray-600 text-sm">
                  基於記憶科學的 AI 教育遊戲平台，讓學習更有效、更有趣。
                </p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-4">產品</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li><Link href="/templates" className="hover:text-gray-900">模板庫</Link></li>
                  <li><Link href="/memory-enhancement" className="hover:text-gray-900">記憶增強</Link></li>
                  <li><Link href="/create" className="hover:text-gray-900">創建活動</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-4">支援</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li><Link href="/help" className="hover:text-gray-900">幫助中心</Link></li>
                  <li><Link href="/contact" className="hover:text-gray-900">聯絡我們</Link></li>
                  <li><Link href="/feedback" className="hover:text-gray-900">意見反饋</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-4">法律</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li><Link href="/privacy" className="hover:text-gray-900">隱私政策</Link></li>
                  <li><Link href="/terms" className="hover:text-gray-900">服務條款</Link></li>
                </ul>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  © 2024 EduCreate. 基於 WordWall 分析的記憶科學平台。
                </p>
                <div className="flex space-x-4">
                  <span className="text-sm text-gray-500">
                    🧠 25 個模板已分析 | 📊 73.5% 完成度
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
export default Layout;
