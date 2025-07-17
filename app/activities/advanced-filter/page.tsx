/**
 * 高級過濾器系統測試頁面
 * 展示GEPT等級、模板類型、標籤、日期範圍、學習狀態的多維度過濾功能
 */

'use client';

import React, { useState, useEffect } from 'react';
import { MyActivities } from '@/components/user/MyActivities';

export default function AdvancedFilterPage() {
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
              <h1 className="text-3xl font-bold text-gray-900">高級過濾器系統</h1>
              <p className="mt-2 text-gray-600">
                GEPT等級、模板類型、標籤、日期範圍、學習狀態的多維度過濾功能
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span>高級過濾器已啟用</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 過濾器功能展示 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <div className="text-2xl mr-3">🎯</div>
              <div>
                <div className="text-sm font-medium text-gray-900">GEPT 等級過濾</div>
                <div className="text-xs text-gray-500">初級、中級、中高級</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <div className="text-2xl mr-3">📝</div>
              <div>
                <div className="text-sm font-medium text-gray-900">模板類型過濾</div>
                <div className="text-xs text-gray-500">配對、測驗、閃卡等</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <div className="text-2xl mr-3">🏷️</div>
              <div>
                <div className="text-sm font-medium text-gray-900">標籤過濾</div>
                <div className="text-xs text-gray-500">自定義標籤分類</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <div className="text-2xl mr-3">📅</div>
              <div>
                <div className="text-sm font-medium text-gray-900">日期範圍過濾</div>
                <div className="text-xs text-gray-500">創建時間、更新時間範圍</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <div className="text-2xl mr-3">📊</div>
              <div>
                <div className="text-sm font-medium text-gray-900">學習狀態過濾</div>
                <div className="text-xs text-gray-500">未開始、進行中、已完成、已精通</div>
              </div>
            </div>
          </div>
        </div>

        {/* 過濾器特性說明 */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">過濾器特性</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2 text-gray-800">多維度過濾：</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• GEPT 等級分級過濾</li>
                <li>• 模板類型分類過濾</li>
                <li>• 自定義標籤過濾</li>
                <li>• 日期範圍精確過濾</li>
                <li>• 學習狀態智能過濾</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2 text-gray-800">高級功能：</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 多條件組合過濾</li>
                <li>• 實時過濾結果更新</li>
                <li>• 過濾器狀態保存</li>
                <li>• 一鍵清除所有過濾器</li>
                <li>• 過濾結果統計顯示</li>
              </ul>
            </div>
          </div>
        </div>

        {/* GEPT 分級說明 */}
        <div className="bg-green-50 rounded-lg border border-green-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-green-900 mb-3">GEPT 分級系統</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-green-800">
            <div>
              <h3 className="font-medium mb-2">初級 (Elementary)：</h3>
              <ul className="space-y-1">
                <li>• 基礎詞彙 1000-2000 字</li>
                <li>• 日常生活對話</li>
                <li>• 簡單句型結構</li>
                <li>• 基本語法概念</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">中級 (Intermediate)：</h3>
              <ul className="space-y-1">
                <li>• 進階詞彙 3000-4000 字</li>
                <li>• 工作場合對話</li>
                <li>• 複合句型運用</li>
                <li>• 時態變化掌握</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">中高級 (High-Intermediate)：</h3>
              <ul className="space-y-1">
                <li>• 高階詞彙 5000+ 字</li>
                <li>• 學術專業對話</li>
                <li>• 複雜句型結構</li>
                <li>• 語言細節掌握</li>
              </ul>
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
                <li>• 點擊「高級過濾器」展開面板</li>
                <li>• 選擇需要的過濾條件</li>
                <li>• 實時查看過濾結果</li>
                <li>• 使用「清除全部」重置過濾器</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">進階技巧：</h3>
              <ul className="space-y-1">
                <li>• 組合多個過濾條件</li>
                <li>• 使用日期範圍精確篩選</li>
                <li>• 按學習狀態追蹤進度</li>
                <li>• 利用標籤快速分類</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 高級過濾器活動管理系統 */}
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
              <h3 className="font-medium mb-2">過濾器架構：</h3>
              <ul className="space-y-1">
                <li>• 多維度過濾邏輯</li>
                <li>• 實時結果更新</li>
                <li>• 狀態管理優化</li>
                <li>• 性能監控和優化</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">用戶體驗：</h3>
              <ul className="space-y-1">
                <li>• 直觀的過濾器界面</li>
                <li>• 即時反饋和統計</li>
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
