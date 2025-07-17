/**
 * 智能搜索系統測試頁面
 * 展示全文搜索、模糊匹配、語義搜索、語音搜索的完整搜索功能
 */

'use client';

import React, { useState, useEffect } from 'react';
import { MyActivities } from '@/components/user/MyActivities';

export default function IntelligentSearchPage() {
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
              <h1 className="text-3xl font-bold text-gray-900">智能搜索系統</h1>
              <p className="mt-2 text-gray-600">
                全文搜索、模糊匹配、語義搜索、語音搜索的完整搜索功能，支持實時搜索結果更新
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                  <span>智能搜索已啟用</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 搜索功能展示 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
                <div className="text-sm font-medium text-gray-900">模糊匹配</div>
                <div className="text-xs text-gray-500">相似度搜索</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <div className="text-2xl mr-3">🧠</div>
              <div>
                <div className="text-sm font-medium text-gray-900">語義搜索</div>
                <div className="text-xs text-gray-500">智能理解意圖</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <div className="text-2xl mr-3">🎤</div>
              <div>
                <div className="text-sm font-medium text-gray-900">語音搜索</div>
                <div className="text-xs text-gray-500">語音輸入識別</div>
              </div>
            </div>
          </div>
        </div>

        {/* 搜索功能特性 */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">搜索功能特性</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2 text-gray-800">全文搜索 (Full-Text Search)：</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 搜索標題、描述、標籤、內容</li>
                <li>• 支持多關鍵詞組合搜索</li>
                <li>• 智能權重計算和排序</li>
                <li>• 實時搜索結果更新</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2 text-gray-800">模糊匹配 (Fuzzy Matching)：</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 基於 Levenshtein 距離算法</li>
                <li>• 容錯輸入和拼寫錯誤</li>
                <li>• 可調整相似度閾值</li>
                <li>• 支持中英文模糊匹配</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2 text-gray-800">語義搜索 (Semantic Search)：</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 理解搜索意圖和上下文</li>
                <li>• 相關詞彙和概念擴展</li>
                <li>• 教育領域專業語義庫</li>
                <li>• AI 驅動的智能推薦</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2 text-gray-800">語音搜索 (Voice Search)：</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 實時語音識別</li>
                <li>• 支持中英文語音輸入</li>
                <li>• 自動語音轉文字</li>
                <li>• 語音命令和控制</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 搜索算法說明 */}
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-3">搜索算法和技術</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <h3 className="font-medium mb-2">核心算法：</h3>
              <ul className="space-y-1">
                <li>• TF-IDF 詞頻-逆文檔頻率</li>
                <li>• Levenshtein 編輯距離</li>
                <li>• 語義相似度計算</li>
                <li>• 多維度評分融合</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">性能優化：</h3>
              <ul className="space-y-1">
                <li>• 防抖搜索 (300ms 延遲)</li>
                <li>• 結果緩存和記憶化</li>
                <li>• 增量搜索更新</li>
                <li>• 並行搜索處理</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 使用說明 */}
        <div className="bg-green-50 rounded-lg border border-green-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-green-900 mb-3">使用說明</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-800">
            <div>
              <h3 className="font-medium mb-2">基本搜索：</h3>
              <ul className="space-y-1">
                <li>• 輸入關鍵詞進行實時搜索</li>
                <li>• 支持多個關鍵詞組合</li>
                <li>• 使用引號進行精確匹配</li>
                <li>• Ctrl+K 快速聚焦搜索框</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">高級功能：</h3>
              <ul className="space-y-1">
                <li>• 點擊麥克風圖標進行語音搜索</li>
                <li>• 調整模糊匹配閾值</li>
                <li>• 設置最大搜索結果數</li>
                <li>• 查看搜索歷史記錄</li>
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
                <li>• 基於學習效果的搜索排序</li>
                <li>• 個人化學習路徑推薦</li>
                <li>• 遺忘曲線考量的內容推薦</li>
                <li>• 認知負荷平衡的結果展示</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">GEPT 分級整合：</h3>
              <ul className="space-y-1">
                <li>• 按 GEPT 等級過濾搜索結果</li>
                <li>• 難度適應性搜索建議</li>
                <li>• 學習進度相關的內容推薦</li>
                <li>• 個人化難度調整</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 智能搜索活動管理系統 */}
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
              <h3 className="font-medium mb-2">前端技術：</h3>
              <ul className="space-y-1">
                <li>• React 18 + TypeScript</li>
                <li>• 實時搜索和防抖處理</li>
                <li>• Web Speech API 語音識別</li>
                <li>• 本地搜索索引和緩存</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">搜索引擎：</h3>
              <ul className="space-y-1">
                <li>• 多算法融合搜索</li>
                <li>• 動態權重調整</li>
                <li>• 結果相關性排序</li>
                <li>• 搜索性能監控</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
