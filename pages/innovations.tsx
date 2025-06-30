import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

interface Innovation {
  id: string;
  title: string;
  description: string;
  icon: string;
  status: 'available' | 'beta' | 'coming-soon';
  category: string;
  features: string[];
  benefits: string[];
  demoUrl?: string;
}

export default function InnovationsPage() {
  const [selectedInnovation, setSelectedInnovation] = useState<Innovation | null>(null);

  const innovations: Innovation[] = [
    {
      id: 'ai-video',
      title: 'AI 視頻生成',
      description: '自動生成教學視頻，將靜態內容轉換為動態視覺體驗',
      icon: '🎬',
      status: 'beta',
      category: 'AI 增強',
      features: [
        '自動腳本生成',
        '語音合成',
        '動畫效果',
        '多語言支持',
        '自定義風格'
      ],
      benefits: [
        '提升學習參與度',
        '支持視覺學習者',
        '節省製作時間',
        '一致的教學品質'
      ],
      demoUrl: '/demo/ai-video'
    },
    {
      id: 'real-time-collaboration',
      title: '實時協作',
      description: '多人同時編輯和遊玩，支持遠程教學和團隊合作',
      icon: '👥',
      status: 'available',
      category: '協作工具',
      features: [
        '多人同時編輯',
        '實時同步',
        '語音聊天',
        '屏幕分享',
        '權限管理'
      ],
      benefits: [
        '促進團隊合作',
        '支持遠程教學',
        '即時反饋',
        '提高效率'
      ],
      demoUrl: '/demo/collaboration'
    },
    {
      id: 'advanced-analytics',
      title: '高級分析',
      description: '深度學習分析，提供個性化學習建議和詳細報告',
      icon: '📊',
      status: 'available',
      category: '數據分析',
      features: [
        '學習路徑分析',
        '個性化建議',
        '進度追蹤',
        '弱點識別',
        '預測模型'
      ],
      benefits: [
        '個性化學習',
        '提高學習效果',
        '數據驅動決策',
        '早期干預'
      ],
      demoUrl: '/demo/analytics'
    },
    {
      id: 'ar-integration',
      title: 'AR 擴增實境',
      description: '將虛擬內容疊加到現實世界，創造沉浸式學習體驗',
      icon: '🥽',
      status: 'coming-soon',
      category: '沉浸技術',
      features: [
        '3D 模型展示',
        '空間定位',
        '手勢識別',
        '多設備支持',
        '雲端渲染'
      ],
      benefits: [
        '沉浸式體驗',
        '提高記憶力',
        '空間學習',
        '創新教學'
      ]
    },
    {
      id: 'voice-interaction',
      title: '語音交互',
      description: '支持語音命令和語音回答，提供無障礙學習體驗',
      icon: '🎤',
      status: 'beta',
      category: '無障礙',
      features: [
        '語音識別',
        '語音合成',
        '多語言支持',
        '口音適應',
        '噪音過濾'
      ],
      benefits: [
        '無障礙學習',
        '提高參與度',
        '語言練習',
        '解放雙手'
      ],
      demoUrl: '/demo/voice'
    },
    {
      id: 'adaptive-learning',
      title: '自適應學習',
      description: 'AI 驅動的個性化學習路徑，根據學習者表現動態調整',
      icon: '🧠',
      status: 'available',
      category: 'AI 增強',
      features: [
        '智能難度調節',
        '學習風格識別',
        '內容推薦',
        '進度預測',
        '個性化反饋'
      ],
      benefits: [
        '最佳學習效果',
        '減少挫折感',
        '提高完成率',
        '個性化體驗'
      ],
      demoUrl: '/demo/adaptive'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">✅ 可用</span>;
      case 'beta':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">🧪 測試版</span>;
      case 'coming-soon':
        return <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full">🚀 即將推出</span>;
      default:
        return null;
    }
  };

  const categories = [...new Set(innovations.map(item => item.category))];

  return (
    <>
      <Head>
        <title>創新功能 - EduCreate</title>
        <meta name="description" content="探索 EduCreate 的創新功能，包括 AI 視頻生成、實時協作、高級分析等" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
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
                <Link href="/new-templates" className="text-gray-600 hover:text-gray-900">
                  新模板
                </Link>
                <Link href="/innovations" className="text-purple-600 font-semibold">
                  創新功能
                </Link>
                <Link href="/unified-content-manager.html" className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
                  開始創建
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              🚀 創新功能
            </h1>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-8">
              EduCreate 不僅僅是一個遊戲創建平台，我們正在重新定義教育技術的未來。
              探索我們獨有的創新功能，為您的教學帶來前所未有的體驗。
            </p>
            
            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="text-3xl font-bold text-purple-600 mb-2">6+</div>
                <div className="text-gray-600">創新功能</div>
              </div>
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="text-3xl font-bold text-green-600 mb-2">3</div>
                <div className="text-gray-600">已上線功能</div>
              </div>
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="text-3xl font-bold text-yellow-600 mb-2">2</div>
                <div className="text-gray-600">測試版功能</div>
              </div>
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="text-3xl font-bold text-blue-600 mb-2">AI</div>
                <div className="text-gray-600">驅動技術</div>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="mb-8">
            <div className="flex flex-wrap justify-center gap-3">
              {categories.map(category => (
                <span
                  key={category}
                  className="px-4 py-2 bg-white rounded-full shadow-md text-gray-700 font-medium"
                >
                  {category}
                </span>
              ))}
            </div>
          </div>

          {/* Innovations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {innovations.map((innovation) => (
              <div
                key={innovation.id}
                className={`bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105 ${
                  selectedInnovation?.id === innovation.id ? 'ring-2 ring-purple-500' : ''
                }`}
                onClick={() => setSelectedInnovation(innovation)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="text-4xl">{innovation.icon}</div>
                  {getStatusBadge(innovation.status)}
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {innovation.title}
                </h3>

                <p className="text-gray-600 text-sm mb-4">
                  {innovation.description}
                </p>

                <div className="mb-4">
                  <span className="inline-block px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                    {innovation.category}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-900">主要特色:</div>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {innovation.features.slice(0, 3).map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <span className="text-green-500">•</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {innovation.demoUrl && innovation.status !== 'coming-soon' && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(innovation.demoUrl, '_blank');
                      }}
                      className="w-full py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                    >
                      🎮 體驗演示
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Selected Innovation Details */}
          {selectedInnovation && (
            <div className="bg-white rounded-xl shadow-2xl p-8 mb-16">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="text-6xl">{selectedInnovation.icon}</div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">{selectedInnovation.title}</h2>
                    <p className="text-gray-600 text-lg">{selectedInnovation.description}</p>
                  </div>
                </div>
                {getStatusBadge(selectedInnovation.status)}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">🔧 功能特色</h3>
                  <ul className="space-y-3">
                    {selectedInnovation.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-3">
                        <span className="text-purple-500">✨</span>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">💡 教學優勢</h3>
                  <ul className="space-y-3">
                    {selectedInnovation.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-center space-x-3">
                        <span className="text-green-500">🎯</span>
                        <span className="text-gray-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {selectedInnovation.demoUrl && selectedInnovation.status !== 'coming-soon' && (
                <div className="mt-8 text-center">
                  <button
                    onClick={() => window.open(selectedInnovation.demoUrl, '_blank')}
                    className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-semibold text-lg"
                  >
                    🚀 立即體驗
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Call to Action */}
          <div className="text-center">
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-xl p-8 text-white">
              <h2 className="text-3xl font-bold mb-4">準備體驗未來的教育？</h2>
              <p className="text-purple-100 mb-6 text-lg">
                加入 EduCreate，成為教育創新的先驅者
              </p>
              <div className="flex justify-center space-x-4">
                <Link href="/unified-content-manager.html" className="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                  開始創建
                </Link>
                <Link href="/games-showcase" className="border border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-purple-600 transition-colors">
                  探索模板
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
