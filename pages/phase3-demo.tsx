/**
 * 第三階段演示頁面
 * 展示高級功能和企業級特性
 */

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import AIContentGenerator from '../components/ai/AIContentGenerator';
import SmartRecommendations from '../components/ai/SmartRecommendations';
import CollaborativeEditor from '../components/collaboration/CollaborativeEditor';
import AnalyticsDashboard from '../components/analytics/AnalyticsDashboard';
import OrganizationDashboard from '../components/enterprise/OrganizationDashboard';
import { GameType } from '../lib/content/UniversalContentManager';

export default function Phase3Demo() {
  const [activeMode, setActiveMode] = useState<string>('overview');
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [selectedGameType, setSelectedGameType] = useState<GameType>('quiz');
  const [userId] = useState('demo-user-' + Math.random().toString(36).substr(2, 9));
  const [username] = useState('演示用戶');

  const modes = [
    { id: 'overview', name: '功能概覽', icon: '🚀', description: '第三階段高級功能總覽' },
    { id: 'ai-content', name: 'AI 內容生成', icon: '🤖', description: 'AI 自動生成教育內容' },
    { id: 'smart-recommendations', name: '智能推薦', icon: '✨', description: '個性化內容推薦系統' },
    { id: 'auto-grading', name: '自動評分', icon: '📊', description: 'AI 自動評分和反饋' },
    { id: 'collaboration', name: '實時協作', icon: '🤝', description: '多用戶實時協作編輯' },
    { id: 'analytics', name: '高級分析', icon: '📈', description: '學習分析和報告' },
    { id: 'enterprise', name: '企業功能', icon: '🏢', description: '企業級管理和API' }
  ];

  const handleAIContentGenerated = (content: any[]) => {
    console.log('AI 生成的內容:', content);
    setShowAIGenerator(false);
    // 這裡可以將生成的內容應用到當前活動
  };

  const handleActivitySelect = (activityId: string) => {
    console.log('選擇的活動:', activityId);
    // 這裡可以導航到具體的活動頁面
  };

  return (
    <>
      <Head>
        <title>第三階段演示 - 高級功能 | EduCreate</title>
        <meta name="description" content="EduCreate 第三階段高級功能演示" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
        {/* 頭部 */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-lg font-bold">3</span>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">第三階段演示</h1>
                    <div className="text-sm text-gray-500">高級功能和企業級特性</div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-sm text-purple-600 font-medium bg-purple-100 px-3 py-1 rounded-full">
                  🚀 AI 驅動
                </div>
                <div className="text-sm text-blue-600 font-medium bg-blue-100 px-3 py-1 rounded-full">
                  🏢 企業級
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 功能選擇標籤 */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8 overflow-x-auto">
              {modes.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setActiveMode(mode.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                    activeMode === mode.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span>{mode.icon}</span>
                    <span>{mode.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 主要內容 */}
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {/* 功能概覽 */}
          {activeMode === 'overview' && (
            <div>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">🚀 第三階段：高級功能</h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  AI 驅動的智能教育平台，提供企業級功能和高級分析能力
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {modes.slice(1).map((mode) => (
                  <div
                    key={mode.id}
                    onClick={() => setActiveMode(mode.id)}
                    className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer border-2 border-transparent hover:border-purple-200"
                  >
                    <div className="text-4xl mb-4">{mode.icon}</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{mode.name}</h3>
                    <p className="text-gray-600 text-sm">{mode.description}</p>
                    <div className="mt-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        點擊體驗
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* 技術特點 */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">🎯 核心技術特點</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">🤖 AI 增強功能</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• 多模型 AI 內容生成（GPT-4、Claude-3、Gemini）</li>
                      <li>• 智能推薦算法（協同過濾 + 內容推薦）</li>
                      <li>• AI 自動評分和語義分析</li>
                      <li>• 個性化學習路徑規劃</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">🏢 企業級特性</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• 實時多用戶協作編輯</li>
                      <li>• 高級學習分析和報告</li>
                      <li>• 組織管理和角色權限</li>
                      <li>• RESTful API 和 Webhook</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AI 內容生成 */}
          {activeMode === 'ai-content' && (
            <div>
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">🤖 AI 內容生成器</h2>
                    <p className="text-gray-600 mt-1">使用 AI 自動生成高質量教育內容</p>
                  </div>
                  <button
                    onClick={() => setShowAIGenerator(true)}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-medium"
                  >
                    🚀 啟動 AI 生成器
                  </button>
                </div>

                {/* AI 功能特點 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-purple-800 mb-2">🧠 多模型支持</h4>
                    <p className="text-sm text-purple-700">GPT-4、Claude-3、Gemini Pro</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">📝 內容類型</h4>
                    <p className="text-sm text-blue-700">問題、答案、提示、解釋</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">🎯 智能配置</h4>
                    <p className="text-sm text-green-700">難度、主題、學習目標</p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-orange-800 mb-2">💰 成本控制</h4>
                    <p className="text-sm text-orange-700">實時成本計算和優化</p>
                  </div>
                </div>

                {/* 遊戲類型選擇 */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">選擇遊戲類型</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    {(['quiz', 'matching', 'flashcards', 'spin-wheel', 'whack-a-mole', 'memory-cards'] as GameType[]).map((type) => (
                      <button
                        key={type}
                        onClick={() => setSelectedGameType(type)}
                        className={`p-3 rounded-lg border-2 transition-colors ${
                          selectedGameType === type
                            ? 'border-purple-500 bg-purple-50 text-purple-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-2xl mb-1">
                          {type === 'quiz' ? '❓' : 
                           type === 'matching' ? '🔗' :
                           type === 'flashcards' ? '📚' :
                           type === 'spin-wheel' ? '🎡' :
                           type === 'whack-a-mole' ? '🔨' : '🃏'}
                        </div>
                        <div className="text-xs font-medium capitalize">{type}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 示例生成結果 */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">💡 AI 生成示例</h4>
                  <div className="bg-white p-4 rounded border">
                    <div className="text-sm text-gray-600 mb-2">為 {selectedGameType} 遊戲生成的內容：</div>
                    <div className="font-mono text-sm bg-gray-100 p-3 rounded">
                      {selectedGameType === 'quiz' ? 
                        '{"question": "什麼是光合作用？", "options": ["植物製造食物的過程", "動物呼吸的過程", "水的循環過程", "土壤形成的過程"], "correctAnswer": 0}' :
                        selectedGameType === 'matching' ?
                        '{"left": "太陽", "right": "恆星", "category": "天文學"}' :
                        '{"front": "Photosynthesis", "back": "光合作用", "hint": "植物利用陽光製造食物"}'
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 智能推薦 */}
          {activeMode === 'smart-recommendations' && (
            <div>
              <SmartRecommendations
                userId={userId}
                context="dashboard"
                onActivitySelect={handleActivitySelect}
                showExplanations={true}
                maxItems={12}
              />
            </div>
          )}

          {/* 自動評分 */}
          {activeMode === 'auto-grading' && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">📊 AI 自動評分系統</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-800 mb-3">🎯 支持題型</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <span className="text-blue-500 mr-2">✓</span>
                      <span>選擇題 - 精確匹配評分</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-blue-500 mr-2">✓</span>
                      <span>簡答題 - AI 語義分析</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-blue-500 mr-2">✓</span>
                      <span>作文題 - 綜合評估</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-blue-500 mr-2">✓</span>
                      <span>配對題 - 部分分數</span>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-800 mb-3">🧠 AI 分析能力</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>語義相似度分析</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>關鍵詞匹配評分</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>學習行為分析</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>個性化反饋生成</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 評分示例 */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-4">📝 評分示例</h4>
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">問題：什麼是光合作用？</span>
                      <span className="text-green-600 font-bold">85/100</span>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      學生答案：植物利用陽光和二氧化碳製造氧氣和葡萄糖
                    </div>
                    <div className="text-sm">
                      <span className="text-blue-600">AI 反饋：</span>
                      <span className="text-gray-700">答案基本正確，涵蓋了光合作用的主要要素。建議補充水的作用。</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 實時協作 */}
          {activeMode === 'collaboration' && (
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">🤝 實時協作編輯器</h2>
                <p className="text-gray-600">多用戶實時協作編輯，支持評論、版本控制和衝突解決</p>
              </div>
              
              <div className="h-96">
                <CollaborativeEditor
                  activityId="demo-activity"
                  userId={userId}
                  username={username}
                  initialContent={{
                    title: "協作編輯示例",
                    description: "這是一個實時協作編輯的示例。多個用戶可以同時編輯此內容。"
                  }}
                  onContentChange={(content) => console.log('內容變更:', content)}
                  onSessionChange={(session) => console.log('會話變更:', session)}
                />
              </div>
            </div>
          )}

          {/* 高級分析 */}
          {activeMode === 'analytics' && (
            <div>
              <AnalyticsDashboard
                userId={userId}
                reportType="individual"
                timeRange={{
                  start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                  end: new Date()
                }}
              />
            </div>
          )}

          {/* 企業功能 */}
          {activeMode === 'enterprise' && (
            <div>
              <OrganizationDashboard
                organizationId="demo-org-123"
                currentUserId={userId}
              />
            </div>
          )}
        </div>

        {/* AI 內容生成器對話框 */}
        {showAIGenerator && (
          <AIContentGenerator
            gameType={selectedGameType}
            onContentGenerated={handleAIContentGenerated}
            onClose={() => setShowAIGenerator(false)}
          />
        )}
      </div>
    </>
  );
}
