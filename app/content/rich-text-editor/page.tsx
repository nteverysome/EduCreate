/**
 * 富文本編輯器展示頁面
 * 展示完整的富文本編輯功能，包括格式化、表格、列表等
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import RichTextEditor from '../../../components/content/RichTextEditor';

export default function RichTextEditorPage() {
  const [content, setContent] = useState(`
    <h2>歡迎使用富文本編輯器</h2>
    <p>這是一個功能完整的富文本編輯器，支持：</p>
    <ul>
      <li><strong>格式化文本</strong>：粗體、斜體、底線、刪除線</li>
      <li><em>樣式控制</em>：字體大小、顏色、對齊方式</li>
      <li>列表功能：有序列表和無序列表</li>
      <li>表格插入和編輯</li>
      <li>連結插入</li>
      <li>復原/重做功能</li>
    </ul>
    <p>請嘗試使用工具列的各種功能來編輯這段文本！</p>
  `);

  const [previewMode, setPreviewMode] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 導航欄 */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link 
                href="/" 
                className="text-blue-600 hover:text-blue-800 font-medium"
                data-testid="home-link"
              >
                ← 返回主頁
              </Link>
              <span className="text-gray-300">|</span>
              <Link 
                href="/dashboard" 
                className="text-blue-600 hover:text-blue-800 font-medium"
                data-testid="dashboard-link"
              >
                功能儀表板
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  previewMode 
                    ? 'bg-green-600 text-white hover:bg-green-700' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                data-testid="preview-toggle"
              >
                {previewMode ? '編輯模式' : '預覽模式'}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 主要內容 */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 頁面標題 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="page-title">
            富文本編輯器
          </h1>
          <p className="text-gray-600 text-lg">
            完整的富文本編輯功能，支持格式化、表格、列表和無障礙設計
          </p>
        </div>

        {/* 功能特色 */}
        <div className="mb-8 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">功能特色</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-start space-x-3">
              <div className="text-blue-600 text-xl">✏️</div>
              <div>
                <h3 className="font-medium text-gray-900">格式化文本</h3>
                <p className="text-sm text-gray-600">粗體、斜體、底線、刪除線</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="text-green-600 text-xl">🎨</div>
              <div>
                <h3 className="font-medium text-gray-900">樣式控制</h3>
                <p className="text-sm text-gray-600">字體大小、顏色、對齊方式</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="text-purple-600 text-xl">📋</div>
              <div>
                <h3 className="font-medium text-gray-900">列表功能</h3>
                <p className="text-sm text-gray-600">有序、無序、嵌套列表</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="text-orange-600 text-xl">📊</div>
              <div>
                <h3 className="font-medium text-gray-900">表格支持</h3>
                <p className="text-sm text-gray-600">插入和編輯表格</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="text-red-600 text-xl">🔗</div>
              <div>
                <h3 className="font-medium text-gray-900">連結插入</h3>
                <p className="text-sm text-gray-600">添加和編輯超連結</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="text-indigo-600 text-xl">♿</div>
              <div>
                <h3 className="font-medium text-gray-900">無障礙設計</h3>
                <p className="text-sm text-gray-600">WCAG 2.1 AA 標準</p>
              </div>
            </div>
          </div>
        </div>

        {/* 編輯器區域 */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {previewMode ? '內容預覽' : '內容編輯'}
              </h2>
              
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span data-testid="content-length">
                  字數: {content.replace(/<[^>]*>/g, '').length}
                </span>
                <span data-testid="content-size">
                  大小: {new Blob([content]).size} bytes
                </span>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {previewMode ? (
              /* 預覽模式 */
              <div className="border border-gray-200 rounded-lg p-4 min-h-[400px]">
                <h3 className="text-lg font-medium text-gray-900 mb-4">內容預覽</h3>
                <div 
                  className="rich-content prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: content }}
                  data-testid="content-preview"
                />
              </div>
            ) : (
              /* 編輯模式 */
              <div>
                <RichTextEditor
                  value={content}
                  onChange={setContent}
                  placeholder="開始輸入您的內容..."
                  data-testid="main-rich-editor"
                />
              </div>
            )}
          </div>
        </div>

        {/* 使用說明 */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-blue-900 mb-4">使用說明</h2>
          <div className="space-y-3 text-blue-800">
            <div className="flex items-start space-x-2">
              <span className="font-medium">1.</span>
              <span>使用工具列按鈕進行文本格式化，或使用鍵盤快捷鍵（如 Ctrl+B 粗體）</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="font-medium">2.</span>
              <span>點擊表格按鈕插入表格，輸入行數和列數</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="font-medium">3.</span>
              <span>使用 Tab 鍵增加縮排，Shift+Tab 減少縮排</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="font-medium">4.</span>
              <span>點擊連結按鈕插入超連結</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="font-medium">5.</span>
              <span>使用復原/重做按鈕或 Ctrl+Z / Ctrl+Shift+Z 快捷鍵</span>
            </div>
          </div>
        </div>

        {/* 技術規格 */}
        <div className="mt-8 bg-gray-100 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">技術規格</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">支持的格式</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• HTML 格式化標籤</li>
                <li>• 表格 (table, tr, td, th)</li>
                <li>• 列表 (ul, ol, li)</li>
                <li>• 連結 (a href)</li>
                <li>• 文本樣式 (strong, em, u, s)</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">無障礙特性</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 完整鍵盤導航支持</li>
                <li>• ARIA 標籤和角色</li>
                <li>• 高對比度模式支持</li>
                <li>• 螢幕閱讀器友好</li>
                <li>• 焦點管理</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
