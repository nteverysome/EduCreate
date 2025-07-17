/**
 * 活動模板和快速創建頁面
 * 展示基於GEPT分級的活動模板，一鍵快速創建25種記憶科學遊戲
 * 基於記憶科學原理和 GEPT 分級系統設計
 */

'use client';

import React, { useState, useEffect } from 'react';
import { ActivityTemplatesPanel } from '@/components/templates/ActivityTemplatesPanel';

export default function ActivityTemplatesPage() {
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
              <h1 className="text-3xl font-bold text-gray-900">活動模板和快速創建</h1>
              <p className="mt-2 text-gray-600">
                基於GEPT分級的活動模板，一鍵快速創建25種記憶科學遊戲，智能內容適配
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>模板系統已啟用</span>
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
              <div className="text-2xl mr-3">🎯</div>
              <div>
                <div className="text-sm font-medium text-gray-900">GEPT分級模板</div>
                <div className="text-xs text-gray-500">三級分級智能適配</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <div className="text-2xl mr-3">⚡</div>
              <div>
                <div className="text-sm font-medium text-gray-900">一鍵快速創建</div>
                <div className="text-xs text-gray-500">25種遊戲模板</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <div className="text-2xl mr-3">🧠</div>
              <div>
                <div className="text-sm font-medium text-gray-900">記憶科學驅動</div>
                <div className="text-xs text-gray-500">智能內容適配</div>
              </div>
            </div>
          </div>
        </div>

        {/* 功能特性 */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">活動模板和快速創建功能特性</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2 text-gray-800">GEPT分級模板：</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 初級 (Elementary) 模板庫</li>
                <li>• 中級 (Intermediate) 模板庫</li>
                <li>• 中高級 (High-Intermediate) 模板庫</li>
                <li>• 智能難度適配系統</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2 text-gray-800">快速創建功能：</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 一鍵創建25種遊戲類型</li>
                <li>• 智能內容填充</li>
                <li>• 模板預覽和編輯</li>
                <li>• 批量創建支持</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2 text-gray-800">記憶科學整合：</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 間隔重複算法模板</li>
                <li>• 主動回憶機制設計</li>
                <li>• 認知負荷優化</li>
                <li>• 多感官學習支持</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2 text-gray-800">智能適配系統：</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 內容難度自動調整</li>
                <li>• 學習進度追蹤</li>
                <li>• 個人化推薦</li>
                <li>• 學習效果分析</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 25種遊戲模板展示 */}
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-3">25種記憶科學遊戲模板</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm text-blue-800">
            <div className="bg-white rounded p-2 text-center">
              <div className="text-lg mb-1">❓</div>
              <div className="font-medium">測驗問答</div>
            </div>
            <div className="bg-white rounded p-2 text-center">
              <div className="text-lg mb-1">🔗</div>
              <div className="font-medium">配對遊戲</div>
            </div>
            <div className="bg-white rounded p-2 text-center">
              <div className="text-lg mb-1">📚</div>
              <div className="font-medium">記憶卡片</div>
            </div>
            <div className="bg-white rounded p-2 text-center">
              <div className="text-lg mb-1">✏️</div>
              <div className="font-medium">填空練習</div>
            </div>
            <div className="bg-white rounded p-2 text-center">
              <div className="text-lg mb-1">🔢</div>
              <div className="font-medium">排序遊戲</div>
            </div>
            <div className="bg-white rounded p-2 text-center">
              <div className="text-lg mb-1">🎯</div>
              <div className="font-medium">射擊遊戲</div>
            </div>
            <div className="bg-white rounded p-2 text-center">
              <div className="text-lg mb-1">🏃</div>
              <div className="font-medium">追逐遊戲</div>
            </div>
            <div className="bg-white rounded p-2 text-center">
              <div className="text-lg mb-1">🧩</div>
              <div className="font-medium">拼圖遊戲</div>
            </div>
            <div className="bg-white rounded p-2 text-center">
              <div className="text-lg mb-1">🎲</div>
              <div className="font-medium">骰子遊戲</div>
            </div>
            <div className="bg-white rounded p-2 text-center">
              <div className="text-lg mb-1">🎪</div>
              <div className="font-medium">嘉年華</div>
            </div>
            <div className="bg-white rounded p-2 text-center">
              <div className="text-lg mb-1">🎮</div>
              <div className="font-medium">街機遊戲</div>
            </div>
            <div className="bg-white rounded p-2 text-center">
              <div className="text-lg mb-1">🏆</div>
              <div className="font-medium">競賽模式</div>
            </div>
            <div className="bg-white rounded p-2 text-center">
              <div className="text-lg mb-1">🎨</div>
              <div className="font-medium">創意繪畫</div>
            </div>
            <div className="bg-white rounded p-2 text-center">
              <div className="text-lg mb-1">🎵</div>
              <div className="font-medium">音樂節拍</div>
            </div>
            <div className="bg-white rounded p-2 text-center">
              <div className="text-lg mb-1">🌟</div>
              <div className="font-medium">星空探索</div>
            </div>
            <div className="bg-white rounded p-2 text-center">
              <div className="text-lg mb-1">🏠</div>
              <div className="font-medium">建造遊戲</div>
            </div>
            <div className="bg-white rounded p-2 text-center">
              <div className="text-lg mb-1">🚗</div>
              <div className="font-medium">賽車遊戲</div>
            </div>
            <div className="bg-white rounded p-2 text-center">
              <div className="text-lg mb-1">🌍</div>
              <div className="font-medium">地圖探險</div>
            </div>
            <div className="bg-white rounded p-2 text-center">
              <div className="text-lg mb-1">⏰</div>
              <div className="font-medium">時間挑戰</div>
            </div>
            <div className="bg-white rounded p-2 text-center">
              <div className="text-lg mb-1">🎭</div>
              <div className="font-medium">角色扮演</div>
            </div>
            <div className="bg-white rounded p-2 text-center">
              <div className="text-lg mb-1">🔍</div>
              <div className="font-medium">尋寶遊戲</div>
            </div>
            <div className="bg-white rounded p-2 text-center">
              <div className="text-lg mb-1">🎪</div>
              <div className="font-medium">馬戲團</div>
            </div>
            <div className="bg-white rounded p-2 text-center">
              <div className="text-lg mb-1">🏰</div>
              <div className="font-medium">城堡冒險</div>
            </div>
            <div className="bg-white rounded p-2 text-center">
              <div className="text-lg mb-1">🌈</div>
              <div className="font-medium">彩虹橋</div>
            </div>
            <div className="bg-white rounded p-2 text-center">
              <div className="text-lg mb-1">🎊</div>
              <div className="font-medium">慶典模式</div>
            </div>
          </div>
        </div>

        {/* GEPT 分級整合說明 */}
        <div className="bg-green-50 rounded-lg border border-green-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-green-900 mb-3">GEPT 分級整合</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-green-800">
            <div>
              <h3 className="font-medium mb-2">初級 (Elementary)：</h3>
              <ul className="space-y-1">
                <li>• 基礎詞彙模板 (1000-2000字)</li>
                <li>• 簡單語法結構</li>
                <li>• 視覺輔助豐富</li>
                <li>• 重複練習機制</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">中級 (Intermediate)：</h3>
              <ul className="space-y-1">
                <li>• 進階詞彙模板 (3000-4000字)</li>
                <li>• 複合句型練習</li>
                <li>• 情境對話模板</li>
                <li>• 邏輯推理訓練</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">中高級 (High-Intermediate)：</h3>
              <ul className="space-y-1">
                <li>• 高級詞彙模板 (5000+字)</li>
                <li>• 複雜語法結構</li>
                <li>• 學術寫作模板</li>
                <li>• 批判思維訓練</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 活動模板和快速創建面板 */}
        <div className="bg-white rounded-lg shadow-sm border">
          <ActivityTemplatesPanel
            userId="demo-user"
            showGeptLevels={true}
            showQuickCreate={true}
            enableBatchCreate={true}
            enablePreview={true}
          />
        </div>

        {/* 技術實現說明 */}
        <div className="mt-6 bg-gray-50 rounded-lg border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">技術實現</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
            <div>
              <h3 className="font-medium mb-2">模板引擎：</h3>
              <ul className="space-y-1">
                <li>• 動態模板生成系統</li>
                <li>• 變量替換和內容填充</li>
                <li>• 模板繼承和擴展</li>
                <li>• 版本控制和回滾</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">GEPT 整合：</h3>
              <ul className="space-y-1">
                <li>• 詞彙難度自動檢測</li>
                <li>• 語法複雜度分析</li>
                <li>• 內容適配算法</li>
                <li>• 學習路徑推薦</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">快速創建：</h3>
              <ul className="space-y-1">
                <li>• 一鍵模板實例化</li>
                <li>• 智能內容建議</li>
                <li>• 批量創建支持</li>
                <li>• 預覽和即時編輯</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">性能優化：</h3>
              <ul className="space-y-1">
                <li>• 模板緩存機制</li>
                <li>• 懶加載和分頁</li>
                <li>• 增量更新</li>
                <li>• 並行處理支持</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 使用說明 */}
        <div className="mt-6 bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">使用說明</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
            <div>
              <h3 className="font-medium mb-2">選擇模板：</h3>
              <ul className="space-y-1">
                <li>• 選擇 GEPT 等級</li>
                <li>• 瀏覽遊戲類型</li>
                <li>• 預覽模板效果</li>
                <li>• 查看適用場景</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">快速創建：</h3>
              <ul className="space-y-1">
                <li>• 點擊一鍵創建</li>
                <li>• 填入學習內容</li>
                <li>• 調整遊戲設置</li>
                <li>• 發布和分享</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
