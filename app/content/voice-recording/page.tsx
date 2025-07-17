/**
 * 語音錄製頁面 - 簡化版本
 * 修復語法錯誤問題
 */
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import UnifiedNavigation from '@/components/navigation/UnifiedNavigation';

export default function VoiceRecordingPage() {
  const [activeTab, setActiveTab] = useState<'record' | 'edit' | 'batch'>('record');
  const [recordings, setRecordings] = useState<any[]>([]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 導航欄 */}
      <UnifiedNavigation />

      {/* 主要內容 */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8" role="main">
        {/* 頁面標題 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="page-title">
            語音錄製和編輯系統
          </h1>
          <p className="text-gray-600 text-lg">
            專業的語音錄製、編輯和處理工具
          </p>
        </div>

        {/* 標籤導航 */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('record')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'record'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                data-testid="record-tab"
              >
                🎤 語音錄製
              </button>
              <button
                onClick={() => setActiveTab('edit')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'edit'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                data-testid="edit-tab"
              >
                ✂️ 音頻編輯
              </button>
              <button
                onClick={() => setActiveTab('batch')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'batch'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                data-testid="batch-tab"
              >
                📦 批量處理
              </button>
            </nav>
          </div>
        </div>

        {/* 主要語音錄製器 */}
        <div className="bg-white rounded-lg shadow-sm p-8" data-testid="main-voice-recorder">
          <div className="text-center">
            <div className="text-6xl mb-6">🎤</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">語音錄製系統</h2>
            <p className="text-gray-600 mb-8">
              支持高品質語音錄製、實時轉錄、音頻編輯和批量處理
            </p>
            
            {/* 錄音控制 */}
            <div className="flex justify-center space-x-4 mb-8">
              <button className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                ● 開始錄音
              </button>
              <button className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                ⏸️ 暫停
              </button>
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                ⏹️ 停止
              </button>
            </div>

            {/* 功能特性 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="text-left">
                <h3 className="font-semibold text-gray-900 mb-2">🎯 錄音功能</h3>
                <ul className="text-gray-600 space-y-1">
                  <li>• 高品質音頻錄製</li>
                  <li>• 實時語音轉錄</li>
                  <li>• 多格式支持</li>
                  <li>• 噪音消除</li>
                </ul>
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900 mb-2">✂️ 編輯功能</h3>
                <ul className="text-gray-600 space-y-1">
                  <li>• 音頻剪輯和合併</li>
                  <li>• 音量調節</li>
                  <li>• 特效處理</li>
                  <li>• 格式轉換</li>
                </ul>
              </div>
            </div>

            {/* 錄音統計 */}
            <div className="bg-gray-50 rounded-lg p-6" data-testid="recording-stats">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 錄音統計</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600" data-testid="total-recordings">
                    {recordings.length}
                  </div>
                  <div className="text-sm text-gray-600">總錄音數</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">0:00</div>
                  <div className="text-sm text-gray-600">總時長</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">0 MB</div>
                  <div className="text-sm text-gray-600">總大小</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 技術說明 */}
        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🔬 技術特性</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div>
              <strong>音頻格式：</strong>
              <br />WAV, MP3, AAC, FLAC
            </div>
            <div>
              <strong>採樣率：</strong>
              <br />44.1kHz, 48kHz, 96kHz
            </div>
            <div>
              <strong>位深度：</strong>
              <br />16-bit, 24-bit, 32-bit
            </div>
          </div>
        </div>

        {/* 導航按鈕 */}
        <div className="mt-8 flex justify-center space-x-4">
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            ← 返回主頁
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            📊 功能儀表板
          </Link>
        </div>
      </main>
    </div>
  );
}
