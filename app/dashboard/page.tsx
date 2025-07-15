/**
 * EduCreate 主儀表板
 * 整合所有已實現功能的統一入口
 */

'use client';

import React from 'react';
import Link from 'next/link';
import UnifiedNavigation from '@/components/navigation/UnifiedNavigation';

interface FeatureCard {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: string;
  status: 'available' | 'coming-soon' | 'in-development';
  category: 'file-management' | 'games' | 'analytics' | 'content';
}

const features: FeatureCard[] = [
  // 檔案管理功能
  {
    id: 'smart-sorting',
    title: '智能排序系統',
    description: '多維度智能排序，支援16種排序維度和AI推薦',
    href: '/demo/smart-sorting',
    icon: '🔄',
    status: 'available',
    category: 'file-management'
  },
  {
    id: 'folder-analytics',
    title: '檔案夾統計分析',
    description: '完整的檔案夾統計數據和學習效果分析',
    href: '/demo/folder-analytics',
    icon: '📊',
    status: 'available',
    category: 'analytics'
  },
  
  // 遊戲系統功能
  {
    id: 'match-game',
    title: '配對遊戲',
    description: '基於記憶科學的智能配對遊戲，支援GEPT分級',
    href: '/games/match',
    icon: '🎯',
    status: 'in-development',
    category: 'games'
  },
  {
    id: 'quiz-game',
    title: '選擇題遊戲',
    description: '自適應難度的選擇題遊戲，即時反饋和統計分析',
    href: '/games/quiz',
    icon: '❓',
    status: 'in-development',
    category: 'games'
  },
  {
    id: 'flashcard-game',
    title: '記憶卡片',
    description: '智能間隔重複演算法的記憶卡片系統',
    href: '/games/flashcard',
    icon: '🃏',
    status: 'in-development',
    category: 'games'
  },
  
  // 內容管理功能
  {
    id: 'rich-text-editor',
    title: '富文本編輯器',
    description: '完整的富文本編輯功能，支持格式化、表格、列表和無障礙設計',
    href: '/content/rich-text-editor',
    icon: '✏️',
    status: 'available',
    category: 'content'
  },
  {
    id: 'multimedia-system',
    title: '多媒體支持系統',
    description: '完整的多媒體上傳、管理和預覽功能，支持圖片、音頻、視頻和動畫',
    href: '/content/multimedia',
    icon: '🎬',
    status: 'available',
    category: 'content'
  },
  {
    id: 'voice-recording-system',
    title: '語音錄製系統',
    description: '完整的語音錄製、播放、語音識別和語音合成功能，支持多種音頻格式',
    href: '/content/voice-recording',
    icon: '🎤',
    status: 'available',
    category: 'content'
  },
  {
    id: 'gept-templates-system',
    title: 'GEPT分級系統',
    description: '完整的GEPT分級模板管理、內容驗證和詞彙瀏覽功能，支持三個級別',
    href: '/content/gept-templates',
    icon: '📚',
    status: 'available',
    category: 'content'
  },
  {
    id: 'realtime-collaboration-system',
    title: '實時協作系統',
    description: '多用戶同時編輯、版本歷史、變更追蹤和衝突解決，實時協作延遲 <100ms',
    href: '/content/realtime-collaboration',
    icon: '👥',
    status: 'available',
    category: 'content'
  },
  {
    id: 'ai-content-generation-system',
    title: 'AI內容生成系統',
    description: '基於記憶科學原理的AI內容生成，支持多語言翻譯和個性化學習建議',
    href: '/content/ai-content-generation',
    icon: '🤖',
    status: 'available',
    category: 'content'
  },
  {
    id: 'match-game',
    title: 'Match配對遊戲',
    description: '基於記憶科學原理的配對遊戲，支持多種模式和智能適配，挑戰記憶力',
    href: '/games/match',
    icon: '🎯',
    status: 'available',
    category: 'games'
  },
  {
    id: 'auto-save',
    title: '自動保存系統',
    description: '2秒間隔自動保存，支援離線和衝突解決',
    href: '/content/autosave',
    icon: '💾',
    status: 'available',
    category: 'content'
  },
  
  // 檔案管理功能
  {
    id: 'file-manager',
    title: '檔案管理器',
    description: '完整的檔案空間管理，支援嵌套檔案夾和權限控制',
    href: '/tools/files',
    icon: '📁',
    status: 'available',
    category: 'file-management'
  },
  {
    id: 'folder-collaboration',
    title: '檔案夾協作',
    description: '三層分享模式的檔案夾協作權限系統，支援公開、班級、私人分享',
    href: '/collaboration/folders',
    icon: '🤝',
    status: 'available',
    category: 'file-management'
  },
  {
    id: 'folder-templates',
    title: '檔案夾模板系統',
    description: '預設模板快速創建檔案夾結構，支援語言學習、數學、科學等分類',
    href: '/tools/folder-templates',
    icon: '📁',
    status: 'available',
    category: 'file-management'
  },
  {
    id: 'folder-import-export',
    title: '檔案夾導入導出',
    description: '支援 Wordwall 格式的檔案夾和活動導入導出功能，輕鬆遷移和分享',
    href: '/tools/folder-import-export',
    icon: '🔄',
    status: 'available',
    category: 'file-management'
  },
  {
    id: 'real-time-sync',
    title: '實時同步和衝突解決',
    description: '支援多用戶同時操作的實時同步系統，智能衝突檢測和解決機制',
    href: '/tools/real-time-sync',
    icon: '⚡',
    status: 'available',
    category: 'file-management'
  }
];

