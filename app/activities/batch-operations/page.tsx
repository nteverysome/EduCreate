/**
 * 批量操作系統測試頁面
 * 展示選擇、移動、複製、刪除、分享、標籤、導出的批量操作功能
 */

'use client';

import React, { useState, useEffect } from 'react';
import { MyActivities } from '@/components/user/MyActivities';

export default function BatchOperationsPage() {
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
              <h1 className="text-3xl font-bold text-gray-900">批量操作系統</h1>
              <p className="mt-2 text-gray-600">
                選擇、移動、複製、刪除、分享、標籤、導出的批量操作功能，支持多選和快捷鍵
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span>批量操作已啟用</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 批量操作功能展示 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <div className="text-2xl mr-3">✅</div>
              <div>
                <div className="text-sm font-medium text-gray-900">多選功能</div>
                <div className="text-xs text-gray-500">支持單選、多選、全選</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <div className="text-2xl mr-3">🔄</div>
              <div>
                <div className="text-sm font-medium text-gray-900">批量操作</div>
                <div className="text-xs text-gray-500">移動、複製、刪除等</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <div className="text-2xl mr-3">⌨️</div>
              <div>
                <div className="text-sm font-medium text-gray-900">快捷鍵</div>
                <div className="text-xs text-gray-500">鍵盤快捷操作</div>
              </div>
            </div>
          </div>
        </div>

        {/* 批量操作功能特性 */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">批量操作功能特性</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2 text-gray-800">選擇功能：</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 單個選擇和多個選擇</li>
                <li>• 全選和反選功能</li>
                <li>• 按條件選擇（已分享、草稿、最近修改等）</li>
                <li>• 最大選擇數量限制</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2 text-gray-800">批量操作：</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 移動到指定文件夾</li>
                <li>• 複製和複製活動</li>
                <li>• 批量刪除和歸檔</li>
                <li>• 批量分享和權限設置</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2 text-gray-800">標籤和導出：</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 批量添加和移除標籤</li>
                <li>• 多格式導出（JSON、CSV、Excel）</li>
                <li>• 批量發布和狀態更新</li>
                <li>• 操作歷史和撤銷功能</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2 text-gray-800">快捷鍵支持：</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Ctrl+A (全選)</li>
                <li>• Ctrl+C (複製)</li>
                <li>• Ctrl+X (移動)</li>
                <li>• Delete (刪除)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 操作流程說明 */}
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-3">操作流程</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <h3 className="font-medium mb-2">基本操作流程：</h3>
              <ol className="space-y-1 list-decimal list-inside">
                <li>選擇一個或多個活動</li>
                <li>批量操作面板自動顯示</li>
                <li>選擇要執行的操作</li>
                <li>確認操作（危險操作需要確認）</li>
                <li>查看操作結果和進度</li>
              </ol>
            </div>
            <div>
              <h3 className="font-medium mb-2">高級功能：</h3>
              <ul className="space-y-1">
                <li>• 使用高級選擇選項快速選擇</li>
                <li>• 查看選擇統計和詳情</li>
                <li>• 使用鍵盤快捷鍵提高效率</li>
                <li>• 查看操作歷史和結果</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 安全和性能說明 */}
        <div className="bg-green-50 rounded-lg border border-green-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-green-900 mb-3">安全和性能</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-800">
            <div>
              <h3 className="font-medium mb-2">安全措施：</h3>
              <ul className="space-y-1">
                <li>• 危險操作需要確認對話框</li>
                <li>• 操作歷史記錄和追蹤</li>
                <li>• 權限檢查和驗證</li>
                <li>• 錯誤處理和回滾機制</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">性能優化：</h3>
              <ul className="space-y-1">
                <li>• 批量操作進度指示</li>
                <li>• 異步處理和並發控制</li>
                <li>• 操作結果緩存</li>
                <li>• 最大選擇數量限制</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 記憶科學整合說明 */}
        <div className="bg-purple-50 rounded-lg border border-purple-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-purple-900 mb-3">記憶科學整合</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-purple-800">
            <div>
              <h3 className="font-medium mb-2">學習效果優化：</h3>
              <ul className="space-y-1">
                <li>• 基於學習效果的批量推薦</li>
                <li>• 智能分組和標籤建議</li>
                <li>• 學習路徑批量調整</li>
                <li>• 認知負荷平衡的操作設計</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">GEPT 分級整合：</h3>
              <ul className="space-y-1">
                <li>• 按 GEPT 等級批量操作</li>
                <li>• 難度一致性檢查</li>
                <li>• 分級標籤自動添加</li>
                <li>• 學習進度批量更新</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 批量操作活動管理系統 */}
        <div className="bg-white rounded-lg shadow-sm border">
          <MyActivities
            userId="demo-user"
            initialView="grid"
            showWelcome={false}
            enableVirtualization={true}
            maxActivities={1000}
          />
        </div>

        {/* 使用說明 */}
        <div className="mt-6 bg-gray-50 rounded-lg border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">使用說明</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
            <div>
              <h3 className="font-medium mb-2">基本操作：</h3>
              <ul className="space-y-1">
                <li>• 點擊活動卡片左上角的複選框進行選擇</li>
                <li>• 選擇後會自動顯示批量操作面板</li>
                <li>• 點擊操作按鈕執行相應的批量操作</li>
                <li>• 危險操作會彈出確認對話框</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">高級功能：</h3>
              <ul className="space-y-1">
                <li>• 使用"顯示高級選項"進行條件選擇</li>
                <li>• 查看選擇統計和 GEPT 等級分布</li>
                <li>• 使用鍵盤快捷鍵提高操作效率</li>
                <li>• 查看操作歷史和結果詳情</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
