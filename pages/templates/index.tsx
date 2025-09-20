import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

export default function TemplatesPage() {
  const router = useRouter();
  const sessionResult = useSession();
  const session = sessionResult?.data;
  const status = sessionResult?.status;

  return (
    <>
      <Head>
        <title>模板庫 | EduCreate</title>
        <meta name="description" content="瀏覽和選擇教學活動模板" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 頁面標題 */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">📚 模板庫</h1>
            <p className="text-xl text-gray-600 mb-6">
              模板庫正在維護升級中，敬請期待！
            </p>
          </div>

          {/* 狀態卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">🎮</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">遊戲模板</h3>
                  <p className="text-sm text-gray-500">23+ 個互動遊戲</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-semibold">📝</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">測驗模板</h3>
                  <p className="text-sm text-gray-500">多種測驗類型</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 font-semibold">🧠</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">記憶訓練</h3>
                  <p className="text-sm text-gray-500">認知增強遊戲</p>
                </div>
              </div>
            </div>
          </div>

          {/* 快速導航 */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">快速導航</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link 
                href="/games-showcase" 
                className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <span className="text-2xl mb-2">🎮</span>
                <span className="text-sm font-medium text-gray-900">遊戲展示</span>
              </Link>

              <Link 
                href="/create" 
                className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors"
              >
                <span className="text-2xl mb-2">➕</span>
                <span className="text-sm font-medium text-gray-900">創建活動</span>
              </Link>

              <Link 
                href="/dashboard" 
                className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
              >
                <span className="text-2xl mb-2">📊</span>
                <span className="text-sm font-medium text-gray-900">儀表板</span>
              </Link>

              <Link 
                href="/test-games" 
                className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors"
              >
                <span className="text-2xl mb-2">🧪</span>
                <span className="text-sm font-medium text-gray-900">測試中心</span>
              </Link>
            </div>
          </div>

          {/* 維護信息 */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-yellow-400 text-xl">⚠️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  系統維護通知
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    我們正在升級模板庫系統，添加更多功能和模板。
                    在此期間，您可以通過上方的快速導航訪問其他功能。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
