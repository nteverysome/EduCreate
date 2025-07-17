/**
 * 活動統計和分析頁面
 * 展示使用頻率、學習效果、時間分布的完整分析功能
 * 基於記憶科學原理和 GEPT 分級系統設計
 */

'use client';

import React, { useState, useEffect } from 'react';
import { ActivityAnalyticsPanel } from '@/components/analytics/ActivityAnalyticsPanel';

export default function ActivityAnalyticsPage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">載入中...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 頁面標題 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">活動統計和分析</h1>
              <p className="mt-2 text-gray-600">
                使用頻率、學習效果、時間分布的完整分析，基於記憶科學的個人化學習洞察
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>分析系統已啟用</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 分析功能展示 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <div className="text-2xl mr-3">📊</div>
              <div>
                <div className="text-sm font-medium text-gray-900">使用頻率統計</div>
                <div className="text-xs text-gray-500">活動使用次數和頻率</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <div className="text-2xl mr-3">🎯</div>
              <div>
                <div className="text-sm font-medium text-gray-900">學習效果分析</div>
                <div className="text-xs text-gray-500">記憶科學評估</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <div className="text-2xl mr-3">⏰</div>
              <div>
                <div className="text-sm font-medium text-gray-900">時間分布分析</div>
                <div className="text-xs text-gray-500">學習時間模式</div>
              </div>
            </div>
          </div>
        </div>

        {/* 分析功能特性 */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">活動統計和分析功能特性</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2 text-gray-800">使用頻率統計：</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 活動使用次數追蹤</li>
                <li>• 使用頻率趨勢分析</li>
                <li>• 熱門活動排行榜</li>
                <li>• 使用時間分布統計</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2 text-gray-800">學習效果分析：</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 記憶保持率評估</li>
                <li>• 學習進度追蹤</li>
                <li>• 認知負荷分析</li>
                <li>• 學習效果預測</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2 text-gray-800">時間分布分析：</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 學習時間模式識別</li>
                <li>• 最佳學習時段分析</li>
                <li>• 學習持續時間統計</li>
                <li>• 學習間隔優化建議</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2 text-gray-800">可視化展示：</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 互動式圖表展示</li>
                <li>• 多維度數據視圖</li>
                <li>• 趨勢分析圖表</li>
                <li>• 個人化儀表板</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 記憶科學整合說明 */}
        <div className="bg-purple-50 rounded-lg border border-purple-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-purple-900 mb-3">記憶科學整合</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-purple-800">
            <div>
              <h3 className="font-medium mb-2">間隔重複優化：</h3>
              <ul className="space-y-1">
                <li>• 基於遺忘曲線的複習提醒</li>
                <li>• 個人化間隔調整</li>
                <li>• 記憶強度評估</li>
                <li>• 最佳複習時機預測</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">GEPT 分級整合：</h3>
              <ul className="space-y-1">
                <li>• 按 GEPT 等級分析學習效果</li>
                <li>• 分級學習進度追蹤</li>
                <li>• 難度適應性分析</li>
                <li>• 分級學習路徑推薦</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 活動統計和分析面板 */}
        <div className="bg-white rounded-lg shadow-sm border">
          <ActivityAnalyticsPanel
            userId="demo-user"
            timeRange="month"
            showDetailedMetrics={true}
            enableRealTimeUpdates={true}
          />
        </div>

        {/* 技術實現說明 */}
        <div className="mt-6 bg-gray-50 rounded-lg border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">技術實現</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
            <div>
              <h3 className="font-medium mb-2">數據收集：</h3>
              <ul className="space-y-1">
                <li>• 實時使用數據追蹤</li>
                <li>• 學習行為模式記錄</li>
                <li>• 性能指標監控</li>
                <li>• 用戶互動分析</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">數據分析：</h3>
              <ul className="space-y-1">
                <li>• 機器學習算法應用</li>
                <li>• 統計分析模型</li>
                <li>• 預測分析引擎</li>
                <li>• 個人化推薦系統</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">可視化技術：</h3>
              <ul className="space-y-1">
                <li>• Chart.js 圖表庫</li>
                <li>• D3.js 自定義視覺化</li>
                <li>• 響應式圖表設計</li>
                <li>• 互動式數據探索</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">性能優化：</h3>
              <ul className="space-y-1">
                <li>• 數據緩存策略</li>
                <li>• 懶加載和分頁</li>
                <li>• 實時數據更新</li>
                <li>• 響應式設計</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 使用說明 */}
        <div className="mt-6 bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">使用說明</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
            <div>
              <h3 className="font-medium mb-2">基本功能：</h3>
              <ul className="space-y-1">
                <li>• 選擇時間範圍查看統計數據</li>
                <li>• 切換不同的分析視圖</li>
                <li>• 查看詳細的學習洞察</li>
                <li>• 導出分析報告</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">高級功能：</h3>
              <ul className="space-y-1">
                <li>• 自定義分析指標</li>
                <li>• 比較不同時期的數據</li>
                <li>• 設置學習目標和提醒</li>
                <li>• 分享學習成果</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
