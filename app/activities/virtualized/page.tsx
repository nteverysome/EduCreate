/**
 * 虛擬化活動列表測試頁面
 * 展示支持1000+活動的高性能虛擬化列表
 */

'use client';

import React, { useState, useEffect } from 'react';
import { MyActivities } from '@/components/user/MyActivities';

export default function VirtualizedActivitiesPage() {
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
              <h1 className="text-3xl font-bold text-gray-900">虛擬化活動管理系統</h1>
              <p className="mt-2 text-gray-600">
                支持1000+活動的高性能虛擬化列表，載入時間 &lt;500ms，流暢滾動體驗
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>虛擬化渲染已啟用</span>
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
              <div className="text-2xl mr-3">⚡</div>
              <div>
                <div className="text-sm font-medium text-gray-900">高性能渲染</div>
                <div className="text-xs text-gray-500">支持1000+活動</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <div className="text-2xl mr-3">🔄</div>
              <div>
                <div className="text-sm font-medium text-gray-900">無限滾動</div>
                <div className="text-xs text-gray-500">懶加載支持</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <div className="text-2xl mr-3">📱</div>
              <div>
                <div className="text-sm font-medium text-gray-900">多視圖模式</div>
                <div className="text-xs text-gray-500">網格/列表/時間軸</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <div className="text-2xl mr-3">🎯</div>
              <div>
                <div className="text-sm font-medium text-gray-900">智能搜索</div>
                <div className="text-xs text-gray-500">實時過濾</div>
              </div>
            </div>
          </div>
        </div>

        {/* 性能指標 */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">性能指標</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">&lt;500ms</div>
              <div className="text-sm text-gray-600">載入時間</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">1000+</div>
              <div className="text-sm text-gray-600">支持活動數量</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">60fps</div>
              <div className="text-sm text-gray-600">滾動幀率</div>
            </div>
          </div>
        </div>

        {/* 使用說明 */}
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-3">使用說明</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <h3 className="font-medium mb-2">基本操作：</h3>
              <ul className="space-y-1">
                <li>• 點擊活動項目進行選擇</li>
                <li>• Ctrl/Cmd + 點擊進行多選</li>
                <li>• Shift + 點擊進行範圍選擇</li>
                <li>• 使用搜索框進行實時過濾</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">視圖模式：</h3>
              <ul className="space-y-1">
                <li>• ⊞ 網格視圖：卡片式展示</li>
                <li>• ☰ 列表視圖：詳細信息展示</li>
                <li>• 📅 時間軸視圖：按時間排序</li>
                <li>• 📋 看板視圖：分類展示</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 虛擬化活動列表 */}
        <div className="bg-white rounded-lg shadow-sm border">
          <MyActivities
            userId="demo-user"
            initialView="grid"
            showWelcome={false}
            enableVirtualization={true}
            maxActivities={1000}
          />
        </div>

        {/* 技術說明 */}
        <div className="mt-6 bg-gray-50 rounded-lg border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">技術實現</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
            <div>
              <h3 className="font-medium mb-2">虛擬化技術：</h3>
              <ul className="space-y-1">
                <li>• 基於 react-window 實現</li>
                <li>• 只渲染可見區域的項目</li>
                <li>• 動態計算項目高度</li>
                <li>• 支持無限滾動加載</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">性能優化：</h3>
              <ul className="space-y-1">
                <li>• 使用 React.memo 避免不必要渲染</li>
                <li>• useCallback 優化事件處理</li>
                <li>• 批量數據生成和處理</li>
                <li>• 智能預加載和緩存</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
