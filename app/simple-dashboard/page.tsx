'use client';

import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function SimpleDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎮 EduCreate 簡化版
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            基於記憶科學的教育遊戲平台 - 核心功能版
          </p>
          <div className="mb-6">
            <Link 
              href="/" 
              className="inline-block bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors mr-4"
            >
              ← 返回完整版
            </Link>
          </div>
        </header>

        {/* Game Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Shimozurdo Game */}
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="text-center">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold mb-2">Shimozurdo Game</h3>
              <p className="text-gray-600 mb-4">
                互動式詞彙學習遊戲，支持 GEPT 分級
              </p>
              <Link 
                href="/games/shimozurdo-game" 
                className="inline-block bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                開始遊戲
              </Link>
            </div>
          </div>

          {/* Game Switcher */}
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="text-center">
              <div className="text-4xl mb-4">🎮</div>
              <h3 className="text-xl font-semibold mb-2">遊戲切換器</h3>
              <p className="text-gray-600 mb-4">
                快速切換不同類型的教育遊戲
              </p>
              <Link 
                href="/games/switcher" 
                className="inline-block bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
              >
                遊戲選單
              </Link>
            </div>
          </div>

          {/* API Test */}
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="text-center">
              <div className="text-4xl mb-4">🔧</div>
              <h3 className="text-xl font-semibold mb-2">API 測試</h3>
              <p className="text-gray-600 mb-4">
                測試後端 API 連接和功能
              </p>
              <Link 
                href="/api-test" 
                className="inline-block bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600 transition-colors"
              >
                測試 API
              </Link>
            </div>
          </div>
        </div>

        {/* Features */}
        <section className="bg-white rounded-lg shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-center mb-8">平台特色</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-2">🧠</div>
              <h3 className="font-semibold mb-2">記憶科學</h3>
              <p className="text-sm text-gray-600">基於認知科學的學習方法</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">📊</div>
              <h3 className="font-semibold mb-2">GEPT 分級</h3>
              <p className="text-sm text-gray-600">符合台灣英語能力分級</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🎯</div>
              <h3 className="font-semibold mb-2">個人化</h3>
              <p className="text-sm text-gray-600">適應性學習推薦系統</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">📱</div>
              <h3 className="font-semibold mb-2">響應式</h3>
              <p className="text-sm text-gray-600">支持所有設備和螢幕</p>
            </div>
          </div>
        </section>

        {/* Status */}
        <section className="bg-blue-50 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold mb-4">🚀 架構分離部署</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded p-4">
              <h3 className="font-semibold text-green-600">✅ 後端 API</h3>
              <p className="text-sm text-gray-600">Express.js + Prisma + PostgreSQL</p>
              <p className="text-xs text-gray-500">部署於 Railway</p>
            </div>
            <div className="bg-white rounded p-4">
              <h3 className="font-semibold text-blue-600">🔄 前端靜態</h3>
              <p className="text-sm text-gray-600">Next.js Static Export</p>
              <p className="text-xs text-gray-500">部署於 Vercel</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="text-center py-8 text-gray-500">
        <p>&copy; 2025 EduCreate. 基於記憶科學的教育遊戲平台.</p>
      </footer>
    </div>
  );
}
