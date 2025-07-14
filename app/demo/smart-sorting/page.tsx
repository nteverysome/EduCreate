/**
 * 智能排序系統演示頁面
 * 展示多維度智能排序功能
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import SmartSortingPanel from '@/components/sorting/SmartSortingPanel';
import { 
  SortableItem, 
  SortConfig, 
  SmartSortingOptions,
  smartSortingManager 
} from '@/lib/sorting/SmartSortingManager';

// 模擬數據
const generateMockData = (): SortableItem[] => {
  const items: SortableItem[] = [];
  
  // 檔案夾數據
  const folders = [
    { name: '英語學習', type: 'folder' as const, geptLevel: 'elementary' as const },
    { name: 'GEPT初級', type: 'folder' as const, geptLevel: 'elementary' as const },
    { name: 'GEPT中級', type: 'folder' as const, geptLevel: 'intermediate' as const },
    { name: '單字練習', type: 'folder' as const, geptLevel: 'elementary' as const },
    { name: '文法練習', type: 'folder' as const, geptLevel: 'intermediate' as const },
    { name: '聽力訓練', type: 'folder' as const, geptLevel: 'high-intermediate' as const }
  ];

  // 活動數據
  const activities = [
    { name: '基礎單字配對', type: 'activity' as const, geptLevel: 'elementary' as const },
    { name: '動物名稱記憶卡', type: 'activity' as const, geptLevel: 'elementary' as const },
    { name: '日常對話填空', type: 'activity' as const, geptLevel: 'intermediate' as const },
    { name: '時態選擇題', type: 'activity' as const, geptLevel: 'intermediate' as const },
    { name: '商務英語排序', type: 'activity' as const, geptLevel: 'high-intermediate' as const },
    { name: '學術詞彙測驗', type: 'activity' as const, geptLevel: 'high-intermediate' as const },
    { name: '旅遊英語對話', type: 'activity' as const, geptLevel: 'intermediate' as const },
    { name: '科技詞彙學習', type: 'activity' as const, geptLevel: 'high-intermediate' as const }
  ];

  const allItems = [...folders, ...activities];

  allItems.forEach((item, index) => {
    const now = new Date();
    const daysAgo = Math.floor(Math.random() * 30);
    const hoursAgo = Math.floor(Math.random() * 24);
    
    items.push({
      id: `item_${index}`,
      name: item.name,
      type: item.type,
      geptLevel: item.geptLevel,
      createdAt: new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - hoursAgo * 60 * 60 * 1000),
      lastAccessedAt: Math.random() > 0.3 ? new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000) : undefined,
      size: Math.floor(Math.random() * 10000) + 1000,
      fileType: item.type === 'activity' ? 'activity' : 'folder',
      tags: ['英語', '學習', item.geptLevel].filter(Boolean),
      accessCount: Math.floor(Math.random() * 100),
      recentAccessCount: Math.floor(Math.random() * 20),
      averageSessionTime: Math.floor(Math.random() * 60) + 5,
      learningScore: item.type === 'activity' ? Math.floor(Math.random() * 100) : undefined,
      completionRate: item.type === 'activity' ? Math.random() : undefined,
      retentionRate: item.type === 'activity' ? Math.random() : undefined,
      difficultyLevel: item.geptLevel === 'elementary' ? Math.floor(Math.random() * 3) + 1 :
                      item.geptLevel === 'intermediate' ? Math.floor(Math.random() * 3) + 4 :
                      Math.floor(Math.random() * 4) + 7,
      shareCount: Math.floor(Math.random() * 10),
      collaboratorCount: Math.floor(Math.random() * 5),
      metadata: {
        wordCount: item.type === 'activity' ? Math.floor(Math.random() * 500) + 50 : undefined,
        imageCount: Math.floor(Math.random() * 10),
        audioCount: Math.floor(Math.random() * 5),
        videoCount: Math.floor(Math.random() * 3),
        questionCount: item.type === 'activity' ? Math.floor(Math.random() * 20) + 5 : undefined
      }
    });
  });

  return items;
};

export default function SmartSortingDemo() {
  const [items, setItems] = useState<SortableItem[]>([]);
  const [sortedItems, setSortedItems] = useState<SortableItem[]>([]);
  const [currentSort, setCurrentSort] = useState<SortConfig>();
  const [sortingOptions, setSortingOptions] = useState<SmartSortingOptions>({
    contextualFactors: {
      sessionContext: 'browse',
      currentTime: new Date()
    }
  });
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [sortingAnalysis, setSortingAnalysis] = useState<any>(null);

  // 初始化數據
  useEffect(() => {
    const mockData = generateMockData();
    setItems(mockData);
    setSortedItems(mockData);
  }, []);

  // 處理排序變更
  const handleSortChange = (config: SortConfig, options?: SmartSortingOptions) => {
    setCurrentSort(config);
    if (options) {
      setSortingOptions(options);
    }

    const sorted = smartSortingManager.sortItems(items, config, options || sortingOptions);
    setSortedItems(sorted);

    // 分析排序效果
    const analysis = smartSortingManager.analyzeSortingEffectiveness(items, sorted, config);
    setSortingAnalysis(analysis);
  };

  // 格式化日期
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 格式化文件大小
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // 獲取GEPT等級顯示
  const getGeptLevelDisplay = (level?: string) => {
    const levels = {
      'elementary': '初級',
      'intermediate': '中級',
      'high-intermediate': '中高級'
    };
    return level ? levels[level as keyof typeof levels] || level : '-';
  };

  // 獲取類型圖標
  const getTypeIcon = (type: string) => {
    if (type === 'folder') {
      return (
        <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
        </svg>
      );
    }
    return (
      <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
      </svg>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 頁面標題 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4" data-testid="page-title">
            智能排序系統演示
          </h1>
          <p className="text-lg text-gray-600 mb-6" data-testid="page-description">
            體驗多維度智能排序功能，包含名稱、日期、大小、類型、使用頻率、學習效果等多種排序方式
          </p>

          {/* 上下文設定 */}
          <div className="bg-white rounded-lg p-4 mb-6 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-800 mb-3">學習上下文設定</h3>
            <div className="flex gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">學習情境</label>
                <select
                  value={sortingOptions.contextualFactors?.sessionContext || 'browse'}
                  onChange={(e) => setSortingOptions(prev => ({
                    ...prev,
                    contextualFactors: {
                      ...prev.contextualFactors,
                      sessionContext: e.target.value as any
                    }
                  }))}
                  className="px-3 py-1 border border-gray-300 rounded text-sm"
                  data-testid="session-context-select"
                >
                  <option value="browse">瀏覽</option>
                  <option value="study">學習</option>
                  <option value="review">復習</option>
                  <option value="create">創建</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* 排序控制 */}
        <div className="bg-white rounded-lg p-6 mb-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">排序控制</h2>
            <button
              onClick={() => setShowAnalysis(!showAnalysis)}
              className="px-4 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              data-testid="toggle-analysis"
            >
              {showAnalysis ? '隱藏' : '顯示'}排序分析
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            <SmartSortingPanel
              onSortChange={handleSortChange}
              currentSort={currentSort}
              showAdvanced={true}
              contextualHints={{
                sessionContext: sortingOptions.contextualFactors?.sessionContext,
                userGoals: ['提高英語水平', '準備GEPT考試']
              }}
            />
            
            <div className="text-sm text-gray-600">
              共 {sortedItems.length} 個項目
            </div>
          </div>

          {/* 排序分析 */}
          {showAnalysis && sortingAnalysis && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg" data-testid="sorting-analysis">
              <h3 className="text-sm font-medium text-gray-800 mb-2">排序效果分析</h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">相關性分數:</span>
                  <span className="ml-2 font-medium">{sortingAnalysis.relevanceScore.toFixed(1)}/100</span>
                </div>
                <div>
                  <span className="text-gray-600">多樣性分數:</span>
                  <span className="ml-2 font-medium">{sortingAnalysis.diversityScore.toFixed(1)}/100</span>
                </div>
                <div>
                  <span className="text-gray-600">預測滿意度:</span>
                  <span className="ml-2 font-medium">{sortingAnalysis.userSatisfactionPrediction.toFixed(1)}/100</span>
                </div>
              </div>
              {sortingAnalysis.recommendations.length > 0 && (
                <div className="mt-2">
                  <span className="text-gray-600 text-sm">建議:</span>
                  <ul className="mt-1 text-sm text-gray-700">
                    {sortingAnalysis.recommendations.map((rec: string, index: number) => (
                      <li key={index} className="ml-4">• {rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 項目列表 */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">項目列表</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full" data-testid="items-table">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    項目
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    類型
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    GEPT等級
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    大小
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    使用次數
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    學習分數
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    最後修改
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedItems.map((item, index) => (
                  <tr 
                    key={item.id} 
                    className="hover:bg-gray-50 transition-colors"
                    data-testid={`item-row-${index}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getTypeIcon(item.type)}
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{item.name}</div>
                          <div className="text-sm text-gray-500">ID: {item.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        item.type === 'folder' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {item.type === 'folder' ? '檔案夾' : '活動'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getGeptLevelDisplay(item.geptLevel)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatSize(item.size)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>總計: {item.accessCount}</div>
                      <div className="text-xs text-gray-500">最近: {item.recentAccessCount}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.learningScore !== undefined ? (
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${item.learningScore}%` }}
                            />
                          </div>
                          <span>{item.learningScore}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(item.updatedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 技術特色 */}
        <div className="mt-8 bg-white rounded-lg p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4" data-testid="technical-features">
            智能排序技術特色
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h3 className="font-medium text-gray-800">多維度排序</h3>
              <p className="text-sm text-gray-600">
                支援名稱、日期、大小、類型、使用頻率、學習效果等16種排序維度
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-gray-800">AI智能推薦</h3>
              <p className="text-sm text-gray-600">
                基於用戶行為和學習上下文的智能排序建議
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-gray-800">多級排序</h3>
              <p className="text-sm text-gray-600">
                支援主要、次要、第三級排序的複合排序邏輯
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-gray-800">記憶科學整合</h3>
              <p className="text-sm text-gray-600">
                整合學習效果、記憶保持率、難度等級等記憶科學指標
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-gray-800">自定義預設</h3>
              <p className="text-sm text-gray-600">
                支援創建、保存、分享自定義排序預設
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-gray-800">效果分析</h3>
              <p className="text-sm text-gray-600">
                實時分析排序效果並提供優化建議
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
