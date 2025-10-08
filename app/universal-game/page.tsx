/**
 * 統一內容編輯器主頁面
 * 提供所有內容編輯功能的統一入口和實際編輯器
 */
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import UnifiedNavigation from '@/components/navigation/UnifiedNavigation';
import UniversalContentEditor from '@/components/content/UniversalContentEditor';
import RichTextEditor from '@/components/content/RichTextEditor';
import VocabularyTableEditor from '@/components/vocabulary/VocabularyTableEditor';

export default function UniversalGamePage() {
  const [activeTab, setActiveTab] = useState('vocabulary-table');
  const [editorContent, setEditorContent] = useState('');
  const [vocabularyData, setVocabularyData] = useState([]);

  // 處理詞彙輸入完成
  const handleVocabularyComplete = (data: {
    title: string;
    vocabulary: any[];
    activityId?: string;
    gameVocabulary?: any[];
  }) => {
    console.log('🎯 詞彙輸入完成:', data);
    setVocabularyData(data.vocabulary);

    // 如果有遊戲數據，可以直接啟動遊戲
    if (data.gameVocabulary && data.activityId) {
      console.log('🎮 遊戲數據準備完成:', {
        activityId: data.activityId,
        gameVocabulary: data.gameVocabulary,
        mapping: {
          cloudText: '詞彙字 (英文) → 雲朵上的文字',
          targetHint: '答案 (中文) → 提示區域的文字'
        }
      });

      // 這裡可以導航到遊戲頁面
      // window.location.href = `/games/airplane?activity=${data.activityId}`;
    }
  };

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

        {/* 主要編輯器區域 */}
        <div className="bg-white rounded-lg shadow-sm mb-12">
          {/* 標籤導航 */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('vocabulary-table')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'vocabulary-table'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                data-testid="tab-vocabulary-table"
              >
                📝 詞彙表格輸入
              </button>
              <button
                onClick={() => setActiveTab('editor')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'editor'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                data-testid="tab-editor"
              >
                ✏️ 統一編輯器
              </button>
              <button
                onClick={() => setActiveTab('features')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'features'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                data-testid="tab-features"
              >
                🛠️ 功能模組
              </button>
              <button
                onClick={() => setActiveTab('templates')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'templates'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                data-testid="tab-templates"
              >
                📋 內容模板
              </button>
            </nav>
          </div>

          {/* 編輯器內容 */}
          <div className="p-6">
            {activeTab === 'vocabulary-table' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">詞彙表格輸入</h2>
                  <div className="text-sm text-gray-600">
                    模仿 Wordwall 的詞彙輸入界面，支援英文單字和中文翻譯
                  </div>
                </div>

                <VocabularyTableEditor
                  onVocabularyChange={setVocabularyData}
                  onComplete={handleVocabularyComplete}
                />
              </div>
            )}

            {activeTab === 'editor' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">統一內容編輯器</h2>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" data-testid="autosave-status"></div>
                      <span className="text-sm text-gray-600">自動保存已啟用</span>
                    </div>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                      💾 手動保存
                    </button>
                  </div>
                </div>

                {/* 實際的編輯器組件 */}
                <div className="border border-gray-200 rounded-lg min-h-[400px]">
                  <div className="p-4">
                    <textarea
                      value={editorContent}
                      onChange={(e) => setEditorContent(e.target.value)}
                      placeholder="開始創建您的教學內容..."
                      className="w-full h-80 p-4 border-0 resize-none focus:outline-none text-gray-900"
                      data-testid="rich-text-editor"
                    />
                  </div>

                  {/* 拖拽上傳區域 */}
                  <div className="border-t border-gray-200 p-4">
                    <div
                      className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer"
                      data-testid="drag-drop"
                    >
                      <div className="text-gray-500">
                        <span className="text-2xl mb-2 block">📤</span>
                        <p>拖拽文件到此處或點擊上傳</p>
                        <p className="text-sm mt-1">支持圖片、音頻、視頻等多媒體文件</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 編輯器工具欄 */}
                <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-200">
                  <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors" data-testid="media-upload">
                    <span>🎬</span>
                    <span>多媒體上傳</span>
                  </button>
                  <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors" data-testid="voice-recorder">
                    <span>🎤</span>
                    <span>語音錄製</span>
                  </button>
                  <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors" data-testid="ai-assistant">
                    <span>🤖</span>
                    <span>AI輔助</span>
                  </button>
                  <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors" data-testid="translation-panel">
                    <span>🌐</span>
                    <span>內容翻譯</span>
                  </button>
                  <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors" data-testid="template-selector">
                    <span>📋</span>
                    <span>內容模板</span>
                  </button>
                  <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors" data-testid="collaboration-panel">
                    <span>👥</span>
                    <span>實時協作</span>
                  </button>
                  <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors" data-testid="version-history">
                    <span>📚</span>
                    <span>版本歷史</span>
                  </button>
                  <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors" data-testid="validation-panel">
                    <span>✅</span>
                    <span>內容驗證</span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'features' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">功能模組</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {contentFeatures.map((feature) => (
                    <Link
                      key={feature.id}
                      href={feature.href}
                      className="block p-6 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all"
                      data-testid={`feature-${feature.id}`}
                    >
                      <div className="text-3xl mb-3">{feature.icon}</div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                      <p className="text-gray-600 text-sm mb-4">{feature.description}</p>
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          feature.status === 'available'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {feature.status === 'available' ? '可用' : '開發中'}
                        </span>
                        <span className="text-blue-600 font-medium">立即使用 →</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'templates' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">內容模板</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer" data-testid="template-gept-basic">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">📚 GEPT 初級模板</h3>
                    <p className="text-gray-600 text-sm mb-4">適合初學者的基礎詞彙和句型模板</p>
                    <button className="text-blue-600 font-medium">使用模板 →</button>
                  </div>
                  <div className="p-6 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer" data-testid="template-gept-intermediate">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">📖 GEPT 中級模板</h3>
                    <p className="text-gray-600 text-sm mb-4">中等難度的詞彙和語法結構模板</p>
                    <button className="text-blue-600 font-medium">使用模板 →</button>
                  </div>
                  <div className="p-6 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer" data-testid="template-gept-advanced">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">📝 GEPT 高級模板</h3>
                    <p className="text-gray-600 text-sm mb-4">高級詞彙和複雜語法結構模板</p>
                    <button className="text-blue-600 font-medium">使用模板 →</button>
                  </div>
                  <div className="p-6 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer" data-testid="template-custom">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">🎨 自定義模板</h3>
                    <p className="text-gray-600 text-sm mb-4">創建您自己的內容模板</p>
                    <button className="text-blue-600 font-medium">創建模板 →</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 功能特色 */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">為什麼選擇統一內容編輯器？</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">一鍵適配25種遊戲</h3>
              <p className="text-gray-600">創建一次內容，自動適配所有教育遊戲格式</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AI智能輔助</h3>
              <p className="text-gray-600">基於記憶科學原理的智能內容生成和優化</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">實時協作</h3>
              <p className="text-gray-600">多人同時編輯，實時同步，提升團隊效率</p>
            </div>
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
