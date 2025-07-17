/**
 * 統一內容編輯器主頁面
 * 提供所有內容編輯功能的統一入口
 */
'use client';

import React from 'react';
import Link from 'next/link';
import UnifiedNavigation from '@/components/navigation/UnifiedNavigation';

export default function UniversalGamePage() {
  const contentFeatures = [
    {
      id: 'rich-text-editor',
      title: '富文本編輯器',
      description: '完整的富文本編輯功能，支持格式化、表格、列表',
      icon: '✏️',
      href: '/content/rich-text-editor',
      status: 'available'
    },
    {
      id: 'multimedia-system',
      title: '多媒體支持',
      description: '圖片、音頻、視頻和動畫的完整多媒體支持',
      icon: '🎬',
      href: '/content/multimedia',
      status: 'available'
    },
    {
      id: 'voice-recording',
      title: '語音錄製',
      description: '語音錄製、播放、語音識別和語音合成',
      icon: '🎤',
      href: '/content/voice-recording',
      status: 'available'
    },
    {
      id: 'gept-templates',
      title: 'GEPT分級系統',
      description: 'GEPT分級模板管理、內容驗證和詞彙瀏覽',
      icon: '📚',
      href: '/content/gept-templates',
      status: 'available'
    },
    {
      id: 'realtime-collaboration',
      title: '實時協作',
      description: '多用戶同時編輯、版本歷史、變更追蹤',
      icon: '👥',
      href: '/content/realtime-collaboration',
      status: 'available'
    },
    {
      id: 'ai-content-generation',
      title: 'AI內容生成',
      description: '基於記憶科學原理的AI內容生成和翻譯',
      icon: '🤖',
      href: '/content/ai-content-generation',
      status: 'available'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 導航欄 */}
      <UnifiedNavigation />

      {/* 主要內容 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" role="main">
        {/* 頁面標題 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4" data-testid="page-title">
            統一內容編輯器
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            一站式內容管理平台，支持文字、圖片輸入，一鍵適配25種教育遊戲，模仿 Wordwall 模式
          </p>
        </div>

        {/* 功能概覽 */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">核心功能</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contentFeatures.map((feature) => (
              <Link
                key={feature.id}
                href={feature.href}
                className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow"
                data-testid={`feature-${feature.id}`}
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 mb-4">{feature.description}</p>
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    feature.status === 'available' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {feature.status === 'available' ? '可用' : '開發中'}
                  </span>
                  <span className="text-blue-600 font-medium">立即使用 →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* 快速開始 */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">快速開始</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🚀 新用戶指南</h3>
              <ol className="space-y-2 text-gray-600">
                <li>1. 選擇一個內容編輯功能開始</li>
                <li>2. 創建或編輯您的教學內容</li>
                <li>3. 使用GEPT分級系統驗證內容</li>
                <li>4. 邀請同事進行實時協作</li>
                <li>5. 導出內容到25種教育遊戲格式</li>
              </ol>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 推薦工作流程</h3>
              <div className="space-y-3">
                <Link
                  href="/content/rich-text-editor"
                  className="block p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                  data-testid="workflow-step-1"
                >
                  <span className="font-medium">步驟1:</span> 富文本編輯器創建基礎內容
                </Link>
                <Link
                  href="/content/multimedia"
                  className="block p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                  data-testid="workflow-step-2"
                >
                  <span className="font-medium">步驟2:</span> 添加多媒體元素
                </Link>
                <Link
                  href="/content/gept-templates"
                  className="block p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                  data-testid="workflow-step-3"
                >
                  <span className="font-medium">步驟3:</span> GEPT分級驗證
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* 系統狀態 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">系統狀態</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-sm font-medium text-green-800">編輯器服務</span>
              <span className="flex items-center text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                正常運行
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-sm font-medium text-green-800">協作服務</span>
              <span className="flex items-center text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                正常運行
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-sm font-medium text-green-800">AI服務</span>
              <span className="flex items-center text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                正常運行
              </span>
            </div>
          </div>
        </div>

        {/* 返回導航 */}
        <div className="mt-12 text-center">
          <div className="space-x-4">
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              data-testid="back-to-home"
            >
              ← 返回主頁
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              data-testid="go-to-dashboard"
            >
              📊 功能儀表板
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
