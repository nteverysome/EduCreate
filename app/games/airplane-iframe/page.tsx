/**
 * 飛機碰撞遊戲頁面 (iframe 版本) - 使用 iframe 嵌入 Vite 遊戲
 * 整合 GameIframe 組件，提供完整的遊戲體驗
 */

'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import GameIframeSimple from '@/components/games/GameIframeSimple';

export default function AirplaneIframeGamePage() {
  const router = useRouter();
  const [gameStats, setGameStats] = useState({
    score: 0,
    health: 100,
    wordsLearned: 0,
    accuracy: 0
  });
  const [gameState, setGameState] = useState<'loading' | 'playing' | 'paused' | 'completed'>('loading');
  const [gameResults, setGameResults] = useState<any>(null);

  /**
   * 處理遊戲準備就緒
   */
  const handleGameReady = useCallback(() => {
    console.log('🎮 飛機遊戲準備就緒');
    setGameState('playing');
  }, []);

  /**
   * 處理分數更新
   */
  const handleScoreUpdate = useCallback((score: number, health: number) => {
    setGameStats(prev => ({
      ...prev,
      score,
      health
    }));
  }, []);

  /**
   * 處理遊戲狀態變化
   */
  const handleGameStateChange = useCallback((state: string) => {
    console.log('🎮 遊戲狀態變化:', state);
    setGameState(state as any);
  }, []);

  /**
   * 處理遊戲完成
   */
  const handleGameComplete = useCallback((results: any) => {
    console.log('🏁 遊戲完成:', results);
    setGameResults(results);
    setGameState('completed');
  }, []);

  /**
   * 處理遊戲錯誤
   */
  const handleGameError = useCallback((error: string) => {
    console.error('❌ 遊戲錯誤:', error);
  }, []);

  /**
   * 返回主頁
   */
  const goBack = useCallback(() => {
    router.push('/');
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* 頁面標題欄 */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* 返回按鈕 */}
            <button
              onClick={goBack}
              className="flex items-center gap-2 text-white hover:text-blue-300 transition-colors"
            >
              <span>← 返回主頁</span>
            </button>

            {/* 遊戲標題 */}
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white mb-1">
                🛩️ 飛機碰撞遊戲 (Vite 版本)
              </h1>
              <p className="text-blue-200 text-sm">
                記憶科學驅動的英語詞彙學習 - iframe 嵌入
              </p>
            </div>

            {/* 遊戲狀態 */}
            <div className="text-right">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                gameState === 'loading' ? 'bg-yellow-500/20 text-yellow-300' :
                gameState === 'playing' ? 'bg-green-500/20 text-green-300' :
                gameState === 'paused' ? 'bg-orange-500/20 text-orange-300' :
                'bg-blue-500/20 text-blue-300'
              }`}>
                {gameState === 'loading' && '載入中...'}
                {gameState === 'playing' && '遊戲中'}
                {gameState === 'paused' && '暫停'}
                {gameState === 'completed' && '已完成'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 遊戲統計面板 */}
      <div className="container mx-auto px-4 py-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {/* 分數 */}
          <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-yellow-400">🏆</span>
              <span className="text-white font-medium">分數</span>
            </div>
            <div className="text-2xl font-bold text-yellow-400">
              {gameStats.score.toLocaleString()}
            </div>
          </div>

          {/* 生命值 */}
          <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-red-400">❤️</span>
              <span className="text-white font-medium">生命值</span>
            </div>
            <div className="text-2xl font-bold text-red-400">
              {gameStats.health}%
            </div>
          </div>

          {/* 學習詞彙 */}
          <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-blue-400">📚</span>
              <span className="text-white font-medium">學習詞彙</span>
            </div>
            <div className="text-2xl font-bold text-blue-400">
              {gameStats.wordsLearned}
            </div>
          </div>

          {/* 準確率 */}
          <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-green-400">🎯</span>
              <span className="text-white font-medium">準確率</span>
            </div>
            <div className="text-2xl font-bold text-green-400">
              {gameStats.accuracy}%
            </div>
          </div>
        </div>

        {/* 遊戲容器 */}
        <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4 border border-white/10">
          <GameIframeSimple
            gameUrl="http://localhost:3001/games/airplane-game/"
            title="飛機碰撞遊戲"
            width="100%"
            height="600px"
            className="rounded-lg overflow-hidden"
            onGameReady={handleGameReady}
            onScoreUpdate={handleScoreUpdate}
            onGameStateChange={handleGameStateChange}
            onGameComplete={handleGameComplete}
            onError={handleGameError}
          />
        </div>

        {/* 遊戲說明 */}
        <div className="mt-6 bg-black/20 backdrop-blur-sm rounded-lg p-6 border border-white/10">
          <h2 className="text-xl font-bold text-white mb-4">🎮 遊戲說明</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-blue-300 mb-2">操作方式</h3>
              <ul className="text-gray-300 space-y-1">
                <li>• 使用 ↑↓←→ 方向鍵控制飛機</li>
                <li>• 或使用 WASD 鍵控制飛機</li>
                <li>• 碰撞目標詞彙雲朵獲得分數</li>
                <li>• 避免碰撞錯誤詞彙雲朵</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-300 mb-2">學習特色</h3>
              <ul className="text-gray-300 space-y-1">
                <li>• 基於記憶科學的詞彙學習</li>
                <li>• GEPT 分級詞彙系統</li>
                <li>• 間隔重複學習算法</li>
                <li>• 個人化學習進度追蹤</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 技術說明 */}
        <div className="mt-6 bg-black/20 backdrop-blur-sm rounded-lg p-6 border border-white/10">
          <h2 className="text-xl font-bold text-white mb-4">⚡ 技術特色</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-purple-300 mb-2">Vite + Phaser 3</h3>
              <ul className="text-gray-300 space-y-1">
                <li>• 極快的熱重載開發體驗</li>
                <li>• WebGL 硬體加速渲染</li>
                <li>• 獨立的遊戲運行環境</li>
                <li>• 完整的 TypeScript 支援</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-orange-300 mb-2">iframe 整合</h3>
              <ul className="text-gray-300 space-y-1">
                <li>• 響應式設計適應不同螢幕</li>
                <li>• 父子頁面即時通信</li>
                <li>• 完善的錯誤處理機制</li>
                <li>• 全螢幕模式支援</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 遊戲完成結果 */}
        {gameResults && (
          <div className="mt-6 bg-black/20 backdrop-blur-sm rounded-lg p-6 border border-white/10">
            <h2 className="text-xl font-bold text-white mb-4">🏆 遊戲結果</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400 mb-1">
                  {gameResults.finalScore || 0}
                </div>
                <div className="text-gray-300">最終分數</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-1">
                  {gameResults.accuracy || 0}%
                </div>
                <div className="text-gray-300">準確率</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-1">
                  {gameResults.wordsLearned?.length || 0}
                </div>
                <div className="text-gray-300">學習詞彙</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
