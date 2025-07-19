/**
 * MyActivities 主頁面
 * Day 8-10: 完整活動管理系統的主要入口
 */
'use client';

import React, { useState } from 'react';
import UnifiedNavigation from '@/components/navigation/UnifiedNavigation';
import { MyActivities } from '@/components/user/MyActivities';

export default function MyActivitiesPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'timeline' | 'kanban'>('grid');

  return (
    <div className="min-h-screen bg-gray-50">
      <UnifiedNavigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 頁面標題 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4" data-testid="page-title">
            我的活動管理
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl">
            完整的活動管理系統，支持1000+活動、虛擬化列表、多視圖模式、智能搜索、批量操作
          </p>
        </div>

        {/* 功能特色展示 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">系統特色</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-2">📋</div>
              <h3 className="font-semibold text-gray-900 mb-1">虛擬化列表</h3>
              <p className="text-sm text-gray-600">支持1000+活動流暢滾動</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🔄</div>
              <h3 className="font-semibold text-gray-900 mb-1">多視圖模式</h3>
              <p className="text-sm text-gray-600">網格、列表、時間軸、看板</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🔍</div>
              <h3 className="font-semibold text-gray-900 mb-1">智能搜索</h3>
              <p className="text-sm text-gray-600">全文搜索、模糊匹配、語義搜索</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">📦</div>
              <h3 className="font-semibold text-gray-900 mb-1">批量操作</h3>
              <p className="text-sm text-gray-600">選擇、移動、複製、刪除、分享</p>
            </div>
          </div>
        </div>

        {/* 視圖模式切換 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">視圖模式</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                data-testid="view-grid"
              >
                🔲 網格
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                data-testid="view-list"
              >
                📋 列表
              </button>
              <button
                onClick={() => setViewMode('timeline')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'timeline'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                data-testid="view-timeline"
              >
                📅 時間軸
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'kanban'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                data-testid="view-kanban"
              >
                📊 看板
              </button>
            </div>
          </div>
        </div>

        {/* 主要的 MyActivities 組件 */}
        <div className="bg-white rounded-lg shadow-sm" data-testid="my-activities-container">
          <MyActivities
            userId="demo-user"
            initialView={viewMode}
            showWelcome={false}
            enableVirtualization={true}
            maxActivities={1500}
          />
        </div>

        {/* 快速功能入口 */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="text-2xl mb-3">🔍</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">高級過濾器</h3>
            <p className="text-gray-600 text-sm mb-4">GEPT等級、模板類型、標籤、日期範圍過濾</p>
            <a
              href="/activities/advanced-filter"
              className="text-blue-600 font-medium hover:text-blue-700"
              data-testid="advanced-filter-link"
            >
              使用過濾器 →
            </a>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="text-2xl mb-3">🔎</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">智能搜索</h3>
            <p className="text-gray-600 text-sm mb-4">全文搜索、模糊匹配、語義搜索、語音搜索</p>
            <a
              href="/activities/intelligent-search"
              className="text-blue-600 font-medium hover:text-blue-700"
              data-testid="intelligent-search-link"
            >
              智能搜索 →
            </a>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="text-2xl mb-3">📈</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">活動統計</h3>
            <p className="text-gray-600 text-sm mb-4">使用頻率、學習效果、時間分布分析</p>
            <a
              href="/activities/analytics"
              className="text-blue-600 font-medium hover:text-blue-700"
              data-testid="activity-analytics-link"
            >
              查看統計 →
            </a>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="text-2xl mb-3">📦</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">批量操作</h3>
            <p className="text-gray-600 text-sm mb-4">選擇、移動、複製、刪除、分享、標籤、導出</p>
            <button
              className="text-blue-600 font-medium hover:text-blue-700"
              data-testid="batch-operations-button"
            >
              批量管理 →
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="text-2xl mb-3">⭐</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">收藏和標籤</h3>
            <p className="text-gray-600 text-sm mb-4">自定義標籤、智能分類、收藏管理</p>
            <button
              className="text-blue-600 font-medium hover:text-blue-700"
              data-testid="favorites-tags-button"
            >
              管理標籤 →
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="text-2xl mb-3">📤</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">導入導出</h3>
            <p className="text-gray-600 text-sm mb-4">支持多種格式、批量處理、輕鬆遷移</p>
            <button
              className="text-blue-600 font-medium hover:text-blue-700"
              data-testid="import-export-button"
            >
              導入導出 →
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="text-2xl mb-3">📜</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">版本管理</h3>
            <p className="text-gray-600 text-sm mb-4">完整的變更追蹤、版本比較、回滾機制</p>
            <button
              className="text-blue-600 font-medium hover:text-blue-700"
              data-testid="version-history-button"
            >
              版本歷史 →
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="text-2xl mb-3">📋</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">複製模板化</h3>
            <p className="text-gray-600 text-sm mb-4">智能內容適配、一鍵複製、創建模板</p>
            <button
              className="text-blue-600 font-medium hover:text-blue-700"
              data-testid="copy-template-button"
            >
              複製模板 →
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="text-2xl mb-3">👥</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">分享協作</h3>
            <p className="text-gray-600 text-sm mb-4">實時協作編輯、分享管理、權限控制</p>
            <button
              className="text-blue-600 font-medium hover:text-blue-700"
              data-testid="share-collaborate-button"
            >
              分享協作 →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
