/**
 * 簡化的智能搜索測試頁面
 * 只測試智能搜索組件的核心功能，不依賴複雜的頁面結構
 */

'use client';

import React, { useState, useEffect } from 'react';
import { IntelligentActivitySearch } from '@/components/activities/IntelligentActivitySearch';

// 模擬活動數據
const mockActivities = [
  {
    id: '1',
    title: '數學加法遊戲',
    description: '練習基本的數學加法運算',
    type: 'math',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
    size: 1024,
    isShared: false,
    geptLevel: 'elementary' as const,
    learningEffectiveness: 85,
    usageCount: 25,
    tags: ['數學', '加法', '基礎'],
    status: 'published' as const,
    templateType: 'quiz',
    learningState: 'completed' as const,
    difficulty: 2 as const,
    subject: '數學',
    author: '教師A',
    content: '這是一個幫助學生練習加法的互動遊戲'
  },
  {
    id: '2',
    title: '英語單詞記憶',
    description: '記憶常用英語單詞',
    type: 'english',
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-16'),
    size: 2048,
    isShared: true,
    geptLevel: 'intermediate' as const,
    learningEffectiveness: 92,
    usageCount: 45,
    tags: ['英語', '單詞', '記憶'],
    status: 'published' as const,
    templateType: 'flashcard',
    learningState: 'in-progress' as const,
    difficulty: 3 as const,
    subject: '英語',
    author: '教師B',
    content: '通過閃卡方式學習英語單詞'
  },
  {
    id: '3',
    title: '科學實驗模擬',
    description: '虛擬科學實驗體驗',
    type: 'science',
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-17'),
    size: 4096,
    isShared: false,
    geptLevel: 'high-intermediate' as const,
    learningEffectiveness: 78,
    usageCount: 15,
    tags: ['科學', '實驗', '模擬'],
    status: 'published' as const,
    templateType: 'simulation',
    learningState: 'not-started' as const,
    difficulty: 4 as const,
    subject: '科學',
    author: '教師C',
    content: '通過虛擬實驗學習科學原理'
  },
  {
    id: '4',
    title: '歷史時間軸',
    description: '學習重要歷史事件',
    type: 'history',
    createdAt: new Date('2024-01-04'),
    updatedAt: new Date('2024-01-18'),
    size: 1536,
    isShared: true,
    geptLevel: 'intermediate' as const,
    learningEffectiveness: 88,
    usageCount: 35,
    tags: ['歷史', '時間軸', '事件'],
    status: 'published' as const,
    templateType: 'timeline',
    learningState: 'mastered' as const,
    difficulty: 3 as const,
    subject: '歷史',
    author: '教師D',
    content: '通過時間軸了解歷史發展'
  },
  {
    id: '5',
    title: '地理拼圖遊戲',
    description: '認識世界各國地理位置',
    type: 'geography',
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-19'),
    size: 3072,
    isShared: false,
    geptLevel: 'elementary' as const,
    learningEffectiveness: 90,
    usageCount: 55,
    tags: ['地理', '拼圖', '世界'],
    status: 'published' as const,
    templateType: 'puzzle',
    learningState: 'in-progress' as const,
    difficulty: 2 as const,
    subject: '地理',
    author: '教師E',
    content: '通過拼圖遊戲學習世界地理'
  }
];

export default function TestIntelligentSearchPage() {
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSearchResults = (results: any[]) => {
    setSearchResults(results);
    console.log('搜索結果:', results);
  };

  const handleSearchConfigChange = (config: any) => {
    console.log('搜索配置更新:', config);
  };

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">載入中...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* 頁面標題 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">智能搜索系統測試</h1>
          <p className="text-gray-600">
            測試全文搜索、模糊匹配、語義搜索、語音搜索功能
          </p>
        </div>

        {/* 搜索功能展示 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <div className="text-2xl mr-3">🔍</div>
              <div>
                <div className="text-sm font-medium text-gray-900">全文搜索</div>
                <div className="text-xs text-gray-500">精確匹配內容</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <div className="text-2xl mr-3">🎯</div>
              <div>
                <div className="text-sm font-medium text-gray-900">模糊匹配</div>
                <div className="text-xs text-gray-500">相似度搜索</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <div className="text-2xl mr-3">🧠</div>
              <div>
                <div className="text-sm font-medium text-gray-900">語義搜索</div>
                <div className="text-xs text-gray-500">智能理解意圖</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <div className="text-2xl mr-3">🎤</div>
              <div>
                <div className="text-sm font-medium text-gray-900">語音搜索</div>
                <div className="text-xs text-gray-500">語音輸入識別</div>
              </div>
            </div>
          </div>
        </div>

        {/* 智能搜索組件 */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">智能搜索組件</h2>
          
          <IntelligentActivitySearch
            activities={mockActivities}
            onSearchResults={handleSearchResults}
            onSearchConfigChange={handleSearchConfigChange}
            placeholder="搜索活動... (支持全文搜索、模糊匹配、語義搜索)"
            showAdvancedOptions={true}
            enableRealTimeSearch={true}
            searchDelay={300}
            className="w-full"
          />
        </div>

        {/* 搜索結果顯示 */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            搜索結果 ({searchResults.length})
          </h2>
          
          {searchResults.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">🔍</div>
              <p>請輸入搜索關鍵詞以查看結果</p>
            </div>
          ) : (
            <div className="space-y-4">
              {searchResults.map((result, index) => (
                <div key={result.activity.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{result.activity.title}</h3>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded ${
                        result.matchType === 'exact' ? 'bg-green-100 text-green-800' :
                        result.matchType === 'fuzzy' ? 'bg-yellow-100 text-yellow-800' :
                        result.matchType === 'semantic' ? 'bg-blue-100 text-blue-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {result.matchType === 'exact' && '精確匹配'}
                        {result.matchType === 'fuzzy' && '模糊匹配'}
                        {result.matchType === 'semantic' && '語義搜索'}
                        {result.matchType === 'voice' && '語音搜索'}
                      </span>
                      <span className="text-sm text-gray-500">
                        得分: {result.score.toFixed(1)}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-2">{result.activity.description}</p>
                  
                  <div className="flex flex-wrap gap-1 mb-2">
                    {result.activity.tags.map((tag: string) => (
                      <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    <p>相關性: {result.relevanceReason}</p>
                    {result.highlights.length > 0 && (
                      <p>匹配項: {result.highlights.join(', ')}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 測試說明 */}
        <div className="mt-8 bg-blue-50 rounded-lg border border-blue-200 p-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-3">測試說明</h2>
          <div className="text-sm text-blue-800 space-y-2">
            <p><strong>全文搜索測試：</strong>輸入 "數學"、"英語"、"遊戲" 等關鍵詞</p>
            <p><strong>模糊匹配測試：</strong>輸入 "数学"（簡體字）、"英语" 等相似詞彙</p>
            <p><strong>語義搜索測試：</strong>輸入 "學習"、"教育"、"知識" 等相關概念</p>
            <p><strong>語音搜索測試：</strong>點擊麥克風圖標進行語音輸入（需要瀏覽器支持）</p>
            <p><strong>高級選項：</strong>調整搜索閾值和結果數量</p>
          </div>
        </div>
      </div>
    </div>
  );
}
