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
            基於記憶科學原理，提供記憶遊戲等完整的教育工具，
            支援 GEPT 分級系統，讓學習更有效率。
          </p>
          
          {/* 主要行動按鈕 */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/create"
              className="inline-flex items-center px-8 py-4 bg-blue-600 text-white text-lg font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
              data-testid="main-create-button"
            >
              <svg className="mr-3 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              開始創建活動
            </Link>

          </div>
        </div>

        {/* 核心功能展示 */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12" data-testid="features-title">
            核心功能
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* 🎮 記憶科學遊戲中心 - 遊戲切換器入口 - 最高優先級 */}
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





            {/* 記憶遊戲系統 */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow" data-testid="feature-memory-games">
              <div className="text-4xl mb-4">🎮</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">記憶遊戲系統</h3>
              <p className="text-gray-600 mb-6">
                基於記憶科學的5種遊戲模板：配對、填空、選擇題、排序、記憶卡片
              </p>
              <Link
                href="/create"
                className="inline-flex items-center text-blue-600 font-medium hover:text-blue-700"
                data-testid="memory-games-link"
              >
                立即創建
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
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



            {/* 創建活動 */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow" data-testid="feature-create-activity">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">創建活動</h3>
              <p className="text-gray-600 mb-6">
                選擇遊戲模板，輸入詞彙內容，一鍵創建25種記憶科學遊戲，完整的 Wordwall 風格創建流程
              </p>
              <Link
                href="/create"
                className="inline-flex items-center text-blue-600 font-medium hover:text-blue-700"
                data-testid="create-activity-link"
              >
                立即創建
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
              href="/my-activities"
              className="inline-flex items-center px-6 py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              data-testid="quick-my-activities"
            >
              📋 我的活動
            </Link>
            <Link
              href="/content/share-system"
              className="inline-flex items-center px-6 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
              data-testid="quick-share-system"
            >
              🔗 完整分享系統
            </Link>
            <Link
              href="/create"
              className="inline-flex items-center px-6 py-3 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors"
              data-testid="quick-create-activity"
            >
              🚀 創建活動
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
