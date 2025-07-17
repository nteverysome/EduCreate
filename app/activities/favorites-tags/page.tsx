/**
 * 收藏和標籤系統頁面
 * 展示自定義標籤、智能分類、收藏管理功能
 * 基於記憶科學原理和 GEPT 分級系統設計
 */

'use client';

import React, { useState, useEffect } from 'react';
import { FavoritesTagsPanel } from '@/components/favorites/FavoritesTagsPanel';

export default function FavoritesTagsPage() {
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
              <h1 className="text-3xl font-bold text-gray-900">收藏和標籤系統</h1>
              <p className="mt-2 text-gray-600">
                自定義標籤、智能分類、收藏管理，基於記憶科學的個人化內容組織系統
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>收藏和標籤系統已啟用</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 功能展示 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <div className="text-2xl mr-3">⭐</div>
              <div>
                <div className="text-sm font-medium text-gray-900">收藏管理</div>
                <div className="text-xs text-gray-500">個人化收藏夾組織</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <div className="text-2xl mr-3">🏷️</div>
              <div>
                <div className="text-sm font-medium text-gray-900">自定義標籤</div>
                <div className="text-xs text-gray-500">創建和管理標籤</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <div className="text-2xl mr-3">🤖</div>
              <div>
                <div className="text-sm font-medium text-gray-900">智能分類</div>
                <div className="text-xs text-gray-500">AI 自動內容分類</div>
              </div>
            </div>
          </div>
        </div>

        {/* 功能特性 */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">收藏和標籤系統功能特性</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2 text-gray-800">收藏管理：</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 一鍵收藏喜歡的活動</li>
                <li>• 收藏夾分類組織</li>
                <li>• 收藏活動快速訪問</li>
                <li>• 收藏統計和分析</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2 text-gray-800">自定義標籤：</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 創建個人化標籤</li>
                <li>• 標籤顏色和圖標自定義</li>
                <li>• 標籤層級結構管理</li>
                <li>• 標籤使用統計分析</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2 text-gray-800">智能分類：</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• AI 自動內容分析</li>
                <li>• 基於 GEPT 等級分類</li>
                <li>• 學習模式智能識別</li>
                <li>• 相似內容自動歸類</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2 text-gray-800">組織管理：</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 多維度內容組織</li>
                <li>• 標籤和收藏聯合搜索</li>
                <li>• 批量標籤操作</li>
                <li>• 智能推薦相關內容</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 記憶科學整合說明 */}
        <div className="bg-purple-50 rounded-lg border border-purple-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-purple-900 mb-3">記憶科學整合</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-purple-800">
            <div>
              <h3 className="font-medium mb-2">認知負荷優化：</h3>
              <ul className="space-y-1">
                <li>• 標籤視覺化減少認知負荷</li>
                <li>• 分類結構符合認知模式</li>
                <li>• 收藏夾層級化組織</li>
                <li>• 智能推薦減少選擇困難</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">記憶關聯強化：</h3>
              <ul className="space-y-1">
                <li>• 標籤建立記憶關聯</li>
                <li>• 收藏強化重要內容記憶</li>
                <li>• 分類促進知識結構化</li>
                <li>• 個人化組織提升記憶效果</li>
              </ul>
            </div>
          </div>
        </div>

        {/* GEPT 分級整合說明 */}
        <div className="bg-green-50 rounded-lg border border-green-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-green-900 mb-3">GEPT 分級整合</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-800">
            <div>
              <h3 className="font-medium mb-2">分級標籤系統：</h3>
              <ul className="space-y-1">
                <li>• 初級 (Elementary) 標籤分類</li>
                <li>• 中級 (Intermediate) 標籤分類</li>
                <li>• 中高級 (High-Intermediate) 標籤分類</li>
                <li>• 自動難度等級標籤</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">學習路徑組織：</h3>
              <ul className="space-y-1">
                <li>• 按 GEPT 等級收藏組織</li>
                <li>• 漸進式學習路徑標籤</li>
                <li>• 跨等級內容關聯</li>
                <li>• 個人化進度追蹤</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 收藏和標籤系統面板 */}
        <div className="bg-white rounded-lg shadow-sm border">
          <FavoritesTagsPanel
            userId="demo-user"
            showFavorites={true}
            showTags={true}
            enableSmartClassification={true}
            enableBatchOperations={true}
          />
        </div>

        {/* 技術實現說明 */}
        <div className="mt-6 bg-gray-50 rounded-lg border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">技術實現</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
            <div>
              <h3 className="font-medium mb-2">數據存儲：</h3>
              <ul className="space-y-1">
                <li>• 收藏數據本地和雲端同步</li>
                <li>• 標籤關係圖數據庫</li>
                <li>• 智能分類模型緩存</li>
                <li>• 用戶偏好學習記錄</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">智能算法：</h3>
              <ul className="space-y-1">
                <li>• 自然語言處理分類</li>
                <li>• 機器學習推薦算法</li>
                <li>• 協同過濾相似度計算</li>
                <li>• 個人化偏好學習</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">用戶界面：</h3>
              <ul className="space-y-1">
                <li>• 拖拽式標籤管理</li>
                <li>• 即時搜索和過濾</li>
                <li>• 響應式設計適配</li>
                <li>• 無障礙設計支持</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">性能優化：</h3>
              <ul className="space-y-1">
                <li>• 標籤數據懶加載</li>
                <li>• 收藏狀態快速更新</li>
                <li>• 智能分類結果緩存</li>
                <li>• 批量操作優化</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 使用說明 */}
        <div className="mt-6 bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">使用說明</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
            <div>
              <h3 className="font-medium mb-2">收藏功能：</h3>
              <ul className="space-y-1">
                <li>• 點擊星號圖標收藏活動</li>
                <li>• 在收藏夾中組織內容</li>
                <li>• 使用收藏快速訪問</li>
                <li>• 查看收藏統計數據</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">標籤管理：</h3>
              <ul className="space-y-1">
                <li>• 創建自定義標籤</li>
                <li>• 為活動添加標籤</li>
                <li>• 使用標籤過濾內容</li>
                <li>• 管理標籤層級結構</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
