/**
 * 多視圖模式活動管理測試頁面
 * 展示網格、列表、時間軸、看板四種視圖模式，支持用戶自定義佈局和視圖切換
 */

'use client';

import React, { useState, useEffect } from 'react';
import { MyActivities } from '@/components/user/MyActivities';

export default function MultiViewActivitiesPage() {
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
              <h1 className="text-3xl font-bold text-gray-900">多視圖模式活動管理系統</h1>
              <p className="mt-2 text-gray-600">
                網格、列表、時間軸、看板四種視圖模式，支持用戶自定義佈局和視圖切換
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  <span>多視圖模式已啟用</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 功能特性展示 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <div className="text-2xl mr-3">⊞</div>
              <div>
                <div className="text-sm font-medium text-gray-900">網格視圖</div>
                <div className="text-xs text-gray-500">卡片式展示</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <div className="text-2xl mr-3">☰</div>
              <div>
                <div className="text-sm font-medium text-gray-900">列表視圖</div>
                <div className="text-xs text-gray-500">詳細信息展示</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <div className="text-2xl mr-3">📅</div>
              <div>
                <div className="text-sm font-medium text-gray-900">時間軸視圖</div>
                <div className="text-xs text-gray-500">按時間排序</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <div className="text-2xl mr-3">📋</div>
              <div>
                <div className="text-sm font-medium text-gray-900">看板視圖</div>
                <div className="text-xs text-gray-500">分類展示</div>
              </div>
            </div>
          </div>
        </div>

        {/* 視圖模式特性 */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">視圖模式特性</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2 text-gray-800">網格視圖 (Grid)</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 卡片式佈局，視覺效果佳</li>
                <li>• 支持2-5列自定義佈局</li>
                <li>• 適合瀏覽和快速識別</li>
                <li>• 虛擬化渲染支持大量數據</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2 text-gray-800">列表視圖 (List)</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 詳細信息展示</li>
                <li>• 高密度數據顯示</li>
                <li>• 適合數據分析和比較</li>
                <li>• 支持快速滾動和搜索</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2 text-gray-800">時間軸視圖 (Timeline)</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 按時間順序組織</li>
                <li>• 支持按日/週/月分組</li>
                <li>• 適合追蹤活動歷史</li>
                <li>• 時間線視覺化展示</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2 text-gray-800">看板視圖 (Kanban)</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 按狀態分類展示</li>
                <li>• 支持拖拽操作</li>
                <li>• 適合項目管理</li>
                <li>• 自定義列配置</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 自定義佈局功能 */}
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-3">自定義佈局功能</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <h3 className="font-medium mb-2">網格視圖自定義：</h3>
              <ul className="space-y-1">
                <li>• 調整列數 (2-5列)</li>
                <li>• 自適應響應式佈局</li>
                <li>• 卡片大小自動調整</li>
                <li>• 間距和邊距控制</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">時間軸視圖自定義：</h3>
              <ul className="space-y-1">
                <li>• 按日/週/月分組</li>
                <li>• 時間範圍篩選</li>
                <li>• 排序方向控制</li>
                <li>• 分組標題格式化</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 使用說明 */}
        <div className="bg-green-50 rounded-lg border border-green-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-green-900 mb-3">使用說明</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-800">
            <div>
              <h3 className="font-medium mb-2">視圖切換：</h3>
              <ul className="space-y-1">
                <li>• 點擊視圖模式按鈕切換</li>
                <li>• 支持鍵盤快捷鍵</li>
                <li>• 記住用戶偏好設置</li>
                <li>• 平滑過渡動畫</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">佈局控制：</h3>
              <ul className="space-y-1">
                <li>• 實時預覽佈局變化</li>
                <li>• 保存自定義設置</li>
                <li>• 重置為默認佈局</li>
                <li>• 響應式自適應</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 多視圖活動管理系統 */}
        <div className="bg-white rounded-lg shadow-sm border">
          <MyActivities
            userId="demo-user"
            initialView="grid"
            showWelcome={false}
            enableVirtualization={true}
            maxActivities={1000}
          />
        </div>

        {/* 技術實現說明 */}
        <div className="mt-6 bg-gray-50 rounded-lg border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">技術實現</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
            <div>
              <h3 className="font-medium mb-2">多視圖架構：</h3>
              <ul className="space-y-1">
                <li>• 統一的數據接口</li>
                <li>• 模塊化視圖組件</li>
                <li>• 狀態管理優化</li>
                <li>• 性能監控和優化</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">用戶體驗：</h3>
              <ul className="space-y-1">
                <li>• 無縫視圖切換</li>
                <li>• 保持選擇狀態</li>
                <li>• 響應式設計</li>
                <li>• 無障礙支持</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