const categoryNames = {
  'file-management': '檔案管理',
  'games': '記憶遊戲',
  'analytics': '數據分析',
  'content': '內容創建'
};

const statusColors = {
  'available': 'bg-green-100 text-green-800 border-green-200',
  'in-development': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'coming-soon': 'bg-gray-100 text-gray-800 border-gray-200'
};

const statusLabels = {
  'available': '可用',
  'in-development': '開發中',
  'coming-soon': '即將推出'
};

export default function Dashboard() {
  const groupedFeatures = features.reduce((groups, feature) => {
    const category = feature.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(feature);
    return groups;
  }, {} as Record<string, FeatureCard[]>);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 統一導航系統 */}
      <UnifiedNavigation variant="header" />

      {/* 頁面標題 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4" data-testid="dashboard-title">
              EduCreate 功能儀表板
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto" data-testid="dashboard-description">
              記憶科學驅動的智能教育遊戲平台 - 探索所有可用功能
            </p>
          </div>
        </div>
      </div>

      {/* 功能統計 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border" data-testid="stats-total">
            <div className="text-3xl font-bold text-blue-600">{features.length}</div>
            <div className="text-sm text-gray-600">總功能數</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border" data-testid="stats-available">
            <div className="text-3xl font-bold text-green-600">
              {features.filter(f => f.status === 'available').length}
            </div>
            <div className="text-sm text-gray-600">可用功能</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border" data-testid="stats-development">
            <div className="text-3xl font-bold text-yellow-600">
              {features.filter(f => f.status === 'in-development').length}
            </div>
            <div className="text-sm text-gray-600">開發中</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border" data-testid="stats-coming-soon">
            <div className="text-3xl font-bold text-gray-600">
              {features.filter(f => f.status === 'coming-soon').length}
            </div>
            <div className="text-sm text-gray-600">即將推出</div>
          </div>
        </div>

        {/* 功能分類展示 */}
        {Object.entries(groupedFeatures).map(([category, categoryFeatures]) => (
          <div key={category} className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6" data-testid={`category-${category}`}>
              {categoryNames[category as keyof typeof categoryNames]} ({categoryFeatures.length})
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoryFeatures.map((feature) => (
                <div
                  key={feature.id}
                  className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
                  data-testid={`feature-card-${feature.id}`}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="text-3xl">{feature.icon}</div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${statusColors[feature.status]}`}>
                        {statusLabels[feature.status]}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-4">
                      {feature.description}
                    </p>
                    
                    <div className="flex justify-end">
                      {feature.status === 'available' ? (
                        <Link
                          href={feature.href}
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                          data-testid={`feature-link-${feature.id}`}
                        >
                          立即使用
                          <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      ) : (
                        <button
                          disabled
                          className="inline-flex items-center px-4 py-2 bg-gray-300 text-gray-500 text-sm font-medium rounded-md cursor-not-allowed"
                          data-testid={`feature-disabled-${feature.id}`}
                        >
                          {feature.status === 'in-development' ? '開發中' : '即將推出'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* 快速訪問區域 */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mt-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4" data-testid="quick-access-title">
            快速訪問
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {features.filter(f => f.status === 'available').map((feature) => (
              <Link
                key={feature.id}
                href={feature.href}
                className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                data-testid={`quick-access-${feature.id}`}
              >
                <span className="text-2xl mr-3">{feature.icon}</span>
                <span className="text-sm font-medium text-gray-700">{feature.title}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* 返回主頁 */}
        <div className="text-center mt-8">
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-gray-600 text-white font-medium rounded-md hover:bg-gray-700 transition-colors"
            data-testid="back-to-home"
          >
            <svg className="mr-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            返回主頁
          </Link>
        </div>
      </div>
    </div>
  );
}
