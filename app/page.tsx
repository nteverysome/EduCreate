/**
 * EduCreate 主頁
 * 提供所有功能的統一入口和導航
 */

'use client';

import React from 'react';
import Link from 'next/link';
import UnifiedNavigation from '@/components/navigation/UnifiedNavigation';

export default function HomePage() {
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
                href="/games/match"
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
