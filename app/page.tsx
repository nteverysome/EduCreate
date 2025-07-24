/**
 * EduCreate 主頁
 * 提供所有功能的統一入口和導航
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import UnifiedNavigation from '@/components/navigation/UnifiedNavigation';

export default function HomePage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* 統一導航系統 */}
      <UnifiedNavigation variant="header" />

      {/* 主要內容 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 英雄區域 */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6" data-testid="hero-title">
            EduCreate
          </h1>
          <p className="text-2xl text-gray-600 mb-8" data-testid="hero-subtitle">
            記憶科學驅動的智能教育遊戲平台
          </p>
          <p className="text-lg text-gray-500 max-w-3xl mx-auto mb-12" data-testid="hero-description">
            基於記憶科學原理，提供智能排序、檔案夾統計分析、記憶遊戲等完整的教育工具，
            支援 GEPT 分級系統和無障礙設計，讓學習更有效率。
          </p>
          
          {/* 主要行動按鈕 */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center px-8 py-4 bg-blue-600 text-white text-lg font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
              data-testid="main-dashboard-button"
            >
              <svg className="mr-3 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              探索所有功能
            </Link>
            <Link
              href="/demo/smart-sorting"
              className="inline-flex items-center px-8 py-4 bg-white text-blue-600 text-lg font-medium rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition-colors"
              data-testid="demo-button"
            >
              <svg className="mr-3 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M19 10a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              體驗演示
            </Link>
          </div>
        </div>

        {/* 核心功能展示 */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12" data-testid="features-title">
            核心功能
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* 測試卡片 - 強制編譯觸發 */}
            <div style={{backgroundColor: 'red', color: 'white', padding: '20px', border: '5px solid black', fontSize: '18px'}}>
              <h3>🔗 測試分享系統卡片 - 強制編譯</h3>
              <p>如果你看到這個紅色卡片，說明編譯成功！</p>
              <p>時間戳：{new Date().toLocaleTimeString()}</p>
            </div>

            {/* 記憶科學遊戲中心 - 遊戲切換器入口 */}
            <div className="bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow text-white" data-testid="feature-game-switcher">
              <div className="text-4xl mb-4">🎮</div>
              <h3 className="text-xl font-semibold mb-3">記憶科學遊戲中心</h3>
              <p className="text-purple-100 mb-6">
                動態切換多種記憶科學遊戲，支援 AirplaneCollisionGame 等已完成遊戲，60fps 世界級性能
              </p>
              <Link
                href="/games/switcher"
                className="inline-flex items-center bg-white text-purple-600 font-medium px-4 py-2 rounded-lg hover:bg-purple-50 transition-colors"
                data-testid="game-switcher-link"
              >
                進入遊戲中心
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* AirplaneCollisionGame - 世界級性能遊戲 */}
            <div className="bg-gradient-to-br from-green-500 to-teal-600 rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow text-white" data-testid="feature-airplane-game">
              <div className="text-4xl mb-4">✈️</div>
              <h3 className="text-xl font-semibold mb-3">飛機碰撞遊戲</h3>
              <p className="text-green-100 mb-6">
                世界級 60fps 性能，記憶體使用僅 5.1%，基於記憶科學原理的英語詞彙學習遊戲
              </p>
              <Link
                href="/games/airplane"
                className="inline-flex items-center bg-white text-green-600 font-medium px-4 py-2 rounded-lg hover:bg-green-50 transition-colors"
                data-testid="airplane-game-link"
              >
                立即遊戲
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* 智能排序系統 */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow" data-testid="feature-smart-sorting">
              <div className="text-4xl mb-4">🔄</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">智能排序系統</h3>
              <p className="text-gray-600 mb-6">
                支援16種排序維度，AI智能推薦，基於記憶科學原理的多維度排序
              </p>
              <Link
                href="/demo/smart-sorting"
                className="inline-flex items-center text-blue-600 font-medium hover:text-blue-700"
                data-testid="smart-sorting-link"
              >
                立即體驗
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* 我的活動管理 - MyActivities 主要入口 */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow" data-testid="feature-my-activities">
              <div className="text-4xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">我的活動管理</h3>
              <p className="text-gray-600 mb-6">
                完整的活動管理系統，支持1000+活動、虛擬化列表、多視圖模式、智能搜索、批量操作
              </p>
              <Link
                href="/my-activities"
                className="inline-flex items-center text-blue-600 font-medium hover:text-blue-700"
                data-testid="my-activities-link"
              >
                管理我的活動
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* 活動模板和快速創建 */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow" data-testid="feature-activity-templates">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">活動模板和快速創建</h3>
              <p className="text-gray-600 mb-6">
                基於GEPT分級的活動模板，一鍵快速創建25種記憶科學遊戲，智能內容適配
              </p>
              <Link
                href="/activities/templates"
                className="inline-flex items-center text-blue-600 font-medium hover:text-blue-700"
                data-testid="activity-templates-link"
              >
                立即體驗
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* 收藏和標籤系統 */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow" data-testid="feature-favorites-tags">
              <div className="text-4xl mb-4">⭐</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">收藏和標籤系統</h3>
              <p className="text-gray-600 mb-6">
                自定義標籤、智能分類、收藏管理，基於記憶科學的個人化內容組織系統
              </p>
              <Link
                href="/activities/favorites-tags"
                className="inline-flex items-center text-blue-600 font-medium hover:text-blue-700"
                data-testid="favorites-tags-link"
              >
                立即體驗
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* 活動統計和分析 */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow" data-testid="feature-activity-analytics">
              <div className="text-4xl mb-4">📈</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">活動統計和分析</h3>
              <p className="text-gray-600 mb-6">
                使用頻率、學習效果、時間分布的完整分析，基於記憶科學的個人化學習洞察
              </p>
              <Link
                href="/activities/analytics"
                className="inline-flex items-center text-blue-600 font-medium hover:text-blue-700"
                data-testid="activity-analytics-link"
              >
                立即體驗
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* 檔案夾統計分析 */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow" data-testid="feature-folder-analytics">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">檔案夾統計分析</h3>
              <p className="text-gray-600 mb-6">
                完整的檔案夾統計數據、學習效果分析、健康度評估和趨勢分析
              </p>
              <Link
                href="/demo/folder-analytics"
                className="inline-flex items-center text-blue-600 font-medium hover:text-blue-700"
                data-testid="folder-analytics-link"
              >
                立即體驗
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>



            {/* 記憶遊戲系統 */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow" data-testid="feature-memory-games">
              <div className="text-4xl mb-4">🎮</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">記憶遊戲系統</h3>
              <p className="text-gray-600 mb-6">
                基於記憶科學的5種遊戲模板：配對、填空、選擇題、排序、記憶卡片
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center text-blue-600 font-medium hover:text-blue-700"
                data-testid="memory-games-link"
              >
                查看更多
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Airplane Collision Game - 新增功能 - 強制更新 */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow border-2 border-blue-200" data-testid="feature-airplane-game">
              <div className="text-4xl mb-4">🛩️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">🛩️ Airplane Collision Game</h3>
              <p className="text-gray-600 mb-6">
                基於主動回憶記憶科學原理的飛機碰撞遊戲，支援 GEPT 分級詞彙、多模態特效、觸覺反饋
              </p>
              <div className="flex flex-col space-y-2 mb-6">
                <div className="flex items-center text-sm text-gray-500">
                  <span className="mr-2">🧠</span>
                  <span>主動回憶 + 視覺記憶 + 模式識別</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="mr-2">🎯</span>
                  <span>GEPT 三級詞彙分級系統</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="mr-2">✨</span>
                  <span>音效、視覺、觸覺三重特效</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="mr-2">📊</span>
                  <span>實時學習數據追蹤</span>
                </div>
              </div>
              <Link
                href="/games/airplane"
                className="inline-flex items-center text-blue-600 font-medium hover:text-blue-700"
                data-testid="airplane-game-link"
              >
                立即體驗飛機遊戲
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Airplane Collision Game (Vite iframe 版本) - 新技術架構 */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow border-2 border-purple-200" data-testid="feature-airplane-iframe-game">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">⚡ Airplane Game (Vite 版本)</h3>
              <p className="text-gray-600 mb-6">
                使用 Vite + Phaser 3 技術架構的飛機碰撞遊戲，通過 iframe 嵌入，提供極致的遊戲性能和開發體驗
              </p>
              <div className="flex flex-col space-y-2 mb-6">
                <div className="flex items-center text-sm text-gray-500">
                  <span className="mr-2">⚡</span>
                  <span>Vite 極速熱重載 + WebGL 硬體加速</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="mr-2">🎮</span>
                  <span>Phaser 3.90.0 遊戲引擎</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="mr-2">🌙</span>
                  <span>月亮主題視差背景系統</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="mr-2">📱</span>
                  <span>iframe 響應式嵌入 + 父子通信</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="mr-2">🔧</span>
                  <span>完整的錯誤處理 + 全螢幕支援</span>
                </div>
              </div>
              <Link
                href="/games/airplane-iframe"
                className="inline-flex items-center text-purple-600 font-medium hover:text-purple-700"
                data-testid="airplane-iframe-game-link"
              >
                體驗 Vite 版本遊戲
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* 無障礙支援系統 */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow border-2 border-purple-200" data-testid="feature-accessibility">
              <div className="text-4xl mb-4">♿</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">無障礙支援系統</h3>
              <p className="text-gray-600 mb-6">
                完整的鍵盤導航、螢幕閱讀器支援、WCAG 2.1 AA 合規設計，讓所有用戶都能輕鬆使用
              </p>
              <div className="flex flex-col space-y-2 mb-6">
                <div className="flex items-center text-sm text-gray-500">
                  <span className="mr-2">⌨️</span>
                  <span>完整鍵盤導航支援</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="mr-2">🔊</span>
                  <span>螢幕閱讀器優化</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="mr-2">✅</span>
                  <span>WCAG 2.1 AA 合規</span>
                </div>
              </div>
              <Link
                href="/games/match"
                className="inline-flex items-center text-purple-600 font-medium hover:text-purple-700"
                data-testid="accessibility-demo-link"
              >
                體驗無障礙遊戲
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* 富文本編輯器 */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow" data-testid="feature-rich-text-editor">
              <div className="text-4xl mb-4">✏️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">富文本編輯器</h3>
              <p className="text-gray-600 mb-6">
                完整的富文本編輯功能，支持格式化、表格、列表和無障礙設計
              </p>
              <Link
                href="/content/rich-text-editor"
                className="inline-flex items-center text-blue-600 font-medium hover:text-blue-700"
                data-testid="rich-text-editor-link"
              >
                立即體驗
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* 多媒體支持系統 */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow" data-testid="feature-multimedia">
              <div className="text-4xl mb-4">🎬</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">多媒體支持系統</h3>
              <p className="text-gray-600 mb-6">
                完整的多媒體上傳、管理和預覽功能，支持圖片、音頻、視頻和動畫
              </p>
              <Link
                href="/content/multimedia"
                className="inline-flex items-center text-blue-600 font-medium hover:text-blue-700"
                data-testid="multimedia-link"
              >
                立即體驗
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* 智能搜索系統 */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow" data-testid="feature-intelligent-search">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">智能搜索系統</h3>
              <p className="text-gray-600 mb-6">
                全文搜索、模糊匹配、語義搜索、語音搜索的完整搜索功能，支持實時搜索結果更新
              </p>
              <Link
                href="/activities/intelligent-search"
                className="inline-flex items-center text-blue-600 font-medium hover:text-blue-700"
                data-testid="intelligent-search-link"
              >
                立即體驗
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* 批量操作系統 */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow" data-testid="feature-batch-operations">
              <div className="text-4xl mb-4">🔄</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">批量操作系統</h3>
              <p className="text-gray-600 mb-6">
                選擇、移動、複製、刪除、分享、標籤、導出的批量操作功能，支持多選和快捷鍵
              </p>
              <Link
                href="/activities/batch-operations"
                className="inline-flex items-center text-blue-600 font-medium hover:text-blue-700"
                data-testid="batch-operations-link"
              >
                立即體驗
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* 語音錄製系統 */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow" data-testid="feature-voice-recording">
              <div className="text-4xl mb-4">🎤</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">語音錄製系統</h3>
              <p className="text-gray-600 mb-6">
                完整的語音錄製、播放、語音識別和語音合成功能，支持多種音頻格式
              </p>
              <Link
                href="/content/voice-recording"
                className="inline-flex items-center text-blue-600 font-medium hover:text-blue-700"
                data-testid="voice-recording-link"
              >
                立即體驗
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* GEPT分級系統 */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow" data-testid="feature-gept-templates">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">GEPT分級系統</h3>
              <p className="text-gray-600 mb-6">
                完整的GEPT分級模板管理、內容驗證和詞彙瀏覽功能，支持三個級別
              </p>
              <Link
                href="/content/gept-templates"
                className="inline-flex items-center text-blue-600 font-medium hover:text-blue-700"
                data-testid="gept-templates-link"
              >
                立即體驗
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* 實時協作系統 */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow" data-testid="feature-realtime-collaboration">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">實時協作系統</h3>
              <p className="text-gray-600 mb-6">
                多用戶同時編輯、版本歷史、變更追蹤和衝突解決，實時協作延遲 &lt;100ms
              </p>
              <Link
                href="/content/realtime-collaboration"
                className="inline-flex items-center text-blue-600 font-medium hover:text-blue-700"
                data-testid="realtime-collaboration-link"
              >
                立即體驗
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* 統一內容編輯器 */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow" data-testid="feature-universal-content-editor">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">統一內容編輯器</h3>
              <p className="text-gray-600 mb-6">
                一站式內容管理平台，支持文字、圖片輸入，一鍵適配25種教育遊戲，模仿 Wordwall 模式
              </p>
              <Link
                href="/universal-game"
                className="inline-flex items-center text-blue-600 font-medium hover:text-blue-700"
                data-testid="universal-content-editor-link"
              >
                立即體驗
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* AI內容生成系統 */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow" data-testid="feature-ai-content-generation">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">AI內容生成系統</h3>
              <p className="text-gray-600 mb-6">
                基於記憶科學原理的AI內容生成，支持多語言翻譯和個性化學習建議
              </p>
              <Link
                href="/content/ai-content-generation"
                className="inline-flex items-center text-blue-600 font-medium hover:text-blue-700"
                data-testid="ai-content-generation-link"
              >
                立即體驗
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Match配對遊戲 */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow" data-testid="feature-match-game">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Match配對遊戲</h3>
              <p className="text-gray-600 mb-6">
                基於記憶科學原理的配對遊戲，支持多種模式和智能適配，挑戰記憶力
              </p>
              <Link
                href="/match-game"
                className="inline-flex items-center text-blue-600 font-medium hover:text-blue-700"
                data-testid="match-game-link"
              >
                立即體驗
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* 自動保存系統 */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow" data-testid="feature-auto-save">
              <div className="text-4xl mb-4">💾</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">自動保存系統</h3>
              <p className="text-gray-600 mb-6">
                智能自動保存、離線支持、版本控制和批量優化，零數據丟失保證
              </p>
              <Link
                href="/content/autosave"
                className="inline-flex items-center text-blue-600 font-medium hover:text-blue-700"
                data-testid="auto-save-link"
              >
                立即體驗
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* 檔案夾協作系統 */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow" data-testid="feature-folder-collaboration">
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">檔案夾協作</h3>
              <p className="text-gray-600 mb-6">
                三層分享模式的檔案夾協作權限系統：公開、班級、私人分享
              </p>
              <Link
                href="/collaboration/folders"
                className="inline-flex items-center text-blue-600 font-medium hover:text-blue-700"
                data-testid="folder-collaboration-link"
              >
                立即體驗
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* 檔案夾模板系統 */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow" data-testid="feature-folder-templates">
              <div className="text-4xl mb-4">📁</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">檔案夾模板</h3>
              <p className="text-gray-600 mb-6">
                預設模板快速創建檔案夾結構，支援語言學習、數學、科學等分類
              </p>
              <Link
                href="/tools/folder-templates"
                className="inline-flex items-center text-blue-600 font-medium hover:text-blue-700"
                data-testid="folder-templates-link"
              >
                立即體驗
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* 完整5遊戲模板架構 */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow" data-testid="feature-five-games-architecture">
              <div className="text-4xl mb-4">🎮</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">完整5遊戲模板架構</h3>
              <p className="text-gray-600 mb-6">
                Match配對、Fill-in填空、Quiz測驗、Sequence順序、Flashcard閃卡等5種記憶科學遊戲
              </p>
              <Link
                href="/games/five-games-architecture"
                className="inline-flex items-center text-blue-600 font-medium hover:text-blue-700"
                data-testid="five-games-architecture-link"
              >
                立即體驗
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* 完整檔案空間系統 */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow" data-testid="feature-file-space-system">
              <div className="text-4xl mb-4">📁</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">完整檔案空間系統</h3>
              <p className="text-gray-600 mb-6">
                嵌套檔案夾結構、權限系統、高級搜索、批量操作、智能排序等完整功能
              </p>
              <Link
                href="/file-space"
                className="inline-flex items-center text-blue-600 font-medium hover:text-blue-700"
                data-testid="file-space-system-link"
              >
                立即體驗
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* 完整遊戲切換系統 */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow" data-testid="feature-game-switcher">
              <div className="text-4xl mb-4">🔄</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">完整遊戲切換系統</h3>
              <p className="text-gray-600 mb-6">
                無縫遊戲切換、智能內容適配、狀態保持恢復、50種切換模式等完整功能
              </p>
              <Link
                href="/games/game-switcher"
                className="inline-flex items-center text-blue-600 font-medium hover:text-blue-700"
                data-testid="game-switcher-link"
              >
                立即體驗
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>



            {/* 完整縮圖和預覽系統 */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow" data-testid="feature-thumbnail-preview">
              <div className="text-4xl mb-4">🖼️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">完整縮圖和預覽系統</h3>
              <p className="text-gray-600 mb-6">
                400px標準縮圖、多尺寸支持、CDN集成、懶加載、批量管理等完整功能
              </p>
              <Link
                href="/content/thumbnail-preview"
                className="inline-flex items-center text-blue-600 font-medium hover:text-blue-700"
                data-testid="thumbnail-preview-link"
              >
                立即體驗
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* 活動複製和模板化 */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow" data-testid="feature-activity-copy-template">
              <div className="text-4xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">活動複製和模板化</h3>
              <p className="text-gray-600 mb-6">
                智能內容適配，一鍵複製活動，創建個人化模板，跨等級內容轉換
              </p>
              <Link
                href="/activities/copy-template"
                className="inline-flex items-center text-blue-600 font-medium hover:text-blue-700"
                data-testid="activity-copy-template-link"
              >
                立即體驗
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* 活動歷史和版本管理 */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow" data-testid="feature-activity-history-version">
              <div className="text-4xl mb-4">📜</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">活動歷史和版本管理</h3>
              <p className="text-gray-600 mb-6">
                完整的變更追蹤、版本比較、回滾機制，協作編輯歷史記錄
              </p>
              <Link
                href="/activities/history-version"
                className="inline-flex items-center text-blue-600 font-medium hover:text-blue-700"
                data-testid="activity-history-version-link"
              >
                立即體驗
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* 活動導入導出功能 */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow" data-testid="feature-activity-import-export">
              <div className="text-4xl mb-4">📤</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">活動導入導出功能</h3>
              <p className="text-gray-600 mb-6">
                支持多種格式的活動導入導出，批量處理，輕鬆遷移和分享學習內容
              </p>
              <Link
                href="/activities/import-export"
                className="inline-flex items-center text-blue-600 font-medium hover:text-blue-700"
                data-testid="activity-import-export-link"
              >
                立即體驗
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* 檔案夾導入導出 */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow" data-testid="feature-folder-import-export">
              <div className="text-4xl mb-4">🔄</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">檔案夾導入導出</h3>
              <p className="text-gray-600 mb-6">
                支援 Wordwall 格式的檔案夾和活動導入導出功能，輕鬆遷移和分享
              </p>
              <Link
                href="/tools/folder-import-export"
                className="inline-flex items-center text-blue-600 font-medium hover:text-blue-700"
                data-testid="folder-import-export-link"
              >
                立即體驗
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* 實時同步和衝突解決 */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow" data-testid="feature-real-time-sync">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">實時同步和衝突解決</h3>
              <p className="text-gray-600 mb-6">
                支援多用戶同時操作的實時同步系統，智能衝突檢測和解決機制
              </p>
              <Link
                href="/tools/real-time-sync"
                className="inline-flex items-center text-blue-600 font-medium hover:text-blue-700"
                data-testid="real-time-sync-link"
              >
                立即體驗
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* 視差背景系統 - 新增功能 */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow border-2 border-green-200" data-testid="feature-parallax-background">
              <div className="text-4xl mb-4">🌄</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">視差背景系統</h3>
              <p className="text-gray-600 mb-6">
                專業級視差背景效果，支援森林、沙漠、天空、月亮四種主題，增強記憶科學遊戲的沉浸式體驗
              </p>
              <div className="flex flex-col space-y-2 mb-6">
                <div className="flex items-center text-sm text-gray-500">
                  <span className="mr-2">🌲</span>
                  <span>四種主題場景（森林、沙漠、天空、月亮）</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="mr-2">📱</span>
                  <span>支援水平和垂直佈局</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="mr-2">♿</span>
                  <span>無障礙設計（可禁用動畫）</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="mr-2">🎮</span>
                  <span>完整遊戲素材包含</span>
                </div>
              </div>
              <Link
                href="/games/parallax-background-demo"
                className="inline-flex items-center text-green-600 font-medium hover:text-green-700"
                data-testid="parallax-background-link"
              >
                立即體驗視差背景
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* 技術特色 */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-16">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8" data-testid="tech-features-title">
            技術特色
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center" data-testid="tech-memory-science">
              <div className="text-3xl mb-3">🧠</div>
              <h3 className="font-semibold text-gray-900 mb-2">記憶科學</h3>
              <p className="text-sm text-gray-600">基於間隔重複和主動回憶原理</p>
            </div>
            
            <div className="text-center" data-testid="tech-gept-support">
              <div className="text-3xl mb-3">📚</div>
              <h3 className="font-semibold text-gray-900 mb-2">GEPT 分級</h3>
              <p className="text-sm text-gray-600">支援三級分級詞彙系統</p>
            </div>
            
            <div className="text-center" data-testid="tech-accessibility">
              <div className="text-3xl mb-3">♿</div>
              <h3 className="font-semibold text-gray-900 mb-2">無障礙設計</h3>
              <p className="text-sm text-gray-600">WCAG 2.1 AA 完全合規</p>
            </div>
            
            <div className="text-center" data-testid="tech-ai-powered">
              <div className="text-3xl mb-3">🤖</div>
              <h3 className="font-semibold text-gray-900 mb-2">AI 智能</h3>
              <p className="text-sm text-gray-600">智能推薦和個人化學習</p>
            </div>
          </div>
        </div>

        {/* 快速訪問 */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-8" data-testid="quick-access-title">
            快速訪問
          </h2>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center px-6 py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              data-testid="quick-dashboard"
            >
              📊 功能儀表板
            </Link>
            <Link
              href="/content/share-system"
              className="inline-flex items-center px-6 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
              data-testid="quick-share-system"
            >
              🔗 完整分享系統
            </Link>
            <Link
              href="/universal-game"
              className="inline-flex items-center px-6 py-3 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors"
              data-testid="quick-universal-content-editor"
            >
              📝 統一內容編輯器
            </Link>
            <Link
              href="/demo/smart-sorting"
              className="inline-flex items-center px-6 py-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
              data-testid="quick-smart-sorting"
            >
              🔄 智能排序
            </Link>
            <Link
              href="/demo/folder-analytics"
              className="inline-flex items-center px-6 py-3 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
              data-testid="quick-folder-analytics"
            >
              📈 檔案夾統計
            </Link>
          </div>
        </div>
      </main>

      {/* 頁腳 */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p data-testid="footer-text">
              © 2024 EduCreate - 記憶科學驅動的智能教育遊戲平台
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
