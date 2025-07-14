/**
 * 自動保存系統頁面
 * 展示和管理自動保存功能
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import UnifiedNavigation from '@/components/navigation/UnifiedNavigation';

interface AutoSaveSession {
  id: string;
  title: string;
  content: string;
  lastSaved: Date;
  size: number;
  type: 'document' | 'game' | 'activity';
  status: 'saved' | 'saving' | 'error';
}

export default function AutoSavePage() {
  const [sessions, setSessions] = useState<AutoSaveSession[]>([]);
  const [isAutoSaveEnabled, setIsAutoSaveEnabled] = useState(true);
  const [saveInterval, setSaveInterval] = useState(2); // 秒
  const [totalSaved, setTotalSaved] = useState(0);

  // 模擬自動保存會話數據
  useEffect(() => {
    const mockSessions: AutoSaveSession[] = [
      {
        id: 'session_1',
        title: '英語單字配對遊戲',
        content: '基礎英語單字配對遊戲內容...',
        lastSaved: new Date(Date.now() - 30000), // 30秒前
        size: 2048,
        type: 'game',
        status: 'saved'
      },
      {
        id: 'session_2',
        title: '數學練習活動',
        content: '數學基礎練習活動內容...',
        lastSaved: new Date(Date.now() - 120000), // 2分鐘前
        size: 1536,
        type: 'activity',
        status: 'saved'
      },
      {
        id: 'session_3',
        title: '學習筆記文檔',
        content: '今天的學習筆記內容...',
        lastSaved: new Date(Date.now() - 5000), // 5秒前
        size: 3072,
        type: 'document',
        status: 'saving'
      }
    ];
    
    setSessions(mockSessions);
    setTotalSaved(156); // 模擬總保存次數
  }, []);

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 格式化時間
  const formatTime = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    
    if (seconds < 60) {
      return `${seconds} 秒前`;
    } else if (minutes < 60) {
      return `${minutes} 分鐘前`;
    } else {
      return date.toLocaleTimeString();
    }
  };

  // 獲取狀態顏色
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'saved': return 'text-green-600 bg-green-100';
      case 'saving': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // 獲取類型圖標
  const getTypeIcon = (type: string): string => {
    switch (type) {
      case 'document': return '📄';
      case 'game': return '🎮';
      case 'activity': return '📝';
      default: return '📁';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 統一導航系統 */}
      <UnifiedNavigation variant="header" />

      {/* 頁面內容 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 頁面標題 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4" data-testid="autosave-title">
            自動保存系統
          </h1>
          <p className="text-lg text-gray-600" data-testid="autosave-description">
            智能自動保存系統，確保您的工作永不丟失
          </p>
        </div>

        {/* 自動保存設定 */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4" data-testid="autosave-settings-title">
            自動保存設定
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 啟用/停用 */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-800">自動保存</h3>
                <p className="text-sm text-gray-600">啟用自動保存功能</p>
              </div>
              <button
                onClick={() => setIsAutoSaveEnabled(!isAutoSaveEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isAutoSaveEnabled ? 'bg-blue-600' : 'bg-gray-300'
                }`}
                data-testid="autosave-toggle"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isAutoSaveEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* 保存間隔 */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-2">保存間隔</h3>
              <select
                value={saveInterval}
                onChange={(e) => setSaveInterval(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                data-testid="save-interval-select"
              >
                <option value={1}>1 秒</option>
                <option value={2}>2 秒</option>
                <option value={5}>5 秒</option>
                <option value={10}>10 秒</option>
                <option value={30}>30 秒</option>
              </select>
            </div>

            {/* 統計信息 */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2">保存統計</h3>
              <div className="text-2xl font-bold text-blue-600" data-testid="total-saves">
                {totalSaved}
              </div>
              <div className="text-sm text-blue-600">總保存次數</div>
            </div>
          </div>
        </div>

        {/* 自動保存會話列表 */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800" data-testid="sessions-title">
              自動保存會話 ({sessions.length})
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            {sessions.map((session) => (
              <div key={session.id} className="p-6 hover:bg-gray-50 transition-colors" data-testid={`session-${session.id}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="text-2xl">{getTypeIcon(session.type)}</div>
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">{session.title}</h3>
                      <p className="text-gray-600 mt-1 line-clamp-2">{session.content}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span>大小: {formatFileSize(session.size)}</span>
                        <span>最後保存: {formatTime(session.lastSaved)}</span>
                        <span>類型: {session.type}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(session.status)}`}>
                      {session.status === 'saved' && '已保存'}
                      {session.status === 'saving' && '保存中...'}
                      {session.status === 'error' && '錯誤'}
                    </span>
                    
                    <button
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      data-testid={`restore-${session.id}`}
                    >
                      恢復
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 自動保存技術特色 */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4" data-testid="features-title">
            自動保存技術特色
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="font-medium text-gray-800 mb-2">智能保存</h3>
              <p className="text-sm text-gray-600">只在內容變更時保存，避免不必要的操作</p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl mb-3">🔄</div>
              <h3 className="font-medium text-gray-800 mb-2">衝突解決</h3>
              <p className="text-sm text-gray-600">自動處理多設備同步衝突</p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl mb-3">📱</div>
              <h3 className="font-medium text-gray-800 mb-2">離線支援</h3>
              <p className="text-sm text-gray-600">離線時本地保存，連線後自動同步</p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl mb-3">🔐</div>
              <h3 className="font-medium text-gray-800 mb-2">安全加密</h3>
              <p className="text-sm text-gray-600">端到端加密保護您的數據安全</p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="font-medium text-gray-800 mb-2">版本控制</h3>
              <p className="text-sm text-gray-600">自動版本管理，支援歷史回溯</p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl mb-3">🚀</div>
              <h3 className="font-medium text-gray-800 mb-2">高性能</h3>
              <p className="text-sm text-gray-600">優化的保存算法，不影響用戶體驗</p>
            </div>
          </div>
        </div>

        {/* 返回導航 */}
        <div className="mt-8 text-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
            data-testid="back-to-dashboard"
          >
            <svg className="mr-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            返回功能儀表板
          </Link>
        </div>
      </div>
    </div>
  );
}
