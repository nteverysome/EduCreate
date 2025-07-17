/**
 * 活動複製和模板化頁面
 * 智能內容適配，一鍵複製活動，創建個人化模板，跨等級內容轉換
 * 基於記憶科學原理和 GEPT 分級系統設計
 */

'use client';

import React, { useState, useEffect } from 'react';
import { ActivityCopyTemplatePanel } from '@/components/copy-template/ActivityCopyTemplatePanel';

export default function ActivityCopyTemplatePage() {
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
              <h1 className="text-3xl font-bold text-gray-900">活動複製和模板化</h1>
              <p className="mt-2 text-gray-600">
                智能內容適配，一鍵複製活動，創建個人化模板，跨等級內容轉換
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>複製模板系統已啟用</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 功能展示 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <div className="text-2xl mr-3">📋</div>
              <div>
                <div className="text-sm font-medium text-gray-900">一鍵複製</div>
                <div className="text-xs text-gray-500">快速複製</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <div className="text-2xl mr-3">🎯</div>
              <div>
                <div className="text-sm font-medium text-gray-900">智能適配</div>
                <div className="text-xs text-gray-500">內容轉換</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <div className="text-2xl mr-3">📚</div>
              <div>
                <div className="text-sm font-medium text-gray-900">模板創建</div>
                <div className="text-xs text-gray-500">個人化模板</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <div className="text-2xl mr-3">🔄</div>
              <div>
                <div className="text-sm font-medium text-gray-900">跨等級轉換</div>
                <div className="text-xs text-gray-500">GEPT適配</div>
              </div>
            </div>
          </div>
        </div>

        {/* 功能特性 */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">活動複製和模板化功能特性</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2 text-gray-800">一鍵複製功能：</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 完整活動內容複製</li>
                <li>• 保持原始格式和結構</li>
                <li>• 自動生成新的活動ID</li>
                <li>• 複製歷史記錄追蹤</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2 text-gray-800">智能內容適配：</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• AI驅動的內容分析</li>
                <li>• 自動格式轉換</li>
                <li>• 內容兼容性檢查</li>
                <li>• 智能建議和優化</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2 text-gray-800">模板創建功能：</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 從活動創建個人模板</li>
                <li>• 模板分類和標籤</li>
                <li>• 模板分享和協作</li>
                <li>• 模板版本管理</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2 text-gray-800">跨等級轉換：</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• GEPT等級自動檢測</li>
                <li>• 跨等級內容轉換</li>
                <li>• 難度調整建議</li>
                <li>• 學習路徑保持</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 複製類型展示 */}
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-3">複製類型</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-blue-800">
            <div className="bg-white rounded p-3 text-center">
              <div className="text-2xl mb-2">📄</div>
              <div className="font-medium">完整複製</div>
              <div className="text-xs text-blue-600">所有內容</div>
            </div>
            <div className="bg-white rounded p-3 text-center">
              <div className="text-2xl mb-2">🎯</div>
              <div className="font-medium">結構複製</div>
              <div className="text-xs text-blue-600">僅結構</div>
            </div>
            <div className="bg-white rounded p-3 text-center">
              <div className="text-2xl mb-2">🔄</div>
              <div className="font-medium">適配複製</div>
              <div className="text-xs text-blue-600">智能轉換</div>
            </div>
            <div className="bg-white rounded p-3 text-center">
              <div className="text-2xl mb-2">📚</div>
              <div className="font-medium">模板複製</div>
              <div className="text-xs text-blue-600">創建模板</div>
            </div>
          </div>
        </div>

        {/* 記憶科學整合說明 */}
        <div className="bg-purple-50 rounded-lg border border-purple-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-purple-900 mb-3">記憶科學整合</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-purple-800">
            <div>
              <h3 className="font-medium mb-2">複製時的記憶科學保持：</h3>
              <ul className="space-y-1">
                <li>• 保留間隔重複設置</li>
                <li>• 維持記憶關聯結構</li>
                <li>• 保持學習進度邏輯</li>
                <li>• 複製認知負荷設計</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">模板化的記憶優化：</h3>
              <ul className="space-y-1">
                <li>• 記憶科學最佳實踐模板</li>
                <li>• 個人化學習模式保存</li>
                <li>• 適應性學習路徑模板</li>
                <li>• 記憶強化策略模板</li>
              </ul>
            </div>
          </div>
        </div>

        {/* GEPT 分級整合說明 */}
        <div className="bg-green-50 rounded-lg border border-green-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-green-900 mb-3">GEPT 分級整合</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-green-800">
            <div>
              <h3 className="font-medium mb-2">等級檢測和分析：</h3>
              <ul className="space-y-1">
                <li>• 自動檢測原始等級</li>
                <li>• 內容難度分析</li>
                <li>• 詞彙複雜度評估</li>
                <li>• 語法結構分析</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">跨等級轉換：</h3>
              <ul className="space-y-1">
                <li>• 智能等級轉換</li>
                <li>• 內容適配建議</li>
                <li>• 難度調整選項</li>
                <li>• 學習目標對應</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">模板等級管理：</h3>
              <ul className="space-y-1">
                <li>• 等級標記和分類</li>
                <li>• 跨等級模板創建</li>
                <li>• 等級適配性評估</li>
                <li>• 個人化等級推薦</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 活動複製和模板化面板 */}
        <div className="bg-white rounded-lg shadow-sm border">
          <ActivityCopyTemplatePanel
            userId="demo-user"
            enableSmartAdaptation={true}
            enableCrossLevelConversion={true}
            enableTemplateCreation={true}
            enableGeptIntegration={true}
            enableMemoryScience={true}
          />
        </div>

        {/* 技術實現說明 */}
        <div className="mt-6 bg-gray-50 rounded-lg border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">技術實現</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
            <div>
              <h3 className="font-medium mb-2">複製引擎：</h3>
              <ul className="space-y-1">
                <li>• 深度對象複製算法</li>
                <li>• 引用關係重建</li>
                <li>• 數據完整性驗證</li>
                <li>• 複製衝突解決</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">智能適配引擎：</h3>
              <ul className="space-y-1">
                <li>• AI內容分析</li>
                <li>• 格式轉換算法</li>
                <li>• 兼容性檢查</li>
                <li>• 自動優化建議</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">模板管理：</h3>
              <ul className="space-y-1">
                <li>• 模板抽象化</li>
                <li>• 參數化配置</li>
                <li>• 版本控制系統</li>
                <li>• 分享權限管理</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">性能優化：</h3>
              <ul className="space-y-1">
                <li>• 異步處理支持</li>
                <li>• 批量操作優化</li>
                <li>• 緩存機制</li>
                <li>• 資源使用監控</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 使用說明 */}
        <div className="mt-6 bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">使用說明</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
            <div>
              <h3 className="font-medium mb-2">複製活動：</h3>
              <ul className="space-y-1">
                <li>• 選擇要複製的活動</li>
                <li>• 選擇複製類型</li>
                <li>• 配置複製選項</li>
                <li>• 確認並執行複製</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">創建模板：</h3>
              <ul className="space-y-1">
                <li>• 選擇源活動</li>
                <li>• 設置模板參數</li>
                <li>• 配置分享權限</li>
                <li>• 保存和發布模板</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
