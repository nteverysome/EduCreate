/**
 * 最簡化的智能搜索測試頁面
 * 只包含核心搜索功能，不依賴任何複雜組件
 */

'use client';

import React, { useState, useCallback } from 'react';

// 簡化的活動數據類型
interface SimpleActivity {
  id: string;
  title: string;
  description: string;
  tags: string[];
  type: string;
  geptLevel: string;
}

// 簡化的搜索結果類型
interface SimpleSearchResult {
  activity: SimpleActivity;
  score: number;
  matchType: string;
  highlights: string[];
}

// 模擬活動數據
const mockActivities: SimpleActivity[] = [
  {
    id: '1',
    title: '數學加法遊戲',
    description: '練習基本的數學加法運算',
    tags: ['數學', '加法', '基礎'],
    type: 'math',
    geptLevel: 'elementary'
  },
  {
    id: '2',
    title: '英語單詞記憶',
    description: '記憶常用英語單詞',
    tags: ['英語', '單詞', '記憶'],
    type: 'english',
    geptLevel: 'intermediate'
  },
  {
    id: '3',
    title: '科學實驗模擬',
    description: '虛擬科學實驗體驗',
    tags: ['科學', '實驗', '模擬'],
    type: 'science',
    geptLevel: 'high-intermediate'
  },
  {
    id: '4',
    title: '歷史時間軸',
    description: '學習重要歷史事件',
    tags: ['歷史', '時間軸', '事件'],
    type: 'history',
    geptLevel: 'intermediate'
  },
  {
    id: '5',
    title: '地理拼圖遊戲',
    description: '認識世界各國地理位置',
    tags: ['地理', '拼圖', '世界'],
    type: 'geography',
    geptLevel: 'elementary'
  }
];

export default function SimpleSearchTestPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SimpleSearchResult[]>([]);
  const [searchStats, setSearchStats] = useState({
    totalResults: 0,
    searchTime: 0
  });

  // 簡化的搜索函數
  const performSearch = useCallback((query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setSearchStats({ totalResults: 0, searchTime: 0 });
      return;
    }

    const startTime = Date.now();
    const results: SimpleSearchResult[] = [];
    const queryLower = query.toLowerCase();

    mockActivities.forEach(activity => {
      let score = 0;
      const highlights: string[] = [];

      // 標題匹配
      if (activity.title.toLowerCase().includes(queryLower)) {
        score += 10;
        highlights.push('標題匹配');
      }

      // 描述匹配
      if (activity.description.toLowerCase().includes(queryLower)) {
        score += 5;
        highlights.push('描述匹配');
      }

      // 標籤匹配
      activity.tags.forEach(tag => {
        if (tag.toLowerCase().includes(queryLower)) {
          score += 8;
          highlights.push(`標籤: ${tag}`);
        }
      });

      // 類型匹配
      if (activity.type.toLowerCase().includes(queryLower)) {
        score += 6;
        highlights.push('類型匹配');
      }

      if (score > 0) {
        results.push({
          activity,
          score,
          matchType: 'exact',
          highlights
        });
      }
    });

    const sortedResults = results.sort((a, b) => b.score - a.score);
    const searchTime = Date.now() - startTime;

    setSearchResults(sortedResults);
    setSearchStats({
      totalResults: sortedResults.length,
      searchTime
    });
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    performSearch(value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchQuery);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSearchStats({ totalResults: 0, searchTime: 0 });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* 頁面標題 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">智能搜索系統測試</h1>
          <p className="text-gray-600">
            簡化版智能搜索功能測試 - 支持標題、描述、標籤、類型搜索
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
                <div className="text-sm font-medium text-gray-900">標籤搜索</div>
                <div className="text-xs text-gray-500">按標籤分類</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <div className="text-2xl mr-3">📚</div>
              <div>
                <div className="text-sm font-medium text-gray-900">類型搜索</div>
                <div className="text-xs text-gray-500">按活動類型</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <div className="text-2xl mr-3">⚡</div>
              <div>
                <div className="text-sm font-medium text-gray-900">實時搜索</div>
                <div className="text-xs text-gray-500">即時結果更新</div>
              </div>
            </div>
          </div>
        </div>

        {/* 搜索輸入區域 */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">智能搜索</h2>
          
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="搜索活動... (試試輸入：數學、英語、遊戲、學習)"
                className="w-full px-4 py-3 pl-12 pr-12 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                data-testid="search-input"
              />
              
              {/* 搜索圖標 */}
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                <span className="text-gray-400">🔍</span>
              </div>

              {/* 清除按鈕 */}
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  data-testid="clear-search-button"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              data-testid="search-submit-button"
            >
              搜索
            </button>
          </form>

          {/* 搜索統計 */}
          {searchStats.totalResults > 0 && (
            <div className="mt-4 text-sm text-gray-600" data-testid="search-stats">
              找到 {searchStats.totalResults} 個結果 ({searchStats.searchTime}ms)
            </div>
          )}
        </div>

        {/* 搜索結果顯示 */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            搜索結果 ({searchResults.length})
          </h2>
          
          {searchResults.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-4">🔍</div>
              <p className="text-lg mb-2">
                {searchQuery ? '沒有找到匹配的結果' : '請輸入搜索關鍵詞'}
              </p>
              <p className="text-sm">
                試試搜索：數學、英語、科學、歷史、地理
              </p>
            </div>
          ) : (
            <div className="space-y-4" data-testid="search-results">
              {searchResults.map((result, index) => (
                <div key={result.activity.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{result.activity.title}</h3>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                        精確匹配
                      </span>
                      <span className="text-sm text-gray-500">
                        得分: {result.score}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-3">{result.activity.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {result.activity.tags.map((tag: string) => (
                        <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      類型: {result.activity.type} | 等級: {result.activity.geptLevel}
                    </div>
                  </div>
                  
                  {result.highlights.length > 0 && (
                    <div className="mt-2 text-xs text-blue-600">
                      匹配項: {result.highlights.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 測試說明 */}
        <div className="mt-8 bg-blue-50 rounded-lg border border-blue-200 p-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-3">測試說明</h2>
          <div className="text-sm text-blue-800 space-y-2">
            <p><strong>基本搜索：</strong>輸入 "數學"、"英語"、"科學" 等關鍵詞</p>
            <p><strong>標籤搜索：</strong>輸入 "加法"、"單詞"、"實驗" 等標籤</p>
            <p><strong>類型搜索：</strong>輸入 "math"、"english"、"science" 等類型</p>
            <p><strong>實時搜索：</strong>輸入時自動更新結果</p>
            <p><strong>清除搜索：</strong>點擊 ✕ 按鈕清除搜索內容</p>
          </div>
        </div>
      </div>
    </div>
  );
}
