/**
 * 完整分享系統頁面
 * 三層分享模式、連結管理、權限控制、社交媒體集成、嵌入代碼生成等完整功能
 * 基於記憶科學原理和 GEPT 分級系統設計
 */

'use client';

import React, { useState, useEffect } from 'react';
import { ShareSystemPanel } from '@/components/share-system/ShareSystemPanel';

export default function ShareSystemPage() {
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
              <h1 className="text-3xl font-bold text-gray-900">完整分享系統</h1>
              <p className="mt-2 text-gray-600">
                三層分享模式、連結管理、權限控制、社交媒體集成、嵌入代碼生成等完整功能
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>分享系統已啟用</span>
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
              <div className="text-2xl mr-3">🌐</div>
              <div>
                <div className="text-sm font-medium text-gray-900">三層分享</div>
                <div className="text-xs text-gray-500">公開/班級/私人</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <div className="text-2xl mr-3">🔗</div>
              <div>
                <div className="text-sm font-medium text-gray-900">連結管理</div>
                <div className="text-xs text-gray-500">短連結/自定義</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <div className="text-2xl mr-3">🔒</div>
              <div>
                <div className="text-sm font-medium text-gray-900">權限控制</div>
                <div className="text-xs text-gray-500">查看/編輯/評論</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <div className="text-2xl mr-3">📱</div>
              <div>
                <div className="text-sm font-medium text-gray-900">社交集成</div>
                <div className="text-xs text-gray-500">一鍵分享</div>
              </div>
            </div>
          </div>
        </div>

        {/* 功能特性 */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">完整分享系統功能特性</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2 text-gray-800">三層分享模式：</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 公開分享：任何人都可以訪問</li>
                <li>• 班級分享：僅班級成員可訪問</li>
                <li>• 私人分享：指定用戶可訪問</li>
                <li>• 靈活的權限組合設置</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2 text-gray-800">分享連結生成和管理：</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 短連結自動生成</li>
                <li>• 自定義連結支持</li>
                <li>• 連結過期時間設置</li>
                <li>• 訪問次數限制</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2 text-gray-800">訪問權限控制：</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 查看權限：基本訪問控制</li>
                <li>• 編輯權限：內容修改權限</li>
                <li>• 評論權限：互動討論功能</li>
                <li>• 下載權限：文件下載控制</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2 text-gray-800">分享過期時間設置：</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 靈活的時間控制</li>
                <li>• 自動過期提醒</li>
                <li>• 延期功能支持</li>
                <li>• 永久分享選項</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 分享模式展示 */}
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-3">三層分享模式</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
            <div className="bg-white rounded p-4 text-center">
              <div className="text-3xl mb-2">🌐</div>
              <div className="font-medium">公開分享</div>
              <div className="text-xs text-blue-600 mt-1">任何人都可以訪問</div>
              <div className="text-xs text-gray-500 mt-2">
                • 搜索引擎可索引<br/>
                • 社交媒體分享<br/>
                • 無需登入訪問
              </div>
            </div>
            <div className="bg-white rounded p-4 text-center">
              <div className="text-3xl mb-2">🏫</div>
              <div className="font-medium">班級分享</div>
              <div className="text-xs text-blue-600 mt-1">僅班級成員可訪問</div>
              <div className="text-xs text-gray-500 mt-2">
                • 班級代碼驗證<br/>
                • 成員管理功能<br/>
                • 協作學習支持
              </div>
            </div>
            <div className="bg-white rounded p-4 text-center">
              <div className="text-3xl mb-2">🔒</div>
              <div className="font-medium">私人分享</div>
              <div className="text-xs text-blue-600 mt-1">指定用戶可訪問</div>
              <div className="text-xs text-gray-500 mt-2">
                • 邀請制訪問<br/>
                • 密碼保護選項<br/>
                • 個人化權限
              </div>
            </div>
          </div>
        </div>

        {/* 記憶科學整合說明 */}
        <div className="bg-purple-50 rounded-lg border border-purple-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-purple-900 mb-3">記憶科學整合</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-purple-800">
            <div>
              <h3 className="font-medium mb-2">社交學習促進：</h3>
              <ul className="space-y-1">
                <li>• 分享激勵學習動機</li>
                <li>• 同儕學習效應</li>
                <li>• 協作記憶建構</li>
                <li>• 社群認同感增強</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">記憶鞏固機制：</h3>
              <ul className="space-y-1">
                <li>• 重複接觸強化記憶</li>
                <li>• 多元化學習情境</li>
                <li>• 教學相長效應</li>
                <li>• 長期記憶轉化</li>
              </ul>
            </div>
          </div>
        </div>

        {/* GEPT 分級整合說明 */}
        <div className="bg-green-50 rounded-lg border border-green-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-green-900 mb-3">GEPT 分級整合</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-green-800">
            <div>
              <h3 className="font-medium mb-2">等級適配分享：</h3>
              <ul className="space-y-1">
                <li>• 自動等級檢測</li>
                <li>• 適合度評估</li>
                <li>• 推薦分享對象</li>
                <li>• 學習路徑建議</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">分級權限管理：</h3>
              <ul className="space-y-1">
                <li>• 等級基礎權限</li>
                <li>• 進階功能解鎖</li>
                <li>• 內容訪問控制</li>
                <li>• 學習進度追蹤</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">跨等級協作：</h3>
              <ul className="space-y-1">
                <li>• 等級混合班級</li>
                <li>• 互助學習機制</li>
                <li>• 進階學習者指導</li>
                <li>• 學習成果分享</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 完整分享系統面板 */}
        <div className="bg-white rounded-lg shadow-sm border">
          <ShareSystemPanel
            userId="demo-user"
            enableThreeLayerSharing={true}
            enableLinkManagement={true}
            enablePermissionControl={true}
            enableSocialIntegration={true}
            enableEmbedCode={true}
            enableGeptIntegration={true}
            enableMemoryScience={true}
          />
        </div>

        {/* 技術實現說明 */}
        <div className="mt-6 bg-gray-50 rounded-lg border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">技術實現</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
            <div>
              <h3 className="font-medium mb-2">分享連結生成：</h3>
              <ul className="space-y-1">
                <li>• 高性能連結生成</li>
                <li>• 短連結服務整合</li>
                <li>• 自定義域名支持</li>
                <li>• 連結統計追蹤</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">權限管理系統：</h3>
              <ul className="space-y-1">
                <li>• 角色基礎權限</li>
                <li>• 細粒度控制</li>
                <li>• 動態權限調整</li>
                <li>• 權限繼承機制</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">社交媒體整合：</h3>
              <ul className="space-y-1">
                <li>• 多平台API整合</li>
                <li>• 自動內容優化</li>
                <li>• 分享統計分析</li>
                <li>• 病毒式傳播追蹤</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">安全防護：</h3>
              <ul className="space-y-1">
                <li>• 訪問頻率限制</li>
                <li>• 惡意訪問檢測</li>
                <li>• 內容安全掃描</li>
                <li>• 隱私保護機制</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 使用說明 */}
        <div className="mt-6 bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">使用說明</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
            <div>
              <h3 className="font-medium mb-2">創建分享：</h3>
              <ul className="space-y-1">
                <li>• 選擇分享內容</li>
                <li>• 設置分享模式</li>
                <li>• 配置權限設置</li>
                <li>• 生成分享連結</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">管理分享：</h3>
              <ul className="space-y-1">
                <li>• 查看分享統計</li>
                <li>• 修改權限設置</li>
                <li>• 延長過期時間</li>
                <li>• 撤銷分享權限</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
