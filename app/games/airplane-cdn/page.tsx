/**
 * 飛機碰撞遊戲頁面 (CDN 版本) - 使用 CDN 載入 Vite 遊戲
 * 展示 iframe + CDN external 架構的完整實現
 */

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CDNGameLoader from '@/components/games/CDNGameLoader';

export default function AirplaneCDNGamePage() {
  const router = useRouter();
  const [gameStats, setGameStats] = useState({
    score: 0,
    health: 100,
    wordsLearned: 0,
    accuracy: 0
  });
  const [gameState, setGameState] = useState<'loading' | 'playing' | 'paused' | 'completed'>('loading');
  const [performanceMetrics, setPerformanceMetrics] = useState<any>(null);
  const [geptLevel, setGeptLevel] = useState('elementary');
  const [language, setLanguage] = useState('zh-TW');

  /**
   * 處理遊戲準備就緒
   */
  const handleGameReady = useCallback(() => {
    console.log('🎮 CDN 飛機遊戲準備就緒');
    setGameState('playing');
  }, []);

  /**
   * 處理分數更新
   */
  const handleScoreUpdate = useCallback((score: number, health: number) => {
    setGameStats(prev => ({
      ...prev,
      score,
      health,
      accuracy: prev.wordsLearned > 0 ? Math.round((score / prev.wordsLearned) * 100) : 0
    }));
  }, []);

  /**
   * 處理遊戲狀態變化
   */
  const handleGameStateChange = useCallback((state: string) => {
    console.log('🎮 CDN 遊戲狀態變化:', state);
    setGameState(state as any);
    
    if (state === 'playing') {
      setGameStats(prev => ({ ...prev, wordsLearned: prev.wordsLearned + 1 }));
    }
  }, []);

  /**
   * 處理遊戲完成
   */
  const handleGameComplete = useCallback((results: any) => {
    console.log('🏆 CDN 遊戲完成:', results);
    setGameState('completed');
    
    // 更新最終統計
    setGameStats(prev => ({
      ...prev,
      ...results,
      accuracy: results.wordsLearned > 0 ? Math.round((results.score / results.wordsLearned) * 100) : 0
    }));
  }, []);

  /**
   * 處理性能指標
   */
  const handlePerformanceMetrics = useCallback((metrics: any) => {
    console.log('📊 CDN 遊戲性能指標:', metrics);
    setPerformanceMetrics(metrics);
  }, []);

  /**
   * 處理錯誤
   */
  const handleError = useCallback((error: string) => {
    console.error('🚨 CDN 遊戲錯誤:', error);
    // 可以添加錯誤報告邏輯
  }, []);

  /**
   * 重新開始遊戲
   */
  const handleRestart = useCallback(() => {
    setGameStats({
      score: 0,
      health: 100,
      wordsLearned: 0,
      accuracy: 0
    });
    setGameState('loading');
    // 觸發遊戲重新載入
    window.location.reload();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* 頁面標題 */}
        <div className="text-center mb-8">
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4 transition-colors"
          >
            <span className="mr-2">←</span>
            返回主頁
          </button>
          
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🛩️ 飛機碰撞遊戲 (CDN 版本)
          </h1>
          <p className="text-lg text-gray-600">
            記憶科學驅動的英語詞彙學習 - CDN 高速載入
          </p>
          
          {/* CDN 架構標識 */}
          <div className="inline-flex items-center mt-4 px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
            CDN 架構 | Vercel Edge Network
          </div>
        </div>

        {/* 遊戲設置 */}
        <div className="max-w-4xl mx-auto mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">🎮 遊戲設置</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  GEPT 等級
                </label>
                <select
                  value={geptLevel}
                  onChange={(e) => setGeptLevel(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="elementary">Elementary (初級)</option>
                  <option value="intermediate">Intermediate (中級)</option>
                  <option value="advanced">Advanced (中高級)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  語言
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="zh-TW">繁體中文</option>
                  <option value="zh-CN">简体中文</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* 遊戲統計面板 */}
        <div className="max-w-4xl mx-auto mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow-md p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <span className="text-2xl">🏆</span>
                <span className="ml-2 text-sm font-medium text-gray-600">分數</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">{gameStats.score}</div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <span className="text-2xl">❤️</span>
                <span className="ml-2 text-sm font-medium text-gray-600">生命值</span>
              </div>
              <div className="text-2xl font-bold text-red-500">{gameStats.health}%</div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <span className="text-2xl">📚</span>
                <span className="ml-2 text-sm font-medium text-gray-600">學習詞彙</span>
              </div>
              <div className="text-2xl font-bold text-green-600">{gameStats.wordsLearned}</div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <span className="text-2xl">🎯</span>
                <span className="ml-2 text-sm font-medium text-gray-600">準確率</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">{gameStats.accuracy}%</div>
            </div>
          </div>
        </div>

        {/* 遊戲載入器 */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* 遊戲控制欄 */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-600">
                    狀態: <span className="font-medium capitalize">{gameState}</span>
                  </div>
                  {performanceMetrics && (
                    <div className="text-sm text-gray-600">
                      載入時間: <span className="font-medium">{Math.round(performanceMetrics.totalLoadTime)}ms</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleRestart}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    🔄 重新開始
                  </button>
                </div>
              </div>
            </div>

            {/* CDN 遊戲載入器 */}
            <div className="p-6">
              <CDNGameLoader
                gameId="airplane"
                geptLevel={geptLevel}
                language={language}
                onGameReady={handleGameReady}
                onScoreUpdate={handleScoreUpdate}
                onGameStateChange={handleGameStateChange}
                onGameComplete={handleGameComplete}
                onError={handleError}
                onPerformanceMetrics={handlePerformanceMetrics}
              />
            </div>
          </div>
        </div>

        {/* 性能指標 */}
        {performanceMetrics && (
          <div className="max-w-4xl mx-auto mt-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">📊 CDN 性能指標</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">配置載入時間:</span>
                  <span className="ml-2 font-medium">{Math.round(performanceMetrics.configLoadTime)}ms</span>
                </div>
                <div>
                  <span className="text-gray-600">遊戲載入時間:</span>
                  <span className="ml-2 font-medium">{Math.round(performanceMetrics.gameLoadTime)}ms</span>
                </div>
                <div>
                  <span className="text-gray-600">總載入時間:</span>
                  <span className="ml-2 font-medium">{Math.round(performanceMetrics.totalLoadTime)}ms</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 技術說明 */}
        <div className="max-w-4xl mx-auto mt-8">
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-800 mb-4">⚡ CDN 架構優勢</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="font-semibold text-blue-700 mb-2">性能優化</h4>
                <ul className="space-y-1 text-blue-600">
                  <li>• 全球 CDN 邊緣節點分發</li>
                  <li>• 靜態資源緩存優化</li>
                  <li>• 預載入關鍵資源</li>
                  <li>• 版本化文件名</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-blue-700 mb-2">開發優勢</h4>
                <ul className="space-y-1 text-blue-600">
                  <li>• 獨立遊戲部署</li>
                  <li>• 版本控制和回滾</li>
                  <li>• 自動化 CI/CD</li>
                  <li>• 性能監控</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
