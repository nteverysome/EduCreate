import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import ContentManager from '../components/ContentManager';

export default function ContentManagerPage() {
  return (
    <>
      <Head>
        <title>內容管理 - EduCreate</title>
        <meta name="description" content="管理您的教學內容模板、版本控制和批量操作" />
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
                <Link href="/leaderboard" className="text-gray-600 hover:text-gray-900">
                  排行榜
                </Link>
                <Link href="/content-manager" className="text-blue-600 font-semibold">
                  內容管理
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main>
          <ContentManager />
        </main>
      </div>
    </>
  );
}
