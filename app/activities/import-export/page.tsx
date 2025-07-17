/**
 * 活動導入導出功能頁面
 * 支持多種格式的活動導入導出，批量處理，輕鬆遷移和分享學習內容
 * 基於記憶科學原理和 GEPT 分級系統設計
 */

'use client';

import React, { useState, useEffect } from 'react';
import { ActivityImportExportPanel } from '@/components/import-export/ActivityImportExportPanel';

export default function ActivityImportExportPage() {
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
              <h1 className="text-3xl font-bold text-gray-900">活動導入導出功能</h1>
              <p className="mt-2 text-gray-600">
                支持多種格式的活動導入導出，批量處理，輕鬆遷移和分享學習內容
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>導入導出系統已啟用</span>
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
              <div className="text-2xl mr-3">📥</div>
              <div>
                <div className="text-sm font-medium text-gray-900">多格式導入</div>
                <div className="text-xs text-gray-500">JSON、CSV、Wordwall</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <div className="text-2xl mr-3">📤</div>
              <div>
                <div className="text-sm font-medium text-gray-900">多格式導出</div>
                <div className="text-xs text-gray-500">JSON、CSV、ZIP</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <div className="text-2xl mr-3">⚡</div>
              <div>
                <div className="text-sm font-medium text-gray-900">批量處理</div>
                <div className="text-xs text-gray-500">高效率處理</div>
              </div>
            </div>
          </div>
        </div>

        {/* 功能特性 */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">活動導入導出功能特性</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2 text-gray-800">導入功能：</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 支持 JSON 格式活動導入</li>
                <li>• 支持 CSV 格式批量導入</li>
                <li>• 支持 Wordwall 格式導入</li>
                <li>• 智能格式檢測和轉換</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2 text-gray-800">導出功能：</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 支持 JSON 格式導出</li>
                <li>• 支持 CSV 格式導出</li>
                <li>• 支持 ZIP 壓縮包導出</li>
                <li>• 自定義導出選項</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2 text-gray-800">批量處理：</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 多文件同時處理</li>
                <li>• 進度追蹤和狀態顯示</li>
                <li>• 錯誤處理和重試機制</li>
                <li>• 處理結果詳細報告</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2 text-gray-800">GEPT 整合：</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 自動 GEPT 等級檢測</li>
                <li>• 等級標記和分類</li>
                <li>• 跨等級內容轉換</li>
                <li>• 學習路徑保持</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 支持格式展示 */}
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-3">支持的文件格式</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-blue-800">
            <div className="bg-white rounded p-3 text-center">
              <div className="text-2xl mb-2">📄</div>
              <div className="font-medium">JSON</div>
              <div className="text-xs text-blue-600">標準格式</div>
            </div>
            <div className="bg-white rounded p-3 text-center">
              <div className="text-2xl mb-2">📊</div>
              <div className="font-medium">CSV</div>
              <div className="text-xs text-blue-600">表格格式</div>
            </div>
            <div className="bg-white rounded p-3 text-center">
              <div className="text-2xl mb-2">🌐</div>
              <div className="font-medium">Wordwall</div>
              <div className="text-xs text-blue-600">兼容格式</div>
            </div>
            <div className="bg-white rounded p-3 text-center">
              <div className="text-2xl mb-2">🗜️</div>
              <div className="font-medium">ZIP</div>
              <div className="text-xs text-blue-600">壓縮包</div>
            </div>
          </div>
        </div>

        {/* 記憶科學整合說明 */}
        <div className="bg-purple-50 rounded-lg border border-purple-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-purple-900 mb-3">記憶科學整合</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-purple-800">
            <div>
              <h3 className="font-medium mb-2">導入時的記憶科學處理：</h3>
              <ul className="space-y-1">
                <li>• 自動分析內容難度</li>
                <li>• 識別記憶科學元素</li>
                <li>• 優化學習序列</li>
                <li>• 建立記憶關聯</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">導出時的記憶科學保持：</h3>
              <ul className="space-y-1">
                <li>• 保留間隔重複設置</li>
                <li>• 維持學習進度數據</li>
                <li>• 保存記憶關聯信息</li>
                <li>• 導出學習分析報告</li>
              </ul>
            </div>
          </div>
        </div>

        {/* GEPT 分級整合說明 */}
        <div className="bg-green-50 rounded-lg border border-green-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-green-900 mb-3">GEPT 分級整合</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-green-800">
            <div>
              <h3 className="font-medium mb-2">導入時的等級處理：</h3>
              <ul className="space-y-1">
                <li>• 自動檢測內容等級</li>
                <li>• 詞彙難度分析</li>
                <li>• 語法複雜度評估</li>
                <li>• 等級標記分配</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">導出時的等級保持：</h3>
              <ul className="space-y-1">
                <li>• 保留原始等級信息</li>
                <li>• 等級統計報告</li>
                <li>• 跨等級關聯保持</li>
                <li>• 學習路徑導出</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">等級轉換功能：</h3>
              <ul className="space-y-1">
                <li>• 等級間內容轉換</li>
                <li>• 難度調整建議</li>
                <li>• 適配性分析</li>
                <li>• 個人化推薦</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 活動導入導出面板 */}
        <div className="bg-white rounded-lg shadow-sm border">
          <ActivityImportExportPanel
            userId="demo-user"
            supportedImportFormats={['json', 'csv', 'wordwall']}
            supportedExportFormats={['json', 'csv', 'zip']}
            enableBatchProcessing={true}
            enableGeptIntegration={true}
            enableMemoryScience={true}
          />
        </div>

        {/* 技術實現說明 */}
        <div className="mt-6 bg-gray-50 rounded-lg border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">技術實現</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
            <div>
              <h3 className="font-medium mb-2">導入引擎：</h3>
              <ul className="space-y-1">
                <li>• 多格式解析器</li>
                <li>• 數據驗證和清理</li>
                <li>• 錯誤處理和恢復</li>
                <li>• 進度追蹤系統</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">導出引擎：</h3>
              <ul className="space-y-1">
                <li>• 多格式生成器</li>
                <li>• 數據壓縮和優化</li>
                <li>• 自定義導出選項</li>
                <li>• 批量處理支持</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">批量處理：</h3>
              <ul className="space-y-1">
                <li>• 並行處理架構</li>
                <li>• 隊列管理系統</li>
                <li>• 資源使用優化</li>
                <li>• 實時狀態更新</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">性能優化：</h3>
              <ul className="space-y-1">
                <li>• 流式處理支持</li>
                <li>• 內存使用優化</li>
                <li>• 緩存機制</li>
                <li>• 增量處理</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 使用說明 */}
        <div className="mt-6 bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">使用說明</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
            <div>
              <h3 className="font-medium mb-2">導入步驟：</h3>
              <ul className="space-y-1">
                <li>• 選擇導入文件</li>
                <li>• 確認格式和選項</li>
                <li>• 開始導入處理</li>
                <li>• 查看導入結果</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">導出步驟：</h3>
              <ul className="space-y-1">
                <li>• 選擇要導出的活動</li>
                <li>• 選擇導出格式</li>
                <li>• 配置導出選項</li>
                <li>• 下載導出文件</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
